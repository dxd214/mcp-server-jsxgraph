import { z } from "zod";

// JSXGraph 基础配置 schema
export const JSXGraphThemeSchema = z
  .enum(["default", "dark", "light"])
  .optional()
  .default("default")
  .describe("Set the theme for the math chart.");

export const JSXGraphBackgroundColorSchema = z
  .string()
  .optional()
  .default("#ffffff")
  .describe("Background color of the math chart, such as '#fff'.");

export const JSXGraphGridSchema = z
  .boolean()
  .optional()
  .default(true)
  .describe("Whether to show grid lines.");

export const JSXGraphAxisSchema = z
  .boolean()
  .optional()
  .default(true)
  .describe("Whether to show axis lines.");

export const JSXGraphWidthSchema = z
  .number()
  .optional()
  .default(800)
  .describe("Set the width of the math chart, default is 800.");

export const JSXGraphHeightSchema = z
  .number()
  .optional()
  .default(600)
  .describe("Set the height of the math chart, default is 600.");

export const JSXGraphTitleSchema = z
  .string()
  .optional()
  .default("")
  .describe("Set the title of the math chart.");

export const BoundingBoxSchema = z
  .array(z.number())
  .length(4)
  .optional()
  .default([-10, 10, 10, -10])
  .describe(
    "The bounding box for the chart [xmin, ymax, xmax, ymin], default is [-10, 10, 10, -10].",
  );

export const KeepAspectRatioSchema = z
  .boolean()
  .optional()
  .default(false)
  .describe("Whether to keep aspect ratio.");

export const ShowCopyrightSchema = z
  .boolean()
  .optional()
  .default(false)
  .describe("Whether to show JSXGraph copyright.");

export const ShowNavigationSchema = z
  .boolean()
  .optional()
  .default(true)
  .describe("Whether to show navigation controls.");

export const ZoomSchema = z
  .object({
    enabled: z.boolean().optional().default(true),
    factorX: z.number().optional().default(1.25),
    factorY: z.number().optional().default(1.25),
    wheel: z.boolean().optional().default(true),
    needShift: z.boolean().optional().default(false),
    min: z.number().optional().default(0.1),
    max: z.number().optional().default(10.0),
  })
  .optional()
  .describe("Zoom configuration for the chart.");

export const PanSchema = z
  .object({
    enabled: z.boolean().optional().default(true),
    needShift: z.boolean().optional().default(false),
    needTwoFingers: z.boolean().optional().default(false),
  })
  .optional()
  .describe("Pan configuration for the chart.");
