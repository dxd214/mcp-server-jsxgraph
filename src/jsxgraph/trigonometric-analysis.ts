import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
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

// Trigonometric function types
const TrigFunctionType = z.enum([
  "sin", "cos", "tan", "csc", "sec", "cot",
  "asin", "acos", "atan", "sinh", "cosh", "tanh"
]);

// Phase shift and transformations
const TrigTransformationSchema = z.object({
  amplitude: z.number().optional().default(1).describe("Amplitude A in A*f(Bx + C) + D"),
  period: z.number().optional().describe("Period of the function (calculated from B if not provided)"),
  frequency: z.number().optional().default(1).describe("Frequency B in A*f(Bx + C) + D"),
  phaseShift: z.number().optional().default(0).describe("Phase shift C in A*f(Bx + C) + D"),
  verticalShift: z.number().optional().default(0).describe("Vertical shift D in A*f(Bx + C) + D"),
});

// Trigonometric function data schema
const TrigFunctionDataSchema = z.object({
  type: TrigFunctionType.describe("Type of trigonometric function"),
  transformation: TrigTransformationSchema.optional().describe("Function transformations"),
  color: z.string().optional().default("#0066cc").describe("Color of the function curve"),
  strokeWidth: z.number().optional().default(2).describe("Width of the function curve"),
  name: z.string().optional().describe("Name/label for the function"),
  domain: z.array(z.number()).length(2).optional().describe("Domain of the function [min, max]"),
  dash: z.number().optional().default(0).describe("Dash style of the line (0=solid, 1=dotted, 2=dashed)"),
  showAsymptotes: z.boolean().optional().default(false).describe("Whether to show vertical asymptotes for tan, sec, csc, cot"),
});

// Analysis options
const AnalysisOptionsSchema = z.object({
  showKeyPoints: z.boolean().optional().default(true).describe("Show maximum, minimum, and zero points"),
  showPeriodMarkers: z.boolean().optional().default(true).describe("Show period divisions on x-axis"),
  showAmplitudeLines: z.boolean().optional().default(false).describe("Show amplitude reference lines"),
  showPhaseShift: z.boolean().optional().default(false).describe("Show phase shift indicators"),
  showUnitCircle: z.boolean().optional().default(false).describe("Show unit circle reference"),
  analyzeIntersections: z.boolean().optional().default(false).describe("Find and mark intersections between functions"),
});

// Trigonometric analysis input schema
const schema = z.object({
  functions: z
    .array(TrigFunctionDataSchema)
    .describe("Array of trigonometric functions to plot and analyze")
    .nonempty({ message: "At least one trigonometric function is required." }),
  analysisOptions: AnalysisOptionsSchema.optional().describe("Analysis and visualization options"),
  points: z
    .array(z.object({
      x: z.number().describe("X coordinate of the point"),
      y: z.number().describe("Y coordinate of the point"),
      name: z.string().optional().describe("Label for the point"),
      color: z.string().optional().default("#ff0000").describe("Color of the point"),
      size: z.number().optional().default(3).describe("Size of the point"),
    }))
    .optional()
    .describe("Additional points to plot on the graph"),
  xAxisUnit: z.enum(["radians", "degrees"]).optional().default("radians").describe("Unit for x-axis (radians or degrees)"),
  showGrid: z.boolean().optional().default(true).describe("Whether to show coordinate grid"),
  gridType: z.enum(["standard", "polar"]).optional().default("standard").describe("Type of grid to display"),
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
});

// Trigonometric analysis tool descriptor
const tool = {
  name: "generate_trigonometric_analysis",
  description:
    "Generate comprehensive trigonometric function analysis using JSXGraph. Supports all trigonometric functions (sin, cos, tan, sec, csc, cot) with transformations (amplitude, frequency, phase shift, vertical shift), key point analysis, asymptotes, period markers, and interactive features. Perfect for analyzing trigonometric equations, transformations, and graphical properties.",
  inputSchema: zodToJsonSchema(schema),
};

export const trigonometricAnalysis = {
  schema,
  tool,
};