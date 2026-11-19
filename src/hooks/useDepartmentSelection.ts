"use client";

import { useCallback, useMemo, useState } from "react";
import { departmentMap } from "@/data/departments";
import { connections } from "@/data/connections";
import type { DepartmentId } from "@/types/nexus";

export function useDepartmentSelection() {
  const [selectedId, setSelectedId] = useState<DepartmentId | null>(null);

  const select = useCallback((id: DepartmentId) => {
    setSelectedId((current) => (current === id ? current : id));
  }, []);

  const clear = useCallback(() => setSelectedId(null), []);

  const selectedDepartment = selectedId ? departmentMap[selectedId] : null;

  const { relatedIds, highlightConnections } = useMemo(() => {
    if (!selectedId) {
      return {
        relatedIds: new Set<DepartmentId>(),
        highlightConnections: new Set<string>(),
      };
    }
    const related = new Set<DepartmentId>();
    const links = new Set<string>();
    for (const connection of connections) {
      if (connection.from === selectedId || connection.to === selectedId) {
        related.add(connection.from);
        related.add(connection.to);
        links.add(connection.id);
      }
    }
    related.delete(selectedId);
    return { relatedIds: related, highlightConnections: links };
  }, [selectedId]);

  return {
    selectedId,
    selectedDepartment,
    select,
    clear,
    relatedIds,
    highlightConnections,
  };
}

export type DepartmentSelection = ReturnType<typeof useDepartmentSelection>;
