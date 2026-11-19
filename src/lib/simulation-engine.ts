import { eventTemplates, seedBlueprints, templateMap } from "@/data/mockEvents";
import type {
  Branch,
  BranchId,
  BusinessEvent,
  DepartmentId,
  EventTemplate,
} from "@/types/nexus";

const ITEMS = [
  "Paneer",
  "Tomatoes",
  "Basmati Rice",
  "Chicken",
  "Burrata",
  "Sourdough",
  "Butter",
  "Coffee Beans",
  "Prawns",
  "Mushrooms",
];
const TABLES = ["04", "07", "09", "11", "14", "18", "21", "26"];
const STATIONS = ["Grill", "Tandoor", "Wok", "Cold", "Pastry"];
const CHANNELS = ["Dine-in", "Delivery", "Takeaway"];
const TIERS = ["Silver", "Gold", "Platinum"];
const INSIGHTS = ["Combo mix up 6%", "Beverage attach up", "Weekend prep +12%"];
const SCORES = ["4.8 / 5", "5.0 / 5", "4.6 / 5", "4.9 / 5"];

const BRANCH_BIAS: Record<
  BranchId,
  Partial<Record<DepartmentId, number>>
> = {
  main: { orders: 1.12, kitchen: 1.08, billing: 1.08, ai: 1.12 },
  "branch-02": { delivery: 1.3, service: 1.1, inventory: 1.05 },
  "branch-03": { delivery: 1.38, customer: 1.12, staff: 0.92 },
};

let eventSequence = 0;

const pick = <T,>(values: T[], random: () => number) =>
  values[Math.floor(random() * values.length) % values.length];

const randomBetween = (
  [min, max]: [number, number],
  random: () => number,
) => Math.round(min + random() * (max - min));

const refKey = (template: EventTemplate) =>
  template.refPrefix ? `${template.refPrefix}` : "REF-";

export class SimulationEngine {
  private weighted: Array<{ template: EventTemplate; weight: number }>;
  private referenceCounters = new Map<string, number>();
  private scale: number;

  constructor(
    private branch: Branch,
    private random: () => number = Math.random,
  ) {
    this.scale = branch.revenueBase / 486420;
    const bias = BRANCH_BIAS[branch.id] ?? {};
    this.weighted = eventTemplates.map((template) => ({
      template,
      weight: template.weight * (bias[template.departmentId] ?? 1),
    }));
  }

  next(): BusinessEvent {
    const total = this.weighted.reduce((sum, item) => sum + item.weight, 0);
    let roll = this.random() * total;
    for (const item of this.weighted) {
      roll -= item.weight;
      if (roll <= 0) return this.create(item.template.id);
    }
    return this.create("order_created");
  }

  create(templateId: string, overrides: Partial<BusinessEvent> = {}): BusinessEvent {
    const template = templateMap[templateId] ?? eventTemplates[0];
    const reference = this.nextReference(template);
    const numericRef = reference.replace(/^[A-Z]+-/, "");
    const title = this.formatTitle(
      pick(template.titles, this.random),
      numericRef,
    );
    const amount = template.amountRange
      ? Math.round(randomBetween(template.amountRange, this.random) * this.scale)
      : undefined;

    const effects = { ...(template.effects ?? {}) };
    if (template.countsRevenue && amount) {
      effects.revenue = (effects.revenue ?? 0) + amount;
    }
    if (template.countsExpense && amount) {
      effects.expense = (effects.expense ?? 0) + amount;
    }

    eventSequence += 1;
    return {
      id: `evt_${Date.now().toString(36)}_${eventSequence}`,
      templateId: template.id,
      title,
      departmentId: template.departmentId,
      category: template.category,
      createdAt: Date.now(),
      tone: template.tone,
      connectionId: template.connectionId,
      amount,
      reference,
      effects,
      ...overrides,
    };
  }

  seeds(): BusinessEvent[] {
    const now = Date.now();
    return seedBlueprints.map((blueprint) =>
      this.create(blueprint.templateId, {
        createdAt: now - blueprint.ageMs,
        ...blueprint.overrides,
      }),
    );
  }

  followUp(event: BusinessEvent): { templateId: string; delay: number } | null {
    const template = templateMap[event.templateId];
    return template?.followUp ?? null;
  }

  private nextReference(template: EventTemplate) {
    if (!template.refPrefix) {
      return `REF-${Math.floor(this.random() * 9000 + 1000)}`;
    }
    const key = refKey(template);
    const current =
      this.referenceCounters.get(key) ?? (template.refBase ?? 1000);
    const next = current + 1;
    this.referenceCounters.set(key, next);
    return `${template.refPrefix}${next}`;
  }

  private formatTitle(title: string, numericRef: string) {
    return title
      .replace(/\{ref\}/g, numericRef)
      .replace(/\{item\}/g, pick(ITEMS, this.random))
      .replace(/\{table\}/g, pick(TABLES, this.random))
      .replace(/\{station\}/g, pick(STATIONS, this.random))
      .replace(/\{channel\}/g, pick(CHANNELS, this.random))
      .replace(/\{tier\}/g, pick(TIERS, this.random))
      .replace(/\{insight\}/g, pick(INSIGHTS, this.random))
      .replace(/\{score\}/g, pick(SCORES, this.random));
  }
}

export const BASE_EVENT_INTERVAL = 3000;

export const nextEventDelay = (speed: number) => {
  const jitter = 0.72 + Math.random() * 0.72;
  return Math.max(320, (BASE_EVENT_INTERVAL * jitter) / speed);
};
