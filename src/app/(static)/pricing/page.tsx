"use client";

import { Suspense } from "react";

import Loader from "@/presentation/components/ui/Loader";
import PricingPage from "@/presentation/pages/pricing";

const Pricing = () => {
  return (
    <Suspense fallback={<Loader />}>
      <PricingPage />
    </Suspense>
  );
};

export default Pricing;
