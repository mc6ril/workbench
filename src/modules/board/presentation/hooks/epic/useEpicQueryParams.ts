import { useMemo } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";

import type { SortDirection } from "@/shared/types";

import {
  EPIC_PROGRESS_FILTER_VALUES,
  EPIC_SORT_FIELD_VALUES,
  SORT_DIRECTION_VALUES,
} from "@/modules/board/constants/filterSort";
import type {
  EpicProgressFilter,
  EpicSortField,
} from "@/modules/board/core/domain/types";

const parseEpicProgressFilter = (value: string | null): EpicProgressFilter => {
  if (
    value === EPIC_PROGRESS_FILTER_VALUES.ALL ||
    value === EPIC_PROGRESS_FILTER_VALUES.NOT_STARTED ||
    value === EPIC_PROGRESS_FILTER_VALUES.IN_PROGRESS ||
    value === EPIC_PROGRESS_FILTER_VALUES.COMPLETED
  ) {
    return value;
  }

  return EPIC_PROGRESS_FILTER_VALUES.ALL;
};

const parseEpicSortField = (value: string | null): EpicSortField => {
  if (
    value === EPIC_SORT_FIELD_VALUES.NAME ||
    value === EPIC_SORT_FIELD_VALUES.CREATED_AT ||
    value === EPIC_SORT_FIELD_VALUES.UPDATED_AT ||
    value === EPIC_SORT_FIELD_VALUES.PROGRESS
  ) {
    return value;
  }

  return EPIC_SORT_FIELD_VALUES.UPDATED_AT;
};

const parseSortDirection = (value: string | null): SortDirection => {
  if (
    value === SORT_DIRECTION_VALUES.ASC ||
    value === SORT_DIRECTION_VALUES.DESC
  ) {
    return value;
  }

  return SORT_DIRECTION_VALUES.DESC;
};

export const useEpicQueryParams = (searchParams: ReadonlyURLSearchParams) => {
  return useMemo(() => {
    return {
      epicProgressFilter: parseEpicProgressFilter(
        searchParams.get("epicProgress")
      ),
      epicSortField: parseEpicSortField(searchParams.get("epicSortField")),
      epicSortDirection: parseSortDirection(
        searchParams.get("epicSortDirection")
      ),
    };
  }, [searchParams]);
};
