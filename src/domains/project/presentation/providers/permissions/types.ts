import type { ProjectRole } from "@/domains/project/core/domain/project.types";

export type ProjectPermissionFlags = {
  canEditProject: boolean;
  canDeleteProject: boolean;
  canComment: boolean;
  canManageMembers: boolean;
  canCreateTicket: boolean;
  canMoveTicket: boolean;
  canCreateEpic: boolean;
  canEditTicket: boolean;
  canDeleteTicket: boolean;
  isViewer: boolean;
  isMember: boolean;
  isAdmin: boolean;
};

export type ProjectPermissions = ProjectPermissionFlags & {
  role: ProjectRole | null;
};
