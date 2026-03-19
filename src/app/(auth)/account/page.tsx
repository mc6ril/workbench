"use client";

import { Suspense } from "react";

import AccountPage from "@/domains/auth/presentation/pages/account";

import Loader from "@/shared/design-system/Loader";

const AccountRoutePage = () => {
  return (
    <Suspense fallback={<Loader />}>
      <AccountPage />
    </Suspense>
  );
};

export default AccountRoutePage;
