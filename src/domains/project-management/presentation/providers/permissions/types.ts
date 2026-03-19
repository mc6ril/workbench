import type { ProjectRole } from "@/domains/workspace/core/domain/schema/project.schema";

export type ProjectPermissionFlags = {
  // Used by project settings/edit actions.
  canEditProject: boolean;
  canComment: boolean;
  canManageMembers: boolean;
  canCreateTicket: boolean;
  canMoveTicket: boolean;
  canCreateEpic: boolean;
  canEditTicket: boolean;
  // Kept explicit for future delete-specific gating.
  canDeleteTicket: boolean;
  isViewer: boolean;
  isMember: boolean;
  isAdmin: boolean;
};

export type ProjectPermissions = ProjectPermissionFlags & {
  role: ProjectRole | null;
  isLoading: boolean;
};
