import type {
  EpicRow,
  LabelRow,
  SprintRow,
  TicketRow,
} from "@/shared/infrastructure/types";

import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";

import type { RealtimeRepository } from "@/modules/board/core/ports/realtimeRepository";
import { mapEpicRowToDomain } from "@/modules/board/infrastructure/supabase/epic/EpicMapper.supabase";
import { mapLabelRowToDomain } from "@/modules/board/infrastructure/supabase/label/LabelMapper.supabase";
import { mapSprintRowToDomain } from "@/modules/board/infrastructure/supabase/sprint/SprintMapper.supabase";
import { mapTicketRowToDomain } from "@/modules/board/infrastructure/supabase/ticket/TicketMapper.supabase";

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
