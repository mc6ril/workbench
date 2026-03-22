import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";

import { createWorkspaceProjectCatalogRepository } from "./project/WorkspaceProjectCatalogRepository.supabase";

export const workspaceProjectCatalogRepository =
  createWorkspaceProjectCatalogRepository(createSupabaseBrowserClient());

export { createWorkspaceProjectCatalogRepository } from "./project/WorkspaceProjectCatalogRepository.supabase";
