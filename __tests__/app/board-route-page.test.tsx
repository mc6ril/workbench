import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";
import { createAppQueryClient } from "@/shared/providers/queryClient";

import BoardRoutePage from "@/app/(protected)/[projectId]/board/page";
import ProjectLoading from "@/app/(protected)/[projectId]/loading";
import { getBoardConfiguration } from "@/modules/board/core/usecases/board/getBoardConfiguration";

const boardPageContentMock = jest.fn((_props: unknown) => (
  <div>Board content</div>
));

const dehydrateMock = jest.fn((_queryClient?: unknown) => ({
  board: true,
}));

jest.mock("@tanstack/react-query", () => ({
  HydrationBoundary: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  dehydrate: (queryClient: unknown) => dehydrateMock(queryClient),
}));

jest.mock("@/shared/design-system/loader", () => ({
  __esModule: true,
  default: () => <div>loading</div>,
}));

jest.mock("@/shared/providers/queryClient", () => ({
  createAppQueryClient: jest.fn(),
}));

jest.mock("@/shared/infrastructure/supabase/server", () => ({
  createSupabaseServerClient: jest.fn(),
}));

jest.mock("@/modules/board/infrastructure/supabase/repositories", () => ({
  createBoardRepository: jest.fn(),
  createTicketRepository: jest.fn(),
}));

jest.mock("@/modules/board/core/usecases/board/getBoardConfiguration", () => ({
  getBoardConfiguration: jest.fn(),
}));

jest.mock("@/modules/board/presentation/pages/board", () => ({
  __esModule: true,
  default: (props: unknown) => boardPageContentMock(props),
}));

describe("BoardRoutePage hydration", () => {
  const PROJECT_ID = "a1111111-1111-4111-8111-111111111111";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("moves board awaits into a Suspense boundary (route returns immediately)", async () => {
    const result = await BoardRoutePage({
      params: Promise.resolve({ projectId: PROJECT_ID }),
    });

    expect(createSupabaseServerClient).not.toHaveBeenCalled();
    expect(createAppQueryClient).not.toHaveBeenCalled();
    expect(getBoardConfiguration).not.toHaveBeenCalled();

    // The server page returns a Suspense boundary whose child owns the awaits.
    expect(result).toEqual(
      expect.objectContaining({
        props: expect.objectContaining({
          fallback: expect.objectContaining({
            type: ProjectLoading,
          }),
          children: expect.any(Object),
        }),
      })
    );
  });
});
