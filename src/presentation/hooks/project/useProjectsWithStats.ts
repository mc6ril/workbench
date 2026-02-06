import { useQuery } from "@tanstack/react-query";

import { listProjectsWithStats } from "@/core/usecases/project/listProjectsWithStats";

import { projectRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for fetching all projects with statistics for workspace overview.
 * Returns projects with member count, ticket count, and status breakdown.
 * Uses optimized SQL function for aggregated counts.
 *
 * @returns React Query hook result with projects array including stats
 */
export const useProjectsWithStats = () => {
  return useQuery({
    queryKey: queryKeys.projects.withStats(),
    queryFn: () => listProjectsWithStats(projectRepository),
  });
};
