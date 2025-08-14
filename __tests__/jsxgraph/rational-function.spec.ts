import { describe, expect, it } from "vitest";
import { rationalFunction } from "../../src/jsxgraph/rational-function";

describe("Rational Function", () => {
  it("should have the correct schema structure", () => {
    expect(rationalFunction.schema).toBeDefined();
    expect(rationalFunction.tool).toBeDefined();
    expect(rationalFunction.tool.name).toBe("generate_rational_function");
  });

  it("should validate basic rational function input", () => {
    const validInput = {
      functions: [{
        numerator: [1, 0],
        denominator: [1, -1],
        color: "#0066cc"
      }],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = rationalFunction.schema.functions.safeParse(validInput.functions);
    expect(result.success).toBe(true);
  });

  it("should require at least one function", () => {
    const invalidInput = {
      functions: [],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = rationalFunction.schema.functions.safeParse(invalidInput.functions);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("At least one rational function is required.");
  });

  it("should validate polynomial coefficients", () => {
    const validInput = {
      functions: [{
        numerator: [1, 2, 1],
        denominator: [1, 0, -1],
        name: "(x² + 2x + 1)/(x² - 1)"
      }]
    };

    const result = rationalFunction.schema.functions.safeParse(validInput.functions);
    expect(result.success).toBe(true);
  });

  it("should validate analysis options", () => {
    const validInput = {
      functions: [{ numerator: [1], denominator: [1, -1] }],
      showAsymptotes: true,
      showHoles: true,
      showIntercepts: true,
      showDomain: true,
      showRange: false
    };

    const result = rationalFunction.schema.functions.safeParse(validInput.functions);
    expect(result.success).toBe(true);
  });

  it("should validate multiple functions", () => {
    const validInput = {
      functions: [
        { numerator: [1], denominator: [1, -1], color: "#ff0000" },
        { numerator: [1, 0], denominator: [1, 0, -1], color: "#00ff00" },
        { numerator: [1, 2, 1], denominator: [1, -4], color: "#0000ff" }
      ]
    };

    const result = rationalFunction.schema.functions.safeParse(validInput.functions);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(3);
  });

  it("should validate asymptote options", () => {
    const validInput = {
      functions: [{ numerator: [1], denominator: [1, -1] }],
      asymptoteStyle: {
        color: "#ff6600",
        strokeWidth: 1,
        dash: 2
      }
    };

    const result = rationalFunction.schema.asymptoteStyle.safeParse(validInput.asymptoteStyle);
    expect(result.success).toBe(true);
  });
});