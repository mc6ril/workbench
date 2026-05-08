import { cache } from "react";
import { cookies } from "next/headers";

import {
  APP_COOKIE_KEYS,
  getCookie,
} from "@/shared/infrastructure/storage/cookies";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";

import type { ProjectShellSnapshot } from "@/domains/project/core/domain/projectShell.types";
import { getCurrentProjectRole } from "@/domains/project/core/usecases/member/getCurrentProjectRole";
import { getProjectForRoute } from "@/domains/project/infrastructure/server/getProjectForRoute";
import { createProjectMemberGateway } from "@/domains/project/infrastructure/supabase/gateways";
import { getRuntimeConfigBoolean } from "@/domains/runtimeConfig/core/usecases/getRuntimeConfigBoolean";
import {
  getRuntimeConfigBooleanOverride,
  readRuntimeConfigBooleanOverridesFromCookieValue,
} from "@/domains/runtimeConfig/infrastructure/local/runtimeConfigLocalOverrides";
import { createRuntimeConfigPort } from "@/domains/runtimeConfig/infrastructure/supabase/RuntimeConfigPort.supabase";

/**
 * Resolves minimal shell state server-side: project access, recipes visibility, and user role.
 * Role is resolved here to avoid a blocking client-side fetch on every project navigation.
 */
export const getProjectShellSnapshot = cache(
  async (projectId: string): Promise<ProjectShellSnapshot> => {
    const supabaseClient = await createSupabaseServerClient();
    const cookieStore = await cookies();

    const [project, role] = await Promise.all([
      getProjectForRoute(projectId),
      getCurrentProjectRole(
        createProjectMemberGateway(supabaseClient),
        projectId
      ),
    ]);

    const runtimeConfigPort = createRuntimeConfigPort(supabaseClient);
    const runtimeConfigOverrides =
      readRuntimeConfigBooleanOverridesFromCookieValue(
        getCookie(APP_COOKIE_KEYS.RUNTIME_CONFIG_OVERRIDES, cookieStore)
      );
    const recipesBoardOverride = getRuntimeConfigBooleanOverride(
      runtimeConfigOverrides,
      "is_recipes_board_visible"
    );
    const isRecipesBoardVisible = await getRuntimeConfigBoolean(
      runtimeConfigPort,
      {
        key: "is_recipes_board_visible",
        defaultValue: false,
        overrideValue: recipesBoardOverride,
      }
    );

    return {
      projectId: project.id,
      enabledModules: project.enabledModules,
      isRecipesBoardVisible,
      role,
    };
  }
);
