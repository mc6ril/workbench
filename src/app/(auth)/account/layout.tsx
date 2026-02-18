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
