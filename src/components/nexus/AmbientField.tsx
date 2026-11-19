"use client";

import { useEffect, useRef } from "react";

interface AmbientFieldProps {
  paused: boolean;
}

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  hue: number;
}

function seedMotes(width: number, height: number): Mote[] {
  return Array.from({ length: 38 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 3.4,
    vy: (Math.random() - 0.5) * 2.6,
    radius: 0.5 + Math.random() * 1.4,
    alpha: 0.05 + Math.random() * 0.16,
    hue: Math.random(),
  }));
}

export function AmbientField({ paused }: AmbientFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let width = parent.clientWidth;
    let height = parent.clientHeight;
    let motes = seedMotes(width, height);
    let raf = 0;
    let last = performance.now();
    let running = true;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      motes = seedMotes(width, height);
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      for (const mote of motes) {
        context.beginPath();
        context.arc(mote.x, mote.y, mote.radius, 0, Math.PI * 2);
        context.fillStyle =
          mote.hue > 0.55
            ? `rgba(255, 120, 128, ${mote.alpha})`
            : `rgba(196, 204, 218, ${mote.alpha * 0.8})`;
        context.fill();
      }
    };

    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!pausedRef.current) {
        for (const mote of motes) {
          mote.x += mote.vx * dt;
          mote.y += mote.vy * dt;
          if (mote.x < -8) mote.x = width + 8;
          if (mote.x > width + 8) mote.x = -8;
          if (mote.y < -8) mote.y = height + 8;
          if (mote.y > height + 8) mote.y = -8;
        }
      }
      draw();
      raf = requestAnimationFrame(frame);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    resize();
    draw();
    raf = requestAnimationFrame(frame);

    const onVisibility = () => {
      last = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
    />
  );
}
