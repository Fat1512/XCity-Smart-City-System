import { useState, useRef, useCallback, useEffect } from "react";
import { useTrafficMonitorContext } from "../../context/TrafficMonitorContext";

import useGetCameras from "./useGetCameras";
import PaginationStack from "../../ui/PaginationStack";
import MiniSpinner from "../../ui/MiniSpinner";
import StreamPanel from "./StreamPanel";

interface Metrics {
  current: number;
  avg: number;
  total: number;
}

export default function VehicleSpeedMonitor() {
  const { isLoading, cameras, totalPages, page, totalElements } =
    useGetCameras();
  const { ws, connected } = useTrafficMonitorContext();

  const [metricsMap, setMetricsMap] = useState<Record<string, Metrics>>({});
  const [fpsMap, setFpsMap] = useState<Record<string, number>>({});
  const [latencyMap, setLatencyMap] = useState<Record<string, number>>({});
  const [connectedMap, setConnectedMap] = useState<Record<string, boolean>>({});

  const frameCountMap = useRef<Record<string, number>>({});
  const lastFrameMap = useRef<Record<string, number>>({});
  const lastFpsUpdateMap = useRef<Record<string, number>>({});
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  const drawBlob = useCallback((cameraId: string, blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = canvasRefs.current[cameraId];
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const now = performance.now();
      const lastFrame = lastFrameMap.current[cameraId] ?? now;
      const dt = now - lastFrame;
      lastFrameMap.current[cameraId] = now;

      frameCountMap.current[cameraId] =
        (frameCountMap.current[cameraId] ?? 0) + 1;
      const lastFpsUpdate = lastFpsUpdateMap.current[cameraId] ?? now;
      if (now - lastFpsUpdate >= 1000) {
        setFpsMap((prev) => ({
          ...prev,
          [cameraId]: frameCountMap.current[cameraId],
        }));
        frameCountMap.current[cameraId] = 0;
        lastFpsUpdateMap.current[cameraId] = now;
      }

      setLatencyMap((prev) => ({
        ...prev,
        [cameraId]: Math.round(dt),
      }));
    };

    img.src = URL.createObjectURL(blob);
  }, []);

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = async (event) => {
      const blob = event.data instanceof Blob ? event.data : null;
      if (blob) {
        const buffer = await blob.arrayBuffer();
        const view = new DataView(buffer);

        const metaLen = view.getUint32(0, false);

        const metaBytes = buffer.slice(4, 4 + metaLen);
        const decoder = new TextDecoder("utf-8");
        const metaJson = decoder.decode(metaBytes);
        const meta = JSON.parse(metaJson);

        const jpgBytes = buffer.slice(4 + metaLen);
        const jpgBlob = new Blob([jpgBytes], { type: "image/jpeg" });

        const { stream_id, metrics } = meta;
        drawBlob(stream_id, jpgBlob);

        setMetricsMap((prev) => ({
          ...prev,
          [stream_id]: {
            avg: metrics?.current_avg_speed ?? 0,
            current: metrics?.current_count ?? 0,
            total: metrics?.total_count ?? 0,
          },
        }));

        setConnectedMap((prev) => ({
          ...prev,
          [stream_id]: true,
        }));
        return;
      }
    };

    ws.onclose = () => console.warn("WebSocket disconnected");
    ws.onerror = (err) => console.error("WebSocket error:", err);
  }, [ws, drawBlob]);

  if (isLoading) return <MiniSpinner />;

  return (
    <div className="px-6 py-10 bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-2">
          🚦 Vehicle Speed Monitor
        </h1>
        <p className="text-gray-600 text-lg">
          Monitor live vehicle speed from multiple cameras in real-time
        </p>
      </div>

      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {cameras.map((camera) => (
          <StreamPanel
            key={camera.id}
            camera={camera}
            metrics={metricsMap[camera.id] ?? { current: 0, avg: 0, total: 0 }}
            fps={fpsMap[camera.id] ?? 0}
            latency={latencyMap[camera.id] ?? 0}
            connected={connectedMap[camera.id] ?? connected}
            canvasRef={(el) => (canvasRefs.current[camera.id] = el)}
          />
        ))}
      </div>

      {totalElements === 0 && (
        <div className="text-center text-gray-400 mt-12">
          Chưa có stream nào. Hãy thêm một stream ID phía trên.
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <PaginationStack currentPage={page} totalPage={totalPages} />
        </div>
      )}
    </div>
  );
}
