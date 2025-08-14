import { describe, expect, it } from "vitest";
import { numberLineInequality } from "../../src/jsxgraph/number-line-inequality";

describe("Number Line Inequality", () => {
  it("should have the correct schema structure", () => {
    expect(numberLineInequality.schema).toBeDefined();
    expect(numberLineInequality.tool).toBeDefined();
    expect(numberLineInequality.tool.name).toBe("generate_number_line_inequality");
  });

  it("should validate basic inequality input", () => {
    const validInput = {
      inequalities: [{
        expression: "x > 3",
        color: "#0066cc",
        fillColor: "#ccddff"
      }],
      range: [-10, 10],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = numberLineInequality.schema.inequalities.safeParse(validInput.inequalities);
    expect(result.success).toBe(true);
  });

  it("should require at least one inequality", () => {
    const invalidInput = {
      inequalities: [],
      range: [-10, 10],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = numberLineInequality.schema.inequalities.safeParse(invalidInput.inequalities);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("At least one inequality is required.");
  });

  it("should validate inequality operators", () => {
    const operators = ["<", "<=", ">", ">=", "!="];
    
    operators.forEach(op => {
      const input = {
        inequalities: [{
          expression: `x ${op} 5`,
          color: "#0066cc"
        }]
      };
      
      const result = numberLineInequality.schema.inequalities.safeParse(input.inequalities);
      expect(result.success).toBe(true);
    });
  });

  it("should validate range input", () => {
    const validInput = {
      inequalities: [{ expression: "x > 0" }],
      range: [-5, 15]
    };

    const result = numberLineInequality.schema.range.safeParse(validInput.range);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
  });

  it("should validate multiple inequalities", () => {
    const validInput = {
      inequalities: [
        { expression: "x >= -2", color: "#ff0000" },
        { expression: "x < 5", color: "#0000ff" },
        { expression: "x != 0", color: "#00ff00" }
      ]
    };

    const result = numberLineInequality.schema.inequalities.safeParse(validInput.inequalities);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(3);
  });

  it("should validate display options", () => {
    const validInput = {
      inequalities: [{ expression: "x > 3" }],
      showPoints: true,
      showArrows: true,
      showLabels: false,
      showSolutionSet: true
    };

    const result = numberLineInequality.schema.inequalities.safeParse(validInput.inequalities);
    expect(result.success).toBe(true);
  });
});