import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";

import {
  parseRecipesCatalogSearchParams,
  type RecipesCatalogQueryState,
} from "./catalogSearchParams";

import { listCatalogRecipes } from "@/modules/recipes/core/usecases/catalog/listCatalogRecipes";
import { listCatalogRecipeTags } from "@/modules/recipes/core/usecases/catalog/listCatalogRecipeTags";
import { listActiveSelections } from "@/modules/recipes/core/usecases/planner/listActiveSelections";
import { createCatalogRepository } from "@/modules/recipes/infrastructure/supabase/catalog/CatalogRepository.supabase";
import { createPlannerRepository } from "@/modules/recipes/infrastructure/supabase/planner/PlannerRepository.supabase";
import RecipesCatalogClientPage from "@/modules/recipes/presentation/components/catalog/RecipesCatalogClientPage";

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
  const [initialRecipes, initialTags, quickListRecipes] = await Promise.all([
    listCatalogRecipes({
      catalogRepository,
    })({
      projectId,
      filters: {
        search: initialQueryState.search,
        tagSlugs: initialQueryState.tagSlugs,
      },
    }),
    listCatalogRecipeTags({
      catalogRepository,
    })(projectId),
    listActiveSelections({
      plannerRepository,
    })(projectId),
  ]);

  return (
    <RecipesCatalogClientPage
      projectId={projectId}
      initialRecipes={initialRecipes}
      initialTags={initialTags}
      initialQueryState={initialQueryState}
      quickListRecipes={quickListRecipes}
    />
  );
};

export default RecipesPage;
