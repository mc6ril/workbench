"use client";

import { Suspense } from "react";

import LandingPage from "@/presentation/pages/landing";

import Loader from "@/shared/design-system/loader";

const Landing = () => {
  return (
    <Suspense fallback={<Loader />}>
      <LandingPage />
    </Suspense>
  );
};

export default Landing;
