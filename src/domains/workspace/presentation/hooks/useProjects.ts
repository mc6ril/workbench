import { useQuery } from "@tanstack/react-query";

import { useSession } from "@/domains/session/presentation/hooks/useSession";
import { listProjects } from "@/domains/workspace/core/usecases/project/listProjects";
import { projectRepository } from "@/domains/workspace/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/workspace/presentation/hooks/queryKeys";

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
    queryFn: () => listProjects(projectRepository),
    enabled: enabled && !isSessionLoading && !!session?.userId,
  });
};
