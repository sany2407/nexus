"use client";

import { useEffect, useState } from "react";
import { useRive } from "@rive-app/react-canvas";
import { motion } from "framer-motion";
import type { Point } from "@/types/nexus";

interface CentralHubProps {
  position: Point;
  size: number;
  paused: boolean;
  hasSelection: boolean;
  onClear: () => void;
}

const orbitDots = [
  { size: 5, angle: 0, color: "#ff414b", delay: "0s" },
  { size: 3, angle: 118, color: "#ff8a8f", delay: "-14s" },
  { size: 4, angle: 236, color: "#f20d18", delay: "-24s" },
];

export function CentralHub({
  position,
  size,
  paused,
  hasSelection,
  onClear,
}: CentralHubProps) {
  const [riveFailed, setRiveFailed] = useState(false);

  const { rive, RiveComponent } = useRive({
    src: "/assets/abielan-nexus.riv",
    stateMachine: "State Machine 1",
    autoplay: true,
    onLoadError: () => setRiveFailed(true),
  });

  useEffect(() => {
    if (!rive) return;
    try {
      if (paused) rive.pause();
      else rive.play();
    } catch {
      // The static SVG orbit stays visible if playback control is unavailable.
    }
  }, [rive, paused]);

  return (
    <div
      className="absolute z-20"
      style={{
        left: position.x - size / 2,
        top: position.y - size / 2,
        width: size,
        height: size,
      }}
    >
      <div className="relative h-full w-full">
        {/* Ambient halo */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: size * 1.65,
            height: size * 1.65,
            background:
              "radial-gradient(circle, rgba(242,13,24,0.20) 0%, rgba(242,13,24,0.06) 42%, transparent 68%)",
            filter: "blur(8px)",
          }}
          animate={{ scale: [0.96, 1.04, 0.96], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Rive orbit asset, with a CSS/SVG fallback rendered underneath */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: size * 1.96, height: size * 1.96 }}
        >
          <div className="absolute inset-0 animate-orbit-reverse">
            <div className="absolute inset-[3%] rounded-full border border-dashed border-brand/25" />
            <span className="absolute left-1/2 top-[2.6%] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-brand-soft shadow-[0_0_12px_rgba(242,13,24,0.9)]" />
          </div>
          <div className="absolute inset-[8%] animate-orbit-slow">
            <div
              className="absolute inset-0 rounded-full border border-brand/25"
              style={{
                maskImage:
                  "linear-gradient(140deg, transparent 12%, #000 46%, transparent 82%)",
                WebkitMaskImage:
                  "linear-gradient(140deg, transparent 12%, #000 46%, transparent 82%)",
              }}
            />
            <span className="absolute right-[8%] top-[22%] h-1 w-1 rounded-full bg-[#ffd9db] shadow-[0_0_10px_rgba(255,65,75,0.9)]" />
          </div>
        </div>

        {orbitDots.map((dot, index) => (
          <div
            key={dot.angle}
            aria-hidden
            className="pointer-events-none absolute inset-0 animate-orbit-slow"
            style={{ animationDelay: dot.delay }}
          >
            <span
              className="absolute left-1/2 top-0 rounded-full"
              style={{
                width: dot.size,
                height: dot.size,
                marginLeft: -dot.size / 2,
                marginTop: -dot.size / 2,
                background: dot.color,
                boxShadow: `0 0 ${8 + index * 3}px ${dot.color}`,
                opacity: 0.8,
              }}
            />
          </div>
        ))}

        <motion.button
          type="button"
          onClick={onClear}
          aria-label="Abielan Nexus core — clear department focus"
          className="group absolute inset-0 flex items-center justify-center rounded-full outline-none"
          initial={{ opacity: 0, scale: 0.82 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <span className="relative flex h-full w-full items-center justify-center rounded-full">
            {/* Outer rim */}
            <span className="absolute inset-0 rounded-full border border-white/[0.08]" />
            <span className="absolute inset-[3.5%] rounded-full border border-brand/25" />
            <span
              className="absolute inset-[6%] rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 50% 30%, rgba(26,31,41,0.95) 0%, rgba(9,12,17,0.98) 62%, rgba(6,8,11,1) 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -20px 60px rgba(0,0,0,0.6), 0 0 60px rgba(242,13,24,0.14)",
                backdropFilter: "blur(16px)",
              }}
            />
            <span
              aria-hidden
              className="absolute inset-[9%] rounded-full opacity-70"
              style={{
                background:
                  "conic-gradient(from 210deg, transparent 0deg, rgba(242,13,24,0.16) 28deg, transparent 70deg, transparent 240deg, rgba(255,65,75,0.1) 280deg, transparent 330deg)",
              }}
            />

            {!riveFailed && (
            <span
              aria-hidden
              className="brand-screen pointer-events-none absolute inset-[7%] overflow-hidden rounded-full opacity-80"
            >
              <RiveComponent
                className="h-full w-full [&>canvas]:!h-full [&>canvas]:!w-full"
                style={{ width: "100%", height: "100%" }}
              />
            </span>
          )}

          <span className="relative z-10 flex flex-col items-center justify-center">
              <span
                className="relative overflow-hidden"
                style={{ width: size * 0.36, height: size * 0.3 }}
              >
                <motion.img
                  src="/assets/abielan-logo.png"
                  alt="Abielan"
                  draggable={false}
                  className="brand-screen absolute left-1/2 top-1/2 h-[172%] w-[172%] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
                  initial={{ opacity: 0, scale: 0.7, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 overflow-hidden"
                >
                  <span className="absolute -inset-y-4 left-0 w-1/2 animate-scan bg-gradient-to-r from-transparent via-white/25 to-transparent blur-[2px]" />
                </span>
              </span>

              <span className="mt-1 text-center">
                <span className="block font-display text-[13px] font-semibold uppercase tracking-[0.34em] text-white/95 text-glow">
                  Abielan
                </span>
                <span className="mt-1 block font-mono text-[7px] uppercase tracking-[0.3em] text-brand-soft/90">
                  Restaurant OS
                </span>
              </span>
            </span>

            <span className="absolute bottom-[13%] flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-black/30 px-2 py-[3px] font-mono text-[6.5px] uppercase tracking-[0.24em] text-white/45">
              <span className="relative flex h-1 w-1">
                <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-brand-soft" />
                <span className="relative inline-flex h-1 w-1 rounded-full bg-brand" />
              </span>
              Nexus core
            </span>

            <span
              aria-hidden
              className="absolute inset-[6%] rounded-full border border-transparent transition-colors duration-500 group-hover:border-brand/30"
            />
          </span>
        </motion.button>

        {hasSelection && (
          <button
            type="button"
            onClick={onClear}
            className="absolute -bottom-7 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/55 px-2.5 py-1 font-mono text-[7px] uppercase tracking-[0.2em] text-white/55 backdrop-blur transition hover:border-brand/30 hover:text-brand-soft"
          >
            Clear focus
          </button>
        )}
      </div>
    </div>
  );
}
