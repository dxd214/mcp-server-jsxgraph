import { z } from "zod";
import { zodToJsonSchema } from "../utils";
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

// Quadratic function schema
const QuadraticFunctionSchema = z.object({
  a: z.number().describe("Coefficient of x² (ax² + bx + c)"),
  b: z.number().describe("Coefficient of x (ax² + bx + c)"),
  c: z.number().describe("Constant term (ax² + bx + c)"),
  color: z
    .string()
    .optional()
    .default("#0066cc")
    .describe("Color of the parabola"),
  strokeWidth: z.number().optional().default(2).describe("Width of the curve"),
  name: z.string().optional().describe("Label for the function"),
  dash: z
    .number()
    .optional()
    .default(0)
    .describe("Dash style (0=solid, 1=dotted, 2=dashed)"),
});

// Quadratic analysis input schema
const schema = {
  quadratics: z
    .array(QuadraticFunctionSchema)
    .describe("Array of quadratic functions to analyze (ax² + bx + c form)")
    .nonempty({ message: "At least one quadratic function is required." }),
  showVertex: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show and label the vertex"),
  showAxisOfSymmetry: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show the axis of symmetry"),
  showRoots: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show and label the roots/x-intercepts"),
  showYIntercept: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show the y-intercept"),
  showFocusDirectrix: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show the focus and directrix"),
  showDiscriminant: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to display discriminant value and root nature"),
  vertexForm: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to display the vertex form: a(x-h)² + k"),
  factorizedForm: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to display the factorized form if applicable"),
  tangentLines: z
    .array(
      z.object({
        x: z.number().describe("X coordinate where to draw tangent"),
        color: z
          .string()
          .optional()
          .default("#ff9900")
          .describe("Color of tangent line"),
      }),
    )
    .optional()
    .describe("Points where to draw tangent lines"),
  shadeRegion: z
    .object({
      type: z.enum(["above", "below", "between"]).describe("Region to shade"),
      bounds: z
        .array(z.number())
        .length(2)
        .optional()
        .describe("X bounds for shading [min, max]"),
      color: z.string().optional().default("#0066cc").describe("Shade color"),
      opacity: z
        .number()
        .optional()
        .default(0.2)
        .describe("Shade opacity (0-1)"),
    })
    .optional()
    .describe("Region to shade relative to the parabola"),
  compareMode: z
    .enum(["overlay", "transform-sequence"])
    .optional()
    .default("overlay")
    .describe("How to display multiple quadratics"),
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

// Quadratic analysis tool descriptor
const tool = {
  name: "generate_quadratic_analysis",
  description:
    "Generate comprehensive quadratic function analysis using JSXGraph. Visualize parabolas with vertex, axis of symmetry, roots, y-intercept, focus, directrix, and discriminant analysis. Shows vertex form, factorized form, tangent lines, and shaded regions. Perfect for studying quadratic properties and transformations.",
  inputSchema: zodToJsonSchema(schema),
};

export const quadraticAnalysis = {
  schema,
  tool,
};
