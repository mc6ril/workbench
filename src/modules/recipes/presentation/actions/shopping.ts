"use server";

import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";

import { generateShoppingList } from "@/modules/recipes/core/usecases/shopping/generateShoppingList";
import { createShoppingRepository } from "@/modules/recipes/infrastructure/supabase/shopping/ShoppingRepository.supabase";

export const regenerateShoppingListAction = async (
  projectId: string
): Promise<void> => {
  const supabaseClient = await createSupabaseServerClient();
  const shoppingRepository = createShoppingRepository(supabaseClient);
  await generateShoppingList({ shoppingRepository })(projectId);
};
