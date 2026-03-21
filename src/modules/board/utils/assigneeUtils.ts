import type { ProjectMember } from "@/domains/project/core/domain/schema/projectMember.schema";
import type { TicketAssignee } from "@/modules/board/core/domain/schema/ticket.schema";

type AssigneeIdentity = {
  displayName: string | null;
  avatarUrl: string | null;
};

export const resolveAssigneeIdentity = (
  assignee: TicketAssignee | undefined,
  projectMembers: ProjectMember[]
): AssigneeIdentity => {
  if (!assignee) {
    return {
      displayName: null,
      avatarUrl: null,
    };
  }

  const matchingMember = projectMembers.find(
    (member) => member.userId === assignee.userId
  );

  return {
    displayName:
      assignee.displayName ??
      matchingMember?.profile.displayName ??
      matchingMember?.profile.email ??
      null,
    avatarUrl: assignee.avatarUrl ?? matchingMember?.profile.avatarUrl ?? null,
  };
};
