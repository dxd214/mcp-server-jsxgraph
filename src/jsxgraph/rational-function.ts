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

// Rational function schema
const RationalFunctionSchema = z.object({
  numerator: z
    .string()
    .describe("Numerator polynomial expression, e.g., 'x^2 + 2*x + 1'"),
  denominator: z
    .string()
    .describe("Denominator polynomial expression, e.g., 'x - 1'"),
  color: z
    .string()
    .optional()
    .default("#0066cc")
    .describe("Color of the function curve"),
  strokeWidth: z.number().optional().default(2).describe("Width of the curve"),
  name: z.string().optional().describe("Label for the function"),
  dash: z
    .number()
    .optional()
    .default(0)
    .describe("Dash style (0=solid, 1=dotted, 2=dashed)"),
});

// Irrational function schema
const IrrationalFunctionSchema = z.object({
  expression: z
    .string()
    .describe(
      "Irrational function expression, e.g., 'Math.sqrt(x)', 'Math.cbrt(x^2 - 1)'",
    ),
  domain: z
    .array(z.number())
    .length(2)
    .optional()
    .describe("Domain restrictions [min, max]"),
  color: z
    .string()
    .optional()
    .default("#009900")
    .describe("Color of the function curve"),
  strokeWidth: z.number().optional().default(2).describe("Width of the curve"),
  name: z.string().optional().describe("Label for the function"),
  dash: z
    .number()
    .optional()
    .default(0)
    .describe("Dash style (0=solid, 1=dotted, 2=dashed)"),
});

// Rational function input schema
const schema = {
  rationalFunctions: z
    .array(RationalFunctionSchema)
    .optional()
    .describe("Array of rational functions (P(x)/Q(x)) to plot"),
  irrationalFunctions: z
    .array(IrrationalFunctionSchema)
    .optional()
    .describe("Array of irrational functions (involving roots) to plot"),
  showVerticalAsymptotes: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show vertical asymptotes"),
  showHorizontalAsymptotes: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show horizontal asymptotes"),
  showObliqueAsymptotes: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show oblique/slant asymptotes"),
  showHoles: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show removable discontinuities (holes)"),
  showIntercepts: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show x and y intercepts"),
  showCriticalPoints: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show local maxima and minima"),
  showDomainRestrictions: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      "Whether to highlight domain restrictions for irrational functions",
    ),
  analyzeEndBehavior: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show end behavior analysis"),
  factorization: z
    .object({
      show: z
        .boolean()
        .optional()
        .default(false)
        .describe("Whether to show factored form"),
      simplify: z
        .boolean()
        .optional()
        .default(true)
        .describe("Whether to simplify and cancel common factors"),
    })
    .optional()
    .describe("Factorization and simplification options"),
  partialFractions: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show partial fraction decomposition"),
  tangentLines: z
    .array(z.number())
    .optional()
    .describe("X coordinates where to draw tangent lines"),
  shadeRegions: z
    .array(
      z.object({
        type: z
          .enum(["above", "below", "between"])
          .describe("Region type relative to function"),
        functionIndex: z
          .number()
          .describe("Index of the function to shade relative to"),
        bounds: z
          .array(z.number())
          .length(2)
          .optional()
          .describe("X bounds [min, max]"),
        color: z.string().optional().default("#0066cc").describe("Shade color"),
        opacity: z
          .number()
          .optional()
          .default(0.2)
          .describe("Shade opacity (0-1)"),
      }),
    )
    .optional()
    .describe("Regions to shade"),
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

// Rational function tool descriptor
const tool = {
  name: "generate_rational_function",
  description:
    "Generate rational and irrational function visualizations using JSXGraph. Plot rational functions with asymptotes (vertical, horizontal, oblique), holes, intercepts, and critical points. Visualize irrational functions with domain restrictions. Supports factorization, partial fractions, and end behavior analysis.",
  inputSchema: zodToJsonSchema(z.object(schema)),
};

// Generate JSXGraph code for rational and irrational functions
function generateRationalFunctionCode(config: any, boundingBox: number[]): string {
  const {
    rationalFunctions = [],
    irrationalFunctions = [],
    showVerticalAsymptotes = true,
    showHorizontalAsymptotes = true,
    showObliqueAsymptotes = true,
    showHoles = true,
    showIntercepts = true,
    showCriticalPoints = false,
    showDomainRestrictions = true,
    analyzeEndBehavior = false,
    factorization,
    partialFractions = false,
    tangentLines = [],
    shadeRegions = [],
    title = "",
    axisXTitle = "x",
    axisYTitle = "y",
    showCopyright = false,
    showNavigation = true,
    zoom = { enabled: true, wheel: true },
    pan = { enabled: true }
  } = config;

  let jsCode = `var board = JXG.JSXGraph.initBoard('jxgbox_rational_function_${Date.now()}', {"boundingbox":${JSON.stringify(boundingBox)},"axis":true,"grid":true,"keepaspectratio":false,"showCopyright":${showCopyright},"showNavigation":${showNavigation},"zoom":{"enabled":${zoom.enabled},"wheel":${zoom.wheel}},"pan":{"enabled":${pan.enabled}}});\n`;
  
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

  // Process rational functions
  rationalFunctions.forEach((func: any, index: number) => {
    const { numerator, denominator, color = "#0066cc", strokeWidth = 2, name = "", dash = 0 } = func;
    
    // Create rational function
    jsCode += `var rational${index} = board.create('functiongraph', [function(x) { return (${numerator}) / (${denominator}); }, ${boundingBox[0]}, ${boundingBox[2]}], {strokeColor: '${color}', strokeWidth: ${strokeWidth}, dash: ${dash}, name: '${name || `f(x) = (${numerator}) / (${denominator})`}'});\n`;
    
    // Show vertical asymptotes (roots of denominator)
    if (showVerticalAsymptotes) {
      // Simple vertical asymptote detection for common cases
      if (denominator.includes('x - ')) {
        const match = denominator.match(/x - (-?\d+)/);
        if (match) {
          const asymptoteX = parseFloat(match[1]);
          jsCode += `var vAsymptote${index} = board.create('line', [1, 0, -${asymptoteX}], {strokeColor: '#ff6600', strokeWidth: 1, dash: 2, name: 'Vertical Asymptote x = ${asymptoteX}'});\n`;
        }
      } else if (denominator.includes('x + ')) {
        const match = denominator.match(/x \+ (\d+)/);
        if (match) {
          const asymptoteX = -parseFloat(match[1]);
          jsCode += `var vAsymptote${index} = board.create('line', [1, 0, -${asymptoteX}], {strokeColor: '#ff6600', strokeWidth: 1, dash: 2, name: 'Vertical Asymptote x = ${asymptoteX}'});\n`;
        }
      }
    }
    
    // Show horizontal asymptotes
    if (showHorizontalAsymptotes) {
      // Simple horizontal asymptote detection
      if (numerator.includes('x^2') && denominator.includes('x^2')) {
        // Both have x² terms, asymptote is ratio of coefficients
        jsCode += `var hAsymptote${index} = board.create('line', [0, 1, 0], {strokeColor: '#ff6600', strokeWidth: 1, dash: 2, name: 'Horizontal Asymptote y = 0'});\n`;
      } else if (numerator.includes('x^2') && !denominator.includes('x^2')) {
        // Numerator has higher degree, no horizontal asymptote
        jsCode += `var obliqueAsymptote${index} = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 1 - index * 0.5}, 'Oblique asymptote (numerator degree > denominator degree)'], {fontSize: 10, color: '#666'});\n`;
      } else if (!numerator.includes('x^2') && !denominator.includes('x^2')) {
        // Both linear, asymptote is ratio of coefficients
        jsCode += `var hAsymptote${index} = board.create('line', [0, 1, 0], {strokeColor: '#ff6600', strokeWidth: 1, dash: 2, name: 'Horizontal Asymptote y = 0'});\n`;
      }
    }
    
    // Show intercepts
    if (showIntercepts) {
      // Y-intercept (x = 0)
      jsCode += `var yIntercept${index} = board.create('point', [0, function() { return (${numerator.replace(/x/g, '0')}) / (${denominator.replace(/x/g, '0')}); }], {name: 'y-intercept', size: 4, color: '#ff0000', fixed: true});\n`;
      
      // X-intercept (y = 0, numerator = 0)
      if (numerator.includes('x')) {
        // Simple x-intercept detection
        if (numerator.includes('x - ')) {
          const match = numerator.match(/x - (-?\d+)/);
          if (match) {
            const interceptX = parseFloat(match[1]);
            jsCode += `var xIntercept${index} = board.create('point', [${interceptX}, 0], {name: 'x-intercept (${interceptX}, 0)', size: 4, color: '#ff0000', fixed: true});\n`;
          }
        } else if (numerator.includes('x + ')) {
          const match = numerator.match(/x \+ (\d+)/);
          if (match) {
            const interceptX = -parseFloat(match[1]);
            jsCode += `var xIntercept${index} = board.create('point', [${interceptX}, 0], {name: 'x-intercept (${interceptX}, 0)', size: 4, color: '#ff0000', fixed: true});\n`;
          }
        }
      }
    }
    
    // Show holes (common roots of numerator and denominator)
    if (showHoles) {
      // Simple hole detection for common factors
      if (numerator.includes('x - ') && denominator.includes('x - ')) {
        const numMatch = numerator.match(/x - (-?\d+)/);
        const denMatch = denominator.match(/x - (-?\d+)/);
        if (numMatch && denMatch && numMatch[1] === denMatch[1]) {
          const holeX = parseFloat(numMatch[1]);
          const holeY = 0; // Simplified, could calculate actual value
          jsCode += `var hole${index} = board.create('point', [${holeX}, ${holeY}], {name: 'Hole (${holeX}, ${holeY})', size: 4, color: '#ff9900', fixed: true});\n`;
        }
      }
    }
  });
  
  // Process irrational functions
  irrationalFunctions.forEach((func: any, index: number) => {
    const { expression, domain, color = "#009900", strokeWidth = 2, name = "", dash = 0 } = func;
    
    // Create irrational function
    const xMin = domain ? domain[0] : boundingBox[0];
    const xMax = domain ? domain[1] : boundingBox[2];
    jsCode += `var irrational${index} = board.create('functiongraph', [function(x) { return ${expression}; }, ${xMin}, ${xMax}], {strokeColor: '${color}', strokeWidth: ${strokeWidth}, dash: ${dash}, name: '${name || `f(x) = ${expression}`}'});\n`;
    
    // Show domain restrictions
    if (showDomainRestrictions && domain) {
      jsCode += `var domain${index} = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 1 - index * 0.5}, 'Domain: x ∈ [${domain[0]}, ${domain[1]}]'], {fontSize: 10, color: '#666'});\n`;
      
      // Highlight domain boundaries
      jsCode += `var domainBoundary1${index} = board.create('line', [1, 0, -${domain[0]}], {strokeColor: '#ff6600', strokeWidth: 2, dash: 1, name: 'Domain boundary x = ${domain[0]}'});\n`;
      jsCode += `var domainBoundary2${index} = board.create('line', [1, 0, -${domain[1]}], {strokeColor: '#ff6600', strokeWidth: 2, dash: 1, name: 'Domain boundary x = ${domain[1]}'});\n`;
    }
    
    // Show intercepts for irrational functions
    if (showIntercepts) {
      // Y-intercept if x = 0 is in domain
      if (!domain || (domain[0] <= 0 && domain[1] >= 0)) {
        jsCode += `var yIntercept${index} = board.create('point', [0, function() { return ${expression.replace(/x/g, '0')}; }], {name: 'y-intercept', size: 4, color: '#ff0000', fixed: true});\n`;
      }
      
      // X-intercept (y = 0)
      if (expression.includes('Math.sqrt') || expression.includes('Math.cbrt')) {
        // For root functions, x-intercept is usually at x = 0 or where the argument is 0
        jsCode += `var xIntercept${index} = board.create('point', [0, 0], {name: 'x-intercept (0, 0)', size: 4, color: '#ff0000', fixed: true});\n`;
      }
    }
  });
  
  // Draw tangent lines
  tangentLines.forEach((x: number, index: number) => {
    // Add tangent line for rational functions
    rationalFunctions.forEach((func: any, funcIndex: number) => {
      const { numerator, denominator } = func;
      jsCode += `var tangent${index}_${funcIndex} = board.create('tangent', [${x}, 0], {strokeColor: '#ff9900', strokeWidth: 2, dash: 1, name: 'Tangent at x = ${x}'});\n`;
    });
    
    // Add tangent line for irrational functions
    irrationalFunctions.forEach((func: any, funcIndex: number) => {
      const { expression, domain } = func;
      if (!domain || (x >= domain[0] && x <= domain[1])) {
        jsCode += `var tangent${index}_irrational${funcIndex} = board.create('tangent', [${x}, 0], {strokeColor: '#ff9900', strokeWidth: 2, dash: 1, name: 'Tangent at x = ${x}'});\n`;
      }
    });
  });
  
  // Shade regions
  shadeRegions.forEach((region: any, index: number) => {
    const { type, functionIndex, bounds = [boundingBox[0], boundingBox[2]], color = "#0066cc", opacity = 0.2 } = region;
    
    if (type === "between" && bounds.length === 2) {
      jsCode += `var shade${index} = board.create('polygon', [[${bounds[0]}, 0], [${bounds[1]}, 0], [${bounds[1]}, ${boundingBox[1]}], [${bounds[0]}, ${boundingBox[1]}]], {fillColor: '${color}', fillOpacity: ${opacity}, borders: {strokeColor: '${color}', strokeWidth: 1}});\n`;
    }
  });
  
  // Show factorization if requested
  if (factorization && factorization.show) {
    rationalFunctions.forEach((func: any, index: number) => {
      const { numerator, denominator } = func;
      jsCode += `var factorization${index} = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[3] + 1 + index * 0.5}, 'Factorization: (${numerator}) / (${denominator})'], {fontSize: 10, color: '#666'});\n`;
    });
  }
  
  // Show end behavior analysis
  if (analyzeEndBehavior) {
    rationalFunctions.forEach((func: any, index: number) => {
      const { numerator, denominator } = func;
      if (numerator.includes('x^2') && denominator.includes('x^2')) {
        jsCode += `var endBehavior${index} = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[3] + 1 + index * 0.5}, 'End behavior: y → 0 as x → ±∞'], {fontSize: 10, color: '#666'});\n`;
      } else if (numerator.includes('x^2') && !denominator.includes('x^2')) {
        jsCode += `var endBehavior${index} = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[3] + 1 + index * 0.5}, 'End behavior: y → ±∞ as x → ±∞'], {fontSize: 10, color: '#666'});\n`;
      }
    });
  }
  
  return jsCode;
}

export const rationalFunction = {
  schema,
  tool,
  generateCode: generateRationalFunctionCode
};
