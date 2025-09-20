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

  // Utility function to generate chart data
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

  return (
    <div style={{ width: "90%", maxWidth: "1000px", margin: "0 auto" }}>
      <h2>Real-Time Sensor Dashboard</h2>

      <div style={{ height: "300px", marginBottom: "40px" }}>
        <Line
          data={generateChartData(
            "Temperature (°C)",
            sensorData.map((d) => d.temperature),
            "red"
          )}
          options={options("Temperature (°C)", 0, 100)}
        />
      </div>

      <div style={{ height: "300px", marginBottom: "40px" }}>
        <Line
          data={generateChartData(
            "Humidity (%)",
            sensorData.map((d) => d.humidity),
            "blue"
          )}
          options={options("Humidity (%)", 0, 100)}
        />
      </div>

      <div style={{ height: "300px", marginBottom: "40px" }}>
        <Line
          data={generateChartData(
            "MQ-8 Voltage (V)",
            sensorData.map((d) => d.mq8_voltage),
            "green"
          )}
          options={options("Voltage (V)", 0, 5)}
        />
      </div>

      <div style={{ height: "300px", marginBottom: "40px" }}>
        <Line
          data={generateChartData(
            "Other MQ Voltage (V)",
            sensorData.map((d) => d.mq_other_voltage),
            "purple"
          )}
          options={options("Voltage (V)", 0, 5)}
        />
      </div>

      <div style={{ height: "300px", marginBottom: "40px" }}>
        <Line
          data={generateChartData(
            "Color R Pulse",
            sensorData.map((d) => d.color_r),
            "orange"
          )}
          options={options("Color Pulse", 0, 1024)}
        />
      </div>

      <div style={{ height: "300px", marginBottom: "40px" }}>
        <Line
          data={generateChartData(
            "Color G Pulse",
            sensorData.map((d) => d.color_g),
            "teal"
          )}
          options={options("Color Pulse", 0, 1024)}
        />
      </div>

      <div style={{ height: "300px", marginBottom: "40px" }}>
        <Line
          data={generateChartData(
            "Color B Pulse",
            sensorData.map((d) => d.color_b),
            "cyan"
          )}
          options={options("Color Pulse", 0, 1024)}
        />
      </div>
    </div>
  );
};

export default SensorChart;
