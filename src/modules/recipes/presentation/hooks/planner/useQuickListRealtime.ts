"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client";

import { regenerateShoppingListAction } from "@/modules/recipes/presentation/actions/shopping";
import { recipesQueryKeys } from "@/modules/recipes/queryKeys";

export const useQuickListRealtime = (projectId: string) => {
  const queryClient = useQueryClient();
  const regenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const supabase = createSupabaseBrowserClient();
    const channelName = `recipes:${projectId}:quick-list`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "recipe_selections",
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: recipesQueryKeys.planner.quickList(projectId),
            refetchType: "active",
          });

          // Debounce rapid selection changes into one regen.
          // Invalidate the shopping list only once the server write is done
          // so getShoppingList always reads fresh data.
          if (regenTimeoutRef.current) clearTimeout(regenTimeoutRef.current);
          regenTimeoutRef.current = setTimeout(() => {
            void regenerateShoppingListAction(projectId).finally(() => {
              void queryClient.invalidateQueries({
                queryKey: recipesQueryKeys.shopping.list(projectId),
                refetchType: "active",
              });
            });
          }, 300);
        }
      )
      .subscribe();

    return () => {
      if (regenTimeoutRef.current) clearTimeout(regenTimeoutRef.current);
      void supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);
};
