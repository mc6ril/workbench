import { Suspense } from "react";
import { redirect } from "next/navigation";

import LandingPage from "@/presentation/pages/landing";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import Loader from "@/shared/design-system/loader";
import { isNotFoundError } from "@/shared/errors/repositoryError.guards";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";
import { createLoggerFactory } from "@/shared/observability";
import WebsiteJsonLd from "@/shared/seo/WebsiteJsonLd";
import { isDynamicServerUsageError } from "@/shared/utils/nextErrors";

import { getCurrentSession } from "@/domains/session/core/usecases/getCurrentSession";
import { createSessionGateway } from "@/domains/session/infrastructure/supabase/repositories";

const logger = createLoggerFactory().forScope("MarketingHomePage");

/**
 * Marketing home: redirects authenticated users to the workspace; otherwise shows the landing page.
 */
const MarketingHomePage = async () => {
  try {
    const supabaseClient = await createSupabaseServerClient();
    const sessionGateway = createSessionGateway(supabaseClient);
    await getCurrentSession(sessionGateway);
    redirect(PAGE_ROUTES.WORKSPACE);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    if (isDynamicServerUsageError(error)) {
      throw error;
    }

    if (!isNotFoundError(error)) {
      logger.error("Auth check error", { error });
    }
  }

  return (
    <>
      <WebsiteJsonLd />
      <Suspense fallback={<Loader />}>
        <LandingPage />
      </Suspense>
    </>
  );
};

export default MarketingHomePage;
