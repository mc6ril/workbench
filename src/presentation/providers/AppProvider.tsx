"use client";

import type { PropsWithChildren } from "react";

import ReactQueryProvider from "@/presentation/providers/ReactQueryProvider";

type Props = PropsWithChildren;

/**
 * Central place for global providers.
 * Keep this file free of business logic and side effects.
 */
const AppProvider = ({ children }: Props) => {
  return <ReactQueryProvider>{children}</ReactQueryProvider>;
};

export default AppProvider;
