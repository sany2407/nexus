"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronRight,
  CircleDot,
  X,
} from "lucide-react";
import { DepartmentIcon } from "@/components/nexus/DepartmentIcon";
import { departmentMap } from "@/data/departments";
import { relatedDepartments } from "@/data/connections";
import { getDepartmentProfile } from "@/data/mockMetrics";
import { relativeTime } from "@/lib/format";
import { TONE_COLORS } from "@/lib/animation-utils";
import type {
  Branch,
  BusinessEvent,
  Department,
  DepartmentId,
  SimulationCounters,
} from "@/types/nexus";

interface DepartmentDetailPanelProps {
  department: Department;
  branch: Branch;
  counters: SimulationCounters;
  events: BusinessEvent[];
  onClose: () => void;
  onShowActivity: () => void;
  onSelectDepartment: (id: DepartmentId) => void;
}

export function DepartmentDetailPanel({
  department,
  branch,
  counters,
  events,
  onClose,
  onShowActivity,
  onSelectDepartment,
}: DepartmentDetailPanelProps) {
  const profile = getDepartmentProfile(department.id, branch, counters);
  const recent = events
    .filter((event) => event.departmentId === department.id)
    .slice(0, 4);
  const related = relatedDepartments(department.id) as DepartmentId[];
  const statusColor = TONE_COLORS[department.status];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={department.id}
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -12 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="flex h-full min-h-0 flex-col"
      >
        <div className="relative shrink-0 overflow-hidden px-4 pb-3.5 pt-4">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(80%_100%_at_30%_0%,rgba(242,13,24,0.16),transparent_72%)]"
          />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-mono text-[6.5px] uppercase tracking-[0.2em] text-white/30">
              <span className="text-white/45">Ecosystem</span>
              <ChevronRight className="h-2 w-2" strokeWidth={1.5} />
              <span className="text-brand-soft/75">Department</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onShowActivity}
                aria-label="Back to live activity"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.07] bg-white/[0.025] text-white/40 transition hover:border-white/15 hover:text-white"
              >
                <ArrowLeft className="h-3 w-3" strokeWidth={1.7} />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close department detail"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.07] bg-white/[0.025] text-white/40 transition hover:border-brand/30 hover:text-brand-soft"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.7} />
              </button>
            </div>
          </div>

          <div className="relative mt-4 flex items-start gap-3">
            <span
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand/25 text-brand-soft"
              style={{
                background:
                  "linear-gradient(150deg, rgba(242,13,24,0.19), rgba(242,13,24,0.035))",
                boxShadow:
                  "0 0 24px rgba(242,13,24,0.18), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <DepartmentIcon
                icon={department.icon}
                className="h-5 w-5"
                strokeWidth={1.6}
              />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-[16px] font-semibold uppercase leading-tight tracking-[0.08em] text-white">
                {department.name}
              </h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-2 py-[3px] font-mono text-[6.5px] uppercase tracking-[0.14em]"
                  style={{
                    borderColor: `${statusColor}44`,
                    color: statusColor,
                    background: `${statusColor}12`,
                  }}
                >
                  <span
                    className="h-1 w-1 rounded-full"
                    style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}` }}
                  />
                  {department.statusLabel}
                </span>
                <span className="font-mono text-[6.5px] uppercase tracking-[0.14em] text-white/25">
                  {department.index} / {branch.code}
                </span>
              </div>
            </div>
          </div>
          <p className="relative mt-3 max-w-[92%] text-[9.5px] leading-relaxed text-white/40">
            {profile.headline}
          </p>
        </div>

        <div className="scroll-thin mask-fade-y min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-1">
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-mono text-[6.5px] uppercase tracking-[0.22em] text-white/30">
                Operational pulse
              </h3>
              <span className="flex items-center gap-1 font-mono text-[6px] uppercase tracking-[0.14em] text-emerald-300/45">
                <CircleDot className="h-2 w-2" strokeWidth={2} />
                live mock
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {profile.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="relative overflow-hidden rounded-lg border border-white/[0.065] bg-white/[0.022] p-2.5"
                >
                  <p className="font-mono text-[6px] uppercase tracking-[0.16em] text-white/30">
                    {metric.label}
                  </p>
                  <p className="mt-1.5 font-display text-[17px] font-medium leading-none tracking-wide text-white/92 tabular">
                    {metric.value}
                  </p>
                  {metric.delta && (
                    <p
                      className="mt-1.5 flex items-center gap-1 font-mono text-[6.5px] tracking-[0.06em]"
                      style={{
                        color:
                          metric.tone === "warning"
                            ? TONE_COLORS.warning
                            : metric.tone === "critical"
                              ? TONE_COLORS.critical
                              : metric.trend === "up"
                                ? "#5eead4"
                                : "rgba(255,255,255,0.35)",
                      }}
                    >
                      {metric.trend === "up" && (
                        <ArrowUpRight className="h-2 w-2" strokeWidth={2} />
                      )}
                      {metric.delta}
                    </p>
                  )}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-4 -top-4 h-12 w-12 rounded-full opacity-40"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(242,13,24,0.14), transparent 70%)",
                    }}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-mono text-[6.5px] uppercase tracking-[0.22em] text-white/30">
                Recent activity
              </h3>
              <span className="font-mono text-[6px] uppercase tracking-[0.12em] text-white/20">
                {recent.length} signals
              </span>
            </div>
            <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.015]">
              {recent.length === 0 ? (
                <p className="px-3 py-4 text-[8px] leading-relaxed text-white/30">
                  No new signals from this department yet. The simulation will
                  route one here shortly.
                </p>
              ) : (
                recent.map((event, index) => (
                  <div
                    key={event.id}
                    className={`flex items-center gap-2 px-2.5 py-2 ${
                      index > 0 ? "border-t border-white/[0.045]" : ""
                    }`}
                  >
                    <span
                      className="h-1 w-1 shrink-0 rounded-full"
                      style={{
                        background: TONE_COLORS[event.tone],
                        boxShadow: `0 0 5px ${TONE_COLORS[event.tone]}`,
                      }}
                    />
                    <p className="min-w-0 flex-1 truncate font-mono text-[7.5px] uppercase tracking-[0.04em] text-white/60">
                      {event.title}
                    </p>
                    <span className="shrink-0 font-mono text-[6.5px] text-white/20">
                      {relativeTime(event.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-mono text-[6.5px] uppercase tracking-[0.22em] text-white/30">
                Simulated transactions
              </h3>
              <span className="font-mono text-[6px] uppercase tracking-[0.12em] text-white/20">
                Today
              </span>
            </div>
            <div className="space-y-1">
              {profile.transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="group flex items-center justify-between gap-2 rounded-md px-1.5 py-1.5 transition hover:bg-white/[0.025]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[8.5px] text-white/62">
                      {transaction.label}
                    </p>
                    <p className="mt-0.5 font-mono text-[6px] uppercase tracking-[0.12em] text-white/22">
                      {transaction.id} · {transaction.time}
                    </p>
                  </div>
                  <span
                    className="shrink-0 font-mono text-[8.5px] tabular"
                    style={{
                      color:
                        transaction.tone === "positive"
                          ? "#6ee7b7"
                          : transaction.tone === "warning" ||
                              transaction.tone === "critical"
                            ? "#fca5a5"
                            : "rgba(255,255,255,0.55)",
                    }}
                  >
                    {transaction.amount}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-5">
            <h3 className="mb-2 font-mono text-[6.5px] uppercase tracking-[0.22em] text-white/30">
              Connected departments
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {related.map((id) => {
                const relatedDepartment = departmentMap[id];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSelectDepartment(id)}
                    className="flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.02] py-1 pl-1.5 pr-2.5 text-left transition hover:border-brand/30 hover:bg-brand/[0.07]"
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white/[0.08] text-white/45">
                      <DepartmentIcon
                        icon={relatedDepartment.icon}
                        className="h-2 w-2"
                        strokeWidth={1.8}
                      />
                    </span>
                    <span className="font-mono text-[6.5px] uppercase tracking-[0.08em] text-white/50">
                      {relatedDepartment.shortName}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <button
            type="button"
            onClick={onShowActivity}
            className="mt-5 flex w-full items-center justify-between rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 font-mono text-[7px] uppercase tracking-[0.16em] text-white/35 transition hover:border-brand/25 hover:text-brand-soft"
          >
            View live activity
            <ArrowLeft className="h-3 w-3 rotate-180" strokeWidth={1.6} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
