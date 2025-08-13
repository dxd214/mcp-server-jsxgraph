import { z } from "zod";

// Use require for better compatibility with CommonJS
const zodToJsonSchemaOriginal = require("zod-to-json-schema");

// TODO: use zod v4 JSON to schema to replace zod-to-json-schema when v4 is stable
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const zodToJsonSchema = (schema: Record<string, z.ZodType<any>>) => {
  return zodToJsonSchemaOriginal(z.object(schema), {
    rejectedAdditionalProperties: undefined,
  });
};
