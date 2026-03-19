import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteProject } from "@/domains/workspace/core/usecases/project/deleteProject";

import { projectRepository } from "@/domains/workspace/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/workspace/presentation/hooks/queryKeys";

/**
 * Hook for deleting a project and refreshing related lists.
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) =>
      deleteProject(projectRepository, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.withStats() });
    },
  });
};
