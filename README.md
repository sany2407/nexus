# ABIELAN NEXUS

A live, full-screen business ecosystem map for the Abielan HoReCa restaurant platform. Thirteen restaurant departments orbit one connected core, with animated flow paths, event particles, live telemetry, and a fully local simulation.

**One connected restaurant ecosystem.**

## Stack

- Next.js 16 App Router + React 19 + TypeScript
- Tailwind CSS v4
- Framer Motion
- Rive (`@rive-app/react-canvas`) with an SVG/CSS fallback
- Lucide icons
- SVG paths + `requestAnimationFrame` particle engine

No backend, database, API, or auth. Everything is simulated in the browser.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000/nexus](http://localhost:3000/nexus). The root route redirects there.

Production build:

```bash
npm run build
npm start
```

## Experience

- **Network map** — 13 department nodes, 36 curved connections, directional arrows, ambient particles, and event-driven bursts.
- **Core hub** — Abielan Restaurant OS core with a Rive orbit and a CSS/SVG fallback.
- **Live simulation** — weighted business events, follow-up events, counters, and a rolling activity stream.
- **Controls** — pause/resume, 0.5×/1×/2×/4× speed, branch switcher, flow filters, reset, fullscreen, and zoom/recentre.
- **Department detail** — operational pulse metrics, recent signals, simulated transactions, and connected departments.
- **Activity panel** — category filters for orders, inventory, finance, and operations (including intelligence signals).
- **Responsive** — desktop split panel, tablet drawer, and mobile compact network with pan, pinch/zoom, and a bottom sheet.

## Structure

```
src/
  app/nexus/page.tsx          Page composition and panel/drawer state
  components/nexus/           Network, hub, nodes, panels, controls, branding
  data/                       Departments, connections, branches, events, metrics
  hooks/                      Simulation, selection, animation, media queries
  lib/                        Simulation engine, geometry, formatting
  types/                      Shared domain types
public/assets/
  abielan-logo.png            Brand mark
  abielan-nexus.riv           Rive orbit asset
rive/nexus-orbit/             Rive source project
```

## Branding

ABIELAN NEXUS · ONE CONNECTED RESTAURANT ECOSYSTEM.  
Powered by Abielan. · [info@abielan.in](mailto:info@abielan.in)
