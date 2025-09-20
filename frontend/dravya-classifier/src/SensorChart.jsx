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
    datasets: [
      {
        label,
        data,
        borderColor: color,
        fill: false,
      },
    ],
  });

  const options = (yLabel, min, max) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: {
        title: { display: true, text: "Time" },
      },
      y: {
        type: "linear",
        title: { display: true, text: yLabel },
        min,
        max,
      },
    },
  });

  const charts = [
    {
      label: "Temperature (°C)",
      data: sensorData.map((d) => d.temperature),
      color: "red",
      yLabel: "Temperature (°C)",
      min: 0,
      max: 100,
    },
    {
      label: "Humidity (%)",
      data: sensorData.map((d) => d.humidity),
      color: "blue",
      yLabel: "Humidity (%)",
      min: 0,
      max: 100,
    },
    {
      label: "MQ-8 Voltage (V)",
      data: sensorData.map((d) => d.mq8_voltage),
      color: "green",
      yLabel: "Voltage (V)",
      min: 0,
      max: 5,
    },
    {
      label: "Other MQ Voltage (V)",
      data: sensorData.map((d) => d.mq_other_voltage),
      color: "purple",
      yLabel: "Voltage (V)",
      min: 0,
      max: 5,
    },
    {
      label: "Color R Pulse",
      data: sensorData.map((d) => d.color_r),
      color: "orange",
      yLabel: "Color Pulse",
      min: 0,
      max: 1024,
    },
    {
      label: "Color G Pulse",
      data: sensorData.map((d) => d.color_g),
      color: "teal",
      yLabel: "Color Pulse",
      min: 0,
      max: 1024,
    },
    {
      label: "Color B Pulse",
      data: sensorData.map((d) => d.color_b),
      color: "cyan",
      yLabel: "Color Pulse",
      min: 0,
      max: 1024,
    },
  ];

  return (
    <div style={{ width: "95%", margin: "0 auto" }}>
      <h2>Real-Time Sensor Dashboard</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "30px",
        }}
      >
        {charts.map((chart, index) => (
          <div key={index} style={{ height: "300px" }}>
            <Line
              data={generateChartData(chart.label, chart.data, chart.color)}
              options={options(chart.yLabel, chart.min, chart.max)}
            />
            <p style={{ textAlign: "center", marginTop: "5px", fontWeight: "bold" }}>
              Latest {chart.label}:{" "}
              {chart.data.length > 0 ? chart.data[chart.data.length - 1] : "-"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SensorChart;
