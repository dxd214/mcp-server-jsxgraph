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

// Conic section schema
const ConicSectionSchema = z.object({
  type: z.enum(["circle", "ellipse", "parabola", "hyperbola"]).describe("Type of conic section"),
  center: z.object({
    x: z.number().optional().default(0).describe("X coordinate of center"),
    y: z.number().optional().default(0).describe("Y coordinate of center"),
  }).optional().describe("Center point (for circle, ellipse, hyperbola)"),
  radius: z.number().optional().describe("Radius (for circle)"),
  a: z.number().optional().describe("Semi-major axis (for ellipse) or parameter a (for hyperbola)"),
  b: z.number().optional().describe("Semi-minor axis (for ellipse) or parameter b (for hyperbola)"),
  p: z.number().optional().describe("Parameter p for parabola (4p is the focal parameter)"),
  vertex: z.object({
    x: z.number().optional().default(0).describe("X coordinate of vertex"),
    y: z.number().optional().default(0).describe("Y coordinate of vertex"),
  }).optional().describe("Vertex point (for parabola)"),
  orientation: z.enum(["horizontal", "vertical"]).optional().default("vertical").describe("Orientation of the conic"),
  rotation: z.number().optional().default(0).describe("Rotation angle in degrees"),
  color: z.string().optional().default("#0066cc").describe("Color of the conic"),
  strokeWidth: z.number().optional().default(2).describe("Width of the curve"),
  fillColor: z.string().optional().describe("Fill color (if applicable)"),
  fillOpacity: z.number().optional().default(0).describe("Fill opacity (0-1)"),
  name: z.string().optional().describe("Label for the conic"),
  dash: z.number().optional().default(0).describe("Dash style (0=solid, 1=dotted, 2=dashed)"),
});

// General conic equation schema
const GeneralConicSchema = z.object({
  A: z.number().describe("Coefficient of x²"),
  B: z.number().describe("Coefficient of xy"),
  C: z.number().describe("Coefficient of y²"),
  D: z.number().describe("Coefficient of x"),
  E: z.number().describe("Coefficient of y"),
  F: z.number().describe("Constant term"),
  color: z.string().optional().default("#009900").describe("Color of the conic"),
  strokeWidth: z.number().optional().default(2).describe("Width of the curve"),
  name: z.string().optional().describe("Label for the conic"),
});

// Polynomial schema
const PolynomialSchema = z.object({
  coefficients: z.array(z.number()).describe("Polynomial coefficients [a₀, a₁, a₂, ...] for a₀ + a₁x + a₂x² + ..."),
  color: z.string().optional().default("#ff6600").describe("Color of the polynomial"),
  strokeWidth: z.number().optional().default(2).describe("Width of the curve"),
  name: z.string().optional().describe("Label for the polynomial"),
  dash: z.number().optional().default(0).describe("Dash style (0=solid, 1=dotted, 2=dashed)"),
});

// Conic section input schema
const schema = {
  conics: z
    .array(ConicSectionSchema)
    .optional()
    .describe("Array of standard conic sections to plot"),
  generalConics: z
    .array(GeneralConicSchema)
    .optional()
    .describe("Conic sections in general form: Ax² + Bxy + Cy² + Dx + Ey + F = 0"),
  polynomials: z
    .array(PolynomialSchema)
    .optional()
    .describe("High-degree polynomial functions to plot"),
  showFoci: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show foci for conics"),
  showDirectrix: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show directrix for parabolas and general conics"),
  showAsymptotes: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show asymptotes for hyperbolas"),
  showCenter: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to mark the center of conics"),
  showVertices: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to mark vertices of conics"),
  showEccentricity: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to display eccentricity values"),
  showTangents: z
    .array(z.object({
      point: z.object({
        x: z.number().describe("X coordinate of tangent point"),
        y: z.number().describe("Y coordinate of tangent point"),
      }).describe("Point where to draw tangent"),
      conicIndex: z.number().optional().describe("Index of conic to draw tangent to"),
    }))
    .optional()
    .describe("Tangent lines to draw"),
  showPolynomialRoots: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to mark roots of polynomials"),
  showCriticalPoints: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show critical points of polynomials"),
  showInflectionPoints: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show inflection points of polynomials"),
  degreeAnalysis: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show polynomial degree and leading coefficient analysis"),
  intersectionAnalysis: z
    .object({
      enabled: z.boolean().optional().default(false).describe("Whether to find intersections"),
      between: z.array(z.number()).length(2).optional().describe("Indices of curves to find intersections between"),
    })
    .optional()
    .describe("Intersection analysis options"),
  polarForm: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show polar form equations for conics"),
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

// Conic section tool descriptor
const tool = {
  name: "generate_conic_section",
  description:
    "Generate conic sections and high-degree polynomials using JSXGraph. Visualize circles, ellipses, parabolas, hyperbolas with their foci, directrices, vertices, and asymptotes. Plot polynomials with roots, critical points, and inflection points. Supports general conic equations, rotated conics, and intersection analysis.",
  inputSchema: zodToJsonSchema(schema),
};

export const conicSection = {
  schema,
  tool,
};
