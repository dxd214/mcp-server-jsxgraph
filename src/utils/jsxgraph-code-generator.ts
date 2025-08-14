/**
 * JSXGraph JavaScript Code Generator
 * Generates JSXGraph JavaScript code that can be embedded in HTML
 */

import { generateStepControllerCode } from "./jsxgraph-step-controller";

/**
 * Replace __GRAPH_ID__ placeholder with actual container ID
 */
export function replaceGraphIdPlaceholder(
  code: string,
  actualId: string,
): string {
  return code.replace(/__GRAPH_ID__/g, actualId);
}

export interface JSXGraphConfig {
  type:
    | "function"
    | "parametric"
    | "geometry"
    | "vector-field"
    | "linear-system"
    | "function-transformation"
    | "quadratic-analysis"
    | "exponential-logarithm"
    | "rational-function"
    | "equation-system"
    | "conic-section"
    | "number-line"
    | "function-properties";
  width?: number;
  height?: number;
  boundingBox?: number[];
  config: any;
  containerId?: string; // Unique ID for container element, defaults to 'jxgbox'
  pure?: boolean; // Whether to generate pure code snippet without wrapper
  useGraphIdPlaceholder?: boolean; // Whether to use __GRAPH_ID__ placeholder
}

export interface PolynomialStepConfig {
  polynomial: {
    expression: string;
    expandedForm?: string;
    zeros: Array<{
      x: number;
      multiplicity: number;
      behavior: "crosses" | "touches";
    }>;
    yIntercept: number;
    criticalPoints?: Array<{
      x: number;
      y: number;
      type: "maximum" | "minimum" | "inflection";
    }>;
    degree: number;
    leadingCoefficient: number;
  };
  steps?: any[];
  title?: string;
  width?: number;
  height?: number;
  boundingBox?: [number, number, number, number];
  showControls?: boolean;
  autoPlay?: boolean;
  playSpeed?: number;
  containerId?: string; // Unique ID for container element
  pure?: boolean; // Whether to generate pure code snippet
  useGraphIdPlaceholder?: boolean; // Whether to use __GRAPH_ID__ placeholder
}

export function generatePolynomialStepsCode(
  config: PolynomialStepConfig,
): string {
  const {
    polynomial,
    containerId = "jxgbox",
    pure = false,
    useGraphIdPlaceholder = false,
  } = config;
  const expandedForm = polynomial.expandedForm || polynomial.expression;

  // Use placeholder if requested, otherwise use actual containerId
  const graphId = useGraphIdPlaceholder ? "__GRAPH_ID__" : containerId;

  // Generate default steps if not provided
  const steps = config.steps || generateDefaultSteps(polynomial);

  // Generate step controller code (only if not pure)
  const stepControllerCode = pure
    ? ""
    : generateStepControllerCode({
        enableSteps: true,
        autoPlay: config.autoPlay || false,
        playSpeed: config.playSpeed || 3000,
        showControls: config.showControls !== false,
        animationDuration: 800,
        animationEasing: "ease-in-out",
      });

  // Generate core code function
  function generateCoreCode(config: any): string {
    return `// Configuration
const config = ${JSON.stringify(
    {
      title: config.title || "Polynomial Function Analysis",
      polynomial: polynomial,
      boundingBox: config.boundingBox || [-6, 500, 6, -100],
      showControls: config.showControls !== false,
      autoPlay: config.autoPlay || false,
      playSpeed: config.playSpeed || 3000,
      containerId: graphId,
    },
    null,
    2,
  )};

// Initialize JSXGraph board
const board = JXG.JSXGraph.initBoard('${graphId}', {
  boundingbox: config.boundingBox,
  keepaspectratio: false,
  axis: true,
  grid: true,
  showCopyright: false,
  showNavigation: true,
  pan: { enabled: true, needShift: false },
  zoom: { enabled: true, wheel: true, needShift: false }
});

// Steps data
const steps = ${JSON.stringify(steps, null, 2)};

// Create initial visualization (Step 5 - complete curve)
const polynomial = config.polynomial;
const expandedForm = "${expandedForm}";

// Draw the complete polynomial curve
const mainCurve = board.create('functiongraph', [
  function(x) { return ${expandedForm
    .replace(/Math\.pow/g, "Math.pow")
    .replace(/x\*x\*x\*x/g, "Math.pow(x,4)")
    .replace(/x\*x\*x/g, "Math.pow(x,3)")
    .replace(/x\*x/g, "Math.pow(x,2)")}; },
  -6, 6
], {
  strokeColor: '#cc0000',
  strokeWidth: 3
});

// Add x-intercepts (zeros)
${
  steps[0]?.elements
    ? `polynomial.zeros.forEach((zero, index) => {
  board.create('point', [zero.x, 0], {
    name: 'x=' + zero.x,
    size: 6,
    color: zero.behavior === 'crosses' ? '#0066cc' : '#ff9900',
    fixed: true
  });
});`
    : ""
}

// Add y-intercept
board.create('point', [0, polynomial.yIntercept], {
  name: 'y=' + polynomial.yIntercept,
  size: 6,
  color: '#009900',
  fixed: true
});

// Add critical points if available
${
  polynomial.criticalPoints
    ? `polynomial.criticalPoints.forEach((point, index) => {
  board.create('point', [point.x, point.y], {
    name: '(' + point.x + ', ' + point.y + ')',
    size: 7,
    fillColor: '#cc0066',
    strokeColor: '#cc0066',
    fixed: true
  });
});`
    : ""
}

// Add function label
board.create('text', [0, -80], {
  text: 'f(x) = ' + polynomial.expression,
  fontSize: 18,
  cssStyle: 'color: #cc0000; font-weight: bold'
});`;
  }

  // Generate core code (pure version)
  const coreCode = generateCoreCode(config);

  if (config.pure) {
    return coreCode;
  }

  // Otherwise return wrapped complete code: includes step control and common element creation (with multi-format support for line)
  const jsCode = `
// Polynomial Function Step-by-Step Analysis
// Generated by MCP Server Chart with Animation Support
// Container ID: ${graphId}

${stepControllerCode}

(function() {
  // Initialize Board
  ${coreCode}

  // Universal element creator: supports point/line/curve/arrow/text
  function createElement(elementConfig) {
    if (!elementConfig || !elementConfig.type) return null;
    var element = null;
    var style = elementConfig.style || {};

    switch (elementConfig.type) {
      case 'point': {
        var p = elementConfig.properties || {};
        var coords = p.coords || p.point || [0, 0];
        element = board.create('point', coords, {
          size: style.size || 4,
          fillColor: style.fillColor || style.color || '#0066cc',
          strokeColor: style.color || '#0066cc',
          fillOpacity: style.fillOpacity != null ? style.fillOpacity : 1,
          strokeOpacity: style.strokeOpacity != null ? style.strokeOpacity : 1,
          visible: style.visible !== false,
          name: p.name || ''
        });
        break;
      }
      case 'line': {
        var ls = {
          strokeColor: style.color || '#333333',
          strokeWidth: style.strokeWidth || 2,
          strokeOpacity: style.strokeOpacity != null ? style.strokeOpacity : 1,
          dash: style.dash || 0,
          visible: style.visible !== false
        };
        var lp = elementConfig.properties || {};
        // Supports three formats: point1/point2, points array, equation coefficients
        if (lp.point1 && lp.point2) {
          element = board.create('line', [lp.point1, lp.point2], ls);
        } else if (lp.points) {
          element = board.create('line', lp.points, ls);
        } else if (lp.equation) {
          var eq = lp.equation; // { a, b, c } => ax + by + c = 0
          element = board.create('line', [eq.a, eq.b, eq.c], ls);
        }
        break;
      }
      case 'curve': {
        var cs = {
          strokeColor: style.color || '#0066cc',
          strokeWidth: style.strokeWidth || 2,
          strokeOpacity: style.strokeOpacity != null ? style.strokeOpacity : 1,
          dash: style.dash || 0,
          visible: style.visible !== false
        };
        var cp = elementConfig.properties || {};
        if (cp.expression) {
          var expr = String(cp.expression)
            .replace(/Math\.pow/g, 'Math.pow')
            .replace(/Math\.sin/g, 'Math.sin')
            .replace(/Math\.cos/g, 'Math.cos')
            .replace(/Math\.sqrt/g, 'Math.sqrt')
            .replace(/Math\.exp/g, 'Math.exp')
            .replace(/Math\.log/g, 'Math.log');
          element = board.create('functiongraph', [
            new Function('x', 'return ' + expr),
            cp.domain ? cp.domain[0] : -10,
            cp.domain ? cp.domain[1] : 10
          ], cs);
        }
        break;
      }
      case 'arrow': {
        var ap = elementConfig.properties || {};
        element = board.create('arrow', ap.points || ap.point || [[0, 0], [1, 1]], {
          strokeColor: style.color || '#666666',
          strokeWidth: style.strokeWidth || 2,
          strokeOpacity: style.strokeOpacity != null ? style.strokeOpacity : 1,
          lastArrow: true,
          visible: style.visible !== false
        });
        break;
      }
      case 'text': {
        var tp = elementConfig.properties || {};
        element = board.create('text', [
          (tp.position && tp.position[0]) || 0,
          (tp.position && tp.position[1]) || 0,
          tp.text || ''
        ], {
          fontSize: style.fontSize || 14,
          cssStyle: 'color: ' + (style.color || '#333333') + '; font-weight: ' + (style.fontWeight || 'normal'),
          opacity: style.opacity != null ? style.opacity : 1,
          visible: style.visible !== false
        });
        break;
      }
    }
    return element;
  }

  // Register steps: if steps are provided, render them step by step
  if (typeof StepController !== 'undefined' && Array.isArray(steps)) {
    try {
      StepController.init(board);
      steps.forEach(function(stepData) {
        StepController.registerStep(function(boardInstance) {
          var elements = [];
          if (stepData.elements) {
            for (var i = 0; i < stepData.elements.length; i++) {
              var el = createElement(stepData.elements[i]);
              if (el) elements.push(el);
            }
          }
          if (stepData.annotations) {
            for (var j = 0; j < stepData.annotations.length; j++) {
              var ann = stepData.annotations[j];
              var s = ann.style || {};
              var t = board.create('text', [ann.position[0], ann.position[1], ann.text], {
                fontSize: s.fontSize || 14,
                cssStyle: 'color: ' + (s.color || '#333333') + '; font-weight: ' + (s.fontWeight || 'normal'),
                opacity: 1
              });
              elements.push(t);
            }
          }
          board.update();
          return elements;
        });
      });
    } catch (e) {
      console && console.warn && console.warn('StepController initialization failed:', e);
    }
  }

  // DOM ready handling (if needed)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {});
  }
})();
`;

  return jsCode;
}

// Generate default steps based on polynomial properties
function generateDefaultSteps(polynomial: any): any[] {
  const steps = [];
  const expandedForm = polynomial.expandedForm || polynomial.expression;

  // Step 1: End behavior
  steps.push({
    id: "step1",
    title: "Step 1: Determine end behavior",
    description: `Leading term ${polynomial.leadingCoefficient}x^${polynomial.degree}, ${polynomial.degree % 2 === 0 ? "even" : "odd"} degree, coefficient ${polynomial.leadingCoefficient < 0 ? "negative" : "positive"}`,
    elements: [
      {
        type: "arrow",
        id: "leftEndBehavior",
        properties: {
          points: [
            [-5.5, 400],
            [-5.5, 200],
          ],
        },
        style: { color: "#ff6600", strokeWidth: 3 },
      },
      {
        type: "arrow",
        id: "rightEndBehavior",
        properties: {
          points: [
            [5.5, 400],
            [5.5, 200],
          ],
        },
        style: { color: "#ff6600", strokeWidth: 3 },
      },
      {
        type: "text",
        id: "leftEndText",
        properties: {
          position: [-5.5, 420],
          text: `x→-∞, f(x)→${polynomial.leadingCoefficient < 0 && polynomial.degree % 2 === 0 ? "-∞" : "+∞"}`,
        },
        style: { color: "#ff6600", fontSize: 14 },
      },
      {
        type: "text",
        id: "rightEndText",
        properties: {
          position: [5.5, 420],
          text: `x→+∞, f(x)→${polynomial.leadingCoefficient < 0 ? "-∞" : "+∞"}`,
        },
        style: { color: "#ff6600", fontSize: 14 },
      },
    ],
    annotations: [
      {
        text: `Leading term: ${polynomial.leadingCoefficient}x^${polynomial.degree}`,
        position: [0, 470],
        style: { fontSize: 16, color: "#333", fontWeight: "bold" },
      },
    ],
  });

  // Step 2: Intercepts
  const interceptElements = [];

  // X-intercepts
  polynomial.zeros.forEach((zero: any, index: number) => {
    interceptElements.push({
      type: "point",
      id: `zero${index}`,
      properties: { coords: [zero.x, 0], name: `x=${zero.x}` },
      style: {
        color: zero.behavior === "crosses" ? "#0066cc" : "#ff9900",
        size: 6,
      },
    });
  });

  // Y-intercept
  interceptElements.push({
    type: "point",
    id: "yIntercept",
    properties: {
      coords: [0, polynomial.yIntercept],
      name: `y=${polynomial.yIntercept}`,
    },
    style: { color: "#009900", size: 6 },
  });

  steps.push({
    id: "step2",
    title: "Step 2: Find intercepts",
    description: "Mark x-axis and y-axis intercepts",
    elements: interceptElements,
  });

  // Step 3: Multiplicity behavior
  const behaviorElements: any[] = [...interceptElements];
  const behaviorCurves: any[] = [];

  // Add behavior curves for each zero
  polynomial.zeros.forEach((zero: any, index: number) => {
    if (zero.behavior === "touches") {
      // Add parabola-like curve for touching behavior
      behaviorCurves.push({
        type: "curve",
        id: `behaviorCurve${index}`,
        properties: {
          expression: `30*Math.pow((x-${zero.x}), 2)`,
          domain: [zero.x - 0.5, zero.x + 0.5],
        },
        style: { color: "#ff9900", strokeWidth: 2, dash: 2 },
      });
    }
  });

  const pointers = polynomial.zeros.map((zero: any) => ({
    from: [zero.x, -70],
    to: [zero.x, -10],
    label:
      zero.behavior === "crosses"
        ? "Crosses (Multiplicity " + zero.multiplicity + ")"
        : "Touches (Multiplicity " + zero.multiplicity + ")",
    style: { color: zero.behavior === "crosses" ? "#0066cc" : "#ff9900" },
  }));

  steps.push({
    id: "step3",
    title: "Step 3: Determine zero multiplicity and behavior",
    description:
      "Zero multiplicity determines function behavior at that point: odd multiplicity crosses the x-axis, even multiplicity touches",
    elements: [...behaviorElements, ...behaviorCurves],
    pointers: pointers,
  });

  // Step 4: Plot additional points
  const additionalPointsElements: any[] = [...interceptElements];
  const criticalPointElements: any[] = [];
  if (polynomial.criticalPoints && polynomial.criticalPoints.length > 0) {
    polynomial.criticalPoints.forEach((point: any, index: number) => {
      criticalPointElements.push({
        type: "point",
        id: `critical${index}`,
        properties: {
          coords: [point.x, point.y],
          name: `(${point.x}, ${point.y})`,
        },
        style: { color: "#cc0066", size: 7, fillColor: "#cc0066" },
      });
    });
  }

  steps.push({
    id: "step4",
    title: "Step 4: Plot additional critical points",
    description: "Calculate and mark other important points on the function to help determine curve shape",
    elements: [...additionalPointsElements, ...criticalPointElements],
    pointers: polynomial.criticalPoints
      ? polynomial.criticalPoints.map((point: any) => ({
          from: [point.x, point.y > 0 ? point.y - 50 : point.y + 50],
          to: [point.x, point.y > 0 ? point.y - 10 : point.y + 10],
          label: point.type === "maximum" ? "Peak" : point.type,
          style: { color: "#cc0066", strokeWidth: 2, dash: 1 },
        }))
      : [],
  });

  // Step 5: Sketch the complete curve
  const curveElements = [
    {
      type: "curve",
      id: "mainCurve",
      properties: {
        expression: expandedForm
          .replace(/Math\.pow/g, "Math.pow")
          .replace(/x\*x\*x\*x/g, "Math.pow(x,4)")
          .replace(/x\*x\*x/g, "Math.pow(x,3)")
          .replace(/x\*x/g, "Math.pow(x,2)"),
        domain: [-6, 6],
      },
      style: { color: "#cc0000", strokeWidth: 3 },
    },
    ...additionalPointsElements,
    ...criticalPointElements,
  ];

  steps.push({
    id: "step5",
    title: "Step 5: Sketch the complete function curve",
    description: "Connect all points, draw smooth curve based on end behavior and zero multiplicity",
    elements: curveElements,
    annotations: [
      {
        text: `f(x) = ${polynomial.expression}`,
        position: [0, -80],
        style: { fontSize: 18, color: "#cc0000", fontWeight: "bold" },
      },
    ],
  });

  // Step 6: Verification
  steps.push({
    id: "step6",
    title: "Step 6: Verification",
    description: "Check all features: ✓ End behavior ✓ x-axis intercepts and multiplicity ✓ y-axis intercept ✓ Critical points",
    elements: [
      ...curveElements,
      // Add grid lines for key points
      ...polynomial.zeros.map(
        (zero: any, index: number) =>
          ({
            type: "line",
            id: `gridLine${index}`,
            properties: {
              points: [
                [zero.x, -100],
                [zero.x, 500],
              ],
            },
            style: { color: "#e0e0e0", strokeWidth: 1, dash: 1 },
          }) as any,
      ),
    ],
    annotations: [
      {
        text: "✓ End behavior correct",
        position: [-5, 470],
        style: { fontSize: 12, color: "#008800" },
      },
      {
        text: `✓ ${polynomial.zeros.length} zeros`,
        position: [-5, 440],
        style: { fontSize: 12, color: "#008800" },
      },
      {
        text: `✓ Y-axis intercept: ${polynomial.yIntercept}`,
        position: [-5, 410],
        style: { fontSize: 12, color: "#008800" },
      },
    ],
  });

  return steps;
}

// Placeholder functions for tools that only export schema
function generateVectorFieldCode(config: any, boundingBox: number[], graphId: string): string {
  return `// Vector field visualization code would go here`;
}

function generateLinearSystemCode(config: any, boundingBox: number[], graphId: string): string {
  return `// Linear system visualization code would go here`;
}

function generateFunctionTransformationCode(config: any, boundingBox: number[], graphId: string): string {
  return `// Function transformation visualization code would go here`;
}

function generateQuadraticAnalysisCode(config: any, boundingBox: number[], graphId: string): string {
  return `// Quadratic analysis visualization code would go here`;
}

function generateExponentialLogarithmCode(config: any, boundingBox: number[], graphId: string): string {
  return `// Exponential logarithm visualization code would go here`;
}

function generateRationalFunctionCode(config: any, boundingBox: number[], graphId: string): string {
  return `// Rational function visualization code would go here`;
}

function generateEquationSystemCode(config: any, boundingBox: number[], graphId: string): string {
  return `// Equation system visualization code would go here`;
}

function generateConicSectionCode(config: any, boundingBox: number[], graphId: string): string {
  return `// Conic section visualization code would go here`;
}

function generateNumberLineCode(config: any, boundingBox: number[], graphId: string): string {
  return `// Number line visualization code would go here`;
}

function generateFunctionPropertiesCode(config: any, boundingBox: number[], graphId: string): string {
  return `// Function properties visualization code would go here`;
}

/**
 * Generate JSXGraph JavaScript code for any chart type
 */
export function generateJSXGraphCode(config: JSXGraphConfig): string {
  const {
    type,
    width = 800,
    height = 600,
    boundingBox = [-10, 10, 10, -10],
    containerId = "jxgbox",
    pure = false,
    useGraphIdPlaceholder = false,
  } = config;

  // Use placeholder if requested, otherwise use actual containerId
  const graphId = useGraphIdPlaceholder ? "__GRAPH_ID__" : containerId;

  let jsCode = "";

  switch (type) {
    case "function":
      jsCode = generateFunctionGraphCode(config.config, boundingBox, graphId);
      break;
    case "parametric":
      jsCode = generateParametricCurveCode(config.config, boundingBox, graphId);
      break;
    case "geometry":
      jsCode = generateGeometryDiagramCode(config.config, boundingBox, graphId);
      break;
    case "vector-field":
      jsCode = generateVectorFieldCode(config.config, boundingBox, graphId);
      break;
    case "linear-system":
      jsCode = generateLinearSystemCode(config.config, boundingBox, graphId);
      break;
    case "function-transformation":
      jsCode = generateFunctionTransformationCode(
        config.config,
        boundingBox,
        graphId,
      );
      break;
    case "quadratic-analysis":
      jsCode = generateQuadraticAnalysisCode(
        config.config,
        boundingBox,
        graphId,
      );
      break;
    case "exponential-logarithm":
      jsCode = generateExponentialLogarithmCode(
        config.config,
        boundingBox,
        graphId,
      );
      break;
    case "rational-function":
      jsCode = generateRationalFunctionCode(
        config.config,
        boundingBox,
        graphId,
      );
      break;
    case "equation-system":
      jsCode = generateEquationSystemCode(config.config, boundingBox, graphId);
      break;
    case "conic-section":
      jsCode = generateConicSectionCode(config.config, boundingBox, graphId);
      break;
    case "number-line":
      jsCode = generateNumberLineCode(config.config, boundingBox, graphId);
      break;
    case "function-properties":
      jsCode = generateFunctionPropertiesCode(config.config, boundingBox, graphId);
      break;
    default:
      jsCode = generateFunctionGraphCode(config.config, boundingBox, graphId);
  }

  // If pure code snippet is needed, return core code directly
  if (pure) {
    return jsCode.trim();
  }

  // Otherwise return code with complete wrapper
  return `
// JSXGraph Mathematical Visualization
// Generated by MCP Server Chart
// Container ID: ${graphId}

(function() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChart);
  } else {
    initializeChart();
  }
  
  function initializeChart() {
    // Make sure JSXGraph is loaded
    if (typeof JXG === 'undefined') {
      console.error('JSXGraph library not loaded. Please include JSXGraph script and CSS files.');
      return;
    }
    
    // Make sure the container exists
    const container = document.getElementById('${graphId}');
    if (!container) {
      console.error('Container element with id "${graphId}" not found.');
      return;
    }
    
    // Set container dimensions - width adaptive, height fixed at 400px
    container.style.width = '100%';
    container.style.height = '400px';
    
    ${jsCode}
    
    // Make board accessible globally if needed
    // Use unique board reference for multiple charts
    if (typeof board !== 'undefined') {
      window.jsxBoard_${graphId} = board;
    }
  }
})();
`;
}

function generateFunctionGraphCode(
  config: any,
  boundingBox: number[],
  containerId = "jxgbox",
): string {
  const boardConfig = {
    boundingbox: boundingBox,
    axis: config.style?.axis !== false,
    grid: config.style?.grid !== false,
    keepaspectratio: config.keepAspectRatio || false,
    showCopyright: config.showCopyright || false,
    showNavigation: config.showNavigation !== false,
    zoom: config.zoom || { enabled: true, wheel: true },
    pan: config.pan || { enabled: true },
  };

  let code = `
    var board = JXG.JSXGraph.initBoard('${containerId}', ${JSON.stringify(boardConfig)});
    
    // Add title if provided
    ${config.title ? `board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 0.5}, '${config.title}'], {fontSize: 18, fontWeight: 'bold'});` : ""}
    
    // Add axis labels
    ${config.axisXTitle ? `board.create('text', [${boundingBox[2] - 1}, 0.5, '${config.axisXTitle}'], {fontSize: 14});` : ""}
    ${config.axisYTitle ? `board.create('text', [0.5, ${boundingBox[1] - 1}, '${config.axisYTitle}'], {fontSize: 14});` : ""}
  `;

  // Add functions
  if (config.functions) {
    config.functions.forEach((func: any, index: number) => {
      const domain = func.domain || [boundingBox[0], boundingBox[2]];
      code += `
        var f${index} = board.create('functiongraph', [
          function(x) { return ${func.expression}; },
          ${domain[0]}, ${domain[1]}
        ], {
          strokeColor: '${func.color || "#0066cc"}',
          strokeWidth: ${func.strokeWidth || 2},
          dash: ${func.dash || 0},
          name: '${func.name || ""}'
        });
      `;

      // Add derivative if requested for first function
      if (index === 0 && config.showDerivative) {
        code += `
          board.create('functiongraph', [
            JXG.Math.Numerics.D(f0.Y),
            ${domain[0]}, ${domain[1]}
          ], {
            strokeColor: '#ff6600',
            strokeWidth: 2,
            dash: 2,
            name: "f'(x)"
          });
        `;
      }

      // Add integral area if requested for first function
      if (index === 0 && config.showIntegral && config.integralBounds) {
        const [a, b] = config.integralBounds;
        code += `
          board.create('integral', [[${a}, ${b}], f0], {
            fillColor: '#0066cc',
            fillOpacity: 0.3,
            curveLeft: { visible: false },
            curveRight: { visible: false }
          });
        `;
      }

      // Add tangent line if requested for first function
      if (index === 0 && config.tangentAt !== undefined) {
        code += `
          var tPoint = board.create('glider', [${config.tangentAt}, 0, f0], {
            name: 'P',
            size: 4,
            color: '#ff0000'
          });
          board.create('tangent', [tPoint], {
            strokeColor: '#ff9900',
            strokeWidth: 2,
            dash: 1
          });
        `;
      }
    });
  }

  // Add points
  if (config.points) {
    config.points.forEach((point: any, index: number) => {
      code += `
        board.create('point', [${point.x}, ${point.y}], {
          name: '${point.name || ""}',
          size: ${point.size || 3},
          color: '${point.color || "#ff0000"}',
          fixed: true
        });
      `;
    });
  }

  return code;
}

function generateParametricCurveCode(
  config: any,
  boundingBox: number[],
  containerId = "jxgbox",
): string {
  const boardConfig = {
    boundingbox: boundingBox,
    axis: config.style?.axis !== false,
    grid: config.style?.grid !== false,
    keepaspectratio: config.keepAspectRatio || false,
    showCopyright: config.showCopyright || false,
    showNavigation: config.showNavigation !== false,
    zoom: config.zoom || { enabled: true, wheel: true },
    pan: config.pan || { enabled: true },
  };

  let code = `
    var board = JXG.JSXGraph.initBoard('${containerId}', ${JSON.stringify(boardConfig)});
    
    // Add title if provided
    ${config.title ? `board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 0.5}, '${config.title}'], {fontSize: 18, fontWeight: 'bold'});` : ""}
    
    // Add axis labels
    ${config.axisXTitle ? `board.create('text', [${boundingBox[2] - 1}, 0.5, '${config.axisXTitle}'], {fontSize: 14});` : ""}
    ${config.axisYTitle ? `board.create('text', [0.5, ${boundingBox[1] - 1}, '${config.axisYTitle}'], {fontSize: 14});` : ""}
  `;

  // Add parametric curves
  if (config.curves) {
    config.curves.forEach((curve: any, index: number) => {
      code += `
        var curve${index} = board.create('curve', [
          function(t) { return ${curve.xExpression}; },
          function(t) { return ${curve.yExpression}; },
          ${curve.tMin || 0}, ${curve.tMax || 2 * Math.PI}
        ], {
          strokeColor: '${curve.color || "#0066cc"}',
          strokeWidth: ${curve.strokeWidth || 2},
          dash: ${curve.dash || 0}
        });
      `;

      // Add trace point if requested for first curve
      if (index === 0 && config.showTrace) {
        code += `
          var t = board.create('slider', [[${boundingBox[0] + 1}, ${boundingBox[3] + 1}], [${boundingBox[0] + 4}, ${boundingBox[3] + 1}], [${curve.tMin || 0}, ${curve.tMin || 0}, ${curve.tMax || 2 * Math.PI}]], {
            name: 't',
            snapWidth: 0.01
          });
          
          var tracePoint = board.create('point', [
            function() { var tVal = t.Value(); return ${curve.xExpression.replace(/t/g, "tVal")}; },
            function() { var tVal = t.Value(); return ${curve.yExpression.replace(/t/g, "tVal")}; }
          ], {
            size: 4,
            color: '#ff0000',
            name: 'Trace'
          });
        `;
      }
    });
  }

  // Add points
  if (config.points) {
    config.points.forEach((point: any, index: number) => {
      code += `
        board.create('point', [${point.x}, ${point.y}], {
          name: '${point.name || ""}',
          size: ${point.size || 3},
          color: '${point.color || "#ff0000"}',
          fixed: true
        });
      `;
    });
  }

  return code;
}

function generateGeometryDiagramCode(
  config: any,
  boundingBox: number[],
  containerId = "jxgbox",
): string {
  const boardConfig = {
    boundingbox: boundingBox,
    axis: config.style?.axis !== false,
    grid: config.style?.grid !== false,
    keepaspectratio: config.keepAspectRatio !== false,
    showCopyright: config.showCopyright || false,
    showNavigation: config.showNavigation !== false,
    zoom: config.zoom || { enabled: true, wheel: true },
    pan: config.pan || { enabled: true },
  };

  let code = `
    var board = JXG.JSXGraph.initBoard('${containerId}', ${JSON.stringify(boardConfig)});
    var points = {};
    var lines = {};
    var circles = {};
    
    // Add title if provided
    ${config.title ? `board.create('text', [${boundingBox[0] + 1}, ${boundingBox[1] - 0.5}, '${config.title}'], {fontSize: 18, fontWeight: 'bold'});` : ""}
  `;

  // Create points
  if (config.points) {
    config.points.forEach((point: any) => {
      code += `
        points['${point.name || `p_${point.x}_${point.y}`}'] = board.create('point', [${point.x}, ${point.y}], {
          name: '${point.name || ""}',
          size: ${point.size || 4},
          color: '${point.color || "#0066cc"}',
          fixed: ${point.fixed || false},
          visible: ${point.visible !== false}
        });
      `;
    });
  }

  // Create lines
  if (config.lines) {
    config.lines.forEach((line: any, index: number) => {
      const lineType = line.type || "segment";
      const createMethod =
        lineType === "line" ? "line" : lineType === "ray" ? "arrow" : "segment";
      code += `
        if (points['${line.point1}'] && points['${line.point2}']) {
          lines['${line.name || `${line.point1}-${line.point2}`}'] = board.create('${createMethod}', [
            points['${line.point1}'], points['${line.point2}']
          ], {
            strokeColor: '${line.color || "#333333"}',
            strokeWidth: ${line.strokeWidth || 2},
            dash: ${line.dash || 0},
            name: '${line.name || ""}',
            straightFirst: ${lineType === "line"},
            straightLast: ${lineType === "line" || lineType === "ray"}
          });
        }
      `;
    });
  }

  // Create circles
  if (config.circles) {
    config.circles.forEach((circle: any, index: number) => {
      if (circle.radius !== undefined) {
        code += `
          if (points['${circle.center}']) {
            circles['circle${index}'] = board.create('circle', [
              points['${circle.center}'], ${circle.radius}
            ], {
              strokeColor: '${circle.color || "#0066cc"}',
              fillColor: '${circle.fillColor || "transparent"}',
              fillOpacity: ${circle.fillOpacity || 0},
              strokeWidth: ${circle.strokeWidth || 2}
            });
          }
        `;
      } else if (circle.throughPoint) {
        code += `
          if (points['${circle.center}'] && points['${circle.throughPoint}']) {
            circles['circle${index}'] = board.create('circle', [
              points['${circle.center}'], points['${circle.throughPoint}']
            ], {
              strokeColor: '${circle.color || "#0066cc"}',
              fillColor: '${circle.fillColor || "transparent"}',
              fillOpacity: ${circle.fillOpacity || 0},
              strokeWidth: ${circle.strokeWidth || 2}
            });
          }
        `;
      }
    });
  }

  // Create polygons
  if (config.polygons) {
    config.polygons.forEach((polygon: any, index: number) => {
      const verticesStr = polygon.vertices
        .map((v: string) => `points['${v}']`)
        .join(", ");
      code += `
        var vertices${index} = [${verticesStr}].filter(p => p);
        if (vertices${index}.length >= 3) {
          board.create('polygon', vertices${index}, {
            borders: {
              strokeColor: '${polygon.color || "#0066cc"}',
              strokeWidth: ${polygon.strokeWidth || 2}
            },
            fillColor: '${polygon.fillColor || "#0066cc"}',
            fillOpacity: ${polygon.fillOpacity || 0.3}
          });
        }
      `;
    });
  }

  // Create angles
  if (config.angles) {
    config.angles.forEach((angle: any, index: number) => {
      code += `
        if (points['${angle.point1}'] && points['${angle.vertex}'] && points['${angle.point2}']) {
          board.create('angle', [
            points['${angle.point1}'], points['${angle.vertex}'], points['${angle.point2}']
          ], {
            radius: ${angle.radius || 30} / board.unitX,
            type: '${angle.type || "arc"}',
            color: '${angle.color || "#ff9900"}',
            fillOpacity: ${angle.fillOpacity || 0.3},
            label: {
              visible: ${angle.label !== false}
            }
          });
        }
      `;
    });
  }

  // Add geometric constructions
  if (config.construction) {
    // Perpendiculars
    if (config.construction.perpendicular) {
      config.construction.perpendicular.forEach((perp: any) => {
        code += `
          if (lines['${perp.line}'] && points['${perp.throughPoint}']) {
            board.create('perpendicular', [lines['${perp.line}'], points['${perp.throughPoint}']], {
              strokeColor: '#666666',
              strokeWidth: 1,
              dash: 2
            });
          }
        `;
      });
    }
  }

  return code;
}