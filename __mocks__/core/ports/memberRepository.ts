import type { ProjectRole } from "@/core/domain/schema/project.schema";
import type { ProjectMember } from "@/core/domain/schema/projectMember.schema";

/**
 * Mock type for MemberRepository.
 */
export type MemberRepositoryMock = {
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
