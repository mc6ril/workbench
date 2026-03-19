import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateSprintInput } from "@/modules/board/core/domain/schema/sprint.schema";
import { createSprint } from "@/modules/board/core/usecases/sprint";
import { sprintRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

/**
 * Hook for creating a sprint.
 * Invalidates the project sprints on success.
 */
export const useCreateSprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSprintInput) =>
      createSprint(input, sprintRepository),
    onSuccess: (sprint) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sprints.byProject(sprint.projectId),
      });
    },
  });
};
