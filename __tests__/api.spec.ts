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
      "number-line-inequality",
    ]);
  });

  it("chart meta structure", () => {
    const { "function-graph": functionGraph } = API;
    expect(functionGraph.schema).toBeTypeOf("object");
    expect(functionGraph.tool).toBeTypeOf("object");
    expect(functionGraph.tool.name).toBeTypeOf("string");
    expect(functionGraph.tool.description).toBeTypeOf("string");
    expect(functionGraph.tool.inputSchema).toBeTypeOf("object");
  });
});
