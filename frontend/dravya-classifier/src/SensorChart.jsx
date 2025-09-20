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

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const SensorChart = () => {
  const [sensorData, setSensorData] = useState([]);

  // Fetch data every 5 seconds
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("https://taste-sensor-iot-data.onrender.com/api/sensor")
      const data = await res.json();
      setSensorData(data);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: sensorData.map((d) => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "Temperature (°C)",
        data: sensorData.map((d) => d.temperature),
        borderColor: "red",
        fill: false,
      },
      {
        label: "pH",
        data: sensorData.map((d) => d.ph),
        borderColor: "blue",
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: "top" } },
    scales: {
      x: { title: { display: true, text: "Time" } },
      y: { title: { display: true, text: "Value" } },
    },
  };

  return (
    <div style={{ width: "600px", margin: "0 auto" }}>
      <h2>Real-Time Sensor Dashboard</h2>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default SensorChart;
