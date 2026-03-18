"use client";

import { Suspense } from "react";

import LandingPage from "@/presentation/pages/landing";

import Loader from "@/shared/design-system/Loader";

const Landing = () => {
  return (
    <Suspense fallback={<Loader />}>
      <LandingPage />
    </Suspense>
  );
};

export default Landing;
