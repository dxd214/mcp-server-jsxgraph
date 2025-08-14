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
  fixed: z.boolean().optional().default(false).describe("Whether the point is fixed (non-draggable)"),
  visible: z.boolean().optional().default(true).describe("Whether the point is visible"),
});

// Line schema
const LineSchema = z.object({
  point1: z.string().describe("Name of the first point"),
  point2: z.string().describe("Name of the second point"),
  type: z
    .enum(["line", "segment", "ray"])
    .optional()
    .default("segment")
    .describe("Type of line: line (infinite), segment (between points), or ray (from point1 through point2)"),
  color: z
    .string()
    .optional()
    .default("#333333")
    .describe("Color of the line"),
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
  radius: z.number().optional().describe("Fixed radius value (if not provided, uses second point)"),
  throughPoint: z.string().optional().describe("Name of a point on the circle (for dynamic radius)"),
  color: z
    .string()
    .optional()
    .default("#0066cc")
    .describe("Color of the circle"),
  fillColor: z.string().optional().describe("Fill color of the circle"),
  fillOpacity: z.number().optional().default(0).describe("Fill opacity (0-1)"),
  strokeWidth: z.number().optional().default(2).describe("Width of the circle outline"),
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
  fillOpacity: z.number().optional().default(0.3).describe("Fill opacity (0-1)"),
  strokeWidth: z.number().optional().default(2).describe("Width of the polygon border"),
});

// Angle schema
const AngleSchema = z.object({
  point1: z.string().describe("First point of the angle"),
  vertex: z.string().describe("Vertex point of the angle"),
  point2: z.string().describe("Second point of the angle"),
  radius: z.number().optional().default(30).describe("Radius of the angle arc in pixels"),
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
  fillOpacity: z.number().optional().default(0.3).describe("Fill opacity for sector type (0-1)"),
  label: z.boolean().optional().default(true).describe("Whether to show angle measurement"),
});

// Construction schema
const ConstructionSchema = z.object({
  perpendicular: z
    .array(
      z.object({
        line: z.string().describe("Name of the line (point1-point2)"),
        throughPoint: z.string().describe("Point through which perpendicular passes"),
      }),
    )
    .optional()
    .describe("Perpendicular lines to construct"),
  parallel: z
    .array(
      z.object({
        line: z.string().describe("Name of the line (point1-point2)"),
        throughPoint: z.string().describe("Point through which parallel passes"),
      }),
    )
    .optional()
    .describe("Parallel lines to construct"),
  midpoint: z
    .array(
      z.object({
        point1: z.string().describe("First point"),
        point2: z.string().describe("Second point"),
        name: z.string().describe("Name for the midpoint"),
      }),
    )
    .optional()
    .describe("Midpoints to construct"),
  bisector: z
    .array(
      z.object({
        point1: z.string().describe("First point of the angle"),
        vertex: z.string().describe("Vertex of the angle"),
        point2: z.string().describe("Second point of the angle"),
      }),
    )
    .optional()
    .describe("Angle bisectors to construct"),
});

// Geometry diagram input schema
const schema = {
  points: z
    .array(PointSchema)
    .optional()
    .default([])
    .describe("Array of points to create. Points can be referenced by name in other elements."),
  lines: z
    .array(LineSchema)
    .optional()
    .default([])
    .describe("Array of lines, segments, or rays connecting points"),
  circles: z
    .array(CircleSchema)
    .optional()
    .default([])
    .describe("Array of circles defined by center and radius or through-point"),
  polygons: z
    .array(PolygonSchema)
    .optional()
    .default([])
    .describe("Array of polygons defined by their vertices"),
  angles: z
    .array(AngleSchema)
    .optional()
    .default([])
    .describe("Array of angles to display and measure"),
  showMeasurements: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show measurements (distances, angles)"),
  construction: ConstructionSchema.optional().describe("Geometric constructions like perpendiculars, parallels, midpoints, and angle bisectors"),
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
  inputSchema: zodToJsonSchema(z.object(schema)),
};

// Generate JSXGraph code for geometry diagrams
function generateGeometryDiagramCode(config: any, boundingBox: number[]): string {
  const {
    points = [],
    lines = [],
    circles = [],
    polygons = [],
    angles = [],
    showMeasurements = false,
    construction,
    title = "",
    showCopyright = false,
    showNavigation = true,
    zoom = { enabled: true, wheel: true },
    pan = { enabled: true }
  } = config;

  let jsCode = `var board = JXG.JSXGraph.initBoard('jxgbox_geometry_diagram_${Date.now()}', {"boundingbox":${JSON.stringify(boundingBox)},"axis":true,"grid":true,"keepaspectratio":false,"showCopyright":${showCopyright},"showNavigation":${showNavigation},"zoom":{"enabled":${zoom.enabled},"wheel":${zoom.wheel}},"pan":{"enabled":${pan.enabled}}});\n`;
  
  // Add title if provided
  if (title) {
    jsCode += `board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 0.5}, '${title}'], {fontSize: 18, fontWeight: 'bold'});\n`;
  }

  // Create points first (they are referenced by other elements)
  jsCode += `// Create points\n`;
  points.forEach((point: any, index: number) => {
    const { x, y, name = "", color = "#0066cc", size = 4, fixed = false, visible = true } = point;
    jsCode += `var point${index} = board.create('point', [${x}, ${y}], {name: '${name || `P${index + 1}`}', size: ${size}, color: '${color}', fixed: ${fixed}, visible: ${visible}});\n`;
  });
  jsCode += `\n`;

  // Create lines
  if (lines.length > 0) {
    jsCode += `// Create lines\n`;
    lines.forEach((line: any, index: number) => {
      const { point1, point2, type = "segment", color = "#333333", strokeWidth = 2, dash = 0, name = "" } = line;
      
      // Find the point indices
      const point1Index = points.findIndex((p: any) => p.name === point1 || p.name === `P${points.findIndex((p2: any) => p2.name === point1) + 1}`);
      const point2Index = points.findIndex((p: any) => p.name === point2 || p.name === `P${points.findIndex((p2: any) => p2.name === point2) + 1}`);
      
      if (point1Index !== -1 && point2Index !== -1) {
        if (type === "line") {
          jsCode += `var line${index} = board.create('line', [point${point1Index}, point${point2Index}], {strokeColor: '${color}', strokeWidth: ${strokeWidth}, dash: ${dash}, name: '${name || `Line ${index + 1}`}'});\n`;
        } else if (type === "segment") {
          jsCode += `var line${index} = board.create('segment', [point${point1Index}, point${point2Index}], {strokeColor: '${color}', strokeWidth: ${strokeWidth}, dash: ${dash}, name: '${name || `Segment ${index + 1}`}'});\n`;
        } else if (type === "ray") {
          jsCode += `var line${index} = board.create('ray', [point${point1Index}, point${point2Index}], {strokeColor: '${color}', strokeWidth: ${strokeWidth}, dash: ${dash}, name: '${name || `Ray ${index + 1}`}'});\n`;
        }
      }
    });
    jsCode += `\n`;
  }

  // Create circles
  if (circles.length > 0) {
    jsCode += `// Create circles\n`;
    circles.forEach((circle: any, index: number) => {
      const { center, radius, throughPoint, color = "#0066cc", fillColor, fillOpacity = 0, strokeWidth = 2 } = circle;
      
      // Find the center point index
      const centerIndex = points.findIndex((p: any) => p.name === center || p.name === `P${points.findIndex((p2: any) => p2.name === center) + 1}`);
      
      if (centerIndex !== -1) {
        if (radius !== undefined) {
          jsCode += `var circle${index} = board.create('circle', [point${centerIndex}, ${radius}], {strokeColor: '${color}', strokeWidth: ${strokeWidth}, name: 'Circle ${index + 1}'});\n`;
        } else if (throughPoint) {
          const throughIndex = points.findIndex((p: any) => p.name === throughPoint || p.name === `P${points.findIndex((p2: any) => p2.name === throughPoint) + 1}`);
          if (throughIndex !== -1) {
            jsCode += `var circle${index} = board.create('circle', [point${centerIndex}, point${throughIndex}], {strokeColor: '${color}', strokeWidth: ${strokeWidth}, name: 'Circle ${index + 1}'});\n`;
          }
        }
        
        // Add fill if specified
        if (fillColor && fillOpacity > 0) {
          jsCode += `circle${index}.setAttribute({fillColor: '${fillColor}', fillOpacity: ${fillOpacity}});\n`;
        }
      }
    });
    jsCode += `\n`;
  }

  // Create polygons
  if (polygons.length > 0) {
    jsCode += `// Create polygons\n`;
    polygons.forEach((polygon: any, index: number) => {
      const { vertices, color = "#0066cc", fillColor = "#0066cc", fillOpacity = 0.3, strokeWidth = 2 } = polygon;
      
      // Find vertex point indices
      const vertexIndices = vertices.map((vertexName: string) => {
        return points.findIndex((p: any) => p.name === vertexName || p.name === `P${points.findIndex((p2: any) => p2.name === vertexName) + 1}`);
      }).filter(index => index !== -1);
      
      if (vertexIndices.length >= 3) {
        const vertexPoints = vertexIndices.map(index => `point${index}`).join(', ');
        jsCode += `var polygon${index} = board.create('polygon', [${vertexPoints}], {borders: {strokeColor: '${color}', strokeWidth: ${strokeWidth}}, fillColor: '${fillColor}', fillOpacity: ${fillOpacity}, name: 'Polygon ${index + 1}'});\n`;
      }
    });
    jsCode += `\n`;
  }

  // Create angles
  if (angles.length > 0) {
    jsCode += `// Create angles\n`;
    angles.forEach((angle: any, index: number) => {
      const { point1, vertex, point2, radius = 30, type = "arc", color = "#ff9900", fillOpacity = 0.3, label = true } = angle;
      
      // Find point indices
      const point1Index = points.findIndex((p: any) => p.name === point1 || p.name === `P${points.findIndex((p2: any) => p2.name === point1) + 1}`);
      const vertexIndex = points.findIndex((p: any) => p.name === vertex || p.name === `P${points.findIndex((p2: any) => p2.name === vertex) + 1}`);
      const point2Index = points.findIndex((p: any) => p.name === point2 || p.name === `P${points.findIndex((p2: any) => p2.name === point2) + 1}`);
      
      if (point1Index !== -1 && vertexIndex !== -1 && point2Index !== -1) {
        if (type === "arc") {
          jsCode += `var angle${index} = board.create('angle', [point${point1Index}, point${vertexIndex}, point${point2Index}], {radius: ${radius}, color: '${color}', name: '${label ? 'Angle' : ''}'});\n`;
        } else if (type === "sector") {
          jsCode += `var angle${index} = board.create('sector', [point${point1Index}, point${vertexIndex}, point${point2Index}], {radius: ${radius}, color: '${color}', fillOpacity: ${fillOpacity}, name: '${label ? 'Angle' : ''}'});\n`;
        }
      }
    });
    jsCode += `\n`;
  }

  // Create geometric constructions
  if (construction) {
    jsCode += `// Geometric constructions\n`;
    
    // Perpendiculars
    if (construction.perpendicular) {
      construction.perpendicular.forEach((perp: any, index: number) => {
        const { line, throughPoint } = perp;
        jsCode += `var perp${index} = board.create('perpendicular', [line0, point0], {strokeColor: '#ff6600', strokeWidth: 2, dash: 1, name: 'Perpendicular ${index + 1}'});\n`;
      });
    }
    
    // Parallels
    if (construction.parallel) {
      construction.parallel.forEach((parallel: any, index: number) => {
        const { line, throughPoint } = parallel;
        jsCode += `var parallel${index} = board.create('parallel', [line0, point0], {strokeColor: '#ff6600', strokeWidth: 2, dash: 1, name: 'Parallel ${index + 1}'});\n`;
      });
    }
    
    // Midpoints
    if (construction.midpoint) {
      construction.midpoint.forEach((mid: any, index: number) => {
        const { point1, point2, name } = mid;
        const point1Index = points.findIndex((p: any) => p.name === point1 || p.name === `P${points.findIndex((p2: any) => p2.name === point1) + 1}`);
        const point2Index = points.findIndex((p: any) => p.name === point2 || p.name === `P${points.findIndex((p2: any) => p2.name === point2) + 1}`);
        
        if (point1Index !== -1 && point2Index !== -1) {
          jsCode += `var midpoint${index} = board.create('midpoint', [point${point1Index}, point${point2Index}], {name: '${name || 'Midpoint'}', size: 4, color: '#ff6600', fixed: true});\n`;
        }
      });
    }
    
    // Angle bisectors
    if (construction.bisector) {
      construction.bisector.forEach((bisector: any, index: number) => {
        const { point1, vertex, point2 } = bisector;
        jsCode += `var bisector${index} = board.create('anglebisector', [point0, point1, point2], {strokeColor: '#ff6600', strokeWidth: 2, dash: 1, name: 'Angle Bisector ${index + 1}'});\n`;
      });
    }
    
    jsCode += `\n`;
  }

  // Add measurements if requested
  if (showMeasurements) {
    jsCode += `// Measurements\n`;
    
    // Distance measurements
    if (points.length >= 2) {
      jsCode += `var distance01 = board.create('text', [${(boundingBox[0] + boundingBox[2]) / 2}, ${boundingBox[1] - 1}, function() { return 'Distance: ' + point0.dist(point1).toFixed(2); }], {fontSize: 10, color: '#666'});\n`;
    }
    
    // Angle measurements
    if (angles.length > 0) {
      jsCode += `var angleMeasure = board.create('text', [${(boundingBox[0] + boundingBox[2]) / 2}, ${boundingBox[1] - 1.5}, function() { return 'Angle: ' + (angle0.Value() * 180 / Math.PI).toFixed(1) + '°'; }], {fontSize: 10, color: '#666'});\n`;
    }
  }

  // Add interactive controls
  jsCode += `// Interactive controls\n`;
  jsCode += `var info = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[3] + 1}, 'Drag points to explore the diagram'], {fontSize: 10, color: '#666'});\n`;
  
  // Add construction instructions
  if (construction) {
    jsCode += `var constructionInfo = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[3] + 1.5}, 'Geometric constructions enabled'], {fontSize: 10, color: '#666'});\n`;
  }

  return jsCode;
}

export const geometryDiagram = {
  schema,
  tool,
  generateCode: generateGeometryDiagramCode
};
