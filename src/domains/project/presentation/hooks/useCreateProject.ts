import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateProjectInput } from "@/domains/project/core/domain/schema/project.schema";
import { projectRepository } from "@/domains/project/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/project/presentation/hooks/queryKeys";
import { createProject } from "@/domains/workspace/core/usecases/project/createProject";
import { queryKeys as workspaceQueryKeys } from "@/domains/workspace/presentation/hooks/queryKeys";

/**
 * Hook for creating a new project.
 * Automatically invalidates the project list queries on success.
 *
 * @returns Mutation object with mutate, mutateAsync, data, isPending, error, etc.
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) =>
      createProject(projectRepository, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() });
      queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.projects.withStats(),
      });
    },
  });
};
