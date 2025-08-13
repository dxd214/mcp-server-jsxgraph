import { z } from "zod";
import { zodToJsonSchema } from "../utils";
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

// General equation schema
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

// System of equations schema
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
      min: z
        .number()
        .optional()
        .default(-5)
        .describe("Minimum parameter value"),
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
  inputSchema: zodToJsonSchema(schema),
};

export const equationSystem = {
  schema,
  tool,
};
