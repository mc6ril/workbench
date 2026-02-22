"use client";

import { Suspense } from "react";

import Loader from "@/presentation/components/ui/Loader";
import AccountPage from "@/presentation/pages/account";

const AccountRoutePage = () => {
  return (
    <Suspense fallback={<Loader />}>
      <AccountPage />
    </Suspense>
  );
};

export default AccountRoutePage;
