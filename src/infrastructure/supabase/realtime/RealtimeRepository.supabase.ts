import { mapEpicRowToDomain } from "@/infrastructure/supabase/epic/EpicMapper.supabase";
import { mapLabelRowToDomain } from "@/infrastructure/supabase/label/LabelMapper.supabase";
import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";
import { mapSprintRowToDomain } from "@/infrastructure/supabase/sprint/SprintMapper.supabase";
import { mapTicketRowToDomain } from "@/infrastructure/supabase/ticket/TicketMapper.supabase";
import type {
  EpicRow,
  LabelRow,
  SprintRow,
  TicketRow,
} from "@/infrastructure/supabase/types";

import type { RealtimeRepository } from "@/core/ports/realtimeRepository";

type BrowserSupabaseClient = ReturnType<typeof createSupabaseBrowserClient>;
type SupabaseChannel = ReturnType<BrowserSupabaseClient["channel"]>;
type SupabaseChannelSubscription = ReturnType<SupabaseChannel["subscribe"]>;

/**
 * Supabase implementation of the realtime repository port.
 * Keeps Supabase channel and row mapping details in Infrastructure.
 */
export const createRealtimeRepository = (
  supabaseClient: BrowserSupabaseClient
): RealtimeRepository => {
  return {
    createChannel: (channelName: string) => {
      return supabaseClient.channel(channelName);
    },
    removeChannel: async (subscription) => {
      await supabaseClient.removeChannel(
        subscription as SupabaseChannelSubscription
      );
    },
    mapTicketRowToDomain: (row) => {
      return mapTicketRowToDomain(row as TicketRow);
    },
    mapEpicRowToDomain: (row) => {
      return mapEpicRowToDomain(row as EpicRow);
    },
    mapLabelRowToDomain: (row) => {
      return mapLabelRowToDomain(row as LabelRow);
    },
    mapSprintRowToDomain: (row) => {
      return mapSprintRowToDomain(row as SprintRow);
    },
  };
};
