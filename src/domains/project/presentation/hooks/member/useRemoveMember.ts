import { useMutation, useQueryClient } from "@tanstack/react-query";

import { removeMember } from "@/domains/project/core/usecases/member/removeMember";
import { memberRepository } from "@/domains/project/infrastructure/supabase/repositories";
import { queryKeys } from "@/domains/project/presentation/hooks/queryKeys";

type RemoveMemberVariables = {
  memberId: string;
  projectId: string;
};

/**
 * Hook for removing a member from a project.
 * Invalidates the members list and project stats queries on success.
 *
 * @returns Mutation object with mutate, mutateAsync, isPending, error, etc.
 */
export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId }: RemoveMemberVariables) =>
      removeMember(memberRepository, memberId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.members.byProject(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.currentRole(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.withStats(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.all(),
      });
    },
  });
};
