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

import { Maximize2, Download, Activity, Gauge, TrendingUp } from "lucide-react";
import type { CameraResponse } from "./useGetCamera";

interface Metrics {
  current: number;
  avg: number;
  total: number;
}

interface Props {
  camera: CameraResponse;
  connected?: boolean;
  metrics?: Metrics;
  fps?: number;
  latency?: number;
  canvasRef?: React.Ref<HTMLCanvasElement>;
}

export default function StreamPanel({
  camera,
  connected = true,
  metrics = { current: 0, avg: 0, total: 0 },
  fps = 0,
  canvasRef,
  latency = 0,
}: Props) {
  const { id, cameraName, address } = camera;

  return (
    <div
      className={`relative rounded-3xl overflow-hidden shadow-2xl border transition-all duration-300 bg-slate-800/80 backdrop-blur-sm border-slate-700/30`}
    >
      <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 via-transparent to-purple-500/5 animate-pulse" />
      <div className="absolute inset-0 backdrop-blur-3xl bg-white/2" />

      <div className="relative p-6">
        <div className="flex justify-between items-start mb-6 h-[120px]">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div
                className={`w-4 h-4 rounded-full shadow-lg transition-all duration-300 ${
                  connected
                    ? "bg-emerald-400 shadow-emerald-400/50 animate-pulse"
                    : "bg-rose-500 shadow-rose-500/50"
                }`}
              />
              {connected && (
                <div className="absolute inset-0 w-4 h-4 rounded-full bg-emerald-400 animate-ping opacity-75" />
              )}
            </div>

            <div className="flex flex-col">
              <h3 className="text-xl font-bold bg-linear-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                {cameraName || "ALL STREAMS"}
              </h3>

              <p className="text-sm text-slate-300 font-medium mt-1">
                {[
                  address.streetAddress,
                  address.district,
                  address.addressLocality,
                  address.addressRegion,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              <p className="text-xs text-slate-400 mt-1 font-mono">
                ID: {id} • {connected ? "Live Stream" : "Disconnected"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="group p-2.5 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-slate-300 hover:text-white transition-all duration-300 hover:scale-105 border border-slate-600/50 hover:border-cyan-500/50"
              title="Download Snapshot"
            >
              <Download
                size={16}
                className="group-hover:scale-110 transition-transform"
              />
            </button>

            <button className="group p-2.5 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-slate-300 hover:text-white transition-all duration-300 hover:scale-105 border border-slate-600/50 hover:border-cyan-500/50">
              <Maximize2
                size={16}
                className="group-hover:scale-110 transition-transform"
              />
            </button>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-cyan-400/20 bg-black">
          <canvas ref={canvasRef} className="w-full h-auto block" />

          {connected && (
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-rose-500/90 backdrop-blur-sm rounded-full shadow-lg">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Live
              </span>
            </div>
          )}
        </div>

        {/* FPS & Latency */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="group relative bg-linear-to-br from-slate-800/80 to-slate-900/80 p-4 rounded-2xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105">
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1">
                  <Activity size={12} className="text-cyan-400" />
                  Frame Rate
                </p>
                <p className="text-3xl font-bold bg-linear-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                  {fps}
                  <span className="text-sm ml-1 text-slate-400">FPS</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Gauge className="text-cyan-400" size={24} />
              </div>
            </div>
          </div>

          <div className="group relative bg-linear-to-br from-slate-800/80 to-slate-900/80 p-4 rounded-2xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1">
                  <TrendingUp size={12} className="text-purple-400" />
                  Latency
                </p>
                <p className="text-3xl font-bold bg-linear-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                  {latency}
                  <span className="text-sm ml-1 text-slate-400">ms</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Activity className="text-purple-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          {[
            {
              label: "Current",
              value: metrics.current,
              color: "cyan",
              icon: Activity,
            },
            {
              label: "Average",
              value: metrics.avg,
              color: "cyan",
              icon: Gauge,
            },
          ].map((m) => (
            <div
              key={m.label}
              className={`group relative bg-linear-to-br from-slate-800/60 to-slate-900/60 p-4 rounded-xl border border-slate-700/50 hover:border-${m.color}-500/50 transition-all duration-300 hover:scale-105 overflow-hidden`}
            >
              <div
                className={`absolute inset-0 bg-linear-to-br from-${m.color}-500/0 to-${m.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity`}
              />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                    {m.label}
                  </p>
                  <m.icon
                    size={14}
                    className={`text-${m.color}-400 opacity-60`}
                  />
                </div>
                <p
                  className={`text-2xl font-bold bg-linear-to-r from-${m.color}-300 to-${m.color}-400 bg-clip-text text-transparent`}
                >
                  {m.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
