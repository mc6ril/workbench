import { fireEvent, render, screen } from "@testing-library/react";

import RecipeCatalogCard from "@/modules/recipes/presentation/components/catalog/RecipeCatalogCard";
import { useRemoveSelection } from "@/modules/recipes/presentation/hooks/planner/useRemoveSelection";
import { useSelectRecipe } from "@/modules/recipes/presentation/hooks/planner/useSelectRecipe";

jest.mock(
  "@/modules/recipes/presentation/hooks/planner/useSelectRecipe",
  () => ({
    useSelectRecipe: jest.fn(),
  })
);

jest.mock(
  "@/modules/recipes/presentation/hooks/planner/useRemoveSelection",
  () => ({
    useRemoveSelection: jest.fn(),
  })
);

const selectMutate = jest.fn();
const removeMutate = jest.fn();

const baseRecipe = {
  id: "recipe-1",
  title: "Poulet citron",
  summary: "Une recette simple et rapide.",
  totalTimeLabel: "35 min",
  servingsLabel: "4 portions",
  coverImageUrl: null,
  tags: [
    {
      id: "tag-1",
      label: "Rapide",
      slug: "rapide",
    },
    {
      id: "tag-2",
      label: "Poulet",
      slug: "poulet",
    },
    {
      id: "tag-3",
      label: "Soir de semaine",
      slug: "soir-de-semaine",
    },
    {
      id: "tag-4",
      label: "Sauce yaourt",
      slug: "sauce-yaourt",
    },
  ],
  coverStyle: "citrus" as const,
  isInQuickList: false,
};

describe("RecipeCatalogCard", () => {
  beforeEach(() => {
    selectMutate.mockClear();
    removeMutate.mockClear();

    jest.mocked(useSelectRecipe).mockReturnValue({
      mutate: selectMutate,
      isPending: false,
      isError: false,
      variables: undefined,
    } as unknown as ReturnType<typeof useSelectRecipe>);

    jest.mocked(useRemoveSelection).mockReturnValue({
      mutate: removeMutate,
      isPending: false,
      isError: false,
      variables: undefined,
    } as unknown as ReturnType<typeof useRemoveSelection>);
  });

  it("renders the compact recipe layout and links the card to the detail page", () => {
    render(
      <RecipeCatalogCard
        projectId="project-1"
        recipe={baseRecipe}
        quickListSelectionId={null}
      />
    );

    expect(
      screen.getByRole("link", { name: "Ouvrir la recette Poulet citron" })
    ).toHaveAttribute("href", "/project-1/recipes/recipe-1");
    expect(
      screen.getByRole("link", { name: "Modifier la recette Poulet citron" })
    ).toHaveAttribute("href", "/project-1/recipes/recipe-1/edit");
    expect(screen.getByText("35 min")).toBeInTheDocument();
    expect(screen.getByText("Viande")).toBeInTheDocument();
    expect(screen.getByText("Express")).toBeInTheDocument();
    expect(screen.getByText("Soir de semaine")).toBeInTheDocument();
    expect(screen.getByText("Sauce yaourt")).toBeInTheDocument();
    expect(screen.queryByText("Voir la fiche")).not.toBeInTheDocument();
    expect(screen.queryByText("4 portions")).not.toBeInTheDocument();
    expect(screen.queryByText(baseRecipe.summary)).not.toBeInTheDocument();
  });

  it("adds a recipe to the quick list from the toggle button", () => {
    render(
      <RecipeCatalogCard
        projectId="project-1"
        recipe={baseRecipe}
        quickListSelectionId={null}
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ajouter Poulet citron à la quick list",
      })
    );

    expect(selectMutate).toHaveBeenCalledWith({
      projectId: "project-1",
      recipeId: "recipe-1",
    });
    expect(removeMutate).not.toHaveBeenCalled();
  });

  it("renders the cover image centered inside the media area when a cover exists", () => {
    const { container } = render(
      <RecipeCatalogCard
        projectId="project-1"
        recipe={{
          ...baseRecipe,
          coverImageUrl: "https://example.com/recipe-cover.jpg",
        }}
        quickListSelectionId={null}
      />
    );

    const coverImage = container.querySelector("img");

    expect(coverImage?.getAttribute("src")).toContain(
      encodeURIComponent("https://example.com/recipe-cover.jpg")
    );
    expect(coverImage).toHaveClass("recipes-page__recipe-media-image");
  });

  it("removes a recipe from the quick list from the toggle button", () => {
    render(
      <RecipeCatalogCard
        projectId="project-1"
        recipe={{
          ...baseRecipe,
          isInQuickList: true,
        }}
        quickListSelectionId="selection-1"
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Retirer Poulet citron de la quick list",
      })
    );

    expect(removeMutate).toHaveBeenCalledWith({
      projectId: "project-1",
      selectionId: "selection-1",
    });
    expect(selectMutate).not.toHaveBeenCalled();
  });
});
