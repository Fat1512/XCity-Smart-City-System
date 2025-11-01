"use client";
import Card from "@mui/material/Card";
import { FiArrowRight } from "react-icons/fi";

const solutions = [
  {
    title: "Smart Traffic Management",
    description:
      "Reduce congestion and improve flow with AI-powered traffic optimization.",
    image: "/traffic.webp",
  },
  {
    title: "Energy Management",
    description:
      "Optimize energy distribution and reduce consumption across the city.",
    image: "/energy.webp",
  },
  {
    title: "Water Systems",
    description:
      "Monitor and manage water quality and distribution networks efficiently.",
    image: "/water.jpg",
  },
];

export default function Solutions() {
  return (
    <section
      id="solutions"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-white to-background relative overflow-hidden"
    >
      {/* Background blob */}
      <div className="absolute inset-0 -z-10 opacity-40 blur-3xl bg-[radial-gradient(circle_at_30%_20%,_rgba(59,130,246,0.25),_transparent_70%)]" />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
            Smart City Solutions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Harness the power of AI, IoT, and cloud to revolutionize urban
            living.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-10">
          {solutions.map((solution, index) => (
            <Card
              key={index}
              className="group overflow-hidden rounded-2xl border border-gray-100 shadow-md hover:shadow-2xl 
                         transition-all duration-700 hover:-translate-y-3 hover:-rotate-1 backdrop-blur-md relative"
              sx={{
                background: "rgba(255,255,255,0.9)",
                borderRadius: "16px",
              }}
            >
              {/* Light sweep effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-200%] group-hover:translate-x-[200%] transition-all duration-[1200ms] ease-in-out pointer-events-none" />

              {/* Image */}
              <div className="relative h-56 overflow-hidden rounded-t-2xl">
                <img
                  src={solution.image || "/placeholder.svg"}
                  alt={solution.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>

              {/* Content */}
              <div className="p-8 relative z-10">
                <h3
                  className="text-2xl font-bold mb-3 text-gray-900 
                             group-hover:text-primary transition-colors duration-500"
                >
                  {solution.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {solution.description}
                </p>
                <div
                  className="flex items-center gap-2 text-primary font-medium cursor-pointer 
                             group-hover:gap-3 transition-all duration-500"
                >
                  <span>Learn More</span>
                  <FiArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
