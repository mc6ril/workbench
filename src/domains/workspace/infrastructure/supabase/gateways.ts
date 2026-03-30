import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";

import { createWorkspaceProjectCatalogGateway } from "./project/WorkspaceProjectCatalogGateway.supabase";

export const workspaceProjectCatalogGateway =
  createWorkspaceProjectCatalogGateway(createSupabaseBrowserClient());

export { createWorkspaceProjectCatalogGateway } from "./project/WorkspaceProjectCatalogGateway.supabase";
