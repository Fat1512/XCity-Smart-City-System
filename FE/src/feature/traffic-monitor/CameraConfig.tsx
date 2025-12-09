import { useEffect, useRef, useState } from "react";
import { AI_URL } from "../../utils/Url";
interface CameraConfigProps {
  videos?: string[];
  points: [number, number][];
  setPoints: (points: [number, number][]) => void;
  realWidth?: number;
  setRealWidth: (width: number) => void;
  realHeight?: number;
  setRealHeight: (height: number) => void;
  setCurrentVideo: (video: string) => void;
  currentVideo?: string;
}

export default function CameraConfig({
  setCurrentVideo,
  currentVideo,
  points = [],
  setPoints,
  realHeight,
  realWidth,
  setRealHeight,
  setRealWidth,
}: CameraConfigProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [videos, setVideos] = useState<string[]>([]);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  console.log(videos);
  async function fetchVideos() {
    try {
      const res = await fetch(`${AI_URL}/setup/videos`);
      const data = await res.json();
      setVideos(data.videos || []);
    } catch (err) {}
  }

  async function loadSnapshot(path: string) {
    if (!path) return;

    setPoints([]);

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(img, 0, 0);

      setBgImage(img);
    };

    img.src = `${AI_URL}/setup/snapshot?video_path=${encodeURIComponent(path)}`;
  }

  function redraw() {
    const canvas = canvasRef.current;
    if (!canvas || !bgImage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImage, 0, 0);

    if (points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);

      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
      }

      if (points.length === 4) {
        ctx.lineTo(points[0][0], points[0][1]);
        ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
        ctx.fill();
      }

      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    points.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p[0], p[1], 6, 0, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();

      ctx.strokeStyle = "white";
      ctx.stroke();

      ctx.fillStyle = "white";
      ctx.font = "bold 20px Arial";
      ctx.fillText(String(i + 1), p[0] + 10, p[1] - 10);
    });
  }

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (points.length >= 4) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    const newPoints = [...points, [x, y] as [number, number]];
    setPoints(newPoints);
  }

  useEffect(() => {
    redraw();
  }, [points, bgImage]);

  useEffect(() => {
    fetchVideos();
    if (currentVideo) {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (ctx) ctx.drawImage(img, 0, 0);

        setBgImage(img);
      };

      img.src = `${AI_URL}/setup/snapshot?video_path=${encodeURIComponent(
        currentVideo || ""
      )}`;
    }
  }, []);

  return (
    <div className="min-h-screen mt-6">
      <div className=" grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6 ">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="bg-linear-to-r rounded-t-2xl from-emerald-500 to-teal-500 px-6 py-4">
              <h3 className="text-white font-bold text-lg">Cấu hình Camera</h3>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Chọn nguồn video
                </label>

                <div className="flex items-center gap-3">
                  <select
                    className="flex-1 border-2 border-gray-200 p-2.5 rounded-lg text-sm 
                     focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    value={currentVideo}
                    onChange={(e) => {
                      setCurrentVideo(e.target.value);
                      loadSnapshot(e.target.value);
                    }}
                  >
                    <option value="">-- Chọn video --</option>
                    {videos.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>

                  <button
                    className="text-xs text-emerald-600 underline"
                    onClick={fetchVideos}
                  >
                    Làm mới
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kích thước thực tế (Mét)
                </label>

                <p className="text-xs text-gray-500 mb-3">
                  Ước tính kích thước thực tế của khu vực được chọn
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    className="border-2 border-gray-200 px-3 py-2.5 rounded-lg text-sm
                     focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    placeholder="Chiều rộng (m)"
                    value={realWidth}
                    onChange={(e) => setRealWidth(Number(e.target.value))}
                  />

                  <input
                    type="number"
                    className="border-2 border-gray-200 px-3 py-2.5 rounded-lg text-sm
                     focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    placeholder="Chiều dài (m)"
                    value={realHeight}
                    onChange={(e) => setRealHeight(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Điểm đã chọn (tối đa 4)
                  </label>

                  <button
                    onClick={() => setPoints([])}
                    className="text-xs cursor-pointer text-red-500 border border-red-300 px-2 py-1 rounded-md hover:bg-red-50"
                  >
                    Xóa
                  </button>
                </div>

                <ul className="bg-slate-50 p-3 rounded-lg text-xs font-mono min-h-[70px] border border-gray-200">
                  {points.length === 0 ? (
                    <li className="text-gray-400 italic">
                      Nhấn vào ảnh để chọn điểm...
                    </li>
                  ) : (
                    points.map((p, i) => (
                      <li key={i}>
                        Điểm {i + 1}: [{p[0]}, {p[1]}]
                      </li>
                    ))
                  )}
                </ul>

                <p className="text-xs text-orange-600 mt-2">
                  * Thứ tự: Trái-Trên → Phải-Trên → Phải-Dưới → Trái-Dưới
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-black rounded-xl shadow-lg flex justify-center items-center relative min-h-[520px] border border-slate-700">
          <div ref={containerRef} className="relative inline-block">
            <canvas
              ref={canvasRef}
              className="block max-w-full rounded-lg"
              onMouseDown={handleCanvasClick}
            ></canvas>
          </div>
        </div>
      </div>
    </div>
  );
}
