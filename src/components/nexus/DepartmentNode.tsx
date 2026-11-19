"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { DepartmentIcon } from "@/components/nexus/DepartmentIcon";
import { TONE_COLORS } from "@/lib/animation-utils";
import type { Department, Point, Tone } from "@/types/nexus";

interface DepartmentNodeProps {
  department: Department;
  point: Point;
  width: number;
  height: number;
  mobile: boolean;
  selected: boolean;
  related: boolean;
  dimmed: boolean;
  pulse?: { key: number; tone: Tone };
  onSelect: (department: Department) => void;
}

function DepartmentNodeComponent({
  department,
  point,
  width,
  height,
  mobile,
  selected,
  related,
  dimmed,
  pulse,
  onSelect,
}: DepartmentNodeProps) {
  const statusColor = TONE_COLORS[department.status];

  return (
    <button
      type="button"
      data-node
      data-department={department.id}
      aria-pressed={selected}
      aria-label={`${department.name} — ${department.statusLabel}`}
      title={department.statusLabel}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(department);
      }}
      onPointerDown={(event) => event.stopPropagation()}
      style={{
        left: point.x - width / 2,
        top: point.y - height / 2,
        width,
        height,
      }}
      className={[
        "group/department absolute z-20 flex overflow-visible rounded-[12px] text-left outline-none transition-[opacity,transform,filter,box-shadow,border-color] duration-500",
        mobile
          ? "flex-col items-center justify-center gap-1 bg-[#0a0d12]/88 px-1 py-1.5"
          : "items-center gap-2.5 bg-[#0b0e13]/88 px-2.5",
        "border backdrop-blur-md",
        selected
          ? "z-30 border-brand/70 bg-[#101015]/95"
          : related
            ? "border-brand/30 bg-[#0c0f15]/92"
            : "border-white/[0.075] hover:border-brand/35",
        dimmed ? "opacity-30 saturate-50" : "opacity-100",
        "hover:-translate-y-0.5 hover:border-brand/45",
      ].join(" ")}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[12px]"
        style={{
          background: selected
            ? "radial-gradient(120% 160% at 12% 50%, rgba(242,13,24,0.18) 0%, transparent 62%)"
            : related
              ? "radial-gradient(120% 160% at 12% 50%, rgba(242,13,24,0.1) 0%, transparent 65%)"
              : "radial-gradient(120% 160% at 12% 50%, rgba(242,13,24,0.055) 0%, transparent 70%)",
          boxShadow: selected
            ? "0 0 0 1px rgba(255,65,75,0.18), 0 0 34px rgba(242,13,24,0.22), inset 0 1px 0 rgba(255,255,255,0.09)"
            : related
              ? "0 0 24px rgba(242,13,24,0.10), inset 0 1px 0 rgba(255,255,255,0.06)"
              : "inset 0 1px 0 rgba(255,255,255,0.055), 0 12px 30px -18px rgba(0,0,0,0.9)",
        }}
      />

      {selected && (
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          viewBox={`0 0 ${width} ${height}`}
        >
          <rect
            x="0.6"
            y="0.6"
            width={width - 1.2}
            height={height - 1.2}
            rx="11.4"
            fill="none"
            stroke="#ff414b"
            strokeWidth="1"
            strokeDasharray="5 7"
            className="animate-dash"
            opacity="0.85"
          />
        </svg>
      )}

      {pulse && (
        <motion.span
          key={pulse.key}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[12px]"
          initial={{ opacity: 0.85, scale: 1 }}
          animate={{ opacity: 0, scale: 1.16 }}
          transition={{ duration: 1.15, ease: "easeOut" }}
          style={{
            boxShadow: `0 0 0 1px ${TONE_COLORS[pulse.tone]}, 0 0 30px rgba(242,13,24,0.5)`,
          }}
        />
      )}

      <span
        className={[
          "relative z-10 flex shrink-0 items-center justify-center rounded-[8px] border border-brand/20 text-brand-soft transition-colors duration-500",
          selected ? "text-[#ff6b72]" : "group-hover/department:text-[#ff6b72]",
          mobile ? "h-6 w-6" : "h-[30px] w-[30px]",
        ].join(" ")}
        style={{
          background:
            "linear-gradient(145deg, rgba(242,13,24,0.16) 0%, rgba(242,13,24,0.035) 100%)",
          boxShadow: selected
            ? "0 0 16px rgba(242,13,24,0.35), inset 0 1px 0 rgba(255,255,255,0.1)"
            : "inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <DepartmentIcon
          icon={department.icon}
          className={mobile ? "h-3 w-3" : "h-[15px] w-[15px]"}
          strokeWidth={1.7}
        />
      </span>

      <span
        className={[
          "relative z-10 min-w-0 font-display font-medium uppercase text-white/90",
          mobile
            ? "max-w-full text-center text-[7.5px] leading-[1.15] tracking-[0.045em]"
            : "flex-1 text-[9px] leading-[1.25] tracking-[0.075em]",
        ].join(" ")}
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {department.name}
      </span>

      <span
        aria-label={department.statusLabel}
        className="absolute right-1.5 top-1.5 z-20 flex h-2 w-2 items-center justify-center"
      >
        {department.status === "positive" && (
          <span
            aria-hidden
            className="absolute inline-flex h-full w-full animate-ping-soft rounded-full"
            style={{ background: statusColor, opacity: 0.35 }}
          />
        )}
        <span
          className="relative inline-flex h-[5px] w-[5px] rounded-full"
          style={{
            background: statusColor,
            boxShadow: `0 0 8px ${statusColor}`,
          }}
        />
      </span>

      {selected && (
        <span className="pointer-events-none absolute -inset-px rounded-[12px] shadow-[0_0_0_1px_rgba(255,65,75,0.25)]" />
      )}
    </button>
  );
}

export const DepartmentNode = memo(DepartmentNodeComponent);
DepartmentNode.displayName = "DepartmentNode";
