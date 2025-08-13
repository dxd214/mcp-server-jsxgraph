import { z } from "zod";
import { zodToJsonSchema, MathAnalysisEngine } from "../utils";
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

// Enhanced inequality schema for compound inequalities
const InequalitySchema = z.object({
  type: z
    .enum(["simple", "compound", "absolute"])
    .optional()
    .default("simple")
    .describe("Type of inequality: simple, compound, or absolute value"),
  expression: z
    .string()
    .describe("Inequality expression, e.g., 'x > 2', 'x < -1 or x > 3', '|x| < 2'"),
  expressions: z
    .array(z.string())
    .optional()
    .describe("Array of inequality expressions for compound inequalities"),
  operator: z
    .enum(["and", "or"])
    .optional()
    .describe("Logical operator for compound inequalities: 'and' or 'or'"),
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
  label: z
    .string()
    .optional()
    .describe("Custom label for the inequality"),
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

  // Enhanced display options
  showSetNotation: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to display set notation {x | condition}"),

  showIntervalNotation: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to display interval notation [a, b], (a, b), etc."),

  showWorkSpace: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to show step-by-step solution workspace"),

  autoAnalyze: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to automatically analyze and parse inequality expressions"),

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
 * Enhanced inequality processing using MathAnalysisEngine
 */
function processInequality(
  inequalityData: z.infer<typeof InequalitySchema>
): {
  intervals: Array<{
    start: number | null;
    end: number | null;
    startType: "open" | "closed";
    endType: "open" | "closed";
    arrow: "none" | "left" | "right" | "both";
    label?: string;
    setNotation?: string;
    intervalNotation?: string;
  }>;
  workSteps?: string[];
} {
  try {
    let analysisResult;
    let workSteps: string[] = [];

    if (inequalityData.type === "compound" && inequalityData.expressions && inequalityData.operator) {
      // Handle compound inequalities using expressions array
      const compoundExpression = inequalityData.expressions.join(` ${inequalityData.operator} `);
      workSteps.push(`原始表达式: ${compoundExpression}`);
      
      analysisResult = MathAnalysisEngine.parseInequality(compoundExpression);
      workSteps.push(`解析为: ${analysisResult.setNotation}`);
    } else {
      // Handle single expression
      workSteps.push(`原始表达式: ${inequalityData.expression}`);
      analysisResult = MathAnalysisEngine.parseInequality(inequalityData.expression);
      workSteps.push(`解析为: ${analysisResult.setNotation}`);
    }

    // Convert MathAnalysisEngine results to number line format
    const intervals = analysisResult.intervals.map((interval) => {
      let arrow: "none" | "left" | "right" | "both" = "none";
      
      if (interval.start === null && interval.end !== null) {
        arrow = "left";
      } else if (interval.start !== null && interval.end === null) {
        arrow = "right";
      }

      return {
        start: interval.start,
        end: interval.end,
        startType: interval.startType,
        endType: interval.endType,
        arrow,
        label: inequalityData.label,
        setNotation: analysisResult.setNotation,
        intervalNotation: analysisResult.intervalNotation,
      };
    });

    return { intervals, workSteps };
  } catch (error) {
    console.warn(`处理不等式失败: ${inequalityData.expression}`, error);
    
    // Fallback to simple parsing
    return {
      intervals: [{
        start: null,
        end: null,
        startType: "open",
        endType: "open",
        arrow: "none",
        label: inequalityData.label,
        setNotation: `{x | ${inequalityData.expression}}`,
        intervalNotation: "∅",
      }],
      workSteps: [`无法解析表达式: ${inequalityData.expression}`],
    };
  }
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
    showSetNotation,
    showIntervalNotation,
    showWorkSpace,
    autoAnalyze,
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

  // Process inequalities into intervals using enhanced engine
  const processedIntervals = [...intervals];
  const workSteps: string[] = [];
  const notations: { set: string[]; interval: string[] } = { set: [], interval: [] };

  inequalities.forEach((ineq, index) => {
    if (autoAnalyze) {
      const processed = processInequality(ineq);
      
      if (showWorkSpace && processed.workSteps) {
        workSteps.push(...processed.workSteps);
      }

      processed.intervals.forEach((interval) => {
        if (interval.start !== null || interval.end !== null) {
          processedIntervals.push({
            start: interval.start ?? range[0] - 1000,
            end: interval.end ?? range[1] + 1000,
            startType: interval.startType,
            endType: interval.endType,
            arrow: interval.arrow,
            color: ineq.color || `hsl(${(index * 60) % 360}, 70%, 50%)`,
            opacity: ineq.opacity || 0.3,
            label: interval.label || ineq.expression,
          });

          // Collect notation strings
          if (showSetNotation && interval.setNotation) {
            notations.set.push(interval.setNotation);
          }
          if (showIntervalNotation && interval.intervalNotation) {
            notations.interval.push(interval.intervalNotation);
          }
        }
      });
    } else {
      // Fallback to basic parsing for backward compatibility
      workSteps.push(`处理不等式: ${ineq.expression}`);
      
      processedIntervals.push({
        start: range[0] - 1000,
        end: range[1] + 1000,
        startType: "open",
        endType: "open",
        arrow: "none",
        color: ineq.color || `hsl(${(index * 60) % 360}, 70%, 50%)`,
        opacity: ineq.opacity || 0.3,
        label: ineq.expression,
      });

      if (showSetNotation) {
        notations.set.push(`{x | ${ineq.expression}}`);
      }
      if (showIntervalNotation) {
        notations.interval.push("需要自动分析");
      }
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
            line-height: 1.6;
        }
        .container {
            max-width: ${Math.max(width + 100, 800)}px;
            margin: 0 auto;
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
        .notation-section, .workspace-section {
            margin: 20px 0;
            padding: 15px;
            background: rgba(0, 0, 0, 0.05);
            border-radius: 8px;
        }
        .notation-section h3, .workspace-section h3 {
            margin: 0 0 10px 0;
            color: #555;
            font-size: 16px;
        }
        .notation-item {
            margin: 8px 0;
            font-family: 'Times New Roman', serif;
            font-size: 16px;
            background: white;
            padding: 8px 12px;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
        .work-step {
            margin: 5px 0;
            padding: 8px 12px;
            background: #f8f9fa;
            border-left: 3px solid #007bff;
            border-radius: 0 4px 4px 0;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        ${title ? `<h1>${title}</h1>` : ""}
        
        ${showWorkSpace && workSteps.length > 0 ? `
        <div class="workspace-section">
            <h3>📝 解题过程</h3>
            ${workSteps.map(step => `<div class="work-step">${step}</div>`).join('')}
        </div>
        ` : ""}
        
        <div id="jxgbox" class="jxgbox" style="width:${width}px; height:${height}px; margin: 0 auto;"></div>
        
        ${(showSetNotation || showIntervalNotation) && (notations.set.length > 0 || notations.interval.length > 0) ? `
        <div class="notation-section">
            <h3>🔢 数学记号</h3>
            ${showSetNotation && notations.set.length > 0 ? `
            <div>
                <strong>集合记号:</strong>
                ${notations.set.map(notation => `<div class="notation-item">${notation}</div>`).join('')}
            </div>
            ` : ""}
            ${showIntervalNotation && notations.interval.length > 0 ? `
            <div style="margin-top: 15px;">
                <strong>区间记号:</strong>
                ${notations.interval.map(notation => `<div class="notation-item">${notation}</div>`).join('')}
            </div>
            ` : ""}
        </div>
        ` : ""}
    
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
    </div> <!-- container -->
</body>
</html>`;
}

export const numberLine = {
  tool: {
    name: "generate_number_line",
    description:
      "Create enhanced number line visualizations with advanced inequality support. Features: open/closed circles, interval shading, arrows, compound inequalities (AND/OR), absolute value inequalities, set notation, interval notation, and step-by-step solution workspace. Perfect for visualizing complex inequality solutions.",
    inputSchema: zodToJsonSchema(schema),
  },
  execute: generateNumberLine,
};
