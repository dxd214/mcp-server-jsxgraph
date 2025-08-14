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

// Transformation schema
const TransformationSchema = z.object({
  type: z
    .enum([
      "translate", // f(x-h) + k
      "scale", // a*f(b*x)
      "reflect", // -f(x) or f(-x)
      "absolute", // |f(x)| or f(|x|)
      "inverse", // 1/f(x) or f^(-1)(x)
      "composite", // g(f(x))
    ])
    .describe("Type of transformation to apply"),
  parameters: z
    .object({
      h: z
        .number()
        .optional()
        .describe("Horizontal translation (for translate)"),
      k: z.number().optional().describe("Vertical translation (for translate)"),
      a: z.number().optional().describe("Vertical scale factor (for scale)"),
      b: z.number().optional().describe("Horizontal scale factor (for scale)"),
      axis: z
        .enum(["x", "y", "both"])
        .optional()
        .describe("Reflection axis (for reflect)"),
      innerFunction: z
        .string()
        .optional()
        .describe("Inner function g(x) for composition"),
    })
    .optional()
    .describe("Parameters for the transformation"),
  color: z.string().optional().describe("Color for the transformed function"),
  strokeWidth: z
    .number()
    .optional()
    .default(2)
    .describe("Width of the transformed curve"),
  dash: z
    .number()
    .optional()
    .default(0)
    .describe("Dash style (0=solid, 1=dotted, 2=dashed)"),
  name: z.string().optional().describe("Label for the transformation"),
});

// Function transformation input schema
const schema = {
  baseFunction: z
    .object({
      expression: z
        .string()
        .describe(
          "Base function expression, e.g., 'x^2', 'Math.sin(x)', 'Math.sqrt(x)'",
        ),
      color: z
        .string()
        .optional()
        .default("#0066cc")
        .describe("Color of the base function"),
      strokeWidth: z
        .number()
        .optional()
        .default(2)
        .describe("Width of the base function curve"),
      name: z
        .string()
        .optional()
        .default("f(x)")
        .describe("Label for the base function"),
      domain: z
        .array(z.number())
        .length(2)
        .optional()
        .describe("Domain [min, max]"),
    })
    .describe("The original function to transform"),
  transformations: z
    .array(TransformationSchema)
    .describe("Array of transformations to apply and visualize")
    .nonempty({ message: "At least one transformation is required." }),
  showSteps: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show intermediate transformation steps"),
  showVectors: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show transformation vectors for translations"),
  highlightPoints: z
    .array(
      z.object({
        x: z.number().describe("X coordinate on base function"),
        showTransformed: z
          .boolean()
          .optional()
          .default(true)
          .describe("Show corresponding points on transformed functions"),
      }),
    )
    .optional()
    .describe("Points to highlight on base and transformed functions"),
  animateTransformation: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to animate the transformation with a slider"),
  compareMode: z
    .enum(["overlay", "side-by-side"])
    .optional()
    .default("overlay")
    .describe("How to display the functions"),
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

// Function transformation tool descriptor
const tool = {
  name: "generate_function_transformation",
  description:
    "Generate function transformations using JSXGraph. Visualize translations, scaling, reflections, absolute value, inverse functions, and function composition. Shows how functions change under various transformations with optional animation and step-by-step visualization.",
  inputSchema: zodToJsonSchema(z.object(schema)),
};

export const functionTransformation = {
  schema,
  tool,
};
