import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateProjectInput } from "@/core/domain/schema/project.schema";

import { createProject } from "@/core/usecases/project/createProject";

import { projectRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for creating a new project.
 * Automatically invalidates the projects list query on success.
 *
 * @returns Mutation object with mutate, mutateAsync, data, isPending, error, etc.
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) =>
      createProject(projectRepository, input),
    onSuccess: () => {
      // Invalidate projects list to refresh the UI after project creation
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() });
    },
  });
};
