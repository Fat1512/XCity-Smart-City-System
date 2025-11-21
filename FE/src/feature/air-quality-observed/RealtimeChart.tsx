import { useMemo } from "react";
import { Line } from "react-chartjs-2";

interface DataPoint {
  x: number;
  y: number;
}

interface Props {
  dataPoints: DataPoint[];
  color: string;
  label: string;
}

const RealtimeChart = ({ dataPoints, color, label }: Props) => {
  const chartData = useMemo(() => {
    const data = dataPoints
      .sort((a, b) => a.x - b.x)
      .map((p) => ({
        x: new Date(p.x).toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        y: p.y,
      }));

    const labels = data.map((d) => d.x);

    return {
      labels,
      datasets: [
        {
          label: label,
          data: data,
          borderColor: color,
          backgroundColor: color + "33",
          borderWidth: 2,
          tension: 0.4,
          fill: false,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };
  }, [dataPoints, color, label]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: {
      mode: "nearest" as const,
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          maxTicksLimit: 5,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: "nearest" as const,
        intersect: false,
        callbacks: {
          label: function (context: any) {
            return `${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
  };

  return (
    <div className="h-48">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default RealtimeChart;
