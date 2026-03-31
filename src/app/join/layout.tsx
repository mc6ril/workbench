import type { ReactNode } from "react";
import type { Metadata } from "next";

type Props = {
  children: ReactNode;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

const JoinLayout = ({ children }: Props) => {
  return <>{children}</>;
};

export default JoinLayout;
