export enum ProjectRole {
  ADMIN = "admin",
  MEMBER = "member",
  VIEWER = "viewer",
}

export const PROJECT_ROLES: readonly ProjectRole[] = Object.freeze([
  ProjectRole.ADMIN,
  ProjectRole.MEMBER,
  ProjectRole.VIEWER,
]);
