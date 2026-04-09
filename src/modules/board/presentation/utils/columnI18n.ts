import type { Column } from "@/modules/board/core/domain/board.types";
import { normalizeColumnKey } from "@/modules/board/core/domain/columnKey.policy";

type Translator = {
  (key: string): string;
  has(key: string): boolean;
};

type ColumnDisplayNameSource = Pick<Column, "name"> &
  Partial<Pick<Column, "key">>; // key is optional because it can be null

export const getBoardColumnDisplayName = (
  column: ColumnDisplayNameSource,
  tColumns: Translator
): string => {
  const normalizedKey = column.key ? normalizeColumnKey(column.key) : null;

  if (normalizedKey && tColumns.has(normalizedKey)) {
    return tColumns(normalizedKey);
  }

  return column.name;
};
