import type { ProjectMember } from "@/domains/project-management/core/domain/schema/projectMember.schema";

import type { ProjectRole } from "@/domains/workspace/core/domain/schema/project.schema";

/**
 * Mock type for MemberRepository.
 */
export type MemberRepositoryMock = {
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
