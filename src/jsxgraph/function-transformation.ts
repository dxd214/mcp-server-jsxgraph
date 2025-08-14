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

// Base function schema
const BaseFunctionSchema = z.object({
  expression: z
    .string()
    .describe("Base function expression, e.g., 'x^2', 'Math.sin(x)', 'Math.sqrt(x)'"),
  color: z
    .string()
    .optional()
    .default("#0066cc")
    .describe("Color of the base function"),
  strokeWidth: z.number().optional().default(2).describe("Width of the base function curve"),
  name: z.string().optional().default("f(x)").describe("Label for the base function"),
  domain: z
    .array(z.number())
    .length(2)
    .optional()
    .describe("Domain [min, max]"),
});

// Transformation schema
const TransformationSchema = z.object({
  type: z
    .enum(["translate", "scale", "reflect", "absolute", "inverse", "composite"])
    .describe("Type of transformation to apply"),
  parameters: z
    .object({
      h: z.number().optional().describe("Horizontal translation (for translate)"),
      k: z.number().optional().describe("Vertical translation (for translate)"),
      a: z.number().optional().describe("Vertical scale factor (for scale)"),
      b: z.number().optional().describe("Horizontal scale factor (for scale)"),
      axis: z
        .enum(["x", "y", "both"])
        .optional()
        .describe("Reflection axis (for reflect)"),
      innerFunction: z.string().optional().describe("Inner function g(x) for composition"),
    })
    .describe("Parameters for the transformation"),
  color: z.string().optional().describe("Color for the transformed function"),
  strokeWidth: z.number().optional().default(2).describe("Width of the transformed curve"),
  dash: z
    .number()
    .optional()
    .default(0)
    .describe("Dash style (0=solid, 1=dotted, 2=dashed)"),
  name: z.string().optional().describe("Label for the transformation"),
});

// Function transformation input schema
const schema = {
  baseFunction: BaseFunctionSchema.describe("The original function to transform"),
  transformations: z
    .array(TransformationSchema)
    .describe("Array of transformations to apply and visualize")
    .nonempty({ message: "At least one transformation is required." }),
  showSteps: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show intermediate transformation steps"),
  showVectors: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show transformation vectors for translations"),
  highlightPoints: z
    .array(
      z.object({
        x: z.number().describe("X coordinate on base function"),
        showTransformed: z
          .boolean()
          .optional()
          .default(true)
          .describe("Show corresponding points on transformed functions"),
      }),
    )
    .optional()
    .describe("Points to highlight on base and transformed functions"),
  animateTransformation: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to animate the transformation with a slider"),
  compareMode: z
    .enum(["overlay", "side-by-side"])
    .optional()
    .default("overlay")
    .describe("How to display the functions"),
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

// Function transformation tool descriptor
const tool = {
  name: "generate_function_transformation",
  description:
    "Generate function transformations using JSXGraph. Visualize translations, scaling, reflections, absolute value, inverse functions, and function composition. Shows how functions change under various transformations with optional animation and step-by-step visualization.",
  inputSchema: zodToJsonSchema(z.object(schema)),
};

// Generate JSXGraph code for function transformations
function generateFunctionTransformationCode(config: any, boundingBox: number[]): string {
  const {
    baseFunction,
    transformations,
    showSteps = false,
    showVectors = false,
    highlightPoints = [],
    animateTransformation = false,
    compareMode = "overlay",
    title = "",
    axisXTitle = "x",
    axisYTitle = "y",
    showCopyright = false,
    showNavigation = true,
    zoom = { enabled: true, wheel: true },
    pan = { enabled: true }
  } = config;

  let jsCode = `var board = JXG.JSXGraph.initBoard('jxgbox_function_transformation_${Date.now()}', {"boundingbox":${JSON.stringify(boundingBox)},"axis":true,"grid":true,"keepaspectratio":false,"showCopyright":${showCopyright},"showNavigation":${showNavigation},"zoom":{"enabled":${zoom.enabled},"wheel":${zoom.wheel}},"pan":{"enabled":${pan.enabled}}});\n`;
  
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

  const { expression, color = "#0066cc", strokeWidth = 2, name = "f(x)", domain } = baseFunction;
  const xMin = domain ? domain[0] : boundingBox[0];
  const xMax = domain ? domain[1] : boundingBox[2];

  // Create base function
  jsCode += `// Base function\n`;
  jsCode += `var baseFunction = board.create('functiongraph', [function(x) { return ${expression}; }, ${xMin}, ${xMax}], {strokeColor: '${color}', strokeWidth: ${strokeWidth}, name: '${name}'});\n`;
  jsCode += `\n`;

  // Create transformation slider if animation is enabled
  if (animateTransformation) {
    jsCode += `// Transformation animation slider\n`;
    jsCode += `var transformSlider = board.create('slider', [[${boundingBox[0] + 1}, ${boundingBox[1] - 2}], [${boundingBox[0] + 3}, ${boundingBox[1] - 2}], [0, 0, 1], {name: 't', precision: 2, color: '#ff6600'});\n`;
    jsCode += `\n`;
  }

  // Process each transformation
  transformations.forEach((transformation: any, index: number) => {
    const { type, parameters, color: transColor, strokeWidth: transStrokeWidth = 2, dash = 0, name: transName } = transformation;
    
    let transformedExpression = "";
    let transformationName = "";
    
    switch (type) {
      case "translate":
        const h = parameters.h || 0;
        const k = parameters.k || 0;
        transformedExpression = `${expression.replace(/x/g, '(x - ' + h + ')')} + ${k}`;
        transformationName = transName || `f(x - ${h}) + ${k}`;
        
        jsCode += `// Translation: ${transformationName}\n`;
        if (animateTransformation) {
          jsCode += `var trans${index} = board.create('functiongraph', [function(x) { return ${expression.replace(/x/g, '(x - ' + h + ' * transformSlider.Value()')} + ${k} * transformSlider.Value(); }, ${xMin}, ${xMax}], {strokeColor: '${transColor || color}', strokeWidth: ${transStrokeWidth}, dash: ${dash}, name: '${transformationName}'});\n`;
        } else {
          jsCode += `var trans${index} = board.create('functiongraph', [function(x) { return ${transformedExpression}; }, ${xMin}, ${xMax}], {strokeColor: '${transColor || color}', strokeWidth: ${transStrokeWidth}, dash: ${dash}, name: '${transformationName}'});\n`;
        }
        
        // Show translation vectors
        if (showVectors) {
          jsCode += `var vectorH${index} = board.create('arrow', [[0, 0], [${h}, 0]], {strokeColor: '#ff6600', strokeWidth: 2, dash: 1, name: 'Horizontal shift'});\n`;
          jsCode += `var vectorK${index} = board.create('arrow', [[0, 0], [0, ${k}]], {strokeColor: '#ff6600', strokeWidth: 2, dash: 1, name: 'Vertical shift'});\n`;
        }
        break;
        
      case "scale":
        const a = parameters.a || 1;
        const b = parameters.b || 1;
        transformedExpression = `${a} * ${expression.replace(/x/g, 'x / ' + b)}`;
        transformationName = transName || `${a}f(x/${b})`;
        
        jsCode += `// Scaling: ${transformationName}\n`;
        if (animateTransformation) {
          jsCode += `var trans${index} = board.create('functiongraph', [function(x) { return ${a} * transformSlider.Value() * ${expression.replace(/x/g, 'x / (' + b + ' * transformSlider.Value())')}; }, ${xMin}, ${xMax}], {strokeColor: '${transColor || color}', strokeWidth: ${transStrokeWidth}, dash: ${dash}, name: '${transformationName}'});\n`;
        } else {
          jsCode += `var trans${index} = board.create('functiongraph', [function(x) { return ${transformedExpression}; }, ${xMin}, ${xMax}], {strokeColor: '${transColor || color}', strokeWidth: ${transStrokeWidth}, dash: ${dash}, name: '${transformationName}'});\n`;
        }
        break;
        
      case "reflect":
        const axis = parameters.axis || "x";
        if (axis === "x") {
          transformedExpression = `-(${expression})`;
          transformationName = transName || `-f(x)`;
        } else if (axis === "y") {
          transformedExpression = `${expression.replace(/x/g, '-x')}`;
          transformationName = transName || `f(-x)`;
        } else if (axis === "both") {
          transformedExpression = `-(${expression.replace(/x/g, '-x')})`;
          transformationName = transName || `-f(-x)`;
        }
        
        jsCode += `// Reflection: ${transformationName}\n`;
        if (animateTransformation) {
          jsCode += `var trans${index} = board.create('functiongraph', [function(x) { return (1 - 2 * transformSlider.Value()) * ${expression.replace(/x/g, axis === 'y' ? '-x' : 'x')}; }, ${xMin}, ${xMax}], {strokeColor: '${transColor || color}', strokeWidth: ${transStrokeWidth}, dash: ${dash}, name: '${transformationName}'});\n`;
        } else {
          jsCode += `var trans${index} = board.create('functiongraph', [function(x) { return ${transformedExpression}; }, ${xMin}, ${xMax}], {strokeColor: '${transColor || color}', strokeWidth: ${transStrokeWidth}, dash: ${dash}, name: '${transformationName}'});\n`;
        }
        break;
        
      case "absolute":
        transformedExpression = `Math.abs(${expression})`;
        transformationName = transName || `|f(x)|`;
        
        jsCode += `// Absolute value: ${transformationName}\n`;
        if (animateTransformation) {
          jsCode += `var trans${index} = board.create('functiongraph', [function(x) { return transformSlider.Value() * Math.abs(${expression}) + (1 - transformSlider.Value()) * ${expression}; }, ${xMin}, ${xMax}], {strokeColor: '${transColor || color}', strokeWidth: ${transStrokeWidth}, dash: ${dash}, name: '${transformationName}'});\n`;
        } else {
          jsCode += `var trans${index} = board.create('functiongraph', [function(x) { return ${transformedExpression}; }, ${xMin}, ${xMax}], {strokeColor: '${transColor || color}', strokeWidth: ${transStrokeWidth}, dash: ${dash}, name: '${transformationName}'});\n`;
        }
        break;
        
      case "inverse":
        // For inverse, we need to solve for x in terms of y
        // This is simplified - in practice, you'd need more sophisticated inverse calculation
        transformedExpression = `x`; // Placeholder - actual inverse depends on the function
        transformationName = transName || `f⁻¹(x)`;
        
        jsCode += `// Inverse function: ${transformationName}\n`;
        jsCode += `var trans${index} = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 1 - index * 0.5}, 'Inverse: ${transformationName} (requires manual calculation)'], {fontSize: 10, color: '#666'});\n`;
        break;
        
      case "composite":
        const innerFunction = parameters.innerFunction || "x";
        transformedExpression = `${expression.replace(/x/g, '(' + innerFunction + ')')}`;
        transformationName = transName || `f(g(x)) where g(x) = ${innerFunction}`;
        
        jsCode += `// Composition: ${transformationName}\n`;
        if (animateTransformation) {
          jsCode += `var trans${index} = board.create('functiongraph', [function(x) { return ${expression.replace(/x/g, '(' + innerFunction + ')')}; }, ${xMin}, ${xMax}], {strokeColor: '${transColor || color}', strokeWidth: ${transStrokeWidth}, dash: ${dash}, name: '${transformationName}'});\n`;
        } else {
          jsCode += `var trans${index} = board.create('functiongraph', [function(x) { return ${transformedExpression}; }, ${xMin}, ${xMax}], {strokeColor: '${transColor || color}', strokeWidth: ${transStrokeWidth}, dash: ${dash}, name: '${transformationName}'});\n`;
        }
        break;
    }
    
    // Show transformation steps if requested
    if (showSteps) {
      jsCode += `var step${index} = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[3] + 1 + index * 0.5}, 'Step ${index + 1}: ${type} → ${transformationName}'], {fontSize: 10, color: '#666'});\n`;
    }
  });

  // Highlight specific points
  if (highlightPoints.length > 0) {
    jsCode += `// Highlighted points\n`;
    highlightPoints.forEach((point: any, index: number) => {
      const { x, showTransformed = true } = point;
      const y = 0; // This would need to be calculated based on the actual function
      
      jsCode += `var highlight${index} = board.create('point', [${x}, ${y}], {name: 'f(${x})', size: 4, color: '#ff0000', fixed: true});\n`;
      
      if (showTransformed) {
        transformations.forEach((trans: any, transIndex: number) => {
          jsCode += `var highlight${index}_trans${transIndex} = board.create('point', [${x}, ${y}], {name: 'Transformed f(${x})', size: 3, color: '#ff9900', fixed: true});\n`;
        });
      }
    });
  }

  // Add transformation legend
  jsCode += `// Transformation legend\n`;
  jsCode += `var legend = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 1}, 'Transformations:'], {fontSize: 12, color: '#333'});\n`;
  jsCode += `var baseLegend = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 1.3}, '● Base: ${name}'], {fontSize: 10, color: '${color}'});\n`;
  
  transformations.forEach((trans: any, index: number) => {
    const transColor = trans.color || color;
    jsCode += `var transLegend${index} = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 1.6 - index * 0.3}, '● ${trans.type}: ${trans.name || trans.type}'], {fontSize: 10, color: '${transColor}'});\n`;
  });

  // Add comparison mode controls
  if (compareMode === "side-by-side") {
    jsCode += `// Side-by-side comparison mode\n`;
    jsCode += `var compareInfo = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[3] + 1}, 'Side-by-side comparison mode'], {fontSize: 10, color: '#666'});\n`;
  }

  return jsCode;
}

export const functionTransformation = {
  schema,
  tool,
  generateCode: generateFunctionTransformationCode
};
