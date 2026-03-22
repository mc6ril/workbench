import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/domains/project/presentation/hooks/queryKeys";
import { useSession } from "@/domains/session/presentation/hooks/useSession";
import { listProjects } from "@/domains/workspace/core/usecases/project/listProjects";
import { workspaceProjectCatalogRepository } from "@/domains/workspace/infrastructure/supabase/repositories";

/**
 * Hook for fetching all projects accessible to the current user.
 * Projects are automatically filtered by RLS policies to only include
 * projects where the user is a member.
 *
 * @param enabled - Whether the query should execute once the session is ready (default: true)
 * @returns React Query hook result with projects array, loading state, and error
 */
export const useProjects = (enabled = true) => {
  const { data: session, isLoading: isSessionLoading } = useSession();

  return useQuery({
    queryKey: queryKeys.projects.all(),
    queryFn: () => listProjects(workspaceProjectCatalogRepository),
    enabled: enabled && !isSessionLoading && !!session?.userId,
  });
};
