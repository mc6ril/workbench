import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UpdateSprintInput } from "@/domains/project-management/core/domain/schema/sprint.schema";

import { updateSprint } from "@/domains/project-management/core/usecases/sprint";

import { sprintRepository } from "@/domains/project-management/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for updating a sprint.
 */
export const useUpdateSprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sprintId,
      input,
    }: {
      sprintId: string;
      input: UpdateSprintInput;
    }) => updateSprint(sprintId, input, sprintRepository),
    onSuccess: (sprint) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sprints.byProject(sprint.projectId),
      });
    },
  });
};
