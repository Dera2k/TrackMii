"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  Receipt,
  PieChart,
  Tag,
  Wallet,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import CurrencyParticles from "@/components/CurrencyParticles";
import trackmiiIcon from "@/assets/trackmii64.png";

const features = [
  {
    icon: Receipt,
    title: "Track expenses",
    description:
      "Log every transaction in seconds with categories, dates, and notes.",
  },
  {
    icon: PieChart,
    title: "Visual insights",
    description:
      "See where your money goes with clear charts and spending summaries.",
  },
  {
    icon: Tag,
    title: "Custom categories",
    description:
      "Organize spending your way with flexible, color-coded categories.",
  },
  {
    icon: Wallet,
    title: "Budgets that work",
    description:
      "Set monthly limits and get alerts before you overspend.",
  },
];

const highlights = [
  "Multi-currency support",
  "Clean, distraction-free design",
  "Analytics on spending habits",
  "Categorized expenses",
];

export default function Home() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src={trackmiiIcon}
              alt="Trackmii"
              width={32}
              height={32}
              className="h-8 w-8"
              priority
            />
            <span className="text-lg font-bold tracking-tight">
              Trackmii
            </span>
          </Link>

          <button
            onClick={() =>
              setTheme(isDark ? "light" : "dark")
            }
            className="rounded-lg p-2.5 transition-colors hover:bg-accent"
            aria-label="Toggle theme"
          >
            {mounted &&
              (isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              ))}
          </button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 md:pt-28 md:pb-32">
          {/* Currency particles */}
          <div className="pointer-events-none absolute inset-0 z-0">
            <CurrencyParticles />
          </div>

          {/* Gradient */}
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-40"
            style={{
              background: isDark
                ? "radial-gradient(circle at 50% 0%, hsl(var(--primary) / 0.25), transparent 55%)"
                : "radial-gradient(circle at 50% 0%, hsl(var(--primary) / 0.15), transparent 55%)",
            }}
          />

          <div className="relative z-10 mx-auto max-w-6xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Smart expense tracking
            </div>

            <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-7xl">
              Know where every{" "}
              <span className="text-primary">naira</span> goes
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Trackmii helps you record expenses, organize spending, and stay on
              budget, all in a clean, fast, mobile-friendly experience.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 min-w-45 text-base"
              >
                <Link href="/register">
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 min-w-45 text-base"
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
              {highlights.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border bg-card/50 px-4 py-16 sm:px-6 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center md:mb-16">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Everything you need to stay on top of spending
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                Built for clarity and speed, so managing money feels effortless.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-border bg-background p-6 transition-all hover:border-primary/20 hover:shadow-md"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </div>

                  <h3 className="mb-2 text-lg font-semibold">
                    {feature.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src={trackmiiIcon}
              alt="Trackmii"
              width={24}
              height={24}
              className="h-6 w-6"
            />
            <span className="font-semibold">Trackmii</span>
          </div>

          <p className="text-sm text-muted-foreground">
            Developed by D-E-R-A
          </p>
        </div>
      </footer>
    </div>
  );
}