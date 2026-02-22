import { useMutation, useQueryClient } from "@tanstack/react-query";

import { removeMember } from "@/core/usecases/member/removeMember";

import { memberRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for removing a member from a project.
 * Invalidates the members list and project stats queries on success.
 *
 * @returns Mutation object with mutate, mutateAsync, isPending, error, etc.
 */
export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      projectId,
      memberRole,
    }: {
      memberId: string;
      projectId: string;
      memberRole: string;
    }) => removeMember(memberRepository, memberId, projectId, memberRole),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.members.byProject(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.withStats(),
      });
    },
  });
};
