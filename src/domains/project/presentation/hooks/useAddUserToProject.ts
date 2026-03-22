import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ProjectRole } from "@/domains/project/core/domain/schema/project.schema";
import { joinProject } from "@/domains/project/core/usecases/membership/joinProject";
import { memberRepository } from "@/domains/project/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/project/presentation/hooks/queryKeys";
import { queryKeys as workspaceQueryKeys } from "@/domains/workspace/presentation/hooks/queryKeys";

/**
 * Hook for joining or reclaiming a project as the current user.
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
    }) => joinProject(memberRepository, projectId, role),
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
