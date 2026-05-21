"use server";

import { revalidatePath } from "next/cache";

export const revalidateRecipeDetailCache = async (
  projectId: string,
  recipeId: string
): Promise<void> => {
  revalidatePath(`/${projectId}/recipes/${recipeId}`);
};
