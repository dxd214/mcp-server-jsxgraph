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

// Parametric curve data schema
const ParametricCurveSchema = z.object({
  xExpression: z
    .string()
    .describe(
      "X coordinate expression as function of t, e.g., 'Math.cos(t)', '3*Math.cos(t) - Math.cos(3*t)'",
    ),
  yExpression: z
    .string()
    .describe(
      "Y coordinate expression as function of t, e.g., 'Math.sin(t)', '3*Math.sin(t) - Math.sin(3*t)'",
    ),
  tMin: z
    .number()
    .optional()
    .default(0)
    .describe("Minimum value of parameter t"),
  tMax: z
    .number()
    .optional()
    .default(2 * Math.PI)
    .describe("Maximum value of parameter t"),
  color: z
    .string()
    .optional()
    .default("#0066cc")
    .describe("Color of the curve"),
  strokeWidth: z.number().optional().default(2).describe("Width of the curve"),
  name: z.string().optional().describe("Name/label for the curve"),
  dash: z
    .number()
    .optional()
    .default(0)
    .describe("Dash style of the line (0=solid, 1=dotted, 2=dashed)"),
});

// Parametric curve input schema
const schema = {
  curves: z
    .array(ParametricCurveSchema)
    .describe(
      "Array of parametric curves to plot. Each curve is defined by x(t) and y(t) expressions.",
    )
    .nonempty({ message: "At least one parametric curve is required." }),
  showTrace: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show animated trace point moving along the curve"),
  traceSpeed: z
    .number()
    .optional()
    .default(1)
    .describe("Speed of the trace animation (1 = normal speed)"),
  points: z
    .array(
      z.object({
        x: z.number().describe("X coordinate of the point"),
        y: z.number().describe("Y coordinate of the point"),
        name: z.string().optional().describe("Label for the point"),
        color: z
          .string()
          .optional()
          .default("#ff0000")
          .describe("Color of the point"),
        size: z.number().optional().default(3).describe("Size of the point"),
      }),
    )
    .optional()
    .describe("Optional points to plot on the graph"),
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

// Parametric curve tool descriptor
const tool = {
  name: "generate_parametric_curve",
  description:
    "Generate parametric curves using JSXGraph. Ideal for plotting curves defined by parametric equations like circles (cos(t), sin(t)), Lissajous curves, spirals, cycloids, etc. Supports multiple curves and animated traces.",
  inputSchema: zodToJsonSchema(z.object(schema)),
};

// Generate JSXGraph code for parametric curves
function generateParametricCurveCode(config: any, boundingBox: number[]): string {
  const {
    curves,
    showTrace = false,
    traceSpeed = 1,
    points = [],
    title = "",
    axisXTitle = "x",
    axisYTitle = "y",
    showCopyright = false,
    showNavigation = true,
    zoom = { enabled: true, wheel: true },
    pan = { enabled: true }
  } = config;

  let jsCode = `var board = JXG.JSXGraph.initBoard('jxgbox_parametric_curve_${Date.now()}', {"boundingbox":${JSON.stringify(boundingBox)},"axis":true,"grid":true,"keepaspectratio":false,"showCopyright":${showCopyright},"showNavigation":${showNavigation},"zoom":{"enabled":${zoom.enabled},"wheel":${zoom.wheel}},"pan":{"enabled":${pan.enabled}}});\n`;
  
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

  // Process each parametric curve
  curves.forEach((curve: any, index: number) => {
    const { xExpression, yExpression, tMin = 0, tMax = 2 * Math.PI, color = "#0066cc", strokeWidth = 2, name = "", dash = 0 } = curve;
    
    // Create parametric curve
    jsCode += `var curve${index} = board.create('curve', [function(t) { return ${xExpression}; }, function(t) { return ${yExpression}; }, ${tMin}, ${tMax}], {strokeColor: '${color}', strokeWidth: ${strokeWidth}, dash: ${dash}, name: '${name || `Curve ${index + 1}`}'});\n`;
    
    // Add curve label if name is provided
    if (name) {
      // Calculate a point on the curve for label placement
      const tMid = (tMin + tMax) / 2;
      jsCode += `var label${index} = board.create('text', [function() { return ${xExpression.replace(/t/g, 'tMid')}; }, function() { return ${yExpression.replace(/t/g, 'tMid')}; }, '${name}'], {fontSize: 12, color: '${color}', anchorX: 'middle'});\n`;
    }
    
    // Show trace point if requested
    if (showTrace) {
      jsCode += `var trace${index} = board.create('glider', [curve${index}, 0], {name: 'Trace', size: 4, color: '#ff0000', fixed: false});\n`;
      
      // Add trace animation
      jsCode += `var traceAnimation${index} = board.create('slider', [[${boundingBox[0] + 1}, ${boundingBox[1] - 1}], [${boundingBox[0] + 3}, ${boundingBox[1] - 1}], [0, ${tMin}, ${tMax}], {name: 't', snapWidth: 0.1, precision: 2, color: '#ff6600'});\n`;
      jsCode += `trace${index}.setPosition(traceAnimation${index}.Value());\n`;
      jsCode += `traceAnimation${index}.on('drag', function() { trace${index}.setPosition(this.Value()); });\n`;
    }
    
    // Show key points on the curve
    const keyPoints = [tMin, tMin + (tMax - tMin) / 4, tMin + (tMax - tMin) / 2, tMin + 3 * (tMax - tMin) / 4, tMax];
    keyPoints.forEach((t, pointIndex) => {
      if (t >= tMin && t <= tMax) {
        jsCode += `var keyPoint${index}_${pointIndex} = board.create('point', [function() { return ${xExpression.replace(/t/g, t.toString())}; }, function() { return ${yExpression.replace(/t/g, t.toString())}; }], {name: 't=${t.toFixed(2)}', size: 3, color: '${color}', fixed: true});\n`;
      }
    });
  });
  
  // Add static points
  points.forEach((point: any, index: number) => {
    const { x, y, name = "", color = "#ff0000", size = 3 } = point;
    jsCode += `var point${index} = board.create('point', [${x}, ${y}], {name: '${name || `(${x}, ${y})`}', size: ${size}, color: '${color}', fixed: true});\n`;
  });
  
  // Add parameter grid if multiple curves
  if (curves.length > 1) {
    jsCode += `// Parameter grid for multiple curves\n`;
    jsCode += `var tGrid = [];\n`;
    jsCode += `for (var i = 0; i <= 10; i++) {\n`;
    jsCode += `  var t = ${curves[0].tMin} + i * (${curves[0].tMax} - ${curves[0].tMin}) / 10;\n`;
    jsCode += `  tGrid.push(t);\n`;
    jsCode += `}\n`;
    
    // Create grid points for each curve
    curves.forEach((curve: any, index: number) => {
      jsCode += `var grid${index} = [];\n`;
      jsCode += `tGrid.forEach(function(t) {\n`;
      jsCode += `  if (t >= ${curve.tMin} && t <= ${curve.tMax}) {\n`;
      jsCode += `    var x = ${curve.xExpression.replace(/t/g, 't')};\n`;
      jsCode += `    var y = ${curve.yExpression.replace(/t/g, 't')};\n`;
      jsCode += `    if (x >= ${boundingBox[0]} && x <= ${boundingBox[2]} && y >= ${boundingBox[3]} && y <= ${boundingBox[1]}) {\n`;
      jsCode += `      grid${index}.push(board.create('point', [x, y], {size: 2, color: '${curve.color}', fixed: true}));\n`;
      jsCode += `    }\n`;
      jsCode += `  }\n`;
      jsCode += `});\n`;
    });
  }
  
  // Add curve analysis
  if (curves.length === 1) {
    const curve = curves[0];
    jsCode += `// Curve analysis for ${curve.name || 'parametric curve'}\n`;
    
    // Show parameter range
    jsCode += `var paramRange = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 1}, 'Parameter range: t ∈ [${curve.tMin}, ${curve.tMax}]'], {fontSize: 10, color: '#666'});\n`;
    
    // Show curve properties
    if (curve.name.toLowerCase().includes('circle')) {
      jsCode += `var circleInfo = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 1.5}, 'Circle: x = ${curve.xExpression}, y = ${curve.yExpression}'], {fontSize: 10, color: '#666'});\n`;
    } else if (curve.name.toLowerCase().includes('spiral')) {
      jsCode += `var spiralInfo = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 1.5}, 'Spiral: x = ${curve.xExpression}, y = ${curve.yExpression}'], {fontSize: 10, color: '#666'});\n`;
    } else if (curve.name.toLowerCase().includes('lissajous')) {
      jsCode += `var lissajousInfo = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 1.5}, 'Lissajous curve: x = ${curve.xExpression}, y = ${curve.yExpression}'], {fontSize: 10, color: '#666'});\n`;
    }
  }
  
  // Add interactive features
  if (showTrace) {
    jsCode += `// Interactive trace controls\n`;
    jsCode += `var traceControls = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[3] + 1}, 'Drag the slider to trace along the curve'], {fontSize: 10, color: '#666'});\n`;
  }
  
  return jsCode;
}

export const parametricCurve = {
  schema,
  tool,
  generateCode: generateParametricCurveCode
};
