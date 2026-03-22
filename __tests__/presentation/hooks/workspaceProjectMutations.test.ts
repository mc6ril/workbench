const invalidateQueriesMock = jest.fn();
const useMutationMock = jest.fn();

jest.mock("@tanstack/react-query", () => ({
  useMutation: (options: unknown) => {
    useMutationMock(options);
    return options;
  },
  useQueryClient: () => ({
    invalidateQueries: invalidateQueriesMock,
  }),
}));

jest.mock("@/domains/workspace/core/usecases/project/createProject", () => ({
  createProject: jest.fn(),
}));

jest.mock("@/domains/workspace/core/usecases/project/addUserToProject", () => ({
  addUserToProject: jest.fn(),
}));

jest.mock("@/domains/project/infrastructure/supabase/repositories", () => ({
  projectRepository: {},
}));

jest.mock("@/domains/workspace/infrastructure/supabase/repositories", () => ({
  workspaceProjectRepository: {},
}));

import { queryKeys as projectQueryKeys } from "@/domains/project/presentation/hooks/queryKeys";
import { queryKeys as workspaceQueryKeys } from "@/domains/workspace/presentation/hooks/queryKeys";
import { useAddUserToProject } from "@/domains/workspace/presentation/hooks/useAddUserToProject";
import { useCreateProject } from "@/domains/workspace/presentation/hooks/useCreateProject";

describe("workspace project mutations", () => {
  beforeEach(() => {
    invalidateQueriesMock.mockReset();
    useMutationMock.mockReset();
  });

  it("invalidates the workspace stats list after project creation", () => {
    const mutation = useCreateProject() as { onSuccess?: () => void };

    mutation.onSuccess?.();

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: projectQueryKeys.projects.all(),
    });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: workspaceQueryKeys.projects.withStats(),
    });
  });

  it("invalidates workspace lists after reclaiming or joining a project", () => {
    const mutation = useAddUserToProject() as { onSuccess?: () => void };

    mutation.onSuccess?.();

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: projectQueryKeys.projects.all(),
    });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: workspaceQueryKeys.projects.withStats(),
    });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: workspaceQueryKeys.projects.reclaimable(),
    });
  });
});
