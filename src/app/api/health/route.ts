import { NextResponse } from "next/server";

import { createSupabaseAnonServerClient } from "@/shared/infrastructure/supabase/server";

export const GET = async () => {
  try {
    const client = createSupabaseAnonServerClient();
    await client.from("app_runtime_config").select("key").limit(1);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
};
