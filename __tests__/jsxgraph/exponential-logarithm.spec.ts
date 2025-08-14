import { describe, expect, it } from "vitest";
import { exponentialLogarithm } from "../../src/jsxgraph/exponential-logarithm";

describe("Exponential Logarithm", () => {
  it("should have the correct schema structure", () => {
    expect(exponentialLogarithm.schema).toBeDefined();
    expect(exponentialLogarithm.tool).toBeDefined();
    expect(exponentialLogarithm.tool.name).toBe("generate_exponential_logarithm");
  });

  it("should validate basic exponential function input", () => {
    const validInput = {
      functions: [{
        type: "exponential",
        base: 2,
        coefficient: 1,
        hShift: 0,
        vShift: 0,
        color: "#0066cc"
      }],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = exponentialLogarithm.schema.functions.safeParse(validInput.functions);
    expect(result.success).toBe(true);
  });

  it("should validate basic logarithm function input", () => {
    const validInput = {
      functions: [{
        type: "logarithm",
        base: 10,
        coefficient: 2,
        hShift: 1,
        vShift: -1,
        color: "#ff0000"
      }],
      showAsymptotes: true,
      showIntercepts: true,
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = exponentialLogarithm.schema.functions.safeParse(validInput.functions);
    expect(result.success).toBe(true);
  });

  it("should require at least one function", () => {
    const invalidInput = {
      functions: [],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = exponentialLogarithm.schema.functions.safeParse(invalidInput.functions);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("At least one function is required.");
  });

  it("should validate function types", () => {
    const exponentialInput = {
      functions: [{
        type: "exponential",
        base: Math.E,
        coefficient: 3
      }]
    };

    const logarithmInput = {
      functions: [{
        type: "logarithm",
        base: Math.E,
        coefficient: 0.5
      }]
    };

    const result1 = exponentialLogarithm.schema.functions.safeParse(exponentialInput.functions);
    const result2 = exponentialLogarithm.schema.functions.safeParse(logarithmInput.functions);
    
    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
  });

  it("should validate multiple functions", () => {
    const validInput = {
      functions: [
        { type: "exponential", base: 2, color: "#0066cc" },
        { type: "exponential", base: 3, color: "#ff0000" },
        { type: "logarithm", base: 2, color: "#00ff00" },
        { type: "logarithm", base: 10, color: "#ff00ff" }
      ],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = exponentialLogarithm.schema.functions.safeParse(validInput.functions);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(4);
  });

  it("should validate custom expressions", () => {
    const validInput = {
      functions: [{
        type: "exponential",
        expression: "2^x + 3*e^(-x)",
        color: "#ff6600",
        name: "Custom exponential"
      }],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = exponentialLogarithm.schema.functions.safeParse(validInput.functions);
    expect(result.success).toBe(true);
  });

  it("should validate analysis options", () => {
    const validInput = {
      functions: [{ type: "exponential", base: 2 }],
      showAsymptotes: true,
      showIntercepts: true,
      showInverse: true,
      showReflectionLine: true,
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = exponentialLogarithm.schema.functions.safeParse(validInput.functions);
    expect(result.success).toBe(true);
  });

  it("should validate comparison points", () => {
    const validInput = {
      functions: [{ type: "exponential", base: 2 }],
      comparisonPoints: [
        { x: 0, showValues: true },
        { x: 1, showValues: true },
        { x: 2, showValues: false }
      ],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = exponentialLogarithm.schema.comparisonPoints.safeParse(validInput.comparisonPoints);
    expect(result.success).toBe(true);
  });

  it("should validate domain restrictions", () => {
    const validInput = {
      functions: [{
        type: "logarithm",
        base: 10,
        domain: [0.1, 100],
        color: "#0066cc"
      }],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = exponentialLogarithm.schema.functions.safeParse(validInput.functions);
    expect(result.success).toBe(true);
  });

  it("should use default values when properties are omitted", () => {
    const minimalInput = {
      functions: [{
        type: "exponential"
      }],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = exponentialLogarithm.schema.functions.safeParse(minimalInput.functions);
    expect(result.success).toBe(true);
    
    if (result.success) {
      const func = result.data[0];
      expect(func.base).toBe(Math.E);
      expect(func.coefficient).toBe(1);
      expect(func.hShift).toBe(0);
      expect(func.vShift).toBe(0);
      expect(func.color).toBe("#0066cc");
      expect(func.strokeWidth).toBe(2);
      expect(func.dash).toBe(0);
    }
  });

  it("should validate stroke properties", () => {
    const validInput = {
      functions: [{
        type: "exponential",
        base: 2,
        color: "#ff0000",
        strokeWidth: 3,
        name: "2^x",
        dash: 1
      }],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = exponentialLogarithm.schema.functions.safeParse(validInput.functions);
    expect(result.success).toBe(true);
  });

  it("should validate transformations", () => {
    const validInput = {
      functions: [{
        type: "exponential",
        base: 2,
        coefficient: 3,
        hShift: -2,
        vShift: 5,
        name: "3 * 2^(x+2) + 5"
      }],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = exponentialLogarithm.schema.functions.safeParse(validInput.functions);
    expect(result.success).toBe(true);
  });

  it("should validate common bases", () => {
    const commonBases = [2, Math.E, 10, 0.5, 1.5];
    
    commonBases.forEach(base => {
      const input = {
        functions: [{
          type: "exponential",
          base: base,
          color: "#0066cc"
        }],
        width: 800,
        height: 600,
        boundingBox: [-10, 10, 10, -10]
      };
      
      const result = exponentialLogarithm.schema.functions.safeParse(input.functions);
      expect(result.success).toBe(true);
    });
  });
});