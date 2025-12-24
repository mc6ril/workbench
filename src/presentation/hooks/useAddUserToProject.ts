import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addUserToProject } from "@/core/usecases/addUserToProject";

import { projectRepositorySupabase } from "@/infrastructure/supabase/repositories/projectRepositorySupabase";

import { queryKeys } from "./queryKeys";

/**
 * Hook for adding the current user to a project.
 *
 * @returns Mutation object with mutate, mutateAsync, data, isPending, error, etc.
 */
export const useAddUserToProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      role,
    }: {
      projectId: string;
      role?: "admin" | "member" | "viewer";
    }) =>
      addUserToProject(projectRepositorySupabase, projectId, role),
    onSuccess: () => {
      // Invalidate and refetch projects list to refresh the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() });
    },
    onSettled: () => {
      // Force refetch after mutation settles (success or error) to ensure UI is up to date
      queryClient.refetchQueries({ queryKey: queryKeys.projects.all() });
    },
  });
};

