"use client";

import { Suspense } from "react";

import SignupPage from "@/presentation/pages/auth/signup";

import Loader from "@/shared/design-system/Loader";

const Signup = () => {
  return (
    <Suspense fallback={<Loader />}>
      <SignupPage />
    </Suspense>
  );
};

export default Signup;
