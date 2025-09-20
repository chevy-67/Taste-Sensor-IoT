import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// Component to send sensor readings to ChatGPT API
const TastePredictor = ({ readings }) => {
  const [taste, setTaste] = useState("");

  const getTaste = async () => {
    try {
      const response = await fetch("https://taste-sensor-iot-data.onrender.com/api/predict-taste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readings }),
      });
      const data = await response.json();
      setTaste(data.taste);
    } catch (err) {
      console.error("Error predicting taste:", err);
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <button onClick={getTaste} style={{ padding: "10px 20px", cursor: "pointer" }}>
        Predict Taste
      </button>
      {taste && <p>Predicted Taste: <strong>{taste}</strong></p>}
    </div>
  );
};

const SensorDashboard = () => {
  const [sensorData, setSensorData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "https://taste-sensor-iot-data.onrender.com/api/sensor"
        );
        const data = await res.json();
        setSensorData(data);
      } catch (err) {
        console.error("Error fetching sensor data:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const generateChartData = (label, data, color) => ({
    labels: sensorData.map((d) =>
      d.timestamp ? new Date(d.timestamp).toLocaleTimeString() : ""
    ),
    datasets: [{ label, data, borderColor: color, fill: false }],
  });

  const options = (yLabel, min, max) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" } },
    scales: {
      x: { title: { display: true, text: "Time" } },
      y: { type: "linear", title: { display: true, text: yLabel }, min, max },
    },
  });

  const charts = [
    { label: "Temperature (°C)", key: "temperature", color: "red", min: 0, max: 100 },
    { label: "Humidity (%)", key: "humidity", color: "blue", min: 0, max: 100 },
    { label: "MQ-8 Voltage (V)", key: "mq8_voltage", color: "green", min: 0, max: 5 },
    { label: "Other MQ Voltage (V)", key: "mq_other_voltage", color: "purple", min: 0, max: 5 },
    { label: "Color R Pulse", key: "color_r", color: "orange", min: 0, max: 1024 },
    { label: "Color G Pulse", key: "color_g", color: "teal", min: 0, max: 1024 },
    { label: "Color B Pulse", key: "color_b", color: "cyan", min: 0, max: 1024 },
  ];

  // Get latest readings for taste prediction
  const latestReadings = sensorData.length > 0 ? sensorData[sensorData.length - 1] : {};

  return (
    <div style={{ width: "95%", margin: "0 auto" }}>
      <h2>Real-Time Sensor Dashboard</h2>

      {/* Horizontal scroll container */}
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "30px",
          paddingBottom: "20px",
        }}
      >
        {charts.map((chart) => (
          <div key={chart.key} style={{ minWidth: "300px", height: "300px" }}>
            <Line
              data={generateChartData(
                chart.label,
                sensorData.map((d) => d[chart.key]),
                chart.color
              )}
              options={options(chart.label, chart.min, chart.max)}
            />
            <p style={{ textAlign: "center", fontWeight: "bold", marginTop: "5px" }}>
              Latest {chart.label}:{" "}
              {latestReadings[chart.key] !== undefined ? latestReadings[chart.key] : "-"}
            </p>
          </div>
        ))}
      </div>

      {/* Taste predictor component */}
      <TastePredictor readings={latestReadings} />
    </div>
  );
};

export default SensorDashboard;
