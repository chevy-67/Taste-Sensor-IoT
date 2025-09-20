#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "..........s";
const char* password = "selva@2005";
const char* serverUrl = "https://taste-sensor-iot-data.onrender.com/api/sensor";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected to WiFi");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    // Example sensor data
    float ph = 6.8;
    float temp = 25.3;

    String jsonData = "{\"ph\": " + String(ph) + ", \"temperature\": " + String(temp) + "}";

    int httpResponseCode = http.POST(jsonData);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Server Response: " + response);
    } else {
      Serial.println("Error sending POST: " + String(httpResponseCode));
    }

    http.end();
  }
  delay(5000); // Send every 5 seconds
}