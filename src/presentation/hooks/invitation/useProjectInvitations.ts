import { useQuery } from "@tanstack/react-query";

import { listProjectInvitations } from "@/core/usecases/invitation/listProjectInvitations";

import { invitationRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for fetching all invitations for a project.
 *
 * @param projectId - Project ID (query disabled when undefined)
 * @returns React Query hook result with invitations array
 */
export const useProjectInvitations = (projectId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.invitations.byProject(projectId ?? ""),
    queryFn: () => listProjectInvitations(invitationRepository, projectId!),
    enabled: !!projectId,
  });
};
