import { Line } from "react-chartjs-2";
import { useMemo } from "react";

interface DataPoint {
  x: number; // timestamp (ms)
  y: number; // value
}

interface SensorSeries {
  sensorId: string;
  label: string;
  color: string;
  dataPoints: DataPoint[];
}

interface Props {
  sensors: SensorSeries[];
  metricLabel: string; // PM2.5 / PM1 / CO2…
}

const MultiSensorChart = ({ sensors, metricLabel }: Props) => {
  const chartData = useMemo(() => {
    return {
      labels:
        sensors.length > 0
          ? sensors[0].dataPoints.map((p) =>
              new Date(p.x).toLocaleTimeString("en-US", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
              })
            )
          : [],
      datasets: sensors.map((s) => ({
        label: s.label,
        data: s.dataPoints.map((p) => p.y),
        borderColor: s.color,
        backgroundColor: s.color + "33",
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 2,
      })),
    };
  }, [sensors]);

  return (
    <div className="h-64 bg-white p-4 rounded-lg shadow">
      <h2 className="font-semibold mb-2">{metricLabel}</h2>
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom" },
          },
        }}
      />
    </div>
  );
};

export default MultiSensorChart;
