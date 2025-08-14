import { describe, expect, it } from "vitest";
import { parametricCurve } from "../../src/jsxgraph/parametric-curve";

describe("Parametric Curve", () => {
  it("should have the correct schema structure", () => {
    expect(parametricCurve.schema).toBeDefined();
    expect(parametricCurve.tool).toBeDefined();
    expect(parametricCurve.tool.name).toBe("generate_parametric_curve");
  });

  it("should validate basic parametric curve input", () => {
    const validInput = {
      curves: [{
        xFunction: "cos(t)",
        yFunction: "sin(t)",
        tMin: 0,
        tMax: 2 * Math.PI,
        color: "#0066cc"
      }],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = parametricCurve.schema.curves.safeParse(validInput.curves);
    expect(result.success).toBe(true);
  });

  it("should require at least one curve", () => {
    const invalidInput = {
      curves: [],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = parametricCurve.schema.curves.safeParse(invalidInput.curves);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("At least one parametric curve is required.");
  });

  it("should validate parameter ranges", () => {
    const validInput = {
      curves: [{
        xFunction: "t",
        yFunction: "t^2",
        tMin: -5,
        tMax: 5,
        color: "#ff0000"
      }]
    };

    const result = parametricCurve.schema.curves.safeParse(validInput.curves);
    expect(result.success).toBe(true);
  });

  it("should validate multiple curves", () => {
    const validInput = {
      curves: [
        { xFunction: "cos(t)", yFunction: "sin(t)", tMin: 0, tMax: 2*Math.PI, color: "#ff0000" },
        { xFunction: "t", yFunction: "t^2", tMin: -3, tMax: 3, color: "#00ff00" },
        { xFunction: "t*cos(t)", yFunction: "t*sin(t)", tMin: 0, tMax: 4*Math.PI, color: "#0000ff" }
      ]
    };

    const result = parametricCurve.schema.curves.safeParse(validInput.curves);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(3);
  });

  it("should validate animation options", () => {
    const validInput = {
      curves: [{ xFunction: "cos(t)", yFunction: "sin(t)", tMin: 0, tMax: 2*Math.PI }],
      animation: {
        enabled: true,
        speed: 1.5,
        showTrace: true,
        showDirection: true
      }
    };

    const result = parametricCurve.schema.animation.safeParse(validInput.animation);
    expect(result.success).toBe(true);
  });

  it("should validate analysis options", () => {
    const validInput = {
      curves: [{ xFunction: "t", yFunction: "t^2", tMin: -2, tMax: 2 }],
      showTangents: true,
      showCurvature: false,
      showArclength: true,
      showVelocity: false
    };

    const result = parametricCurve.schema.curves.safeParse(validInput.curves);
    expect(result.success).toBe(true);
  });
});