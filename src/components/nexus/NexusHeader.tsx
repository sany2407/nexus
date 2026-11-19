"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Maximize2,
  Minimize2,
  PanelRightOpen,
  Pause,
  Play,
} from "lucide-react";
import { BranchSelector } from "@/components/nexus/BranchSelector";
import { SimulationStatus } from "@/components/nexus/SimulationStatus";
import type {
  BranchId,
  SimulationSpeed,
} from "@/types/nexus";

const speedOptions: SimulationSpeed[] = [0.5, 1, 2, 4];

function SpeedSelector({
  speed,
  onChange,
}: {
  speed: SimulationSpeed;
  onChange: (speed: SimulationSpeed) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Simulation speed: ${speed} times`}
        className="flex h-9 items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.025] px-2 font-mono text-[9px] tracking-[0.08em] text-white/70 transition hover:border-white/15 hover:bg-white/[0.045] hover:text-white"
      >
        {speed}×
        <ChevronDown
          className={`h-2.5 w-2.5 text-white/30 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={1.8}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -3, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            role="listbox"
            aria-label="Simulation speed"
            className="absolute right-0 top-full z-[80] mt-2 w-28 overflow-hidden rounded-lg border border-white/[0.09] bg-[#0a0d12]/96 p-1 shadow-2xl backdrop-blur-2xl"
          >
            {speedOptions.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={option === speed}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 font-mono text-[9px] tracking-[0.08em] transition ${
                  option === speed
                    ? "bg-brand/12 text-brand-soft"
                    : "text-white/50 hover:bg-white/[0.045] hover:text-white/80"
                }`}
              >
                <span>{option}×</span>
                {option === speed && (
                  <span className="h-1 w-1 rounded-full bg-brand-soft" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface NexusHeaderProps {
  branchId: BranchId;
  onBranchChange: (id: BranchId) => void;
  paused: boolean;
  onTogglePaused: () => void;
  speed: SimulationSpeed;
  onSpeedChange: (speed: SimulationSpeed) => void;
  activeEvents: number;
  eventsPerMinute: number;
  onOpenActivity: () => void;
}

export function NexusHeader({
  branchId,
  onBranchChange,
  paused,
  onTogglePaused,
  speed,
  onSpeedChange,
  activeEvents,
  eventsPerMinute,
  onOpenActivity,
}: NexusHeaderProps) {
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen can be blocked by the browser; the control simply stays put.
    }
  };

  return (
    <header className="relative z-50 flex h-[62px] shrink-0 items-center justify-between gap-2 border-b border-white/[0.055] bg-[#080a0e]/65 px-3 backdrop-blur-xl md:h-[72px] md:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/[0.07] bg-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:h-10 sm:w-10">
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(242,13,24,0.18), transparent 70%)",
            }}
          />
          <img
            src="/assets/abielan-logo.png"
            alt="Abielan"
            draggable={false}
            className="brand-screen relative h-[155%] w-[155%] max-w-none object-contain"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-[12px] font-semibold uppercase tracking-[0.24em] text-white sm:text-[14px]">
              Abielan
            </span>
            <span className="font-display text-[12px] font-light uppercase tracking-[0.24em] text-brand-soft sm:text-[14px]">
              Nexus
            </span>
          </div>
          <p className="mt-1 hidden font-mono text-[6.5px] uppercase tracking-[0.26em] text-white/38 sm:block">
            Live business ecosystem
          </p>
        </div>
        <span className="ml-1 hidden h-8 w-px bg-white/[0.07] xl:block" />
      </div>

      <div className="absolute left-1/2 hidden -translate-x-1/2 xl:block">
        <SimulationStatus
          paused={paused}
          speed={speed}
          activeEvents={activeEvents}
          eventsPerMinute={eventsPerMinute}
        />
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={onOpenActivity}
          aria-label="Open live activity"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-white/55 transition hover:border-white/15 hover:text-white xl:hidden"
        >
          <PanelRightOpen className="h-3.5 w-3.5" strokeWidth={1.6} />
          {activeEvents > 0 && (
            <span className="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full border border-[#080a0e] bg-brand px-1 font-mono text-[6px] text-white">
              {activeEvents > 99 ? "99" : activeEvents}
            </span>
          )}
        </button>

        <BranchSelector branchId={branchId} onChange={onBranchChange} />
        <SpeedSelector speed={speed} onChange={onSpeedChange} />

        <button
          type="button"
          onClick={onTogglePaused}
          aria-label={paused ? "Resume simulation" : "Pause simulation"}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
            paused
              ? "border-brand/45 bg-brand/15 text-brand-soft shadow-[0_0_18px_rgba(242,13,24,0.2)]"
              : "border-white/[0.08] bg-white/[0.025] text-white/70 hover:border-white/15 hover:text-white"
          }`}
        >
          {paused ? (
            <Play className="h-3.5 w-3.5 fill-current" strokeWidth={1.5} />
          ) : (
            <Pause className="h-3.5 w-3.5" strokeWidth={1.7} />
          )}
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-white/55 transition hover:border-white/15 hover:text-white sm:flex"
        >
          {fullscreen ? (
            <Minimize2 className="h-3.5 w-3.5" strokeWidth={1.6} />
          ) : (
            <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.6} />
          )}
        </button>
      </div>

      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand/25 to-transparent"
      />
    </header>
  );
}
