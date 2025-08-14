import { describe, expect, it } from "vitest";
import { equationSystem } from "../../src/jsxgraph/equation-system";

describe("Equation System", () => {
  it("should have the correct schema structure", () => {
    expect(equationSystem.schema).toBeDefined();
    expect(equationSystem.tool).toBeDefined();
    expect(equationSystem.tool.name).toBe("generate_equation_system");
  });

  it("should validate basic equation system input", () => {
    const validInput = {
      systems: [{
        equations: [
          { expression: "x^2 + y^2 - 25", type: "implicit", color: "#0066cc" },
          { expression: "x + y - 3", type: "implicit", color: "#ff0000" }
        ],
        name: "Circle and Line Intersection"
      }],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = equationSystem.schema.systems.safeParse(validInput.systems);
    expect(result.success).toBe(true);
  });

  it("should validate individual equations", () => {
    const validInput = {
      individualEquations: [
        { expression: "x^2 - y", type: "implicit", color: "#00ff00" },
        { expression: "sin(x) - y", type: "implicit", color: "#ff00ff" },
        { expression: "x^3 - 3*x - y", type: "implicit", color: "#ffff00" }
      ],
      showIntersections: true,
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = equationSystem.schema.individualEquations.safeParse(validInput.individualEquations);
    expect(result.success).toBe(true);
  });

  it("should require at least 2 equations in a system", () => {
    const invalidInput = {
      systems: [{
        equations: [
          { expression: "x^2 + y^2 - 25", type: "implicit" }
        ]
      }],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = equationSystem.schema.systems.safeParse(invalidInput.systems);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("at least 2");
  });

  it("should validate equation types", () => {
    const validTypes = ["implicit", "explicit", "parametric"];
    
    validTypes.forEach(type => {
      const input = {
        individualEquations: [{
          expression: "x^2 + y^2 - 25",
          type: type,
          color: "#0066cc"
        }],
        width: 800,
        height: 600,
        boundingBox: [-10, 10, 10, -10]
      };
      
      const result = equationSystem.schema.individualEquations.safeParse(input.individualEquations);
      expect(result.success).toBe(true);
    });
  });

  it("should validate analysis options", () => {
    const validInput = {
      systems: [{
        equations: [
          { expression: "x^2 + y^2 - 25" },
          { expression: "x + y - 3" }
        ]
      }],
      showIntersections: true,
      showSolutionSet: true,
      numericalSolutions: {
        show: true,
        precision: 6,
        method: "newton"
      },
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = equationSystem.schema.numericalSolutions.safeParse(validInput.numericalSolutions);
    expect(result.success).toBe(true);
  });

  it("should validate numerical solution methods", () => {
    const methods = ["newton", "bisection", "secant"];
    
    methods.forEach(method => {
      const input = {
        numericalSolutions: {
          show: true,
          method: method
        }
      };
      
      const result = equationSystem.schema.numericalSolutions.safeParse(input.numericalSolutions);
      expect(result.success).toBe(true);
    });
  });

  it("should validate multiple systems", () => {
    const validInput = {
      systems: [
        {
          equations: [
            { expression: "x^2 + y^2 - 25", color: "#0066cc" },
            { expression: "x + y - 3", color: "#ff0000" }
          ],
          name: "System 1"
        },
        {
          equations: [
            { expression: "x^2 - y", color: "#00ff00" },
            { expression: "x - 2", color: "#ff00ff" }
          ],
          name: "System 2"
        }
      ],
      individualEquations: [
        { expression: "sin(x) - y", color: "#ffff00" }
      ],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result1 = equationSystem.schema.systems.safeParse(validInput.systems);
    const result2 = equationSystem.schema.individualEquations.safeParse(validInput.individualEquations);
    
    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
  });

  it("should validate stroke properties", () => {
    const validInput = {
      individualEquations: [{
        expression: "x^2 + y^2 - 25",
        color: "#ff0000",
        strokeWidth: 3,
        name: "Circle",
        dash: 2
      }],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = equationSystem.schema.individualEquations.safeParse(validInput.individualEquations);
    expect(result.success).toBe(true);
  });

  it("should use default values when properties are omitted", () => {
    const minimalInput = {
      systems: [{
        equations: [
          { expression: "x^2 + y^2 - 25" },
          { expression: "x + y - 3" }
        ]
      }],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = equationSystem.schema.systems.safeParse(minimalInput.systems);
    expect(result.success).toBe(true);
    
    if (result.success) {
      const equation = result.data[0].equations[0];
      expect(equation.type).toBe("implicit");
      expect(equation.color).toBe("#0066cc");
      expect(equation.strokeWidth).toBe(2);
      expect(equation.dash).toBe(0);
    }
  });

  it("should handle complex mathematical expressions", () => {
    const validInput = {
      individualEquations: [
        { expression: "sin(x*y) + cos(x^2) - y^3" },
        { expression: "exp(x) * log(y) - x^2*y" },
        { expression: "sqrt(x^2 + y^2) - 5" },
        { expression: "tan(x) + sec(y) - 2" }
      ],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = equationSystem.schema.individualEquations.safeParse(validInput.individualEquations);
    expect(result.success).toBe(true);
  });
});