import { useQuery } from "@tanstack/react-query";

import type { BoardConfiguration } from "@/modules/board/core/domain/board.types";
import { getBoardConfiguration } from "@/modules/board/core/usecases/board/getBoardConfiguration";
import { boardRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

/**
 * Hook for fetching the board configuration (board + columns) for a project.
 */
export const useBoardConfiguration = (
  projectId: string,
  options?: {
    enabled?: boolean;
    initialData?: BoardConfiguration;
  }
) => {
  return useQuery<BoardConfiguration>({
    queryKey: queryKeys.projects.boardConfiguration(projectId),
    queryFn: () => getBoardConfiguration(boardRepository, projectId),
    enabled: !!projectId && (options?.enabled ?? true),
    initialData: options?.initialData,
    staleTime: Infinity,
  });
};
