import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

import RecipesCatalogClientPage from "@/modules/recipes/presentation/components/catalog/RecipesCatalogClientPage/index";
import { useListRecipes } from "@/modules/recipes/presentation/hooks/catalog/listRecipes";
import { useListRecipeTags } from "@/modules/recipes/presentation/hooks/catalog/listRecipeTags";
import { useListActiveSelections } from "@/modules/recipes/presentation/hooks/planner/listActiveSelections";
import { useRecipesCatalogFiltersStore } from "@/modules/recipes/presentation/stores";

const mockReplace = jest.fn();
const mockPathname = "/project-1/recipes";
let mockSearchParams = new URLSearchParams();
let mockIntersectionObserverCallback: IntersectionObserverCallback | null =
  null;
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
    default: ({ recipe }: { recipe: { title: string } }) => (
      <div>{recipe.title}</div>
    ),
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

jest.mock(
  "@/modules/recipes/presentation/hooks/catalog/listRecipeTags",
  () => ({
    useListRecipeTags: jest.fn(),
  })
);

jest.mock(
  "@/modules/recipes/presentation/hooks/planner/listActiveSelections",
  () => ({
    useListActiveSelections: jest.fn(),
  })
);

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
      selectedFilterOptionIds: [],
      draftSelectedFilterOptionIds: [],
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
            coverImageUrl: null,
            tags: [],
            coverStyle: "citrus",
            isInQuickList: false,
            seasonalMonths: [],
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
        data: [],
      })
    );

    jest.mocked(useListActiveSelections).mockReturnValue(
      asMockedReturn<ReturnType<typeof useListActiveSelections>>({
        data: [],
      })
    );
  });

  it("applies the selected filters only after validation", async () => {
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
              coverImageUrl: null,
              tags: [],
              coverStyle: "citrus",
              isInQuickList: false,
              seasonalMonths: [],
            },
          ],
          hasMore: false,
          nextCursor: null,
        }}
        initialQueryState={{
          search: "",
          filterOptionIds: [],
        }}
        initialTags={[]}
        quickListRecipes={[]}
        initialCookingHistory={[]}
      />
    );

    act(() => {
      useRecipesCatalogFiltersStore.getState().openFilters();
    });

    const typeSection = screen
      .getByRole("heading", { name: "Type" })
      .closest("section");

    expect(typeSection).not.toBeNull();

    const tagCheckbox = within(typeSection as HTMLElement).getByRole(
      "checkbox",
      {
        name: "Express",
      }
    );

    expect(tagCheckbox).not.toBeChecked();

    fireEvent.click(tagCheckbox);

    expect(mockReplace).not.toHaveBeenCalled();

    expect(tagCheckbox).toBeChecked();

    fireEvent.click(
      screen.getByRole("button", { name: "Valider les filtres" })
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        "/project-1/recipes?filters=type-express",
        {
          scroll: false,
        }
      );
    });
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
            coverImageUrl: null,
            tags: [],
            coverStyle: "citrus",
            isInQuickList: false,
            seasonalMonths: [],
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
              coverImageUrl: null,
              tags: [],
              coverStyle: "citrus",
              isInQuickList: false,
              seasonalMonths: [],
            },
          ],
          hasMore: true,
          nextCursor: {
            updatedAt: "2026-04-03T10:00:00.000Z",
            id: "recipe-1",
          },
        }}
        initialQueryState={{
          search: "",
          filterOptionIds: [],
        }}
        initialTags={[]}
        quickListRecipes={[]}
        initialCookingHistory={[]}
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
            coverImageUrl: null,
            tags: [],
            coverStyle: "citrus",
            isInQuickList: false,
            seasonalMonths: [],
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
              coverImageUrl: null,
              tags: [],
              coverStyle: "citrus",
              isInQuickList: false,
              seasonalMonths: [],
            },
          ],
          hasMore: true,
          nextCursor: {
            updatedAt: "2026-04-03T10:00:00.000Z",
            id: "recipe-1",
          },
        }}
        initialQueryState={{
          search: "",
          filterOptionIds: [],
        }}
        initialTags={[]}
        quickListRecipes={[]}
        initialCookingHistory={[]}
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

  it("shows custom recipe tags in the filters sheet and active filters bar", async () => {
    jest.mocked(useListRecipeTags).mockReturnValue(
      asMockedReturn<ReturnType<typeof useListRecipeTags>>({
        data: [
          {
            id: "tag-1",
            label: "Batch cooking",
            slug: "batch-cooking",
          },
        ],
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
              coverImageUrl: null,
              tags: [],
              coverStyle: "citrus",
              isInQuickList: false,
              seasonalMonths: [],
            },
          ],
          hasMore: false,
          nextCursor: null,
        }}
        initialQueryState={{
          search: "",
          filterOptionIds: [],
        }}
        initialTags={[
          {
            id: "tag-1",
            label: "Batch cooking",
            slug: "batch-cooking",
          },
        ]}
        quickListRecipes={[]}
        initialCookingHistory={[]}
      />
    );

    act(() => {
      useRecipesCatalogFiltersStore.getState().openFilters();
    });

    const customTagsSection = screen
      .getByRole("heading", { name: "Tags ajoutés" })
      .closest("section");

    expect(customTagsSection).not.toBeNull();

    const tagCheckbox = within(customTagsSection as HTMLElement).getByRole(
      "checkbox",
      {
        name: "Batch cooking",
      }
    );

    fireEvent.click(tagCheckbox);
    fireEvent.click(
      screen.getByRole("button", { name: "Valider les filtres" })
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        "/project-1/recipes?filters=tag.batch-cooking",
        {
          scroll: false,
        }
      );
    });

    expect(screen.getAllByText("Batch cooking").length).toBeGreaterThan(0);
  });
});
