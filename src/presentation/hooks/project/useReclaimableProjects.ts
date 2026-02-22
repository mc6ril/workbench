import { useQuery } from "@tanstack/react-query";

import { listReclaimableProjects } from "@/core/usecases/project/listReclaimableProjects";

import { projectRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for fetching orphaned projects reclaimable by the current user.
 * Returns projects where the orphaned_by_email matches the user's email.
 */
export const useReclaimableProjects = () => {
  return useQuery({
    queryKey: queryKeys.projects.reclaimable(),
    queryFn: () => listReclaimableProjects(projectRepository),
  });
};
