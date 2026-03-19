"use client";

import { Suspense } from "react";

import Loader from "@/shared/design-system/Loader";

import SignupPage from "@/domains/auth/presentation/pages/signup";

const Signup = () => {
  return (
    <Suspense fallback={<Loader />}>
      <SignupPage />
    </Suspense>
  );
};

export default Signup;
