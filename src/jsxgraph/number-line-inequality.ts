import { z } from "zod";
import { zodToJsonSchema } from "../utils";
import {
  JSXGraphThemeSchema,
  JSXGraphBackgroundColorSchema,
  JSXGraphGridSchema,
  JSXGraphAxisSchema,
  JSXGraphWidthSchema,
  JSXGraphHeightSchema,
  JSXGraphTitleSchema,
  BoundingBoxSchema,
  KeepAspectRatioSchema,
  ShowCopyrightSchema,
  ShowNavigationSchema,
  ZoomSchema,
  PanSchema,
} from "./jsxgraph-base";

// Inequality data schema
const InequalityDataSchema = z.object({
  expression: z.string().describe("Inequality expression, e.g., 'x > 2', 'x <= -1', '2 < x < 5'"),
  color: z.string().optional().default("#0066cc").describe("Color of the inequality region"),
  strokeWidth: z.number().optional().default(3).describe("Width of the inequality line"),
  name: z.string().optional().describe("Name/label for the inequality"),
  showEndpoints: z.boolean().optional().default(true).describe("Whether to show endpoint circles"),
  endpointRadius: z.number().optional().default(0.15).describe("Radius of endpoint circles"),
});

// Number line inequality input schema
const schema = {
  inequalities: z
    .array(InequalityDataSchema)
    .describe("Array of inequalities to plot on the number line. Each inequality defines a region on the line.")
    .nonempty({ message: "At least one inequality is required." }),
  numberLinePosition: z
    .number()
    .optional()
    .default(0)
    .describe("Y coordinate position of the number line"),
  tickMarks: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show tick marks on the number line"),
  tickInterval: z
    .number()
    .optional()
    .default(1)
    .describe("Interval between tick marks"),
  showNumbers: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show numbers on tick marks"),
  numberInterval: z
    .number()
    .optional()
    .default(1)
    .describe("Interval between number labels"),
  style: z
    .object({
      theme: JSXGraphThemeSchema,
      backgroundColor: JSXGraphBackgroundColorSchema,
      grid: JSXGraphGridSchema,
      axis: JSXGraphAxisSchema,
    })
    .optional()
    .describe("Custom style configuration for the chart."),
  width: JSXGraphWidthSchema,
  height: JSXGraphHeightSchema,
  title: JSXGraphTitleSchema,
  boundingBox: BoundingBoxSchema,
  keepAspectRatio: KeepAspectRatioSchema,
  showCopyright: ShowCopyrightSchema,
  showNavigation: ShowNavigationSchema,
  zoom: ZoomSchema,
  pan: PanSchema,
};

// Number line inequality tool descriptor
const tool = {
  name: "generate_number_line_inequality",
  description:
    "Generate a number line inequality visualization using JSXGraph. Supports plotting multiple inequalities on a number line with endpoints, intervals, and custom styling. Ideal for visualizing solutions to inequalities like x > 2, x <= -1, or compound inequalities.",
  inputSchema: zodToJsonSchema(schema),
};

export const numberLineInequality = {
  schema,
  tool,
};