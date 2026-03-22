import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";

import { createWorkspaceProjectCatalogRepository } from "./project/Repository.supabase";

export const workspaceProjectCatalogRepository =
  createWorkspaceProjectCatalogRepository(createSupabaseBrowserClient());

export { createWorkspaceProjectCatalogRepository } from "./project/Repository.supabase";
