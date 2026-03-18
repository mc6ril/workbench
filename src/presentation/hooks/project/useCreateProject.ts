import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateProjectInput } from "@/domains/project-management/core/domain/schema/project.schema";

import { createProject } from "@/domains/project-management/core/usecases/project/createProject";

import { projectRepository } from "@/domains/project-management/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/project-management/presentation/hooks/queryKeys";

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
