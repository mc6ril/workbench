"use client";

import { Suspense } from "react";

import PricingPage from "@/domains/billing/presentation/pages/pricing";

import Loader from "@/shared/design-system/Loader";

const Pricing = () => {
  return (
    <Suspense fallback={<Loader />}>
      <PricingPage />
    </Suspense>
  );
};

export default Pricing;
