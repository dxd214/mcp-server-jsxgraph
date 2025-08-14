import { describe, expect, it } from "vitest";
import { trigonometricAnalysis } from "../../src/jsxgraph/trigonometric-analysis";

describe("Trigonometric Analysis", () => {
  it("should have the correct schema structure", () => {
    expect(trigonometricAnalysis.schema).toBeDefined();
    expect(trigonometricAnalysis.tool).toBeDefined();
    expect(trigonometricAnalysis.tool.name).toBe("generate_trigonometric_analysis");
  });

  it("should validate basic trigonometric function input", () => {
    const validInput = {
      functions: [
        {
          type: "sin",
          transformation: {
            amplitude: 1,
            frequency: 1,
            phaseShift: 0,
            verticalShift: 0
          }
        }
      ],
      width: 800,
      height: 600,
      title: "Sine Function Analysis",
      boundingBox: [-10, 10, 10, -10]
    };

    const result = trigonometricAnalysis.schema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("should validate multiple trigonometric functions", () => {
    const validInput = {
      functions: [
        {
          type: "sin",
          color: "#0066cc",
          transformation: { amplitude: 2 }
        },
        {
          type: "cos", 
          color: "#cc0000",
          transformation: { frequency: 2 }
        },
        {
          type: "tan",
          color: "#009900",
          showAsymptotes: true
        }
      ],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = trigonometricAnalysis.schema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("should require at least one function", () => {
    const invalidInput = {
      functions: [],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = trigonometricAnalysis.schema.safeParse(invalidInput);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("At least one trigonometric function is required.");
  });

  it("should validate all trigonometric function types", () => {
    const trigTypes = ["sin", "cos", "tan", "csc", "sec", "cot", "asin", "acos", "atan", "sinh", "cosh", "tanh"];
    
    trigTypes.forEach(type => {
      const input = {
        functions: [{
          type: type,
          transformation: { amplitude: 1 }
        }],
        width: 800,
        height: 600,
        boundingBox: [-10, 10, 10, -10]
      };
      
      const result = trigonometricAnalysis.schema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  it("should validate analysis options", () => {
    const validInput = {
      functions: [{ type: "sin" }],
      analysisOptions: {
        showKeyPoints: true,
        showPeriodMarkers: true,
        showAmplitudeLines: false,
        showPhaseShift: false,
        showUnitCircle: true,
        analyzeIntersections: false
      },
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = trigonometricAnalysis.schema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("should validate x-axis unit options", () => {
    const radiansInput = {
      functions: [{ type: "sin" }],
      xAxisUnit: "radians",
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const degreesInput = {
      functions: [{ type: "sin" }],
      xAxisUnit: "degrees",
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    expect(trigonometricAnalysis.schema.safeParse(radiansInput).success).toBe(true);
    expect(trigonometricAnalysis.schema.safeParse(degreesInput).success).toBe(true);
  });

  it("should validate transformation parameters", () => {
    const validInput = {
      functions: [{
        type: "sin",
        transformation: {
          amplitude: 2,
          frequency: 0.5,
          phaseShift: Math.PI/4,
          verticalShift: 1
        }
      }],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = trigonometricAnalysis.schema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("should validate additional points", () => {
    const validInput = {
      functions: [{ type: "sin" }],
      points: [
        { x: 0, y: 0, name: "Origin", color: "#ff0000", size: 5 },
        { x: Math.PI/2, y: 1, name: "Peak" }
      ],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = trigonometricAnalysis.schema.safeParse(validInput);
    expect(result.success).toBe(true);
  });
});