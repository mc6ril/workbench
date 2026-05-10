import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  updateAccountIdentity,
  type UpdateAccountIdentityInput,
} from "@/domains/account/core/usecases/updateAccountIdentity";
import { accountGateway } from "@/domains/account/infrastructure/accountGateway.browser";
import type { CurrentAuthIdentity } from "@/domains/auth/core/domain/auth.types";
import { queryKeys as authIdentityQueryKeys } from "@/domains/auth/presentation/hooks/identity/queryKeys";
import { useAuthIdentity } from "@/domains/auth/presentation/hooks/identity/useAuthIdentity";
import type {
  MemberProfile,
  ProjectMember,
} from "@/domains/project/core/domain/project.types";
import type { CommentWithAuthor } from "@/modules/board/core/domain/comment.types";
import type { TicketAssignee } from "@/modules/board/core/domain/ticket.types";

const updateDisplayNameInBoardCaches = (
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string,
  displayName: string | null
) => {
  queryClient.setQueriesData<ProjectMember[]>(
    { queryKey: ["members"] },
    (members) =>
      members?.map((m) =>
        m.profile.id === userId
          ? {
              ...m,
              profile: { ...m.profile, displayName } satisfies MemberProfile,
            }
          : m
      )
  );
  const patchAssigneeRecord = (
    cache: Record<string, TicketAssignee[]> | undefined
  ) => {
    if (!cache) return cache;
    return Object.fromEntries(
      Object.entries(cache).map(([k, assignees]) => [
        k,
        assignees.map((a) => (a.userId === userId ? { ...a, displayName } : a)),
      ])
    );
  };
  queryClient.setQueriesData<Record<string, TicketAssignee[]>>(
    { queryKey: ["ticket-assignees", "project"] },
    patchAssigneeRecord
  );
  queryClient.setQueriesData<Record<string, TicketAssignee[]>>(
    { queryKey: ["ticket-assignees", "batch"] },
    patchAssigneeRecord
  );
  queryClient.setQueriesData<TicketAssignee[]>(
    {
      predicate: (q) => {
        const key = q.queryKey;
        return (
          Array.isArray(key) &&
          key[0] === "ticket-assignees" &&
          key[1] !== "project" &&
          key[1] !== "batch"
        );
      },
    },
    (assignees) =>
      assignees?.map((a) => (a.userId === userId ? { ...a, displayName } : a))
  );
  queryClient.setQueriesData<CommentWithAuthor[]>(
    { queryKey: ["comments"] },
    (comments) =>
      comments?.map((c) =>
        c.authorId === userId ? { ...c, authorDisplayName: displayName } : c
      )
  );
};

export const useUpdateAccountIdentity = () => {
  const queryClient = useQueryClient();
  const { data: identity } = useAuthIdentity();

  return useMutation({
    mutationFn: async (input: UpdateAccountIdentityInput) => {
      await updateAccountIdentity(accountGateway, identity?.userId, input);
    },
    onSuccess: (_data, variables) => {
      if (variables.email) {
        queryClient.invalidateQueries({
          queryKey: authIdentityQueryKeys.authIdentity.current(),
        });
      }

      if (identity && variables.displayName !== undefined) {
        const displayName = variables.displayName?.trim() || null;
        queryClient.setQueryData<CurrentAuthIdentity | null>(
          authIdentityQueryKeys.authIdentity.current(),
          (current) => (current ? { ...current, displayName } : current)
        );
        updateDisplayNameInBoardCaches(
          queryClient,
          identity.userId,
          displayName
        );
      }
    },
  });
};
