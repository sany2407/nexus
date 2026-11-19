"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, X } from "lucide-react";
import { ActivityPanel } from "@/components/nexus/ActivityPanel";
import { DepartmentDetailPanel } from "@/components/nexus/DepartmentDetailPanel";
import { EcosystemCanvas } from "@/components/nexus/EcosystemCanvas";
import { NexusFooter } from "@/components/nexus/NexusFooter";
import { NexusHeader } from "@/components/nexus/NexusHeader";
import { useDepartmentSelection } from "@/hooks/useDepartmentSelection";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSimulation } from "@/hooks/useSimulation";
import type {
  ActivityFilter,
  DepartmentId,
  FlowFilter,
} from "@/types/nexus";

type PanelView = "activity" | "department";

export default function NexusPage() {
  const simulation = useSimulation();
  const selection = useDepartmentSelection();
  const desktop = useMediaQuery("(min-width: 1024px)");
  const { select, clear, selectedId, selectedDepartment } = selection;

  const [flowFilter, setFlowFilter] = useState<FlowFilter>("all");
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all");
  const [panelView, setPanelView] = useState<PanelView>("activity");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openActivity = useCallback(() => {
    setPanelView("activity");
    if (!desktop) setDrawerOpen(true);
  }, [desktop]);

  const handleSelectDepartment = useCallback(
    (id: DepartmentId) => {
      select(id);
      setPanelView("department");
      if (!desktop) setDrawerOpen(true);
    },
    [select, desktop],
  );

  const handleClearSelection = useCallback(() => {
    clear();
    setPanelView("activity");
  }, [clear]);

  useEffect(() => {
    if (desktop) setDrawerOpen(false);
  }, [desktop]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (selectedId) {
        clear();
        setPanelView("activity");
        return;
      }
      if (drawerOpen) setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectedId, clear, drawerOpen]);

  const panel =
    panelView === "department" && selectedDepartment ? (
      <DepartmentDetailPanel
        department={selectedDepartment}
        branch={simulation.branch}
        counters={simulation.counters}
        events={simulation.events}
        onClose={handleClearSelection}
        onShowActivity={openActivity}
        onSelectDepartment={handleSelectDepartment}
      />
    ) : (
      <ActivityPanel
        events={simulation.events}
        counters={simulation.counters}
        branch={simulation.branch}
        paused={simulation.paused}
        filter={activityFilter}
        onFilterChange={setActivityFilter}
        onSelectDepartment={handleSelectDepartment}
      />
    );

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-void text-white">
      <NexusHeader
        branchId={simulation.branchId}
        onBranchChange={simulation.setBranch}
        paused={simulation.paused}
        onTogglePaused={simulation.togglePaused}
        speed={simulation.speed}
        onSpeedChange={simulation.setSpeed}
        activeEvents={simulation.activeEvents}
        eventsPerMinute={simulation.eventsPerMinute}
        onOpenActivity={openActivity}
      />

      <div className="relative flex min-h-0 flex-1">
        <main className="relative min-w-0 flex-1">
          <EcosystemCanvas
            simulation={simulation}
            selection={selection}
            flowFilter={flowFilter}
            onFlowChange={setFlowFilter}
            onSelectDepartment={handleSelectDepartment}
            onClearSelection={handleClearSelection}
            onResetSimulation={simulation.reset}
          />
        </main>

        <aside className="relative hidden w-[356px] shrink-0 flex-col overflow-hidden border-l border-white/[0.06] bg-[#090c11]/72 backdrop-blur-xl lg:flex xl:w-[392px]">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent"
          />
          <div className="flex min-h-0 w-full flex-1 flex-col">{panel}</div>
        </aside>
      </div>

      <NexusFooter />

      <AnimatePresence>
        {drawerOpen && !desktop && (
          <motion.div
            key="nexus-drawer"
            className="fixed inset-0 z-[70] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="absolute inset-0 bg-black/65 backdrop-blur-[3px]"
              onClick={() => setDrawerOpen(false)}
              aria-hidden
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={
                panelView === "department"
                  ? "Department detail"
                  : "Live activity"
              }
              initial={{ opacity: 0, y: 42 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 bottom-0 flex h-[78dvh] flex-col overflow-hidden rounded-t-2xl border-t border-white/[0.1] bg-[#0a0d12]/[0.985] shadow-[0_-30px_80px_-20px_rgba(0,0,0,0.95)] md:inset-y-0 md:left-auto md:right-0 md:h-full md:w-[400px] md:rounded-none md:border-l md:border-t-0"
            >
              <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-white/15 md:hidden" />
              <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/[0.055] px-4">
                <span className="flex items-center gap-2 font-mono text-[6.5px] uppercase tracking-[0.22em] text-white/35">
                  <Activity
                    className="h-2.5 w-2.5 text-brand-soft/70"
                    strokeWidth={1.6}
                  />
                  {panelView === "department"
                    ? "Department detail"
                    : "Live activity"}
                </span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close panel"
                  className="flex h-6 w-6 items-center justify-center rounded-md text-white/35 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <X className="h-3 w-3" strokeWidth={1.8} />
                </button>
              </div>
              <div className="min-h-0 flex-1">{panel}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
