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

// Exponential function schema
const ExponentialFunctionSchema = z.object({
  type: z.enum(["exponential", "logarithm"]).describe("Type of function"),
  base: z
    .number()
    .optional()
    .default(Math.E)
    .describe("Base of exponential/logarithm (default: e)"),
  coefficient: z
    .number()
    .optional()
    .default(1)
    .describe("Coefficient: a in a*b^x or a*log_b(x)"),
  hShift: z.number().optional().default(0).describe("Horizontal shift"),
  vShift: z.number().optional().default(0).describe("Vertical shift"),
  expression: z
    .string()
    .optional()
    .describe("Custom expression (overrides other parameters)"),
  color: z
    .string()
    .optional()
    .default("#0066cc")
    .describe("Color of the curve"),
  strokeWidth: z.number().optional().default(2).describe("Width of the curve"),
  name: z.string().optional().describe("Label for the function"),
  dash: z
    .number()
    .optional()
    .default(0)
    .describe("Dash style (0=solid, 1=dotted, 2=dashed)"),
  domain: z
    .array(z.number())
    .length(2)
    .optional()
    .describe("Domain [min, max]"),
});

// Exponential-logarithm input schema
const schema = {
  functions: z
    .array(ExponentialFunctionSchema)
    .describe("Array of exponential and logarithmic functions to plot")
    .nonempty({ message: "At least one function is required." }),
  showAsymptotes: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show horizontal/vertical asymptotes"),
  showIntercepts: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show and label x and y intercepts"),
  showInverse: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show the inverse function"),
  showReflectionLine: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show y=x line for inverse relationship"),
  comparisonPoints: z
    .array(
      z.object({
        x: z.number().describe("X coordinate to compare values"),
        showValues: z
          .boolean()
          .optional()
          .default(true)
          .describe("Show function values at this point"),
      }),
    )
    .optional()
    .describe("Points to compare function values"),
  growthDecayAnalysis: z
    .object({
      show: z
        .boolean()
        .optional()
        .default(false)
        .describe("Whether to show growth/decay analysis"),
      initialValue: z
        .number()
        .optional()
        .describe("Initial value for growth/decay model"),
      timeUnit: z.string().optional().default("t").describe("Time unit label"),
      rateLabel: z
        .string()
        .optional()
        .default("rate")
        .describe("Growth/decay rate label"),
    })
    .optional()
    .describe("Growth and decay analysis options"),
  logarithmicScale: z
    .object({
      enabled: z
        .boolean()
        .optional()
        .default(false)
        .describe("Use logarithmic scale"),
      axis: z
        .enum(["x", "y", "both"])
        .optional()
        .default("y")
        .describe("Which axis to use log scale"),
    })
    .optional()
    .describe("Logarithmic scale options"),
  specialPoints: z
    .array(
      z.object({
        x: z.number().describe("X coordinate"),
        y: z.number().describe("Y coordinate"),
        label: z.string().optional().describe("Label for the point"),
        color: z
          .string()
          .optional()
          .default("#ff0000")
          .describe("Color of the point"),
        size: z.number().optional().default(4).describe("Size of the point"),
      }),
    )
    .optional()
    .describe("Special points to highlight (e.g., (0,1) for exponentials)"),
  tangentAt: z
    .array(z.number())
    .optional()
    .describe("X coordinates where to show tangent lines"),
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

// Exponential-logarithm tool descriptor
const tool = {
  name: "generate_exponential_logarithm",
  description:
    "Generate exponential and logarithmic function visualizations using JSXGraph. Plot exponential growth/decay, logarithmic functions with various bases, show asymptotes, intercepts, inverse relationships, and growth/decay analysis. Supports logarithmic scales and tangent lines.",
  inputSchema: zodToJsonSchema(z.object(schema)),
};

// Generate JSXGraph code for exponential and logarithmic functions
function generateExponentialLogarithmCode(config: any, boundingBox: number[]): string {
  const {
    functions,
    showAsymptotes = true,
    showIntercepts = true,
    showInverse = false,
    showReflectionLine = false,
    comparisonPoints = [],
    growthDecayAnalysis,
    logarithmicScale,
    specialPoints = [],
    tangentAt = [],
    title = "",
    axisXTitle = "x",
    axisYTitle = "y",
    showCopyright = false,
    showNavigation = true,
    zoom = { enabled: true, wheel: true },
    pan = { enabled: true }
  } = config;

  let jsCode = `var board = JXG.JSXGraph.initBoard('jxgbox_exponential_logarithm_${Date.now()}', {"boundingbox":${JSON.stringify(boundingBox)},"axis":true,"grid":true,"keepaspectratio":false,"showCopyright":${showCopyright},"showNavigation":${showNavigation},"zoom":{"enabled":${zoom.enabled},"wheel":${zoom.wheel}},"pan":{"enabled":${pan.enabled}}});\n`;
  
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

  // Process each function
  functions.forEach((func: any, index: number) => {
    const { type, base = Math.E, coefficient = 1, hShift = 0, vShift = 0, expression, color = "#0066cc", strokeWidth = 2, name = "", dash = 0, domain } = func;
    
    let funcExpression = "";
    let funcName = "";
    
    if (expression) {
      // Use custom expression if provided
      funcExpression = expression;
      funcName = name || `f(x) = ${expression}`;
    } else {
      // Generate expression based on type and parameters
      if (type === "exponential") {
        if (base === Math.E) {
          funcExpression = `${coefficient} * Math.exp(x - ${hShift}) + ${vShift}`;
          funcName = name || `f(x) = ${coefficient === 1 ? '' : coefficient}e^(x${hShift === 0 ? '' : hShift > 0 ? `-${hShift}` : `+${Math.abs(hShift)}`})${vShift === 0 ? '' : vShift > 0 ? `+${vShift}` : vShift}`;
        } else {
          funcExpression = `${coefficient} * Math.pow(${base}, x - ${hShift}) + ${vShift}`;
          funcName = name || `f(x) = ${coefficient === 1 ? '' : coefficient}${base}^(x${hShift === 0 ? '' : hShift > 0 ? `-${hShift}` : `+${Math.abs(hShift)}`})${vShift === 0 ? '' : vShift > 0 ? `+${vShift}` : vShift}`;
        }
      } else if (type === "logarithm") {
        if (base === Math.E) {
          funcExpression = `${coefficient} * Math.log(x - ${hShift}) + ${vShift}`;
          funcName = name || `f(x) = ${coefficient === 1 ? '' : coefficient}ln(x${hShift === 0 ? '' : hShift > 0 ? `-${hShift}` : `+${Math.abs(hShift)}`})${vShift === 0 ? '' : vShift > 0 ? `+${vShift}` : vShift}`;
        } else {
          funcExpression = `${coefficient} * Math.log(x - ${hShift}) / Math.log(${base}) + ${vShift}`;
          funcName = name || `f(x) = ${coefficient === 1 ? '' : coefficient}log_${base}(x${hShift === 0 ? '' : hShift > 0 ? `-${hShift}` : `+${Math.abs(hShift)}`})${vShift === 0 ? '' : vShift > 0 ? `+${vShift}` : vShift}`;
        }
      }
    }
    
    // Create function graph
    const xMin = domain ? domain[0] : boundingBox[0];
    const xMax = domain ? domain[1] : boundingBox[2];
    jsCode += `var f${index} = board.create('functiongraph', [function(x) { return ${funcExpression}; }, ${xMin}, ${xMax}], {strokeColor: '${color}', strokeWidth: ${strokeWidth}, dash: ${dash}, name: '${funcName}'});\n`;
    
    // Show asymptotes
    if (showAsymptotes) {
      if (type === "exponential") {
        // Horizontal asymptote for exponential functions
        jsCode += `var asymptote${index} = board.create('line', [0, 1, -${vShift}], {strokeColor: '#ff6600', strokeWidth: 1, dash: 2, name: 'Horizontal Asymptote y = ${vShift}'});\n`;
      } else if (type === "logarithm") {
        // Vertical asymptote for logarithmic functions
        jsCode += `var asymptote${index} = board.create('line', [1, 0, -${hShift}], {strokeColor: '#ff6600', strokeWidth: 1, dash: 2, name: 'Vertical Asymptote x = ${hShift}'});\n`;
      }
    }
    
    // Show intercepts
    if (showIntercepts) {
      if (type === "exponential") {
        // Y-intercept for exponential functions
        const yIntercept = coefficient * Math.pow(base, -hShift) + vShift;
        jsCode += `var yIntercept${index} = board.create('point', [0, ${yIntercept}], {name: 'y-intercept (0, ${yIntercept.toFixed(2)})', size: 4, color: '#ff0000', fixed: true});\n`;
        
        // X-intercept if it exists
        if (vShift < 0 && coefficient > 0) {
          const xIntercept = hShift + Math.log(-vShift / coefficient) / Math.log(base);
          if (xIntercept >= xMin && xIntercept <= xMax) {
            jsCode += `var xIntercept${index} = board.create('point', [${xIntercept}, 0], {name: 'x-intercept (${xIntercept.toFixed(2)}, 0)', size: 4, color: '#ff0000', fixed: true});\n`;
          }
        }
      } else if (type === "logarithm") {
        // X-intercept for logarithmic functions
        const xIntercept = hShift + 1;
        if (xIntercept >= xMin && xIntercept <= xMax) {
          jsCode += `var xIntercept${index} = board.create('point', [${xIntercept}, 0], {name: 'x-intercept (${xIntercept}, 0)', size: 4, color: '#ff0000', fixed: true});\n`;
        }
        
        // Y-intercept if it exists
        if (hShift < 0) {
          const yIntercept = coefficient * Math.log(-hShift) / Math.log(base) + vShift;
          jsCode += `var yIntercept${index} = board.create('point', [0, ${yIntercept}], {name: 'y-intercept (0, ${yIntercept.toFixed(2)})', size: 4, color: '#ff0000', fixed: true});\n`;
        }
      }
    }
    
    // Show inverse function
    if (showInverse) {
      if (type === "exponential") {
        // Inverse of exponential is logarithm
        const invExpression = `${coefficient === 1 ? '' : coefficient} * Math.log((x - ${vShift}) / ${coefficient}) / Math.log(${base}) + ${hShift}`;
        jsCode += `var inv${index} = board.create('functiongraph', [function(x) { return ${invExpression}; }, ${boundingBox[0]}, ${boundingBox[2]}], {strokeColor: '#ff9900', strokeWidth: ${strokeWidth}, dash: 1, name: 'Inverse of ${funcName}'});\n`;
      } else if (type === "logarithm") {
        // Inverse of logarithm is exponential
        const invExpression = `${coefficient === 1 ? '' : coefficient} * Math.pow(${base}, (x - ${vShift}) / ${coefficient}) + ${hShift}`;
        jsCode += `var inv${index} = board.create('functiongraph', [function(x) { return ${invExpression}; }, ${boundingBox[0]}, ${boundingBox[2]}], {strokeColor: '#ff9900', strokeWidth: ${strokeWidth}, dash: 1, name: 'Inverse of ${funcName}'});\n`;
      }
    }
  });
  
  // Show reflection line (y = x) for inverse relationship
  if (showReflectionLine && showInverse) {
    jsCode += `var reflectionLine = board.create('line', [1, -1, 0], {strokeColor: '#cccccc', strokeWidth: 1, dash: 1, name: 'y = x'});\n`;
  }
  
  // Show comparison points
  comparisonPoints.forEach((point: any, index: number) => {
    const { x, showValues = true } = point;
    if (showValues) {
      functions.forEach((func: any, funcIndex: number) => {
        const { type, base = Math.E, coefficient = 1, hShift = 0, vShift = 0 } = func;
        let yValue = 0;
        
        if (type === "exponential") {
          yValue = coefficient * Math.pow(base, x - hShift) + vShift;
        } else if (type === "logarithm") {
          if (x > hShift) {
            yValue = coefficient * Math.log(x - hShift) / Math.log(base) + vShift;
          }
        }
        
        if (yValue !== 0 || type === "exponential") {
          jsCode += `var compPoint${index}_${funcIndex} = board.create('point', [${x}, ${yValue}], {name: 'f${funcIndex}(${x}) = ${yValue.toFixed(2)}', size: 3, color: '#ff6600', fixed: true});\n`;
        }
      });
    }
  });
  
  // Show special points
  specialPoints.forEach((point: any, index: number) => {
    const { x, y, label = "", color = "#ff0000", size = 4 } = point;
    jsCode += `var specialPoint${index} = board.create('point', [${x}, ${y}], {name: '${label || `(${x}, ${y})`}', size: ${size}, color: '${color}', fixed: true});\n`;
  });
  
  // Draw tangent lines
  tangentAt.forEach((x: number, index: number) => {
    functions.forEach((func: any, funcIndex: number) => {
      const { type, base = Math.E, coefficient = 1, hShift = 0, vShift = 0 } = func;
      let yValue = 0;
      let slope = 0;
      
      if (type === "exponential") {
        yValue = coefficient * Math.pow(base, x - hShift) + vShift;
        slope = coefficient * Math.log(base) * Math.pow(base, x - hShift);
      } else if (type === "logarithm") {
        if (x > hShift) {
          yValue = coefficient * Math.log(x - hShift) / Math.log(base) + vShift;
          slope = coefficient / ((x - hShift) * Math.log(base));
        }
      }
      
      if (yValue !== 0 || type === "exponential") {
        const y1 = yValue + slope * (boundingBox[0] - x);
        const y2 = yValue + slope * (boundingBox[2] - x);
        jsCode += `var tangent${index}_${funcIndex} = board.create('line', [[${boundingBox[0]}, ${y1}], [${boundingBox[2]}, ${y2}]], {strokeColor: '#ff9900', strokeWidth: 2, dash: 1, name: 'Tangent at x = ${x}'});\n`;
      }
    });
  });
  
  // Growth/decay analysis
  if (growthDecayAnalysis && growthDecayAnalysis.show) {
    const { initialValue, timeUnit = "t", rateLabel = "rate" } = growthDecayAnalysis;
    if (initialValue) {
      functions.forEach((func: any, index: number) => {
        if (func.type === "exponential") {
          const base = func.base || Math.E;
          const rate = (base - 1) * 100;
          jsCode += `board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 1 - index * 0.5}, 'Initial value: ${initialValue}, ${rateLabel}: ${rate.toFixed(1)}% per ${timeUnit}'], {fontSize: 12, color: '#666'});\n`;
        }
      });
    }
  }
  
  return jsCode;
}

export const exponentialLogarithm = {
  schema,
  tool,
  generateCode: generateExponentialLogarithmCode
};
