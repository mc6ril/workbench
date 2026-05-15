import ProjectRealtime from "@/domains/project/presentation/components/projectRealtime/ProjectRealtime";

const BoardLayout = async ({
  params,
  children,
}: {
  params: Promise<{ projectId: string }>;
  children: React.ReactNode;
}) => {
  const { projectId } = await params;

  return (
    <>
      <ProjectRealtime projectId={projectId} />
      {children}
    </>
  );
};

export default BoardLayout;
