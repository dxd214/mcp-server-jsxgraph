import { describe, expect, it } from "vitest";
import * as API from "../src/sdk";

describe("sdk API", () => {
  it("callTool", () => {
    expect(API.callTool).instanceOf(Function);
  });

  it("chart meta", () => {
    const { callTool, ...charts } = API;
    expect(Object.keys(charts)).toEqual([
      "function-graph",
      "parametric-curve",
      "geometry-diagram",
      "vector-field",
      "linear-system",
      "function-transformation",
      "quadratic-analysis",
      "exponential-logarithm",
      "rational-function",
      "equation-system",
      "conic-section",
      "polynomial-steps",
      "polynomial-complete",
      "number-line",
      "function-properties",
    ]);
  });

  it("chart meta structure", () => {
    const charts = API["function-graph"]; // Use an existing tool
    expect(charts.schema).toBeTypeOf("object");
    expect(charts.tool).toBeTypeOf("object");
    expect(charts.tool.name).toBeTypeOf("string");
    expect(charts.tool.description).toBeTypeOf("string");
    expect(charts.tool.inputSchema).toBeTypeOf("object");
  });
});
