"use client";

import { useCallback, useEffect, useRef } from "react";
import { pointAtProgress } from "@/lib/animation-utils";
import type { EdgeGeometry, Tone } from "@/types/nexus";

const AMBIENT_COUNT = 30;
const EVENT_COUNT = 20;

interface AmbientParticle {
  edgeIndex: number;
  t: number;
  velocity: number;
  radius: number;
  opacity: number;
}

interface EventParticle {
  active: boolean;
  edgeIndex: number;
  t: number;
  velocity: number;
  startAt: number;
  radius: number;
  color: string;
}

interface NetworkState {
  ambient: AmbientParticle[];
  events: EventParticle[];
  weighted: number[];
  pulses: Map<string, number>;
  running: boolean;
}

const eventColor = (tone: Tone) => {
  switch (tone) {
    case "critical":
      return "#ffd6d8";
    case "warning":
      return "#ffe1c2";
    case "positive":
      return "#fff0f1";
    default:
      return "#ffdfe1";
  }
};

const createState = (geometries: EdgeGeometry[]): NetworkState => {
  const weighted = geometries.map((geometry) => Math.max(0.8, geometry.weight));
  return {
    ambient: Array.from({ length: AMBIENT_COUNT }, () => ({
      edgeIndex: Math.floor(Math.random() * geometries.length),
      t: Math.random(),
      velocity: 0.026 + Math.random() * 0.05,
      radius: 0.9 + Math.random() * 1.1,
      opacity: 0.22 + Math.random() * 0.42,
    })),
    events: Array.from({ length: EVENT_COUNT }, () => ({
      active: false,
      edgeIndex: 0,
      t: 0,
      velocity: 0.7,
      startAt: 0,
      radius: 2.1,
      color: "#ffdfe1",
    })),
    weighted,
    pulses: new Map(),
    running: false,
  };
};

const pickWeighted = (state: NetworkState) => {
  const total = state.weighted.reduce((sum, weight) => sum + weight, 0);
  let roll = Math.random() * total;
  for (let index = 0; index < state.weighted.length; index += 1) {
    roll -= state.weighted[index];
    if (roll <= 0) return index;
  }
  return 0;
};

interface UseNetworkAnimationArgs {
  geometries: EdgeGeometry[];
  paused: boolean;
  speed: number;
  ambientRefs: React.RefObject<Array<SVGCircleElement | null>>;
  eventCoreRefs: React.RefObject<Array<SVGCircleElement | null>>;
  eventHaloRefs: React.RefObject<Array<SVGCircleElement | null>>;
  pulseRefs: React.RefObject<Map<string, SVGPathElement>>;
  enabled?: boolean;
}

export function useNetworkAnimation({
  geometries,
  paused,
  speed,
  ambientRefs,
  eventCoreRefs,
  eventHaloRefs,
  pulseRefs,
  enabled = true,
}: UseNetworkAnimationArgs) {
  const stateRef = useRef<NetworkState>(
    typeof window === "undefined"
      ? { ambient: [], events: [], weighted: [], pulses: new Map(), running: false }
      : createState(geometries),
  );
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => {
    stateRef.current = createState(geometries);
    ambientRefs.current.forEach((element) => {
      if (element) element.style.opacity = "0";
    });
    eventCoreRefs.current.forEach((element) => {
      if (element) element.style.opacity = "0";
    });
    eventHaloRefs.current.forEach((element) => {
      if (element) element.style.opacity = "0";
    });
    pulseRefs.current.forEach((element) => {
      element.style.strokeOpacity = "0";
    });
  }, [geometries, ambientRefs, eventCoreRefs, eventHaloRefs, pulseRefs]);

  const burst = useCallback(
    (edgeId: string | null, tone: Tone = "info") => {
      if (!edgeId) return;
      const state = stateRef.current;
      const edgeIndex = geometries.findIndex((geometry) => geometry.id === edgeId);
      if (edgeIndex < 0) return;

      const pulse = pulseRefs.current.get(edgeId);
      if (pulse) {
        state.pulses.set(edgeId, performance.now());
        pulse.style.strokeOpacity = "0.8";
      }

      let spawned = 0;
      const count = 3 + Math.floor(Math.random() * 3);
      for (const particle of state.events) {
        if (particle.active || spawned >= count) continue;
        particle.active = true;
        particle.edgeIndex = edgeIndex;
        particle.t = 0;
        particle.velocity = 0.62 + Math.random() * 0.4;
        particle.startAt = performance.now() + spawned * 55;
        particle.radius = 1.9 + Math.random() * 1.2;
        particle.color = eventColor(tone);
        spawned += 1;
      }
    },
    [geometries, pulseRefs],
  );

  useEffect(() => {
    if (!enabled) {
      const state = stateRef.current;
      ambientRefs.current.forEach((element) => {
        if (element) element.style.opacity = "0";
      });
      eventCoreRefs.current.forEach((element) => {
        if (element) element.style.opacity = "0";
      });
      eventHaloRefs.current.forEach((element) => {
        if (element) element.style.opacity = "0";
      });
      void state;
      return;
    }
    if (paused || geometries.length === 0) return;
    const state = stateRef.current;
    state.running = true;
    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      if (!state.running) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      const multiplier = speedRef.current;

      for (let index = 0; index < state.ambient.length; index += 1) {
        const particle = state.ambient[index];
        const geometry = geometries[particle.edgeIndex];
        const element = ambientRefs.current[index];
        if (!geometry || !element) continue;

        particle.t += particle.velocity * multiplier * dt;
        if (particle.t >= 1) {
          particle.edgeIndex = pickWeighted(state);
          particle.t = Math.random() * 0.12;
          particle.velocity = 0.026 + Math.random() * 0.05;
        }
        const point = pointAtProgress(geometry, particle.t);
        const fade = Math.min(1, particle.t * 7) * Math.min(1, (1 - particle.t) * 7);
        element.setAttribute("cx", point.x.toFixed(2));
        element.setAttribute("cy", point.y.toFixed(2));
        element.style.opacity = (particle.opacity * fade).toFixed(3);
      }

      for (let index = 0; index < state.events.length; index += 1) {
        const particle = state.events[index];
        const core = eventCoreRefs.current[index];
        const halo = eventHaloRefs.current[index];
        if (!core || !halo) continue;
        if (!particle.active || now < particle.startAt) {
          core.style.opacity = "0";
          halo.style.opacity = "0";
          continue;
        }

        const geometry = geometries[particle.edgeIndex];
        if (!geometry) continue;
        particle.t += particle.velocity * multiplier * dt;
        if (particle.t >= 1) {
          particle.active = false;
          core.style.opacity = "0";
          halo.style.opacity = "0";
          continue;
        }

        const point = pointAtProgress(geometry, particle.t);
        const fadeIn = Math.min(1, particle.t * 10);
        const fadeOut = Math.min(1, (1 - particle.t) * 6);
        const alpha = fadeIn * fadeOut;
        core.setAttribute("cx", point.x.toFixed(2));
        core.setAttribute("cy", point.y.toFixed(2));
        core.setAttribute("r", particle.radius.toFixed(2));
        core.setAttribute("fill", particle.color);
        core.style.opacity = alpha.toFixed(3);

        halo.setAttribute("cx", point.x.toFixed(2));
        halo.setAttribute("cy", point.y.toFixed(2));
        halo.setAttribute("r", (particle.radius * 4.4).toFixed(2));
        halo.style.opacity = (alpha * 0.24).toFixed(3);
      }

      state.pulses.forEach((startedAt, edgeId) => {
        const element = pulseRefs.current.get(edgeId);
        if (!element) {
          state.pulses.delete(edgeId);
          return;
        }
        const age = (now - startedAt) / 1300;
        if (age >= 1) {
          element.style.strokeOpacity = "0";
          state.pulses.delete(edgeId);
          return;
        }
        const opacity = Math.sin(Math.PI * age) * 0.85;
        element.style.strokeOpacity = opacity.toFixed(3);
      });

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      state.running = false;
      cancelAnimationFrame(raf);
    };
  }, [
    paused,
    enabled,
    geometries,
    ambientRefs,
    eventCoreRefs,
    eventHaloRefs,
    pulseRefs,
  ]);

  return { burst };
}

export type NetworkAnimation = ReturnType<typeof useNetworkAnimation>;
