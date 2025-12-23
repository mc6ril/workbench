import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseClientMock } from "./supabaseClientMock";

describe("createSupabaseClientMock", () => {
  it("returns a SupabaseClient-typed object using the provided overrides", async () => {
    const signInWithPassword = jest.fn();

    const client = createSupabaseClientMock({
      auth: {
        signInWithPassword,
      } as unknown as SupabaseClient["auth"],
    });

    await client.auth?.signInWithPassword({
      email: "test@example.com",
      password: "password",
    });

    expect(signInWithPassword).toHaveBeenCalledTimes(1);
  });
});
