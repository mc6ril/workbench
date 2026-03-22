import { useQuery } from "@tanstack/react-query";

import { useSession } from "@/domains/session/presentation/hooks/useSession";
import { listReclaimableProjects } from "@/domains/workspace/core/usecases/project/listReclaimableProjects";
import { workspaceProjectCatalogRepository } from "@/domains/workspace/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/workspace/presentation/hooks/queryKeys";

/**
 * Hook for fetching orphaned projects reclaimable by the current user.
 * Returns projects where the orphaned_by_email matches the user's email.
 *
 * @param enabled - Whether the query should execute (default: true). Pass false to defer until session is ready.
 */
export const useReclaimableProjects = (enabled = true) => {
  const { data: session, isLoading: isSessionLoading } = useSession();

  return useQuery({
    queryKey: queryKeys.projects.reclaimable(),
    queryFn: () =>
      listReclaimableProjects(workspaceProjectCatalogRepository),
    enabled: enabled && !isSessionLoading && !!session?.userId,
  });
};
