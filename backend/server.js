const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai'); // CommonJS import

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

// Ensure API key is set
if (!OPENAI_KEY) {
  console.error("❌ ERROR: OPENAI_API_KEY is not set in environment variables");
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Sensor schema & model
const sensorSchema = new mongoose.Schema({
  mq8_voltage: Number,
  mq_other_voltage: Number,
  color_r: Number,
  color_g: Number,
  color_b: Number,
  dominant_color: String,
  temperature: Number,
  humidity: Number,
  timestamp: { type: Date, default: Date.now },
}, { collection: "sensorData" });

const Sensor = mongoose.model("Sensor", sensorSchema);

// Save new sensor data
app.post("/api/sensor", async (req, res) => {
  try {
    const newData = new Sensor(req.body);
    await newData.save();
    res.status(201).json({ message: "Success" });
  } catch (err) {
    res.status(500).json({ message: err.message || err });
  }
});

// Get latest 10 sensor readings
app.get("/api/sensor", async (req, res) => {
  try {
    const data = await Sensor.find().sort({ timestamp: -1 }).limit(10);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get sensor readings for last 24 hours
app.get("/api/sensor/last24h", async (req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const data = await Sensor.find({ timestamp: { $gte: since } }).sort({ timestamp: 1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// OpenAI client
const openai = new OpenAI({ apiKey: OPENAI_KEY });

// Taste prediction endpoint
app.post("/api/predict-taste", async (req, res) => {
  const { readings } = req.body;
  if (!readings) return res.status(400).json({ error: "Sensor readings are required" });

  try {
    const prompt = `
      You are a taste prediction AI. 
      Based on the following sensor readings, predict the taste (sour, bitter, salty):

      Temperature: ${readings.temperature ?? "N/A"} °C
      Humidity: ${readings.humidity ?? "N/A"} %
      MQ-8 Voltage: ${readings.mq8_voltage ?? "N/A"} V
      Other MQ Voltage: ${readings.mq_other_voltage ?? "N/A"} V
      Color R Pulse: ${readings.color_r ?? "N/A"}
      Color G Pulse: ${readings.color_g ?? "N/A"}
      Color B Pulse: ${readings.color_b ?? "N/A"}

      Only return one word: sour, bitter, or salty.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 10,
    });

    const taste = response.choices[0].message.content.trim();
    res.json({ taste });
  } catch (err) {
    console.error("❌ OpenAI request failed:", err);
    res.status(500).json({ error: "Failed to predict taste" });
  }
});

// Start server
app.listen(PORT, () => console.log(`✅ Server listening on port ${PORT}`));
