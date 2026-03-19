import type { EpicWithProgress } from "@/domains/project-management/core/domain/schema/epic.schema";
import type {
  EpicProgressFilter,
  EpicSortField,
} from "@/domains/project-management/core/domain/types";

import type { SortDirection } from "@/shared/types";

export const filterEpicsBySearch = (
  epics: EpicWithProgress[],
  search: string
): EpicWithProgress[] => {
  const term = search.trim().toLowerCase();
  if (term === "") {
    return epics;
  }

  return epics.filter((epic) => {
    const nameMatch = epic.name.toLowerCase().includes(term);
    const descriptionMatch =
      epic.description != null && epic.description.toLowerCase().includes(term);
    return nameMatch || descriptionMatch;
  });
};

export const filterEpicsByProgress = (
  epics: EpicWithProgress[],
  progressFilter: EpicProgressFilter
): EpicWithProgress[] => {
  if (progressFilter === "all") {
    return epics;
  }

  if (progressFilter === "notStarted") {
    return epics.filter((epic) => epic.progress <= 0);
  }

  if (progressFilter === "completed") {
    return epics.filter((epic) => epic.progress >= 100);
  }

  return epics.filter((epic) => epic.progress > 0 && epic.progress < 100);
};

export const sortEpics = (
  epics: EpicWithProgress[],
  field: EpicSortField,
  direction: SortDirection
): EpicWithProgress[] => {
  const ordered = [...epics].sort((a, b) => {
    if (field === "name") {
      return a.name.localeCompare(b.name);
    }
    if (field === "progress") {
      return a.progress - b.progress;
    }

    const left = field === "createdAt" ? a.createdAt : a.updatedAt;
    const right = field === "createdAt" ? b.createdAt : b.updatedAt;
    return left.getTime() - right.getTime();
  });

  return direction === "asc" ? ordered : ordered.reverse();
};
