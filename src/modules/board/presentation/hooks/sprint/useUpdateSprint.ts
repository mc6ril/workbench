import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UpdateSprintInput } from "@/modules/board/core/domain/schema/sprint.schema";

import { updateSprint } from "@/modules/board/core/usecases/sprint";

import { sprintRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

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
