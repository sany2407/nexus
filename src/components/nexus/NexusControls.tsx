"use client";

import { motion } from "framer-motion";
import { Locate, Minus, Plus, RotateCcw, Waypoints } from "lucide-react";
import type { FlowFilter } from "@/types/nexus";

const flowOptions: Array<{ id: FlowFilter; label: string }> = [
  { id: "all", label: "All flows" },
  { id: "supply", label: "Supply" },
  { id: "orders", label: "Orders" },
  { id: "finance", label: "Finance" },
  { id: "operations", label: "Ops" },
  { id: "intelligence", label: "AI" },
];

interface NexusControlsProps {
  flowFilter: FlowFilter;
  onFlowChange: (filter: FlowFilter) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onResetSimulation: () => void;
}

export function NexusControls({
  flowFilter,
  onFlowChange,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
  onResetSimulation,
}: NexusControlsProps) {
  return (
    <div className="pointer-events-auto absolute bottom-3 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-[760px] -translate-x-1/2 sm:bottom-4">
      <div className="flex items-center gap-1 overflow-hidden rounded-xl border border-white/[0.08] bg-[#080b10]/78 p-1.5 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.95)] backdrop-blur-xl">
        <span className="ml-1 hidden shrink-0 items-center gap-1.5 pr-1 font-mono text-[7px] uppercase tracking-[0.2em] text-white/35 lg:flex">
          <Waypoints className="h-3 w-3 text-brand-soft/70" strokeWidth={1.5} />
          Flow
        </span>
        <div className="scroll-thin flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
          {flowOptions.map((option) => {
            const active = flowFilter === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onFlowChange(option.id)}
                aria-pressed={active}
                className={`relative shrink-0 rounded-md px-2 py-[5px] font-mono text-[7.5px] uppercase tracking-[0.13em] transition-colors duration-300 sm:text-[8px] ${
                  active
                    ? "text-white"
                    : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="flow-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-md border border-brand/40 bg-brand/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_18px_rgba(242,13,24,0.18)]"
                  />
                )}
                <span className="relative z-10">{option.label}</span>
              </button>
            );
          })}
        </div>

        <span className="mx-1 h-4 w-px shrink-0 bg-white/10" />

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={onZoomOut}
            aria-label="Zoom out"
            className="flex h-6 w-6 items-center justify-center rounded-md text-white/45 transition hover:bg-white/[0.06] hover:text-white/80"
          >
            <Minus className="h-3 w-3" strokeWidth={1.7} />
          </button>
          <span className="w-8 text-center font-mono text-[7.5px] tabular text-white/45">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={onZoomIn}
            aria-label="Zoom in"
            className="flex h-6 w-6 items-center justify-center rounded-md text-white/45 transition hover:bg-white/[0.06] hover:text-white/80"
          >
            <Plus className="h-3 w-3" strokeWidth={1.7} />
          </button>
          <button
            type="button"
            onClick={onResetView}
            aria-label="Recentre network"
            className="flex h-6 w-6 items-center justify-center rounded-md text-white/40 transition hover:bg-white/[0.06] hover:text-white/80"
          >
            <Locate className="h-3 w-3" strokeWidth={1.7} />
          </button>
        </div>

        <span className="mx-1 h-4 w-px shrink-0 bg-white/10" />

        <button
          type="button"
          onClick={onResetSimulation}
          className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-[5px] font-mono text-[7.5px] uppercase tracking-[0.13em] text-white/40 transition hover:bg-brand/10 hover:text-brand-soft"
          aria-label="Reset simulation"
          title="Reset simulation"
        >
          <RotateCcw className="h-3 w-3" strokeWidth={1.6} />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </div>
  );
}
