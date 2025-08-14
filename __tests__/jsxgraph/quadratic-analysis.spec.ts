import { describe, expect, it } from "vitest";
import { quadraticAnalysis } from "../../src/jsxgraph/quadratic-analysis";

describe("Quadratic Analysis", () => {
  it("should have the correct schema structure", () => {
    expect(quadraticAnalysis.schema).toBeDefined();
    expect(quadraticAnalysis.tool).toBeDefined();
    expect(quadraticAnalysis.tool.name).toBe("generate_quadratic_analysis");
  });

  it("should validate basic quadratic input", () => {
    const validInput = {
      quadratics: [{
        a: 1,
        b: -2,
        c: 1,
        color: "#0066cc"
      }],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = quadraticAnalysis.schema.quadratics.safeParse(validInput.quadratics);
    expect(result.success).toBe(true);
  });

  it("should require at least one quadratic", () => {
    const invalidInput = {
      quadratics: [],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = quadraticAnalysis.schema.quadratics.safeParse(invalidInput.quadratics);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("At least one quadratic function is required.");
  });

  it("should require non-zero coefficient a", () => {
    const invalidInput = {
      quadratics: [{
        a: 0,
        b: 2,
        c: 1
      }]
    };

    const result = quadraticAnalysis.schema.quadratics.safeParse(invalidInput.quadratics);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Coefficient 'a' must be non-zero for a quadratic function.");
  });

  it("should validate analysis options", () => {
    const validInput = {
      quadratics: [{ a: 1, b: -2, c: 1 }],
      showVertex: true,
      showAxisOfSymmetry: true,
      showRoots: true,
      showDiscriminant: true,
      showYIntercept: true,
      showDirection: false
    };

    const result = quadraticAnalysis.schema.quadratics.safeParse(validInput.quadratics);
    expect(result.success).toBe(true);
  });

  it("should validate multiple quadratics", () => {
    const validInput = {
      quadratics: [
        { a: 1, b: 0, c: -4, color: "#ff0000" },
        { a: -1, b: 2, c: 3, color: "#00ff00" },
        { a: 0.5, b: -1, c: 0.5, color: "#0000ff" }
      ]
    };

    const result = quadraticAnalysis.schema.quadratics.safeParse(validInput.quadratics);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(3);
  });

  it("should validate comparison options", () => {
    const validInput = {
      quadratics: [
        { a: 1, b: 0, c: 0 },
        { a: 2, b: 0, c: 0 }
      ],
      comparison: {
        enabled: true,
        showDifferences: true,
        highlightIntersections: true
      }
    };

    const result = quadraticAnalysis.schema.comparison.safeParse(validInput.comparison);
    expect(result.success).toBe(true);
  });
});