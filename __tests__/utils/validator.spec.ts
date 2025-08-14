import { describe, expect, it } from "vitest";
import { z } from "zod";
import * as Charts from "../../src/jsxgraph";

describe("validator", () => {
  it("should validate schema for number-line chart", () => {
    const chartType = "number-line";
    const chartModule = Charts[chartType] as any;
    expect(chartModule).toBeDefined();
    expect(chartModule.schema).toBeDefined();
    
    // Test with valid input
    const validInput = {
      range: [-10, 10],
      points: [{ value: 0, type: "closed", color: "#ff0000" }]
    };
    
    const result = z.object(chartModule.schema).safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("should validate schema for function-graph chart", () => {
    const chartType = "function-graph";
    const chartModule = Charts[chartType] as any;
    expect(chartModule).toBeDefined();
    expect(chartModule.schema).toBeDefined();
    
    // Test with valid input
    const validInput = {
      functions: [{ expression: "x^2", color: "#0066cc" }]
    };
    
    const result = z.object(chartModule.schema).safeParse(validInput);
    expect(result.success).toBe(true);
  });
});
