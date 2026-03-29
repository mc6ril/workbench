import { z } from "zod";

import { ProjectSchema } from "@/domains/project/core/domain/schema/project.schema";

const baseProject = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  name: "Projet Alpha",
  shortCode: "PA",
  boardEmoji: "📋",
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-02T00:00:00Z"),
};

describe("ProjectSchema", () => {
  it("normalizes a valid short code to trimmed uppercase letters", () => {
    const result = ProjectSchema.parse({
      ...baseProject,
      shortCode: " pa ",
    });

    expect(result.shortCode).toBe("PA");
  });

  it("rejects a short code that contains an emoji", () => {
    expect(() =>
      ProjectSchema.parse({
        ...baseProject,
        shortCode: "📋A",
      })
    ).toThrow(z.ZodError);
  });

  it("rejects a short code that is not exactly two letters", () => {
    expect(() =>
      ProjectSchema.parse({
        ...baseProject,
        shortCode: "A1",
      })
    ).toThrow(z.ZodError);
  });
});
