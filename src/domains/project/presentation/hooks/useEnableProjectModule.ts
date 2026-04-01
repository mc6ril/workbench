import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ProjectModuleKey } from "@/domains/project/core/domain/projectModule.types";
import { enableProjectModule } from "@/domains/project/core/usecases/project/enableProjectModule";
import { projectGateway } from "@/domains/project/infrastructure/supabase/gateways";
import { queryKeys } from "@/domains/project/presentation/hooks/queryKeys";
import { queryKeys as workspaceQueryKeys } from "@/domains/workspace/presentation/hooks/queryKeys";

type EnableProjectModuleMutationInput = {
  projectId: string;
  moduleKey: ProjectModuleKey;
};

/**
 * Enables a project module and refreshes project-derived navigation state.
 */
export const useEnableProjectModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, moduleKey }: EnableProjectModuleMutationInput) =>
      enableProjectModule(projectGateway, projectId, moduleKey),
    onSuccess: (project) => {
      queryClient.setQueryData(queryKeys.projects.detail(project.id), project);
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() });
      queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.projects.withStats(),
      });
    },
  });
};
