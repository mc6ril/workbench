const recipesQueryKeysObject = {
  root: (projectId: string) => ["recipes", projectId] as const,
  catalog: {
    all: (projectId: string) => ["recipes", projectId, "catalog"] as const,
    detail: (projectId: string, recipeId: string) =>
      ["recipes", projectId, "catalog", recipeId] as const,
  },
  planner: {
    quickList: (projectId: string) =>
      ["recipes", projectId, "planner", "quick-list"] as const,
  },
  shopping: {
    list: (projectId: string) =>
      ["recipes", projectId, "shopping", "list"] as const,
  },
  editor: {
    create: (projectId: string) =>
      ["recipes", projectId, "editor", "create"] as const,
    edit: (projectId: string, recipeId: string) =>
      ["recipes", projectId, "editor", "edit", recipeId] as const,
  },
} as const;

export const recipesQueryKeys = Object.freeze({
  root: recipesQueryKeysObject.root,
  catalog: Object.freeze(recipesQueryKeysObject.catalog),
  planner: Object.freeze(recipesQueryKeysObject.planner),
  shopping: Object.freeze(recipesQueryKeysObject.shopping),
  editor: Object.freeze(recipesQueryKeysObject.editor),
});
