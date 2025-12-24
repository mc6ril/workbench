import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateProjectInput } from "@/core/domain/project/project.schema";

import { createProject } from "@/core/usecases/createProject";

import { projectRepositorySupabase } from "@/infrastructure/supabase/repositories/projectRepositorySupabase";

import { queryKeys } from "./queryKeys";

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
      createProject(projectRepositorySupabase, input),
    onSuccess: () => {
      // Invalidate projects list to refresh the UI after project creation
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() });
    },
  });
};

