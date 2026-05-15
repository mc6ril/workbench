-- Add status to recipe_selections: 'pending' = in shopping list, 'shopping_done' = bought, not yet cooked
ALTER TABLE public.recipe_selections
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
  CONSTRAINT recipe_selections_status_check CHECK (status IN ('pending', 'shopping_done'));

-- Create recipe_cooking_history to record when a project cooks a recipe
CREATE TABLE IF NOT EXISTS public.recipe_cooking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL,
  cooked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.recipe_cooking_history ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_recipe_cooking_history_project_id
  ON public.recipe_cooking_history(project_id);

CREATE INDEX IF NOT EXISTS idx_recipe_cooking_history_recipe_project
  ON public.recipe_cooking_history(recipe_id, project_id);

CREATE POLICY "Recipe cooking history members can view"
ON public.recipe_cooking_history
FOR SELECT
USING ((select public.is_project_member(project_id)));

CREATE POLICY "Recipe cooking history editors can insert"
ON public.recipe_cooking_history
FOR INSERT
WITH CHECK ((select public.can_edit_project(project_id)));

CREATE POLICY "Recipe cooking history editors can delete"
ON public.recipe_cooking_history
FOR DELETE
USING ((select public.can_edit_project(project_id)));
