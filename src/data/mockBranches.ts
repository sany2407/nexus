import type { Branch, BranchId } from "@/types/nexus";

export const branches: Branch[] = [
  {
    id: "main",
    name: "Main Restaurant",
    shortName: "MAIN",
    location: "Indiranagar, Bengaluru",
    code: "AB-IN-01",
    covers: 186,
    revenueBase: 486420,
    ordersBase: 214,
    staffBase: 28,
    tables: 42,
    growth: 12.4,
  },
  {
    id: "branch-02",
    name: "Restaurant Branch 02",
    shortName: "BRANCH 02",
    location: "Whitefield, Bengaluru",
    code: "AB-WF-02",
    covers: 142,
    revenueBase: 324860,
    ordersBase: 168,
    staffBase: 22,
    tables: 34,
    growth: 8.7,
  },
  {
    id: "branch-03",
    name: "Restaurant Branch 03",
    shortName: "BRANCH 03",
    location: "Koramangala, Bengaluru",
    code: "AB-KR-03",
    covers: 118,
    revenueBase: 268940,
    ordersBase: 141,
    staffBase: 18,
    tables: 28,
    growth: 5.2,
  },
];

export const branchMap = Object.fromEntries(
  branches.map((branch) => [branch.id, branch]),
) as Record<BranchId, Branch>;
