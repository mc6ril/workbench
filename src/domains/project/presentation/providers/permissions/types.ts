import type { ProjectRole } from "@/domains/project/core/domain/schema/projectRole.schema";

export type ProjectPermissionFlags = {
  // Used by project settings/edit actions.
  canEditProject: boolean;
  canDeleteProject: boolean;
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
