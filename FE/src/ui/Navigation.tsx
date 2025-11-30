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

import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import Button from "@mui/material/Button";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#solutions", label: "Solutions" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3 group cursor-pointer select-none">
            <div
              className="w-10 h-10 rounded-xl bg-linear-to-r from-blue-500 via-teal-400 to-blue-600 
               flex items-center justify-center text-white font-extrabold text-sm 
               shadow-lg transition-all duration-500 group-hover:scale-110 
               group-hover:shadow-blue-500/40 relative overflow-hidden"
            >
              <span className="relative z-10">SC</span>
            </div>

            <span
              className="font-semibold text-lg text-slate-800 dark:text-slate-100 
               transition-all duration-300 group-hover:text-transparent 
               group-hover:bg-clip-text group-hover:bg-linear-to-r 
               group-hover:from-blue-400 group-hover:to-teal-400"
            >
              SmartCity
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-700 font-medium hover:text-primary transition-colors duration-300 relative group"
              >
                {link.label}
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="outlined"
              sx={{
                borderColor: "#3b82f6",
                color: "#3b82f6",
                textTransform: "none",
                borderRadius: "10px",
                "&:hover": {
                  borderColor: "#2563eb",
                  backgroundColor: "#eff6ff",
                },
              }}
            >
              Sign In
            </Button>
            <Button
              variant="contained"
              sx={{
                background: "linear-gradient(to right, #3b82f6, #06b6d4)",
                color: "white",
                textTransform: "none",
                borderRadius: "10px",
                "&:hover": {
                  background: "linear-gradient(to right, #2563eb, #0891b2)",
                },
              }}
            >
              Get Started
            </Button>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-gray-200 animate-slideDown">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block py-2 text-gray-700 font-medium hover:text-primary transition-colors duration-300"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}

            <div className="flex flex-col gap-3 mt-4">
              <Button
                variant="outlined"
                sx={{
                  borderColor: "#3b82f6",
                  color: "#3b82f6",
                  textTransform: "none",
                  borderRadius: "10px",
                }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                sx={{
                  background: "linear-gradient(to right, #3b82f6, #06b6d4)",
                  color: "white",
                  textTransform: "none",
                  borderRadius: "10px",
                }}
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
