"use client";

import { Suspense } from "react";

import SigninPage from "@/domains/auth/presentation/pages/signin";

import Loader from "@/shared/design-system/Loader";

const Signin = () => {
  return (
    <Suspense fallback={<Loader />}>
      <SigninPage />
    </Suspense>
  );
};

export default Signin;
