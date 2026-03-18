import { useQuery } from "@tanstack/react-query";

import { listProjectsWithStats } from "@/domains/project-management/core/usecases/project/listProjectsWithStats";

import { projectRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for fetching all projects with statistics for workspace overview.
 * Returns projects with member count, ticket count, and status breakdown.
 * Uses optimized SQL function for aggregated counts.
 *
 * @param enabled - Whether the query should execute (default: true). Pass false to defer until session is ready.
 * @returns React Query hook result with projects array including stats
 */
export const useProjectsWithStats = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.projects.withStats(),
    queryFn: () => listProjectsWithStats(projectRepository),
    enabled,
  });
};
