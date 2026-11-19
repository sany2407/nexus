"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Radio, Sparkles } from "lucide-react";
import { DepartmentIcon } from "@/components/nexus/DepartmentIcon";
import { departmentMap } from "@/data/departments";
import {
  activityFilters,
  matchesActivityFilter,
} from "@/data/mockEvents";
import { inrCompact, num, relativeTime } from "@/lib/format";
import { TONE_COLORS } from "@/lib/animation-utils";
import type {
  ActivityFilter,
  Branch,
  BusinessEvent,
  DepartmentId,
  SimulationCounters,
} from "@/types/nexus";

interface ActivityPanelProps {
  events: BusinessEvent[];
  counters: SimulationCounters;
  branch: Branch;
  paused: boolean;
  filter: ActivityFilter;
  onFilterChange: (filter: ActivityFilter) => void;
  onSelectDepartment: (id: DepartmentId) => void;
}

export function ActivityPanel({
  events,
  counters,
  branch,
  paused,
  filter,
  onFilterChange,
  onSelectDepartment,
}: ActivityPanelProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(timer);
  }, []);

  const filtered = useMemo(
    () => events.filter((event) => matchesActivityFilter(event, filter)),
    [events, filter],
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="relative px-4 pb-3.5 pt-4">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(70%_100%_at_20%_0%,rgba(242,13,24,0.13),transparent_75%)]"
        />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                {!paused && (
                  <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-brand-soft" />
                )}
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-soft" />
              </span>
              <span className="font-mono text-[7px] uppercase tracking-[0.26em] text-brand-soft/80">
                {paused ? "Stream paused" : "Signal stream"}
              </span>
            </div>
            <h2 className="mt-2 font-display text-[17px] font-semibold uppercase tracking-[0.16em] text-white">
              Live Activity
            </h2>
            <p className="mt-1 font-mono text-[7px] uppercase tracking-[0.13em] text-white/30">
              {branch.shortName} · {branch.location}
            </p>
          </div>
          <span className="rounded-md border border-white/[0.08] bg-white/[0.025] px-2 py-1 font-mono text-[7px] tabular text-white/40">
            {filtered.length.toString().padStart(2, "0")} events
          </span>
        </div>
      </div>

      <div className="relative border-y border-white/[0.055] px-3 py-2">
        <div className="scroll-thin flex items-center gap-0.5 overflow-x-auto">
          {activityFilters.map((option) => {
            const active = filter === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onFilterChange(option.id)}
                aria-pressed={active}
                className={`relative shrink-0 rounded-md px-2 py-[4.5px] font-mono text-[7px] uppercase tracking-[0.12em] transition-colors duration-300 ${
                  active
                    ? "text-white"
                    : "text-white/35 hover:bg-white/[0.035] hover:text-white/65"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="activity-filter-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-md border border-brand/35 bg-brand/12"
                  />
                )}
                <span className="relative z-10">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="scroll-thin mask-fade-y min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {filtered.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02]">
              <Radio className="h-4 w-4 text-white/25" strokeWidth={1.4} />
            </span>
            <p className="font-mono text-[8px] uppercase leading-relaxed tracking-[0.14em] text-white/30">
              No signals in this channel yet.
              <br />
              The ecosystem is still processing.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false} mode="popLayout">
            {filtered.map((event) => {
              const department = departmentMap[event.departmentId];
              return (
                <motion.button
                  key={event.id}
                  type="button"
                  layout
                  initial={{ opacity: 0, y: -12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 26, transition: { duration: 0.18 } }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => onSelectDepartment(event.departmentId)}
                  className="group/event relative flex w-full items-start gap-2.5 rounded-lg px-2 py-2.5 text-left transition hover:bg-white/[0.035]"
                >
                  <span className="relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/[0.07] bg-white/[0.025] text-white/55 transition group-hover/event:border-brand/25 group-hover/event:text-brand-soft">
                    <DepartmentIcon
                      icon={department.icon}
                      className="h-3.5 w-3.5"
                      strokeWidth={1.6}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="line-clamp-2 font-display text-[9px] font-medium uppercase leading-[1.35] tracking-[0.06em] text-white/82 transition group-hover/event:text-white">
                        {event.title}
                      </span>
                      <span
                        className="mt-1 h-1 w-1 shrink-0 rounded-full"
                        style={{
                          background: TONE_COLORS[event.tone],
                          boxShadow: `0 0 6px ${TONE_COLORS[event.tone]}`,
                        }}
                      />
                    </span>
                    <span className="mt-1 flex items-center gap-1.5">
                      <span className="truncate text-[8px] tracking-wide text-white/33">
                        {department.name}
                      </span>
                      <span className="h-[2px] w-[2px] shrink-0 rounded-full bg-white/20" />
                      <span className="shrink-0 font-mono text-[7px] tabular text-white/25">
                        {relativeTime(event.createdAt, now)}
                      </span>
                    </span>
                  </span>
                  <ArrowUpRight className="mt-2 h-2.5 w-2.5 shrink-0 text-white/0 transition group-hover/event:text-white/30" />
                </motion.button>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <div className="relative shrink-0 border-t border-white/[0.06] bg-black/20 px-4 pb-3 pt-3">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-mono text-[6.5px] uppercase tracking-[0.18em] text-white/25">
            <Sparkles className="h-2.5 w-2.5 text-brand-soft/50" strokeWidth={1.5} />
            Simulated telemetry
          </span>
          <span className="flex items-center gap-1 font-mono text-[6.5px] uppercase tracking-[0.14em] text-emerald-300/50">
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
            nominal
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="font-mono text-[6px] uppercase tracking-[0.16em] text-white/25">
              Revenue
            </p>
            <p className="mt-1 font-display text-[12px] tracking-wide text-white/90 tabular">
              {inrCompact(counters.revenue)}
            </p>
          </div>
          <div>
            <p className="font-mono text-[6px] uppercase tracking-[0.16em] text-white/25">
              Active orders
            </p>
            <p className="mt-1 font-display text-[12px] tracking-wide text-white/90 tabular">
              {num(counters.activeOrders)}
            </p>
          </div>
          <div>
            <p className="font-mono text-[6px] uppercase tracking-[0.16em] text-white/25">
              Covers
            </p>
            <p className="mt-1 font-display text-[12px] tracking-wide text-white/90 tabular">
              {num(counters.covers)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
