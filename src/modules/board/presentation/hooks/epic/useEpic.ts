import { useQuery } from "@tanstack/react-query";

import { getEpicDetail } from "@/modules/board/core/usecases/epic/getEpicDetail";
import {
  boardRepository,
  epicRepository,
} from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

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
