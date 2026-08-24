"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun, ArrowUpRight } from "lucide-react";
import CurrencyParticles from "@/components/CurrencyParticles";
import trackmiiIcon from "@/assets/trackmii64.png";

const chapters = [
  {
    no: "01",
    title: "Log it in seconds",
    body:
      "Amount, category, a note if you care. No forms that feel like tax season.",
  },
  {
    no: "02",
    title: "See the pattern",
    body:
      "Charts that answer one question: where did the money actually go this month?",
  },
  {
    no: "03",
    title: "Name your own buckets",
    body:
      "Rent, bolt rides, black-tax, jollof fund. Your life, your categories.",
  },
  {
    no: "04",
    title: "Budgets that talk back",
    body:
      "Set a limit and Trackmii tells you before the month embarrasses you.",
  },
];

const ledger = [
  { label: "Rent", amount: "₦250,000", tone: "muted" },
  { label: "Groceries", amount: "₦42,300", tone: "primary" },
  { label: "Transport", amount: "₦18,750", tone: "muted" },
  { label: "Data & Airtime", amount: "₦12,000", tone: "muted" },
  { label: "Eating out", amount: "₦31,480", tone: "primary" },
];

const ticker = [
  "know where every naira goes",
  "₦",
  "no spreadsheets",
  "$",
  "budgets that talk back",
  "£",
  "built by Dera",
  "€",
  "spend on purpose",
];

export default function Home() {
  const { resolvedTheme, setTheme } = useTheme();

  // useSyncExternalStore gives us a stable server/client distinction
  // without triggering the set-state-in-effect ESLint rule.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

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
            onClick={() => setTheme(isDark ? "light" : "dark")}
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
        <section className="relative overflow-hidden border-b border-border">
          {/* Decorative particles stay behind the content and never intercept clicks. */}
          <div className="pointer-events-none absolute inset-0 z-0">
            <CurrencyParticles />
          </div>

          {/* Uses the primary CSS variable so the glow follows the active theme. */}
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background: isDark
                ? "radial-gradient(120% 80% at 8% 0%, hsl(var(--primary) / 0.25), transparent 60%)"
                : "radial-gradient(120% 80% at 8% 0%, hsl(var(--primary) / 0.18), transparent 60%)",
            }}
          />

          <div className="relative z-10 mx-auto max-w-6xl px-4 pt-16 pb-14 sm:px-6 md:pt-24 md:pb-20">
            <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-8">
                <p className="font-mono-ledger text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                  Personal expense ledger · est. 2026
                </p>

                <h1 className="font-display mt-6 text-[3.1rem] font-extrabold leading-[0.92] tracking-[-0.03em] sm:text-7xl md:text-8xl">
                  Money leaves
                  <br />
                  quietly.
                  <br />
                  <span className="inline-block pr-3 text-primary italic">
                    Trackmii
                  </span>{" "}
                  <span className="text-muted-foreground">
                    tells on it.
                  </span>
                </h1>

                <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
                  A quiet, fast place to write down what you spend and finally
                  read the story your bank statement has been mumbling.
                </p>

                <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 min-w-45 text-base"
                  >
                    <Link href="/register">
                      Get started
                      <ArrowUpRight className="ml-2 h-4 w-4" />
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
              </div>

              {/* Receipt-style panel */}
              <div className="lg:col-span-4">
                <div className="relative rounded-2xl border border-border bg-card/90 p-5 shadow-sm backdrop-blur-sm">
                  <div className="flex items-baseline justify-between border-b border-dashed border-border pb-3">
                    <span className="font-mono-ledger text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      This month
                    </span>

                    <span className="font-mono-ledger text-[11px] text-muted-foreground">
                      NGN
                    </span>
                  </div>

                  <ul className="mt-3 space-y-2.5">
                    {ledger.map((row) => (
                      <li
                        key={row.label}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="text-muted-foreground">
                          {row.label}
                        </span>

                        <span
                          className={`font-mono-ledger tabular-nums ${
                            row.tone === "primary"
                              ? "font-medium text-primary"
                              : "text-foreground"
                          }`}
                        >
                          {row.amount}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex items-baseline justify-between border-t border-dashed border-border pt-3">
                    <span className="font-mono-ledger text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      Total
                    </span>

                    <span className="font-display text-2xl font-bold tracking-tight">
                      ₦354,530
                    </span>
                  </div>

                  <p className="mt-3 font-mono-ledger text-[10px] leading-relaxed text-muted-foreground">
                    * illustrative ledger. yours starts empty, and stays yours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ticker */}
        <div className="overflow-hidden border-b border-border bg-primary text-primary-foreground">
          <div className="marquee-track flex w-max">
            {/* The duplicate lets the CSS animation loop continuously without
                exposing an empty section when the first copy resets. */}
            {[0, 1].map((dup) => (
              <div
                key={dup}
                className="flex shrink-0"
                aria-hidden={dup === 1}
              >
                {ticker.map((t, i) => (
                  <span
                    key={`${dup}-${i}`}
                    className="font-mono-ledger whitespace-nowrap px-6 py-3 text-xs uppercase tracking-[0.2em] opacity-90 sm:text-sm"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Chapters */}
        <section className="px-4 py-16 sm:px-6 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-extrabold leading-[1.02] tracking-[-0.02em] md:text-5xl">
                Four small habits.
                <br />
                <span className="text-muted-foreground">
                  One much calmer month.
                </span>
              </h2>
            </div>

            <div className="mt-12 divide-y divide-border border-t border-border">
              {chapters.map((chapter) => (
                <div
                  key={chapter.no}
                  className="group grid gap-4 py-8 transition-colors hover:bg-accent/40 md:grid-cols-12 md:gap-8"
                >
                  <div className="font-mono-ledger text-sm text-primary md:col-span-2">
                    {chapter.no}
                  </div>

                  <h3 className="font-display text-2xl font-semibold tracking-tight md:col-span-4 md:text-3xl">
                    {chapter.title}
                  </h3>

                  <p className="leading-relaxed text-muted-foreground md:col-span-6 md:pt-1">
                    {chapter.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Statement */}
        <section className="px-4 pb-20 sm:px-6 md:pb-28">
          <div className="mx-auto max-w-6xl rounded-3xl border border-border bg-card p-8 md:p-14">
            <blockquote className="font-display max-w-3xl text-2xl font-semibold leading-snug tracking-[-0.01em] md:text-4xl">
              “I didn&apos;t need another dashboard. I needed to stop being
              surprised at month-end.”
            </blockquote>

            <p className="mt-6 font-mono-ledger text-xs uppercase tracking-[0.22em] text-muted-foreground">
              — the reason Trackmii exists
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-10 sm:px-6">
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

          <p className="font-mono-ledger text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Developed by Dera
          </p>
        </div>
      </footer>
    </div>
  );
}