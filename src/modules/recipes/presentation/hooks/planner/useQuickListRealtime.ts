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

          // Debounce regeneration so rapid selection changes produce one regen.
          // The shopping list is invalidated by the shopping_list_items subscription
          // once the write completes — no need to await here.
          if (regenTimeoutRef.current) clearTimeout(regenTimeoutRef.current);
          regenTimeoutRef.current = setTimeout(() => {
            void regenerateShoppingListAction(projectId);
          }, 300);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shopping_list_items",
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: recipesQueryKeys.shopping.list(projectId),
            refetchType: "active",
          });
        }
      )
      .subscribe();

    return () => {
      if (regenTimeoutRef.current) clearTimeout(regenTimeoutRef.current);
      void supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);
};
