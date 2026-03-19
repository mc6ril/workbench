import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateEpicInput } from "@/modules/board/core/domain/schema/epic.schema";

import { createEpic } from "@/modules/board/core/usecases/epic/createEpic";

import { epicRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

/**
 * Hook for creating an epic.
 * Invalidates the project epics root on success.
 */
export const useCreateEpic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEpicInput) => createEpic(epicRepository, input),
    onSuccess: (epic) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.epicsRoot(epic.projectId),
      });
    },
  });
};

