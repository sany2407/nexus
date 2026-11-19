"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, X } from "lucide-react";
import { AmbientField } from "@/components/nexus/AmbientField";
import { CentralHub } from "@/components/nexus/CentralHub";
import { DepartmentIcon } from "@/components/nexus/DepartmentIcon";
import { DepartmentNode } from "@/components/nexus/DepartmentNode";
import {
  NetworkConnections,
  type NetworkApi,
} from "@/components/nexus/NetworkConnections";
import { NexusControls } from "@/components/nexus/NexusControls";
import { connections, connectionMap } from "@/data/connections";
import { departments } from "@/data/departments";
import { useIsMobile } from "@/hooks/useMediaQuery";
import type { DepartmentSelection } from "@/hooks/useDepartmentSelection";
import type { SimulationState } from "@/hooks/useSimulation";
import {
  buildEdgeGeometry,
  clamp,
  getHubPoint,
  getStageLayout,
} from "@/lib/animation-utils";
import type {
  Department,
  DepartmentId,
  FlowFilter,
  Point,
  Tone,
} from "@/types/nexus";

interface PulseMap {
  [key: string]: { key: number; tone: Tone } | undefined;
}

interface EcosystemCanvasProps {
  simulation: SimulationState;
  selection: DepartmentSelection;
  flowFilter: FlowFilter;
  onFlowChange: (filter: FlowFilter) => void;
  onSelectDepartment: (id: DepartmentId) => void;
  onClearSelection: () => void;
  onResetSimulation: () => void;
}

export function EcosystemCanvas({
  simulation,
  selection,
  flowFilter,
  onFlowChange,
  onSelectDepartment,
  onClearSelection,
  onResetSimulation,
}: EcosystemCanvasProps) {
  const mobile = useIsMobile(false);
  const stage = getStageLayout(mobile);
  const hub = useMemo(() => getHubPoint(mobile), [mobile]);
  const networkRef = useRef<NetworkApi>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<{
    pointers: Map<number, Point>;
    startPan: Point;
    startZoom: number;
    startDistance: number;
    moved: boolean;
  }>({
    pointers: new Map(),
    startPan: { x: 0, y: 0 },
    startZoom: 1,
    startDistance: 0,
    moved: false,
  });

  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [pulses, setPulses] = useState<PulseMap>({});
  const pulseKeyRef = useRef(0);
  const previousPointer = useRef<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  });

  const geometries = useMemo(
    () =>
      connections.map((connection) =>
        buildEdgeGeometry(connection, mobile, hub),
      ),
    [mobile, hub],
  );

  const filterDepartments = useMemo(() => {
    if (flowFilter === "all") return null;
    const set = new Set<DepartmentId>(["ai", "owner"]);
    for (const connection of connections) {
      if (connection.flow === flowFilter) {
        set.add(connection.from);
        set.add(connection.to);
      }
    }
    return set;
  }, [flowFilter]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) setViewport({ width: rect.width, height: rect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [mobile]);

  const availableWidth = viewport.width - (mobile ? 12 : 56);
  const availableHeight = viewport.height - (mobile ? 74 : 106);
  const fit = Math.min(
    availableWidth > 0 ? availableWidth / stage.width : 0.8,
    availableHeight > 0 ? availableHeight / stage.height : 0.8,
  );
  const baseScale = Number.isFinite(fit) && fit > 0 ? Math.min(fit, 1.16) : 0.8;
  const scale = baseScale * zoom;

  const zoomIn = useCallback(
    () => setZoom((value) => clamp(value * 1.18, 0.45, 2.8)),
    [],
  );
  const zoomOut = useCallback(
    () => setZoom((value) => clamp(value / 1.18, 0.45, 2.8)),
    [],
  );
  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Native wheel listener so trackpad pinch (ctrl + wheel) can scale the map.
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      setZoom((value) =>
        clamp(value * (1 - event.deltaY * 0.0016), 0.45, 2.8),
      );
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, []);

  // Drive the particle burst and department pulse from the latest event.
  useEffect(() => {
    const event = simulation.latestEvent;
    if (!event) return;
    networkRef.current?.burst(event.connectionId, event.tone);
    const connection = event.connectionId
      ? connectionMap[event.connectionId]
      : undefined;
    const ids = new Set<DepartmentId>([event.departmentId]);
    if (connection) {
      ids.add(connection.from);
      ids.add(connection.to);
    }
    pulseKeyRef.current += 1;
    const key = pulseKeyRef.current;
    setPulses((previous) => {
      const next: PulseMap = { ...previous };
      ids.forEach((id) => {
        next[id] = { key, tone: event.tone };
      });
      return next;
    });
  }, [simulation.latestEvent]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full touch-none overflow-hidden"
      onPointerDown={(event) => {
        if (
          (event.target as HTMLElement).closest(
            "button, a, input, select, [data-node]",
          )
        )
          return;
        const gesture = gestureRef.current;
        const element = containerRef.current;
        if (!element) return;
        element.setPointerCapture(event.pointerId);
        gesture.pointers.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY,
        });
        gesture.moved = false;
        if (gesture.pointers.size === 1) {
          gesture.startPan = pan;
          gesture.startZoom = zoom;
        }
        if (gesture.pointers.size === 2) {
          const [a, b] = [...gesture.pointers.values()];
          gesture.startDistance = Math.hypot(a.x - b.x, a.y - b.y);
          gesture.startZoom = zoom;
          gesture.startPan = pan;
        }
        previousPointer.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerMove={(event) => {
        const gesture = gestureRef.current;
        if (!gesture.pointers.has(event.pointerId)) return;
        gesture.pointers.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY,
        });

        if (gesture.pointers.size === 1) {
          const point = gesture.pointers.get(event.pointerId)!;
          const previous = previousPointer.current;
          if (previous.x !== null && previous.y !== null) {
            const dx = point.x - previous.x;
            const dy = point.y - previous.y;
            if (Math.abs(dx) + Math.abs(dy) > 2) gesture.moved = true;
            if (gesture.moved) {
              setPan((current) => ({ x: current.x + dx, y: current.y + dy }));
            }
          }
          previousPointer.current = { x: point.x, y: point.y };
        } else if (gesture.pointers.size === 2) {
          const [a, b] = [...gesture.pointers.values()];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (gesture.startDistance > 0) {
            setZoom(
              clamp(
                gesture.startZoom * (distance / gesture.startDistance),
                0.45,
                2.8,
              ),
            );
          }
          gesture.moved = true;
        }
      }}
      onPointerUp={(event) => {
        const gesture = gestureRef.current;
        const tracked = gesture.pointers.has(event.pointerId);
        gesture.pointers.delete(event.pointerId);
        if (!tracked) return;
        if (gesture.pointers.size === 0) {
          previousPointer.current = { x: null, y: null };
          if (!gesture.moved) {
            const target = event.target as HTMLElement;
            if (!target.closest("[data-node]")) onClearSelection();
          }
        } else if (gesture.pointers.size === 1) {
          // A pinch just became a single-finger pan: rebase so it does not jump.
          const remaining = [...gesture.pointers.values()][0];
          previousPointer.current = { x: remaining.x, y: remaining.y };
          gesture.moved = true;
        }
      }}
      onPointerCancel={(event) => {
        const gesture = gestureRef.current;
        gesture.pointers.delete(event.pointerId);
        previousPointer.current = { x: null, y: null };
      }}
    >
      {/* Background atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 48%, rgba(242,13,24,0.075) 0%, rgba(9,11,16,0) 62%), radial-gradient(ellipse 90% 80% at 50% 50%, #0a0d12 0%, #080a0e 70%)",
        }}
      />
      <div aria-hidden className="grid-backdrop pointer-events-none absolute inset-0" />
      <AmbientField paused={simulation.paused} />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[42%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[90px]"
        style={{
          background:
            "radial-gradient(circle, rgba(242,13,24,0.22), transparent 68%)",
        }}
      />
      <div aria-hidden className="noise pointer-events-none absolute inset-0" />

      {/* Stage */}
      <div
        className="absolute left-1/2 top-1/2 origin-center"
        style={{
          width: stage.width,
          height: stage.height,
          transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transition: "none",
        }}
      >
        <NetworkConnections
          ref={networkRef}
          geometries={geometries}
          selectedId={selection.selectedId}
          highlightConnections={selection.highlightConnections}
          relatedIds={selection.relatedIds}
          flowFilter={flowFilter}
          paused={simulation.paused}
          speed={simulation.speed}
          mobile={mobile}
          stageWidth={stage.width}
          stageHeight={stage.height}
          hub={hub}
        />

        {departments.map((department: Department) => {
          const selected = selection.selectedId === department.id;
          const related = selection.relatedIds.has(department.id);
          const dimmed = selection.selectedId
            ? !selected && !related
            : filterDepartments
              ? !filterDepartments.has(department.id)
              : false;
          return (
            <DepartmentNode
              key={department.id}
              department={department}
              point={mobile ? department.mobilePosition : department.position}
              width={stage.nodeWidth}
              height={stage.nodeHeight}
              mobile={mobile}
              selected={selected}
              related={related}
              dimmed={dimmed}
              pulse={pulses[department.id]}
              onSelect={(node) => onSelectDepartment(node.id)}
            />
          );
        })}

        <CentralHub
          position={hub}
          size={stage.hubSize}
          paused={simulation.paused}
          hasSelection={Boolean(selection.selectedId)}
          onClear={onClearSelection}
        />
      </div>

      {/* Top-left map label */}
      <div className="pointer-events-none absolute left-3 top-3 z-30 sm:left-5 sm:top-5">
        <div className="flex items-center gap-2">
          <span className="h-px w-5 bg-gradient-to-r from-brand to-transparent" />
          <span className="font-mono text-[6.5px] uppercase tracking-[0.24em] text-white/40">
            Live topology
          </span>
        </div>
        <p className="mt-1.5 font-mono text-[6px] uppercase tracking-[0.16em] text-white/20">
          {departments.length} departments · {connections.length} links · 1 core
        </p>
      </div>

      {/* Branch coordinates */}
      <div className="pointer-events-none absolute bottom-[62px] right-4 z-30 hidden text-right font-mono text-[6px] uppercase leading-relaxed tracking-[0.18em] text-white/18 sm:block">
        <p>{simulation.branch.shortName} / {simulation.branch.code}</p>
        <p>12°58′N 77°38′E · grid active</p>
      </div>

      {/* Selection banner */}
      <AnimatePresence>
        {selection.selectedDepartment && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="pointer-events-auto absolute left-1/2 top-12 z-40 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-brand/25 bg-[#0b0d12]/88 py-1 pl-1.5 pr-1 backdrop-blur-xl sm:top-5"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-brand/25 bg-brand/10 text-brand-soft">
              <DepartmentIcon
                icon={selection.selectedDepartment.icon}
                className="h-2.5 w-2.5"
                strokeWidth={1.7}
              />
            </span>
            <span className="truncate font-mono text-[6.5px] uppercase tracking-[0.18em] text-white/55">
              Focus · {selection.selectedDepartment.name}
            </span>
            <button
              type="button"
              onClick={onClearSelection}
              aria-label="Clear department focus"
              className="flex h-5 w-5 items-center justify-center rounded-full text-white/35 transition hover:bg-white/[0.06] hover:text-white"
            >
              <X className="h-2.5 w-2.5" strokeWidth={1.7} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interaction hint */}
      {!selection.selectedId && (
        <div className="pointer-events-none absolute bottom-[62px] left-1/2 z-30 hidden -translate-x-1/2 items-center gap-1.5 font-mono text-[6px] uppercase tracking-[0.2em] text-white/22 lg:flex">
          <Crosshair className="h-2.5 w-2.5" strokeWidth={1.5} />
          Select a department to trace its flow
        </div>
      )}

      <NexusControls
        flowFilter={flowFilter}
        onFlowChange={onFlowChange}
        zoom={zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetView={resetView}
        onResetSimulation={onResetSimulation}
      />
    </div>
  );
}
