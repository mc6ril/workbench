import ProjectLoading from "@/app/(protected)/[projectId]/loading";
import RecipesRoutePage from "@/app/(protected)/[projectId]/recipes/page";
import { withRecipesRouteAccess } from "@/modules/recipes/presentation/pages/shared/withRecipesRouteAccess";

const recipesPageMock = jest.fn((_props: unknown) => <div>Recipes content</div>);

jest.mock("@/modules/recipes/presentation/pages/recipes", () => ({
  __esModule: true,
  default: (props: unknown) => recipesPageMock(props),
}));

jest.mock("@/modules/recipes/presentation/pages/shared/withRecipesRouteAccess", () => ({
  withRecipesRouteAccess: jest.fn(),
}));

describe("Recipes route page", () => {
  it("moves access checks into a Suspense boundary (route returns immediately)", async () => {
    const result = await RecipesRoutePage({
      params: Promise.resolve({ projectId: "project-1" }),
      searchParams: Promise.resolve({ search: "pasta" }),
    });

    expect(withRecipesRouteAccess).not.toHaveBeenCalled();
    expect(recipesPageMock).not.toHaveBeenCalled();
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
