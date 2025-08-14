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

// Rational function schema
const RationalFunctionSchema = z.object({
  numerator: z
    .string()
    .describe("Numerator polynomial expression, e.g., 'x^2 + 2*x + 1'"),
  denominator: z
    .string()
    .describe("Denominator polynomial expression, e.g., 'x - 1'"),
  color: z
    .string()
    .optional()
    .default("#0066cc")
    .describe("Color of the function curve"),
  strokeWidth: z.number().optional().default(2).describe("Width of the curve"),
  name: z.string().optional().describe("Label for the function"),
  dash: z
    .number()
    .optional()
    .default(0)
    .describe("Dash style (0=solid, 1=dotted, 2=dashed)"),
});

// Irrational function schema
const IrrationalFunctionSchema = z.object({
  expression: z
    .string()
    .describe(
      "Irrational function expression, e.g., 'Math.sqrt(x)', 'Math.cbrt(x^2 - 1)'",
    ),
  domain: z
    .array(z.number())
    .length(2)
    .optional()
    .describe("Domain restrictions [min, max]"),
  color: z
    .string()
    .optional()
    .default("#009900")
    .describe("Color of the function curve"),
  strokeWidth: z.number().optional().default(2).describe("Width of the curve"),
  name: z.string().optional().describe("Label for the function"),
  dash: z
    .number()
    .optional()
    .default(0)
    .describe("Dash style (0=solid, 1=dotted, 2=dashed)"),
});

// Rational function input schema
const schema = {
  rationalFunctions: z
    .array(RationalFunctionSchema)
    .optional()
    .describe("Array of rational functions (P(x)/Q(x)) to plot"),
  irrationalFunctions: z
    .array(IrrationalFunctionSchema)
    .optional()
    .describe("Array of irrational functions (involving roots) to plot"),
  showVerticalAsymptotes: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show vertical asymptotes"),
  showHorizontalAsymptotes: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show horizontal asymptotes"),
  showObliqueAsymptotes: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show oblique/slant asymptotes"),
  showHoles: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show removable discontinuities (holes)"),
  showIntercepts: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show x and y intercepts"),
  showCriticalPoints: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show local maxima and minima"),
  showDomainRestrictions: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      "Whether to highlight domain restrictions for irrational functions",
    ),
  analyzeEndBehavior: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show end behavior analysis"),
  factorization: z
    .object({
      show: z
        .boolean()
        .optional()
        .default(false)
        .describe("Whether to show factored form"),
      simplify: z
        .boolean()
        .optional()
        .default(true)
        .describe("Whether to simplify and cancel common factors"),
    })
    .optional()
    .describe("Factorization and simplification options"),
  partialFractions: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show partial fraction decomposition"),
  tangentLines: z
    .array(z.number())
    .optional()
    .describe("X coordinates where to draw tangent lines"),
  shadeRegions: z
    .array(
      z.object({
        type: z
          .enum(["above", "below", "between"])
          .describe("Region type relative to function"),
        functionIndex: z
          .number()
          .describe("Index of the function to shade relative to"),
        bounds: z
          .array(z.number())
          .length(2)
          .optional()
          .describe("X bounds [min, max]"),
        color: z.string().optional().default("#0066cc").describe("Shade color"),
        opacity: z
          .number()
          .optional()
          .default(0.2)
          .describe("Shade opacity (0-1)"),
      }),
    )
    .optional()
    .describe("Regions to shade"),
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

// Rational function tool descriptor
const tool = {
  name: "generate_rational_function",
  description:
    "Generate rational and irrational function visualizations using JSXGraph. Plot rational functions with asymptotes (vertical, horizontal, oblique), holes, intercepts, and critical points. Visualize irrational functions with domain restrictions. Supports factorization, partial fractions, and end behavior analysis.",
  inputSchema: zodToJsonSchema(z.object(schema)),
};

export const rationalFunction = {
  schema,
  tool,
};
