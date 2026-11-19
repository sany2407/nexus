"use client";

import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { useNetworkAnimation } from "@/hooks/useNetworkAnimation";
import {
  FLOW_COLORS,
  getNodePoint,
  getStageLayout,
  rectangleAnchor,
} from "@/lib/animation-utils";
import type {
  DepartmentId,
  EdgeGeometry,
  FlowFilter,
  Point,
  Tone,
} from "@/types/nexus";
import { departments } from "@/data/departments";

const AMBIENT_COUNT = 30;
const EVENT_COUNT = 20;

export interface NetworkApi {
  burst: (edgeId: string | null, tone?: Tone) => void;
}

interface NetworkConnectionsProps {
  geometries: EdgeGeometry[];
  selectedId: DepartmentId | null;
  highlightConnections: Set<string>;
  relatedIds: Set<DepartmentId>;
  flowFilter: FlowFilter;
  paused: boolean;
  speed: number;
  mobile: boolean;
  stageWidth: number;
  stageHeight: number;
  hub: Point;
}

const spokeColor = (active: boolean, selected: boolean) => {
  if (selected) return "#ff414b";
  if (active) return "rgba(255,120,128,0.32)";
  return "rgba(148,163,184,0.14)";
};

export const NetworkConnections = memo(
  forwardRef<NetworkApi, NetworkConnectionsProps>(function NetworkConnections(
    {
      geometries,
      selectedId,
      highlightConnections,
      relatedIds,
      flowFilter,
      paused,
      speed,
      mobile,
      stageWidth,
      stageHeight,
      hub,
    },
    ref,
  ) {
    const layout = getStageLayout(mobile);
    const ambientRefs = useRef<Array<SVGCircleElement | null>>([]);
    const eventCoreRefs = useRef<Array<SVGCircleElement | null>>([]);
    const eventHaloRefs = useRef<Array<SVGCircleElement | null>>([]);
    const pulseRefs = useRef<Map<string, SVGPathElement>>(new Map());

    const { burst } = useNetworkAnimation({
      geometries,
      paused,
      speed,
      ambientRefs,
      eventCoreRefs,
      eventHaloRefs,
      pulseRefs,
    });

    useImperativeHandle(ref, () => ({ burst }), [burst]);

    useEffect(() => {
      const map = pulseRefs.current;
      return () => {
        map.clear();
      };
    }, []);

    const spokes = useMemo(
      () =>
        departments.map((department) => {
          const node = getNodePoint(department.id, mobile);
          const start = rectangleAnchor(
            hub,
            node,
            layout.hubSize / 2,
            layout.hubSize / 2,
            2,
          );
          const end = rectangleAnchor(
            node,
            hub,
            layout.nodeWidth / 2,
            layout.nodeHeight / 2,
            7,
          );
          const active =
            flowFilter === "all" ||
            department.category === flowFilter ||
            department.id === "ai" ||
            department.id === "owner";
          const selected =
            selectedId === department.id || relatedIds.has(department.id);
          return { id: department.id, start, end, active, selected };
        }),
      [hub, mobile, layout, flowFilter, selectedId, relatedIds],
    );

    return (
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox={`0 0 ${stageWidth} ${stageHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="edge-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="edge-fade">
            <stop offset="0%" stopColor="#ff414b" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#ff414b" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ff414b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Central platform spokes */}
        <g>
          {spokes.map((spoke) => (
            <line
              key={`spoke-${spoke.id}`}
              x1={spoke.start.x}
              y1={spoke.start.y}
              x2={spoke.end.x}
              y2={spoke.end.y}
              stroke={spokeColor(spoke.active, spoke.selected)}
              strokeWidth={spoke.selected ? 1.1 : 0.7}
              strokeDasharray="1 8"
              strokeLinecap="round"
              opacity={spoke.active ? 0.9 : 0.4}
            />
          ))}
        </g>

        {/* Business connections */}
        <g>
          {geometries.map((edge) => {
            const selected = highlightConnections.has(edge.id);
            const filterActive =
              flowFilter === "all" || edge.flow === flowFilter;
            const dimmed = selectedId
              ? !selected
              : flowFilter !== "all"
                ? !filterActive
                : false;
            const color = FLOW_COLORS[edge.flow];
            const opacity = dimmed ? 0.11 : selected ? 0.85 : filterActive ? 0.34 : 0.2;
            return (
              <g key={edge.id}>
                <path
                  d={edge.path}
                  fill="none"
                  stroke="rgba(148,163,184,0.16)"
                  strokeWidth={0.8}
                  opacity={dimmed ? 0.3 : 0.55}
                />
                <path
                  d={edge.path}
                  fill="none"
                  stroke={color}
                  strokeWidth={selected ? 1.7 : 1}
                  strokeLinecap="round"
                  opacity={opacity}
                  filter={selected ? "url(#edge-glow)" : undefined}
                />
                {edge.weight >= 3 && (
                  <path
                    d={edge.path}
                    fill="none"
                    stroke={selected ? "#ffd9db" : color}
                    strokeWidth={selected ? 1.1 : 0.8}
                    strokeLinecap="round"
                    strokeDasharray="1.5 13"
                    className="animate-dash"
                    opacity={dimmed ? 0.06 : selected ? 0.8 : filterActive ? 0.36 : 0.1}
                    style={{ animationDuration: `${10 + edge.weight}s` }}
                  />
                )}
                <path
                  ref={(element) => {
                    if (element) {
                      pulseRefs.current.set(edge.id, element);
                    } else {
                      pulseRefs.current.delete(edge.id);
                    }
                  }}
                  d={edge.path}
                  fill="none"
                  stroke="#ff6b72"
                  strokeWidth={2.6}
                  strokeLinecap="round"
                  filter="url(#edge-glow)"
                  strokeOpacity={0}
                />
                {edge.weight >= 3 && (
                  <path
                    d="M -4.2 -2.4 L 4.2 0 L -4.2 2.4 Z"
                    transform={`translate(${edge.arrow.x} ${edge.arrow.y}) rotate(${edge.arrowAngle})`}
                    fill={color}
                    opacity={dimmed ? 0.12 : selected ? 0.95 : filterActive ? 0.42 : 0.2}
                    suppressHydrationWarning
                  />
                )}
              </g>
            );
          })}
        </g>

        {/* Ambient flow particles */}
        <g>
          {Array.from({ length: AMBIENT_COUNT }).map((_, index) => (
            <circle
              key={`ambient-${index}`}
              ref={(element) => {
                ambientRefs.current[index] = element;
              }}
              r={index % 5 === 0 ? 1.7 : 1.15}
              fill={index % 4 === 0 ? "#ffd0d3" : "#ff6b72"}
              style={{ opacity: 0 }}
            />
          ))}
        </g>

        {/* Event-driven particles */}
        <g>
          {Array.from({ length: EVENT_COUNT }).map((_, index) => (
            <circle
              key={`event-halo-${index}`}
              ref={(element) => {
                eventHaloRefs.current[index] = element;
              }}
              r={9}
              fill="#ff414b"
              style={{ opacity: 0 }}
            />
          ))}
          {Array.from({ length: EVENT_COUNT }).map((_, index) => (
            <circle
              key={`event-core-${index}`}
              ref={(element) => {
                eventCoreRefs.current[index] = element;
              }}
              r={2.5}
              fill="#ffe3e5"
              style={{ opacity: 0 }}
            />
          ))}
        </g>
      </svg>
    );
  }),
);

NetworkConnections.displayName = "NetworkConnections";
