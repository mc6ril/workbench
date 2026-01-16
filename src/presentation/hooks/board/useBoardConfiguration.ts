import { useQuery } from "@tanstack/react-query";

import { getBoardConfiguration } from "@/core/usecases/board/getBoardConfiguration";

import { boardRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for fetching the board configuration (board + columns) for a project.
 */
export const useBoardConfiguration = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.projects.boardConfiguration(projectId),
    queryFn: () => getBoardConfiguration(boardRepository, projectId),
    enabled: !!projectId,
  });
};

