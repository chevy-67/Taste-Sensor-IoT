const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')

const app = express()

dotenv.config()

const MONGO_URI = process.env.MONGO_URI
const PORT = process.env.PORT

app.use(cors())
app.use(express.json())

const sensorSchema = new mongoose.Schema(
  {
    mq8_voltage: Number,
    mq_other_voltage: Number,
    color_r: Number,
    color_g: Number,
    color_b: Number,
    dominant_color: String,
    temperature: Number,
    humidity: Number,
    timestamp: { type: Date, default: Date.now },
  },
  { collection: "sensorData" }
);

const Sensor = mongoose.model("Sensor", sensorSchema);

app.post("/api/sensor", async (req, res) => {
  try {
    const {
      mq8_voltage,
      mq_other_voltage,
      color_r,
      color_g,
      color_b,
      dominant_color,
      temperature,
      humidity,
      timestamp,
    } = req.body;

    const newData = new Sensor({
      mq8_voltage,
      mq_other_voltage,
      color_r,
      color_g,
      color_b,
      dominant_color,
      temperature,
      humidity,
      timestamp,
    });

    await newData.save();
    res.status(201).json({ message: "Success" });
  } catch (err) {
    res.status(500).json({ message: err.message || err });
  }
});


app.get('/api/sensor', async (req, res) => {
    const data = await Sensor.find().sort({ timestamp: -1 }).limit(10);
    res.json(data);
});

app.get("/api/sensor/last24h", async (req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const data = await Sensor.find({ timestamp: { $gte: since } }).sort({
      timestamp: 1,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT,()=>{console.log("Server Listening...")})