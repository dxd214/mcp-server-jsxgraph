import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { callTool } from "../src/utils/callTool";
import * as jsxgraphRenderer from "../src/utils/jsxgraph-renderer";

// Mock the JSXGraph renderer
vi.mock("../src/utils/jsxgraph-renderer");

// Mock the generate functions for regular charts
vi.mock("../src/utils/generate", () => ({
  generateChartUrl: vi.fn().mockResolvedValue("https://example.com/chart.png"),
  generateMap: vi.fn().mockResolvedValue({
    metadata: {},
    content: [{ type: "text", text: "Map result" }],
  }),
}));

describe("JSXGraph Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock renderJSXGraph to return a base64 image
    vi.mocked(jsxgraphRenderer.renderJSXGraph).mockResolvedValue(
      "data:image/png;base64,mock-jsxgraph-image",
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Function Graph", () => {
    it("should generate a simple function graph", async () => {
      const result = await callTool("generate_function_graph", {
        functions: [
          {
            expression: "Math.sin(x)",
            color: "#0066cc",
            name: "sin(x)",
          },
        ],
        width: 800,
        height: 600,
        title: "Sine Function",
      });

      expect(result.content).toEqual([
        {
          type: "text",
          text: "data:image/png;base64,mock-jsxgraph-image",
        },
      ]);

      expect(jsxgraphRenderer.renderJSXGraph).toHaveBeenCalledWith({
        type: "function",
        width: 800,
        height: 600,
        boundingBox: [-10, 10, 10, -10],
        config: expect.objectContaining({
          functions: expect.arrayContaining([
            expect.objectContaining({
              expression: "Math.sin(x)",
            }),
          ]),
          title: "Sine Function",
        }),
      });
    });

    it("should handle multiple functions with derivatives and integrals", async () => {
      const result = await callTool("generate_function_graph", {
        functions: [
          { expression: "x^2", color: "#0066cc", name: "f(x)" },
          { expression: "2*x", color: "#ff0000", name: "g(x)" },
        ],
        showDerivative: true,
        showIntegral: true,
        integralBounds: [-2, 2],
        boundingBox: [-5, 5, 5, -5],
      });

      expect(result.content[0].text).toContain("data:image/png;base64");
      expect(jsxgraphRenderer.renderJSXGraph).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "function",
          boundingBox: [-5, 5, 5, -5],
        }),
      );
    });
  });

  describe("Parametric Curve", () => {
    it("should generate a parametric curve", async () => {
      const result = await callTool("generate_parametric_curve", {
        curves: [
          {
            xExpression: "Math.cos(t)",
            yExpression: "Math.sin(t)",
            tMin: 0,
            tMax: 2 * Math.PI,
            color: "#ff0000",
            name: "Circle",
          },
        ],
        showTrace: true,
      });

      expect(result.content[0].text).toContain("data:image/png;base64");
      expect(jsxgraphRenderer.renderJSXGraph).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "parametric",
          config: expect.objectContaining({
            curves: expect.arrayContaining([
              expect.objectContaining({
                xExpression: "Math.cos(t)",
                yExpression: "Math.sin(t)",
              }),
            ]),
            showTrace: true,
          }),
        }),
      );
    });
  });

  describe("Geometry Diagram", () => {
    it("should generate a geometry diagram with triangle", async () => {
      const result = await callTool("generate_geometry_diagram", {
        points: [
          { x: 0, y: 0, name: "A" },
          { x: 4, y: 0, name: "B" },
          { x: 2, y: 3, name: "C" },
        ],
        lines: [
          { point1: "A", point2: "B", type: "segment" },
          { point1: "B", point2: "C", type: "segment" },
          { point1: "C", point2: "A", type: "segment" },
        ],
        angles: [{ point1: "B", vertex: "A", point2: "C", radius: 30 }],
      });

      expect(result.content[0].text).toContain("data:image/png;base64");
      expect(jsxgraphRenderer.renderJSXGraph).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "geometry",
          config: expect.objectContaining({
            points: expect.arrayContaining([
              expect.objectContaining({ x: 0, y: 0, name: "A" }),
            ]),
          }),
        }),
      );
    });
  });

  describe("Vector Field", () => {
    it("should generate a vector field", async () => {
      const result = await callTool("generate_vector_field", {
        fieldFunction: {
          dx: "-y",
          dy: "x",
        },
        density: 10,
        scale: 0.8,
        colorByMagnitude: true,
      });

      expect(result.content[0].text).toContain("data:image/png;base64");
      expect(jsxgraphRenderer.renderJSXGraph).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "vector-field",
          config: expect.objectContaining({
            fieldFunction: {
              dx: "-y",
              dy: "x",
            },
            colorByMagnitude: true,
          }),
        }),
      );
    });
  });

  describe("Linear System", () => {
    it("should generate a linear system visualization", async () => {
      const result = await callTool("generate_linear_system", {
        equations: [
          { a: 2, b: 1, c: 5, color: "#0066cc", name: "2x + y = 5" },
          { a: 1, b: -1, c: 1, color: "#ff0000", name: "x - y = 1" },
        ],
        showIntersections: true,
      });

      expect(result.content[0].text).toContain("data:image/png;base64");
      expect(jsxgraphRenderer.renderJSXGraph).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "function",
          config: expect.objectContaining({
            equations: expect.arrayContaining([
              expect.objectContaining({ a: 2, b: 1, c: 5 }),
            ]),
          }),
        }),
      );
    });

    it("should handle linear inequalities with feasible regions", async () => {
      const result = await callTool("generate_linear_system", {
        inequalities: [
          { a: 1, b: 1, c: 6, type: "<=", fillColor: "#0066cc" },
          { a: 2, b: 1, c: 8, type: "<=", fillColor: "#ff0000" },
          { a: 1, b: 0, c: 0, type: ">=", fillColor: "#00ff00" },
          { a: 0, b: 1, c: 0, type: ">=", fillColor: "#ffff00" },
        ],
        showFeasibleRegion: true,
      });

      expect(result.content[0].text).toContain("data:image/png;base64");
    });
  });

  describe("Quadratic Analysis", () => {
    it("should generate quadratic function analysis", async () => {
      const result = await callTool("generate_quadratic_analysis", {
        quadratics: [
          { a: 1, b: -2, c: -3, color: "#0066cc", name: "f(x) = x² - 2x - 3" },
        ],
        showVertex: true,
        showRoots: true,
        showAxisOfSymmetry: true,
      });

      expect(result.content[0].text).toContain("data:image/png;base64");
      expect(jsxgraphRenderer.renderJSXGraph).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "function",
          config: expect.objectContaining({
            quadratics: expect.arrayContaining([
              expect.objectContaining({ a: 1, b: -2, c: -3 }),
            ]),
          }),
        }),
      );
    });
  });

  describe("Exponential and Logarithm", () => {
    it("should generate exponential and logarithmic functions", async () => {
      const result = await callTool("generate_exponential_logarithm", {
        functions: [
          { type: "exponential", base: Math.E, coefficient: 1 },
          { type: "logarithm", base: Math.E, coefficient: 1 },
        ],
        showAsymptotes: true,
        showInverse: true,
      });

      expect(result.content[0].text).toContain("data:image/png;base64");
    });
  });

  describe("Rational Function", () => {
    it("should generate rational function with asymptotes", async () => {
      const result = await callTool("generate_rational_function", {
        rationalFunctions: [
          {
            numerator: "x^2 - 1",
            denominator: "x - 1",
            color: "#0066cc",
          },
        ],
        showVerticalAsymptotes: true,
        showHorizontalAsymptotes: true,
        showHoles: true,
      });

      expect(result.content[0].text).toContain("data:image/png;base64");
    });
  });

  describe("Equation System", () => {
    it("should generate system of equations", async () => {
      const result = await callTool("generate_equation_system", {
        systems: [
          {
            equations: [
              { expression: "x^2 + y^2 - 25", type: "implicit" },
              { expression: "x + y - 5", type: "implicit" },
            ],
            color: "#ff6600",
            name: "Circle and Line",
          },
        ],
        showIntersections: true,
        numericalSolutions: { show: true, precision: 4 },
      });

      expect(result.content[0].text).toContain("data:image/png;base64");
    });
  });

  describe("Conic Section", () => {
    it("should generate conic sections", async () => {
      const result = await callTool("generate_conic_section", {
        conics: [
          {
            type: "ellipse",
            center: { x: 0, y: 0 },
            a: 4,
            b: 3,
            color: "#0066cc",
          },
          {
            type: "hyperbola",
            center: { x: 0, y: 0 },
            a: 2,
            b: 2,
            color: "#ff0000",
          },
        ],
        showFoci: true,
        showAsymptotes: true,
      });

      expect(result.content[0].text).toContain("data:image/png;base64");
    });

    it("should handle general conic equations", async () => {
      const result = await callTool("generate_conic_section", {
        generalConics: [
          {
            A: 1,
            B: 0,
            C: 1,
            D: -2,
            E: -4,
            F: -20,
            color: "#009900",
          },
        ],
        showCenter: true,
        showVertices: true,
      });

      expect(result.content[0].text).toContain("data:image/png;base64");
    });
  });

  describe("Function Transformation", () => {
    it("should generate function transformations", async () => {
      const result = await callTool("generate_function_transformation", {
        baseFunction: {
          expression: "x^2",
          color: "#0066cc",
          name: "f(x)",
        },
        transformations: [
          {
            type: "translate",
            parameters: { h: 2, k: 3 },
            color: "#ff0000",
            name: "f(x-2) + 3",
          },
          {
            type: "scale",
            parameters: { a: 2, b: 0.5 },
            color: "#00ff00",
            name: "2f(0.5x)",
          },
        ],
        showSteps: true,
        animateTransformation: true,
      });

      expect(result.content[0].text).toContain("data:image/png;base64");
      expect(jsxgraphRenderer.renderJSXGraph).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "function",
          config: expect.objectContaining({
            baseFunction: expect.objectContaining({
              expression: "x^2",
            }),
            transformations: expect.arrayContaining([
              expect.objectContaining({
                type: "translate",
              }),
            ]),
          }),
        }),
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid parameters gracefully", async () => {
      await expect(
        callTool("generate_function_graph", {
          // Missing required 'functions' field
          width: 800,
          height: 600,
        }),
      ).rejects.toThrow(/Invalid parameters/);
    });

    it("should handle renderer errors", async () => {
      vi.mocked(jsxgraphRenderer.renderJSXGraph).mockRejectedValue(
        new Error("Renderer failed"),
      );

      await expect(
        callTool("generate_function_graph", {
          functions: [{ expression: "x^2" }],
        }),
      ).rejects.toThrow(/Failed to generate chart.*Renderer failed/);
    });
  });
});
