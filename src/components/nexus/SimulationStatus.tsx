"use client";

import { useEffect, useRef, useState } from "react";
import { Activity } from "lucide-react";
import { clockTime, dayLabel, pad } from "@/lib/format";
import type { SimulationSpeed } from "@/types/nexus";

interface SimulationStatusProps {
  paused: boolean;
  speed: SimulationSpeed;
  activeEvents: number;
  eventsPerMinute: number;
}

export function SimulationStatus({
  paused,
  speed,
  activeEvents,
  eventsPerMinute,
}: SimulationStatusProps) {
  const epochRef = useRef(Date.now());
  const elapsedRef = useRef(0);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (paused) return;
    const startedReal = performance.now();
    const startedElapsed = elapsedRef.current;

    const tick = () => {
      const elapsed =
        startedElapsed + (performance.now() - startedReal) * speed;
      elapsedRef.current = elapsed;
      setNow(new Date(epochRef.current + elapsed));
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => {
      elapsedRef.current =
        startedElapsed + (performance.now() - startedReal) * speed;
      clearInterval(timer);
    };
  }, [paused, speed]);

  return (
    <div className="flex items-center gap-3 rounded-full border border-white/[0.07] bg-white/[0.02] py-1.5 pl-3 pr-3.5 backdrop-blur">
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-1.5 w-1.5">
          {!paused && (
            <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-emerald-400" />
          )}
          <span
            className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
              paused ? "bg-amber-400" : "bg-emerald-400"
            }`}
            style={{
              boxShadow: paused
                ? "0 0 8px rgba(251,191,36,0.8)"
                : "0 0 8px rgba(52,211,153,0.8)",
            }}
          />
        </span>
        <span
          className={`font-mono text-[7px] uppercase tracking-[0.2em] ${
            paused ? "text-amber-300/90" : "text-emerald-300/90"
          }`}
        >
          {paused ? "Paused" : "System live"}
        </span>
      </div>

      <span className="h-3 w-px bg-white/10" />

      <div className="flex items-baseline gap-1.5">
        <span
          suppressHydrationWarning
          className="font-mono text-[11px] tracking-[0.12em] text-white/85 tabular"
        >
          {clockTime(now)}
        </span>
        <span className="font-mono text-[6.5px] uppercase tracking-[0.14em] text-white/30">
          {dayLabel(now)}
        </span>
      </div>

      <span className="h-3 w-px bg-white/10" />

      <div className="flex items-center gap-1.5" title={`${eventsPerMinute} events / min`}>
        <Activity className="h-3 w-3 text-brand-soft/70" strokeWidth={1.6} />
        <span className="font-mono text-[9px] tabular text-white/70">
          {pad(activeEvents)}
        </span>
        <span className="font-mono text-[6.5px] uppercase tracking-[0.16em] text-white/30">
          active events
        </span>
      </div>
    </div>
  );
}
