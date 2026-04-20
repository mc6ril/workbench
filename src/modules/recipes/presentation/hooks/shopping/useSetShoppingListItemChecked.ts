"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  buildShoppingList,
  type SetShoppingListItemCheckedInput,
  type ShoppingList,
} from "@/modules/recipes/core/domain/shopping/shoppingList.types";
import { setShoppingListItemChecked } from "@/modules/recipes/core/usecases/shopping/setShoppingListItemChecked";
import { shoppingRepository } from "@/modules/recipes/infrastructure/supabase/repositories";
import { recipesQueryKeys } from "@/modules/recipes/queryKeys";

export const useSetShoppingListItemChecked = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SetShoppingListItemCheckedInput) =>
      setShoppingListItemChecked({
        shoppingRepository,
      })(input),
    onMutate: async (variables) => {
      const queryKey = recipesQueryKeys.shopping.list(variables.projectId);

      await queryClient.cancelQueries({
        queryKey,
      });

      const previousShoppingList =
        queryClient.getQueryData<ShoppingList>(queryKey);

      if (previousShoppingList) {
        queryClient.setQueryData<ShoppingList>(
          queryKey,
          buildShoppingList(
            previousShoppingList.groups.map((group) => ({
              ...group,
              items: group.items.map((item) =>
                item.id === variables.itemId
                  ? {
                      ...item,
                      checked: variables.checked,
                    }
                  : item
              ),
            }))
          )
        );
      }

      return {
        previousShoppingList,
      };
    },
    onError: (_error, variables, context) => {
      if (!context?.previousShoppingList) {
        return;
      }

      queryClient.setQueryData(
        recipesQueryKeys.shopping.list(variables.projectId),
        context.previousShoppingList
      );
    },
    onSettled: (_result, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: recipesQueryKeys.shopping.list(variables.projectId),
      });
    },
  });
};
