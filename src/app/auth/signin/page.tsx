"use client";

import { Suspense } from "react";

import Loader from "@/presentation/components/ui/Loader";
import SigninPage from "@/presentation/pages/auth/signin";

const Signin = () => {
  return (
    <Suspense fallback={<Loader />}>
      <SigninPage />
    </Suspense>
  );
};

export default Signin;
