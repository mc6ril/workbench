import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateSprintInput } from "@/domains/project-management/core/domain/schema/sprint.schema";

import { createSprint } from "@/domains/project-management/core/usecases/sprint";

import { sprintRepository } from "@/domains/project-management/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

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
