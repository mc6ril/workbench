import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client";

import { createCatalogRepository } from "./catalog/CatalogRepository.supabase";
import { createEditorCoverStorage } from "./editor/EditorCoverStorage.supabase";
import { createEditorRepository } from "./editor/EditorRepository.supabase";
import { createPlannerRepository } from "./planner/PlannerRepository.supabase";
import { createShoppingRepository } from "./shopping/ShoppingRepository.supabase";

export const catalogRepository = createCatalogRepository(
  createSupabaseBrowserClient()
);

export const editorRepository = createEditorRepository(
  createSupabaseBrowserClient()
);

export const editorCoverStorage = createEditorCoverStorage(
  createSupabaseBrowserClient()
);

export const plannerRepository = createPlannerRepository(
  createSupabaseBrowserClient()
);

export const shoppingRepository = createShoppingRepository(
  createSupabaseBrowserClient()
);

export { createCatalogRepository } from "./catalog/CatalogRepository.supabase";
export { createEditorCoverStorage } from "./editor/EditorCoverStorage.supabase";
export { createEditorRepository } from "./editor/EditorRepository.supabase";
export { createPlannerRepository } from "./planner/PlannerRepository.supabase";
export { createShoppingRepository } from "./shopping/ShoppingRepository.supabase";
