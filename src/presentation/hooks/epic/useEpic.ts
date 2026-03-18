import { useQuery } from "@tanstack/react-query";

import { getEpicDetail } from "@/domains/project-management/core/usecases/epic/getEpicDetail";

import {
  boardRepository,
  epicRepository,
} from "@/domains/project-management/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for fetching epic detail by ID.
 */
export const useEpic = (epicId: string) => {
  return useQuery({
    queryKey: queryKeys.epics.detail(epicId),
    queryFn: () => getEpicDetail(epicRepository, boardRepository, epicId),
    enabled: !!epicId,
  });
};
