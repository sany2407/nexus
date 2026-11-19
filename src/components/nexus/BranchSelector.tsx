"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { branches } from "@/data/mockBranches";
import type { BranchId } from "@/types/nexus";

interface BranchSelectorProps {
  branchId: BranchId;
  onChange: (branchId: BranchId) => void;
}

export function BranchSelector({ branchId, onChange }: BranchSelectorProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = branches.find((branch) => branch.id === branchId) ?? branches[0];

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Select branch. Current: ${current.name}`}
        className="group flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-2.5 text-left transition hover:border-white/15 hover:bg-white/[0.045]"
      >
        <span className="hidden flex-col leading-none sm:flex">
          <span className="font-mono text-[6.5px] uppercase tracking-[0.2em] text-brand-soft/70">
            {current.code}
          </span>
          <span className="mt-1 max-w-[148px] truncate text-[10px] font-medium tracking-wide text-white/85">
            {current.name}
          </span>
        </span>
        <span className="flex flex-col leading-none sm:hidden">
          <span className="font-mono text-[6.5px] uppercase tracking-[0.16em] text-brand-soft/70">
            BRANCH
          </span>
          <span className="mt-1 text-[9px] font-medium tracking-wide text-white/85">
            {current.shortName}
          </span>
        </span>
        <ChevronDown
          className={`h-3 w-3 text-white/35 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={1.8}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-full z-[80] mt-2 w-[270px] overflow-hidden rounded-xl border border-white/[0.09] bg-[#0a0d12]/96 p-1.5 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.95)] backdrop-blur-2xl"
            role="listbox"
            aria-label="Restaurant branches"
          >
            <div className="px-2.5 pb-2 pt-1.5 font-mono text-[7px] uppercase tracking-[0.22em] text-white/30">
              Active location
            </div>
            {branches.map((branch) => {
              const active = branch.id === branchId;
              return (
                <button
                  key={branch.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(branch.id);
                    setOpen(false);
                  }}
                  className={`group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition ${
                    active ? "bg-brand/10" : "hover:bg-white/[0.045]"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${
                      active
                        ? "border-brand/35 bg-brand/15 text-brand-soft"
                        : "border-white/10 bg-white/[0.03] text-white/35"
                    }`}
                  >
                    {active ? (
                      <Check className="h-3.5 w-3.5" strokeWidth={2} />
                    ) : (
                      <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span
                        className={`truncate text-[11px] font-medium ${
                          active ? "text-white" : "text-white/75"
                        }`}
                      >
                        {branch.name}
                      </span>
                      <span className="shrink-0 font-mono text-[6.5px] tracking-[0.15em] text-white/25">
                        {branch.code}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-[9px] text-white/35">
                      {branch.location}
                    </span>
                  </span>
                </button>
              );
            })}
            <div className="mx-2 mt-1 flex items-center justify-between border-t border-white/[0.06] px-0.5 pb-1 pt-2 font-mono text-[6.5px] uppercase tracking-[0.16em] text-white/25">
              <span>Simulated branch data</span>
              <span className="text-brand-soft/60">Live</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
