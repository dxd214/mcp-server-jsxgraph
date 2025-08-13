/**
 * 统一函数属性分析器
 * 提供完整的函数属性分析和可视化
 */

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

// 函数输入schema
const FunctionInputSchema = z.object({
  expression: z
    .string()
    .describe("函数表达式，如 'x^2', 'Math.sin(x)', '1/(x-1)'"),
  name: z
    .string()
    .optional()
    .default("f(x)")
    .describe("函数名称/标签"),
  color: z
    .string()
    .optional()
    .default("#0066cc")
    .describe("函数曲线颜色"),
  strokeWidth: z
    .number()
    .optional()
    .default(2)
    .describe("函数曲线宽度"),
  domain: z
    .array(z.number())
    .length(2)
    .optional()
    .describe("函数定义域范围 [min, max]"),
});

// 分析选项schema
const AnalysisOptionsSchema = z.object({
  domain: z.boolean().default(true).describe("分析定义域"),
  range: z.boolean().default(true).describe("分析值域"),
  intercepts: z.boolean().default(true).describe("找到x和y截距"),
  extrema: z.boolean().default(true).describe("找到极值点"),
  monotonicity: z.boolean().default(true).describe("分析单调性"),
  concavity: z.boolean().default(true).describe("分析凹凸性"),
  asymptotes: z.boolean().default(true).describe("找到渐近线"),
  inflectionPoints: z.boolean().default(true).describe("找到拐点"),
  periodicity: z.boolean().default(false).describe("分析周期性"),
  symmetry: z.boolean().default(true).describe("分析对称性"),
  continuity: z.boolean().default(false).describe("分析连续性"),
});

// 显示选项schema
const DisplayOptionsSchema = z.object({
  showGraph: z.boolean().default(true).describe("显示函数图像"),
  showTable: z.boolean().default(true).describe("显示属性表格"),
  annotateGraph: z.boolean().default(true).describe("在图像上标注关键点"),
  showDerivatives: z.boolean().default(false).describe("显示一阶和二阶导数"),
  showTangentLines: z
    .array(z.number())
    .optional()
    .describe("在指定x值处显示切线"),
  highlightIntervals: z.boolean().default(true).describe("高亮单调性和凹凸性区间"),
  showAsymptoteLines: z.boolean().default(true).describe("绘制渐近线"),
  showIntercepts: z.boolean().default(true).describe("标记截距点"),
  showExtrema: z.boolean().default(true).describe("标记极值点"),
  showInflectionPoints: z.boolean().default(true).describe("标记拐点"),
});

// 高级选项schema
const AdvancedOptionsSchema = z.object({
  precision: z
    .number()
    .min(1)
    .max(10)
    .default(4)
    .describe("数值计算精度（小数位数）"),
  samplingDensity: z
    .number()
    .min(10)
    .max(1000)
    .default(100)
    .describe("函数采样密度"),
  errorTolerance: z
    .number()
    .min(1e-10)
    .max(1e-2)
    .default(1e-6)
    .describe("数值计算误差容忍度"),
  showWorkSteps: z.boolean().default(false).describe("显示分析步骤"),
  compareMode: z.boolean().default(false).describe("多函数对比模式"),
});

// 主要输入schema
const schema = {
  // 函数配置
  function: FunctionInputSchema.describe("要分析的函数"),
  
  functions: z
    .array(FunctionInputSchema)
    .optional()
    .describe("多个函数同时分析（对比模式）"),

  // 分析选项
  analyze: AnalysisOptionsSchema
    .optional()
    .default({})
    .describe("分析选项配置"),

  // 显示选项  
  display: DisplayOptionsSchema
    .optional()
    .default({})
    .describe("显示选项配置"),

  // 高级选项
  advanced: AdvancedOptionsSchema
    .optional()
    .default({})
    .describe("高级分析选项"),

  // 基础JSXGraph选项
  title: JSXGraphTitleSchema,
  width: JSXGraphWidthSchema,
  height: JSXGraphHeightSchema,
  boundingBox: BoundingBoxSchema,
  axisXTitle: z.string().optional().default("x").describe("X轴标签"),
  axisYTitle: z.string().optional().default("y").describe("Y轴标签"),
  
  // 样式选项
  style: z
    .object({
      theme: JSXGraphThemeSchema,
      backgroundColor: JSXGraphBackgroundColorSchema,
      grid: JSXGraphGridSchema,
      axis: JSXGraphAxisSchema,
    })
    .optional()
    .describe("样式配置"),

  // JSXGraph控制选项
  keepAspectRatio: KeepAspectRatioSchema,
  showCopyright: ShowCopyrightSchema,
  showNavigation: ShowNavigationSchema,
  zoom: ZoomSchema,
  pan: PanSchema,
};

// 主输入schema
const FunctionPropertiesInputSchema = z.object(schema);

type FunctionPropertiesInput = z.infer<typeof FunctionPropertiesInputSchema>;

/**
 * 分析单个函数的所有属性
 */
function analyzeFunctionProperties(
  functionData: z.infer<typeof FunctionInputSchema>,
  options: {
    analyze: z.infer<typeof AnalysisOptionsSchema>;
    advanced: z.infer<typeof AdvancedOptionsSchema>;
    domain: [number, number];
  }
): {
  properties: any;
  workSteps: string[];
  annotations: Array<{
    type: string;
    x: number;
    y: number;
    label: string;
    color?: string;
  }>;
} {
  const workSteps: string[] = [];
  const annotations: Array<{ type: string; x: number; y: number; label: string; color?: string }> = [];
  
  try {
    workSteps.push(`开始分析函数: ${functionData.name} = ${functionData.expression}`);
    
    // 使用MathAnalysisEngine进行分析
    const properties = MathAnalysisEngine.analyzeFunctionProperties(
      functionData.expression,
      {
        domain: options.domain,
        analyzeRange: options.analyze.range,
        findExtrema: options.analyze.extrema,
        findAsymptotes: options.analyze.asymptotes,
        findInflection: options.analyze.inflectionPoints,
      }
    );

    workSteps.push(`定义域: ${properties.domain}`);
    if (properties.range) {
      workSteps.push(`值域: ${properties.range}`);
    }

    // 添加截距标注
    if (options.analyze.intercepts) {
      // x截距
      properties.intercepts.x.forEach((x: number) => {
        annotations.push({
          type: 'intercept',
          x,
          y: 0,
          label: `x截距: (${x.toFixed(options.advanced.precision)}, 0)`,
          color: '#ff6600',
        });
      });
      
      // y截距
      if (Number.isFinite(properties.intercepts.y)) {
        annotations.push({
          type: 'intercept',
          x: 0,
          y: properties.intercepts.y,
          label: `y截距: (0, ${properties.intercepts.y.toFixed(options.advanced.precision)})`,
          color: '#ff6600',
        });
      }
      
      workSteps.push(`x截距: ${properties.intercepts.x.length} 个`);
      workSteps.push(`y截距: ${properties.intercepts.y.toFixed(options.advanced.precision)}`);
    }

    // 添加极值点标注
    if (options.analyze.extrema) {
      properties.extrema.forEach((extremum: any) => {
        annotations.push({
          type: extremum.type,
          x: extremum.x,
          y: extremum.y,
          label: `${extremum.type === 'maximum' ? '最大值' : '最小值'}: (${extremum.x.toFixed(options.advanced.precision)}, ${extremum.y.toFixed(options.advanced.precision)})`,
          color: extremum.type === 'maximum' ? '#ff0000' : '#0000ff',
        });
      });
      
      workSteps.push(`极值点: ${properties.extrema.length} 个`);
    }

    // 添加拐点标注
    if (options.analyze.inflectionPoints) {
      properties.inflectionPoints.forEach((point: any) => {
        annotations.push({
          type: 'inflection',
          x: point.x,
          y: point.y,
          label: `拐点: (${point.x.toFixed(options.advanced.precision)}, ${point.y.toFixed(options.advanced.precision)})`,
          color: '#9900cc',
        });
      });
      
      workSteps.push(`拐点: ${properties.inflectionPoints.length} 个`);
    }

    // 分析渐近线
    if (options.analyze.asymptotes) {
      workSteps.push(`渐近线: ${properties.asymptotes.length} 条`);
      properties.asymptotes.forEach((asymptote: any) => {
        workSteps.push(`  - ${asymptote.type} 渐近线: ${asymptote.equation}`);
      });
    }

    // 分析单调性
    if (options.analyze.monotonicity) {
      workSteps.push(`单调性分析:`);
      properties.monotonicity.forEach((interval: any) => {
        workSteps.push(`  - ${interval.interval}: ${interval.direction === 'increasing' ? '递增' : interval.direction === 'decreasing' ? '递减' : '常数'}`);
      });
    }

    // 分析凹凸性
    if (options.analyze.concavity) {
      workSteps.push(`凹凸性分析:`);
      properties.concavity.forEach((interval: any) => {
        workSteps.push(`  - ${interval.interval}: ${interval.type === 'concave_up' ? '凹向上' : '凹向下'}`);
      });
    }

    // 分析对称性
    if (options.analyze.symmetry && properties.symmetry) {
      const symmetryType = properties.symmetry.type === 'even' ? '偶函数' : 
                          properties.symmetry.type === 'odd' ? '奇函数' : '无对称性';
      workSteps.push(`对称性: ${symmetryType}`);
    }

    // 分析周期性
    if (options.analyze.periodicity && properties.periodicity) {
      if (properties.periodicity.isPeriodic) {
        workSteps.push(`周期性: 周期函数，周期 = ${properties.periodicity.period?.toFixed(options.advanced.precision) || '未确定'}`);
      } else {
        workSteps.push(`周期性: 非周期函数`);
      }
    }

    return { properties, workSteps, annotations };
  } catch (error) {
    workSteps.push(`分析过程中出现错误: ${error}`);
    return {
      properties: {},
      workSteps,
      annotations: [],
    };
  }
}

/**
 * 生成函数属性分析的HTML和JavaScript
 */
export function generateFunctionProperties(input: any): string {
  // 解析和验证输入
  const validatedInput = FunctionPropertiesInputSchema.parse(input);
  const {
    function: mainFunction,
    functions = [],
    analyze = {
      domain: true,
      range: true,
      intercepts: true,
      extrema: true,
      monotonicity: true,
      concavity: true,
      asymptotes: true,
      inflectionPoints: true,
      periodicity: true,
      symmetry: true,
      continuity: true,
    },
    display = {
      showGraph: true,
      showTable: true,
      annotateGraph: true,
      showWorkSteps: false,
      showAsymptoteLines: true,
      showTangentLines: [],
    },
    advanced = {
      compareMode: false,
      precision: 3,
      samplingDensity: 100,
      errorTolerance: 1e-6,
      showWorkSteps: false,
    },
    title,
    width = 800,
    height = 600,
    boundingBox = [-10, 10, 10, -10],
    axisXTitle = "x",
    axisYTitle = "y",
    style = {
      theme: "default" as const,
      backgroundColor: "#ffffff",
      grid: true,
      axis: true,
    },
    keepAspectRatio = false,
    showCopyright = false,
    showNavigation = true,
    zoom = {
      enabled: true,
      factorX: 1.25,
      factorY: 1.25,
      wheel: true,
      needShift: false,
      min: 0.1,
      max: 10.0,
    },
    pan = {
      enabled: true,
      needShift: false,
      needTwoFingers: false,
    },
  } = validatedInput;

  // 确定要分析的函数列表
  const functionsToAnalyze = advanced.compareMode ? functions : [mainFunction];
  if (!advanced.compareMode && functions.length === 0) {
    functionsToAnalyze.push(mainFunction);
  }

  // 分析所有函数
  const analysisResults: Array<{
    function: z.infer<typeof FunctionInputSchema>;
    properties: any;
    workSteps: string[];
    annotations: any[];
  }> = [];

  const domain: [number, number] = mainFunction.domain && mainFunction.domain.length === 2 
    ? [mainFunction.domain[0], mainFunction.domain[1]] 
    : [boundingBox[0], boundingBox[2]];

  functionsToAnalyze.forEach((func) => {
    const result = analyzeFunctionProperties(func, {
      analyze,
      advanced,
      domain,
    });
    
    analysisResults.push({
      function: func,
      properties: result.properties,
      workSteps: result.workSteps,
      annotations: result.annotations,
    });
  });

  // JSXGraph配置
  const jsxGraphConfig = {
    boundingbox: boundingBox,
    keepaspectratio: keepAspectRatio,
    axis: style.axis ?? true,
    grid: style.grid ?? true,
    showCopyright,
    showNavigation,
    zoom: zoom.enabled !== false ? {
      enabled: zoom.enabled ?? true,
      factorX: zoom.factorX ?? 1.25,
      factorY: zoom.factorY ?? 1.25,
      wheel: zoom.wheel ?? true,
      needshift: zoom.needShift ?? false,
      min: zoom.min ?? 0.1,
      max: zoom.max ?? 10.0,
    } : undefined,
    pan: pan.enabled !== false ? {
      enabled: pan.enabled ?? true,
      needshift: pan.needShift ?? false,
      needtwofingers: pan.needTwoFingers ?? false,
    } : undefined,
  };

  // 生成HTML
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title || "函数属性分析"}</title>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/jsxgraph@1.8.0/distrib/jsxgraphcore.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: ${style.backgroundColor || '#ffffff'};
            line-height: 1.6;
        }
        .container {
            max-width: ${Math.max(width + 100, 1000)}px;
            margin: 0 auto;
        }
        .analysis-grid {
            display: grid;
            grid-template-columns: ${display.showTable ? '1fr 1fr' : '1fr'};
            gap: 20px;
            margin: 20px 0;
        }
        .graph-container {
            ${!display.showGraph ? 'display: none;' : ''}
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
        .properties-table {
            background: white;
            border-radius: 8px;
            border: 1px solid #ddd;
            overflow: hidden;
            ${!display.showTable ? 'display: none;' : ''}
        }
        .properties-table h3 {
            background: #f8f9fa;
            margin: 0;
            padding: 15px;
            border-bottom: 1px solid #ddd;
            color: #333;
        }
        .property-item {
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .property-item:last-child {
            border-bottom: none;
        }
        .property-label {
            font-weight: bold;
            color: #555;
        }
        .property-value {
            color: #333;
            font-family: 'Consolas', monospace;
        }
        .work-steps {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            ${!advanced.showWorkSteps ? 'display: none;' : ''}
        }
        .work-steps h3 {
            margin: 0 0 10px 0;
            color: #555;
        }
        .work-step {
            margin: 5px 0;
            padding: 5px 10px;
            background: white;
            border-left: 3px solid #007bff;
            border-radius: 0 4px 4px 0;
            font-family: monospace;
            font-size: 14px;
        }
        .function-legend {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        .legend-item {
            display: flex;
            align-items: center;
            margin: 8px 0;
        }
        .legend-color {
            width: 20px;
            height: 3px;
            margin-right: 10px;
            border-radius: 2px;
        }
        .annotation-legend {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        ${title ? `<h1>${title}</h1>` : ""}
        
        ${advanced.compareMode && functions.length > 1 ? `
        <div class="function-legend">
            <h3>📊 函数列表</h3>
            ${functions.map((func, index) => `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${func.color || `hsl(${index * 60}, 70%, 50%)`};"></div>
                <span>${func.name}: ${func.expression}</span>
            </div>
            `).join('')}
        </div>
        ` : ""}

        <div class="analysis-grid">
            <div class="graph-container">
                <div id="jxgbox" class="jxgbox" style="width:${width}px; height:${height}px;"></div>
                
                ${display.annotateGraph ? `
                <div class="annotation-legend">
                    <h3>🎯 图像标注说明</h3>
                    <div class="legend-item"><span style="color: #ff6600;">●</span> 截距点</div>
                    <div class="legend-item"><span style="color: #ff0000;">▲</span> 最大值点</div>
                    <div class="legend-item"><span style="color: #0000ff;">▼</span> 最小值点</div>
                    <div class="legend-item"><span style="color: #9900cc;">◆</span> 拐点</div>
                    <div class="legend-item"><span style="color: #666666;">---</span> 渐近线</div>
                </div>
                ` : ""}
            </div>
            
            ${display.showTable ? `
            <div class="properties-table">
                <h3>📋 函数属性分析</h3>
                ${analysisResults.map((result, index) => `
                <div>
                    ${advanced.compareMode ? `<h4 style="padding: 10px 15px; margin: 0; background: #f1f3f4;">${result.function.name}</h4>` : ""}
                    
                    ${analyze.domain ? `
                    <div class="property-item">
                        <span class="property-label">定义域:</span>
                        <span class="property-value">${result.properties.domain || '未分析'}</span>
                    </div>
                    ` : ""}
                    
                    ${analyze.range && result.properties.range ? `
                    <div class="property-item">
                        <span class="property-label">值域:</span>
                        <span class="property-value">${result.properties.range}</span>
                    </div>
                    ` : ""}
                    
                    ${analyze.intercepts ? `
                    <div class="property-item">
                        <span class="property-label">x截距:</span>
                        <span class="property-value">${result.properties.intercepts?.x.join(', ') || '无'}</span>
                    </div>
                    <div class="property-item">
                        <span class="property-label">y截距:</span>
                        <span class="property-value">${result.properties.intercepts?.y?.toFixed(advanced.precision) || '无'}</span>
                    </div>
                    ` : ""}
                    
                    ${analyze.extrema ? `
                    <div class="property-item">
                        <span class="property-label">极值点:</span>
                        <span class="property-value">${result.properties.extrema?.length || 0} 个</span>
                    </div>
                    ` : ""}
                    
                    ${analyze.asymptotes ? `
                    <div class="property-item">
                        <span class="property-label">渐近线:</span>
                        <span class="property-value">${result.properties.asymptotes?.length || 0} 条</span>
                    </div>
                    ` : ""}
                    
                    ${analyze.inflectionPoints ? `
                    <div class="property-item">
                        <span class="property-label">拐点:</span>
                        <span class="property-value">${result.properties.inflectionPoints?.length || 0} 个</span>
                    </div>
                    ` : ""}
                    
                    ${analyze.symmetry && result.properties.symmetry ? `
                    <div class="property-item">
                        <span class="property-label">对称性:</span>
                        <span class="property-value">${result.properties.symmetry.type === 'even' ? '偶函数' : result.properties.symmetry.type === 'odd' ? '奇函数' : '无对称性'}</span>
                    </div>
                    ` : ""}
                    
                    ${analyze.periodicity && result.properties.periodicity ? `
                    <div class="property-item">
                        <span class="property-label">周期性:</span>
                        <span class="property-value">${result.properties.periodicity.isPeriodic ? `周期 = ${result.properties.periodicity.period?.toFixed(advanced.precision)}` : '非周期函数'}</span>
                    </div>
                    ` : ""}
                </div>
                `).join('')}
            </div>
            ` : ""}
        </div>
        
        ${advanced.showWorkSteps ? `
        <div class="work-steps">
            <h3>📝 分析过程</h3>
            ${analysisResults.flatMap(result => result.workSteps).map(step => `
            <div class="work-step">${step}</div>
            `).join('')}
        </div>
        ` : ""}
    </div>

    <script type="text/javascript">
        const board = JXG.JSXGraph.initBoard('jxgbox', ${JSON.stringify(jsxGraphConfig)});
        
        // 设置坐标轴标签
        board.defaultAxes.x.setAttribute({ name: '${axisXTitle}', withLabel: true, label: {position: 'rt', offset: [-10, 20]} });
        board.defaultAxes.y.setAttribute({ name: '${axisYTitle}', withLabel: true, label: {position: 'rt', offset: [20, -10]} });
        
        ${analysisResults.map((result, index) => `
        // 函数 ${index + 1}: ${result.function.name}
        (function() {
            const color = '${result.function.color || `hsl(${index * 60}, 70%, 50%)`}';
            
            ${display.showGraph ? `
            // 绘制函数图像
            try {
                const func = board.create('functiongraph', [function(x) {
                    ${result.function.expression.includes('Math.') ? 
                      `return eval('${result.function.expression}'.replace(/x/g, x));` :
                      `return eval('${result.function.expression}'.replace(/x/g, x));`
                    }
                }${result.function.domain ? `, ${result.function.domain[0]}, ${result.function.domain[1]}` : ''}], {
                    strokeColor: color,
                    strokeWidth: ${result.function.strokeWidth || 2},
                    name: '${result.function.name}',
                    withLabel: true,
                    label: {
                        position: 'rt',
                        offset: [10, 10]
                    }
                });
            } catch (e) {
                console.warn('无法绘制函数图像:', '${result.function.expression}', e);
            }
            ` : ""}
            
            ${display.annotateGraph ? `
            // 标注关键点
            ${result.annotations.map(annotation => `
            try {
                board.create('point', [${annotation.x}, ${annotation.y}], {
                    name: '',
                    strokeColor: '${annotation.color || '#000000'}',
                    fillColor: '${annotation.color || '#000000'}',
                    size: 4,
                    fixed: true,
                    showInfobox: true,
                    infoboxText: '${annotation.label}'
                });
            } catch (e) {
                console.warn('无法创建标注点:', e);
            }
            `).join('')}
            ` : ""}
            
            ${display.showAsymptoteLines && result.properties.asymptotes ? `
            // 绘制渐近线
            ${result.properties.asymptotes.map((asymptote: any) => {
              if (asymptote.type === 'vertical' && asymptote.value !== undefined) {
                return `
                try {
                    board.create('line', [[${asymptote.value}, -1000], [${asymptote.value}, 1000]], {
                        strokeColor: '#666666',
                        strokeWidth: 1,
                        dash: 2,
                        fixed: true,
                        highlight: false,
                        name: '${asymptote.equation}',
                        withLabel: true,
                        label: { position: 'rt', offset: [5, 5] }
                    });
                } catch (e) {
                    console.warn('无法绘制垂直渐近线:', e);
                }
                `;
              } else if (asymptote.type === 'horizontal' && asymptote.value !== undefined) {
                return `
                try {
                    board.create('line', [[-1000, ${asymptote.value}], [1000, ${asymptote.value}]], {
                        strokeColor: '#666666',
                        strokeWidth: 1,
                        dash: 2,
                        fixed: true,
                        highlight: false,
                        name: '${asymptote.equation}',
                        withLabel: true,
                        label: { position: 'rt', offset: [5, 5] }
                    });
                } catch (e) {
                    console.warn('无法绘制水平渐近线:', e);
                }
                `;
              }
              return '';
            }).join('')}
            ` : ""}
            
            ${display.showTangentLines && display.showTangentLines.length > 0 ? `
            // 绘制切线
            ${display.showTangentLines.map(xVal => `
            try {
                const h = 0.001;
                const x0 = ${xVal};
                const y0 = eval('${result.function.expression}'.replace(/x/g, x0));
                const slope = (eval('${result.function.expression}'.replace(/x/g, x0 + h)) - y0) / h;
                
                board.create('line', [
                    [x0 - 2, y0 - 2 * slope],
                    [x0 + 2, y0 + 2 * slope]
                ], {
                    strokeColor: color,
                    strokeWidth: 1,
                    dash: 1,
                    fixed: true,
                    name: 'tangent at x=' + x0
                });
                
                board.create('point', [x0, y0], {
                    strokeColor: color,
                    fillColor: color,
                    size: 3,
                    name: 'x=' + x0,
                    fixed: true
                });
            } catch (e) {
                console.warn('无法绘制切线:', e);
            }
            `).join('')}
            ` : ""}
        })();
        `).join('')}
        
        board.update();
    </script>
</body>
</html>`;
}

// 导出工具配置
export const functionProperties = {
  tool: {
    name: "function-properties",
    description:
      "Create comprehensive function property analysis with visualization. Analyzes domain, range, monotonicity, concavity, extrema, asymptotes, inflection points, symmetry, and periodicity. Features interactive graphs with annotations, property tables, and step-by-step analysis. Perfect for in-depth function study.",
    inputSchema: zodToJsonSchema(schema),
  },
  execute: generateFunctionProperties,
};
