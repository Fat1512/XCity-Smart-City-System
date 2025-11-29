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

import { useState, useEffect } from "react";
import Navigation from "../ui/Navigation";
import Hero from "../feature/home/Hero";
import Features from "../feature/home/Feature";
import Statistics from "../feature/home/Statics";
import Solutions from "../feature/home/Solution";

import CallToAction from "../feature/home/CallToAction";
import Footer from "../ui/Footer";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-background via-background to-primary/5">
      <Navigation />
      <Hero />
      <Features />
      <Statistics />
      <Solutions />
      <CallToAction />
      <Footer />
    </main>
  );
}
