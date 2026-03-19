import type { ProjectPermissionFlags } from "./types";

import { ProjectRole } from "@/domains/workspace/core/domain/schema/project.schema";

const canEdit = (role: ProjectRole | null): boolean => {
  return role === ProjectRole.ADMIN || role === ProjectRole.MEMBER;
};

export const resolveProjectPermissions = (
  role: ProjectRole | null
): ProjectPermissionFlags => {
  const isAdmin = role === ProjectRole.ADMIN;
  const isMember = role === ProjectRole.MEMBER;
  const isViewer = role === ProjectRole.VIEWER;
  const hasEditPermission = canEdit(role);

  return {
    canEditProject: hasEditPermission,
    canComment: hasEditPermission,
    canManageMembers: isAdmin,
    canCreateTicket: hasEditPermission,
    canMoveTicket: hasEditPermission,
    canCreateEpic: hasEditPermission,
    canEditTicket: hasEditPermission,
    canDeleteTicket: hasEditPermission,
    isViewer,
    isMember,
    isAdmin,
  };
};
