import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import * as Charts from "../jsxgraph";
import {
  type JSXGraphConfig,
  generateJSXGraphCode,
  generatePolynomialStepsCode,
  replaceGraphIdPlaceholder,
} from "./jsxgraph-code-generator";
import { ValidateError } from "./validator";

// JSXGraph chart type mapping
const CHART_TYPE_MAP = {
  generate_function_graph: "function-graph",
  generate_parametric_curve: "parametric-curve",
  generate_geometry_diagram: "geometry-diagram",
  generate_vector_field: "vector-field",
  generate_linear_system: "linear-system",
  generate_function_transformation: "function-transformation",
  generate_quadratic_analysis: "quadratic-analysis",
  generate_exponential_logarithm: "exponential-logarithm",
  generate_rational_function: "rational-function",
  generate_equation_system: "equation-system",
  generate_conic_section: "conic-section",
  generate_polynomial_steps: "polynomial-steps",
  generate_polynomial_complete: "polynomial-complete",
} as const;

// JSXGraph chart types
const JSXGRAPH_CHARTS = new Set([
  "function-graph",
  "parametric-curve",
  "geometry-diagram",
  "vector-field",
  "linear-system",
  "function-transformation",
  "quadratic-analysis",
  "exponential-logarithm",
  "rational-function",
  "equation-system",
  "conic-section",
  "polynomial-steps",
  "polynomial-complete",
  "number-line",
  "function-properties",
]);

/**
 * Call a tool to generate a chart based on the provided name and arguments.
 * @param tool The name of the tool to call, e.g., "generate_area_chart".
 * @param args The arguments for the tool, which should match the expected schema for the chart type.
 * @returns
 */
export async function callTool(tool: string, args: object = {}) {
  const chartType = CHART_TYPE_MAP[tool as keyof typeof CHART_TYPE_MAP];

  if (!chartType) {
    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${tool}.`);
  }

  try {
    // Validate input using Zod before sending to API.
    // Select the appropriate schema based on the chart type.
    const schema = Charts[chartType].schema;

    if (schema) {
      // Use safeParse instead of parse and try-catch.
      const result = z.object(schema).safeParse(args);
      if (!result.success) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Invalid parameters: ${result.error.message}`,
        );
      }
    }

    // Check if it's a JSXGraph chart
    if (JSXGRAPH_CHARTS.has(chartType)) {
      let jsCode: string;

      // Generate unique container ID based on chart type and timestamp
      const containerId = `jxgbox_${chartType.replace(/-/g, "_")}_${Date.now()}`;

      // Special handling for polynomial-steps which has its own generator
      if (chartType === "polynomial-steps") {
        // 对于步骤式可视化，返回包含步骤控制逻辑的JS代码片段（不返回HTML模板）
        jsCode = generatePolynomialStepsCode({
          ...(args as any),
          containerId: containerId,
        });
      } else {
        // Map JSXGraph chart types to renderer types
        const jsxGraphTypeMap: Record<string, JSXGraphConfig["type"]> = {
          "function-graph": "function",
          "parametric-curve": "parametric",
          "geometry-diagram": "geometry",
          "vector-field": "vector-field",
          "linear-system": "linear-system",
          "function-transformation": "function-transformation",
          "quadratic-analysis": "quadratic-analysis",
          "exponential-logarithm": "exponential-logarithm",
          "rational-function": "rational-function",
          "equation-system": "equation-system",
          "conic-section": "conic-section",
        };

        const jsxGraphConfig: JSXGraphConfig = {
          type: jsxGraphTypeMap[chartType] || "function",
          width: (args as any).width || 800,
          height: (args as any).height || 600,
          boundingBox: (args as any).boundingBox || [-10, 10, 10, -10],
          config: args,
          containerId: containerId,
          pure: true, // 其他JSXGraph图表仍返回纯净代码片段
        };

        jsCode = generateJSXGraphCode(jsxGraphConfig);
      }

      // 只返回JavaScript代码片段，不返回HTML模板
      return {
        content: [
          {
            type: "text",
            text: jsCode,
          },
        ],
      };
    }

    // This should never be reached for JSXGraph charts, but kept for safety
    throw new McpError(
      ErrorCode.InternalError,
      `Non-JSXGraph chart type not supported: ${chartType}`,
    );

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (error: any) {
    if (error instanceof McpError) throw error;
    if (error instanceof ValidateError)
      throw new McpError(ErrorCode.InvalidParams, error.message);
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to generate chart: ${error?.message || "Unknown error."}`,
    );
  }
}

/**
 * Call MCP tool with placeholder support
 * @param tool - Tool name
 * @param args - Tool arguments
 * @param options - Options for placeholder handling
 */
export async function callToolWithPlaceholder(
  tool: string,
  args: any,
  options: {
    useGraphIdPlaceholder?: boolean;
    customContainerId?: string;
  } = {},
): Promise<any> {
  const { useGraphIdPlaceholder = false, customContainerId } = options;
  const chartType = CHART_TYPE_MAP[tool as keyof typeof CHART_TYPE_MAP];

  if (!chartType) {
    throw new McpError(ErrorCode.InvalidParams, `Unknown chart type: ${tool}`);
  }

  // Check if it's a JSXGraph chart
  if (JSXGRAPH_CHARTS.has(chartType)) {
    let jsCode: string;

    // Generate container ID
    const actualContainerId =
      customContainerId ||
      `jxgbox_${chartType.replace(/-/g, "_")}_${Date.now()}`;

    try {
      // Validate input using Zod
      const schema = Charts[chartType].schema;
      if (schema) {
        const result = z.object(schema).safeParse(args);
        if (!result.success) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `Invalid parameters: ${result.error.message}`,
          );
        }
      }

      // Special handling for polynomial-steps
      if (chartType === "polynomial-steps") {
        jsCode = generatePolynomialStepsCode({
          ...(args as any),
          containerId: useGraphIdPlaceholder
            ? "__GRAPH_ID__"
            : actualContainerId,
          useGraphIdPlaceholder: useGraphIdPlaceholder,
        });
      } else {
        // Map JSXGraph chart types to renderer types
        const jsxGraphTypeMap: Record<string, JSXGraphConfig["type"]> = {
          "function-graph": "function",
          "parametric-curve": "parametric",
          "geometry-diagram": "geometry",
          "vector-field": "vector-field",
          "linear-system": "linear-system",
          "function-transformation": "function-transformation",
          "quadratic-analysis": "quadratic-analysis",
          "exponential-logarithm": "exponential-logarithm",
          "rational-function": "rational-function",
          "equation-system": "equation-system",
          "conic-section": "conic-section",
        };

        const jsxGraphConfig: JSXGraphConfig = {
          type: jsxGraphTypeMap[chartType] || "function",
          width: (args as any).width || 800,
          height: (args as any).height || 600,
          boundingBox: (args as any).boundingBox || [-10, 10, 10, -10],
          config: args,
          containerId: useGraphIdPlaceholder
            ? "__GRAPH_ID__"
            : actualContainerId,
          pure: true,
          useGraphIdPlaceholder: useGraphIdPlaceholder,
        };

        jsCode = generateJSXGraphCode(jsxGraphConfig);
      }

      // If not using placeholder, replace any placeholders with actual ID
      if (!useGraphIdPlaceholder && jsCode.includes("__GRAPH_ID__")) {
        jsCode = replaceGraphIdPlaceholder(jsCode, actualContainerId);
      }

      return {
        content: [
          {
            type: "text",
            text: jsCode,
          },
        ],
        actualContainerId: actualContainerId, // Return the actual container ID used
        usedPlaceholder: useGraphIdPlaceholder,
      };
    } catch (error: any) {
      if (error instanceof McpError) throw error;
      if (error instanceof ValidateError)
        throw new McpError(ErrorCode.InvalidParams, error.message);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to generate JSXGraph chart: ${error?.message || "Unknown error."}`,
      );
    }
  }

  // For non-JSXGraph charts, fall back to the original function
  return callTool(tool, args);
}

/**
 * Replace placeholders in generated JSXGraph code
 * @param code - JavaScript code with placeholders
 * @param actualId - Actual container ID to replace placeholders with
 */
export function processGraphIdPlaceholders(
  code: string,
  actualId: string,
): string {
  return replaceGraphIdPlaceholder(code, actualId);
}
