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

export const isProjectRole = (value: string): value is ProjectRole => {
  return (PROJECT_ROLES as readonly string[]).includes(value);
};
