import type {
  Project,
  ProjectMember,
  ProjectRole,
} from "@/domains/project/core/domain/project.types";

/**
 * Mock type for ProjectMemberGateway.
 */
export type ProjectMemberGatewayMock = {
  addCurrentUserAsMember: jest.Mock<
    Promise<Project>,
    [string, ("admin" | "member" | "viewer")?]
  >;
  getCurrentRole: jest.Mock<Promise<ProjectRole | null>, [string]>;
  listByProject: jest.Mock<Promise<ProjectMember[]>, [string]>;
  updateRole: jest.Mock<Promise<void>, [string, ProjectRole]>;
  remove: jest.Mock<Promise<void>, [string]>;
  countAdmins: jest.Mock<Promise<number>, [string]>;
};

type ProjectMemberGatewayMockOverrides = Partial<ProjectMemberGatewayMock>;

/**
 * Factory for creating a mock ProjectMemberGateway.
 */
export const createProjectMemberGatewayMock = (
  overrides: ProjectMemberGatewayMockOverrides = {}
): ProjectMemberGatewayMock => {
  const base: ProjectMemberGatewayMock = {
    addCurrentUserAsMember: jest.fn<
      Promise<Project>,
      [string, ("admin" | "member" | "viewer")?]
    >(),
    getCurrentRole: jest.fn<Promise<ProjectRole | null>, [string]>(),
    listByProject: jest.fn<Promise<ProjectMember[]>, [string]>(),
    updateRole: jest.fn<Promise<void>, [string, ProjectRole]>(),
    remove: jest.fn<Promise<void>, [string]>(),
    countAdmins: jest.fn<Promise<number>, [string]>(),
  };

  return {
    ...base,
    ...overrides,
  };
};
