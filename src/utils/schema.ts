import { z } from "zod";
import { zodToJsonSchema as convertZodToJsonSchema } from "zod-to-json-schema";

// TODO: use zod v4 JSON to schema to replace zod-to-json-schema when v4 is stable
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const createJsonSchema = (schema: Record<string, z.ZodType<any>>) => {
  return convertZodToJsonSchema(z.object(schema), {
    rejectedAdditionalProperties: undefined,
  });
};
