import type {
  Branch,
  DepartmentId,
  DepartmentProfile,
  SimulationCounters,
  Tone,
  Transaction,
} from "@/types/nexus";
import { inr, inrCompact, num } from "@/lib/format";

const tx = (
  id: string,
  label: string,
  amount: string,
  time: string,
  tone: Tone = "neutral",
): Transaction => ({ id, label, amount, time, tone });

export function getDepartmentProfile(
  departmentId: DepartmentId,
  branch: Branch,
  counters?: SimulationCounters,
): DepartmentProfile {
  const f = branch.revenueBase / 486420;
  const money = (value: number) => inr(Math.round(value * f));
  const revenue = counters?.revenue ?? branch.revenueBase;
  const expenses = counters?.expenses ?? Math.round(branch.revenueBase * 0.642);
  const net = Math.max(0, revenue - expenses);
  const activeOrders = 18 + (counters?.activeOrders ?? 0);
  const completed = 142 + (counters?.completedOrders ?? 0);
  const covers = Math.round(branch.covers * 0.86) + (counters?.served ?? 0);
  const stockValue = Math.round(1_260_000 * f);

  switch (departmentId) {
    case "procurement":
      return {
        departmentId,
        headline: "Supplier network purchasing with live lead-time tracking.",
        metrics: [
          { label: "Open POs", value: num(12 + (counters?.aiSignals ?? 0) % 3), delta: "+2", trend: "up", tone: "info" },
          { label: "Active suppliers", value: num(Math.round(38 * f)), delta: "98%", trend: "flat" },
          { label: "Avg lead time", value: "2.4d", delta: "-0.3d", trend: "up", tone: "positive" },
          { label: "PO value", value: inrCompact(184000 * f), delta: "+6.2%", trend: "up" },
        ],
        transactions: [
          tx("PO-4821", "Fresh produce · Namdhari", money(28400), "09:42", "positive"),
          tx("PO-4820", "Dairy consignment · Akshayakalpa", money(18250), "09:18"),
          tx("GRN-1092", "Goods received · Dry store", money(42100), "08:56", "positive"),
          tx("PO-4819", "Seafood · Coastal Catch", money(32750), "08:31"),
        ],
      };
    case "inventory":
      return {
        departmentId,
        headline: "Live stock positions, transfers and wastage across stores.",
        metrics: [
          { label: "Total stock items", value: num(Math.round(1248 * f)), delta: "+18", trend: "up" },
          { label: "Low stock items", value: num(7 + (counters?.aiSignals ?? 0) % 3), delta: "3 critical", trend: "down", tone: "warning" },
          { label: "Pending GRNs", value: "4", delta: "2 due", trend: "flat", tone: "info" },
          { label: "Stock value", value: inrCompact(stockValue), delta: "+2.4%", trend: "up", tone: "positive" },
        ],
        transactions: [
          tx("STK-8841", "Tomato · 12.4 kg consumed", money(620), "09:48", "warning"),
          tx("GRN-1091", "Dry store replenished", money(15800), "09:32", "positive"),
          tx("TRF-2204", "Transfer → Kitchen", money(3400), "09:11"),
          tx("WST-0412", "Wastage recorded · Bakery", money(780), "08:47", "critical"),
        ],
      };
    case "menu":
      return {
        departmentId,
        headline: "Recipe economics and menu availability in one live model.",
        metrics: [
          { label: "Active dishes", value: num(Math.round(86 * (0.9 + f * 0.1))), delta: "+3", trend: "up" },
          { label: "Avg margin", value: "68.4%", delta: "+1.2%", trend: "up", tone: "positive" },
          { label: "Menu sync", value: "100%", delta: "Healthy", trend: "flat", tone: "positive" },
          { label: "Cost inflation", value: "2.1%", delta: "Dairy", trend: "down", tone: "warning" },
        ],
        transactions: [
          tx("RCP-3021", "Butter chicken · cost refresh", "₹186 / plate", "09:40", "positive"),
          tx("MNU-1180", "Seasonal special published", "₹420", "09:12"),
          tx("RCP-3019", "Sourdough · yield update", "₹74 / loaf", "08:58"),
          tx("MNU-1179", "Out of stock · Burrata", "86'd", "08:34", "warning"),
        ],
      };
    case "orders":
      return {
        departmentId,
        headline: "Every order captured, routed and reconciled in real time.",
        metrics: [
          { label: "Active orders", value: num(activeOrders), delta: `${Math.max(2, Math.round(activeOrders * 0.18))} in kitchen`, trend: "up", tone: "positive" },
          { label: "Completed today", value: num(completed), delta: "+12.6%", trend: "up" },
          { label: "Pending", value: num(Math.max(2, Math.round(activeOrders * 0.22))), delta: "Within SLA", trend: "flat" },
          { label: "Avg order value", value: inr(Math.round(1240 * f)), delta: "+4.8%", trend: "up", tone: "positive" },
        ],
        transactions: [
          tx("ORD-1025", "Dine-in · Table 14", inr(Math.round(1860 * f)), "09:52", "positive"),
          tx("ORD-1024", "Delivery · Swiggy", inr(Math.round(940 * f)), "09:49"),
          tx("ORD-1023", "Dine-in · Table 07", inr(Math.round(2480 * f)), "09:46"),
          tx("ORD-1022", "Takeaway · Counter", inr(Math.round(620 * f)), "09:41"),
        ],
      };
    case "kitchen":
      return {
        departmentId,
        headline: "Station load and preparation flow across the pass.",
        metrics: [
          { label: "Active preparation", value: num(9 + (counters?.activeOrders ?? 0) % 4), delta: "+2", trend: "up", tone: "warning" },
          { label: "Orders ready", value: num(3 + (counters?.served ?? 0) % 2), delta: "On pass", trend: "flat", tone: "positive" },
          { label: "Avg prep time", value: "11.4m", delta: "-0.8m", trend: "up", tone: "positive" },
          { label: "Station load", value: "78%", delta: "Grill", trend: "down", tone: "warning" },
        ],
        transactions: [
          tx("KOT-7721", "Table 14 · Main course", "Fired", "09:51", "positive"),
          tx("KOT-7720", "Table 07 · Starters", "Prep", "09:48", "warning"),
          tx("KOT-7719", "Delivery · Biryani", "Ready", "09:44", "positive"),
          tx("KOT-7718", "Table 11 · Dessert", "Queued", "09:39"),
        ],
      };
    case "service":
      return {
        departmentId,
        headline: "Floor intelligence for covers, turns and guest experience.",
        metrics: [
          { label: "Active tables", value: num(Math.round(branch.tables * 0.58)), delta: `${Math.round(branch.tables * 0.21)} seated`, trend: "up" },
          { label: "Covers served", value: num(covers), delta: "+8.2%", trend: "up", tone: "positive" },
          { label: "Avg table turn", value: "46m", delta: "-3m", trend: "up", tone: "positive" },
          { label: "Service score", value: "4.8", delta: "+0.1", trend: "up", tone: "positive" },
        ],
        transactions: [
          tx("SRV-2241", "Waiter assigned · Table 14", "Rahul", "09:50", "positive"),
          tx("SRV-2240", "Food served · Table 07", "On time", "09:47"),
          tx("SRV-2239", "Guest request · Table 11", "Allergy", "09:44", "warning"),
          tx("SRV-2238", "Table reset · 09", "2m", "09:38"),
        ],
      };
    case "billing":
      return {
        departmentId,
        headline: "Unified billing, payments and settlement across channels.",
        metrics: [
          { label: "Payments received", value: inrCompact(revenue * 0.92), delta: "+9.4%", trend: "up", tone: "positive" },
          { label: "Avg ticket", value: inr(Math.round(1386 * f)), delta: "+4.8%", trend: "up" },
          { label: "Refunds", value: "1", delta: "₹340", trend: "flat", tone: "warning" },
          { label: "Settlement", value: "96%", delta: "T+1", trend: "flat", tone: "info" },
        ],
        transactions: [
          tx("TXN-8841", "UPI · Table 14", money(1860), "09:52", "positive"),
          tx("TXN-8840", "Card · Table 07", money(2480), "09:47", "positive"),
          tx("TXN-8839", "UPI · Delivery", money(940), "09:44"),
          tx("TXN-8838", "Refund · Table 12", money(340), "09:21", "warning"),
        ],
      };
    case "customer":
      return {
        departmentId,
        headline: "Guest identity, loyalty and behavioural segments.",
        metrics: [
          { label: "Total guests", value: num(Math.round(1284 * f)), delta: "+64", trend: "up", tone: "positive" },
          { label: "Repeat rate", value: "42.6%", delta: "+2.1%", trend: "up", tone: "positive" },
          { label: "Avg visits", value: "3.4", delta: "Lifetime", trend: "flat" },
          { label: "Guest NPS", value: "71", delta: "+4", trend: "up", tone: "positive" },
        ],
        transactions: [
          tx("CRM-5521", "Loyalty tier upgrade", "Gold", "09:48", "positive"),
          tx("CRM-5520", "Preference captured", "Jain", "09:32"),
          tx("CRM-5519", "Win-back campaign sent", "126 guests", "09:10", "info"),
          tx("CRM-5518", "Birthday offer", "₹250", "08:52"),
        ],
      };
    case "staff":
      return {
        departmentId,
        headline: "Roster, attendance and labour cost for every shift.",
        metrics: [
          { label: "On shift", value: num(Math.round(branch.staffBase * 0.93)), delta: "3 stations", trend: "flat" },
          { label: "Attendance", value: "96.2%", delta: "+1.4%", trend: "up", tone: "positive" },
          { label: "Labour cost", value: "18.4%", delta: "-0.6%", trend: "up", tone: "positive" },
          { label: "Open shifts", value: "3", delta: "Tonight", trend: "flat", tone: "warning" },
        ],
        transactions: [
          tx("STF-1180", "Shift started · Kitchen", "8 staff", "09:00", "positive"),
          tx("STF-1179", "Waiter assigned · Table 14", "Rahul", "09:50"),
          tx("STF-1178", "Swap approved · Bar", "Aarav ↔ Meera", "09:22", "info"),
          tx("STF-1177", "Overtime flagged", "1.5h", "08:58", "warning"),
        ],
      };
    case "delivery":
      return {
        departmentId,
        headline: "Dispatch, routing and rider performance in one view.",
        metrics: [
          { label: "Active deliveries", value: num(4 + (counters?.activeOrders ?? 0) % 3), delta: "+1", trend: "up", tone: "info" },
          { label: "Avg route time", value: "18m", delta: "-2m", trend: "up", tone: "positive" },
          { label: "On-time rate", value: "94%", delta: "+1.8%", trend: "up", tone: "positive" },
          { label: "Rider score", value: "4.7", delta: "+0.1", trend: "up" },
        ],
        transactions: [
          tx("DLV-3410", "Dispatched · Rider Arjun", "2.4 km", "09:49", "positive"),
          tx("DLV-3409", "Delivered · Indiranagar", "18m", "09:38", "positive"),
          tx("DLV-3408", "Route optimised · 3 stops", "-4m", "09:24", "info"),
          tx("DLV-3407", "Handoff → Service", "Picked up", "09:16"),
        ],
      };
    case "finance":
      return {
        departmentId,
        headline: "Revenue, cost and margin rolling up continuously.",
        metrics: [
          { label: "Daily revenue", value: inrCompact(revenue), delta: "+12.4%", trend: "up", tone: "positive" },
          { label: "Expenses", value: inrCompact(expenses), delta: "+3.2%", trend: "down", tone: "warning" },
          { label: "Net profit", value: inrCompact(net), delta: "35.8%", trend: "up", tone: "positive" },
          { label: "Payments received", value: inrCompact(revenue * 0.92), delta: "96%", trend: "up" },
        ],
        transactions: [
          tx("FIN-7210", "Revenue posted · Dine-in", money(84600), "09:52", "positive"),
          tx("FIN-7209", "Supplier invoice · Dairy", money(-18250), "09:18", "warning"),
          tx("FIN-7208", "Delivery settlement", money(12400), "09:05", "positive"),
          tx("FIN-7207", "Payroll accrual", money(-28600), "08:40"),
        ],
      };
    case "owner":
      return {
        departmentId,
        headline: "A single decision surface for the entire restaurant.",
        metrics: [
          { label: "Daily revenue", value: inrCompact(revenue), delta: "+12.4%", trend: "up", tone: "positive" },
          { label: "Net margin", value: "35.8%", delta: "+1.6%", trend: "up", tone: "positive" },
          { label: "Covers today", value: num(covers), delta: `${branch.covers} target`, trend: "up" },
          { label: "Open alerts", value: "3", delta: "1 critical", trend: "down", tone: "warning" },
        ],
        transactions: [
          tx("OWN-1180", "Revenue vs target", "104%", "09:52", "positive"),
          tx("OWN-1179", "Low stock escalation", "3 items", "09:36", "warning"),
          tx("OWN-1178", "AI demand brief ready", "Read", "09:12", "info"),
          tx("OWN-1177", "Branch benchmark", `${branch.shortName} · #1`, "08:58", "positive"),
        ],
      };
    case "ai":
    default:
      return {
        departmentId: "ai",
        headline: "Predictive intelligence reading every operational signal.",
        metrics: [
          { label: "Forecast accuracy", value: "94.2%", delta: "+2.4%", trend: "up", tone: "positive" },
          { label: "Signals today", value: num(38 + (counters?.aiSignals ?? 0)), delta: "+11", trend: "up" },
          { label: "Stock predictions", value: num(6 + (counters?.aiSignals ?? 0) % 2), delta: "2 urgent", trend: "down", tone: "warning" },
          { label: "Revenue uplift", value: inrCompact(42000 * f), delta: "+3.6%", trend: "up", tone: "positive" },
        ],
        transactions: [
          tx("AI-9041", "Demand forecast · Dinner", "94.2%", "09:50", "positive"),
          tx("AI-9040", "Low stock prediction · Paneer", "6h", "09:42", "warning"),
          tx("AI-9039", "Sales insight · Combo mix", "+3.6%", "09:18", "positive"),
          tx("AI-9038", "Wastage anomaly · Bakery", "-₹780", "08:55", "info"),
        ],
      };
  }
}
