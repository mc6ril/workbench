"use client";

import { Suspense } from "react";

import Loader from "@/presentation/components/ui/Loader";
import LandingPage from "@/presentation/pages/landing";

const Landing = () => {
  return (
    <Suspense fallback={<Loader />}>
      <LandingPage />
    </Suspense>
  );
};

export default Landing;
