export type CatalogRecipeTag = string;

export type CatalogRecipeSummary = {
  id: string;
  title: string;
  summary: string;
  totalTimeLabel: string;
  servingsLabel: string;
  tags: CatalogRecipeTag[];
  coverStyle: "citrus" | "tomato" | "sage" | "neutral";
  isInQuickList: boolean;
};

export type CatalogRecipeDetail = CatalogRecipeSummary & {
  note: string | null;
  ingredients: string[];
  steps: string[];
};
