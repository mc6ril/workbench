import { useQuery } from "@tanstack/react-query";

import { listProjects } from "@/domains/project-management/core/usecases/project/listProjects";

import { projectRepository } from "@/domains/project-management/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/project-management/presentation/hooks/queryKeys";

/**
 * Hook for fetching all projects accessible to the current user.
 * Projects are automatically filtered by RLS policies to only include
 * projects where the user is a member.
 *
 * @returns React Query hook result with projects array, loading state, and error
 */
export const useProjects = () => {
  return useQuery({
    queryKey: queryKeys.projects.all(),
    queryFn: () => listProjects(projectRepository),
  });
};
