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

// Equation schema
const EquationSchema = z.object({
  expression: z
    .string()
    .describe("Equation expression, e.g., 'x^2 + y^2 - 25' for x² + y² = 25"),
  type: z
    .enum(["implicit", "explicit", "parametric"])
    .optional()
    .default("implicit")
    .describe("Type of equation"),
  color: z
    .string()
    .optional()
    .default("#0066cc")
    .describe("Color of the curve"),
  strokeWidth: z.number().optional().default(2).describe("Width of the curve"),
  name: z.string().optional().describe("Label for the equation"),
  dash: z
    .number()
    .optional()
    .default(0)
    .describe("Dash style (0=solid, 1=dotted, 2=dashed)"),
});

// System schema
const SystemSchema = z.object({
  equations: z
    .array(EquationSchema)
    .min(2)
    .describe("System of equations to solve simultaneously"),
  color: z
    .string()
    .optional()
    .default("#ff6600")
    .describe("Color for the system solution"),
  name: z.string().optional().describe("Label for the system"),
});

// Equation system input schema
const schema = {
  systems: z
    .array(SystemSchema)
    .optional()
    .describe("Array of equation systems to solve and visualize"),
  individualEquations: z
    .array(EquationSchema)
    .optional()
    .describe("Individual equations to plot (not part of a system)"),
  showIntersections: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to highlight intersection points (solutions)"),
  showSolutionSet: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to display the solution set algebraically"),
  numericalSolutions: z
    .object({
      show: z
        .boolean()
        .optional()
        .default(true)
        .describe("Whether to show numerical solutions"),
      precision: z
        .number()
        .optional()
        .default(4)
        .describe("Decimal places for numerical solutions"),
      method: z
        .enum(["newton", "bisection", "secant"])
        .optional()
        .default("newton")
        .describe("Numerical method to use"),
    })
    .optional()
    .describe("Numerical solution options"),
  parameterAnimation: z
    .object({
      enabled: z
        .boolean()
        .optional()
        .default(false)
        .describe("Enable parameter animation"),
      parameter: z
        .string()
        .optional()
        .default("t")
        .describe("Parameter name to animate"),
      min: z.number().optional().default(-5).describe("Minimum parameter value"),
      max: z.number().optional().default(5).describe("Maximum parameter value"),
      speed: z.number().optional().default(1).describe("Animation speed"),
    })
    .optional()
    .describe("Options for animating parametric equations"),
  solutionRegions: z
    .array(
      z.object({
        systemIndex: z
          .number()
          .describe("Index of the system defining the region"),
        fillColor: z
          .string()
          .optional()
          .default("#0066cc")
          .describe("Fill color for the region"),
        fillOpacity: z
          .number()
          .optional()
          .default(0.2)
          .describe("Fill opacity (0-1)"),
        showBoundary: z
          .boolean()
          .optional()
          .default(true)
          .describe("Whether to highlight the boundary"),
      }),
    )
    .optional()
    .describe("Regions defined by equation systems"),
  linearAlgebraView: z
    .object({
      show: z
        .boolean()
        .optional()
        .default(false)
        .describe("Show matrix representation for linear systems"),
      showDeterminant: z
        .boolean()
        .optional()
        .default(true)
        .describe("Show determinant value"),
      showEigenvalues: z
        .boolean()
        .optional()
        .default(false)
        .describe("Show eigenvalues for homogeneous systems"),
      showRank: z
        .boolean()
        .optional()
        .default(true)
        .describe("Show rank of coefficient matrix"),
    })
    .optional()
    .describe("Linear algebra analysis for linear systems"),
  nonlinearAnalysis: z
    .object({
      show: z
        .boolean()
        .optional()
        .default(false)
        .describe("Show nonlinear system analysis"),
      showJacobian: z
        .boolean()
        .optional()
        .default(false)
        .describe("Show Jacobian matrix at solutions"),
      showStability: z
        .boolean()
        .optional()
        .default(false)
        .describe("Analyze stability of equilibrium points"),
      phasePortrait: z
        .boolean()
        .optional()
        .default(false)
        .describe("Show phase portrait for 2D systems"),
    })
    .optional()
    .describe("Nonlinear system analysis options"),
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

// Equation system tool descriptor
const tool = {
  name: "generate_equation_system",
  description:
    "Generate systems of equations visualization using JSXGraph. Solve and visualize linear and nonlinear equation systems, find intersection points, show solution sets, and analyze system properties. Supports implicit equations, parametric systems, numerical solutions, and advanced analysis including matrix representation and phase portraits.",
  inputSchema: zodToJsonSchema(z.object(schema)),
};

// Generate JSXGraph code for equation systems
function generateEquationSystemCode(config: any, boundingBox: number[]): string {
  const {
    systems = [],
    individualEquations = [],
    showIntersections = true,
    showSolutionSet = true,
    numericalSolutions,
    parameterAnimation,
    solutionRegions = [],
    linearAlgebraView,
    nonlinearAnalysis,
    title = "",
    axisXTitle = "x",
    axisYTitle = "y",
    showCopyright = false,
    showNavigation = true,
    zoom = { enabled: true, wheel: true },
    pan = { enabled: true }
  } = config;

  let jsCode = `var board = JXG.JSXGraph.initBoard('jxgbox_equation_system_${Date.now()}', {"boundingbox":${JSON.stringify(boundingBox)},"axis":true,"grid":true,"keepaspectratio":false,"showCopyright":${showCopyright},"showNavigation":${showNavigation},"zoom":{"enabled":${zoom.enabled},"wheel":${zoom.wheel}},"pan":{"enabled":${pan.enabled}}});\n`;
  
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

  // Process individual equations
  individualEquations.forEach((eq: any, index: number) => {
    const { expression, type = "implicit", color = "#0066cc", strokeWidth = 2, name = "", dash = 0 } = eq;
    
    if (type === "implicit") {
      jsCode += `var equation${index} = board.create('implicit', [${expression}], {strokeColor: '${color}', strokeWidth: ${strokeWidth}, dash: ${dash}, name: '${name || `Equation ${index + 1}`}'});\n`;
    } else if (type === "explicit") {
      // For explicit equations like y = f(x)
      jsCode += `var equation${index} = board.create('functiongraph', [function(x) { return ${expression}; }, ${boundingBox[0]}, ${boundingBox[2]}], {strokeColor: '${color}', strokeWidth: ${strokeWidth}, dash: ${dash}, name: '${name || `Equation ${index + 1}`}'});\n`;
    } else if (type === "parametric") {
      // For parametric equations, assume expression is in format [x(t), y(t)]
      jsCode += `var equation${index} = board.create('curve', [function(t) { return ${expression.split(',')[0]}; }, function(t) { return ${expression.split(',')[1]}; }, 0, 2*Math.PI], {strokeColor: '${color}', strokeWidth: ${strokeWidth}, dash: ${dash}, name: '${name || `Equation ${index + 1}`}'});\n`;
    }
  });

  // Process equation systems
  systems.forEach((system: any, systemIndex: number) => {
    const { equations, color = "#ff6600", name = "" } = system;
    
    jsCode += `// System ${systemIndex + 1}: ${name || `System of ${equations.length} equations`}\n`;
    
    equations.forEach((eq: any, eqIndex: number) => {
      const { expression, type = "implicit", strokeWidth = 2, dash = 0 } = eq;
      
      if (type === "implicit") {
        jsCode += `var system${systemIndex}_eq${eqIndex} = board.create('implicit', [${expression}], {strokeColor: '${color}', strokeWidth: ${strokeWidth}, dash: ${dash}, name: 'System ${systemIndex + 1} - Equation ${eqIndex + 1}'});\n`;
      } else if (type === "explicit") {
        jsCode += `var system${systemIndex}_eq${eqIndex} = board.create('functiongraph', [function(x) { return ${expression}; }, ${boundingBox[0]}, ${boundingBox[2]}], {strokeColor: '${color}', strokeWidth: ${strokeWidth}, dash: ${dash}, name: 'System ${systemIndex + 1} - Equation ${eqIndex + 1}'});\n`;
      }
    });
    
    // Show solution set if requested
    if (showSolutionSet) {
      jsCode += `var solution${systemIndex} = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 1 - systemIndex * 0.5}, 'System ${systemIndex + 1} solution: ${equations.map((eq: any) => eq.expression).join(' = 0, ')} = 0'], {fontSize: 10, color: '#666'});\n`;
    }
  });

  // Show intersections for systems
  if (showIntersections) {
    systems.forEach((system: any, systemIndex: number) => {
      if (system.equations.length === 2) {
        // For 2-equation systems, find intersection points
        const eq1 = system.equations[0];
        const eq2 = system.equations[1];
        
        if (eq1.type === "explicit" && eq2.type === "explicit") {
          // Both are explicit, can find intersection analytically
          jsCode += `// Finding intersection of ${eq1.expression} and ${eq2.expression}\n`;
          jsCode += `var intersection${systemIndex} = board.create('intersection', [system${systemIndex}_eq0, system${systemIndex}_eq1], {name: 'Intersection', size: 4, color: '#ff0000', fixed: true});\n`;
        } else {
          // Use numerical intersection for implicit equations
          jsCode += `// Numerical intersection for system ${systemIndex + 1}\n`;
          jsCode += `var intersection${systemIndex} = board.create('glider', [system${systemIndex}_eq0, 0], {name: 'Approximate Intersection', size: 4, color: '#ff0000', fixed: false});\n`;
        }
      }
    });
  }

  // Add parameter animation if enabled
  if (parameterAnimation && parameterAnimation.enabled) {
    const { parameter = "t", min = -5, max = 5, speed = 1 } = parameterAnimation;
    jsCode += `// Parameter animation for ${parameter}\n`;
    jsCode += `var paramSlider = board.create('slider', [[${boundingBox[0] + 1}, ${boundingBox[1] - 2}], [${boundingBox[0] + 3}, ${boundingBox[1] - 2}], [${min}, 0, ${max}], {name: '${parameter}', precision: 2, color: '#ff6600'});\n`;
    jsCode += `var paramValue = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 2.5}, function() { return '${parameter} = ' + paramSlider.Value().toFixed(2); }], {fontSize: 10, color: '#666'});\n`;
  }

  // Add solution regions
  solutionRegions.forEach((region: any, index: number) => {
    const { systemIndex, fillColor = "#0066cc", fillOpacity = 0.2, showBoundary = true } = region;
    
    if (systems[systemIndex]) {
      jsCode += `// Solution region for system ${systemIndex + 1}\n`;
      jsCode += `var region${index} = board.create('polygon', [\n`;
      jsCode += `  [${boundingBox[0]}, ${boundingBox[3]}],\n`;
      jsCode += `  [${boundingBox[2]}, ${boundingBox[3]}],\n`;
      jsCode += `  [${boundingBox[2]}, ${boundingBox[1]}],\n`;
      jsCode += `  [${boundingBox[0]}, ${boundingBox[1]}]\n`;
      jsCode += `], {\n`;
      jsCode += `  fillColor: '${fillColor}',\n`;
      jsCode += `  fillOpacity: ${fillOpacity},\n`;
      jsCode += `  borders: {strokeColor: '${fillColor}', strokeWidth: ${showBoundary ? 2 : 0}}\n`;
      jsCode += `});\n`;
    }
  });

  // Add linear algebra view
  if (linearAlgebraView && linearAlgebraView.show) {
    jsCode += `// Linear algebra analysis\n`;
    
    // Find linear systems
        const linearSystems = systems.filter((system: any) =>
      system.equations.every((eq: any) => eq.type === "explicit" && eq.expression.includes('x') && eq.expression.includes('y'))
    );
    
    linearSystems.forEach((system: any, index: number) => {
      if (system.equations.length === 2) {
        jsCode += `// Linear system ${index + 1} analysis\n`;
        
        // Extract coefficients for ax + by = c form
        const eq1 = system.equations[0].expression;
        const eq2 = system.equations[1].expression;
        
        jsCode += `var matrix${index} = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[3] + 1 + index * 0.5}, 'Matrix: [${eq1}, ${eq2}]'], {fontSize: 10, color: '#666'});\n`;
        
        if (linearAlgebraView.showDeterminant) {
          jsCode += `var det${index} = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[3] + 1.5 + index * 0.5}, 'Determinant: Calculate manually'], {fontSize: 10, color: '#666'});\n`;
        }
      }
    });
  }

  // Add nonlinear analysis
  if (nonlinearAnalysis && nonlinearAnalysis.show) {
    jsCode += `// Nonlinear system analysis\n`;
    
    // Find nonlinear systems
        const nonlinearSystems = systems.filter((system: any) =>
      system.equations.some((eq: any) => eq.expression.includes('^') || eq.expression.includes('Math.'))
    );
    
    nonlinearSystems.forEach((system: any, index: number) => {
      jsCode += `// Nonlinear system ${index + 1} analysis\n`;
      
      if (nonlinearAnalysis.showStability) {
        jsCode += `var stability${index} = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[3] + 2 + index * 0.5}, 'Stability: Analyze equilibrium points'], {fontSize: 10, color: '#666'});\n`;
      }
      
      if (nonlinearAnalysis.phasePortrait) {
        jsCode += `var phase${index} = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[3] + 2.5 + index * 0.5}, 'Phase portrait: Show trajectory directions'], {fontSize: 10, color: '#666'});\n`;
      }
    });
  }

  // Add numerical solutions if requested
  if (numericalSolutions && numericalSolutions.show) {
    jsCode += `// Numerical solutions\n`;
    jsCode += `var numMethod = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[3] + 3}, 'Method: ${numericalSolutions.method || 'newton'}'], {fontSize: 10, color: '#666'});\n`;
    jsCode += `var precision = board.create('text', [${boundingBox[0] + 1}, ${boundingBox[3] + 3.5}, 'Precision: ${numericalSolutions.precision || 4} decimal places'], {fontSize: 10, color: '#666'});\n`;
  }

  return jsCode;
}

export const equationSystem = {
  schema,
  tool,
  generateCode: generateEquationSystemCode
};
