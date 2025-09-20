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

const SensorChart = () => {
  const [sensorData, setSensorData] = useState([]);

  // Fetch data every 5 seconds
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://taste-sensor-iot-data.onrender.com/api/sensor");
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

  const chartData = {
    labels: sensorData.map((d) =>
      d.timestamp ? new Date(d.timestamp).toLocaleTimeString() : ""
    ),
    datasets: [
      {
        label: "Temperature (°C)",
        data: sensorData.map((d) => d.temperature),
        borderColor: "red",
        fill: false,
      },
      {
        label: "Humidity (%)",
        data: sensorData.map((d) => d.humidity),
        borderColor: "blue",
        fill: false,
      },
      {
        label: "MQ-8 Voltage (V)",
        data: sensorData.map((d) => d.mq8_voltage),
        borderColor: "green",
        fill: false,
      },
      {
        label: "Other MQ Voltage (V)",
        data: sensorData.map((d) => d.mq_other_voltage),
        borderColor: "purple",
        fill: false,
      },
      {
        label: "Color R Pulse",
        data: sensorData.map((d) => d.color_r),
        borderColor: "orange",
        fill: false,
      },
      {
        label: "Color G Pulse",
        data: sensorData.map((d) => d.color_g),
        borderColor: "teal",
        fill: false,
      },
      {
        label: "Color B Pulse",
        data: sensorData.map((d) => d.color_b),
        borderColor: "cyan",
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: "top" } },
    scales: {
      x: { title: { display: true, text: "Time" } },
      y: { title: { display: true, text: "Sensor Values" } },
    },
  };

  return (
    <div style={{ width: "90%", maxWidth: "1000px", margin: "0 auto" }}>
      <h2>Real-Time Sensor Dashboard</h2>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default SensorChart;
