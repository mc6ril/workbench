import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UpdateSprintInput } from "@/core/domain/schema/sprint.schema";

import { updateSprint } from "@/core/usecases/sprint";

import { sprintRepository } from "@/infrastructure/supabase/repositories";

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
