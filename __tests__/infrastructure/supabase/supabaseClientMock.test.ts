import type { AppSupabaseClient } from "@/shared/infrastructure/supabase/types";

import { createSupabaseClientMock } from "../../../__mocks__/infrastructure/supabase/supabaseClientMock";

describe("createSupabaseClientMock", () => {
  it("returns an AppSupabaseClient-typed object using the provided overrides", async () => {
    const signInWithPassword = jest.fn();

    const client = createSupabaseClientMock({
      auth: {
        signInWithPassword,
      } as unknown as AppSupabaseClient["auth"],
    });

    await client.auth?.signInWithPassword({
      email: "test@example.com",
      password: "password",
    });

    expect(signInWithPassword).toHaveBeenCalledTimes(1);
  });
});
