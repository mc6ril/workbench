import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createProject,
  type CreateProjectInput,
} from "@/domains/project/core/usecases/project/createProject";
import { projectGateway } from "@/domains/project/infrastructure/supabase/gateways";
import { queryKeys } from "@/domains/project/presentation/hooks/queryKeys";
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
      createProject(projectGateway, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() });
      queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.projects.withStats(),
      });
    },
  });
};
