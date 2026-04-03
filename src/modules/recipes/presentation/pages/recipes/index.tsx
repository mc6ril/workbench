import { APP_LIMITS } from "@/shared/constants/app";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";

import { listCatalogRecipes } from "@/modules/recipes/core/usecases/catalog/listCatalogRecipes";
import { listActiveSelections } from "@/modules/recipes/core/usecases/planner/listActiveSelections";
import { createCatalogRepository } from "@/modules/recipes/infrastructure/supabase/catalog/CatalogRepository.supabase";
import { createPlannerRepository } from "@/modules/recipes/infrastructure/supabase/planner/PlannerRepository.supabase";
import RecipesCatalogClientPage from "@/modules/recipes/presentation/components/catalog/RecipesCatalogClientPage/index";
import {
  parseRecipesCatalogSearchParams,
  type RecipesCatalogQueryState,
} from "@/modules/recipes/presentation/routing/catalogSearchParams";

type Props = {
  projectId: string;
  searchParams?: Record<string, string | string[] | undefined>;
};

const RecipesPage = async ({ projectId, searchParams = {} }: Props) => {
  const initialQueryState: RecipesCatalogQueryState =
    parseRecipesCatalogSearchParams(searchParams);
  const supabaseClient = await createSupabaseServerClient();
  const catalogRepository = createCatalogRepository(supabaseClient);
  const plannerRepository = createPlannerRepository(supabaseClient);
  const [initialRecipesPage, quickListRecipes] = await Promise.all([
    listCatalogRecipes({
      catalogRepository,
    })({
      projectId,
      filters: {
        search: initialQueryState.search,
        filterOptionIds: initialQueryState.filterOptionIds,
      },
      pagination: {
        pageSize: APP_LIMITS.PAGINATION.DEFAULT_PAGE_SIZE,
      },
    }),
    listActiveSelections({
      plannerRepository,
    })(projectId),
  ]);

  return (
    <RecipesCatalogClientPage
      projectId={projectId}
      initialRecipesPage={initialRecipesPage}
      initialQueryState={initialQueryState}
      quickListRecipes={quickListRecipes}
    />
  );
};

export default RecipesPage;
