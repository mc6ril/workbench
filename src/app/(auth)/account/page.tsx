"use client";

import { Suspense } from "react";

import Loader from "@/shared/design-system/Loader";

import AccountPage from "@/domains/auth/presentation/pages/account";

const AccountRoutePage = () => {
  return (
    <Suspense fallback={<Loader />}>
      <AccountPage />
    </Suspense>
  );
};

export default AccountRoutePage;
