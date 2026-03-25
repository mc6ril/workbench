import { useQuery } from "@tanstack/react-query";

import { hasProjectComments } from "@/modules/board/core/usecases/comment";
import { commentRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

export const useHasProjectComments = (
  projectId: string,
  options?: {
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: queryKeys.comments.byProject(projectId),
    queryFn: () => hasProjectComments(projectId, commentRepository),
    enabled: !!projectId && (options?.enabled ?? true),
  });
};
