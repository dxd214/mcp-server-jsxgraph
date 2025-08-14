import { describe, expect, it } from "vitest";
import { geometryDiagram } from "../../src/jsxgraph/geometry-diagram";

describe("Geometry Diagram", () => {
  it("should have the correct schema structure", () => {
    expect(geometryDiagram.schema).toBeDefined();
    expect(geometryDiagram.tool).toBeDefined();
    expect(geometryDiagram.tool.name).toBe("generate_geometry_diagram");
  });

  it("should validate basic point input", () => {
    const validInput = {
      points: [
        { x: 0, y: 0, name: "A", color: "#ff0000" },
        { x: 3, y: 4, name: "B", color: "#00ff00" }
      ],
      width: 800,
      height: 600,
      boundingBox: [-10, 10, 10, -10]
    };

    const result = geometryDiagram.schema.points.safeParse(validInput.points);
    expect(result.success).toBe(true);
  });

  it("should validate line input", () => {
    const validInput = {
      lines: [{
        points: ["A", "B"],
        color: "#0066cc",
        strokeWidth: 2,
        name: "Line AB"
      }]
    };

    const result = geometryDiagram.schema.lines.safeParse(validInput.lines);
    expect(result.success).toBe(true);
  });

  it("should validate circle input", () => {
    const validInput = {
      circles: [{
        center: "O",
        radius: 5,
        color: "#ff6600",
        name: "Circle O"
      }]
    };

    const result = geometryDiagram.schema.circles.safeParse(validInput.circles);
    expect(result.success).toBe(true);
  });

  it("should validate polygon input", () => {
    const validInput = {
      polygons: [{
        points: ["A", "B", "C"],
        fillColor: "#ccffcc",
        fillOpacity: 0.3,
        name: "Triangle ABC"
      }]
    };

    const result = geometryDiagram.schema.polygons.safeParse(validInput.polygons);
    expect(result.success).toBe(true);
  });

  it("should validate measurement options", () => {
    const validInput = {
      measurements: {
        showLengths: true,
        showAngles: true,
        showAreas: false,
        showPerimeters: true
      }
    };

    const result = geometryDiagram.schema.measurements.safeParse(validInput.measurements);
    expect(result.success).toBe(true);
  });

  it("should validate construction options", () => {
    const validInput = {
      constructions: {
        showPerpendiculars: true,
        showBisectors: false,
        showParallels: true,
        showMedians: false
      }
    };

    const result = geometryDiagram.schema.constructions.safeParse(validInput.constructions);
    expect(result.success).toBe(true);
  });
});