import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  BoundingBoxSchema,
  JSXGraphAxisSchema,
  JSXGraphBackgroundColorSchema,
  JSXGraphGridSchema,
  JSXGraphHeightSchema,
  JSXGraphThemeSchema,
  JSXGraphTitleSchema,
  JSXGraphWidthSchema,
  KeepAspectRatioSchema,
  PanSchema,
  ShowCopyrightSchema,
  ShowNavigationSchema,
  ZoomSchema,
} from "./jsxgraph-base";

// Point types for number line
const PointTypeSchema = z
  .enum(["open", "closed"])
  .describe("Type of point: open circle (○) or closed circle (●)");

// Arrow types
const ArrowTypeSchema = z
  .enum(["none", "left", "right", "both"])
  .describe("Arrow direction: none, left (←), right (→), or both (↔)");

// Point schema for individual points on number line
const NumberLinePointSchema = z.object({
  value: z.number().describe("Position on the number line"),
  type: PointTypeSchema.default("closed"),
  color: z
    .string()
    .optional()
    .default("#0066cc")
    .describe("Color of the point"),
  size: z
    .number()
    .min(1)
    .max(20)
    .optional()
    .default(6)
    .describe("Size of the point (1-20)"),
  label: z
    .string()
    .optional()
    .describe("Label to display above/below the point"),
});

// Interval schema for shaded regions
const IntervalSchema = z.object({
  start: z.number().describe("Start value of the interval"),
  end: z.number().describe("End value of the interval"),
  startType: PointTypeSchema.default("closed").describe("Type of start point"),
  endType: PointTypeSchema.default("closed").describe("Type of end point"),
  color: z
    .string()
    .optional()
    .default("#0066cc")
    .describe("Color of the interval shading"),
  opacity: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .default(0.3)
    .describe("Opacity of the interval shading (0-1)"),
  arrow: ArrowTypeSchema.default("none").describe(
    "Arrow direction for the interval",
  ),
  label: z.string().optional().describe("Label for the interval"),
});

// Enhanced inequality schema for compound inequalities
const InequalitySchema = z.object({
  type: z
    .enum(["simple", "compound", "absolute"])
    .optional()
    .default("simple")
    .describe("Type of inequality: simple, compound, or absolute value"),
  expression: z
    .string()
    .describe("Inequality expression, e.g., 'x > 2', 'x < -1 or x > 3', '|x| < 2'"),
  expressions: z
    .array(z.string())
    .optional()
    .describe("Array of inequality expressions for compound inequalities"),
  operator: z
    .enum(["and", "or"])
    .optional()
    .describe("Logical operator for compound inequalities: 'and' or 'or'"),
  color: z
    .string()
    .optional()
    .default("#0066cc")
    .describe("Color for this inequality"),
  opacity: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .default(0.3)
    .describe("Opacity of the shading (0-1)"),
  label: z
    .string()
    .optional()
    .describe("Custom label for the inequality"),
});

// Number line input schema
const schema = {
  range: z
    .array(z.number())
    .length(2)
    .refine(([min, max]) => min < max, "Range start must be less than end")
    .optional()
    .default([-10, 10])
    .describe("Range of the number line [min, max], default is [-10, 10]"),

  tickInterval: z
    .number()
    .min(0.1)
    .optional()
    .default(1)
    .describe("Interval between tick marks on the number line (minimum 0.1)"),

  showTicks: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show tick marks on the number line"),

  showNumbers: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show numbers below tick marks"),

  points: z
    .array(NumberLinePointSchema)
    .optional()
    .describe("Individual points to plot on the number line"),

  intervals: z
    .array(IntervalSchema)
    .optional()
    .describe("Intervals (shaded regions) to display on the number line"),

  inequalities: z
    .array(InequalitySchema)
    .optional()
    .describe("Compound inequalities to solve and visualize automatically"),

  // Enhanced display options
  showSetNotation: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to display set notation {x | condition}"),

  showIntervalNotation: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to display interval notation [a, b], (a, b), etc."),

  showWorkSpace: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show step-by-step solution workspace"),

  autoAnalyze: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to automatically analyze and parse inequality expressions"),

  lineColor: z
    .string()
    .optional()
    .default("#000000")
    .describe("Color of the main number line"),

  lineWidth: z
    .number()
    .min(0.5)
    .max(10)
    .optional()
    .default(2)
    .describe("Width of the main number line (0.5-10)"),

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
  axisXTitle: z.string().optional().default("x").describe("Label for X axis"),
  axisYTitle: z.string().optional().default("").describe("Label for Y axis (empty for number line)"),
  boundingBox: z
    .array(z.number())
    .length(4)
    .optional()
    .default([-10, 10, 2, -2])
    .describe("The bounding box for the chart [xmin, ymax, xmax, ymin], default is [-10, 10, 2, -2] for number line"),
  keepAspectRatio: KeepAspectRatioSchema,
  showCopyright: ShowCopyrightSchema,
  showNavigation: ShowNavigationSchema,
  zoom: ZoomSchema,
  pan: PanSchema,
};

// Number line tool descriptor
const tool = {
  name: "generate_number_line",
  description:
    "Create enhanced number line visualizations with advanced inequality support. Features: open/closed circles, interval shading, arrows, compound inequalities (AND/OR), absolute value inequalities, set notation, and interval notation. Perfect for visualizing complex inequality solutions and mathematical concepts.",
  inputSchema: zodToJsonSchema(z.object(schema)),
};

export const numberLine = {
  schema,
  tool,
};
