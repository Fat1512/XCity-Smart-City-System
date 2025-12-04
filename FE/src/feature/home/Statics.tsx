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
import { useEffect, useState } from "react";

const stats = [
  { value: "99.9%", label: "System Uptime", suffix: "" },
  { value: "45", label: "Countries", suffix: "+" },
  { value: "500M", label: "Sensors Connected", suffix: "+" },
  { value: "24/7", label: "Support Coverage", suffix: "" },
];

export default function Statistics() {
  const [counts, setCounts] = useState(stats.map(() => 0));

  useEffect(() => {
    const timers: ReturnType<typeof setInterval>[] = [];

    stats.forEach((stat, index) => {
      let current = 0;
      const target = Number.parseInt(stat.value);

      const timer = setInterval(() => {
        current += Math.ceil(target / 50);
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setCounts((prev) => {
          const newCounts = [...prev];
          newCounts[index] = current;
          return newCounts;
        });
      }, 30);

      timers.push(timer);
    });

    return () => timers.forEach((timer) => clearInterval(timer));
  }, []);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 to-accent/10">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <p className="text-4xl md:text-5xl font-bold text-primary">
                {counts[index]}
                {stat.suffix}
              </p>
              <p className="text-foreground/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
