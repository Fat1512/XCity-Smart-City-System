import { useEffect, useState, useRef } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTrafficMonitorContext } from "../../context/TrafficMonitorContext";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const MAX_POINTS = 10;

const TrafficDashboard = () => {
  const { ws, connected } = useTrafficMonitorContext();

  const [metrics, setMetrics] = useState({ current: 0, avg: 0, total: 0 });
  const [traffic, setTraffic] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data instanceof Blob) {
        return;
      }

      try {
        const data = JSON.parse(event.data);
        if (data.metrics) {
          const newTraffic = data.metrics.current_count;
          setMetrics({
            avg: data.metrics.current_avg_speed,
            current: newTraffic,
            total: 0,
          });

          const timestamp = new Date().toLocaleTimeString();
          setTraffic((prev) => [...prev, newTraffic].slice(-MAX_POINTS));
          setLabels((prev) => [...prev, timestamp].slice(-MAX_POINTS));
        }
      } catch (err) {
        console.error("WS message parse error:", err);
      }
    };

    ws.addEventListener("message", handleMessage);

    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, [ws]);

  const data = {
    labels,
    datasets: [
      {
        label: "Traffic (req/s)",
        data: traffic,
        borderColor: "rgb(59,130,246)",
        backgroundColor: "rgba(59,130,246,0.3)",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-semibold mb-6">
        📊 Real-time Traffic Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100 transition duration-300 hover:shadow-xl">
            <h2 className="text-sm font-semibold text-slate-500 tracking-wide">
              Current Requests
            </h2>
            <p className="mt-2 text-4xl font-bold text-blue-600 transition-all duration-300">
              {metrics.current}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {connected ? "Live" : "Disconnected"}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100 transition duration-300 hover:shadow-xl">
            <h2 className="text-sm font-semibold text-slate-500 tracking-wide">
              Average Requests
            </h2>
            <p className="mt-2 text-4xl font-bold text-blue-600 transition-all duration-300">
              {metrics.avg}
            </p>
            <p className="text-xs text-slate-400 mt-1">Updated live</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100 transition duration-300 hover:shadow-xl">
            <h2 className="text-sm font-semibold text-slate-500 tracking-wide">
              Total Requests
            </h2>
            <p className="mt-2 text-4xl font-bold text-blue-600 transition-all duration-300">
              {metrics.total}
            </p>
            <p className="text-xs text-slate-400 mt-1">Updated live</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 min-h-[400px] w-full">
          <div className="h-full w-full">
            <Line data={data} options={options} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficDashboard;
