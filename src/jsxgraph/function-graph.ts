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

// Function data schema
const FunctionDataSchema = z.object({
  expression: z.string().describe("Mathematical function expression, e.g., 'Math.sin(x)', 'x^2 + 2*x - 1', 'Math.exp(x)'"),
  color: z.string().optional().default("#0066cc").describe("Color of the function curve"),
  strokeWidth: z.number().optional().default(2).describe("Width of the function curve"),
  name: z.string().optional().describe("Name/label for the function"),
  domain: z.array(z.number()).length(2).optional().describe("Domain of the function [min, max], if not specified, uses boundingBox x range"),
  dash: z.number().optional().default(0).describe("Dash style of the line (0=solid, 1=dotted, 2=dashed)"),
});

// Function graph input schema
const schema = {
  functions: z
    .array(FunctionDataSchema)
    .describe("Array of mathematical functions to plot. Each function has an expression and optional styling.")
    .nonempty({ message: "At least one function is required." }),
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
  showDerivative: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show the derivative of the first function"),
  showIntegral: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show the integral area of the first function"),
  integralBounds: z
    .array(z.number())
    .length(2)
    .optional()
    .describe("Bounds for integral area [a, b], required if showIntegral is true"),
  tangentAt: z
    .number()
    .optional()
    .describe("X coordinate to show tangent line at"),
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

// Function graph tool descriptor
const tool = {
  name: "generate_function_graph",
  description:
    "Generate a mathematical function graph using JSXGraph. Supports plotting multiple functions, derivatives, integrals, tangent lines, and points. Ideal for visualizing mathematical functions like sin(x), x^2, exp(x), etc.",
  inputSchema: zodToJsonSchema(schema),
};

export const functionGraph = {
  schema,
  tool,
};
