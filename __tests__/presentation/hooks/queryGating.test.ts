const useQueryMock = jest.fn();

jest.mock("@tanstack/react-query", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? "test-key";

import { useBoardConfiguration } from "@/modules/board/presentation/hooks/board/useBoardConfiguration";
import { useLabels } from "@/modules/board/presentation/hooks/label/useLabels";
import { useSprints } from "@/modules/board/presentation/hooks/sprint/useSprints";

describe("query hook gating", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    useQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: null,
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

  it("disables labels query when enabled is false", () => {
    useLabels("project-1", { enabled: false });

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
  });

  it("disables sprints query when enabled is false", () => {
    useSprints("project-1", { enabled: false });

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
  });

  it("keeps queries enabled by default", () => {
    useBoardConfiguration("project-1");
    useLabels("project-1");
    useSprints("project-1");

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
    expect(useQueryMock).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        enabled: true,
      })
    );
  });
});
