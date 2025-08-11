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

// Exponential function schema
const ExponentialFunctionSchema = z.object({
  type: z.enum(["exponential", "logarithm"]).describe("Type of function"),
  base: z.number().optional().default(Math.E).describe("Base of exponential/logarithm (default: e)"),
  coefficient: z.number().optional().default(1).describe("Coefficient: a in a*b^x or a*log_b(x)"),
  hShift: z.number().optional().default(0).describe("Horizontal shift"),
  vShift: z.number().optional().default(0).describe("Vertical shift"),
  expression: z.string().optional().describe("Custom expression (overrides other parameters)"),
  color: z.string().optional().default("#0066cc").describe("Color of the curve"),
  strokeWidth: z.number().optional().default(2).describe("Width of the curve"),
  name: z.string().optional().describe("Label for the function"),
  dash: z.number().optional().default(0).describe("Dash style (0=solid, 1=dotted, 2=dashed)"),
  domain: z.array(z.number()).length(2).optional().describe("Domain [min, max]"),
});

// Exponential-logarithm input schema
const schema = {
  functions: z
    .array(ExponentialFunctionSchema)
    .describe("Array of exponential and logarithmic functions to plot")
    .nonempty({ message: "At least one function is required." }),
  showAsymptotes: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show horizontal/vertical asymptotes"),
  showIntercepts: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show and label x and y intercepts"),
  showInverse: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show the inverse function"),
  showReflectionLine: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show y=x line for inverse relationship"),
  comparisonPoints: z
    .array(z.object({
      x: z.number().describe("X coordinate to compare values"),
      showValues: z.boolean().optional().default(true).describe("Show function values at this point"),
    }))
    .optional()
    .describe("Points to compare function values"),
  growthDecayAnalysis: z
    .object({
      show: z.boolean().optional().default(false).describe("Whether to show growth/decay analysis"),
      initialValue: z.number().optional().describe("Initial value for growth/decay model"),
      timeUnit: z.string().optional().default("t").describe("Time unit label"),
      rateLabel: z.string().optional().default("rate").describe("Growth/decay rate label"),
    })
    .optional()
    .describe("Growth and decay analysis options"),
  logarithmicScale: z
    .object({
      enabled: z.boolean().optional().default(false).describe("Use logarithmic scale"),
      axis: z.enum(["x", "y", "both"]).optional().default("y").describe("Which axis to use log scale"),
    })
    .optional()
    .describe("Logarithmic scale options"),
  specialPoints: z
    .array(z.object({
      x: z.number().describe("X coordinate"),
      y: z.number().describe("Y coordinate"),
      label: z.string().optional().describe("Label for the point"),
      color: z.string().optional().default("#ff0000").describe("Color of the point"),
      size: z.number().optional().default(4).describe("Size of the point"),
    }))
    .optional()
    .describe("Special points to highlight (e.g., (0,1) for exponentials)"),
  tangentAt: z
    .array(z.number())
    .optional()
    .describe("X coordinates where to show tangent lines"),
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
  axisYTitle: z.string().optional().default("y").describe("Label for Y axis"),
  boundingBox: BoundingBoxSchema,
  keepAspectRatio: KeepAspectRatioSchema,
  showCopyright: ShowCopyrightSchema,
  showNavigation: ShowNavigationSchema,
  zoom: ZoomSchema,
  pan: PanSchema,
};

// Exponential-logarithm tool descriptor
const tool = {
  name: "generate_exponential_logarithm",
  description:
    "Generate exponential and logarithmic function visualizations using JSXGraph. Plot exponential growth/decay, logarithmic functions with various bases, show asymptotes, intercepts, inverse relationships, and growth/decay analysis. Supports logarithmic scales and tangent lines.",
  inputSchema: zodToJsonSchema(schema),
};

export const exponentialLogarithm = {
  schema,
  tool,
};
