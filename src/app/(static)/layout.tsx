/**
 * Layout for static pages (legal, pricing).
 * No authentication check — accessible to all users regardless of session state.
 */
const StaticLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <>{children}</>;
};

export default StaticLayout;
