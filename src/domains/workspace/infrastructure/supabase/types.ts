import type { RpcRow } from "@/shared/infrastructure/supabase/types";

export type ProjectWithStatsRow = RpcRow<"get_projects_with_stats">;
export type ReclaimableProjectRow = RpcRow<"get_reclaimable_projects">;
