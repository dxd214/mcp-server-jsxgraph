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

// Quadratic function schema
const QuadraticFunctionSchema = z
  .object({
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
  })
  .refine((q) => q.a !== 0, {
    message: "Coefficient 'a' must be non-zero for a quadratic function.",
    path: ["a"],
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
  comparison: z
    .object({
      enabled: z.boolean().optional().default(true),
      showDifferences: z.boolean().optional().default(false),
      highlightIntersections: z.boolean().optional().default(false),
    })
    .optional()
    .describe("Comparison options for multiple quadratics"),
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
  inputSchema: zodToJsonSchema(z.object(schema)),
};

// Generate JSXGraph code for quadratic analysis
function generateQuadraticAnalysisCode(config: any, boundingBox: number[]): string {
  const {
    quadratics,
    showVertex = true,
    showAxisOfSymmetry = true,
    showRoots = true,
    showYIntercept = true,
    showFocusDirectrix = false,
    showDiscriminant = false,
    vertexForm = false,
    factorizedForm = false,
    tangentLines = [],
    shadeRegion,
    compareMode = "overlay",
    title = "",
    axisXTitle = "x",
    axisYTitle = "y",
    showCopyright = false,
    showNavigation = true,
    zoom = { enabled: true, wheel: true },
    pan = { enabled: true }
  } = config;

  let jsCode = `var board = JXG.JSXGraph.initBoard('jxgbox_quadratic_analysis_${Date.now()}', {"boundingbox":${JSON.stringify(boundingBox)},"axis":true,"grid":true,"keepaspectratio":false,"showCopyright":${showCopyright},"showNavigation":${showNavigation},"zoom":{"enabled":${zoom.enabled},"wheel":${zoom.wheel}},"pan":{"enabled":${pan.enabled}}});\n`;
  
  // Add title if provided
  if (title) {
    jsCode += `board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 0.5}, '${title}'], {fontSize: 18, fontWeight: 'bold'});\n`;
  }
  
  // Add axis labels
  if (axisXTitle !== "x") {
    jsCode += `board.create('text', [${(boundingBox[0] + boundingBox[2]) / 2}, ${boundingBox[3] - 0.5}, '${axisXTitle}'], {fontSize: 14, anchorX: 'middle'});\n`;
  }
  if (axisYTitle !== "y") {
    jsCode += `board.create('text', [${boundingBox[0] - 0.5}, ${(boundingBox[1] + boundingBox[3]) / 2}, '${axisYTitle}'], {fontSize: 14, anchorY: 'middle', rotation: 90});\n`;
  }

  // Process each quadratic function
  quadratics.forEach((quad: any, index: number) => {
    const { a, b, c, color = "#0066cc", strokeWidth = 2, name = "", dash = 0 } = quad;
    
    // Create function graph
    jsCode += `var f${index} = board.create('functiongraph', [function(x) { return ${a}*x*x + ${b}*x + ${c}; }, ${boundingBox[0]}, ${boundingBox[2]}], {strokeColor: '${color}', strokeWidth: ${strokeWidth}, dash: ${dash}, name: '${name || `f(x) = ${a}x² + ${b}x + ${c}`}'});\n`;
    
    // Calculate vertex
    const h = -b / (2 * a);
    const k = a * h * h + b * h + c;
    
    // Show vertex
    if (showVertex) {
      jsCode += `var vertex${index} = board.create('point', [${h}, ${k}], {name: '顶点 (${h.toFixed(2)}, ${k.toFixed(2)})', size: 5, color: '#ff0000', fixed: true});\n`;
    }
    
    // Show axis of symmetry
    if (showAxisOfSymmetry) {
      jsCode += `var axis${index} = board.create('line', [[${h}, ${boundingBox[3]}], [${h}, ${boundingBox[1]}]], {strokeColor: '#ff6600', strokeWidth: 2, dash: 2, name: '对称轴 x = ${h.toFixed(2)}'});\n`;
    }
    
    // Calculate and show roots
    if (showRoots) {
      const discriminant = b * b - 4 * a * c;
      if (discriminant >= 0) {
        const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        jsCode += `var root1_${index} = board.create('point', [${root1}, 0], {name: '根 (${root1.toFixed(2)}, 0)', size: 4, color: '#ff0000', fixed: true});\n`;
        jsCode += `var root2_${index} = board.create('point', [${root2}, 0], {name: '根 (${root2.toFixed(2)}, 0)', size: 4, color: '#ff0000', fixed: true});\n`;
      }
    }
    
    // Show y-intercept
    if (showYIntercept) {
      jsCode += `var yIntercept${index} = board.create('point', [0, ${c}], {name: 'y截距 (0, ${c})', size: 4, color: '#ff0000', fixed: true});\n`;
    }
    
    // Show discriminant analysis
    if (showDiscriminant) {
      const discriminant = b * b - 4 * a * c;
      const discriminantText = discriminant > 0 ? "两个不同实根" : discriminant === 0 ? "一个重根" : "无实根";
      jsCode += `board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 1 - index * 0.5}, '判别式: ${discriminant.toFixed(2)} (${discriminantText})'], {fontSize: 12, color: '#666'});\n`;
    }
    
    // Show vertex form
    if (vertexForm) {
      jsCode += `board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 2 - index * 0.5}, '顶点形式: f(x) = ${a}(x - ${h.toFixed(2)})² + ${k.toFixed(2)}'], {fontSize: 12, color: '#666'});\n`;
    }
    
    // Show factorized form if possible
    if (factorizedForm && showRoots) {
      const discriminant = b * b - 4 * a * c;
      if (discriminant >= 0) {
        const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        jsCode += `board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 3 - index * 0.5}, '因式分解: f(x) = ${a}(x - ${root1.toFixed(2)})(x - ${root2.toFixed(2)})'], {fontSize: 12, color: '#666'});\n`;
      }
    }
  });
  
  // Draw tangent lines
  tangentLines.forEach((tangent: any, index: number) => {
    const { x, color = "#ff9900" } = tangent;
    const quad = quadratics[0]; // Use first quadratic for tangent
    const a = quad.a, b = quad.b, c = quad.c;
    const y = a * x * x + b * x + c;
    const slope = 2 * a * x + b;
    const y1 = y + slope * (boundingBox[0] - x);
    const y2 = y + slope * (boundingBox[2] - x);
    
    jsCode += `var tangent${index} = board.create('line', [[${boundingBox[0]}, ${y1}], [${boundingBox[2]}, ${y2}]], {strokeColor: '${color}', strokeWidth: 2, dash: 1, name: '切线 x = ${x}'});\n`;
  });
  
  // Shade regions
  if (shadeRegion) {
    const { type, bounds = [boundingBox[0], boundingBox[2]], color = "#0066cc", opacity = 0.2 } = shadeRegion;
    if (type === "between" && bounds.length === 2) {
      jsCode += `var shade = board.create('polygon', [[${bounds[0]}, 0], [${bounds[1]}, 0], [${bounds[1]}, ${boundingBox[1]}], [${bounds[0]}, ${boundingBox[1]}]], {fillColor: '${color}', fillOpacity: ${opacity}, borders: {strokeColor: '${color}', strokeWidth: 1}});\n`;
    }
  }
  
  return jsCode;
}

export const quadraticAnalysis = {
  schema,
  tool,
  generateCode: generateQuadraticAnalysisCode
};
