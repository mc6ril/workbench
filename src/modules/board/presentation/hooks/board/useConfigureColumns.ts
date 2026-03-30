import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ConfigureColumnsInput } from "@/modules/board/core/domain/board.types";
import { configureColumns } from "@/modules/board/core/usecases/board/configuration/configureColumns";
import { boardRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

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
