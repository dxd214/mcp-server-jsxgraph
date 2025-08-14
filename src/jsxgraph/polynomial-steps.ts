/**
 * Polynomial Function Step-by-Step Analysis Chart
 */

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

// Polynomial schema
const PolynomialSchema = z.object({
  expression: z
    .string()
    .describe("Polynomial expression, e.g., '-2*(x-3)^2*(x^2-16)'"),
  expandedForm: z
    .string()
    .optional()
    .describe("Expanded form for calculations"),
  zeros: z
    .array(
      z.object({
        x: z.number().describe("X-coordinate of the zero"),
        multiplicity: z.number().describe("Multiplicity of the zero"),
        behavior: z
          .enum(["crosses", "touches"])
          .describe("Behavior at the zero: crosses or touches"),
      }),
    )
    .describe("X-intercepts with multiplicity"),
  yIntercept: z.number().describe("Y-intercept value"),
  criticalPoints: z
    .array(
      z.object({
        x: z.number().describe("X-coordinate of the critical point"),
        y: z.number().describe("Y-coordinate of the critical point"),
        type: z
          .enum(["maximum", "minimum", "inflection"])
          .describe("Type of critical point"),
      }),
    )
    .optional()
    .describe("Critical points (maxima, minima, inflection points)"),
  degree: z.number().describe("Polynomial degree"),
  leadingCoefficient: z.number().describe("Leading coefficient"),
});

// Step element schema
const StepElementSchema = z.object({
  type: z
    .enum(["point", "line", "curve", "polygon", "arrow", "text"])
    .describe("Type of element"),
  id: z.string().describe("Element identifier"),
  properties: z.any().describe("Element properties"),
  animation: z
    .object({
      from: z.any().describe("Starting state"),
      to: z.any().describe("Ending state"),
      duration: z.number().describe("Animation duration in milliseconds"),
      easing: z
        .enum(["linear", "ease-in", "ease-out", "ease-in-out"])
        .describe("Animation easing function"),
    })
    .optional()
    .describe("Animation configuration"),
  style: z
    .object({
      color: z.string().optional().describe("Element color"),
      strokeWidth: z.number().optional().describe("Stroke width"),
      dash: z
        .number()
        .optional()
        .describe("Dash style: 0=solid, 1=dotted, 2=dashed"),
      opacity: z.number().optional().describe("Element opacity"),
      fillColor: z.string().optional().describe("Fill color"),
      fillOpacity: z.number().optional().describe("Fill opacity"),
      visible: z.boolean().optional().describe("Element visibility"),
    })
    .optional()
    .describe("Style configuration"),
});

// Step schema
const StepSchema = z.object({
  id: z.string().describe("Step identifier"),
  title: z.string().describe("Step title"),
  description: z.string().describe("Step description"),
  elements: z
    .array(StepElementSchema)
    .describe("Elements to display in this step"),
  annotations: z
    .array(
      z.object({
        text: z.string().describe("Annotation text"),
        position: z
          .array(z.number())
          .length(2)
          .describe("Annotation position [x, y]"),
        style: z
          .object({
            fontSize: z.number().optional().describe("Font size"),
            color: z.string().optional().describe("Text color"),
            fontWeight: z
              .enum(["normal", "bold"])
              .optional()
              .describe("Font weight"),
          })
          .optional()
          .describe("Text style"),
      }),
    )
    .optional()
    .describe("Text annotations for this step"),
  shadingAreas: z
    .array(
      z.object({
        type: z
          .enum(["between-curves", "polygon", "region"])
          .describe("Type of shading area"),
        bounds: z.any().describe("Area bounds"),
        color: z.string().describe("Shading color"),
        opacity: z.number().describe("Shading opacity"),
      }),
    )
    .optional()
    .describe("Areas to shade in this step"),
  pointers: z
    .array(
      z.object({
        from: z
          .array(z.number())
          .length(2)
          .describe("Pointer start position [x, y]"),
        to: z
          .array(z.number())
          .length(2)
          .describe("Pointer end position [x, y]"),
        label: z.string().optional().describe("Pointer label"),
        style: z
          .object({
            color: z.string().optional().describe("Pointer color"),
            strokeWidth: z.number().optional().describe("Pointer width"),
            dash: z.number().optional().describe("Pointer dash style"),
          })
          .optional()
          .describe("Pointer style"),
      }),
    )
    .optional()
    .describe("Pointer arrows for this step"),
});

// Polynomial steps input schema
const schema = {
  polynomial: PolynomialSchema.describe("Polynomial function configuration"),
  steps: z
    .array(StepSchema)
    .optional()
    .describe("Custom steps (if not provided, will generate default steps)"),
  title: z
    .string()
    .optional()
    .default("Polynomial Function Step-by-Step Analysis")
    .describe("Chart title"),
  width: z.number().optional().default(900).describe("Chart width"),
  height: z.number().optional().default(600).describe("Chart height"),
  boundingBox: BoundingBoxSchema,
  axisXTitle: z.string().optional().default("x").describe("X-axis title"),
  axisYTitle: z.string().optional().default("f(x)").describe("Y-axis title"),
  showControls: z
    .boolean()
    .optional()
    .default(true)
    .describe("Show navigation controls"),
  autoPlay: z
    .boolean()
    .optional()
    .default(false)
    .describe("Auto-play through steps"),
  playSpeed: z
    .number()
    .optional()
    .default(3000)
    .describe("Auto-play speed in milliseconds"),
  outputFormat: z
    .enum(["javascript", "html", "image"])
    .optional()
    .default("javascript")
    .describe("Output format"),
  showNavigation: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show navigation controls."),
  showCopyright: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show JSXGraph copyright."),
};

// Polynomial steps tool descriptor
const tool = {
  name: "generate_polynomial_steps",
  description:
    "Generate step-by-step polynomial function analysis with interactive controls. Returns JSXGraph JavaScript code that can be embedded in HTML. Supports animations, step navigation, and visual annotations. Perfect for educational purposes and function analysis demonstrations.",
  inputSchema: zodToJsonSchema(z.object(schema)),
};

// Generate JSXGraph code for polynomial steps analysis
function generatePolynomialStepsCode(config: any, boundingBox: number[]): string {
  const {
    polynomial,
    steps = [],
    title = "Polynomial Function Step-by-Step Analysis",
    width = 900,
    height = 600,
    axisXTitle = "x",
    axisYTitle = "f(x)",
    showControls = true,
    autoPlay = false,
    playSpeed = 3000,
    showCopyright = false,
    showNavigation = true,
    zoom = { enabled: true, wheel: true },
    pan = { enabled: true }
  } = config;

  let jsCode = `var board = JXG.JSXGraph.initBoard('jxgbox_polynomial_steps_${Date.now()}', {"boundingbox":${JSON.stringify(boundingBox)},"axis":true,"grid":true,"keepaspectratio":false,"showCopyright":${showCopyright},"showNavigation":${showNavigation},"zoom":{"enabled":${zoom.enabled},"wheel":${zoom.wheel}},"pan":{"enabled":${pan.enabled}}});\n`;
  
  // Add title
  jsCode += `// Title\n`;
  jsCode += `var title = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 0.5}, '${title}'], {fontSize: 18, fontWeight: 'bold'});\n`;
  jsCode += `\n`;
  
  // Add axis labels
  jsCode += `// Axis labels\n`;
  jsCode += `var xAxisLabel = board.create('text', [${(boundingBox[0] + boundingBox[2]) / 2}, ${boundingBox[3] - 0.5}, '${axisXTitle}'], {fontSize: 14, anchorX: 'middle'});\n`;
  jsCode += `var yAxisLabel = board.create('text', [${boundingBox[0] - 0.5}, ${(boundingBox[1] + boundingBox[3]) / 2}, '${axisYTitle}'], {fontSize: 14, anchorY: 'middle', rotation: 90});\n`;
  jsCode += `\n`;

  // Create polynomial function
  const { expression, expandedForm, zeros, yIntercept, criticalPoints = [], degree, leadingCoefficient } = polynomial;
  jsCode += `// Polynomial function\n`;
  jsCode += `var polynomial = board.create('functiongraph', [function(x) { return ${expression}; }, ${boundingBox[0]}, ${boundingBox[2]}], {strokeColor: '#0066cc', strokeWidth: 3, name: 'f(x) = ${expression}'});\n`;
  jsCode += `\n`;

  // Generate default steps if not provided
  if (steps.length === 0) {
    jsCode += `// Generate default analysis steps\n`;
    
    // Step 1: Basic function information
    jsCode += `// Step 1: Basic information\n`;
    jsCode += `var step1Title = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 1}, 'Step 1: Basic Information'], {fontSize: 14, fontWeight: 'bold', color: '#333'});\n`;
    jsCode += `var degreeInfo = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 1.5}, 'Degree: ${degree}'], {fontSize: 12, color: '#666'});\n`;
    jsCode += `var leadingInfo = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 2}, 'Leading coefficient: ${leadingCoefficient}'], {fontSize: 12, color: '#666'});\n`;
    jsCode += `var yInterceptInfo = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 2.5}, 'Y-intercept: (0, ${yIntercept})'], {fontSize: 12, color: '#666'});\n`;
    jsCode += `\n`;
    
    // Step 2: Zeros and x-intercepts
    jsCode += `// Step 2: Zeros and x-intercepts\n`;
    jsCode += `var step2Title = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 3.5}, 'Step 2: Zeros and X-intercepts'], {fontSize: 14, fontWeight: 'bold', color: '#333'});\n`;
    
    zeros.forEach((zero: any, index: number) => {
      const { x, multiplicity, behavior } = zero;
      jsCode += `var zero${index} = board.create('point', [${x}, 0], {name: '(${x}, 0)', size: 5, color: '#ff0000', fixed: true});\n`;
      jsCode += `var zeroInfo${index} = board.create('text', [${x + 0.5}, 0.5, 'x = ${x}, multiplicity = ${multiplicity}, ${behavior}'], {fontSize: 10, color: '#666'});\n`;
    });
    jsCode += `\n`;
    
    // Step 3: Critical points
    if (criticalPoints.length > 0) {
      jsCode += `// Step 3: Critical points\n`;
      jsCode += `var step3Title = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 5}, 'Step 3: Critical Points'], {fontSize: 14, fontWeight: 'bold', color: '#333'});\n`;
      
      criticalPoints.forEach((point: any, index: number) => {
        const { x, y, type } = point;
        let color = "#ff6600";
        if (type === "maximum") color = "#ff0000";
        else if (type === "minimum") color = "#00ff00";
        else if (type === "inflection") color = "#ff00ff";
        
        jsCode += `var critical${index} = board.create('point', [${x}, ${y}], {name: '(${x}, ${y})', size: 5, color: '${color}', fixed: true});\n`;
        jsCode += `var criticalInfo${index} = board.create('text', [${x + 0.5}, ${y + 0.5}, '${type}: (${x}, ${y})'], {fontSize: 10, color: '#666'});\n`;
      });
      jsCode += `\n`;
    }
    
    // Step 4: End behavior
    jsCode += `// Step 4: End behavior\n`;
    jsCode += `var step4Title = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 6.5}, 'Step 4: End Behavior'], {fontSize: 14, fontWeight: 'bold', color: '#333'});\n`;
    
    if (degree % 2 === 0) {
      if (leadingCoefficient > 0) {
        jsCode += `var endBehavior = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 7}, 'As x → ±∞, f(x) → +∞'], {fontSize: 12, color: '#666'});\n`;
      } else {
        jsCode += `var endBehavior = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 7}, 'As x → ±∞, f(x) → -∞'], {fontSize: 12, color: '#666'});\n`;
      }
    } else {
      if (leadingCoefficient > 0) {
        jsCode += `var endBehavior = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 7}, 'As x → +∞, f(x) → +∞; As x → -∞, f(x) → -∞'], {fontSize: 12, color: '#666'});\n`;
      } else {
        jsCode += `var endBehavior = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 7}, 'As x → +∞, f(x) → -∞; As x → -∞, f(x) → +∞'], {fontSize: 12, color: '#666'});\n`;
      }
    }
    jsCode += `\n`;
    
    // Step 5: Factored form
    if (expandedForm) {
      jsCode += `// Step 5: Factored form\n`;
      jsCode += `var step5Title = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 8.5}, 'Step 5: Factored Form'], {fontSize: 14, fontWeight: 'bold', color: '#333'});\n`;
      jsCode += `var factoredForm = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 9}, 'f(x) = ${expression}'], {fontSize: 12, color: '#666'});\n`;
      jsCode += `var expandedForm = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 9.5}, 'Expanded: ${expandedForm}'], {fontSize: 12, color: '#666'});\n`;
      jsCode += `\n`;
    }
  } else {
    // Use custom steps
    jsCode += `// Custom analysis steps\n`;
    steps.forEach((step: any, stepIndex: number) => {
      jsCode += `// Step ${stepIndex + 1}: ${step.title}\n`;
      jsCode += `var step${stepIndex}Title = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 1 - stepIndex * 2}, 'Step ${stepIndex + 1}: ${step.title}'], {fontSize: 14, fontWeight: 'bold', color: '#333'});\n`;
      jsCode += `var step${stepIndex}Desc = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 1.5 - stepIndex * 2}, '${step.description}'], {fontSize: 12, color: '#666'});\n`;
      
      // Add step elements
      if (step.elements) {
        step.elements.forEach((element: any, elemIndex: number) => {
          const { type, id, properties, style = {} } = element;
          
          switch (type) {
            case "point":
              jsCode += `var ${id} = board.create('point', [${properties.x}, ${properties.y}], {name: '${properties.name || id}', size: ${style.size || 4}, color: '${style.color || '#ff0000'}'});\n`;
              break;
            case "line":
              jsCode += `var ${id} = board.create('line', [[${properties.x1}, ${properties.y1}], [${properties.x2}, ${properties.y2}]], {strokeColor: '${style.color || '#333333'}', strokeWidth: ${style.strokeWidth || 2}});\n`;
              break;
            case "text":
              jsCode += `var ${id} = board.create('text', [${properties.x}, ${properties.y}, '${properties.text}'], {fontSize: ${style.fontSize || 12}, color: '${style.color || '#333'}'});\n`;
              break;
          }
        });
      }
      
      // Add annotations
      if (step.annotations) {
        step.annotations.forEach((annotation: any, annIndex: number) => {
          const { text, position, style = {} } = annotation;
          jsCode += `var annotation${stepIndex}_${annIndex} = board.create('text', [${position[0]}, ${position[1]}, '${text}'], {fontSize: ${style.fontSize || 10}, color: '${style.color || '#666'}'});\n`;
        });
      }
      
      jsCode += `\n`;
    });
  }

  // Add step navigation controls
  if (showControls) {
    jsCode += `// Step navigation controls\n`;
    jsCode += `var currentStep = 0;\n`;
    jsCode += `var totalSteps = ${steps.length || 5};\n`;
    jsCode += `\n`;
    
    jsCode += `// Navigation buttons\n`;
    jsCode += `var prevButton = board.create('button', [${boundingBox[0] + 1}, ${boundingBox[3] + 1}, 'Previous'], {fontSize: 12});\n`;
    jsCode += `var nextButton = board.create('button', [${boundingBox[0] + 3}, ${boundingBox[3] + 1}, 'Next'], {fontSize: 12});\n`;
    jsCode += `var stepLabel = board.create('text', [${boundingBox[0] + 5}, ${boundingBox[3] + 1.5}, 'Step 1 of ' + totalSteps], {fontSize: 12, color: '#333'});\n`;
    jsCode += `\n`;
    
    jsCode += `// Navigation functions\n`;
    jsCode += `function showStep(step) {\n`;
    jsCode += `  currentStep = step;\n`;
    jsCode += `  stepLabel.setText('Step ' + (step + 1) + ' of ' + totalSteps);\n`;
    jsCode += `  // Hide/show elements based on step\n`;
    jsCode += `  // This would need to be implemented based on specific step requirements\n`;
    jsCode += `}\n`;
    jsCode += `\n`;
    
    jsCode += `prevButton.on('click', function() {\n`;
    jsCode += `  if (currentStep > 0) showStep(currentStep - 1);\n`;
    jsCode += `});\n`;
    jsCode += `\n`;
    
    jsCode += `nextButton.on('click', function() {\n`;
    jsCode += `  if (currentStep < totalSteps - 1) showStep(currentStep + 1);\n`;
    jsCode += `});\n`;
    jsCode += `\n`;
  }

  // Add auto-play functionality
  if (autoPlay) {
    jsCode += `// Auto-play functionality\n`;
    jsCode += `var autoPlayInterval = setInterval(function() {\n`;
    jsCode += `  if (currentStep < totalSteps - 1) {\n`;
    jsCode += `    showStep(currentStep + 1);\n`;
    jsCode += `  } else {\n`;
    jsCode += `    clearInterval(autoPlayInterval);\n`;
    jsCode += `  }\n`;
    jsCode += `}, ${playSpeed});\n`;
    jsCode += `\n`;
  }

  // Add polynomial analysis summary
  jsCode += `// Polynomial analysis summary\n`;
  jsCode += `var summary = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[3] + 3}, 'Summary: ${degree}-degree polynomial with ${zeros.length} real zeros'], {fontSize: 12, color: '#333'});\n`;
  
  // Add interactive exploration info
  jsCode += `// Interactive exploration\n`;
  jsCode += `var explorationInfo = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[3] + 3.5}, 'Drag points to explore the function behavior'], {fontSize: 10, color: '#666'});\n`;

  return jsCode;
}

export const polynomialSteps = {
  schema,
  tool,
  generateCode: generatePolynomialStepsCode
};
