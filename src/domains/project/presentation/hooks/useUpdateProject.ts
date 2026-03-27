import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateProjectInput } from "@/domains/project/core/domain/schema/project.schema";
import { updateProject } from "@/domains/project/core/usecases/project/updateProject";
import { projectRepository } from "@/domains/project/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/project/presentation/hooks/queryKeys";
import { queryKeys as workspaceQueryKeys } from "@/domains/workspace/presentation/hooks/queryKeys";

type UpdateProjectMutationInput = {
  projectId: string;
  input: Partial<CreateProjectInput>;
};

/**
 * Hook for updating a project and refreshing related read models.
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, input }: UpdateProjectMutationInput) =>
      updateProject(projectRepository, projectId, input),
    onSuccess: (project) => {
      queryClient.setQueryData(queryKeys.projects.detail(project.id), project);
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() });
      queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.projects.withStats(),
      });
    },
  });
};
