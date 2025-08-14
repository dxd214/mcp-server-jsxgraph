import { describe, test, expect } from "vitest";
import * as Charts from "../../src/jsxgraph";

describe("Number Line Tool", () => {
  const numberLine = Charts["number-line"];
  
  describe("工具元数据", () => {
    test("应该具有正确的工具元数据", () => {
      expect(numberLine.tool.name).toBe("generate_number_line");
      expect(numberLine.tool.description).toContain("number line visualizations");
      expect(numberLine.tool.description).toContain("open/closed circles");
      expect(numberLine.tool.description).toContain("interval shading");
      expect(numberLine.tool.description).toContain("compound inequalities");
      expect(numberLine.tool.inputSchema).toBeDefined();
    });
  });

  describe("Schema 结构验证", () => {
    test("应该具有有效的 schema 结构", () => {
      expect(numberLine.schema).toBeDefined();
      expect(typeof numberLine.schema).toBe("object");
      
      // 检查必需字段
      expect(numberLine.schema.range).toBeDefined();
      expect(numberLine.schema.points).toBeDefined();
      expect(numberLine.schema.intervals).toBeDefined();
      expect(numberLine.schema.inequalities).toBeDefined();
      
      // 检查新增字段
      expect(numberLine.schema.style).toBeDefined();
      expect(numberLine.schema.axisXTitle).toBeDefined();
      expect(numberLine.schema.axisYTitle).toBeDefined();
    });

    test("应该具有正确的默认值", () => {
      const { z } = require("zod");
      const schema = z.object(numberLine.schema);
      
      // 测试默认值
      const result = schema.safeParse({});
      expect(result.success).toBe(true);
      
      if (result.success) {
        const data = result.data;
        expect(data.range).toEqual([-10, 10]);
        expect(data.tickInterval).toBe(1);
        expect(data.showTicks).toBe(true);
        expect(data.showNumbers).toBe(true);
        expect(data.showSetNotation).toBe(true);
        expect(data.showIntervalNotation).toBe(true);
        expect(data.autoAnalyze).toBe(true);
        expect(data.lineColor).toBe("#000000");
        expect(data.lineWidth).toBe(2);
        expect(data.axisXTitle).toBe("x");
        expect(data.axisYTitle).toBe("y");
      }
    });
  });

  describe("基本输入验证", () => {
    test("应该验证基本输入", () => {
      const { z } = require("zod");
      const input = {
        range: [-10, 10],
        points: [{ value: 0, type: "closed", color: "#ff0000" }]
      };
      
      const result = z.object(numberLine.schema).safeParse(input);
      expect(result.success).toBe(true);
    });

    test("应该验证复杂输入", () => {
      const { z } = require("zod");
      const input = {
        range: [-5, 5],
        tickInterval: 0.5,
        showTicks: false,
        showNumbers: false,
        title: "Custom Number Line"
      };
      
      const result = z.object(numberLine.schema).safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("点数据验证", () => {
    test("应该验证点输入", () => {
      const { z } = require("zod");
      const input = {
        points: [
          { value: 0, type: "closed", color: "#ff0000", size: 8, label: "Origin" },
          { value: 3, type: "open", color: "#00ff00" }
        ]
      };
      
      const result = z.object(numberLine.schema).safeParse(input);
      expect(result.success).toBe(true);
    });

    test("应该验证点的默认值", () => {
      const { z } = require("zod");
      const input = {
        points: [{ value: 5 }] // 只提供必需字段
      };
      
      const result = z.object(numberLine.schema).safeParse(input);
      expect(result.success).toBe(true);
      
      if (result.success) {
        const point = result.data.points?.[0];
        expect(point?.type).toBe("closed");
        expect(point?.color).toBe("#0066cc");
        expect(point?.size).toBe(6);
      }
    });
  });

  describe("区间数据验证", () => {
    test("应该验证区间输入", () => {
      const { z } = require("zod");
      const input = {
        intervals: [
          {
            start: 1,
            end: 4,
            startType: "closed",
            endType: "open",
            color: "#0066cc",
            opacity: 0.5,
            arrow: "both",
            label: "Interval [1,4)",
          },
        ],
      };
      
      const result = z.object(numberLine.schema).safeParse(input);
      expect(result.success).toBe(true);
    });

    test("应该验证区间的默认值", () => {
      const { z } = require("zod");
      const input = {
        intervals: [{ start: 0, end: 5 }] // 只提供必需字段
      };
      
      const result = z.object(numberLine.schema).safeParse(input);
      expect(result.success).toBe(true);
      
      if (result.success) {
        const interval = result.data.intervals?.[0];
        expect(interval?.startType).toBe("closed");
        expect(interval?.endType).toBe("closed");
        expect(interval?.color).toBe("#0066cc");
        expect(interval?.opacity).toBe(0.3);
        expect(interval?.arrow).toBe("none");
      }
    });
  });

  describe("不等式验证", () => {
    test("应该验证简单不等式", () => {
      const { z } = require("zod");
      const input = {
        inequalities: [
          { expression: "x > 3", color: "#ff0000" },
          { expression: "x <= -2", color: "#00ff00" },
        ],
      };
      
      const result = z.object(numberLine.schema).safeParse(input);
      expect(result.success).toBe(true);
    });

    test("应该验证复合不等式", () => {
      const { z } = require("zod");
      const input = {
        inequalities: [
          {
            type: "compound",
            expressions: ["x > 0", "x < 10"],
            operator: "and",
            color: "#0066cc"
          }
        ]
      };
      
      const result = z.object(numberLine.schema).safeParse(input);
      expect(result.success).toBe(true);
    });

    test("应该验证绝对不等式", () => {
      const { z } = require("zod");
      const input = {
        inequalities: [
          {
            type: "absolute",
            expression: "|x| < 3",
            color: "#ff6600"
          }
        ]
      };
      
      const result = z.object(numberLine.schema).safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("样式配置验证", () => {
    test("应该验证样式配置", () => {
      const { z } = require("zod");
      const input = {
        style: {
          theme: "dark",
          backgroundColor: "#1a1a1a",
          grid: false,
          axis: false
        }
      };
      
      const result = z.object(numberLine.schema).safeParse(input);
      expect(result.success).toBe(true);
    });

    test("应该验证样式的默认值", () => {
      const { z } = require("zod");
      const input = {
        style: {} // 空样式对象
      };
      
      const result = z.object(numberLine.schema).safeParse(input);
      expect(result.success).toBe(true);
      
      if (result.success) {
        const style = result.data.style;
        expect(style?.theme).toBe("default");
        expect(style?.backgroundColor).toBe("#ffffff");
        expect(style?.grid).toBe(true);
        expect(style?.axis).toBe(true);
      }
    });
  });

  describe("高级配置验证", () => {
    test("应该验证缩放配置", () => {
      const { z } = require("zod");
      const input = {
        zoom: {
          enabled: false,
          factorX: 2.0,
          factorY: 2.0,
          wheel: false
        }
      };
      
      const result = z.object(numberLine.schema).safeParse(input);
      expect(result.success).toBe(true);
    });

    test("应该验证平移配置", () => {
      const { z } = require("zod");
      const input = {
        pan: {
          enabled: true,
          needShift: true,
          needTwoFingers: true
        }
      };
      
      const result = z.object(numberLine.schema).safeParse(input);
      expect(result.success).toBe(true);
    });

    test("应该验证边界框配置", () => {
      const { z } = require("zod");
      const input = {
        boundingBox: [-5, 5, 5, -5],
        keepAspectRatio: true
      };
      
      const result = z.object(numberLine.schema).safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("错误输入处理", () => {
    test("应该拒绝无效的范围", () => {
      const { z } = require("zod");
      const input = {
        range: [10, -10] // 最大值小于最小值
      };
      
      const result = z.object(numberLine.schema).safeParse(input);
      expect(result.success).toBe(false);
    });

    test("应该拒绝无效的点值", () => {
      const { z } = require("zod");
      const input = {
        points: [{ value: "invalid" }] // 值应该是数字
      };
      
      const result = z.object(numberLine.schema).safeParse(input);
      expect(result.success).toBe(false);
    });

    test("应该拒绝无效的区间", () => {
      const { z } = require("zod");
      const input = {
        intervals: [{ start: 5, end: 3 }] // 开始值大于结束值
      };
      
      const result = z.object(numberLine.schema).safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});
