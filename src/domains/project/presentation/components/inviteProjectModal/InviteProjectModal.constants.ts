import { ProjectRole } from "@/domains/project/core/domain/project.types";

export const DEFAULT_INVITE_ROLE = ProjectRole.MEMBER;

export const INVITE_ROLE_OPTIONS = Object.freeze([
  ProjectRole.VIEWER,
  ProjectRole.MEMBER,
  ProjectRole.ADMIN,
]);

export const INVITE_ROLE_DESCRIPTION_KEYS = Object.freeze({
  [ProjectRole.VIEWER]: "actions.inviteRoleViewerDescription",
  [ProjectRole.MEMBER]: "actions.inviteRoleMemberDescription",
  [ProjectRole.ADMIN]: "actions.inviteRoleAdminDescription",
} satisfies Record<ProjectRole, string>);
