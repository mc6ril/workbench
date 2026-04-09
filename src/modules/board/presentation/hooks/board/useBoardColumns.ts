"use client";

import { useMemo } from "react";

import { useTranslations } from "@/shared/i18n";

import type { ColumnWorkflowState } from "@/modules/board/core/domain/board.types";
import type { BoardColumnConfig } from "@/modules/board/presentation/types/boardView.types";
import { getBoardColumnDisplayName } from "@/modules/board/presentation/utils/columnI18n";

type BoardConfigurationLike = {
  columns?: {
    id: string;
    name: string;
    key?: string;
    state?: ColumnWorkflowState;
    visible?: boolean;
  }[];
} | null;

export const useBoardColumns = (
  boardConfiguration?: BoardConfigurationLike
) => {
  const tColumns = useTranslations("pages.board.columns");

  const columns = useMemo<BoardColumnConfig[]>(() => {
    return (
      boardConfiguration?.columns?.map((column) => ({
        id: column.id,
        title: getBoardColumnDisplayName(column, tColumns),
        key: column.key,
        state: column.state!,
        isVisible: column.visible,
      })) ?? []
    );
  }, [boardConfiguration, tColumns]);

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
