import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { LandingAtmosphere } from "@/components/landing/LandingAtmosphere";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { MatchPreview } from "@/components/landing/MatchPreview";
import { Features } from "@/components/landing/Features";
import { Careers } from "@/components/landing/Careers";
import { FinalCTA } from "@/components/landing/FinalCTA";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PathPilot — AI Career Matching for IT Students" },
      {
        name: "description",
        content:
          "PathPilot is an AI career recommendation platform for IT students and graduates. Discover which tech role fits you — with match scores, reasons, and a learning roadmap.",
      },
      { property: "og:title", content: "PathPilot — AI Career Matching for IT Students" },
      {
        property: "og:description",
        content:
          "Find your best-fit tech career with explainable AI. A free 5-minute assessment built for IT students and graduates.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-mesh text-foreground">
      <LandingAtmosphere />
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <MatchPreview />
        <Features />
        <Careers />
        <FinalCTA />
      </main>
    </div>
  );
}
