import { useMemo } from "react";
import { Line } from "react-chartjs-2";

const COLORS = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
  "#8B0000",
  "#008000",
];

interface AirQualityData {
  x: number; // timestamp
  y: number; // value
  sensorId: string;
}

interface DataPoint {
  dataPoints: AirQualityData[];
}

const RealtimeChart = ({ dataPoints }: DataPoint) => {
  const sensorIds = Array.from(new Set(dataPoints.map((p) => p.sensorId)));

  const chartData = useMemo(() => {
    const datasets = sensorIds.map((sensorId, idx) => {
      const sensorData = dataPoints
        .filter((p) => p.sensorId === sensorId)
        .sort((a, b) => a.x - b.x)
        .map((p) => ({
          x: new Date(p.x).toLocaleTimeString("en-US", { hour12: false }),
          y: p.y,
        }));

      return {
        label: sensorId,
        data: sensorData,
        borderColor: COLORS[idx % COLORS.length],
        backgroundColor: COLORS[idx % COLORS.length] + "33",
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointRadius: 4,
      };
    });

    const labels = Array.from(
      new Set(
        dataPoints
          .map((p) =>
            new Date(p.x).toLocaleTimeString("en-US", { hour12: false })
          )
          .sort()
      )
    );

    return { labels, datasets };
  }, [dataPoints, sensorIds]);

  const options = {
    responsive: true,
    animation: false,
    interaction: {
      mode: "nearest",
      intersect: false,
    },
    scales: {
      x: { title: { display: true, text: "Time" } },
      y: { beginAtZero: true, title: { display: true, text: "Value" } },
    },
    plugins: {
      legend: { display: true, position: "top" },
      tooltip: { enabled: true, mode: "nearest", intersect: false },
    },
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
      <Line key={dataPoints.length} data={chartData} options={options} />
    </div>
  );
};

export default RealtimeChart;
