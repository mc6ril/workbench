import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";

import { createProjectRepository } from "./project/ProjectRepository.supabase";

export const projectRepository = createProjectRepository(
  createSupabaseBrowserClient()
);

export { createProjectRepository } from "./project/ProjectRepository.supabase";
