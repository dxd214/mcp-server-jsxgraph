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

// Generate JSXGraph code for trigonometric analysis
function generateTrigonometricAnalysisCode(config: any, boundingBox: number[]): string {
  const {
    functions,
    analysisOptions = {},
    points = [],
    xAxisUnit = "radians",
    showGrid = true,
    gridType = "standard",
    style = {},
    title = "",
    axisXTitle = "x",
    axisYTitle = "y",
    showCopyright = false,
    showNavigation = true,
    zoom = { enabled: true, wheel: true },
    pan = { enabled: true }
  } = config;

  const {
    showKeyPoints = true,
    showPeriodMarkers = true,
    showAmplitudeLines = false,
    showPhaseShift = false,
    showUnitCircle = false,
    analyzeIntersections = false
  } = analysisOptions;

  let jsCode = `var board = JXG.JSXGraph.initBoard('jxgbox_trigonometric_analysis_${Date.now()}', {"boundingbox":${JSON.stringify(boundingBox)},"axis":true,"grid":${showGrid},"keepaspectratio":false,"showCopyright":${showCopyright},"showNavigation":${showNavigation},"zoom":{"enabled":${zoom.enabled},"wheel":${zoom.wheel}},"pan":{"enabled":${pan.enabled}}});\n`;
  
  // Add title
  if (title) {
    jsCode += `// Title\n`;
    jsCode += `var title = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 0.5}, '${title}'], {fontSize: 18, fontWeight: 'bold'});\n`;
    jsCode += `\n`;
  }
  
  // Add axis labels
  jsCode += `// Axis labels\n`;
  if (axisXTitle !== "x") {
    jsCode += `var xAxisLabel = board.create('text', [${(boundingBox[0] + boundingBox[2]) / 2}, ${boundingBox[3] - 0.5}, '${axisXTitle}'], {fontSize: 14, anchorX: 'middle'});\n`;
  }
  if (axisYTitle !== "y") {
    jsCode += `var yAxisLabel = board.create('text', [${boundingBox[0] - 0.5}, ${(boundingBox[1] + boundingBox[3]) / 2}, '${axisYTitle}'], {fontSize: 14, anchorY: 'middle', rotation: 90});\n`;
  }
  jsCode += `\n`;

  // Add unit circle if requested
  if (showUnitCircle) {
    jsCode += `// Unit circle reference\n`;
    jsCode += `var unitCircle = board.create('circle', [[0, 0], 1], {strokeColor: '#cccccc', strokeWidth: 1, dash: 1, name: 'Unit Circle'});\n`;
    jsCode += `\n`;
  }

  // Create trigonometric functions
  jsCode += `// Trigonometric functions\n`;
  functions.forEach((func: any, index: number) => {
    const { type, transformation = {}, color = "#0066cc", strokeWidth = 2, name = "", domain, dash = 0 } = func;
    const { amplitude = 1, period, frequency = 1, phaseShift = 0, verticalShift = 0 } = transformation;
    
    // Calculate period if not provided
    const actualPeriod = period || (2 * Math.PI / frequency);
    
    // Create function expression based on type
    let expression = "";
    switch (type) {
      case "sin":
        expression = `${amplitude} * Math.sin(${frequency} * (x - ${phaseShift})) + ${verticalShift}`;
        break;
      case "cos":
        expression = `${amplitude} * Math.cos(${frequency} * (x - ${phaseShift})) + ${verticalShift}`;
        break;
      case "tan":
        expression = `${amplitude} * Math.tan(${frequency} * (x - ${phaseShift})) + ${verticalShift}`;
        break;
      case "csc":
        expression = `${amplitude} / Math.sin(${frequency} * (x - ${phaseShift})) + ${verticalShift}`;
        break;
      case "sec":
        expression = `${amplitude} / Math.cos(${frequency} * (x - ${phaseShift})) + ${verticalShift}`;
        break;
      case "cot":
        expression = `${amplitude} / Math.tan(${frequency} * (x - ${phaseShift})) + ${verticalShift}`;
        break;
      case "asin":
        expression = `${amplitude} * Math.asin(x - ${phaseShift}) + ${verticalShift}`;
        break;
      case "acos":
        expression = `${amplitude} * Math.acos(x - ${phaseShift}) + ${verticalShift}`;
        break;
      case "atan":
        expression = `${amplitude} * Math.atan(${frequency} * (x - ${phaseShift})) + ${verticalShift}`;
        break;
      case "sinh":
        expression = `${amplitude} * Math.sinh(${frequency} * (x - ${phaseShift})) + ${verticalShift}`;
        break;
      case "cosh":
        expression = `${amplitude} * Math.cosh(${frequency} * (x - ${phaseShift})) + ${verticalShift}`;
        break;
      case "tanh":
        expression = `${amplitude} * Math.tanh(${frequency} * (x - ${phaseShift})) + ${verticalShift}`;
        break;
      default:
        expression = `Math.sin(x)`;
    }
    
    const xMin = domain ? domain[0] : boundingBox[0];
    const xMax = domain ? domain[1] : boundingBox[2];
    
    jsCode += `var func${index} = board.create('functiongraph', [function(x) { return ${expression}; }, ${xMin}, ${xMax}], {strokeColor: '${color}', strokeWidth: ${strokeWidth}, dash: ${dash}, name: '${name || type}'});\n`;
    
    // Add asymptotes for functions that have them
    if (func.showAsymptotes && ["tan", "sec", "csc", "cot"].includes(type)) {
      jsCode += `// Asymptotes for ${type}\n`;
      const asymptoteCount = Math.floor((xMax - xMin) / actualPeriod) + 1;
      for (let i = 0; i < asymptoteCount; i++) {
        const asymptoteX = xMin + i * actualPeriod + (actualPeriod / 2) + phaseShift;
        if (asymptoteX >= xMin && asymptoteX <= xMax) {
          jsCode += `var asymptote${index}_${i} = board.create('line', [[${asymptoteX}, ${boundingBox[3]}], [${asymptoteX}, ${boundingBox[1]}]], {strokeColor: '#ff0000', strokeWidth: 1, dash: 2, name: 'Asymptote'});\n`;
        }
      }
    }
    
    // Add period markers
    if (showPeriodMarkers) {
      jsCode += `// Period markers for ${type}\n`;
      const markerCount = Math.floor((xMax - xMin) / actualPeriod) + 1;
      for (let i = 0; i <= markerCount; i++) {
        const markerX = xMin + i * actualPeriod + phaseShift;
        if (markerX >= xMin && markerX <= xMax) {
          jsCode += `var periodMarker${index}_${i} = board.create('point', [${markerX}, 0], {size: 2, color: '#666666', name: 'Period'});\n`;
          jsCode += `var periodLabel${index}_${i} = board.create('text', [${markerX}, -0.5, '${xAxisUnit === "degrees" ? Math.round(markerX * 180 / Math.PI) + "°" : markerX.toFixed(2)}'], {fontSize: 8, color: '#666666'});\n`;
        }
      }
    }
    
    // Add amplitude lines
    if (showAmplitudeLines && ["sin", "cos", "tan", "csc", "sec", "cot"].includes(type)) {
      jsCode += `// Amplitude lines for ${type}\n`;
      jsCode += `var amplitudeLineTop${index} = board.create('line', [[${xMin}, ${verticalShift + amplitude}], [${xMax}, ${verticalShift + amplitude}]], {strokeColor: '#00ff00', strokeWidth: 1, dash: 1, name: 'Amplitude +'});\n`;
      jsCode += `var amplitudeLineBottom${index} = board.create('line', [[${xMin}, ${verticalShift - amplitude}], [${xMax}, ${verticalShift - amplitude}]], {strokeColor: '#00ff00', strokeWidth: 1, dash: 1, name: 'Amplitude -'});\n`;
    }
    
    // Add phase shift indicator
    if (showPhaseShift && phaseShift !== 0) {
      jsCode += `// Phase shift indicator for ${type}\n`;
      jsCode += `var phaseShiftLine${index} = board.create('line', [[${phaseShift}, ${boundingBox[3]}], [${phaseShift}, ${boundingBox[1]}]], {strokeColor: '#ff6600', strokeWidth: 2, dash: 1, name: 'Phase Shift'});\n`;
      jsCode += `var phaseShiftLabel${index} = board.create('text', [${phaseShift}, ${boundingBox[1] - 0.5}, 'Phase Shift: ${phaseShift}'], {fontSize: 10, color: '#ff6600'});\n`;
    }
    
    jsCode += `\n`;
  });

  // Add key points analysis
  if (showKeyPoints) {
    jsCode += `// Key points analysis\n`;
    jsCode += `var keyPointsTitle = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 1}, 'Key Points Analysis'], {fontSize: 14, fontWeight: 'bold', color: '#333'});\n`;
    
    functions.forEach((func: any, index: number) => {
      const { type, transformation = {} } = func;
      const { amplitude = 1, frequency = 1, phaseShift = 0, verticalShift = 0 } = transformation;
      
      if (["sin", "cos"].includes(type)) {
        // Find zeros, maxima, and minima
        jsCode += `// Key points for ${type}\n`;
        const period = 2 * Math.PI / frequency;
        const zeroOffset = type === "sin" ? 0 : Math.PI / 2;
        
        for (let i = 0; i < 3; i++) {
          const zeroX = phaseShift + zeroOffset + i * period;
          const maxX = phaseShift + zeroOffset + Math.PI / 2 + i * period;
          const minX = phaseShift + zeroOffset + 3 * Math.PI / 2 + i * period;
          
          if (zeroX >= boundingBox[0] && zeroX <= boundingBox[2]) {
            jsCode += `var zero${index}_${i} = board.create('point', [${zeroX}, 0], {size: 4, color: '#ff0000', name: 'Zero'});\n`;
          }
          if (maxX >= boundingBox[0] && maxX <= boundingBox[2]) {
            jsCode += `var max${index}_${i} = board.create('point', [${maxX}, ${verticalShift + amplitude}], {size: 4, color: '#00ff00', name: 'Maximum'});\n`;
          }
          if (minX >= boundingBox[0] && minX <= boundingBox[2]) {
            jsCode += `var min${index}_${i} = board.create('point', [${minX}, ${verticalShift - amplitude}], {size: 4, color: '#0000ff', name: 'Minimum'});\n`;
          }
        }
      }
    });
    jsCode += `\n`;
  }

  // Add additional points
  if (points.length > 0) {
    jsCode += `// Additional points\n`;
    points.forEach((point: any, index: number) => {
      const { x, y, name = "", color = "#ff0000", size = 3 } = point;
      jsCode += `var point${index} = board.create('point', [${x}, ${y}], {size: ${size}, color: '${color}', name: '${name || `(${x}, ${y})`}'});\n`;
    });
    jsCode += `\n`;
  }

  // Add intersection analysis
  if (analyzeIntersections && functions.length > 1) {
    jsCode += `// Intersection analysis\n`;
    jsCode += `var intersectionTitle = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 2}, 'Intersection Analysis'], {fontSize: 12, fontWeight: 'bold', color: '#333'});\n`;
    jsCode += `// Note: Exact intersection points would require numerical methods\n`;
    jsCode += `// This is a simplified visual approach\n`;
    jsCode += `\n`;
  }

  // Add function information panel
  jsCode += `// Function information panel\n`;
  jsCode += `var infoPanel = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[3] + 1}, 'Trigonometric Functions: ${functions.map((f: any) => f.type).join(", ")}'], {fontSize: 12, color: '#333'});\n`;
  
  if (xAxisUnit === "degrees") {
    jsCode += `var unitInfo = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[3] + 1.5}, 'X-axis in degrees'], {fontSize: 10, color: '#666'});\n`;
  }
  
  // Add interactive controls
  jsCode += `// Interactive controls\n`;
  jsCode += `var controlsInfo = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[3] + 2}, 'Drag to explore, zoom to see details'], {fontSize: 10, color: '#666'});\n`;

  return jsCode;
}

export const trigonometricAnalysis = {
  schema,
  tool,
  generateCode: generateTrigonometricAnalysisCode
};