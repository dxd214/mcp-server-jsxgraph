import puppeteer from "puppeteer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  type JSXGraphConfig,
  renderJSXGraph,
} from "../../src/utils/jsxgraph-renderer";

// Mock puppeteer
vi.mock("puppeteer");

describe("JSXGraph Renderer", () => {
  let mockBrowser: any;
  let mockPage: any;

  beforeEach(() => {
    // Setup mock page
    mockPage = {
      setViewport: vi.fn().mockResolvedValue(undefined),
      setContent: vi.fn().mockResolvedValue(undefined),
      waitForSelector: vi.fn().mockResolvedValue(undefined),
      screenshot: vi.fn().mockResolvedValue("mock-screenshot-base64"),
    };

    // Setup mock browser
    mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      close: vi.fn().mockResolvedValue(undefined),
    };

    // Mock puppeteer.launch
    vi.mocked(puppeteer.launch).mockResolvedValue(mockBrowser);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("renderJSXGraph", () => {
    it("should render a function graph", async () => {
      const config: JSXGraphConfig = {
        type: "function",
        width: 800,
        height: 600,
        boundingBox: [-10, 10, 10, -10],
        config: {
          functions: [
            {
              expression: "Math.sin(x)",
              color: "#0066cc",
              strokeWidth: 2,
              name: "sin(x)",
            },
          ],
          title: "Sine Function",
          axisXTitle: "x",
          axisYTitle: "y",
        },
      };

      const result = await renderJSXGraph(config);

      expect(result).toBe("data:image/png;base64,mock-screenshot-base64");
      expect(puppeteer.launch).toHaveBeenCalledWith({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      expect(mockPage.setViewport).toHaveBeenCalledWith({
        width: 800,
        height: 600,
      });
      expect(mockPage.setContent).toHaveBeenCalled();
      expect(mockPage.waitForSelector).toHaveBeenCalledWith("#jxgbox", {
        visible: true,
      });
      expect(mockPage.screenshot).toHaveBeenCalledWith({
        type: "png",
        encoding: "base64",
        clip: {
          x: 0,
          y: 0,
          width: 800,
          height: 600,
        },
      });
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it("should render a parametric curve", async () => {
      const config: JSXGraphConfig = {
        type: "parametric",
        width: 800,
        height: 600,
        boundingBox: [-5, 5, 5, -5],
        config: {
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
        },
      };

      const result = await renderJSXGraph(config);

      expect(result).toBe("data:image/png;base64,mock-screenshot-base64");
      expect(mockPage.setContent).toHaveBeenCalled();
      const htmlContent = mockPage.setContent.mock.calls[0][0];
      expect(htmlContent).toContain("Math.cos(t)");
      expect(htmlContent).toContain("Math.sin(t)");
    });

    it("should render a geometry diagram", async () => {
      const config: JSXGraphConfig = {
        type: "geometry",
        width: 800,
        height: 600,
        boundingBox: [-10, 10, 10, -10],
        config: {
          points: [
            { x: 0, y: 0, name: "A" },
            { x: 5, y: 0, name: "B" },
            { x: 2.5, y: 4, name: "C" },
          ],
          lines: [
            { point1: "A", point2: "B", type: "segment" },
            { point1: "B", point2: "C", type: "segment" },
            { point1: "C", point2: "A", type: "segment" },
          ],
        },
      };

      const result = await renderJSXGraph(config);

      expect(result).toBe("data:image/png;base64,mock-screenshot-base64");
      expect(mockPage.setContent).toHaveBeenCalled();
    });

    it("should render a vector field", async () => {
      const config: JSXGraphConfig = {
        type: "vector-field",
        width: 800,
        height: 600,
        boundingBox: [-5, 5, 5, -5],
        config: {
          fieldFunction: {
            dx: "-y",
            dy: "x",
          },
          density: 10,
          scale: 0.8,
        },
      };

      const result = await renderJSXGraph(config);

      expect(result).toBe("data:image/png;base64,mock-screenshot-base64");
      expect(mockPage.setContent).toHaveBeenCalled();
    });

    it("should handle render errors gracefully", async () => {
      const config: JSXGraphConfig = {
        type: "function",
        width: 800,
        height: 600,
        boundingBox: [-10, 10, 10, -10],
        config: {
          functions: [
            {
              expression: "Math.sin(x)",
            },
          ],
        },
      };

      // Mock screenshot to throw error
      mockPage.screenshot.mockRejectedValue(new Error("Screenshot failed"));

      await expect(renderJSXGraph(config)).rejects.toThrow("Screenshot failed");
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it("should include JSXGraph CDN and proper HTML structure", async () => {
      const config: JSXGraphConfig = {
        type: "function",
        width: 800,
        height: 600,
        boundingBox: [-10, 10, 10, -10],
        config: {
          functions: [
            {
              expression: "x^2",
            },
          ],
          style: {
            backgroundColor: "#f0f0f0",
          },
        },
      };

      await renderJSXGraph(config);

      const htmlContent = mockPage.setContent.mock.calls[0][0];

      // Check for JSXGraph CDN links
      expect(htmlContent).toContain("jsxgraph.css");
      expect(htmlContent).toContain("jsxgraphcore.js");

      // Check for proper HTML structure
      expect(htmlContent).toContain('<div id="jxgbox"></div>');
      expect(htmlContent).toContain("width: 800px");
      expect(htmlContent).toContain("height: 600px");
      expect(htmlContent).toContain("background-color: #f0f0f0");

      // Check for JSXGraph initialization
      expect(htmlContent).toContain("JXG.JSXGraph.initBoard");
      expect(htmlContent).toContain('"boundingbox":[-10,10,10,-10]');
    });
  });

  describe("HTML generation for different chart types", () => {
    it("should generate correct code for function with derivatives and integrals", async () => {
      const config: JSXGraphConfig = {
        type: "function",
        width: 800,
        height: 600,
        boundingBox: [-5, 5, 5, -5],
        config: {
          functions: [
            {
              expression: "x^2",
              color: "#0066cc",
            },
          ],
          showDerivative: true,
          showIntegral: true,
          integralBounds: [-2, 2],
          tangentAt: 1,
        },
      };

      await renderJSXGraph(config);

      const htmlContent = mockPage.setContent.mock.calls[0][0];

      // Check for derivative
      expect(htmlContent).toContain("JXG.Math.Numerics.D");

      // Check for integral
      expect(htmlContent).toContain("integral");
      expect(htmlContent).toContain("[-2, 2]");

      // Check for tangent
      expect(htmlContent).toContain("tangent");
      expect(htmlContent).toContain("glider");
    });

    it("should generate correct code for parametric curves with animation", async () => {
      const config: JSXGraphConfig = {
        type: "parametric",
        width: 800,
        height: 600,
        boundingBox: [-5, 5, 5, -5],
        config: {
          curves: [
            {
              xExpression: "3*Math.cos(t)",
              yExpression: "2*Math.sin(t)",
              tMin: 0,
              tMax: 2 * Math.PI,
            },
          ],
          showTrace: true,
          traceSpeed: 1,
        },
      };

      await renderJSXGraph(config);

      const htmlContent = mockPage.setContent.mock.calls[0][0];

      // Check for slider (used for animation)
      expect(htmlContent).toContain("slider");

      // Check for trace point
      expect(htmlContent).toContain("tracePoint");
    });

    it("should generate correct code for geometry with constructions", async () => {
      const config: JSXGraphConfig = {
        type: "geometry",
        width: 800,
        height: 600,
        boundingBox: [-10, 10, 10, -10],
        config: {
          points: [
            { x: 0, y: 0, name: "A" },
            { x: 5, y: 0, name: "B" },
          ],
          lines: [{ point1: "A", point2: "B", type: "line" }],
          construction: {
            perpendicular: [{ line: "A-B", throughPoint: "A" }],
            midpoint: [{ point1: "A", point2: "B", name: "M" }],
          },
        },
      };

      await renderJSXGraph(config);

      const htmlContent = mockPage.setContent.mock.calls[0][0];

      // Check for perpendicular
      expect(htmlContent).toContain("perpendicular");

      // Check for midpoint
      expect(htmlContent).toContain("midpoint");
    });

    it("should generate correct code for vector field with streamlines", async () => {
      const config: JSXGraphConfig = {
        type: "vector-field",
        width: 800,
        height: 600,
        boundingBox: [-5, 5, 5, -5],
        config: {
          fieldFunction: {
            dx: "y",
            dy: "-x",
          },
          streamlines: [
            {
              startX: 1,
              startY: 1,
              color: "#ff0000",
              steps: 100,
            },
          ],
          colorByMagnitude: true,
          showMagnitudeLegend: true,
        },
      };

      await renderJSXGraph(config);

      const htmlContent = mockPage.setContent.mock.calls[0][0];

      // Check for streamline code
      expect(htmlContent).toContain("streamPoints");

      // Check for magnitude-based coloring
      expect(htmlContent).toContain("hsl");
      expect(htmlContent).toContain("magnitude");

      // Check for legend
      expect(htmlContent).toContain("Magnitude");
    });
  });
});
