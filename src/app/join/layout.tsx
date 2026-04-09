import type { ReactNode } from "react";
import type { Metadata } from "next";

import AppProvider from "@/shared/providers/AppProvider";
import { noIndexMetadata } from "@/shared/seo/noIndexMetadata";

type Props = {
  children: ReactNode;
};

export const metadata: Metadata = noIndexMetadata;

const JoinLayout = async ({ children }: Props) => {
  return <AppProvider>{children}</AppProvider>;
};

export default JoinLayout;
