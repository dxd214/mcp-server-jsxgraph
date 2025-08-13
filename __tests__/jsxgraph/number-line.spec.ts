import { describe, expect, it } from "vitest";
import * as Charts from "../../src/jsxgraph";

describe("Number Line Tool", () => {
  const numberLine = Charts["number-line"];

  it("should create basic number line with default settings", () => {
    const input = {};
    const result = numberLine.execute(input);

    expect(result).toContain("<!DOCTYPE html>");
    expect(result).toContain("Number Line Visualization");
    expect(result).toContain("jsxgraphcore.js");
    expect(result).toContain("JXG.JSXGraph.initBoard");
  });

  it("should render number line with custom range and title", () => {
    const input = {
      range: [-5, 15],
      title: "Custom Number Line",
      tickInterval: 2,
    };
    const result = numberLine.execute(input);

    expect(result).toContain("<h1>Custom Number Line</h1>");
    expect(result).toContain("for (let x = -5; x <= 15; x += 2)");
    expect(result).toContain('"boundingbox":[-10,10,10,-10]');
  });

  it("should render individual points with open and closed circles", () => {
    const input = {
      points: [
        {
          value: 2,
          type: "closed" as const,
          color: "#ff0000",
          label: "Point A",
        },
        { value: 5, type: "open" as const, color: "#00ff00", label: "Point B" },
      ],
    };
    const result = numberLine.execute(input);

    expect(result).toContain("board.create('point', [2, yPos]");
    expect(result).toContain("board.create('point', [5, yPos]");
    expect(result).toContain("Point A");
    expect(result).toContain("Point B");
  });

  it("should render intervals with shading and endpoints", () => {
    const input = {
      intervals: [
        {
          start: 1,
          end: 4,
          startType: "closed" as const,
          endType: "open" as const,
          color: "#0066cc",
          opacity: 0.5,
          label: "Interval [1,4)",
        },
      ],
    };
    const result = numberLine.execute(input);

    expect(result).toContain("const start = 1;");
    expect(result).toContain("const end = 4;");
    expect(result).toContain("fillOpacity: opacity");
    expect(result).toContain("Interval [1,4)");
  });

  it("should render arrows for infinite intervals", () => {
    const input = {
      intervals: [
        {
          start: 3,
          end: 1000,
          startType: "open" as const,
          endType: "open" as const,
          arrow: "right" as const,
          color: "#ff6600",
        },
      ],
    };
    const result = numberLine.execute(input);

    expect(result).toContain("const arrowType = 'right';");
    expect(result).toContain(
      "if (arrowType === 'right' || arrowType === 'both')",
    );
  });

  it("should parse simple inequalities correctly", () => {
    const input = {
      inequalities: [
        { expression: "x > 3", color: "#ff0000" },
        { expression: "x <= -2", color: "#00ff00" },
      ],
    };
    const result = numberLine.execute(input);

    // Should create intervals from parsed inequalities
    expect(result).toContain("'x > 3'");
    expect(result).toContain("'x <= -2'");
  });

  it("should parse compound inequalities correctly", () => {
    const input = {
      inequalities: [
        { expression: "2 < x < 5", color: "#ff0000" },
        { expression: "-3 <= x <= 1", color: "#00ff00" },
      ],
    };
    const result = numberLine.execute(input);

    expect(result).toContain("'2 < x < 5'");
    expect(result).toContain("'-3 <= x <= 1'");
  });

  it("should handle multiple overlapping intervals", () => {
    const input = {
      intervals: [
        { start: 0, end: 5, color: "#ff000080", opacity: 0.3 },
        { start: 3, end: 8, color: "#00ff0080", opacity: 0.3 },
      ],
    };
    const result = numberLine.execute(input);

    expect(result).toContain("const start = 0;");
    expect(result).toContain("const start = 3;");
    expect(result).toContain("fillOpacity: opacity");
  });

  it("should disable ticks and numbers when requested", () => {
    const input = {
      showTicks: false,
      showNumbers: false,
    };
    const result = numberLine.execute(input);

    // Should not contain tick generation code
    expect(result).not.toContain("Tick mark");
    expect(result).not.toContain("Number label");
  });

  it("should handle custom styling options", () => {
    const input = {
      lineColor: "#purple",
      lineWidth: 3,
      backgroundColor: "#f0f0f0",
      width: 1000,
      height: 150,
    };
    const result = numberLine.execute(input);

    expect(result).toContain("strokeColor: '#purple'");
    expect(result).toContain("strokeWidth: 3");
    expect(result).toContain("background-color: #f0f0f0");
    expect(result).toContain("width:1000px; height:150px");
  });

  it("should have correct tool metadata", () => {
    expect(numberLine.tool.name).toBe("number-line");
    expect(numberLine.tool.description).toContain("number line visualizations");
    expect(numberLine.tool.description).toContain("open/closed circles");
    expect(numberLine.tool.description).toContain("interval shading");
    expect(numberLine.tool.description).toContain("compound inequalities");
    expect(numberLine.tool.inputSchema).toBeDefined();
    expect(numberLine.tool.inputSchema.type).toBe("object");
  });
});
