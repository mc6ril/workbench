import type {
  MoveDirection,
  PriorityItem,
} from "@/domains/project-management/presentation/components/prioritiesSettings/PrioritiesSettings.types";

export const renamePriority = (
  priorities: PriorityItem[],
  id: string,
  name: string
): PriorityItem[] => {
  return priorities.map((priority) =>
    priority.id === id ? { ...priority, name } : priority
  );
};

export const movePriority = (
  priorities: PriorityItem[],
  id: string,
  direction: MoveDirection
): PriorityItem[] | null => {
  const sourceIndex = priorities.findIndex((priority) => priority.id === id);
  if (sourceIndex === -1) {
    return null;
  }

  const targetIndex = direction === "up" ? sourceIndex - 1 : sourceIndex + 1;
  if (targetIndex < 0 || targetIndex >= priorities.length) {
    return null;
  }

  const updated = [...priorities];
  const [moved] = updated.splice(sourceIndex, 1);
  updated.splice(targetIndex, 0, moved);
  return updated;
};
