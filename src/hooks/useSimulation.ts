"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { branchMap } from "@/data/mockBranches";
import {
  BASE_EVENT_INTERVAL,
  SimulationEngine,
  nextEventDelay,
} from "@/lib/simulation-engine";
import type {
  BranchId,
  BusinessEvent,
  SimulationCounters,
  SimulationSpeed,
} from "@/types/nexus";

const MAX_EVENTS = 42;

const initialCounters = (branchId: BranchId): SimulationCounters => {
  const branch = branchMap[branchId];
  return {
    activeOrders: 18,
    completedOrders: 142,
    revenue: branch.revenueBase,
    expenses: Math.round(branch.revenueBase * 0.642),
    covers: Math.round(branch.covers * 0.86),
    served: 118,
    eventsProcessed: 0,
    aiSignals: 0,
  };
};

const applyEffects = (
  counters: SimulationCounters,
  event: BusinessEvent,
): SimulationCounters => {
  const effects = event.effects ?? {};
  return {
    activeOrders: Math.max(
      0,
      Math.min(64, counters.activeOrders + (effects.orders ?? 0)),
    ),
    completedOrders: counters.completedOrders + (effects.completed ?? 0),
    revenue: Math.max(0, counters.revenue + (effects.revenue ?? 0)),
    expenses: Math.max(0, counters.expenses + (effects.expense ?? 0)),
    covers: Math.max(0, counters.covers + (effects.covers ?? 0)),
    served: counters.served + (effects.served ?? 0),
    eventsProcessed: counters.eventsProcessed + 1,
    aiSignals: counters.aiSignals + (effects.aiSignals ?? 0),
  };
};

export function useSimulation() {
  const [branchId, setBranchId] = useState<BranchId>("main");
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState<SimulationSpeed>(1);
  const [events, setEvents] = useState<BusinessEvent[]>([]);
  const [counters, setCounters] = useState<SimulationCounters>(() =>
    initialCounters("main"),
  );
  const [latestEvent, setLatestEvent] = useState<BusinessEvent | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [hidden, setHidden] = useState(false);

  const engineRef = useRef<SimulationEngine>(
    new SimulationEngine(branchMap.main),
  );
  const speedRef = useRef<SimulationSpeed>(speed);
  const followUpTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const branch = branchMap[branchId];

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const clearFollowUps = useCallback(() => {
    followUpTimers.current.forEach((timer) => clearTimeout(timer));
    followUpTimers.current.clear();
  }, []);

  const emit = useCallback((event: BusinessEvent) => {
    setEvents((previous) => [event, ...previous].slice(0, MAX_EVENTS));
    setCounters((previous) => applyEffects(previous, event));
    setLatestEvent(event);
  }, []);

  // Rebuild the simulation whenever the branch changes or the user resets it.
  useEffect(() => {
    clearFollowUps();
    engineRef.current = new SimulationEngine(branchMap[branchId]);
    setEvents(engineRef.current.seeds());
    setCounters(initialCounters(branchId));
    setLatestEvent(null);
  }, [branchId, resetKey, clearFollowUps]);

  useEffect(() => {
    if (paused || hidden) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let followTimer: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      timer = setTimeout(() => {
        if (cancelled) return;
        const event = engineRef.current.next();
        emit(event);

        const followUp = engineRef.current.followUp(event);
        if (followUp) {
          followTimer = setTimeout(() => {
            if (cancelled) return;
            const followed = engineRef.current.create(followUp.templateId);
            emit(followed);
            followUpTimers.current.delete(followTimer!);
          }, followUp.delay / speedRef.current);
          followUpTimers.current.add(followTimer);
        }

        schedule();
      }, nextEventDelay(speedRef.current));
    };

    const warmUp = setTimeout(schedule, 2600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearTimeout(followTimer);
      clearTimeout(warmUp);
    };
  }, [paused, hidden, branchId, emit]);

  const togglePaused = useCallback(() => setPaused((value) => !value), []);

  const reset = useCallback(() => {
    setResetKey((key) => key + 1);
    setPaused(false);
  }, []);

  const setBranch = useCallback((id: BranchId) => {
    setBranchId(id);
    setPaused(false);
  }, []);

  const eventsPerMinute = useMemo(
    () => Math.round((60_000 / BASE_EVENT_INTERVAL) * speed),
    [speed],
  );

  const activeEvents = useMemo(() => {
    const cutoff = Date.now() - 60_000;
    return events.filter((event) => event.createdAt >= cutoff).length;
  }, [events]);

  return {
    branch,
    branchId,
    setBranch,
    paused,
    togglePaused,
    setPaused,
    speed,
    setSpeed,
    events,
    counters,
    latestEvent,
    reset,
    resetKey,
    eventsPerMinute,
    activeEvents,
  };
}

export type SimulationState = ReturnType<typeof useSimulation>;
