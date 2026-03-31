/**
 * Shell layout for workspace route.
 * No data fetching - all data is fetched in the client page component.
 */
const WorkspaceLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <>{children}</>;
};

export default WorkspaceLayout;
