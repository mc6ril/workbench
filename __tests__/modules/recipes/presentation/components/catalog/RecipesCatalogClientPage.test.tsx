import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import RecipesCatalogClientPage from "@/modules/recipes/presentation/components/catalog/RecipesCatalogClientPage/index";
import { useListRecipes } from "@/modules/recipes/presentation/hooks/catalog/listRecipes";
import { useListRecipeTags } from "@/modules/recipes/presentation/hooks/catalog/listRecipeTags";
import { useListActiveSelections } from "@/modules/recipes/presentation/hooks/planner/listActiveSelections";
import { useRecipesCatalogFiltersStore } from "@/modules/recipes/presentation/stores";

const mockReplace = jest.fn();
const mockPathname = "/project-1/recipes";
let mockSearchParams = new URLSearchParams();
let mockIntersectionObserverCallback: IntersectionObserverCallback | null = null;
const mockIntersectionObserve = jest.fn();
const mockIntersectionDisconnect = jest.fn();

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "0px";
  readonly thresholds = [];

  constructor(callback: IntersectionObserverCallback) {
    mockIntersectionObserverCallback = callback;
  }

  disconnect = mockIntersectionDisconnect;
  observe = mockIntersectionObserve;
  takeRecords = () => [];
  unobserve = jest.fn();
}

Object.defineProperty(globalThis, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: jest.fn(),
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

jest.mock("@/shared/design-system/loader", () => ({
  __esModule: true,
  default: () => <div>loading</div>,
}));

jest.mock(
  "@/modules/recipes/presentation/components/catalog/RecipeCatalogCard/index",
  () => ({
    __esModule: true,
    default: ({ recipe }: { recipe: { title: string } }) => <div>{recipe.title}</div>,
  })
);

jest.mock(
  "@/modules/recipes/presentation/components/catalog/RecipesQuickListRail/index",
  () => ({
    __esModule: true,
    default: () => <div>quick-list</div>,
  })
);

jest.mock("@/modules/recipes/presentation/hooks/catalog/listRecipes", () => ({
  useListRecipes: jest.fn(),
}));

jest.mock("@/modules/recipes/presentation/hooks/catalog/listRecipeTags", () => ({
  useListRecipeTags: jest.fn(),
}));

jest.mock("@/modules/recipes/presentation/hooks/planner/listActiveSelections", () => ({
  useListActiveSelections: jest.fn(),
}));

const asMockedReturn = <T,>(value: unknown): T => value as T;

describe("RecipesCatalogClientPage", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockSearchParams = new URLSearchParams();
    mockIntersectionObserverCallback = null;
    mockIntersectionObserve.mockClear();
    mockIntersectionDisconnect.mockClear();
    useRecipesCatalogFiltersStore.setState({
      search: "",
      selectedTagSlugs: [],
      isQuickListOpen: false,
      isFiltersOpen: false,
    });

    jest.mocked(useListRecipes).mockReturnValue(
      asMockedReturn<ReturnType<typeof useListRecipes>>({
        recipes: [
          {
            id: "recipe-1",
            title: "Pasta primavera",
            summary: "summary",
            totalTimeLabel: "30 min",
            servingsLabel: "4 portions",
            tags: [],
            coverStyle: "citrus",
            isInQuickList: false,
          },
        ],
        fetchNextPage: jest.fn(),
        hasNextPage: false,
        isFetchingNextPage: false,
        isLoading: false,
        isFetching: false,
      })
    );

    jest.mocked(useListRecipeTags).mockReturnValue(
      asMockedReturn<ReturnType<typeof useListRecipeTags>>({
        data: [
          {
            id: "tag-1",
            label: "Rapide",
            slug: "rapide",
          },
        ],
      })
    );

    jest.mocked(useListActiveSelections).mockReturnValue(
      asMockedReturn<ReturnType<typeof useListActiveSelections>>({
        data: [],
      })
    );
  });

  it("keeps the selected tag active while syncing the query params", async () => {
    render(
      <RecipesCatalogClientPage
        projectId="project-1"
        initialRecipesPage={{
          items: [
            {
              id: "recipe-1",
              title: "Pasta primavera",
              summary: "summary",
              totalTimeLabel: "30 min",
              servingsLabel: "4 portions",
              tags: [],
              coverStyle: "citrus",
              isInQuickList: false,
            },
          ],
          hasMore: false,
          nextCursor: null,
        }}
        initialTags={[
          {
            id: "tag-1",
            label: "Rapide",
            slug: "rapide",
          },
        ]}
        initialQueryState={{
          search: "",
          tagSlugs: [],
        }}
        quickListRecipes={[]}
      />
    );

    const tagButton = screen.getByRole("button", { name: "Rapide" });

    expect(tagButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(tagButton);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        "/project-1/recipes?tags=rapide",
        {
          scroll: false,
        }
      );
    });

    expect(tagButton).toHaveAttribute("aria-pressed", "true");
  });

  it("shows a load more fallback button and fetches the next page on click", async () => {
    const fetchNextPage = jest.fn();

    jest.mocked(useListRecipes).mockReturnValue(
      asMockedReturn<ReturnType<typeof useListRecipes>>({
        recipes: [
          {
            id: "recipe-1",
            title: "Pasta primavera",
            summary: "summary",
            totalTimeLabel: "30 min",
            servingsLabel: "4 portions",
            tags: [],
            coverStyle: "citrus",
            isInQuickList: false,
          },
        ],
        fetchNextPage,
        hasNextPage: true,
        isFetchingNextPage: false,
        isLoading: false,
        isFetching: false,
      })
    );

    render(
      <RecipesCatalogClientPage
        projectId="project-1"
        initialRecipesPage={{
          items: [
            {
              id: "recipe-1",
              title: "Pasta primavera",
              summary: "summary",
              totalTimeLabel: "30 min",
              servingsLabel: "4 portions",
              tags: [],
              coverStyle: "citrus",
              isInQuickList: false,
            },
          ],
          hasMore: true,
          nextCursor: {
            updatedAt: "2026-04-03T10:00:00.000Z",
            id: "recipe-1",
          },
        }}
        initialTags={[]}
        initialQueryState={{
          search: "",
          tagSlugs: [],
        }}
        quickListRecipes={[]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Charger plus" }));

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it("fetches the next page when the sentinel enters the viewport", async () => {
    const fetchNextPage = jest.fn();

    jest.mocked(useListRecipes).mockReturnValue(
      asMockedReturn<ReturnType<typeof useListRecipes>>({
        recipes: [
          {
            id: "recipe-1",
            title: "Pasta primavera",
            summary: "summary",
            totalTimeLabel: "30 min",
            servingsLabel: "4 portions",
            tags: [],
            coverStyle: "citrus",
            isInQuickList: false,
          },
        ],
        fetchNextPage,
        hasNextPage: true,
        isFetchingNextPage: false,
        isLoading: false,
        isFetching: false,
      })
    );

    render(
      <RecipesCatalogClientPage
        projectId="project-1"
        initialRecipesPage={{
          items: [
            {
              id: "recipe-1",
              title: "Pasta primavera",
              summary: "summary",
              totalTimeLabel: "30 min",
              servingsLabel: "4 portions",
              tags: [],
              coverStyle: "citrus",
              isInQuickList: false,
            },
          ],
          hasMore: true,
          nextCursor: {
            updatedAt: "2026-04-03T10:00:00.000Z",
            id: "recipe-1",
          },
        }}
        initialTags={[]}
        initialQueryState={{
          search: "",
          tagSlugs: [],
        }}
        quickListRecipes={[]}
      />
    );

    expect(mockIntersectionObserve).toHaveBeenCalled();

    act(() => {
      mockIntersectionObserverCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });
});
