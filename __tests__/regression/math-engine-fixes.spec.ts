/**
 * Regression tests for Math Analysis Engine fixes
 * Tests specifically for expression parsing improvements and edge cases
 */

import { describe, expect, it } from "vitest";
import { MathAnalysisEngine } from "../../src/utils/math-analysis-engine";

describe("Math Analysis Engine - Expression Parsing Fixes", () => {
  describe("Exponent Expression Parsing", () => {
    it("should correctly parse negative base with exponent", () => {
      // This should not throw a syntax error anymore
      expect(() => {
        MathAnalysisEngine.analyzeFunctionProperties("-2^x");
      }).not.toThrow();
    });

    it("should handle negative number exponents correctly", () => {
      const result = MathAnalysisEngine.analyzeFunctionProperties("-2^x");
      expect(result).toBeDefined();
      expect(result.domain).toBeDefined();
    });

    it("should handle complex expressions with negative exponents", () => {
      expect(() => {
        MathAnalysisEngine.analyzeFunctionProperties("-3.14^x + 2*x - 1");
      }).not.toThrow();
    });

    it("should handle multiple negative exponents in same expression", () => {
      expect(() => {
        MathAnalysisEngine.analyzeFunctionProperties("-2^x + -3^(x-1)");
      }).not.toThrow();
    });

    it("should preserve positive exponents", () => {
      expect(() => {
        MathAnalysisEngine.analyzeFunctionProperties("2^x + 3^x");
      }).not.toThrow();
    });
  });

  describe("Error Handling Edge Cases", () => {
    it("should handle empty string gracefully", () => {
      const result = MathAnalysisEngine.analyzeFunctionProperties("");
      expect(result.domain).toBe("Error in analysis");
      expect(result.intercepts.x).toEqual([]);
    });

    it("should handle null input gracefully", () => {
      const result = MathAnalysisEngine.analyzeFunctionProperties(null as any);
      expect(result.domain).toBe("Error in analysis");
      expect(result.intercepts.x).toEqual([]);
    });

    it("should handle undefined input gracefully", () => {
      const result = MathAnalysisEngine.analyzeFunctionProperties(undefined as any);
      expect(result.domain).toBe("Error in analysis");
      expect(result.intercepts.x).toEqual([]);
    });

    it("should handle whitespace-only strings gracefully", () => {
      const result = MathAnalysisEngine.analyzeFunctionProperties("   ");
      expect(result.domain).toBe("Error in analysis");
    });
  });

  describe("Mathematical Function Support", () => {
    it("should handle trigonometric functions", () => {
      expect(() => {
        MathAnalysisEngine.analyzeFunctionProperties("Math.sin(x) + Math.cos(x)");
      }).not.toThrow();
    });

    it("should handle exponential and logarithmic functions", () => {
      expect(() => {
        MathAnalysisEngine.analyzeFunctionProperties("Math.exp(x) + Math.log(x)");
      }).not.toThrow();
    });

    it("should handle square root functions", () => {
      expect(() => {
        MathAnalysisEngine.analyzeFunctionProperties("Math.sqrt(x)");
      }).not.toThrow();
    });

    it("should handle complex combinations", () => {
      expect(() => {
        MathAnalysisEngine.analyzeFunctionProperties("Math.sin(x) * Math.exp(-x^2)");
      }).not.toThrow();
    });
  });

  describe("Domain Analysis", () => {
    it("should identify domain restrictions for square roots", () => {
      const result = MathAnalysisEngine.analyzeFunctionProperties("Math.sqrt(x)");
      expect(result.domain).toContain("non-negative");
    });

    it("should identify domain restrictions for logarithms", () => {
      const result = MathAnalysisEngine.analyzeFunctionProperties("Math.log(x)");
      expect(result.domain).toContain("positive");
    });

    it("should identify domain restrictions for rational functions", () => {
      const result = MathAnalysisEngine.analyzeFunctionProperties("1/x");
      expect(result.domain).toContain("zero");
    });

    it("should handle unrestricted domains", () => {
      const result = MathAnalysisEngine.analyzeFunctionProperties("x^2 + 3*x + 1");
      expect(result.domain).toBe("ℝ (all real numbers)");
    });
  });

  describe("Intercept Finding", () => {
    it("should find x-intercepts for quadratic", () => {
      const result = MathAnalysisEngine.analyzeFunctionProperties("x^2 - 4");
      expect(result.intercepts.x).toHaveLength(2);
      expect(result.intercepts.x).toEqual(expect.arrayContaining([-2, 2]));
    });

    it("should find y-intercept", () => {
      const result = MathAnalysisEngine.analyzeFunctionProperties("x^2 + 3*x + 5");
      expect(result.intercepts.y).toBe(5);
    });

    it("should handle functions with no x-intercepts", () => {
      const result = MathAnalysisEngine.analyzeFunctionProperties("x^2 + 1");
      expect(result.intercepts.x).toHaveLength(0);
    });
  });
});