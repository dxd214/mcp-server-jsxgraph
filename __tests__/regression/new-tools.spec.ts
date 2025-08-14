/**
 * Regression tests for new tools added since v0.0.1
 * These tests ensure new features work correctly and maintain API compatibility
 */

import { describe, expect, it } from "vitest";
import { functionProperties } from "../../src/jsxgraph/function-properties";
import { numberLine } from "../../src/jsxgraph/number-line";
import { polynomialComplete } from "../../src/jsxgraph/polynomial-complete";
import { callTool } from "../../src/utils/callTool";

describe("New Tools Regression Tests", () => {
  describe("Function Properties Tool", () => {
    it("should have correct tool metadata", () => {
      expect(functionProperties.tool.name).toBe("generate_function_properties");
      expect(functionProperties.tool.description).toContain("comprehensive function property analysis");
      expect(functionProperties.tool.inputSchema).toBeTypeOf("object");
    });

    it("should have valid schema structure", () => {
      expect(functionProperties.schema).toBeTypeOf("object");
      expect(functionProperties.schema.function).toBeDefined();
      expect(functionProperties.schema.analysisOptions).toBeDefined();
      expect(functionProperties.schema.displayOptions).toBeDefined();
    });

    it("should integrate with callTool function", async () => {
      const input = {
        function: {
          expression: "x^2",
          name: "f(x)"
        },
        analysisOptions: {
          domain: true,
          intercepts: true,
          extrema: true
        },
        displayOptions: {
          showGraph: true,
          showTable: true
        }
      };

      // Test that callTool can handle this tool
      const result = await callTool("function-properties", input);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("html");
    });
  });

  describe("Number Line Tool", () => {
    it("should have correct tool metadata", () => {
      expect(numberLine.tool.name).toBe("generate_number_line");
      expect(numberLine.tool.description).toContain("enhanced number line visualization");
      expect(numberLine.tool.inputSchema).toBeTypeOf("object");
    });

    it("should have valid schema structure", () => {
      expect(numberLine.schema).toBeTypeOf("object");
      expect(numberLine.schema.range).toBeDefined();
    });

    it("should integrate with callTool function", async () => {
      const input = {
        range: [-5, 5],
        points: [
          { value: -2, type: "closed" as const, label: "A" },
          { value: 3, type: "open" as const, label: "B" }
        ]
      };

      const result = await callTool("number-line", input);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("html");
    });
  });

  describe("Polynomial Complete Tool", () => {
    it("should have correct tool metadata", () => {
      expect(polynomialComplete.tool.name).toBe("generate_polynomial_complete");
      expect(polynomialComplete.tool.description).toContain("comprehensive polynomial analysis");
      expect(polynomialComplete.tool.inputSchema).toBeTypeOf("object");
    });

    it("should have valid schema structure", () => {
      expect(polynomialComplete.schema).toBeTypeOf("object");
      expect(polynomialComplete.schema.polynomial).toBeDefined();
    });

    it("should integrate with callTool function", async () => {
      const input = {
        polynomial: {
          type: "standard" as const,
          expression: "x^2 - 4x + 3"
        },
        analysis: {
          findZeros: true,
          findExtrema: true,
          analyzeEndBehavior: true
        }
      };

      const result = await callTool("polynomial-complete", input);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("html");
    });
  });
});