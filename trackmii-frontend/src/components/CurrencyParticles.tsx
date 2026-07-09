"use client"
import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

const SYMBOLS = ["₦", "$", "£", "€", "¥"];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  symbol: string;
  opacity: number;
  rotation: number;
  vr: number;
}

export default function CurrencyParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;
    let particles: Particle[] = [];
    let raf = 0;
    let mouseX = -9999;
    let mouseY = -9999;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(18, Math.min(42, Math.floor((width * height) / 26000)));
      particles = Array.from({ length: count }, () => spawn(true));
    };

    const spawn = (initial = false): Particle => {
      const size = 14 + Math.random() * 26;
      return {
        x: Math.random() * width,
        y: initial ? Math.random() * height : height + size,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.15 - Math.random() * 0.45,
        size,
        symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        opacity: 0.15 + Math.random() * 0.35,
        rotation: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.01,
      };
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const isDark = themeRef.current === "dark";
      const baseColor = isDark ? "164, 164, 148" : "51, 71, 29";

      for (const p of particles) {
        // mouse repel
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 14000) {
          const f = (14000 - dist2) / 14000;
          const d = Math.sqrt(dist2) || 1;
          p.vx += (dx / d) * f * 0.15;
          p.vy += (dy / d) * f * 0.15;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vr;
        p.vx *= 0.99;
        p.vy = p.vy * 0.99 - 0.002; // gentle upward drift

        if (p.y < -p.size || p.x < -p.size || p.x > width + p.size) {
          Object.assign(p, spawn(false));
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.font = `600 ${p.size}px Inter, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = `rgba(${baseColor}, ${p.opacity})`;
        ctx.shadowColor = `rgba(${baseColor}, ${p.opacity * 0.6})`;
        ctx.shadowBlur = 12;
        ctx.fillText(p.symbol, 0, 0);
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      aria-hidden="true"
    />
  );
}
