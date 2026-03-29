import { useQuery } from "@tanstack/react-query";

import { listProjectInvitations } from "@/domains/project/core/usecases/invitation/listProjectInvitations";
import { invitationRepository } from "@/domains/project/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/project/presentation/hooks/queryKeys";

/**
 * Hook for fetching all invitations for a project.
 *
 * @param projectId - Project ID (query disabled when undefined)
 * @param enabled - Optional flag to disable fetching when the section is hidden
 * @returns React Query hook result with invitations array
 */
export const useProjectInvitations = (
  projectId: string | undefined,
  enabled = true
) => {
  return useQuery({
    queryKey: queryKeys.invitations.byProject(projectId ?? ""),
    queryFn: () => listProjectInvitations(invitationRepository, projectId!),
    enabled: Boolean(projectId) && enabled,
  });
};
