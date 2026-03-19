import { useQuery } from "@tanstack/react-query";

import { listProjectMembers } from "@/domains/project/core/usecases/member/listProjectMembers";
import { memberRepository } from "@/domains/project/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/project/presentation/hooks/queryKeys";

/**
 * Hook for fetching all members of a project with their profiles.
 * Members are ordered by role (admin first) then by creation date.
 *
 * @param projectId - Project ID (query disabled when undefined)
 * @returns React Query hook result with members array, loading state, and error
 */
export const useProjectMembers = (projectId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.members.byProject(projectId ?? ""),
    queryFn: () => listProjectMembers(memberRepository, projectId!),
    enabled: !!projectId,
  });
};
