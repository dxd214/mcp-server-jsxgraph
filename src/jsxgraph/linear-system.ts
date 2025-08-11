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

// Linear equation schema
const LinearEquationSchema = z.object({
  a: z.number().describe("Coefficient of x (ax + by = c)"),
  b: z.number().describe("Coefficient of y (ax + by = c)"),
  c: z.number().describe("Constant term (ax + by = c)"),
  color: z.string().optional().default("#0066cc").describe("Color of the line"),
  strokeWidth: z.number().optional().default(2).describe("Width of the line"),
  name: z.string().optional().describe("Label for the equation"),
  dash: z.number().optional().default(0).describe("Dash style (0=solid, 1=dotted, 2=dashed)"),
});

// Linear inequality schema
const LinearInequalitySchema = z.object({
  a: z.number().describe("Coefficient of x (ax + by ≤/≥/</> c)"),
  b: z.number().describe("Coefficient of y (ax + by ≤/≥/</> c)"),
  c: z.number().describe("Constant term (ax + by ≤/≥/</> c)"),
  type: z.enum(["<=", ">=", "<", ">"]).describe("Type of inequality"),
  fillColor: z.string().optional().default("#0066cc").describe("Fill color for the feasible region"),
  fillOpacity: z.number().optional().default(0.2).describe("Opacity of the fill (0-1)"),
  borderColor: z.string().optional().default("#0066cc").describe("Color of the boundary line"),
  borderDash: z.number().optional().describe("Dash style for strict inequalities (< or >)"),
  name: z.string().optional().describe("Label for the inequality"),
});

// Linear system input schema
const schema = {
  equations: z
    .array(LinearEquationSchema)
    .optional()
    .describe("Array of linear equations to plot (ax + by = c form)"),
  inequalities: z
    .array(LinearInequalitySchema)
    .optional()
    .describe("Array of linear inequalities to plot and shade"),
  showIntersections: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to highlight intersection points"),
  showFeasibleRegion: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to highlight the feasible region for inequalities"),
  objectives: z
    .array(z.object({
      a: z.number().describe("Coefficient of x in objective function (z = ax + by)"),
      b: z.number().describe("Coefficient of y in objective function (z = ax + by)"),
      name: z.string().optional().default("z").describe("Name of the objective function"),
      showOptimal: z.boolean().optional().default(true).describe("Whether to find and show optimal points"),
      type: z.enum(["max", "min"]).optional().default("max").describe("Optimization type"),
    }))
    .optional()
    .describe("Objective functions for linear programming"),
  points: z
    .array(z.object({
      x: z.number().describe("X coordinate"),
      y: z.number().describe("Y coordinate"),
      name: z.string().optional().describe("Label for the point"),
      color: z.string().optional().default("#ff0000").describe("Color of the point"),
      size: z.number().optional().default(4).describe("Size of the point"),
    }))
    .optional()
    .describe("Additional points to highlight"),
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

// Linear system tool descriptor
const tool = {
  name: "generate_linear_system",
  description:
    "Generate linear equations and inequality systems using JSXGraph. Visualize systems of linear equations, linear inequalities with feasible regions, linear programming problems with objective functions, and find intersection points. Perfect for solving systems of equations and linear optimization problems.",
  inputSchema: zodToJsonSchema(schema),
};

export const linearSystem = {
  schema,
  tool,
};
