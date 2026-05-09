import type { ProjectModuleKey } from "@/domains/project/core/domain/projectModule.types";

export enum ProjectRole {
  ADMIN = "admin",
  MEMBER = "member",
  VIEWER = "viewer",
}

export type ProjectRoleLabelKey = "roleAdmin" | "roleMember" | "roleViewer";

export const PROJECT_ROLE_LABEL_KEYS = {
  [ProjectRole.ADMIN]: "roleAdmin",
  [ProjectRole.MEMBER]: "roleMember",
  [ProjectRole.VIEWER]: "roleViewer",
} as const satisfies Record<ProjectRole, ProjectRoleLabelKey>;

export const getProjectRoleLabelKey = (
  role: ProjectRole
): ProjectRoleLabelKey => {
  return PROJECT_ROLE_LABEL_KEYS[role];
};

export const PROJECT_ROLES: readonly ProjectRole[] = Object.freeze([
  ProjectRole.ADMIN,
  ProjectRole.MEMBER,
  ProjectRole.VIEWER,
]);

export const isProjectRole = (value: string): value is ProjectRole => {
  return (PROJECT_ROLES as readonly string[]).includes(value);
};

export enum InvitationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  DECLINED = "declined",
  EXPIRED = "expired",
}

export const INVITATION_STATUSES: readonly InvitationStatus[] = Object.freeze([
  InvitationStatus.PENDING,
  InvitationStatus.ACCEPTED,
  InvitationStatus.DECLINED,
  InvitationStatus.EXPIRED,
]);

export const isInvitationStatus = (
  value: string
): value is InvitationStatus => {
  return (INVITATION_STATUSES as readonly string[]).includes(value);
};

export type Project = {
  id: string;
  name: string;
  shortCode: string;
  boardEmoji: string;
  enabledModules: ProjectModuleKey[];
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectWithRole = Project & {
  role: ProjectRole;
};

export type MemberProfile = {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type ProjectMember = {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  profile: MemberProfile;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectInvitation = {
  id: string;
  projectId: string;
  role: ProjectRole;
  status: InvitationStatus;
  token: string;
  invitedBy: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};
