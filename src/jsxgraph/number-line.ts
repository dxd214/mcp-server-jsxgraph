import { z } from "zod";
import { zodToJsonSchema } from "../utils";
import {
  BoundingBoxSchema,
  JSXGraphAxisSchema,
  JSXGraphBackgroundColorSchema,
  JSXGraphGridSchema,
  JSXGraphHeightSchema,
  JSXGraphThemeSchema,
  JSXGraphTitleSchema,
  JSXGraphWidthSchema,
  KeepAspectRatioSchema,
  PanSchema,
  ShowCopyrightSchema,
  ShowNavigationSchema,
  ZoomSchema,
} from "./jsxgraph-base";

// Point types for number line
const PointTypeSchema = z
  .enum(["open", "closed"])
  .describe("Type of point: open circle (○) or closed circle (●)");

// Arrow types
const ArrowTypeSchema = z
  .enum(["none", "left", "right", "both"])
  .describe("Arrow direction: none, left (←), right (→), or both (↔)");

// Point schema for individual points on number line
const NumberLinePointSchema = z.object({
  value: z.number().describe("Position on the number line"),
  type: PointTypeSchema.default("closed"),
  color: z
    .string()
    .optional()
    .default("#0066cc")
    .describe("Color of the point"),
  size: z.number().optional().default(6).describe("Size of the point"),
  label: z
    .string()
    .optional()
    .describe("Label to display above/below the point"),
});

// Interval schema for shaded regions
const IntervalSchema = z.object({
  start: z.number().describe("Start value of the interval"),
  end: z.number().describe("End value of the interval"),
  startType: PointTypeSchema.default("closed").describe("Type of start point"),
  endType: PointTypeSchema.default("closed").describe("Type of end point"),
  color: z
    .string()
    .optional()
    .default("#0066cc")
    .describe("Color of the interval shading"),
  opacity: z
    .number()
    .optional()
    .default(0.3)
    .describe("Opacity of the interval shading (0-1)"),
  arrow: ArrowTypeSchema.default("none").describe(
    "Arrow direction for the interval",
  ),
  label: z.string().optional().describe("Label for the interval"),
});

// Inequality schema for compound inequalities
const InequalitySchema = z.object({
  expression: z
    .string()
    .describe("Inequality expression, e.g., 'x > 2', 'x <= -1', '2 < x < 5'"),
  color: z
    .string()
    .optional()
    .default("#0066cc")
    .describe("Color for this inequality"),
  opacity: z
    .number()
    .optional()
    .default(0.3)
    .describe("Opacity of the shading (0-1)"),
});

// Number line input schema
const schema = {
  range: z
    .array(z.number())
    .length(2)
    .optional()
    .default([-10, 10])
    .describe("Range of the number line [min, max], default is [-10, 10]"),

  tickInterval: z
    .number()
    .optional()
    .default(1)
    .describe("Interval between tick marks on the number line"),

  showTicks: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show tick marks on the number line"),

  showNumbers: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to show numbers below tick marks"),

  points: z
    .array(NumberLinePointSchema)
    .optional()
    .describe("Individual points to plot on the number line"),

  intervals: z
    .array(IntervalSchema)
    .optional()
    .describe("Intervals (shaded regions) to display on the number line"),

  inequalities: z
    .array(InequalitySchema)
    .optional()
    .describe("Compound inequalities to solve and visualize automatically"),

  lineColor: z
    .string()
    .optional()
    .default("#000000")
    .describe("Color of the main number line"),

  lineWidth: z
    .number()
    .optional()
    .default(2)
    .describe("Width of the main number line"),

  // Base JSXGraph options
  theme: JSXGraphThemeSchema,
  backgroundColor: JSXGraphBackgroundColorSchema,
  grid: JSXGraphGridSchema.default(false), // Usually don't want grid for number line
  axis: JSXGraphAxisSchema.default(false), // Use custom axis for number line
  width: JSXGraphWidthSchema,
  height: JSXGraphHeightSchema.default(200), // Smaller height for number line
  title: JSXGraphTitleSchema,
  boundingBox: BoundingBoxSchema,
  keepAspectRatio: KeepAspectRatioSchema,
  showCopyright: ShowCopyrightSchema,
  showNavigation: ShowNavigationSchema,
  zoom: ZoomSchema,
  pan: PanSchema,
};

// Main input schema
const NumberLineInputSchema = z.object(schema);

type NumberLineInput = z.infer<typeof NumberLineInputSchema>;

/**
 * Parses inequality expressions and returns interval data
 */
function parseInequality(expression: string): {
  start: number | null;
  end: number | null;
  startType: "open" | "closed";
  endType: "open" | "closed";
  arrow: "none" | "left" | "right" | "both";
} {
  // Handle compound inequalities like "2 < x < 5" or "-1 <= x <= 3"
  const compoundMatch = expression.match(
    /(-?\d+(?:\.\d+)?)\s*([<>]=?)\s*x\s*([<>]=?)\s*(-?\d+(?:\.\d+)?)/,
  );
  if (compoundMatch) {
    const [, leftVal, leftOp, rightOp, rightVal] = compoundMatch;
    return {
      start: Number.parseFloat(leftVal),
      end: Number.parseFloat(rightVal),
      startType: leftOp.includes("=") ? "closed" : "open",
      endType: rightOp.includes("=") ? "closed" : "open",
      arrow: "none",
    };
  }

  // Handle single inequalities like "x > 2", "x <= -1"
  const singleMatch = expression.match(
    /x\s*([<>]=?)\s*(-?\d+(?:\.\d+)?)|(-?\d+(?:\.\d+)?)\s*([<>]=?)\s*x/,
  );
  if (singleMatch) {
    if (singleMatch[1] && singleMatch[2]) {
      // x op value
      const op = singleMatch[1];
      const val = Number.parseFloat(singleMatch[2]);
      if (op.startsWith(">")) {
        return {
          start: val,
          end: null,
          startType: op.includes("=") ? "closed" : "open",
          endType: "open",
          arrow: "right",
        };
      } else {
        return {
          start: null,
          end: val,
          startType: "open",
          endType: op.includes("=") ? "closed" : "open",
          arrow: "left",
        };
      }
    } else if (singleMatch[3] && singleMatch[4]) {
      // value op x
      const op = singleMatch[4];
      const val = Number.parseFloat(singleMatch[3]);
      if (op.startsWith(">")) {
        return {
          start: null,
          end: val,
          startType: "open",
          endType: op.includes("=") ? "closed" : "open",
          arrow: "left",
        };
      } else {
        return {
          start: val,
          end: null,
          startType: op.includes("=") ? "closed" : "open",
          endType: "open",
          arrow: "right",
        };
      }
    }
  }

  return {
    start: null,
    end: null,
    startType: "open",
    endType: "open",
    arrow: "none",
  };
}

/**
 * Generates the HTML and JavaScript for a number line visualization
 */
export function generateNumberLine(input: any): string {
  // Parse and validate input with defaults
  const validatedInput = NumberLineInputSchema.parse(input);
  const {
    range,
    tickInterval,
    showTicks,
    showNumbers,
    points = [],
    intervals = [],
    inequalities = [],
    lineColor,
    lineWidth,
    theme,
    backgroundColor,
    grid,
    axis,
    width,
    height,
    title,
    boundingBox,
    keepAspectRatio,
    showCopyright,
    showNavigation,
    zoom,
    pan,
  } = validatedInput;

  // Process inequalities into intervals
  const processedIntervals = [...intervals];
  inequalities.forEach((ineq, index) => {
    const parsed = parseInequality(ineq.expression);
    if (parsed.start !== null || parsed.end !== null) {
      processedIntervals.push({
        start: parsed.start ?? range[0] - 1000,
        end: parsed.end ?? range[1] + 1000,
        startType: parsed.startType,
        endType: parsed.endType,
        arrow: parsed.arrow,
        color: ineq.color || `hsl(${index * 60}, 70%, 50%)`,
        opacity: ineq.opacity || 0.3,
        label: ineq.expression,
      });
    }
  });

  const jsxGraphConfig = {
    boundingbox: boundingBox,
    keepaspectratio: keepAspectRatio,
    axis: axis,
    grid: grid,
    showCopyright: showCopyright,
    showNavigation: showNavigation,
    zoom: zoom
      ? {
          enabled: zoom.enabled,
          factorX: zoom.factorX,
          factorY: zoom.factorY,
          wheel: zoom.wheel,
          needshift: zoom.needShift,
          min: zoom.min,
          max: zoom.max,
        }
      : undefined,
    pan: pan
      ? {
          enabled: pan.enabled,
          needshift: pan.needShift,
          needtwofingers: pan.needTwoFingers,
        }
      : undefined,
  };

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title || "Number Line Visualization"}</title>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/jsxgraph@1.8.0/distrib/jsxgraphcore.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: ${backgroundColor};
        }
        .jxgbox {
            border: 1px solid #ccc;
            border-radius: 8px;
        }
        h1 {
            text-align: center;
            margin-bottom: 20px;
            color: #333;
        }
    </style>
</head>
<body>
    ${title ? `<h1>${title}</h1>` : ""}
    <div id="jxgbox" class="jxgbox" style="width:${width}px; height:${height}px; margin: 0 auto;"></div>
    
    <script type="text/javascript">
        const board = JXG.JSXGraph.initBoard('jxgbox', ${JSON.stringify(jsxGraphConfig)});
        
        // Draw main number line
        const yPos = 0;
        const line = board.create('line', [[${range[0]}, yPos], [${range[1]}, yPos]], {
            strokeColor: '${lineColor}',
            strokeWidth: ${lineWidth},
            fixed: true,
            highlight: false,
            withLabel: false
        });
        
        // Draw tick marks and numbers
        ${
          showTicks || showNumbers
            ? `
        for (let x = ${range[0]}; x <= ${range[1]}; x += ${tickInterval}) {
            if (x >= ${range[0]} && x <= ${range[1]}) {
                ${
                  showTicks
                    ? `
                // Tick mark
                board.create('segment', [[x, -0.2], [x, 0.2]], {
                    strokeColor: '${lineColor}',
                    strokeWidth: 1,
                    fixed: true,
                    highlight: false
                });
                `
                    : ""
                }
                
                ${
                  showNumbers
                    ? `
                // Number label
                board.create('text', [x, -0.5, x.toString()], {
                    fontSize: 12,
                    color: '${lineColor}',
                    fixed: true,
                    highlight: false,
                    anchorX: 'middle',
                    anchorY: 'top'
                });
                `
                    : ""
                }
            }
        }
        `
            : ""
        }
        
        // Draw intervals (shaded regions)
        ${processedIntervals
          .map(
            (interval, index) => `
        (() => {
            const start = ${interval.start};
            const end = ${interval.end};
            const color = '${interval.color}';
            const opacity = ${interval.opacity};
            
            // Clamp to visible range
            const visibleStart = Math.max(start, ${range[0]});
            const visibleEnd = Math.min(end, ${range[1]});
            
            // Draw shaded region
            if (visibleStart < visibleEnd) {
                const polygon = board.create('polygon', [
                    [visibleStart, -0.3],
                    [visibleEnd, -0.3],
                    [visibleEnd, 0.3],
                    [visibleStart, 0.3]
                ], {
                    fillColor: color,
                    fillOpacity: opacity,
                    strokeColor: color,
                    strokeWidth: 0,
                    fixed: true,
                    highlight: false,
                    withLines: false,
                    vertices: {visible: false}
                });
            }
            
            // Draw start point if in range
            if (start >= ${range[0]} && start <= ${range[1]}) {
                board.create('point', [start, yPos], {
                    name: '',
                    size: 6,
                    fillColor: '${interval.startType}' === 'closed' ? color : '${backgroundColor}',
                    strokeColor: color,
                    strokeWidth: 2,
                    fixed: true,
                    highlight: false,
                    showInfobox: false
                });
            }
            
            // Draw end point if in range
            if (end >= ${range[0]} && end <= ${range[1]}) {
                board.create('point', [end, yPos], {
                    name: '',
                    size: 6,
                    fillColor: '${interval.endType}' === 'closed' ? color : '${backgroundColor}',
                    strokeColor: color,
                    strokeWidth: 2,
                    fixed: true,
                    highlight: false,
                    showInfobox: false
                });
            }
            
            // Draw arrows
            const arrowType = '${interval.arrow}';
            if (arrowType === 'left' || arrowType === 'both') {
                if (start <= ${range[0]}) {
                    // Arrow pointing left from visible start
                    board.create('segment', [[${range[0]}, yPos], [${range[0]} + 0.5, yPos + 0.15]], {
                        strokeColor: color,
                        strokeWidth: 2,
                        fixed: true,
                        highlight: false,
                        lastArrow: false,
                        firstArrow: false
                    });
                    board.create('segment', [[${range[0]}, yPos], [${range[0]} + 0.5, yPos - 0.15]], {
                        strokeColor: color,
                        strokeWidth: 2,
                        fixed: true,
                        highlight: false,
                        lastArrow: false,
                        firstArrow: false
                    });
                }
            }
            
            if (arrowType === 'right' || arrowType === 'both') {
                if (end >= ${range[1]}) {
                    // Arrow pointing right from visible end
                    board.create('segment', [[${range[1]}, yPos], [${range[1]} - 0.5, yPos + 0.15]], {
                        strokeColor: color,
                        strokeWidth: 2,
                        fixed: true,
                        highlight: false,
                        lastArrow: false,
                        firstArrow: false
                    });
                    board.create('segment', [[${range[1]}, yPos], [${range[1]} - 0.5, yPos - 0.15]], {
                        strokeColor: color,
                        strokeWidth: 2,
                        fixed: true,
                        highlight: false,
                        lastArrow: false,
                        firstArrow: false
                    });
                }
            }
            
            // Add label if provided
            ${
              interval.label
                ? `
            board.create('text', [${
              interval.start !== null && interval.end !== null
                ? `(${interval.start} + ${interval.end}) / 2`
                : interval.start !== null
                  ? `${interval.start} + 1`
                  : `${interval.end} - 1`
            }, 0.8, '${interval.label}'], {
                fontSize: 10,
                color: color,
                fixed: true,
                highlight: false,
                anchorX: 'middle',
                anchorY: 'bottom'
            });
            `
                : ""
            }
        })();
        `,
          )
          .join("\n")}
        
        // Draw individual points
        ${points
          .map(
            (point, index) => `
        board.create('point', [${point.value}, yPos], {
            name: ${point.label ? `'${point.label}'` : "''"},
            size: ${point.size},
            fillColor: '${point.type}' === 'closed' ? '${point.color}' : '${backgroundColor}',
            strokeColor: '${point.color}',
            strokeWidth: 2,
            fixed: true,
            highlight: false,
            showInfobox: false,
            withLabel: ${point.label ? "true" : "false"},
            label: {
                offset: [0, 20],
                anchorX: 'middle',
                anchorY: 'bottom',
                fontSize: 10,
                color: '${point.color}'
            }
        });
        `,
          )
          .join("\n")}
        
        board.update();
    </script>
</body>
</html>`;
}

export const numberLine = {
  tool: {
    name: "number-line",
    description:
      "Create number line visualizations with open/closed circles, interval shading, arrows, and support for compound inequalities. Perfect for visualizing solutions to inequalities, intervals, and number sets.",
    inputSchema: zodToJsonSchema(schema),
  },
  execute: generateNumberLine,
};
