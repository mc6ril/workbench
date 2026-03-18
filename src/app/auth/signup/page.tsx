"use client";

import { Suspense } from "react";

import Loader from "@/shared/design-system/Loader";
import SignupPage from "@/presentation/pages/auth/signup";

const Signup = () => {
  return (
    <Suspense fallback={<Loader />}>
      <SignupPage />
    </Suspense>
  );
};

export default Signup;
