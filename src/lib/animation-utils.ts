import { departmentMap, departments } from "@/data/departments";
import type {
  DepartmentId,
  EdgeGeometry,
  NetworkConnection,
  Point,
  StageLayout,
  Tone,
  WorkflowCategory,
} from "@/types/nexus";

export const DESKTOP_STAGE: StageLayout = {
  width: 1200,
  height: 820,
  nodeWidth: 180,
  nodeHeight: 58,
  hubSize: 236,
};

export const MOBILE_STAGE: StageLayout = {
  width: 420,
  height: 780,
  nodeWidth: 92,
  nodeHeight: 58,
  hubSize: 142,
};

export const getStageLayout = (mobile: boolean) =>
  mobile ? MOBILE_STAGE : DESKTOP_STAGE;

export const getHubPoint = (mobile: boolean): Point =>
  mobile ? { x: 210, y: 380 } : { x: 600, y: 410 };

export const getNodePoint = (id: DepartmentId, mobile: boolean): Point => {
  const department = departmentMap[id];
  return mobile ? department.mobilePosition : department.position;
};

export const getNodePositions = (mobile: boolean) =>
  Object.fromEntries(
    departments.map((department) => [
      department.id,
      mobile ? department.mobilePosition : department.position,
    ]),
  ) as Record<DepartmentId, Point>;

/** Point where a ray from the centre of a rectangle exits its boundary. */
export const rectangleAnchor = (
  center: Point,
  toward: Point,
  halfWidth: number,
  halfHeight: number,
  pad = 0,
): Point => {
  const dx = toward.x - center.x;
  const dy = toward.y - center.y;
  if (dx === 0 && dy === 0) return center;
  const scaleX = dx === 0 ? Number.POSITIVE_INFINITY : (halfWidth + pad) / Math.abs(dx);
  const scaleY = dy === 0 ? Number.POSITIVE_INFINITY : (halfHeight + pad) / Math.abs(dy);
  const scale = Math.min(scaleX, scaleY);
  return { x: center.x + dx * scale, y: center.y + dy * scale };
};

const distanceToSegment = (point: Point, a: Point, b: Point) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return Math.hypot(point.x - a.x, point.y - a.y);
  let t = ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy));
};

const quadraticPoint = (a: Point, control: Point, b: Point, t: number): Point => {
  const inv = 1 - t;
  return {
    x: inv * inv * a.x + 2 * inv * t * control.x + t * t * b.x,
    y: inv * inv * a.y + 2 * inv * t * control.y + t * t * b.y,
  };
};

export const buildEdgeGeometry = (
  connection: NetworkConnection,
  mobile: boolean,
  hubPoint: Point,
): EdgeGeometry => {
  const layout = getStageLayout(mobile);
  const halfWidth = layout.nodeWidth / 2;
  const halfHeight = layout.nodeHeight / 2;

  const fromCenter = getNodePoint(connection.from, mobile);
  const toCenter = getNodePoint(connection.to, mobile);

  const start = rectangleAnchor(fromCenter, toCenter, halfWidth, halfHeight, 5);
  const end = rectangleAnchor(toCenter, fromCenter, halfWidth, halfHeight, 9);

  const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy) || 1;
  const normal = { x: -dy / distance, y: dx / distance };

  let bend = connection.curvature * distance;

  // Keep long cross-connections from running through the central hub.
  const hubRadius = layout.hubSize / 2 + 30;
  if (distanceToSegment(hubPoint, start, end) < hubRadius) {
    const away = {
      x: mid.x - hubPoint.x,
      y: mid.y - hubPoint.y,
    };
    const side = away.x * normal.x + away.y * normal.y >= 0 ? 1 : -1;
    bend += side * (hubRadius + 46);
  }

  const control = {
    x: mid.x + normal.x * bend,
    y: mid.y + normal.y * bend,
  };

  const path = `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} Q ${control.x.toFixed(
    2,
  )} ${control.y.toFixed(2)} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;

  const steps = 56;
  const samples: Point[] = [];
  const cumulative: number[] = [];
  let length = 0;

  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps;
    const point = quadraticPoint(start, control, end, t);
    if (index > 0) {
      length += Math.hypot(point.x - samples[index - 1].x, point.y - samples[index - 1].y);
    }
    samples.push(point);
    cumulative.push(length);
  }

  const arrowT = 0.9;
  const arrow = quadraticPoint(start, control, end, arrowT);
  const arrowAhead = quadraticPoint(start, control, end, Math.min(1, arrowT + 0.02));
  const arrowAngle =
    Number(
      (
        (Math.atan2(arrowAhead.y - arrow.y, arrowAhead.x - arrow.x) * 180) /
        Math.PI
      ).toFixed(2),
    ) || 0;

  return {
    id: connection.id,
    from: connection.from,
    to: connection.to,
    flow: connection.flow,
    weight: connection.weight,
    path,
    samples,
    cumulative,
    length,
    start,
    end,
    arrow,
    arrowAngle,
    mid: quadraticPoint(start, control, end, 0.5),
  };
};

export const pointAtProgress = (geometry: EdgeGeometry, progress: number): Point => {
  const { samples, cumulative, length } = geometry;
  if (!samples.length) return { x: 0, y: 0 };
  const target = Math.max(0, Math.min(1, progress)) * length;
  let low = 0;
  let high = cumulative.length - 1;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (cumulative[mid] < target) low = mid + 1;
    else high = mid;
  }
  const index = Math.max(1, low);
  const before = cumulative[index - 1];
  const segment = cumulative[index] - before || 1;
  const t = (target - before) / segment;
  const a = samples[index - 1];
  const b = samples[index];
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
};

export const FLOW_COLORS: Record<WorkflowCategory, string> = {
  supply: "#FF6B72",
  orders: "#FF414B",
  finance: "#F20D18",
  operations: "#FF8A8F",
  intelligence: "#FFC2C5",
};

export const TONE_COLORS: Record<Tone, string> = {
  positive: "#34D399",
  warning: "#FBBF24",
  critical: "#FF414B",
  info: "#60A5FA",
  neutral: "#8B93A3",
};

export const TONE_BG: Record<Tone, string> = {
  positive: "rgba(52, 211, 153, 0.12)",
  warning: "rgba(251, 191, 36, 0.12)",
  critical: "rgba(255, 65, 75, 0.14)",
  info: "rgba(96, 165, 250, 0.12)",
  neutral: "rgba(139, 147, 163, 0.12)",
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
