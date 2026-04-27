import { cache } from "react";
import { cookies } from "next/headers";

import {
  APP_COOKIE_KEYS,
  getCookie,
} from "@/shared/infrastructure/storage/cookies";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";

import { getProjectForRoute } from "./getProjectForRoute";

import { getEffectivePlan } from "@/domains/billing/core/domain/planFeatures.rules";
import { SubscriptionPlan } from "@/domains/billing/core/domain/subscription.types";
import { getUserSubscription } from "@/domains/billing/core/usecases/getUserSubscription";
import { createSubscriptionRepository } from "@/domains/billing/infrastructure/supabase/SubscriptionRepository.supabase";
import { getRuntimeConfigBoolean } from "@/domains/runtimeConfig/core/usecases/getRuntimeConfigBoolean";
import {
  getRuntimeConfigBooleanOverride,
  readRuntimeConfigBooleanOverridesFromCookieValue,
} from "@/domains/runtimeConfig/infrastructure/local/runtimeConfigLocalOverrides";
import { createRuntimeConfigPort } from "@/domains/runtimeConfig/infrastructure/supabase/RuntimeConfigPort.supabase";
import { createSessionGateway } from "@/domains/session/infrastructure/supabase/SessionGateway.supabase";

export const getProjectRouteViewState = cache(async (projectId: string) => {
  const project = await getProjectForRoute(projectId);
  const serverClient = await createSupabaseServerClient();
  const cookieStore = await cookies();
  const sessionGateway = createSessionGateway(serverClient);
  const runtimeConfigPort = createRuntimeConfigPort(serverClient);
  const session = await sessionGateway.getCurrentSession();
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

  if (!session?.userId) {
    return {
      project,
      effectivePlan: SubscriptionPlan.FREE,
      isRecipesBoardVisible,
    };
  }

  const subscriptionRepository = createSubscriptionRepository(
    serverClient,
    serverClient
  );
  const subscription = await getUserSubscription(subscriptionRepository, {
    userId: session.userId,
  });

  return {
    project,
    effectivePlan: getEffectivePlan(subscription),
    isRecipesBoardVisible,
  };
});
