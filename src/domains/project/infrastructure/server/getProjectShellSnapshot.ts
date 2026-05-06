import { cache } from "react";
import { cookies } from "next/headers";

import {
  APP_COOKIE_KEYS,
  getCookie,
} from "@/shared/infrastructure/storage/cookies";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/server";

import type { ProjectShellSnapshot } from "@/domains/project/core/domain/projectShell.types";
import { getProjectForRoute } from "@/domains/project/infrastructure/server/getProjectForRoute";
import { getRuntimeConfigBoolean } from "@/domains/runtimeConfig/core/usecases/getRuntimeConfigBoolean";
import {
  getRuntimeConfigBooleanOverride,
  readRuntimeConfigBooleanOverridesFromCookieValue,
} from "@/domains/runtimeConfig/infrastructure/local/runtimeConfigLocalOverrides";
import { createRuntimeConfigPort } from "@/domains/runtimeConfig/infrastructure/supabase/RuntimeConfigPort.supabase";

/**
 * Resolves minimal shell state: project access (via getProjectForRoute / RLS) and recipes visibility flag.
 * Does not prefetch billing, subscription, members, or role.
 */
export const getProjectShellSnapshot = cache(
  async (projectId: string): Promise<ProjectShellSnapshot> => {
    const project = await getProjectForRoute(projectId);
    const supabaseClient = await createSupabaseServerClient();
    const cookieStore = await cookies();
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
    };
  }
);
