import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UpdateEpicInput } from "@/core/domain/schema/epic.schema";

import { updateEpic } from "@/core/usecases/epic/updateEpic";

import { epicRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

type UpdateEpicVariables = {
  id: string;
  input: UpdateEpicInput;
};

/**
 * Hook for updating an epic.
 * Invalidates project epics root and epic detail on success.
 */
export const useUpdateEpic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateEpicVariables) =>
      updateEpic(epicRepository, id, input),
    onSuccess: (epic) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.epicsRoot(epic.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.epics.detail(epic.id),
      });
    },
  });
};

