import RecipesRealtime from "@/modules/recipes/presentation/components/RecipesRealtime";

const RecipesLayout = async ({
  params,
  children,
}: {
  params: Promise<{ projectId: string }>;
  children: React.ReactNode;
}) => {
  const { projectId } = await params;

  return (
    <>
      <RecipesRealtime projectId={projectId} />
      {children}
    </>
  );
};

export default RecipesLayout;
