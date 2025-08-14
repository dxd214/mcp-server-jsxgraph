import { describe, expect, it } from "vitest";
import { functionTransformation } from "../../src/jsxgraph/function-transformation";

describe("Function Transformation", () => {
  it("should have the correct schema structure", () => {
    expect(functionTransformation.schema).toBeDefined();
    expect(functionTransformation.tool).toBeDefined();
    expect(functionTransformation.tool.name).toBe("generate_function_transformation");
  });

  it("should validate basic transformation input", () => {
    const validInput = {
      baseFunction: { expression: "x^2", color: "#cccccc" },
      transformations: [{
        type: "translate",
        parameters: { h: 1, k: 3 }
      }],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = functionTransformation.schema.transformations.safeParse(validInput.transformations);
    expect(result.success).toBe(true);
  });

  it("should validate transformation types", () => {
    const transformationTypes = ["translate", "scale", "reflect", "absolute", "inverse", "composite"];

    transformationTypes.forEach(type => {
      const input = {
        transformations: [{
          type: type,
          parameters: type === "translate" ? { h: 0, k: 0 } : 
                      type === "scale" ? { a: 1, b: 1 } :
                      type === "reflect" ? { axis: "x" } : {}
        }]
      };
      
      const result = functionTransformation.schema.transformations.safeParse(input.transformations);
      expect(result.success).toBe(true);
    });
  });

  it("should validate multiple transformations", () => {
    const validInput = {
      transformations: [
        { type: "scale", parameters: { a: 2 } },
        { type: "translate", parameters: { h: -3 } },
        { type: "reflect", parameters: { axis: "y" } }
      ]
    };

    const result = functionTransformation.schema.transformations.safeParse(validInput.transformations);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(3);
  });

  it("should validate animation options", () => {
    const validInput = {
      animateTransformation: true
    };

    const result = functionTransformation.schema.animateTransformation.safeParse(validInput.animateTransformation);
    expect(result.success).toBe(true);
  });
});