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
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
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
