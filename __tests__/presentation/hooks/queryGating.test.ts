const useQueryMock = jest.fn();
const useSessionMock = jest.fn();

jest.mock("@tanstack/react-query", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

jest.mock("@/domains/session/presentation/hooks/useSession", () => ({
  useSession: (...args: unknown[]) => useSessionMock(...args),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? "test-key";

import { useProjectsWithStats } from "@/domains/workspace/presentation/hooks/useProjectsWithStats";
import { useReclaimableProjects } from "@/domains/workspace/presentation/hooks/useReclaimableProjects";
import { useBoardConfiguration } from "@/modules/board/presentation/hooks/board/useBoardConfiguration";

describe("query hook gating", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    useSessionMock.mockReset();
    useQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: null,
    });
    useSessionMock.mockReturnValue({
      data: { userId: "user-1" },
      isLoading: false,
    });
  });

  it("disables board configuration query when enabled is false", () => {
    useBoardConfiguration("project-1", { enabled: false });

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
  });

  it("keeps queries enabled by default", () => {
    useBoardConfiguration("project-1");

    expect(useQueryMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        enabled: true,
      })
    );
  });

  it("disables workspace queries while the session is still loading", () => {
    useSessionMock.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    useProjectsWithStats();
    useReclaimableProjects();

    expect(useQueryMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        enabled: false,
      })
    );
    expect(useQueryMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        enabled: false,
      })
    );
  });

  it("keeps workspace queries enabled once the authenticated session is ready", () => {
    useProjectsWithStats();
    useReclaimableProjects();

    expect(useQueryMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        enabled: true,
      })
    );
    expect(useQueryMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        enabled: true,
      })
    );
  });

  it("respects an explicit disabled flag for workspace queries", () => {
    useProjectsWithStats(false);
    useReclaimableProjects(false);

    expect(useQueryMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        enabled: false,
      })
    );
    expect(useQueryMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        enabled: false,
      })
    );
  });
});
