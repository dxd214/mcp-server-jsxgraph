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

// Conic section schema
const ConicSectionSchema = z.object({
  type: z
    .enum(["circle", "ellipse", "parabola", "hyperbola"])
    .describe("Type of conic section"),
  center: z
    .object({
      x: z.number().optional().default(0).describe("X coordinate of center"),
      y: z.number().optional().default(0).describe("Y coordinate of center"),
    })
    .optional()
    .describe("Center point (for circle, ellipse, hyperbola)"),
  radius: z.number().optional().describe("Radius (for circle)"),
  a: z
    .number()
    .optional()
    .describe("Semi-major axis (for ellipse) or parameter a (for hyperbola)"),
  b: z
    .number()
    .optional()
    .describe("Semi-minor axis (for ellipse) or parameter b (for hyperbola)"),
  p: z
    .number()
    .optional()
    .describe("Parameter p for parabola (4p is the focal parameter)"),
  vertex: z
    .object({
      x: z.number().optional().default(0).describe("X coordinate of vertex"),
      y: z.number().optional().default(0).describe("Y coordinate of vertex"),
    })
    .optional()
    .describe("Vertex point (for parabola)"),
  orientation: z
    .enum(["horizontal", "vertical"])
    .optional()
    .default("vertical")
    .describe("Orientation of the conic"),
  rotation: z
    .number()
    .optional()
    .default(0)
    .describe("Rotation angle in degrees"),
  color: z
    .string()
    .optional()
    .default("#0066cc")
    .describe("Color of the conic"),
  strokeWidth: z.number().optional().default(2).describe("Width of the curve"),
  fillColor: z.string().optional().describe("Fill color (if applicable)"),
  fillOpacity: z.number().optional().default(0).describe("Fill opacity (0-1)"),
  name: z.string().optional().describe("Label for the conic"),
  dash: z
    .number()
    .optional()
    .default(0)
    .describe("Dash style (0=solid, 1=dotted, 2=dashed)"),
});

// General conic equation schema
const GeneralConicSchema = z.object({
  A: z.number().describe("Coefficient of x²"),
  B: z.number().describe("Coefficient of xy"),
  C: z.number().describe("Coefficient of y²"),
  D: z.number().describe("Coefficient of x"),
  E: z.number().describe("Coefficient of y"),
  F: z.number().describe("Constant term"),
  color: z
    .string()
    .optional()
    .default("#009900")
    .describe("Color of the conic"),
  strokeWidth: z.number().optional().default(2).describe("Width of the curve"),
  name: z.string().optional().describe("Label for the conic"),
});

// Polynomial schema
const PolynomialSchema = z.object({
  coefficients: z
    .array(z.number())
    .describe(
      "Polynomial coefficients [a₀, a₁, a₂, ...] for a₀ + a₁x + a₂x² + ...",
    ),
  color: z
    .string()
    .optional()
    .default("#ff6600")
    .describe("Color of the polynomial"),
  strokeWidth: z.number().optional().default(2).describe("Width of the curve"),
  name: z.string().optional().describe("Label for the polynomial"),
  dash: z
    .number()
    .optional()
    .default(0)
    .describe("Dash style (0=solid, 1=dotted, 2=dashed)"),
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
    .describe(
      "Conic sections in general form: Ax² + Bxy + Cy² + Dx + Ey + F = 0",
    ),
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
    .array(
      z.object({
        point: z
          .object({
            x: z.number().describe("X coordinate of tangent point"),
            y: z.number().describe("Y coordinate of tangent point"),
          })
          .describe("Point where to draw tangent"),
        conicIndex: z
          .number()
          .optional()
          .describe("Index of conic to draw tangent to"),
      }),
    )
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
    .describe(
      "Whether to show polynomial degree and leading coefficient analysis",
    ),
  intersectionAnalysis: z
    .object({
      enabled: z
        .boolean()
        .optional()
        .default(false)
        .describe("Whether to find intersections"),
      between: z
        .array(z.number())
        .length(2)
        .optional()
        .describe("Indices of curves to find intersections between"),
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
  inputSchema: zodToJsonSchema(z.object(schema)),
};

// Generate JSXGraph code for conic sections
function generateConicSectionCode(config: any, boundingBox: number[]): string {
  const {
    conics = [],
    generalConics = [],
    polynomials = [],
    showFoci = true,
    showDirectrix = false,
    showAsymptotes = true,
    showCenter = true,
    showVertices = true,
    showEccentricity = false,
    showTangents = [],
    showPolynomialRoots = true,
    showCriticalPoints = false,
    showInflectionPoints = false,
    degreeAnalysis = false,
    intersectionAnalysis,
    polarForm = false,
    title = "",
    axisXTitle = "x",
    axisYTitle = "y",
    showCopyright = false,
    showNavigation = true,
    zoom = { enabled: true, wheel: true },
    pan = { enabled: true }
  } = config;

  let jsCode = `var board = JXG.JSXGraph.initBoard('jxgbox_conic_section_${Date.now()}', {"boundingbox":${JSON.stringify(boundingBox)},"axis":true,"grid":true,"keepaspectratio":false,"showCopyright":${showCopyright},"showNavigation":${showNavigation},"zoom":{"enabled":${zoom.enabled},"wheel":${zoom.wheel}},"pan":{"enabled":${pan.enabled}}});\n`;
  
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

  // Process standard conic sections
  conics.forEach((conic: any, index: number) => {
    const { type, center = { x: 0, y: 0 }, radius, a, b, p, vertex = { x: 0, y: 0 }, orientation = "vertical", rotation = 0, color = "#0066cc", strokeWidth = 2, fillColor, fillOpacity = 0, name = "", dash = 0 } = conic;
    
    switch (type) {
      case "circle":
        if (radius !== undefined) {
          jsCode += `var circle${index} = board.create('circle', [[${center.x}, ${center.y}], ${radius}], {strokeColor: '${color}', strokeWidth: ${strokeWidth}, dash: ${dash}, name: '${name || `Circle (${center.x}, ${center.y}) r=${radius}`}'});\n`;
          if (fillColor && fillOpacity > 0) {
            jsCode += `circle${index}.setAttribute({fillColor: '${fillColor}', fillOpacity: ${fillOpacity}});\n`;
          }
        }
        break;
        
      case "ellipse":
        if (a !== undefined && b !== undefined) {
          jsCode += `var ellipse${index} = board.create('ellipse', [[${center.x}, ${center.y}], [${center.x + a}, ${center.y}], [${center.x}, ${center.y + b}]], {strokeColor: '${color}', strokeWidth: ${strokeWidth}, dash: ${dash}, name: '${name || `Ellipse (${center.x}, ${center.y}) a=${a}, b=${b}`}'});\n`;
          if (fillColor && fillOpacity > 0) {
            jsCode += `ellipse${index}.setAttribute({fillColor: '${fillColor}', fillOpacity: ${fillOpacity}});\n`;
          }
          
          // Show foci
          if (showFoci) {
            const c = Math.sqrt(a * a - b * b);
            jsCode += `var focus1_${index} = board.create('point', [${center.x + c}, ${center.y}], {name: 'F₁', size: 4, color: '#ff0000', fixed: true});\n`;
            jsCode += `var focus2_${index} = board.create('point', [${center.x - c}, ${center.y}], {name: 'F₂', size: 4, color: '#ff0000', fixed: true});\n`;
          }
          
          // Show center
          if (showCenter) {
            jsCode += `var center${index} = board.create('point', [${center.x}, ${center.y}], {name: 'Center', size: 4, color: '#ff6600', fixed: true});\n`;
          }
          
          // Show vertices
          if (showVertices) {
            jsCode += `var vertex1_${index} = board.create('point', [${center.x + a}, ${center.y}], {name: 'V₁', size: 4, color: '#ff6600', fixed: true});\n`;
            jsCode += `var vertex2_${index} = board.create('point', [${center.x - a}, ${center.y}], {name: 'V₂', size: 4, color: '#ff6600', fixed: true});\n`;
            jsCode += `var vertex3_${index} = board.create('point', [${center.x}, ${center.y + b}], {name: 'V₃', size: 4, color: '#ff6600', fixed: true});\n`;
            jsCode += `var vertex4_${index} = board.create('point', [${center.x}, ${center.y - b}], {name: 'V₄', size: 4, color: '#ff6600', fixed: true});\n`;
          }
        }
        break;
        
      case "parabola":
        if (p !== undefined) {
          if (orientation === "vertical") {
            jsCode += `var parabola${index} = board.create('parabola', [${vertex.x}, ${vertex.y}, ${p}], {strokeColor: '${color}', strokeWidth: ${strokeWidth}, dash: ${dash}, name: '${name || `Parabola (${vertex.x}, ${vertex.y}) p=${p}`}'});\n`;
            
            // Show focus
            if (showFoci) {
              jsCode += `var focus${index} = board.create('point', [${vertex.x}, ${vertex.y + p}], {name: 'Focus', size: 4, color: '#ff0000', fixed: true});\n`;
            }
            
            // Show directrix
            if (showDirectrix) {
              jsCode += `var directrix${index} = board.create('line', [0, 1, -${vertex.y - p}], {strokeColor: '#ff6600', strokeWidth: 2, dash: 1, name: 'Directrix'});\n`;
            }
          } else {
            jsCode += `var parabola${index} = board.create('parabola', [${vertex.x}, ${vertex.y}, ${p}, 'horizontal'], {strokeColor: '${color}', strokeWidth: ${strokeWidth}, dash: ${dash}, name: '${name || `Parabola (${vertex.x}, ${vertex.y}) p=${p}`}'});\n`;
            
            // Show focus
            if (showFoci) {
              jsCode += `var focus${index} = board.create('point', [${vertex.x + p}, ${vertex.y}], {name: 'Focus', size: 4, color: '#ff0000', fixed: true});\n`;
            }
            
            // Show directrix
            if (showDirectrix) {
              jsCode += `var directrix${index} = board.create('line', [1, 0, -${vertex.x - p}], {strokeColor: '#ff6600', strokeWidth: 2, dash: 1, name: 'Directrix'});\n`;
            }
          }
          
          // Show vertex
          if (showVertices) {
            jsCode += `var vertex${index} = board.create('point', [${vertex.x}, ${vertex.y}], {name: 'Vertex', size: 4, color: '#ff6600', fixed: true});\n`;
          }
        }
        break;
        
      case "hyperbola":
        if (a !== undefined && b !== undefined) {
          if (orientation === "horizontal") {
            jsCode += `var hyperbola${index} = board.create('hyperbola', [[${center.x}, ${center.y}], [${center.x + a}, ${center.y}], [${center.x}, ${center.y + b}]], {strokeColor: '${color}', strokeWidth: ${strokeWidth}, dash: ${dash}, name: '${name || `Hyperbola (${center.x}, ${center.y}) a=${a}, b=${b}`}'});\n`;
          } else {
            jsCode += `var hyperbola${index} = board.create('hyperbola', [[${center.x}, ${center.y}], [${center.x}, ${center.y + a}], [${center.x + b}, ${center.y}]], {strokeColor: '${color}', strokeWidth: ${strokeWidth}, dash: ${dash}, name: '${name || `Hyperbola (${center.x}, ${center.y}) a=${a}, b=${b}`}'});\n`;
          }
          
          // Show foci
          if (showFoci) {
            const c = Math.sqrt(a * a + b * b);
            if (orientation === "horizontal") {
              jsCode += `var focus1_${index} = board.create('point', [${center.x + c}, ${center.y}], {name: 'F₁', size: 4, color: '#ff0000', fixed: true});\n`;
              jsCode += `var focus2_${index} = board.create('point', [${center.x - c}, ${center.y}], {name: 'F₂', size: 4, color: '#ff0000', fixed: true});\n`;
            } else {
              jsCode += `var focus1_${index} = board.create('point', [${center.x}, ${center.y + c}], {name: 'F₁', size: 4, color: '#ff0000', fixed: true});\n`;
              jsCode += `var focus2_${index} = board.create('point', [${center.x}, ${center.y - c}], {name: 'F₂', size: 4, color: '#ff0000', fixed: true});\n`;
            }
          }
          
          // Show center
          if (showCenter) {
            jsCode += `var center${index} = board.create('point', [${center.x}, ${center.y}], {name: 'Center', size: 4, color: '#ff6600', fixed: true});\n`;
          }
          
          // Show asymptotes
          if (showAsymptotes) {
            const slope = b / a;
            if (orientation === "horizontal") {
              jsCode += `var asymptote1_${index} = board.create('line', [${slope}, -1, ${center.y - slope * center.x}], {strokeColor: '#ff6600', strokeWidth: 1, dash: 2, name: 'Asymptote 1'});\n`;
              jsCode += `var asymptote2_${index} = board.create('line', [-${slope}, -1, ${center.y + slope * center.x}], {strokeColor: '#ff6600', strokeWidth: 1, dash: 2, name: 'Asymptote 2'});\n`;
            } else {
              jsCode += `var asymptote1_${index} = board.create('line', [1, -${slope}, ${center.x - slope * center.y}], {strokeColor: '#ff6600', strokeWidth: 1, dash: 2, name: 'Asymptote 1'});\n`;
              jsCode += `var asymptote2_${index} = board.create('line', [1, ${slope}, ${center.x + slope * center.y}], {strokeColor: '#ff6600', strokeWidth: 1, dash: 2, name: 'Asymptote 2'});\n`;
            }
          }
        }
        break;
    }
  });
  
  // Process general conic equations
  generalConics.forEach((conic: any, index: number) => {
    const { A, B, C, D, E, F, color = "#009900", strokeWidth = 2, name = "" } = conic;
    jsCode += `var generalConic${index} = board.create('implicit', [${A}*x*x + ${B}*x*y + ${C}*y*y + ${D}*x + ${E}*y + ${F}], {strokeColor: '${color}', strokeWidth: ${strokeWidth}, name: '${name || `General Conic ${A}x² + ${B}xy + ${C}y² + ${D}x + ${E}y + ${F} = 0`}'});\n`;
  });
  
  // Process polynomials
  polynomials.forEach((poly: any, index: number) => {
    const { coefficients, color = "#ff6600", strokeWidth = 2, name = "", dash = 0 } = poly;
    const expression = coefficients.map((coeff: number, i: number) => {
      if (i === 0) return coeff;
      if (i === 1) return coeff === 1 ? 'x' : coeff === -1 ? '-x' : `${coeff}*x`;
      return coeff === 1 ? `x^${i}` : coeff === -1 ? `-x^${i}` : `${coeff}*x^${i}`;
    }).join(' + ').replace(/\+ -/g, '- ');
    
    jsCode += `var polynomial${index} = board.create('functiongraph', [function(x) { return ${expression}; }, ${boundingBox[0]}, ${boundingBox[2]}], {strokeColor: '${color}', strokeWidth: ${strokeWidth}, dash: ${dash}, name: '${name || `P(x) = ${expression}`}'});\n`;
    
    // Show roots if possible
    if (showPolynomialRoots && coefficients.length <= 4) {
      // Simple root finding for low-degree polynomials
      if (coefficients.length === 2) { // Linear: ax + b = 0
        const root = -coefficients[0] / coefficients[1];
        jsCode += `var root${index} = board.create('point', [${root}, 0], {name: 'Root', size: 4, color: '#ff0000', fixed: true});\n`;
      }
    }
  });
  
  // Draw tangent lines
  showTangents.forEach((tangent: any, index: number) => {
    const { point, conicIndex = 0 } = tangent;
    jsCode += `var tangent${index} = board.create('tangent', [${point.x}, ${point.y}], {strokeColor: '#ff9900', strokeWidth: 2, dash: 1, name: 'Tangent'});\n`;
  });
  
  return jsCode;
}

export const conicSection = {
  schema,
  tool,
  generateCode: generateConicSectionCode
};
