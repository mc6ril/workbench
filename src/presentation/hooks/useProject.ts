import { useQuery } from "@tanstack/react-query";

import { getProject } from "@/core/usecases/getProject";

import { projectRepositorySupabase } from "@/infrastructure/supabase/repositories/projectRepositorySupabase";

import { queryKeys } from "./queryKeys";

/**
 * Hook for fetching a project by ID.
 *
 * @param id - Project ID
 * @returns React Query hook result with project data, loading state, and error
 */
export const useProject = (id: string) => {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => getProject(projectRepositorySupabase, id),
    enabled: !!id, // Only fetch if id is provided
  });
};
