ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS seasonal_months smallint[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_recipes_seasonal_months
  ON public.recipes USING GIN (seasonal_months);
