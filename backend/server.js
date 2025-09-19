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

mongoose.connect(MONGO_URI)
.then(()=>{console.log("MongoDB Connected...")})
.catch((err)=>{console.log(err)})

const sensorSchema = new mongoose.Schema({
    temperature : Number,
    timestamp : {type:Date,default:Date.now}},
    { collection: "sensorData" }
)

const Sensor = new mongoose.model("Sensor",sensorSchema)

app.post("/api/sensor", async (req,res)=>{
    try{
        const {temperature,timestamp} = req.body
        const newData = new Sensor({temperature,timestamp})
        await newData.save()
        res.status(201).json({"message":"Success"})
    }
    catch(err){
        res.status(500).json({"message":err})
    }
})

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