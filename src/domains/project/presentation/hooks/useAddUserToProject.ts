import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ProjectRole } from "@/domains/project/core/domain/schema/project.schema";
import { queryKeys } from "@/domains/project/presentation/hooks/queryKeys";
import { addUserToProject } from "@/domains/workspace/core/usecases/project/addUserToProject";
import { workspaceProjectRepository } from "@/domains/workspace/infrastructure/supabase/repositories";
import { queryKeys as workspaceQueryKeys } from "@/domains/workspace/presentation/hooks/queryKeys";

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
    }) => addUserToProject(workspaceProjectRepository, projectId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() });
      queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.projects.withStats(),
      });
      queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.projects.reclaimable(),
      });
    },
  });
};
