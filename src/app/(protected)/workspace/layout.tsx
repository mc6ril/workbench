/**
 * Shell layout for workspace route.
 * No layout-level data fetching. Route data is hydrated in the page component.
 */
const WorkspaceLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <>{children}</>;
};

export default WorkspaceLayout;
