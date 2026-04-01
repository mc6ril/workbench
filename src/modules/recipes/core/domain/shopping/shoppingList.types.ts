export type ShoppingListItem = {
  id: string;
  label: string;
  checked: boolean;
  note: string | null;
  source: "base" | "addition";
};

export type ShoppingListGroup = {
  id: string;
  title: string;
  items: ShoppingListItem[];
};

export type ShoppingList = {
  groups: ShoppingListGroup[];
  checkedCount: number;
  pendingCount: number;
};
