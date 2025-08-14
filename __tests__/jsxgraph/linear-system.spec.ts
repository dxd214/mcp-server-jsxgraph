import { describe, expect, it } from "vitest";
import { linearSystem } from "../../src/jsxgraph/linear-system";

describe("Linear System", () => {
  it("should have the correct schema structure", () => {
    expect(linearSystem.schema).toBeDefined();
    expect(linearSystem.tool).toBeDefined();
    expect(linearSystem.tool.name).toBe("generate_linear_system");
  });

  it("should validate basic linear equation input", () => {
    const validInput = {
      equations: [
        { a: 2, b: 3, c: 6, color: "#0066cc" },
        { a: 1, b: -1, c: 1, color: "#ff0000" }
      ],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = linearSystem.schema.equations.safeParse(validInput.equations);
    expect(result.success).toBe(true);
  });

  it("should validate single equation", () => {
    const validInput = {
      equations: [
        { a: 2, b: 3, c: 6 }
      ],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = linearSystem.schema.equations.safeParse(validInput.equations);
    expect(result.success).toBe(true);
  });

  it("should validate inequalities", () => {
    const validInput = {
      inequalities: [
        { a: 1, b: 1, c: 5, type: "<=" },
        { a: 2, b: -1, c: 3, type: ">=" }
      ]
    };
    
    const result = linearSystem.schema.inequalities.safeParse(validInput.inequalities);
    expect(result.success).toBe(true);
  });

  it("should validate analysis options", () => {
    const validInput = {
      equations: [
        { a: 2, b: 3, c: 6 },
        { a: 1, b: -1, c: 1 }
      ],
      showIntersections: true,
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = linearSystem.schema.equations.safeParse(validInput.equations);
    expect(result.success).toBe(true);
  });

  it("should validate inequality types", () => {
    const types = ["<=", ">=", "<", ">"];
    
    types.forEach(type => {
      const input = {
        inequalities: [{
          a: 1, b: 1, c: 5, type: type
        }]
      };
      
      const result = linearSystem.schema.inequalities.safeParse(input.inequalities);
      expect(result.success).toBe(true);
    });
  });
});