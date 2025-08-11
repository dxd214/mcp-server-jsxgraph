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

// Parametric curve data schema
const ParametricCurveSchema = z.object({
  xExpression: z.string().describe("X coordinate expression as function of t, e.g., 'Math.cos(t)', '3*Math.cos(t) - Math.cos(3*t)'"),
  yExpression: z.string().describe("Y coordinate expression as function of t, e.g., 'Math.sin(t)', '3*Math.sin(t) - Math.sin(3*t)'"),
  tMin: z.number().optional().default(0).describe("Minimum value of parameter t"),
  tMax: z.number().optional().default(2 * Math.PI).describe("Maximum value of parameter t"),
  color: z.string().optional().default("#0066cc").describe("Color of the curve"),
  strokeWidth: z.number().optional().default(2).describe("Width of the curve"),
  name: z.string().optional().describe("Name/label for the curve"),
  dash: z.number().optional().default(0).describe("Dash style of the line (0=solid, 1=dotted, 2=dashed)"),
});

// Parametric curve input schema
const schema = {
  curves: z
    .array(ParametricCurveSchema)
    .describe("Array of parametric curves to plot. Each curve is defined by x(t) and y(t) expressions.")
    .nonempty({ message: "At least one parametric curve is required." }),
  showTrace: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show animated trace point moving along the curve"),
  traceSpeed: z
    .number()
    .optional()
    .default(1)
    .describe("Speed of the trace animation (1 = normal speed)"),
  points: z
    .array(z.object({
      x: z.number().describe("X coordinate of the point"),
      y: z.number().describe("Y coordinate of the point"),
      name: z.string().optional().describe("Label for the point"),
      color: z.string().optional().default("#ff0000").describe("Color of the point"),
      size: z.number().optional().default(3).describe("Size of the point"),
    }))
    .optional()
    .describe("Optional points to plot on the graph"),
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

// Parametric curve tool descriptor
const tool = {
  name: "generate_parametric_curve",
  description:
    "Generate parametric curves using JSXGraph. Ideal for plotting curves defined by parametric equations like circles (cos(t), sin(t)), Lissajous curves, spirals, cycloids, etc. Supports multiple curves and animated traces.",
  inputSchema: zodToJsonSchema(schema),
};

export const parametricCurve = {
  schema,
  tool,
};
