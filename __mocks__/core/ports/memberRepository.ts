import type { Project } from "@/domains/project/core/domain/schema/project.schema";
import type { ProjectRole } from "@/domains/project/core/domain/schema/project.schema";
import type { ProjectMember } from "@/domains/project/core/domain/schema/projectMember.schema";

/**
 * Mock type for MemberRepository.
 */
export type MemberRepositoryMock = {
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

type MemberRepositoryMockOverrides = Partial<MemberRepositoryMock>;

/**
 * Factory for creating a mock MemberRepository.
 */
export const createMemberRepositoryMock = (
  overrides: MemberRepositoryMockOverrides = {}
): MemberRepositoryMock => {
  const base: MemberRepositoryMock = {
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
