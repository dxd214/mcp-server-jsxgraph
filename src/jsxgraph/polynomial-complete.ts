/**
 * Comprehensive Polynomial Analyzer
 * Provides advanced features such as factorization, synthetic division, end behavior, and root multiplicity analysis
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

// Polynomial coefficients schema
const PolynomialCoefficientsSchema = z.object({
  coefficients: z
    .array(z.number())
    .describe("Array of polynomial coefficients [a_n, a_{n-1}, ..., a_1, a_0] for a_n*x^n + ... + a_1*x + a_0"),
  expression: z
    .string()
    .optional()
    .describe("Polynomial expression string (optional, for display)"),
});

// Factorization options schema
const FactorizationOptionsSchema = z.object({
  showProcess: z.boolean().default(true).describe("Show factorization process"),
  useRationalRootTest: z.boolean().default(true).describe("Use rational root test"),
  showRemainder: z.boolean().default(true).describe("Show remainder"),
  findComplexRoots: z.boolean().default(false).describe("Find complex roots"),
  factorizeCompletely: z.boolean().default(true).describe("Complete factorization"),
});

// Synthetic division options schema
const SyntheticDivisionSchema = z.object({
  divisors: z.array(z.number()).describe("List of divisors"),
  showSteps: z.boolean().default(true).describe("Show division steps"),
  verifyResults: z.boolean().default(true).describe("Verify results"),
});

// Root analysis options schema
const RootAnalysisSchema = z.object({
  findRationalRoots: z.boolean().default(true).describe("Find rational roots"),
  findIrrationalRoots: z.boolean().default(true).describe("Find irrational roots"),
  analyzeMultiplicity: z.boolean().default(true).describe("Analyze multiplicity"),
  showBehavior: z.boolean().default(true).describe("Show root behavior"),
  tolerance: z.number().default(1e-10).describe("Numerical calculation tolerance"),
});

// End behavior analysis schema
const EndBehaviorSchema = z.object({
  analyzeLeadingTerm: z.boolean().default(true).describe("Analyze leading term"),
  showLimits: z.boolean().default(true).describe("Show limits"),
  visualizeArrows: z.boolean().default(true).describe("Visualize arrows"),
});

// Display options schema
const DisplayOptionsSchema = z.object({
  showGraph: z.boolean().default(true).describe("Show function graph"),
  showFactorization: z.boolean().default(true).describe("Show factorization"),
  showSyntheticDivision: z.boolean().default(false).describe("Show synthetic division"),
  showRootTable: z.boolean().default(true).describe("Show root table"),
  showEndBehavior: z.boolean().default(true).describe("Show end behavior"),
  showDerivatives: z.boolean().default(false).describe("Show derivatives"),
  annotateGraph: z.boolean().default(true).describe("Annotate on graph"),
  showWorkspace: z.boolean().default(false).describe("Show workspace"),
});

// Main input schema
const schema = {
  // Polynomial definition
  polynomial: PolynomialCoefficientsSchema.describe("Polynomial definition"),

  // Analysis options
  factorization: FactorizationOptionsSchema
    .optional()
    .default({})
    .describe("Factorization options"),
  
  syntheticDivision: SyntheticDivisionSchema
    .optional()
    .describe("Synthetic division configuration"),
  
  rootAnalysis: RootAnalysisSchema
    .optional()
    .default({})
    .describe("Root analysis options"),
  
  endBehavior: EndBehaviorSchema
    .optional()
    .default({})
    .describe("End behavior analysis"),

  // Display options
  display: DisplayOptionsSchema
    .optional()
    .default({})
    .describe("Display options"),

  // JSXGraph options
  title: JSXGraphTitleSchema,
  width: JSXGraphWidthSchema,
  height: JSXGraphHeightSchema,
  boundingBox: BoundingBoxSchema,
  axisXTitle: z.string().optional().default("x").describe("X axis label"),
  axisYTitle: z.string().optional().default("f(x)").describe("Y axis label"),
  
  style: z
    .object({
      theme: JSXGraphThemeSchema,
      backgroundColor: JSXGraphBackgroundColorSchema,
      grid: JSXGraphGridSchema,
      axis: JSXGraphAxisSchema,
    })
    .optional()
    .describe("Style configuration"),

  keepAspectRatio: KeepAspectRatioSchema,
  showCopyright: ShowCopyrightSchema,
  showNavigation: ShowNavigationSchema,
  zoom: ZoomSchema,
  pan: PanSchema,
};

// Polynomial complete tool descriptor
const tool = {
  name: "generate_polynomial_complete",
  description:
    "Create comprehensive polynomial analysis with advanced features: complete factorization, synthetic division, rational root test, end behavior analysis, root multiplicity, and step-by-step solutions. Perfect for in-depth polynomial study and education.",
  inputSchema: zodToJsonSchema(z.object(schema)),
};

export const polynomialComplete = {
  schema,
  tool,
};
