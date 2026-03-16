"use client";

import { Suspense } from "react";

import Loader from "@/presentation/components/ui/Loader";
import SignupPage from "@/presentation/pages/auth/signup";

const Signup = () => {
  return (
    <Suspense fallback={<Loader />}>
      <SignupPage />
    </Suspense>
  );
};

export default Signup;
