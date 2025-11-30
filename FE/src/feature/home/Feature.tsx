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
import {
  FiCloud,
  FiZap,
  FiShield,
  FiTrendingUp,
  FiShare2,
  FiFeather,
} from "react-icons/fi";
import Card from "@mui/material/Card";

const features = [
  {
    icon: FiCloud,
    title: "Cloud Infrastructure",
    description:
      "Scalable, secure cloud platform built for millions of IoT sensors and devices.",
  },
  {
    icon: FiZap,
    title: "Real-Time Analytics",
    description:
      "Instant insights and predictive analytics powered by advanced AI algorithms.",
  },
  {
    icon: FiShield,
    title: "Enterprise Security",
    description:
      "Military-grade encryption and compliance with global security standards.",
  },
  {
    icon: FiTrendingUp,
    title: "Seamless Integration",
    description:
      "Connect existing city systems and third-party applications effortlessly.",
  },
  {
    icon: FiShare2,
    title: "Smart Optimization",
    description:
      "Automatically optimize traffic, energy, and resource allocation systems.",
  },
  {
    icon: FiFeather,
    title: "Sustainability",
    description:
      "Reduce emissions and environmental impact with data-driven decisions.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-background to-background/80 relative overflow-hidden"
    >
      {/* Decorative Background Glow */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute top-20 left-1/3 w-72 h-72 bg-primary/30 blur-3xl rounded-full animate-pulse-slow" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-accent/30 blur-3xl rounded-full animate-pulse-slow" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <p className="text-xl text-foreground/60">
            Everything you need to build and manage smart city solutions
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className={`p-8 rounded-2xl border border-border bg-card/60 backdrop-blur-md 
                shadow-lg hover:shadow-2xl hover:-translate-y-2 
                hover:border-transparent transition-all duration-500 
                group relative overflow-hidden`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Animated linear border on hover */}
                <div className="absolute inset-0 bg-linear-to-r from-primary/30 via-accent/30 to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-lg -z-10" />

                {/* Icon */}
                <div
                  className="w-14 h-14 mb-5 rounded-xl bg-linear-to-br from-primary/20 to-accent/20 
                    flex items-center justify-center group-hover:from-primary/40 
                    group-hover:to-accent/40 transition-all duration-500"
                >
                  <Icon className="w-7 h-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-foreground/60 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
