import type { TableRow } from "@/shared/infrastructure/supabase/types";

export type ProjectRow = Pick<
  TableRow<"projects">,
  | "id"
  | "name"
  | "short_code"
  | "board_emoji"
  | "enabled_modules"
  | "created_at"
  | "updated_at"
>;

export type ProjectMemberRow = TableRow<"project_members">;

export type InvitationRow = TableRow<"project_invitations">;
