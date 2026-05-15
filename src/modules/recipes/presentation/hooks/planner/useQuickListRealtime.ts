"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client";

import { recipesQueryKeys } from "@/modules/recipes/queryKeys";

/**
 * Subscribe to recipe_selections changes so any device that mutates the quick
 * list is immediately reflected on all other open sessions for the same project.
 */
export const useQuickListRealtime = (projectId: string) => {
  const queryClient = useQueryClient();

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
          void queryClient.invalidateQueries({
            queryKey: recipesQueryKeys.shopping.list(projectId),
            refetchType: "active",
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);
};
