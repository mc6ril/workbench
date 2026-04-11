import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";

import type { CatalogRecipeListInput } from "@/modules/recipes/core/domain/catalog/catalogRecipe.types";
import { listCatalogRecipes } from "@/modules/recipes/core/usecases/catalog/listCatalogRecipes";
import { useListRecipes } from "@/modules/recipes/presentation/hooks/catalog/listRecipes";

jest.mock("@/modules/recipes/core/usecases/catalog/listCatalogRecipes", () => ({
  listCatalogRecipes: jest.fn(),
}));

describe("useListRecipes", () => {
  const projectId = "project-1";
  const filters = {
    search: "citron",
    filterOptionIds: ["type-express"],
  };

  const firstPage = {
    items: [
      {
        id: "recipe-1",
        title: "Poulet citron",
        summary: "summary",
        totalTimeLabel: "30 min",
        servingsLabel: "2 portions",
        coverImageUrl: null,
        tags: [],
        coverStyle: "citrus" as const,
        isInQuickList: false,
      },
    ],
    hasMore: true,
    nextCursor: {
      updatedAt: "2026-04-03T10:00:00.000Z",
      id: "recipe-1",
    },
  };

  const secondPage = {
    items: [
      {
        id: "recipe-2",
        title: "Riz saute",
        summary: "summary",
        totalTimeLabel: "20 min",
        servingsLabel: "2 portions",
        coverImageUrl: null,
        tags: [],
        coverStyle: "sage" as const,
        isInQuickList: true,
      },
    ],
    hasMore: false,
    nextCursor: null,
  };

  const alternateFirstPage = {
    items: [
      {
        id: "recipe-3",
        title: "Salade herbes",
        summary: "summary",
        totalTimeLabel: "15 min",
        servingsLabel: "2 portions",
        coverImageUrl: null,
        tags: [],
        coverStyle: "green" as const,
        isInQuickList: false,
      },
    ],
    hasMore: false,
    nextCursor: null,
  };

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const TestQueryClientProvider = ({
      children,
    }: {
      children: ReactNode;
    }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    TestQueryClientProvider.displayName = "TestQueryClientProvider";

    return TestQueryClientProvider;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("flattens catalog pages and forwards the next cursor through fetchNextPage", async () => {
    const runListCatalogRecipes = jest
      .fn()
      .mockImplementation(async (input: CatalogRecipeListInput) => {
        if (input.pagination?.cursor) {
          return secondPage;
        }

        return firstPage;
      });

    jest.mocked(listCatalogRecipes).mockReturnValue(runListCatalogRecipes);

    const { result } = renderHook(
      () =>
        useListRecipes(projectId, filters, {
          enabled: true,
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.recipes).toEqual(firstPage.items);
    });

    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => {
      expect(result.current.recipes).toEqual([
        ...firstPage.items,
        ...secondPage.items,
      ]);
    });

    expect(runListCatalogRecipes).toHaveBeenNthCalledWith(1, {
      projectId,
      filters,
      pagination: undefined,
    });
    expect(runListCatalogRecipes).toHaveBeenNthCalledWith(2, {
      projectId,
      filters,
      pagination: {
        cursor: firstPage.nextCursor,
      },
    });
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.isFetchingNextPage).toBe(false);
  });

  it("hydrates from the initial page while exposing a flattened recipes list", async () => {
    const runListCatalogRecipes = jest.fn().mockResolvedValue(firstPage);

    jest.mocked(listCatalogRecipes).mockReturnValue(runListCatalogRecipes);

    const { result } = renderHook(
      () =>
        useListRecipes(projectId, filters, {
          initialData: firstPage,
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.recipes).toEqual(firstPage.items);
    });

    expect(runListCatalogRecipes).toHaveBeenCalledWith({
      projectId,
      filters,
      pagination: undefined,
    });
    expect(result.current.hasNextPage).toBe(true);
  });

  it("resets pagination when filters change", async () => {
    const runListCatalogRecipes = jest
      .fn()
      .mockImplementation(async (input: CatalogRecipeListInput) => {
        if (input.filters?.search === "herbes") {
          return alternateFirstPage;
        }

        if (input.pagination?.cursor) {
          return secondPage;
        }

        return firstPage;
      });

    jest.mocked(listCatalogRecipes).mockReturnValue(runListCatalogRecipes);

    const { result, rerender } = renderHook(
      ({ currentFilters }: { currentFilters: typeof filters }) =>
        useListRecipes(projectId, currentFilters, {
          enabled: true,
        }),
      {
        initialProps: {
          currentFilters: filters,
        },
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.recipes).toEqual(firstPage.items);
    });

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => {
      expect(result.current.recipes).toEqual([
        ...firstPage.items,
        ...secondPage.items,
      ]);
    });

    rerender({
      currentFilters: {
        search: "herbes",
        filterOptionIds: ["type-express"],
      },
    });

    await waitFor(() => {
      expect(result.current.recipes).toEqual(alternateFirstPage.items);
    });

    expect(runListCatalogRecipes).toHaveBeenLastCalledWith({
      projectId,
      filters: {
        search: "herbes",
        filterOptionIds: ["type-express"],
      },
      pagination: undefined,
    });
  });
});
