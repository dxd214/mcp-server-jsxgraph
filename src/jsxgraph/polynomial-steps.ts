/**
 * Polynomial Function Step-by-Step Analysis Chart
 * 多项式函数分步骤分析图表
 */

import { z } from "zod";
import { zodToJsonSchema } from "../utils";
import {
  BoundingBoxSchema,
  KeepAspectRatioSchema,
  ShowCopyrightSchema,
  ShowNavigationSchema,
} from "./jsxgraph-base";

// Step configuration schema
const StepSchema = z.object({
  id: z.string().describe("Step identifier"),
  title: z.string().describe("Step title"),
  description: z.string().describe("Step description"),
  elements: z
    .array(
      z.object({
        type: z
          .enum(["point", "line", "curve", "polygon", "arrow", "text"])
          .describe("Element type"),
        id: z.string().describe("Element identifier"),
        properties: z.any().describe("Element properties"),
        animation: z
          .object({
            from: z.any().optional(),
            to: z.any().optional(),
            duration: z.number().optional(),
            easing: z
              .enum(["linear", "ease-in", "ease-out", "ease-in-out"])
              .optional(),
          })
          .optional()
          .describe("Animation configuration"),
        style: z
          .object({
            color: z.string().optional(),
            strokeWidth: z.number().optional(),
            dash: z
              .number()
              .optional()
              .describe("0: solid, 1: dotted, 2: dashed"),
            opacity: z.number().optional(),
            fillColor: z.string().optional(),
            fillOpacity: z.number().optional(),
            visible: z.boolean().optional(),
          })
          .optional()
          .describe("Style configuration"),
      }),
    )
    .describe("Elements to display in this step"),
  annotations: z
    .array(
      z.object({
        text: z.string(),
        position: z.tuple([z.number(), z.number()]),
        style: z
          .object({
            fontSize: z.number().optional(),
            color: z.string().optional(),
            fontWeight: z.enum(["normal", "bold"]).optional(),
          })
          .optional(),
      }),
    )
    .optional()
    .describe("Text annotations"),
  shadingAreas: z
    .array(
      z.object({
        type: z.enum(["between-curves", "polygon", "region"]),
        bounds: z.any().optional(),
        color: z.string().optional(),
        opacity: z.number().optional(),
      }),
    )
    .optional()
    .describe("Shading areas"),
  pointers: z
    .array(
      z.object({
        from: z.tuple([z.number(), z.number()]),
        to: z.tuple([z.number(), z.number()]),
        label: z.string().optional(),
        style: z
          .object({
            color: z.string().optional(),
            strokeWidth: z.number().optional(),
            dash: z.number().optional(),
          })
          .optional(),
      }),
    )
    .optional()
    .describe("Pointer arrows"),
});

// Input schema for polynomial steps
const schema = {
  polynomial: z
    .object({
      expression: z
        .string()
        .describe('Polynomial expression, e.g., "-2*(x-3)^2*(x^2-16)"'),
      expandedForm: z
        .string()
        .optional()
        .describe("Expanded form for calculations"),
      zeros: z
        .array(
          z.object({
            x: z.number(),
            multiplicity: z.number(),
            behavior: z.enum(["crosses", "touches"]),
          }),
        )
        .describe("X-intercepts with multiplicity"),
      yIntercept: z.number().describe("Y-intercept value"),
      criticalPoints: z
        .array(
          z.object({
            x: z.number(),
            y: z.number(),
            type: z.enum(["maximum", "minimum", "inflection"]),
          }),
        )
        .optional()
        .describe("Critical points"),
      degree: z.number().describe("Polynomial degree"),
      leadingCoefficient: z.number().describe("Leading coefficient"),
    })
    .describe("Polynomial function configuration"),

  steps: z
    .array(StepSchema)
    .optional()
    .describe("Custom steps (if not provided, will generate default steps)"),

  title: z
    .string()
    .default("Polynomial Function Step-by-Step Analysis")
    .describe("Chart title"),
  width: z.number().default(900).describe("Chart width"),
  height: z.number().default(600).describe("Chart height"),
  boundingBox: BoundingBoxSchema.default([-6, 500, 6, -100]),
  axisXTitle: z.string().default("x").describe("X-axis title"),
  axisYTitle: z.string().default("f(x)").describe("Y-axis title"),

  showControls: z.boolean().default(true).describe("Show navigation controls"),
  autoPlay: z.boolean().default(false).describe("Auto-play through steps"),
  playSpeed: z
    .number()
    .default(3000)
    .describe("Auto-play speed in milliseconds"),

  outputFormat: z
    .enum(["javascript", "html", "image"])
    .default("javascript")
    .describe("Output format"),

  showNavigation: ShowNavigationSchema.default(true),
  showCopyright: ShowCopyrightSchema.default(false),
};

// Tool descriptor
const tool = {
  name: "generate_polynomial_steps",
  description: `Generate step-by-step polynomial function analysis with interactive controls. 
    Returns JSXGraph JavaScript code that can be embedded in HTML.
    Supports animations, step navigation, and visual annotations.
    Perfect for educational purposes and function analysis demonstrations.`,
  inputSchema: zodToJsonSchema(schema),
};

export const polynomialSteps = {
  schema,
  tool,
};
