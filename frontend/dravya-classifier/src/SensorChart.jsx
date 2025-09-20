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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await fetch("https://taste-sensor-iot-data.onrender.com/api/sensor");
        const result = await resp.json();
        setSensorData(result);
      } catch (error) {
        console.error("Error fetching sensor data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const data = {
    labels: sensorData.map((_, idx) => `Reading ${idx + 1}`),
    datasets: [
      {
        label: "pH",
        data: sensorData.map((d) => d.pH),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.3,
      },
      {
        label: "Conductivity",
        data: sensorData.map((d) => d.conductivity),
        borderColor: "rgb(255, 99, 132)",
        tension: 0.3,
      },
      {
        label: "Temperature",
        data: sensorData.map((d) => d.temperature),
        borderColor: "rgb(54, 162, 235)",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#fff",
        },
      },
    },
    scales: {
      y: {
        min: 0,    // lock scale
        max: 100,  // adjust based on your expected sensor range
        title: {
          display: true,
          text: "Sensor Values",
          color: "#fff",
        },
        ticks: {
          color: "#fff",
        },
      },
      x: {
        title: {
          display: true,
          text: "Time",
          color: "#fff",
        },
        ticks: {
          color: "#fff",
        },
      },
    },
  };

  return (
    <div className="w-full h-[400px] flex justify-center items-center">
      <Line data={data} options={options} />
    </div>
  );
};

export default SensorChart;
