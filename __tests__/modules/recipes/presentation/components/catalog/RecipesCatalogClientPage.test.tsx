import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import RecipesCatalogClientPage from "@/modules/recipes/presentation/components/catalog/RecipesCatalogClientPage/index";
import {
  useListActiveSelections,
  useListRecipes,
  useListRecipeTags,
} from "@/modules/recipes/presentation/hooks";
import { useRecipesCatalogFiltersStore } from "@/modules/recipes/presentation/stores";

const mockReplace = jest.fn();
const mockPathname = "/project-1/recipes";
let mockSearchParams = new URLSearchParams();

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

jest.mock("@/modules/recipes/presentation/hooks", () => ({
  useListRecipes: jest.fn(),
  useListRecipeTags: jest.fn(),
  useListActiveSelections: jest.fn(),
}));

const asMockedReturn = <T,>(value: unknown): T => value as T;

describe("RecipesCatalogClientPage", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockSearchParams = new URLSearchParams();
    useRecipesCatalogFiltersStore.setState({
      search: "",
      selectedTagSlugs: [],
      isQuickListOpen: false,
      isFiltersOpen: false,
    });

    jest.mocked(useListRecipes).mockReturnValue(
      asMockedReturn<ReturnType<typeof useListRecipes>>({
        data: [
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
        initialRecipes={[
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
        ]}
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
});
