import { describe, expect, it } from "vitest";
import { functionGraph } from "../../src/jsxgraph/function-graph";

describe("Function Graph", () => {
  it("should have the correct schema structure", () => {
    expect(functionGraph.schema).toBeDefined();
    expect(functionGraph.tool).toBeDefined();
    expect(functionGraph.tool.name).toBe("generate_function_graph");
  });

  it("should validate basic function input", () => {
    const validInput = {
      functions: [{
        expression: "x^2",
        color: "#0066cc",
        strokeWidth: 2
      }],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = functionGraph.schema.functions.safeParse(validInput.functions);
    expect(result.success).toBe(true);
  });

  it("should require at least one function", () => {
    const invalidInput = {
      functions: [],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = functionGraph.schema.functions.safeParse(invalidInput.functions);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("At least one function is required.");
  });

  it("should validate multiple functions", () => {
    const validInput = {
      functions: [
        { expression: "x^2", color: "#ff0000" },
        { expression: "x^3", color: "#00ff00" },
        { expression: "sin(x)", color: "#0000ff" }
      ],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = functionGraph.schema.functions.safeParse(validInput.functions);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(3);
  });

  it("should validate analysis options", () => {
    const validInput = {
      functions: [{ expression: "x^2" }],
      showDerivatives: true,
      showIntegrals: false,
      showCriticalPoints: true,
      showInflectionPoints: true,
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = functionGraph.schema.functions.safeParse(validInput.functions);
    expect(result.success).toBe(true);
  });

  it("should validate domain and range", () => {
    const validInput = {
      functions: [{
        expression: "sqrt(x)",
        domain: [0, 10],
        range: [0, 5],
        color: "#ff6600"
      }],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = functionGraph.schema.functions.safeParse(validInput.functions);
    expect(result.success).toBe(true);
  });
});