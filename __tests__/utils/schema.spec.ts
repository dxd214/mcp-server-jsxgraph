import { afterEach, describe, expect, it } from "vitest";
import { z } from "zod";

describe("schema", () => {
  it("should validate basic zod schemas", () => {
    const schema = z.object({
      a: z.number(),
      b: z.string(),
      c: z.boolean(),
    });
    
    const validInput = { a: 1, b: "test", c: true };
    const invalidInput = { a: "not a number", b: 123, c: "not boolean" };
    
    expect(schema.safeParse(validInput).success).toBe(true);
    expect(schema.safeParse(invalidInput).success).toBe(false);
  });
});
