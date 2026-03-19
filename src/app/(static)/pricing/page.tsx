import { Suspense } from "react";
import { redirect } from "next/navigation";

import { PAGE_ROUTES } from "@/shared/constants/routes";
import Loader from "@/shared/design-system/loader";
import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";

import { getBillingVisibility } from "@/domains/billing/core/usecases/getBillingVisibility";
import { createBillingConfigRepository } from "@/domains/billing/infrastructure/supabase/BillingConfigRepository.supabase";
import PricingPage from "@/domains/billing/presentation/pages/pricing";

const Pricing = async () => {
  const supabaseClient = await createSupabaseServerClient();
  const billingConfigRepository = createBillingConfigRepository(supabaseClient);
  const isBillingVisible = await getBillingVisibility(billingConfigRepository);

  if (!isBillingVisible) {
    redirect(PAGE_ROUTES.HOME);
  }

  return (
    <Suspense fallback={<Loader />}>
      <PricingPage />
    </Suspense>
  );
};

export default Pricing;
