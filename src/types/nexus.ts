export type DepartmentId =
  | "procurement"
  | "inventory"
  | "menu"
  | "orders"
  | "kitchen"
  | "service"
  | "billing"
  | "customer"
  | "staff"
  | "delivery"
  | "finance"
  | "owner"
  | "ai";

export type WorkflowCategory =
  | "supply"
  | "orders"
  | "finance"
  | "operations"
  | "intelligence";

export type ActivityCategory =
  | "orders"
  | "inventory"
  | "finance"
  | "operations"
  | "intelligence";

export type ActivityFilter = "all" | "orders" | "inventory" | "finance" | "operations";

export type FlowFilter = "all" | WorkflowCategory;

export type BranchId = "main" | "branch-02" | "branch-03";

export type SimulationSpeed = 0.5 | 1 | 2 | 4;

export type Tone = "positive" | "warning" | "critical" | "info" | "neutral";

export type IconKey =
  | "shopping-cart"
  | "boxes"
  | "utensils-crossed"
  | "clipboard-list"
  | "chef-hat"
  | "concierge-bell"
  | "credit-card"
  | "users"
  | "user-cog"
  | "truck"
  | "landmark"
  | "crown"
  | "brain-circuit";

export interface Point {
  x: number;
  y: number;
}

export interface StageLayout {
  width: number;
  height: number;
  nodeWidth: number;
  nodeHeight: number;
  hubSize: number;
}

export interface Department {
  id: DepartmentId;
  index: string;
  name: string;
  shortName: string;
  icon: IconKey;
  category: WorkflowCategory;
  statusLabel: string;
  status: Tone;
  position: Point;
  mobilePosition: Point;
  /** Relative activity weight used by the simulation engine. */
  weight: number;
}

export interface NetworkConnection {
  id: string;
  from: DepartmentId;
  to: DepartmentId;
  label: string;
  flow: WorkflowCategory;
  weight: number;
  curvature: number;
}

export interface Branch {
  id: BranchId;
  name: string;
  shortName: string;
  location: string;
  code: string;
  covers: number;
  revenueBase: number;
  ordersBase: number;
  staffBase: number;
  tables: number;
  growth: number;
}

export interface Transaction {
  id: string;
  label: string;
  amount: string;
  time: string;
  tone: Tone;
}

export interface DepartmentMetric {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  tone?: Tone;
}

export interface DepartmentProfile {
  departmentId: DepartmentId;
  headline: string;
  metrics: DepartmentMetric[];
  transactions: Transaction[];
}

export interface BusinessEvent {
  id: string;
  templateId: string;
  title: string;
  departmentId: DepartmentId;
  category: ActivityCategory;
  createdAt: number;
  tone: Tone;
  connectionId: string | null;
  amount?: number;
  reference?: string;
  effects?: SimulationEffects;
}

export interface SimulationEffects {
  orders?: number;
  completed?: number;
  revenue?: number;
  expense?: number;
  covers?: number;
  served?: number;
  aiSignals?: number;
}

export interface EventTemplate {
  id: string;
  departmentId: DepartmentId;
  category: ActivityCategory;
  weight: number;
  titles: string[];
  tone: Tone;
  connectionId: string | null;
  amountRange?: [number, number];
  refPrefix?: string;
  refBase?: number;
  countsRevenue?: boolean;
  countsExpense?: boolean;
  effects?: SimulationEffects;
  followUp?: {
    templateId: string;
    delay: number;
  };
}

export interface SimulationCounters {
  activeOrders: number;
  completedOrders: number;
  revenue: number;
  expenses: number;
  covers: number;
  served: number;
  eventsProcessed: number;
  aiSignals: number;
}

export interface EdgeGeometry {
  id: string;
  from: DepartmentId;
  to: DepartmentId;
  flow: WorkflowCategory;
  weight: number;
  path: string;
  samples: Point[];
  cumulative: number[];
  length: number;
  start: Point;
  end: Point;
  arrow: Point;
  arrowAngle: number;
  mid: Point;
}

export interface DepartmentPulse {
  departmentId: DepartmentId;
  key: number;
  tone: Tone;
}

export type PanelMode = "activity" | "department";
