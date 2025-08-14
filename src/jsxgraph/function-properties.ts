/**
 * Unified Function Properties Analyzer
 * Provides comprehensive function property analysis and visualization
 */

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

// Function input schema
const FunctionInputSchema = z.object({
  expression: z
    .string()
    .describe("Function expression, such as 'x^2', 'Math.sin(x)', '1/(x-1)'"),
  name: z
    .string()
    .optional()
    .default("f(x)")
    .describe("Function name/label"),
  color: z
    .string()
    .optional()
    .default("#0066cc")
    .describe("Function curve color"),
  strokeWidth: z
    .number()
    .optional()
    .default(2)
    .describe("Function curve width"),
  domain: z
    .array(z.number())
    .length(2)
    .optional()
    .describe("Function domain range [min, max]"),
});

// Analysis options schema
const AnalysisOptionsSchema = z.object({
  domain: z.boolean().default(true).describe("Analyze domain"),
  range: z.boolean().default(true).describe("Analyze range"),
  intercepts: z.boolean().default(true).describe("Find x and y intercepts"),
  extrema: z.boolean().default(true).describe("Find extrema points"),
  monotonicity: z.boolean().default(true).describe("Analyze monotonicity"),
  concavity: z.boolean().default(true).describe("Analyze concavity"),
  asymptotes: z.boolean().default(true).describe("Find asymptotes"),
  inflectionPoints: z.boolean().default(true).describe("Find inflection points"),
  periodicity: z.boolean().default(false).describe("Analyze periodicity"),
  symmetry: z.boolean().default(true).describe("Analyze symmetry"),
  continuity: z.boolean().default(false).describe("Analyze continuity"),
});

// Display options schema
const DisplayOptionsSchema = z.object({
  showGraph: z.boolean().default(true).describe("Show function graph"),
  showTable: z.boolean().default(true).describe("Show properties table"),
  annotateGraph: z.boolean().default(true).describe("Annotate key points on graph"),
  showDerivatives: z.boolean().default(false).describe("Show first and second derivatives"),
  showTangentLines: z
    .array(z.number())
    .optional()
    .describe("Show tangent lines at specified x values"),
  highlightIntervals: z.boolean().default(true).describe("Highlight monotonicity and concavity intervals"),
  showAsymptoteLines: z.boolean().default(true).describe("Draw asymptote lines"),
  showIntercepts: z.boolean().default(true).describe("Mark intercept points"),
  showExtrema: z.boolean().default(true).describe("Mark extrema points"),
  showInflectionPoints: z.boolean().default(true).describe("Mark inflection points"),
});

// Advanced options schema
const AdvancedOptionsSchema = z.object({
  precision: z
    .number()
    .min(1)
    .max(10)
    .default(4)
    .describe("Numerical calculation precision (decimal places)"),
  samplingDensity: z
    .number()
    .min(10)
    .max(1000)
    .default(100)
    .describe("Function sampling density"),
  errorTolerance: z
    .number()
    .min(1e-10)
    .max(1e-2)
    .default(1e-6)
    .describe("Numerical calculation error tolerance"),
  showWorkSteps: z.boolean().default(false).describe("Show analysis steps"),
  compareMode: z.boolean().default(false).describe("Multi-function comparison mode"),
});

// Main input schema
const schema = {
  // Function configuration
  function: FunctionInputSchema.describe("Function to analyze"),
  
  functions: z
    .array(FunctionInputSchema)
    .optional()
    .describe("Multiple functions to analyze simultaneously (comparison mode)"),

  // Analysis options
  analyze: AnalysisOptionsSchema
    .optional()
    .default({})
    .describe("Analysis options configuration"),

  // Display options  
  display: DisplayOptionsSchema
    .optional()
    .default({})
    .describe("Display options configuration"),

  // Advanced options
  advanced: AdvancedOptionsSchema
    .optional()
    .default({})
    .describe("Advanced analysis options"),

  // Basic JSXGraph options
  title: JSXGraphTitleSchema,
  width: JSXGraphWidthSchema,
  height: JSXGraphHeightSchema,
  boundingBox: BoundingBoxSchema,
  axisXTitle: z.string().optional().default("x").describe("X axis label"),
  axisYTitle: z.string().optional().default("y").describe("Y axis label"),
  
  // Style options
  style: z
    .object({
      theme: JSXGraphThemeSchema,
      backgroundColor: JSXGraphBackgroundColorSchema,
      grid: JSXGraphGridSchema,
      axis: JSXGraphAxisSchema,
    })
    .optional()
    .describe("Style configuration"),

  // JSXGraph control options
  keepAspectRatio: KeepAspectRatioSchema,
  showCopyright: ShowCopyrightSchema,
  showNavigation: ShowNavigationSchema,
  zoom: ZoomSchema,
  pan: PanSchema,
};

// Function properties tool descriptor
const tool = {
    name: "generate_function_properties",
    description:
      "Create comprehensive function property analysis with visualization. Analyzes domain, range, monotonicity, concavity, extrema, asymptotes, inflection points, symmetry, and periodicity. Features interactive graphs with annotations, property tables, and step-by-step analysis. Perfect for in-depth function study.",
    inputSchema: zodToJsonSchema(z.object(schema)),
};

export const functionProperties = {
  schema,
  tool,
};
