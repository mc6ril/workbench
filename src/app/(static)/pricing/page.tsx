"use client";

import { Suspense } from "react";

import Loader from "@/shared/design-system/Loader";

import PricingPage from "@/domains/billing/presentation/pages/pricing";

const Pricing = () => {
  return (
    <Suspense fallback={<Loader />}>
      <PricingPage />
    </Suspense>
  );
};

export default Pricing;
