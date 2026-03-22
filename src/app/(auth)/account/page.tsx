"use client";

import { Suspense } from "react";

import Loader from "@/shared/design-system/loader";

import AccountPage from "@/domains/settings/presentation/pages/account";

const AccountRoutePage = () => {
  return (
    <Suspense fallback={<Loader />}>
      <AccountPage />
    </Suspense>
  );
};

export default AccountRoutePage;
