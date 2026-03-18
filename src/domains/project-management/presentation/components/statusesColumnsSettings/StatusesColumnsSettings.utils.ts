import type {
  MoveDirection,
  StatusColumnItem,
} from "@/domains/project-management/presentation/components/statusesColumnsSettings/StatusesColumnsSettings.types";

export const toggleStatusColumnEnabled = (
  columns: StatusColumnItem[],
  id: string
): StatusColumnItem[] => {
  return columns.map((column) =>
    column.id === id ? { ...column, isEnabled: !column.isEnabled } : column
  );
};

export const renameStatusColumn = (
  columns: StatusColumnItem[],
  id: string,
  name: string
): StatusColumnItem[] => {
  return columns.map((column) => (column.id === id ? { ...column, name } : column));
};

export const moveStatusColumn = (
  columns: StatusColumnItem[],
  id: string,
  direction: MoveDirection
): StatusColumnItem[] | null => {
  const sourceIndex = columns.findIndex((column) => column.id === id);
  if (sourceIndex === -1) {
    return null;
  }

  const targetIndex = direction === "up" ? sourceIndex - 1 : sourceIndex + 1;
  if (targetIndex < 0 || targetIndex >= columns.length) {
    return null;
  }

  const updated = [...columns];
  const [moved] = updated.splice(sourceIndex, 1);
  updated.splice(targetIndex, 0, moved);
  return updated;
};
