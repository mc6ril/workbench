import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ConfigureColumnsInput } from "@/core/domain/schema/board.schema";

import { configureColumns } from "@/core/usecases/board/configureColumns";

import { boardRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for configuring board columns.
 * Invalidates the board configuration query for the project on success.
 */
export const useConfigureColumns = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ConfigureColumnsInput) =>
      configureColumns(boardRepository, input),
    onSuccess: (_configuration, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.boardConfiguration(variables.projectId),
      });
    },
  });
};

