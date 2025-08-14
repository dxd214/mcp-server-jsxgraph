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

// Vector field input schema
const schema = {
  fieldFunction: z
    .object({
      dx: z
        .string()
        .describe(
          "Expression for the x-component of the vector field as function of (x, y), e.g., '-y', 'x + y', 'Math.sin(x)'",
        ),
      dy: z
        .string()
        .describe(
          "Expression for the y-component of the vector field as function of (x, y), e.g., 'x', 'x - y', 'Math.cos(y)'",
        ),
    })
    .describe("Vector field function F(x,y) = (dx, dy)"),
  density: z
    .number()
    .optional()
    .default(10)
    .describe(
      "Number of vectors to show in each direction (density of the field)",
    ),
  scale: z
    .number()
    .optional()
    .default(0.8)
    .describe("Scale factor for vector lengths (0.1 to 2.0)"),
  arrowStyle: z
    .object({
      color: z
        .string()
        .optional()
        .default("#0066cc")
        .describe("Color of the vectors"),
      strokeWidth: z
        .number()
        .optional()
        .default(1.5)
        .describe("Width of the vector arrows"),
      headSize: z
        .number()
        .optional()
        .default(5)
        .describe("Size of the arrowheads"),
    })
    .optional()
    .describe("Styling options for the vector arrows"),
  streamlines: z
    .array(
      z.object({
        startX: z.number().describe("Starting x coordinate for the streamline"),
        startY: z.number().describe("Starting y coordinate for the streamline"),
        color: z
          .string()
          .optional()
          .default("#ff6600")
          .describe("Color of the streamline"),
        strokeWidth: z
          .number()
          .optional()
          .default(2)
          .describe("Width of the streamline"),
        steps: z
          .number()
          .optional()
          .default(100)
          .describe("Number of integration steps"),
      }),
    )
    .optional()
    .describe(
      "Optional streamlines (integral curves) to show the flow of the field",
    ),
  singularPoints: z
    .array(
      z.object({
        x: z.number().describe("X coordinate of the singular point"),
        y: z.number().describe("Y coordinate of the singular point"),
        type: z
          .enum(["source", "sink", "saddle", "center"])
          .optional()
          .describe("Type of singular point"),
        color: z
          .string()
          .optional()
          .default("#ff0000")
          .describe("Color of the singular point"),
        size: z
          .number()
          .optional()
          .default(5)
          .describe("Size of the point marker"),
      }),
    )
    .optional()
    .describe("Optional singular/critical points to highlight"),
  colorByMagnitude: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to color vectors based on their magnitude"),
  showMagnitudeLegend: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show a legend for magnitude colors"),
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

// Vector field tool descriptor
const tool = {
  name: "generate_vector_field",
  description:
    "Generate vector field visualizations using JSXGraph. Display 2D vector fields with arrows showing direction and magnitude at each point. Supports streamlines, singular points, and color-coded magnitudes. Ideal for visualizing gradient fields, flow fields, electromagnetic fields, etc.",
  inputSchema: zodToJsonSchema(z.object(schema)),
};

export const vectorField = {
  schema,
  tool,
};
