import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateEpicInput } from "@/domains/project-management/core/domain/schema/epic.schema";

import { createEpic } from "@/domains/project-management/core/usecases/epic/createEpic";

import { epicRepository } from "@/domains/project-management/infrastructure/supabase/repositories";

import { queryKeys } from "@/domains/project-management/presentation/hooks/queryKeys";

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

