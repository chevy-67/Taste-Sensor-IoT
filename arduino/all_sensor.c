#include "DHT.h"
#include <WiFi.h>
#include <HTTPClient.h>

// ------------------- WiFi & Server -------------------
const char* ssid = "shiv";       // your WiFi SSID
const char* password = "12345678910";    // your WiFi password
const char* serverUrl = "https://taste-sensor-iot-data.onrender.com/api/sensor";

// ------------------- DHT -------------------
#define DHTPIN 18
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// ------------------- Color Sensor (TCS3200) -------------------
const int COLOR_S0 = 16;
const int COLOR_S1 = 17;
const int COLOR_S2 = 4;
const int COLOR_S3 = 5;
const int COLOR_OUT = 27;   // pulse output from TCS3200

// ------------------- MQ Sensors -------------------
const int MQ8_A_PIN = 33;   // MQ-8 analog
const int MQ8_D_PIN = 26;   // MQ-8 digital threshold
const int MQ_GAS_A_PIN = 32; // optional second MQ analog

// ------------------- ADC Reference -------------------
const float ADC_REF_V = 3.3;
const float ADC_MAX_COUNTS = 4095.0;

// ------------------- Helper Function: Read color pulse -------------------
unsigned long readColorPulse(int s2State, int s3State, int timeout_us = 200000) {
  digitalWrite(COLOR_S2, s2State);
  digitalWrite(COLOR_S3, s3State);
  delayMicroseconds(200);
  unsigned long dur = pulseIn(COLOR_OUT, LOW, timeout_us);
  if (dur == 0) dur = timeout_us;
  return dur;
}

// ------------------- Setup -------------------
void setup() {
  Serial.begin(115200);
  delay(800);
  Serial.println("ESP32 Multi-sensor starting...");

  // Color sensor setup
  pinMode(COLOR_S0, OUTPUT);
  pinMode(COLOR_S1, OUTPUT);
  pinMode(COLOR_S2, OUTPUT);
  pinMode(COLOR_S3, OUTPUT);
  pinMode(COLOR_OUT, INPUT);
  digitalWrite(COLOR_S0, HIGH); // 20% scaling
  digitalWrite(COLOR_S1, LOW);

  // MQ sensor setup
  pinMode(MQ8_D_PIN, INPUT);

  // DHT setup
  dht.begin();

  // WiFi setup
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" Connected!");
}

// ------------------- Loop -------------------
void loop() {
  // --- MQ8 Sensor ---
  int mq8Raw = analogRead(MQ8_A_PIN);
  float mq8Vol = (mq8Raw * ADC_REF_V) / ADC_MAX_COUNTS;
  int mq8Digital = digitalRead(MQ8_D_PIN);

  // --- Second MQ Sensor ---
  int mqRaw2 = analogRead(MQ_GAS_A_PIN);
  float mqVol2 = (mqRaw2 * ADC_REF_V) / ADC_MAX_COUNTS;

  // --- Color Sensor ---
  unsigned long durR = readColorPulse(LOW, LOW);
  delay(5);
  unsigned long durB = readColorPulse(LOW, HIGH);
  delay(5);
  unsigned long durG = readColorPulse(HIGH, HIGH);
  delay(5);

  String dominant = "Unknown";
  if (durR < durG && durR < durB) dominant = "Red - Astringent/Glucose";
  else if (durG < durR && durG < durB) dominant = "Green - Mild Astringent";
  else if (durB < durR && durB < durG) dominant = "Blue - No Astringent";

  // --- DHT Sensor ---
  float tC = dht.readTemperature();
  float h = dht.readHumidity();

  if (isnan(tC) || isnan(h)) {
    Serial.println("DHT11 read failed.");
  }

  // --- Print locally ---
  Serial.println("---- Sensor Readings ----");
  Serial.printf("MQ8 raw=%d, V=%.3fV, D0=%d\n", mq8Raw, mq8Vol, mq8Digital);
  Serial.printf("MQ_other raw=%d, V=%.3fV\n", mqRaw2, mqVol2);
  Serial.printf("Color pulses R:%lu G:%lu B:%lu => %s\n", durR, durG, durB, dominant.c_str());
  Serial.printf("Temp: %.1f °C, Humidity: %.1f %%\n", tC, h);

  // --- Send to Backend ---
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String jsonData = "{";
    jsonData += "\"mq8_voltage\": " + String(mq8Vol, 3) + ",";
    jsonData += "\"mq_other_voltage\": " + String(mqVol2, 3) + ",";
    jsonData += "\"color_r\": " + String(durR) + ",";
    jsonData += "\"color_g\": " + String(durG) + ",";
    jsonData += "\"color_b\": " + String(durB) + ",";
    jsonData += "\"dominant_color\": \"" + dominant + "\",";
    jsonData += "\"temperature\": " + String(tC, 1) + ",";
    jsonData += "\"humidity\": " + String(h, 1);
    jsonData += "}";

    int httpResponseCode = http.POST(jsonData);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Server Response: " + response);
    } else {
      Serial.println("Error sending POST: " + String(httpResponseCode));
    }

    http.end();
  }

  Serial.println("--------------------------\n");
  delay(5000); // 5s delay
}
