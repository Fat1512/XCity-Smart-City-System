// -----------------------------------------------------------------------------
// Copyright 2025 Fenwick Team
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// -----------------------------------------------------------------------------
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
