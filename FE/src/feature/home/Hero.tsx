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
"use client";
import { FiArrowRight, FiZap, FiPlayCircle } from "react-icons/fi";
import Button from "@mui/material/Button";

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 px-6 lg:px-12 overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      {/* Animated Background Blurs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-24 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-teal-400/30 rounded-full blur-[140px] animate-float"></div>
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <div className="space-y-8 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-linear-to-r from-blue-500/20 to-teal-500/20 border border-white/10 backdrop-blur-md shadow-inner hover:scale-105 transition-transform">
            <FiZap className="w-4 h-4 text-teal-400 animate-pulse" />
            <span className="text-sm font-medium tracking-wide text-teal-300">
              Next Generation Urban Technology
            </span>
          </div>

          <div>
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
              <span className="bg-linear-to-r from-blue-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
                Transform Your City
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-xl">
              Build smarter, sustainable cities with our AI-powered IoT
              platform. Connect, analyze, and optimize your infrastructure in
              real time.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              variant="contained"
              sx={{
                background: "linear-gradient(90deg, #0ea5e9, #14b8a6)",
                borderRadius: "9999px",
                padding: "10px 20px",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  background: "linear-gradient(90deg, #14b8a6, #0ea5e9)",
                  transform: "scale(1.05)",
                  transition: "all 0.3s ease-in-out",
                },
              }}
            >
              Start Building <FiArrowRight className="ml-2 text-white" />
            </Button>

            <Button
              variant="outlined"
              sx={{
                borderColor: "rgba(255,255,255,0.3)",
                color: "#fff",
                borderRadius: "9999px",
                padding: "10px 20px",
                textTransform: "none",
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderColor: "#0ea5e9",
                  transform: "scale(1.05)",
                  transition: "all 0.3s ease-in-out",
                },
              }}
            >
              <FiPlayCircle className="mr-2 text-teal-300" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-10 pt-10">
            {[
              { label: "Active Cities", value: "10K+", color: "text-blue-400" },
              { label: "Uptime SLA", value: "99.9%", color: "text-teal-400" },
              {
                label: "Data Points Daily",
                value: "50M+",
                color: "text-blue-400",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="group hover:scale-105 transition-transform"
              >
                <p className={`text-3xl font-bold ${item.color}`}>
                  {item.value}
                </p>
                <p className="text-sm text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Visual */}
        <div
          className="relative h-[450px] flex items-center justify-center animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="relative w-80 h-80 bg-linear-to-tr from-blue-600/20 via-teal-400/20 to-transparent rounded-3xl backdrop-blur-lg border border-white/10 shadow-2xl overflow-hidden group hover:scale-105 transition-transform duration-700">
            {/* Grid overlay */}
            <svg
              className="absolute inset-0 opacity-20"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <pattern
                  id="grid"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 10 0 L 0 0 0 10"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.3"
                  />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>

            {/* Central glowing node */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-teal-400 flex items-center justify-center animate-pulse">
                <span className="font-bold text-white text-lg">City</span>
              </div>
            </div>

            {/* Orbiting nodes */}
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"
                style={{
                  transform: `rotate(${i * 90}deg) translateY(-110px) rotate(${
                    -i * 90
                  }deg)`,
                  animation: `float ${3 + i}s ease-in-out infinite`,
                }}
              >
                <div className="w-6 h-6 rounded-full bg-linear-to-tr from-teal-400 to-blue-500 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
