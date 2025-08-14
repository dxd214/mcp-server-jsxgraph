import { describe, expect, it } from "vitest";
import { conicSection } from "../../src/jsxgraph/conic-section";

describe("Conic Section", () => {
  it("should have the correct schema structure", () => {
    expect(conicSection.schema).toBeDefined();
    expect(conicSection.tool).toBeDefined();
    expect(conicSection.tool.name).toBe("generate_conic_section");
  });

  it("should validate basic circle input", () => {
    const validInput = {
      conics: [{
        type: "circle",
        center: { x: 0, y: 0 },
        radius: 5,
        color: "#0066cc"
      }],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = conicSection.schema.conics.safeParse(validInput.conics);
    expect(result.success).toBe(true);
  });

  it("should validate ellipse input", () => {
    const validInput = {
      conics: [{
        type: "ellipse",
        center: { x: 0, y: 0 },
        a: 5,
        b: 3,
        color: "#ff0000"
      }],
      showFoci: true,
      showCenter: true,
      showVertices: true,
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = conicSection.schema.conics.safeParse(validInput.conics);
    expect(result.success).toBe(true);
  });

  it("should validate parabola input", () => {
    const validInput = {
      conics: [{
        type: "parabola",
        vertex: { x: 0, y: 0 },
        p: 2,
        orientation: "vertical",
        color: "#00ff00"
      }],
      showFoci: true,
      showDirectrix: true,
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = conicSection.schema.conics.safeParse(validInput.conics);
    expect(result.success).toBe(true);
  });

  it("should validate hyperbola input", () => {
    const validInput = {
      conics: [{
        type: "hyperbola",
        center: { x: 0, y: 0 },
        a: 3,
        b: 4,
        orientation: "horizontal",
        color: "#ff00ff"
      }],
      showFoci: true,
      showAsymptotes: true,
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = conicSection.schema.conics.safeParse(validInput.conics);
    expect(result.success).toBe(true);
  });

  it("should validate general conic equation", () => {
    const validInput = {
      generalConics: [{
        A: 1,
        B: 0,
        C: 1,
        D: 0,
        E: 0,
        F: -25,
        color: "#009900",
        name: "Circle: x² + y² = 25"
      }],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = conicSection.schema.generalConics.safeParse(validInput.generalConics);
    expect(result.success).toBe(true);
  });

  it("should validate polynomial input", () => {
    const validInput = {
      polynomials: [{
        coefficients: [1, -2, 3, -1],
        color: "#ff6600",
        name: "P(x) = -x³ + 3x² - 2x + 1"
      }],
      showPolynomialRoots: true,
      showCriticalPoints: true,
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = conicSection.schema.polynomials.safeParse(validInput.polynomials);
    expect(result.success).toBe(true);
  });

  it("should validate multiple conics", () => {
    const validInput = {
      conics: [
        { type: "circle", radius: 3 },
        { type: "ellipse", a: 5, b: 3 },
        { type: "parabola", p: 2 },
        { type: "hyperbola", a: 3, b: 4 }
      ],
      generalConics: [
        { A: 1, B: 0, C: 1, D: 0, E: 0, F: -16 }
      ],
      polynomials: [
        { coefficients: [0, 1, -1] },
        { coefficients: [1, 0, 0, 1] }
      ],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result1 = conicSection.schema.conics.safeParse(validInput.conics);
    const result2 = conicSection.schema.generalConics.safeParse(validInput.generalConics);
    const result3 = conicSection.schema.polynomials.safeParse(validInput.polynomials);
    
    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
    expect(result3.success).toBe(true);
  });

  it("should validate analysis options", () => {
    const validInput = {
      conics: [{ type: "ellipse", a: 5, b: 3 }],
      showFoci: true,
      showDirectrix: false,
      showAsymptotes: true,
      showCenter: true,
      showVertices: true,
      showEccentricity: false,
      showPolynomialRoots: true,
      showCriticalPoints: false,
      showInflectionPoints: false,
      degreeAnalysis: false,
      polarForm: false,
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = conicSection.schema.conics.safeParse(validInput.conics);
    expect(result.success).toBe(true);
  });

  it("should validate tangent lines", () => {
    const validInput = {
      conics: [{ type: "circle", radius: 5 }],
      showTangents: [
        { point: { x: 3, y: 4 }, conicIndex: 0 },
        { point: { x: -3, y: 4 } }
      ],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = conicSection.schema.showTangents.safeParse(validInput.showTangents);
    expect(result.success).toBe(true);
  });

  it("should validate intersection analysis", () => {
    const validInput = {
      conics: [
        { type: "circle", radius: 3 },
        { type: "ellipse", a: 5, b: 3 }
      ],
      intersectionAnalysis: {
        enabled: true,
        between: [0, 1]
      },
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = conicSection.schema.intersectionAnalysis.safeParse(validInput.intersectionAnalysis);
    expect(result.success).toBe(true);
  });

  it("should require valid conic types", () => {
    const invalidInput = {
      conics: [{
        type: "invalid_type",
        radius: 5
      }],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = conicSection.schema.conics.safeParse(invalidInput.conics);
    expect(result.success).toBe(false);
  });

  it("should validate orientation options", () => {
    const horizontalInput = {
      conics: [{
        type: "parabola",
        p: 2,
        orientation: "horizontal"
      }],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const verticalInput = {
      conics: [{
        type: "parabola",
        p: 2,
        orientation: "vertical"
      }],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result1 = conicSection.schema.conics.safeParse(horizontalInput.conics);
    const result2 = conicSection.schema.conics.safeParse(verticalInput.conics);
    
    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
  });
});