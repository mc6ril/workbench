import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  updateProject,
  type UpdateProjectInput,
} from "@/domains/project/core/usecases/project/updateProject";
import { projectGateway } from "@/domains/project/infrastructure/supabase/gateways";
import { queryKeys } from "@/domains/project/presentation/hooks/queryKeys";
import { queryKeys as workspaceQueryKeys } from "@/domains/workspace/presentation/hooks/queryKeys";

type UpdateProjectMutationInput = {
  projectId: string;
  input: UpdateProjectInput;
};

/**
 * Hook for updating a project and refreshing related read models.
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, input }: UpdateProjectMutationInput) =>
      updateProject(projectGateway, projectId, input),
    onSuccess: (project) => {
      queryClient.setQueryData(queryKeys.projects.detail(project.id), project);
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() });
      queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.projects.withStats(),
      });
    },
  });
};
