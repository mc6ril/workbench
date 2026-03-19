"use client";

import { Suspense } from "react";

import Loader from "@/shared/design-system/Loader";

import SigninPage from "@/domains/auth/presentation/pages/signin";

const Signin = () => {
  return (
    <Suspense fallback={<Loader />}>
      <SigninPage />
    </Suspense>
  );
};

export default Signin;
