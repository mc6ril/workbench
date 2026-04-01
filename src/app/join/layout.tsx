import type { ReactNode } from "react";
import type { Metadata } from "next";

import RequestLocaleAppProviders from "@/shared/providers/RequestLocaleAppProviders";
import { noIndexMetadata } from "@/shared/seo/noIndexMetadata";

type Props = {
  children: ReactNode;
};

export const metadata: Metadata = noIndexMetadata;

const JoinLayout = async ({ children }: Props) => {
  return <RequestLocaleAppProviders>{children}</RequestLocaleAppProviders>;
};

export default JoinLayout;
