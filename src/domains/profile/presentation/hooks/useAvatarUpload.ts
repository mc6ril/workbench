import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CurrentAuthIdentity } from "@/domains/auth/core/domain/auth.types";
import { queryKeys as authQueryKeys } from "@/domains/auth/presentation/hooks/identity/queryKeys";
import { removeAvatar } from "@/domains/profile/core/usecases/removeAvatar";
import { uploadAvatar } from "@/domains/profile/core/usecases/uploadAvatar";
import { profileGateway } from "@/domains/profile/infrastructure/profileGateway.browser";
import type {
  MemberProfile,
  ProjectMember,
} from "@/domains/project/core/domain/project.types";
import type { CommentWithAuthor } from "@/modules/board/core/domain/comment.types";
import type { TicketAssignee } from "@/modules/board/core/domain/ticket.types";

const patchMemberAvatar = (
  members: ProjectMember[] | undefined,
  userId: string,
  avatarUrl: string | null
): ProjectMember[] | undefined =>
  members?.map((m) =>
    m.profile.id === userId
      ? { ...m, profile: { ...m.profile, avatarUrl } satisfies MemberProfile }
      : m
  );

const patchAssigneeRecordAvatar = (
  cache: Record<string, TicketAssignee[]> | undefined,
  userId: string,
  avatarUrl: string | null
): Record<string, TicketAssignee[]> | undefined => {
  if (!cache) return cache;
  return Object.fromEntries(
    Object.entries(cache).map(([k, assignees]) => [
      k,
      assignees.map((a) => (a.userId === userId ? { ...a, avatarUrl } : a)),
    ])
  );
};

const updateAvatarInBoardCaches = (
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string,
  avatarUrl: string | null
) => {
  queryClient.setQueriesData<ProjectMember[]>(
    { queryKey: ["members"] },
    (cache) => patchMemberAvatar(cache, userId, avatarUrl)
  );
  queryClient.setQueriesData<Record<string, TicketAssignee[]>>(
    { queryKey: ["ticket-assignees", "project"] },
    (cache) => patchAssigneeRecordAvatar(cache, userId, avatarUrl)
  );
  queryClient.setQueriesData<Record<string, TicketAssignee[]>>(
    { queryKey: ["ticket-assignees", "batch"] },
    (cache) => patchAssigneeRecordAvatar(cache, userId, avatarUrl)
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
      assignees?.map((a) => (a.userId === userId ? { ...a, avatarUrl } : a))
  );
  queryClient.setQueriesData<CommentWithAuthor[]>(
    { queryKey: ["comments"] },
    (comments) =>
      comments?.map((c) =>
        c.authorId === userId ? { ...c, authorAvatarUrl: avatarUrl } : c
      )
  );
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      uploadAvatar(profileGateway, userId, file),
    onSuccess: (avatarUrl, { userId }) => {
      queryClient.setQueryData<CurrentAuthIdentity | null>(
        authQueryKeys.authIdentity.current(),
        (current) => (current ? { ...current, avatarUrl } : current)
      );
      updateAvatarInBoardCaches(queryClient, userId, avatarUrl);
    },
  });
};

export const useRemoveAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => removeAvatar(profileGateway, userId),
    onSuccess: (_data, userId) => {
      queryClient.setQueryData<CurrentAuthIdentity | null>(
        authQueryKeys.authIdentity.current(),
        (current) => (current ? { ...current, avatarUrl: null } : current)
      );
      updateAvatarInBoardCaches(queryClient, userId, null);
    },
  });
};
