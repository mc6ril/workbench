import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { listProjectsWithStats } from "@/domains/workspace/core/usecases/project/listProjectsWithStats";
import { listReclaimableProjects } from "@/domains/workspace/core/usecases/project/listReclaimableProjects";
import { workspaceProjectRepository } from "@/domains/workspace/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/workspace/presentation/hooks/queryKeys";

export const usePrefetchWorkspaceProjects = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (userId?: string) => {
      if (!userId) {
        return;
      }

      void queryClient.prefetchQuery({
        queryKey: queryKeys.projects.withStats(),
        queryFn: () => listProjectsWithStats(workspaceProjectRepository),
      });

      void queryClient.prefetchQuery({
        queryKey: queryKeys.projects.reclaimable(),
        queryFn: () => listReclaimableProjects(workspaceProjectRepository),
      });
    },
    [queryClient]
  );
};
