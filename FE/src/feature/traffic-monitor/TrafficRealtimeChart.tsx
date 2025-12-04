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
import { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import { useTrafficMonitorContext } from "../../context/TrafficMonitorContext";
import type { ChartOptions } from "chart.js";
const MAX_POINTS = 10;
const randomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 80%, 50%)`;

const options: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      labels: {
        color: "#black", // màu chữ
        font: { size: 14 }, // kích thước font
      },
    },
  },
  scales: {
    y: {
      title: {
        display: true,
        text: "Vận tốc (km/h)",
        color: "#333",
        font: {
          size: 14,
          weight: "bold",
        },
      },
      beginAtZero: true,
    },
    x: {
      title: {
        display: true,
        text: "Thời gian",
        color: "#333",
        font: {
          size: 14,
          weight: "bold",
        },
      },
    },
  },
};
interface TrafficChartProps {
  streamId: string;
  roadName?: string;
}

const TrafficRealtimeChart = ({ streamId, roadName }: TrafficChartProps) => {
  const { ws } = useTrafficMonitorContext();
  const [labels, setLabels] = useState<string[]>([]);
  const [dataPoints, setDataPoints] = useState<number[]>([]);
  const [color] = useState(randomColor());

  const lastRenderTsRef = useRef<number>(0);

  useEffect(() => {
    if (!ws) return;

    const handleMessage = async (event: MessageEvent) => {
      const blob = event.data instanceof Blob ? event.data : null;
      if (!blob) return;

      const buffer = await blob.arrayBuffer();
      const view = new DataView(buffer);

      const metaLen = view.getUint32(0, false);
      const metaBytes = buffer.slice(4, 4 + metaLen);
      const decoder = new TextDecoder("utf-8");
      const metaJson = decoder.decode(metaBytes);
      const meta = JSON.parse(metaJson);

      if (!meta.ts) return;
      const ts = meta.ts;
      if (ts - lastRenderTsRef.current < 5000) {
        return;
      }
      if (meta.stream_id !== streamId) return;

      lastRenderTsRef.current = ts;

      const trafficValue = meta.metrics?.current_count ?? 0;

      setDataPoints((prev) => [...prev, trafficValue].slice(-MAX_POINTS));
      setLabels((prev) =>
        [...prev, new Date(ts).toLocaleTimeString()].slice(-MAX_POINTS)
      );
    };

    ws.addEventListener("message", handleMessage);
    return () => ws.removeEventListener("message", handleMessage);
  }, [ws, streamId]);

  const chartData = {
    labels,
    datasets: [
      {
        label: roadName ?? streamId,
        data: dataPoints,
        borderColor: color,
        backgroundColor: color + "55",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4 h-[250px] mb-6">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default TrafficRealtimeChart;
