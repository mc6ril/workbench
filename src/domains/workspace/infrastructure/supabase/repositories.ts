import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";

import { createWorkspaceProjectRepository } from "./project/ProjectRepository.supabase";

export const workspaceProjectRepository = createWorkspaceProjectRepository(
  createSupabaseBrowserClient()
);

export { createWorkspaceProjectRepository } from "./project/ProjectRepository.supabase";
