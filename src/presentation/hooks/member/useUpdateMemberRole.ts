import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ProjectRole } from "@/core/domain/schema/project.schema";

import { updateMemberRole } from "@/core/usecases/member/updateMemberRole";

import { memberRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for updating a project member's role.
 * Invalidates the members list query on success.
 *
 * @returns Mutation object with mutate, mutateAsync, isPending, error, etc.
 */
export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      role,
      projectId,
    }: {
      memberId: string;
      role: ProjectRole;
      projectId: string;
    }) => updateMemberRole(memberRepository, memberId, role, projectId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.members.byProject(variables.projectId),
      });
    },
  });
};
