import type {
  CreateProjectInput,
  Project,
  ProjectWithRole,
  UpdateProjectInput,
} from "@/domains/project/core/domain/schema/project.schema";
import type {
  ProjectWithStats,
  ReclaimableProject,
} from "@/domains/workspace/core/domain/workspaceProjectCatalog.schema";

/**
 * Mock type for ProjectRepository.
 * Used for type-safe mock creation in tests.
 */
export type ProjectRepositoryMock = {
  findByShortCode: jest.Mock<Promise<Project | null>, [string]>;
  findById: jest.Mock<Promise<Project | null>, [string]>;
  list: jest.Mock<Promise<ProjectWithRole[]>, []>;
  listAccessibleProjects: jest.Mock<Promise<ProjectWithRole[]>, []>;
  listWithStats: jest.Mock<Promise<ProjectWithStats[]>, []>;
  listProjectsWithStats: jest.Mock<Promise<ProjectWithStats[]>, []>;
  create: jest.Mock<Promise<Project>, [CreateProjectInput]>;
  update: jest.Mock<Promise<Project>, [string, UpdateProjectInput]>;
  delete: jest.Mock<Promise<void>, [string]>;
  addCurrentUserAsMember: jest.Mock<
    Promise<Project>,
    [string, ("admin" | "member" | "viewer")?]
  >;
  hasProjectAccess: jest.Mock<Promise<boolean>, []>;
  hasAnyProjectAccess: jest.Mock<Promise<boolean>, []>;
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
  const listMock =
    overrides.listAccessibleProjects ??
    overrides.list ??
    jest.fn<Promise<ProjectWithRole[]>, []>();
  const listWithStatsMock =
    overrides.listProjectsWithStats ??
    overrides.listWithStats ??
    jest.fn<Promise<ProjectWithStats[]>, []>();
  const hasAccessMock =
    overrides.hasAnyProjectAccess ??
    overrides.hasProjectAccess ??
    jest.fn<Promise<boolean>, []>();

  const base: ProjectRepositoryMock = {
    findByShortCode: jest.fn<Promise<Project | null>, [string]>(),
    findById: jest.fn<Promise<Project | null>, [string]>(),
    list: listMock,
    listAccessibleProjects: listMock,
    listWithStats: listWithStatsMock,
    listProjectsWithStats: listWithStatsMock,
    create: jest.fn<Promise<Project>, [CreateProjectInput]>(),
    update: jest.fn<Promise<Project>, [string, UpdateProjectInput]>(),
    delete: jest.fn<Promise<void>, [string]>(),
    addCurrentUserAsMember: jest.fn<
      Promise<Project>,
      [string, ("admin" | "member" | "viewer")?]
    >(),
    hasProjectAccess: hasAccessMock,
    hasAnyProjectAccess: hasAccessMock,
    listReclaimableProjects: jest.fn<Promise<ReclaimableProject[]>, []>(),
  };

  return {
    ...base,
    ...overrides,
  };
};
