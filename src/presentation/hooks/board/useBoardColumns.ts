"use client";

import { useMemo } from "react";

import type { BoardColumnConfig } from "@/shared/types/board";

type BoardConfigurationLike = {
  columns?: {
    id: string;
    name: string;
    status?: string;
    visible?: boolean;
  }[];
} | null;

export const useBoardColumns = (boardConfiguration?: BoardConfigurationLike) => {
  const columns = useMemo<BoardColumnConfig[]>(() => {
    return (
      boardConfiguration?.columns?.map((column) => ({
        id: column.id,
        title: column.name,
        status: column.status,
        isVisible: column.visible,
      })) ?? []
    );
  }, [boardConfiguration]);

  const columnById = useMemo(() => {
    const map = new Map<string, BoardColumnConfig>();
    for (const column of columns) {
      map.set(column.id, column);
    }
    return map;
  }, [columns]);

  return {
    columns,
    columnById,
  };
};
