import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#2a1f1a" },
  ],
  viewportFit: "cover",
  initialScale: 1,
  maximumScale: 1,
};

/**
 * Shell layout for account route.
 * No data fetching - all data is fetched in the client page component.
 */
const AccountLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <>{children}</>;
};

export default AccountLayout;
