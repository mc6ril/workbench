"use client";

import { Suspense } from "react";

import SigninPage from "@/presentation/pages/auth/signin";

import Loader from "@/shared/design-system/Loader";

const Signin = () => {
  return (
    <Suspense fallback={<Loader />}>
      <SigninPage />
    </Suspense>
  );
};

export default Signin;
