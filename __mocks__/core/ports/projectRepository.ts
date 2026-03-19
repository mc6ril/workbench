import type {
  CreateProjectInput,
  Project,
  ProjectWithRole,
  ProjectWithStats,
  ReclaimableProject,
} from "@/domains/workspace/core/domain/schema/project.schema";

/**
 * Mock type for ProjectRepository.
 * Used for type-safe mock creation in tests.
 */
export type ProjectRepositoryMock = {
  findByShortCode: jest.Mock<Promise<Project | null>, [string]>;
  findById: jest.Mock<Promise<Project | null>, [string]>;
  list: jest.Mock<Promise<ProjectWithRole[]>, []>;
  listWithStats: jest.Mock<Promise<ProjectWithStats[]>, []>;
  create: jest.Mock<Promise<Project>, [CreateProjectInput]>;
  update: jest.Mock<Promise<Project>, [string, Partial<CreateProjectInput>]>;
  delete: jest.Mock<Promise<void>, [string]>;
  addCurrentUserAsMember: jest.Mock<
    Promise<Project>,
    [string, ("admin" | "member" | "viewer")?]
  >;
  hasProjectAccess: jest.Mock<Promise<boolean>, []>;
  listReclaimableProjects: jest.Mock<Promise<ReclaimableProject[]>, []>;
};

type ProjectRepositoryMockOverrides = Partial<ProjectRepositoryMock>;

/**
 * Factory for creating a mock ProjectRepository.
 *
 * Tests can override only the methods they need while keeping the rest as jest.fn().
 *
 * @param overrides - Partial mock to override specific methods
 * @returns A mock ProjectRepository
 */
export const createProjectRepositoryMock = (
  overrides: ProjectRepositoryMockOverrides = {}
): ProjectRepositoryMock => {
  const base: ProjectRepositoryMock = {
    findByShortCode: jest.fn<Promise<Project | null>, [string]>(),
    findById: jest.fn<Promise<Project | null>, [string]>(),
    list: jest.fn<Promise<ProjectWithRole[]>, []>(),
    listWithStats: jest.fn<Promise<ProjectWithStats[]>, []>(),
    create: jest.fn<Promise<Project>, [CreateProjectInput]>(),
    update: jest.fn<Promise<Project>, [string, Partial<CreateProjectInput>]>(),
    delete: jest.fn<Promise<void>, [string]>(),
    addCurrentUserAsMember: jest.fn<
      Promise<Project>,
      [string, ("admin" | "member" | "viewer")?]
    >(),
    hasProjectAccess: jest.fn<Promise<boolean>, []>(),
    listReclaimableProjects: jest.fn<Promise<ReclaimableProject[]>, []>(),
  };

  return {
    ...base,
    ...overrides,
  };
};
