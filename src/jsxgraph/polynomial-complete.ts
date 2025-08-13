/**
 * 完整多项式综合分析器
 * 提供因式分解、综合除法、端点行为、重根分析等高级功能
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

// 多项式系数schema
const PolynomialCoefficientsSchema = z.object({
  coefficients: z
    .array(z.number())
    .describe("多项式系数数组 [a_n, a_{n-1}, ..., a_1, a_0] 对应 a_n*x^n + ... + a_1*x + a_0"),
  expression: z
    .string()
    .optional()
    .describe("多项式表达式字符串（可选，用于显示）"),
});

// 因式分解选项schema
const FactorizationOptionsSchema = z.object({
  showProcess: z.boolean().default(true).describe("显示因式分解过程"),
  useRationalRootTest: z.boolean().default(true).describe("使用有理根测试"),
  showRemainder: z.boolean().default(true).describe("显示余式"),
  findComplexRoots: z.boolean().default(false).describe("查找复数根"),
  factorizeCompletely: z.boolean().default(true).describe("完全因式分解"),
});

// 综合除法选项schema
const SyntheticDivisionSchema = z.object({
  divisors: z.array(z.number()).describe("除数列表"),
  showSteps: z.boolean().default(true).describe("显示除法步骤"),
  verifyResults: z.boolean().default(true).describe("验证结果"),
});

// 根分析选项schema
const RootAnalysisSchema = z.object({
  findRationalRoots: z.boolean().default(true).describe("查找有理根"),
  findIrrationalRoots: z.boolean().default(true).describe("查找无理根"),
  analyzeMultiplicity: z.boolean().default(true).describe("分析重数"),
  showBehavior: z.boolean().default(true).describe("显示根的行为"),
  tolerance: z.number().default(1e-10).describe("数值计算容差"),
});

// 端点行为分析schema
const EndBehaviorSchema = z.object({
  analyzeLeadingTerm: z.boolean().default(true).describe("分析首项"),
  showLimits: z.boolean().default(true).describe("显示极限"),
  visualizeArrows: z.boolean().default(true).describe("可视化箭头"),
});

// 显示选项schema
const DisplayOptionsSchema = z.object({
  showGraph: z.boolean().default(true).describe("显示函数图像"),
  showFactorization: z.boolean().default(true).describe("显示因式分解"),
  showSyntheticDivision: z.boolean().default(false).describe("显示综合除法"),
  showRootTable: z.boolean().default(true).describe("显示根表"),
  showEndBehavior: z.boolean().default(true).describe("显示端点行为"),
  showDerivatives: z.boolean().default(false).describe("显示导数"),
  annotateGraph: z.boolean().default(true).describe("在图像上标注"),
  showWorkspace: z.boolean().default(false).describe("显示工作区"),
});

// 主要输入schema
const schema = {
  // 多项式定义
  polynomial: PolynomialCoefficientsSchema.describe("多项式定义"),

  // 分析选项
  factorization: FactorizationOptionsSchema
    .optional()
    .default({})
    .describe("因式分解选项"),
  
  syntheticDivision: SyntheticDivisionSchema
    .optional()
    .describe("综合除法配置"),
  
  rootAnalysis: RootAnalysisSchema
    .optional()
    .default({})
    .describe("根分析选项"),
  
  endBehavior: EndBehaviorSchema
    .optional()
    .default({})
    .describe("端点行为分析"),

  // 显示选项
  display: DisplayOptionsSchema
    .optional()
    .default({})
    .describe("显示选项"),

  // JSXGraph选项
  title: JSXGraphTitleSchema,
  width: JSXGraphWidthSchema,
  height: JSXGraphHeightSchema,
  boundingBox: BoundingBoxSchema,
  axisXTitle: z.string().optional().default("x").describe("X轴标签"),
  axisYTitle: z.string().optional().default("f(x)").describe("Y轴标签"),
  
  style: z
    .object({
      theme: JSXGraphThemeSchema,
      backgroundColor: JSXGraphBackgroundColorSchema,
      grid: JSXGraphGridSchema,
      axis: JSXGraphAxisSchema,
    })
    .optional()
    .describe("样式配置"),

  keepAspectRatio: KeepAspectRatioSchema,
  showCopyright: ShowCopyrightSchema,
  showNavigation: ShowNavigationSchema,
  zoom: ZoomSchema,
  pan: PanSchema,
};

// 主输入schema
const PolynomialCompleteInputSchema = z.object(schema);
type PolynomialCompleteInput = z.infer<typeof PolynomialCompleteInputSchema>;

/**
 * 高级多项式分析类
 */
class AdvancedPolynomialAnalyzer {
  private coefficients: number[];
  private degree: number;

  constructor(coefficients: number[]) {
    this.coefficients = [...coefficients];
    this.degree = coefficients.length - 1;
  }

  /**
   * 有理根测试
   */
  rationalRootTest(): number[] {
    if (this.coefficients.length < 2) return [];

    const lastCoeff = Math.abs(this.coefficients[this.coefficients.length - 1]);
    const firstCoeff = Math.abs(this.coefficients[0]);

    // 找到常数项的因子
    const constantFactors = this.getFactors(lastCoeff);
    // 找到首项系数的因子
    const leadingFactors = this.getFactors(firstCoeff);

    // 可能的有理根 = ±(常数项因子/首项系数因子)
    const possibleRoots: number[] = [];
    
    for (const p of constantFactors) {
      for (const q of leadingFactors) {
        possibleRoots.push(p / q);
        possibleRoots.push(-p / q);
      }
    }

    // 去重并测试
    const uniqueRoots = [...new Set(possibleRoots)];
    const actualRoots: number[] = [];

    for (const root of uniqueRoots) {
      if (Math.abs(this.evaluate(root)) < 1e-10) {
        actualRoots.push(root);
      }
    }

    return actualRoots.sort((a, b) => a - b);
  }

  /**
   * 获取数字的所有因子
   */
  private getFactors(n: number): number[] {
    const factors: number[] = [];
    const absN = Math.abs(n);
    
    for (let i = 1; i <= Math.sqrt(absN); i++) {
      if (absN % i === 0) {
        factors.push(i);
        if (i !== absN / i) {
          factors.push(absN / i);
        }
      }
    }
    
    return factors.sort((a, b) => a - b);
  }

  /**
   * 计算多项式在给定点的值
   */
  evaluate(x: number): number {
    let result = 0;
    let power = this.degree;
    
    for (const coeff of this.coefficients) {
      result += coeff * Math.pow(x, power);
      power--;
    }
    
    return result;
  }

  /**
   * 综合除法
   */
  syntheticDivision(divisor: number): {
    quotient: number[];
    remainder: number;
    steps: string[];
  } {
    const steps: string[] = [];
    const n = this.coefficients.length;
    const quotient: number[] = [];
    
    steps.push(`综合除法: (多项式) ÷ (x - ${divisor})`);
    steps.push(`系数: [${this.coefficients.join(', ')}]`);
    
    let carry = 0;
    
    for (let i = 0; i < n - 1; i++) {
      const current = this.coefficients[i] + carry;
      quotient.push(current);
      carry = current * divisor;
      
      steps.push(`第${i + 1}步: ${this.coefficients[i]} + ${carry - current * divisor} = ${current}, 下一轮进位 = ${carry}`);
    }
    
    const remainder = this.coefficients[n - 1] + carry;
    steps.push(`余数: ${this.coefficients[n - 1]} + ${carry} = ${remainder}`);
    
    return { quotient, remainder, steps };
  }

  /**
   * 因式分解
   */
  factorize(): {
    factors: string[];
    steps: string[];
    isComplete: boolean;
  } {
    const steps: string[] = [];
    const factors: string[] = [];
    
    steps.push(`开始因式分解多项式，次数: ${this.degree}`);
    
    // 首先尝试提取公因式
    const gcd = this.extractCommonFactor();
    if (gcd !== 1) {
      factors.push(gcd.toString());
      steps.push(`提取公因式: ${gcd}`);
    }

    // 查找有理根
    const rationalRoots = this.rationalRootTest();
    steps.push(`有理根测试结果: [${rationalRoots.join(', ')}]`);

    let currentPoly = new AdvancedPolynomialAnalyzer(this.coefficients);
    
    // 对每个根进行综合除法
    for (const root of rationalRoots) {
      const division = currentPoly.syntheticDivision(root);
      if (Math.abs(division.remainder) < 1e-10) {
        factors.push(`(x - ${root})`);
        steps.push(`找到因子: (x - ${root})`);
        
        if (division.quotient.length > 1) {
          currentPoly = new AdvancedPolynomialAnalyzer(division.quotient);
        }
      }
    }

    // 检查是否完全因式分解
    const isComplete = currentPoly.degree <= 1 || currentPoly.coefficients.every(c => c === 0);
    
    if (!isComplete && currentPoly.degree === 2) {
      // 尝试二次公式
      const quadraticFactors = this.factorizeQuadratic(currentPoly.coefficients);
      if (quadraticFactors.length > 0) {
        factors.push(...quadraticFactors);
        steps.push(`二次因式分解: ${quadraticFactors.join(' × ')}`);
      }
    }

    return { factors, steps, isComplete };
  }

  /**
   * 提取公因式
   */
  private extractCommonFactor(): number {
    const nonZeroCoeffs = this.coefficients.filter(c => c !== 0);
    if (nonZeroCoeffs.length === 0) return 1;
    
    return nonZeroCoeffs.reduce((gcd, coeff) => this.gcd(Math.abs(gcd), Math.abs(coeff)));
  }

  /**
   * 最大公约数
   */
  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  /**
   * 二次因式分解
   */
  private factorizeQuadratic(coeffs: number[]): string[] {
    if (coeffs.length !== 3) return [];
    
    const [a, b, c] = coeffs;
    const discriminant = b * b - 4 * a * c;
    
    if (discriminant < 0) return []; // 复根，暂不处理
    
    if (discriminant === 0) {
      // 完全平方
      const root = -b / (2 * a);
      return [`(x - ${root})²`];
    }
    
    const sqrtDisc = Math.sqrt(discriminant);
    const root1 = (-b + sqrtDisc) / (2 * a);
    const root2 = (-b - sqrtDisc) / (2 * a);
    
    return [`(x - ${root1.toFixed(4)})`, `(x - ${root2.toFixed(4)})`];
  }

  /**
   * 分析端点行为
   */
  analyzeEndBehavior(): {
    leftEnd: 'up' | 'down';
    rightEnd: 'up' | 'down';
    analysis: string[];
  } {
    const analysis: string[] = [];
    const leadingCoeff = this.coefficients[0];
    const degree = this.degree;
    
    analysis.push(`首项: ${leadingCoeff}x^${degree}`);
    analysis.push(`次数: ${degree} (${degree % 2 === 0 ? '偶数' : '奇数'})`);
    analysis.push(`首项系数: ${leadingCoeff} (${leadingCoeff > 0 ? '正' : '负'})`);

    let leftEnd: 'up' | 'down';
    let rightEnd: 'up' | 'down';

    if (degree % 2 === 0) {
      // 偶数次
      leftEnd = leadingCoeff > 0 ? 'up' : 'down';
      rightEnd = leadingCoeff > 0 ? 'up' : 'down';
      analysis.push(`偶数次多项式: 两端行为相同`);
    } else {
      // 奇数次
      leftEnd = leadingCoeff > 0 ? 'down' : 'up';
      rightEnd = leadingCoeff > 0 ? 'up' : 'down';
      analysis.push(`奇数次多项式: 两端行为相反`);
    }

    analysis.push(`x → -∞ 时, f(x) → ${leftEnd === 'up' ? '+∞' : '-∞'}`);
    analysis.push(`x → +∞ 时, f(x) → ${rightEnd === 'up' ? '+∞' : '-∞'}`);

    return { leftEnd, rightEnd, analysis };
  }

  /**
   * 分析根的重数
   */
  analyzeRootMultiplicity(roots: number[]): Array<{
    root: number;
    multiplicity: number;
    behavior: 'crosses' | 'touches' | 'bounces';
  }> {
    const rootInfo: Array<{ root: number; multiplicity: number; behavior: 'crosses' | 'touches' | 'bounces' }> = [];
    
    for (const root of roots) {
      let multiplicity = 0;
      let testPoly = new AdvancedPolynomialAnalyzer(this.coefficients);
      
      // 连续综合除法直到余数不为0
      while (Math.abs(testPoly.evaluate(root)) < 1e-10 && testPoly.degree > 0) {
        const division = testPoly.syntheticDivision(root);
        if (Math.abs(division.remainder) < 1e-10) {
          multiplicity++;
          testPoly = new AdvancedPolynomialAnalyzer(division.quotient);
        } else {
          break;
        }
      }
      
      let behavior: 'crosses' | 'touches' | 'bounces';
      if (multiplicity === 1) {
        behavior = 'crosses';
      } else if (multiplicity % 2 === 0) {
        behavior = 'touches';
      } else {
        behavior = 'bounces';
      }
      
      rootInfo.push({ root, multiplicity, behavior });
    }
    
    return rootInfo;
  }
}

/**
 * 生成完整多项式分析的HTML和JavaScript
 */
export function generatePolynomialComplete(input: any): string {
  const validatedInput = PolynomialCompleteInputSchema.parse(input);
  const {
    polynomial,
    factorization = {
      showProcess: true,
      useRationalRootTest: true,
      showRemainder: true,
      findComplexRoots: false,
      factorizeCompletely: true,
    },
    syntheticDivision,
    rootAnalysis = {
      findRationalRoots: true,
      findIrrationalRoots: true,
      analyzeMultiplicity: true,
      showBehavior: true,
      tolerance: 1e-10,
    },
    endBehavior = {
      analyzeLeadingTerm: true,
      showLimits: true,
      visualizeArrows: true,
    },
    display = {
      showGraph: true,
      showFactorization: true,
      showSyntheticDivision: false,
      showRootTable: true,
      showEndBehavior: true,
      showDerivatives: false,
      annotateGraph: true,
      showWorkspace: false,
    },
    title,
    width = 800,
    height = 600,
    boundingBox = [-10, 10, 10, -10],
    axisXTitle = "x",
    axisYTitle = "f(x)",
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

  // 创建高级分析器
  const analyzer = new AdvancedPolynomialAnalyzer(polynomial.coefficients);
  
  // 进行各种分析
  const factorizationResult = factorization.showProcess ? analyzer.factorize() : null;
  const rationalRoots = rootAnalysis.findRationalRoots ? analyzer.rationalRootTest() : [];
  const rootMultiplicityInfo = rootAnalysis.analyzeMultiplicity ? analyzer.analyzeRootMultiplicity(rationalRoots) : [];
  const endBehaviorResult = endBehavior.analyzeLeadingTerm ? analyzer.analyzeEndBehavior() : null;
  
  // 综合除法结果
  const syntheticDivisionResults = syntheticDivision ? 
    syntheticDivision.divisors.map(divisor => ({
      divisor,
      result: analyzer.syntheticDivision(divisor)
    })) : [];

  // 使用MathAnalysisEngine进行补充分析
  const expression = polynomial.expression || `${polynomial.coefficients[0]}*x**${polynomial.coefficients.length - 1}`;
  const analysisResult = MathAnalysisEngine.analyzePolynomial(expression);

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

  // 生成多项式函数JavaScript代码
  const generatePolynomialJS = (coeffs: number[]) => {
    const terms = coeffs.map((coeff, index) => {
      const power = coeffs.length - 1 - index;
      if (power === 0) return `${coeff}`;
      if (power === 1) return `${coeff}*x`;
      return `${coeff}*Math.pow(x, ${power})`;
    }).filter(term => !term.startsWith('0'));
    
    return `function(x) { return ${terms.join(' + ').replace(/\+ -/g, '- ')}; }`;
  };

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title || "多项式综合分析"}</title>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/jsxgraph@1.8.0/distrib/jsxgraphcore.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: ${style.backgroundColor || '#ffffff'};
            line-height: 1.6;
        }
        .container {
            max-width: ${Math.max(width + 100, 1200)}px;
            margin: 0 auto;
        }
        .analysis-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }
        .full-width {
            grid-column: 1 / -1;
        }
        .jxgbox {
            border: 1px solid #ccc;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        h1 {
            text-align: center;
            margin-bottom: 20px;
            color: #333;
        }
        .analysis-section {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }
        .analysis-section h3 {
            margin: 0 0 15px 0;
            color: #333;
            border-bottom: 2px solid #007bff;
            padding-bottom: 5px;
        }
        .polynomial-display {
            font-size: 18px;
            text-align: center;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            font-family: 'Times New Roman', serif;
            margin-bottom: 20px;
        }
        .factor-item {
            background: #e3f2fd;
            padding: 8px 12px;
            margin: 5px 0;
            border-left: 4px solid #2196f3;
            border-radius: 0 4px 4px 0;
        }
        .root-item {
            background: #f3e5f5;
            padding: 8px 12px;
            margin: 5px 0;
            border-left: 4px solid #9c27b0;
            border-radius: 0 4px 4px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .root-behavior {
            font-size: 12px;
            padding: 2px 6px;
            border-radius: 10px;
            color: white;
        }
        .crosses { background-color: #4caf50; }
        .touches { background-color: #ff9800; }
        .bounces { background-color: #f44336; }
        .step-item {
            background: #fff3e0;
            padding: 8px 12px;
            margin: 5px 0;
            border-left: 4px solid #ff9800;
            border-radius: 0 4px 4px 0;
            font-family: monospace;
            font-size: 14px;
        }
        .synthetic-division {
            background: #e8f5e8;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
        }
        .synthetic-division h4 {
            margin: 0 0 10px 0;
            color: #2e7d32;
        }
        .end-behavior {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        .behavior-arrow {
            text-align: center;
            padding: 10px;
            border-radius: 5px;
        }
        .arrow-up {
            background: linear-gradient(to top, #ffcdd2, #f8bbd9);
            color: #c62828;
        }
        .arrow-down {
            background: linear-gradient(to bottom, #c8e6c9, #dcedc8);
            color: #2e7d32;
        }
    </style>
</head>
<body>
    <div class="container">
        ${title ? `<h1>${title}</h1>` : ""}
        
        <div class="polynomial-display">
            <strong>多项式:</strong> ${polynomial.expression || `f(x) = ${polynomial.coefficients[0]}x^${polynomial.coefficients.length - 1} + ...`}
        </div>

        <div class="analysis-grid">
            <div class="full-width">
                ${display.showGraph ? `
                <div id="jxgbox" class="jxgbox" style="width:${width}px; height:${height}px; margin: 0 auto;"></div>
                ` : ""}
            </div>

            ${display.showFactorization && factorizationResult ? `
            <div class="analysis-section">
                <h3>🔧 因式分解</h3>
                <div class="factor-item">
                    <strong>因子:</strong> ${factorizationResult.factors.join(' × ') || '无法完全因式分解'}
                </div>
                <div class="factor-item">
                    <strong>状态:</strong> ${factorizationResult.isComplete ? '完全因式分解' : '部分因式分解'}
                </div>
                ${factorization.showProcess ? `
                <h4>分解过程:</h4>
                ${factorizationResult.steps.map(step => `<div class="step-item">${step}</div>`).join('')}
                ` : ""}
            </div>
            ` : ""}

            ${display.showRootTable ? `
            <div class="analysis-section">
                <h3>🎯 根分析</h3>
                ${rootMultiplicityInfo.map(rootInfo => `
                <div class="root-item">
                    <span>x = ${rootInfo.root}</span>
                    <div>
                        <span>重数: ${rootInfo.multiplicity}</span>
                        <span class="root-behavior ${rootInfo.behavior}">${
                          rootInfo.behavior === 'crosses' ? '穿过' : 
                          rootInfo.behavior === 'touches' ? '相切' : '反弹'
                        }</span>
                    </div>
                </div>
                `).join('')}
                ${rationalRoots.length === 0 ? '<div class="root-item">无有理根</div>' : ''}
            </div>
            ` : ""}

            ${display.showEndBehavior && endBehaviorResult ? `
            <div class="analysis-section">
                <h3>📈 端点行为</h3>
                <div class="end-behavior">
                    <div class="behavior-arrow ${endBehaviorResult.leftEnd === 'up' ? 'arrow-up' : 'arrow-down'}">
                        <div>x → -∞</div>
                        <div style="font-size: 24px;">${endBehaviorResult.leftEnd === 'up' ? '↗' : '↘'}</div>
                        <div>f(x) → ${endBehaviorResult.leftEnd === 'up' ? '+∞' : '-∞'}</div>
                    </div>
                    <div class="behavior-arrow ${endBehaviorResult.rightEnd === 'up' ? 'arrow-up' : 'arrow-down'}">
                        <div>x → +∞</div>
                        <div style="font-size: 24px;">${endBehaviorResult.rightEnd === 'up' ? '↗' : '↘'}</div>
                        <div>f(x) → ${endBehaviorResult.rightEnd === 'up' ? '+∞' : '-∞'}</div>
                    </div>
                </div>
                <h4>分析步骤:</h4>
                ${endBehaviorResult.analysis.map(step => `<div class="step-item">${step}</div>`).join('')}
            </div>
            ` : ""}

            ${display.showSyntheticDivision && syntheticDivisionResults.length > 0 ? `
            <div class="analysis-section full-width">
                <h3>➗ 综合除法</h3>
                ${syntheticDivisionResults.map(result => `
                <div class="synthetic-division">
                    <h4>除以 (x - ${result.divisor})</h4>
                    <div><strong>商:</strong> [${result.result.quotient.join(', ')}]</div>
                    <div><strong>余数:</strong> ${result.result.remainder}</div>
                    ${syntheticDivision?.showSteps ? `
                    <h5>计算步骤:</h5>
                    ${result.result.steps.map(step => `<div class="step-item">${step}</div>`).join('')}
                    ` : ""}
                </div>
                `).join('')}
            </div>
            ` : ""}
        </div>
    </div>

    ${display.showGraph ? `
    <script type="text/javascript">
        const board = JXG.JSXGraph.initBoard('jxgbox', ${JSON.stringify(jsxGraphConfig)});
        
        // 设置坐标轴标签
        board.defaultAxes.x.setAttribute({ name: '${axisXTitle}', withLabel: true, label: {position: 'rt', offset: [-10, 20]} });
        board.defaultAxes.y.setAttribute({ name: '${axisYTitle}', withLabel: true, label: {position: 'rt', offset: [20, -10]} });
        
        // 绘制多项式函数
        const polynomialFunction = ${generatePolynomialJS(polynomial.coefficients)};
        
        board.create('functiongraph', [polynomialFunction], {
            strokeColor: '#2196f3',
            strokeWidth: 3,
            name: 'f(x)',
            withLabel: true,
            label: { position: 'rt', offset: [10, 10] }
        });

        ${display.annotateGraph ? `
        // 标注根
        ${rationalRoots.map(root => `
        try {
            const y = polynomialFunction(${root});
            board.create('point', [${root}, y], {
                name: 'x=${root}',
                strokeColor: '#e91e63',
                fillColor: '#e91e63',
                size: 4,
                fixed: true,
                showInfobox: true,
                infoboxText: 'Root: x = ${root}'
            });
        } catch (e) {
            console.warn('无法标注根点:', e);
        }
        `).join('')}

        // 标注极值点
        ${analysisResult.criticalPoints?.map((point, index) => `
        try {
            board.create('point', [${point.x}, ${point.y}], {
                name: 'P${index + 1}',
                strokeColor: '#ff9800',
                fillColor: '#ff9800',
                size: 4,
                fixed: true,
                showInfobox: true,
                infoboxText: 'Critical point: (${point.x.toFixed(2)}, ${point.y.toFixed(2)})'
            });
        } catch (e) {
            console.warn('无法标注极值点:', e);
        }
        `).join('') || ''}

        ${endBehavior.visualizeArrows && endBehaviorResult ? `
        // 端点行为箭头
        try {
            // 左端箭头
            board.create('arrow', [
                [${boundingBox[0]} + 1, ${endBehaviorResult.leftEnd === 'up' ? boundingBox[1] - 1 : boundingBox[3] + 1}],
                [${boundingBox[0]} + 0.5, ${endBehaviorResult.leftEnd === 'up' ? boundingBox[1] - 0.5 : boundingBox[3] + 0.5}]
            ], {
                strokeColor: '#666',
                strokeWidth: 2
            });
            
            // 右端箭头  
            board.create('arrow', [
                [${boundingBox[2]} - 1, ${endBehaviorResult.rightEnd === 'up' ? boundingBox[1] - 1 : boundingBox[3] + 1}],
                [${boundingBox[2]} - 0.5, ${endBehaviorResult.rightEnd === 'up' ? boundingBox[1] - 0.5 : boundingBox[3] + 0.5}]
            ], {
                strokeColor: '#666',
                strokeWidth: 2
            });
        } catch (e) {
            console.warn('无法绘制端点箭头:', e);
        }
        ` : ""}
        ` : ""}
        
        board.update();
    </script>
    ` : ""}
</body>
</html>`;
}

// 工具配置
const tool = {
  name: "generate_polynomial_complete",
  description:
    "Create comprehensive polynomial analysis with advanced features: complete factorization, synthetic division, rational root test, end behavior analysis, root multiplicity, and step-by-step solutions. Perfect for in-depth polynomial study and education.",
  inputSchema: zodToJsonSchema(schema),
};

// 导出工具配置
export const polynomialComplete = {
  schema,
  tool,
  execute: generatePolynomialComplete,
};
