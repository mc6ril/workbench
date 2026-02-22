import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ProjectRole } from "@/core/domain/schema/project.schema";

import { addUserToProject } from "@/core/usecases/project/addUserToProject";

import { projectRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for adding the current user to a project.
 *
 * @returns Mutation object with mutate, mutateAsync, data, isPending, error, etc.
 */
export const useAddUserToProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      role,
    }: {
      projectId: string;
      role?: ProjectRole;
    }) => addUserToProject(projectRepository, projectId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.reclaimable(),
      });
    },
  });
};
