import { describe, expect, it } from "vitest";
import { polynomialSteps } from "../../src/jsxgraph/polynomial-steps";

describe("Polynomial Steps", () => {
  it("should have the correct schema structure", () => {
    expect(polynomialSteps.schema).toBeDefined();
    expect(polynomialSteps.tool).toBeDefined();
    expect(polynomialSteps.tool.name).toBe("generate_polynomial_steps");
  });

  it("should validate basic polynomial input", () => {
    const validInput = {
      polynomials: [{
        coefficients: [1, -2, 1],
        color: "#0066cc",
        name: "x² - 2x + 1"
      }],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = polynomialSteps.schema.polynomials.safeParse(validInput.polynomials);
    expect(result.success).toBe(true);
  });

  it("should require at least one polynomial", () => {
    const invalidInput = {
      polynomials: [],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = polynomialSteps.schema.polynomials.safeParse(invalidInput.polynomials);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("At least one polynomial is required.");
  });

  it("should validate coefficient arrays", () => {
    const validInput = {
      polynomials: [
        { coefficients: [1] },
        { coefficients: [0, 1] },
        { coefficients: [1, -3, 2] },
        { coefficients: [1, 0, -5, 6] }
      ]
    };

    const result = polynomialSteps.schema.polynomials.safeParse(validInput.polynomials);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(4);
  });

  it("should validate analysis options", () => {
    const validInput = {
      polynomials: [{ coefficients: [1, -2, 1] }],
      showFactorization: true,
      showRoots: true,
      showDerivatives: true,
      showCriticalPoints: true,
      showInflectionPoints: false,
      showSteps: true
    };

    const result = polynomialSteps.schema.polynomials.safeParse(validInput.polynomials);
    expect(result.success).toBe(true);
  });

  it("should validate step-by-step options", () => {
    const validInput = {
      polynomials: [{ coefficients: [1, -5, 6] }],
      steps: {
        showFactoring: true,
        showSyntheticDivision: false,
        showLongDivision: true,
        showRootFinding: true
      }
    };

    const result = polynomialSteps.schema.steps.safeParse(validInput.steps);
    expect(result.success).toBe(true);
  });

  it("should validate polynomial degrees", () => {
    const polynomials = [
      { coefficients: [5], name: "Constant" },
      { coefficients: [2, -1], name: "Linear" },
      { coefficients: [1, 0, -4], name: "Quadratic" },
      { coefficients: [1, -3, 3, -1], name: "Cubic" },
      { coefficients: [1, 0, -5, 0, 4], name: "Quartic" }
    ];

    polynomials.forEach(poly => {
      const result = polynomialSteps.schema.polynomials.safeParse([poly]);
      expect(result.success).toBe(true);
    });
  });
});