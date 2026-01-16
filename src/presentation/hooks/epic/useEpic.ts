import { useQuery } from "@tanstack/react-query";

import { getEpicDetail } from "@/core/usecases/epic/getEpicDetail";

import { epicRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for fetching epic detail by ID.
 */
export const useEpic = (epicId: string) => {
  return useQuery({
    queryKey: queryKeys.epics.detail(epicId),
    queryFn: () => getEpicDetail(epicRepository, epicId),
    enabled: !!epicId,
  });
};

