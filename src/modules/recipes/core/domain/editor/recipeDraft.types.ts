export type RecipeDraftIngredientStatus = "validated" | "addition";

export type RecipeDraftIngredient = {
  id: string;
  status: RecipeDraftIngredientStatus;
  quantity: string;
  unit: string;
  ingredient: string;
  note: string;
};

export type RecipeDraftStep = {
  id: string;
  label: string;
  content: string;
  meta: string;
};

export type RecipeDraft = {
  id: string | null;
  title: string;
  summary: string;
  servingsLabel: string;
  totalTimeLabel: string;
  tags: string[];
  ingredients: RecipeDraftIngredient[];
  steps: RecipeDraftStep[];
};
