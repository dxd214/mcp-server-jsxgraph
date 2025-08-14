import { describe, expect, it } from "vitest";
import { vectorField } from "../../src/jsxgraph/vector-field";

describe("Vector Field", () => {
  it("should have the correct schema structure", () => {
    expect(vectorField.schema).toBeDefined();
    expect(vectorField.tool).toBeDefined();
    expect(vectorField.tool.name).toBe("generate_vector_field");
  });

  it("should validate basic vector field input", () => {
    const validInput = {
      fieldFunction: {
        dx: "y",
        dy: "-x"
      },
      density: 10,
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = vectorField.schema.fieldFunction.safeParse(validInput.fieldFunction);
    expect(result.success).toBe(true);
  });

  it("should validate vector components", () => {
    const validInput = {
      fieldFunction: {
        dx: "x^2 + y",
        dy: "x - y^2"
      }
    };

    const result = vectorField.schema.fieldFunction.safeParse(validInput.fieldFunction);
    expect(result.success).toBe(true);
  });

  it("should validate density parameter", () => {
    const validInput = {
      density: 15
    };

    const result = vectorField.schema.density.safeParse(validInput.density);
    expect(result.success).toBe(true);
  });

  it("should validate arrow style options", () => {
    const validInput = {
      arrowStyle: {
        color: "#ff0000",
        strokeWidth: 2,
        headSize: 6
      }
    };

    const result = vectorField.schema.arrowStyle.safeParse(validInput.arrowStyle);
    expect(result.success).toBe(true);
  });

  it("should validate streamlines", () => {
    const validInput = {
      streamlines: [
        { startX: 0, startY: 0, color: "#ff0000" },
        { startX: 1, startY: 1, color: "#00ff00", steps: 150 }
      ]
    };

    const result = vectorField.schema.streamlines.safeParse(validInput.streamlines);
    expect(result.success).toBe(true);
  });

  it("should validate scale parameter", () => {
    const validInput = {
      scale: 1.2
    };

    const result = vectorField.schema.scale.safeParse(validInput.scale);
    expect(result.success).toBe(true);
  });
});