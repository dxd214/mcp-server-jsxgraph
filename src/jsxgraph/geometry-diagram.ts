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

// Point schema
const PointSchema = z.object({
  x: z.number().describe("X coordinate of the point"),
  y: z.number().describe("Y coordinate of the point"),
  name: z.string().optional().describe("Label for the point"),
  color: z
    .string()
    .optional()
    .default("#0066cc")
    .describe("Color of the point"),
  size: z.number().optional().default(4).describe("Size of the point"),
  fixed: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether the point is fixed (non-draggable)"),
  visible: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether the point is visible"),
});

// Line/Segment schema
const LineSchema = z.object({
  point1: z.string().describe("Name of the first point"),
  point2: z.string().describe("Name of the second point"),
  type: z
    .enum(["line", "segment", "ray"])
    .optional()
    .default("segment")
    .describe(
      "Type of line: line (infinite), segment (between points), or ray (from point1 through point2)",
    ),
  color: z.string().optional().default("#333333").describe("Color of the line"),
  strokeWidth: z.number().optional().default(2).describe("Width of the line"),
  dash: z
    .number()
    .optional()
    .default(0)
    .describe("Dash style (0=solid, 1=dotted, 2=dashed)"),
  name: z.string().optional().describe("Label for the line"),
});

// Circle schema
const CircleSchema = z.object({
  center: z.string().describe("Name of the center point"),
  radius: z
    .number()
    .optional()
    .describe("Fixed radius value (if not provided, uses second point)"),
  throughPoint: z
    .string()
    .optional()
    .describe("Name of a point on the circle (for dynamic radius)"),
  color: z
    .string()
    .optional()
    .default("#0066cc")
    .describe("Color of the circle"),
  fillColor: z.string().optional().describe("Fill color of the circle"),
  fillOpacity: z.number().optional().default(0).describe("Fill opacity (0-1)"),
  strokeWidth: z
    .number()
    .optional()
    .default(2)
    .describe("Width of the circle outline"),
});

// Polygon schema
const PolygonSchema = z.object({
  vertices: z
    .array(z.string())
    .min(3)
    .describe("Array of point names forming the polygon vertices"),
  color: z
    .string()
    .optional()
    .default("#0066cc")
    .describe("Border color of the polygon"),
  fillColor: z
    .string()
    .optional()
    .default("#0066cc")
    .describe("Fill color of the polygon"),
  fillOpacity: z
    .number()
    .optional()
    .default(0.3)
    .describe("Fill opacity (0-1)"),
  strokeWidth: z
    .number()
    .optional()
    .default(2)
    .describe("Width of the polygon border"),
});

// Angle schema
const AngleSchema = z.object({
  point1: z.string().describe("First point of the angle"),
  vertex: z.string().describe("Vertex point of the angle"),
  point2: z.string().describe("Second point of the angle"),
  radius: z
    .number()
    .optional()
    .default(30)
    .describe("Radius of the angle arc in pixels"),
  type: z
    .enum(["arc", "sector"])
    .optional()
    .default("arc")
    .describe("Display as arc or filled sector"),
  color: z
    .string()
    .optional()
    .default("#ff9900")
    .describe("Color of the angle"),
  fillOpacity: z
    .number()
    .optional()
    .default(0.3)
    .describe("Fill opacity for sector type (0-1)"),
  label: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show angle measurement"),
});

// Geometry diagram input schema
const schema = {
  points: z
    .array(PointSchema)
    .describe(
      "Array of points to create. Points can be referenced by name in other elements.",
    )
    .default([]),
  lines: z
    .array(LineSchema)
    .optional()
    .describe("Array of lines, segments, or rays connecting points"),
  circles: z
    .array(CircleSchema)
    .optional()
    .describe("Array of circles defined by center and radius or through-point"),
  polygons: z
    .array(PolygonSchema)
    .optional()
    .describe("Array of polygons defined by their vertices"),
  angles: z
    .array(AngleSchema)
    .optional()
    .describe("Array of angles to display and measure"),
  showMeasurements: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show measurements (distances, angles)"),
  construction: z
    .object({
      perpendicular: z
        .array(
          z.object({
            line: z.string().describe("Name of the line (point1-point2)"),
            throughPoint: z
              .string()
              .describe("Point through which perpendicular passes"),
          }),
        )
        .optional(),
      parallel: z
        .array(
          z.object({
            line: z.string().describe("Name of the line (point1-point2)"),
            throughPoint: z
              .string()
              .describe("Point through which parallel passes"),
          }),
        )
        .optional(),
      midpoint: z
        .array(
          z.object({
            point1: z.string().describe("First point"),
            point2: z.string().describe("Second point"),
            name: z.string().describe("Name for the midpoint"),
          }),
        )
        .optional(),
      bisector: z
        .array(
          z.object({
            point1: z.string().describe("First point of the angle"),
            vertex: z.string().describe("Vertex of the angle"),
            point2: z.string().describe("Second point of the angle"),
          }),
        )
        .optional(),
    })
    .optional()
    .describe(
      "Geometric constructions like perpendiculars, parallels, midpoints, and angle bisectors",
    ),
  style: z
    .object({
      theme: JSXGraphThemeSchema,
      backgroundColor: JSXGraphBackgroundColorSchema,
      grid: JSXGraphGridSchema,
      axis: JSXGraphAxisSchema,
    })
    .optional()
    .describe("Custom style configuration for the diagram."),
  width: JSXGraphWidthSchema,
  height: JSXGraphHeightSchema,
  title: JSXGraphTitleSchema,
  boundingBox: BoundingBoxSchema,
  keepAspectRatio: KeepAspectRatioSchema,
  showCopyright: ShowCopyrightSchema,
  showNavigation: ShowNavigationSchema,
  zoom: ZoomSchema,
  pan: PanSchema,
};

// Geometry diagram tool descriptor
const tool = {
  name: "generate_geometry_diagram",
  description:
    "Generate interactive geometry diagrams using JSXGraph. Create points, lines, circles, polygons, angles, and geometric constructions. Perfect for visualizing geometric concepts, theorems, and constructions like triangles, perpendiculars, angle bisectors, etc.",
  inputSchema: zodToJsonSchema(schema),
};

export const geometryDiagram = {
  schema,
  tool,
};
