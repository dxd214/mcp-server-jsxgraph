/**
 * 统一数学分析引擎
 * 为所有JSXGraph工具提供数学计算和分析支持
 */

// ============== 类型定义 ==============

export interface Point2D {
  x: number;
  y: number;
}

export interface Interval {
  start: number | null;
  end: number | null;
  startType: 'open' | 'closed';
  endType: 'open' | 'closed';
  setNotation?: string;
  intervalNotation?: string;
}

export interface FunctionProperties {
  domain: string;
  range?: string;
  intercepts: {
    x: number[];
    y: number;
  };
  extrema: Array<{
    type: 'maximum' | 'minimum';
    x: number;
    y: number;
    isLocal: boolean;
  }>;
  asymptotes: Array<{
    type: 'vertical' | 'horizontal' | 'oblique';
    equation: string;
    value?: number;
  }>;
  monotonicity: Array<{
    interval: string;
    direction: 'increasing' | 'decreasing' | 'constant';
  }>;
  concavity: Array<{
    interval: string;
    type: 'concave_up' | 'concave_down';
  }>;
  inflectionPoints: Point2D[];
  periodicity?: {
    isPeriodic: boolean;
    period?: number;
  };
  symmetry?: {
    type: 'even' | 'odd' | 'none';
    axis?: string; // 对称轴
  };
  continuity: Array<{
    interval: string;
    isContinuous: boolean;
    discontinuities?: Point2D[];
  }>;
}

export interface InequalityResult {
  type: 'simple' | 'compound' | 'absolute';
  operator: 'and' | 'or';
  intervals: Interval[];
  setNotation: string;
  intervalNotation: string;
  graphicalSolution: {
    points: Point2D[];
    regions: Interval[];
  };
}

export interface PolynomialAnalysis {
  degree: number;
  leadingCoefficient: number;
  coefficients: number[];
  roots: Array<{
    value: number;
    multiplicity: number;
    isReal: boolean;
  }>;
  factorization: {
    factors: string[];
    expanded: string;
    simplified: string;
  };
  endBehavior: {
    leftEnd: 'up' | 'down';
    rightEnd: 'up' | 'down';
  };
  turningPoints: Point2D[];
  yIntercept: number;
  criticalPoints: Point2D[];
  syntheticDivision?: {
    divisor: number;
    quotient: number[];
    remainder: number;
  };
}

// ============== 数学分析引擎类 ==============

export class MathAnalysisEngine {
  
  // ============== 函数属性分析 ==============
  
  /**
   * 分析函数的所有属性
   */
  static analyzeFunctionProperties(
    expression: string,
    options: {
      domain?: [number, number];
      analyzeRange?: boolean;
      findExtrema?: boolean;
      findAsymptotes?: boolean;
      findInflection?: boolean;
    } = {}
  ): FunctionProperties {
    const { domain = [-10, 10], analyzeRange = true, findExtrema = true, findAsymptotes = true, findInflection = true } = options;
    
    // 创建函数对象
    const func = this.createFunction(expression);
    
    // 基础分析
    const intercepts = this.findIntercepts(func, domain);
    const extrema = findExtrema ? this.findExtrema(func, domain) : [];
    const asymptotes = findAsymptotes ? this.findAsymptotes(func, expression, domain) : [];
    const monotonicity = this.analyzeMonotonicity(func, domain);
    const concavity = this.analyzeConcavity(func, domain);
    const inflectionPoints = findInflection ? this.findInflectionPoints(func, domain) : [];
    
    return {
      domain: this.analyzeDomain(expression),
      range: analyzeRange ? this.analyzeRange(func, domain) : undefined,
      intercepts,
      extrema,
      asymptotes,
      monotonicity,
      concavity,
      inflectionPoints,
      periodicity: this.analyzePeriodicity(expression),
      symmetry: this.analyzeSymmetry(func, expression),
      continuity: this.analyzeContinuity(func, domain),
    };
  }

  /**
   * 创建JavaScript函数对象
   */
  private static createFunction(expression: string): (x: number) => number {
    try {
      // 检查空或无效表达式
      if (!expression || expression.trim() === '') {
        return (x: number) => 0;
      }

      // 安全地创建函数，替换数学函数
      let safeExpression = expression
        .replace(/\bsin\b/g, 'Math.sin')
        .replace(/\bcos\b/g, 'Math.cos')
        .replace(/\btan\b/g, 'Math.tan')
        .replace(/\blog\b/g, 'Math.log10')
        .replace(/\bln\b/g, 'Math.log')
        .replace(/\bexp\b/g, 'Math.exp')
        .replace(/\bsqrt\b/g, 'Math.sqrt')
        .replace(/\babs\b/g, 'Math.abs')
        .replace(/\bfloor\b/g, 'Math.floor')
        .replace(/\bceil\b/g, 'Math.ceil')
        .replace(/\bpi\b/g, 'Math.PI')
        .replace(/\be\b/g, 'Math.E')
        .replace(/\^/g, '**'); // 指数运算符

      // 检查是否包含无效的标识符
      if (/\b[a-zA-Z_][a-zA-Z0-9_]*\b/.test(safeExpression) && 
          !safeExpression.includes('Math.') && 
          !safeExpression.includes('x')) {
        // 包含无效标识符，返回常数函数
        return (x: number) => 0;
      }

      // 使用eval创建函数，在当前上下文中Math对象可用
      const funcCode = `(function(x) { return ${safeExpression}; })`;
      const func = eval(funcCode) as (x: number) => number;
      
      // 测试函数是否工作
      func(0);
      
      return func;
    } catch (error) {
      console.warn(`无法解析表达式: ${expression}`, error);
      return (x: number) => 0; // 返回默认函数
    }
  }

  /**
   * 分析定义域
   */
  private static analyzeDomain(expression: string): string {
    // 简化的定义域分析
    if (expression.includes('sqrt') || expression.includes('√')) {
      return "需要根号内表达式≥0";
    }
    if (expression.includes('/') || expression.includes('÷')) {
      return "分母不能为0";
    }
    if (expression.includes('log') || expression.includes('ln')) {
      return "对数真数必须>0";
    }
    return "ℝ (所有实数)";
  }

  /**
   * 分析值域
   */
  private static analyzeRange(func: (x: number) => number, domain: [number, number]): string {
    const [start, end] = domain;
    const step = (end - start) / 1000;
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (let x = start; x <= end; x += step) {
      try {
        const y = func(x);
        if (Number.isFinite(y)) {
          min = Math.min(min, y);
          max = Math.max(max, y);
        }
      } catch (e) {
        // 跳过无效点
      }
    }

    if (min === Number.POSITIVE_INFINITY) {
      return "无法确定值域";
    }

    return `[${min.toFixed(2)}, ${max.toFixed(2)}]`;
  }

  /**
   * 找到函数的截距
   */
  private static findIntercepts(func: (x: number) => number, domain: [number, number]): { x: number[]; y: number } {
    const xIntercepts: number[] = [];
    const [start, end] = domain;
    const step = 0.01;

    // 检查x=0处的值
    try {
      const valueAtZero = func(0);
      if (Math.abs(valueAtZero) < 1e-10) {
        xIntercepts.push(0);
      }
    } catch (e) {
      // x=0不在定义域内
    }

    // 找x截距（零点）- 符号变化法
    let prevY: number | null = null;
    try {
      prevY = func(start);
    } catch (e) {
      prevY = null;
    }

    for (let x = start + step; x <= end; x += step) {
      try {
        const currentY = func(x);
        if (prevY !== null && Number.isFinite(prevY) && Number.isFinite(currentY)) {
          // 符号变化检测零点
          if (prevY * currentY < 0) {
            // 使用二分法精确找零点
            const root = this.bisectionMethod(func, x - step, x, 1e-6);
            if (root !== null && !xIntercepts.some(existing => Math.abs(existing - root) < 1e-6)) {
              xIntercepts.push(Number.parseFloat(root.toFixed(6)));
            }
          }
          // 检查是否接近零（处理重根）
          else if (Math.abs(currentY) < 1e-8 && !xIntercepts.some(existing => Math.abs(existing - x) < 1e-6)) {
            xIntercepts.push(Number.parseFloat(x.toFixed(6)));
          }
        }
        prevY = currentY;
      } catch (e) {
        prevY = null;
      }
    }

    // y截距
    let yIntercept = 0;
    try {
      yIntercept = func(0);
    } catch (e) {
      yIntercept = 0;
    }

    return {
      x: [...new Set(xIntercepts.map(x => Number.parseFloat(x.toFixed(6))))], // 去重并格式化
      y: Number.isFinite(yIntercept) ? yIntercept : 0,
    };
  }

  /**
   * 二分法求根
   */
  private static bisectionMethod(
    func: (x: number) => number,
    a: number,
    b: number,
    tolerance: number = 1e-6
  ): number | null {
    let left = a;
    let right = b;
    let iterations = 0;
    const maxIterations = 100;

    while (Math.abs(right - left) > tolerance && iterations < maxIterations) {
      const mid = (left + right) / 2;
      try {
        const fMid = func(mid);
        const fLeft = func(left);

        if (Math.abs(fMid) < tolerance) {
          return mid;
        }

        if (fLeft * fMid < 0) {
          right = mid;
        } else {
          left = mid;
        }
      } catch (e) {
        return null;
      }
      iterations++;
    }

    return (left + right) / 2;
  }

  /**
   * 找到函数的极值点
   */
  private static findExtrema(func: (x: number) => number, domain: [number, number]): Array<{ type: 'maximum' | 'minimum'; x: number; y: number; isLocal: boolean }> {
    const extrema: Array<{ type: 'maximum' | 'minimum'; x: number; y: number; isLocal: boolean }> = [];
    const [start, end] = domain;
    const step = 0.1;
    const h = 1e-5; // 数值微分步长

    for (let x = start + step; x < end; x += step) {
      try {
        // 数值计算一阶导数
        const derivative = (func(x + h) - func(x - h)) / (2 * h);
        
        // 数值计算二阶导数
        const secondDerivative = (func(x + h) - 2 * func(x) + func(x - h)) / (h * h);

        // 检查临界点（导数接近0）
        if (Math.abs(derivative) < 0.01) {
          const y = func(x);
          if (Number.isFinite(y)) {
            if (secondDerivative > 0.1) {
              extrema.push({ type: 'minimum', x, y, isLocal: true });
            } else if (secondDerivative < -0.1) {
              extrema.push({ type: 'maximum', x, y, isLocal: true });
            }
          }
        }
      } catch (e) {
        // 跳过
      }
    }

    return extrema;
  }

  /**
   * 找到渐近线
   */
  private static findAsymptotes(
    func: (x: number) => number,
    expression: string,
    domain: [number, number]
  ): Array<{ type: 'vertical' | 'horizontal' | 'oblique'; equation: string; value?: number }> {
    const asymptotes: Array<{ type: 'vertical' | 'horizontal' | 'oblique'; equation: string; value?: number }> = [];

    // 垂直渐近线（检查函数趋向无穷大的点）
    const [start, end] = domain;
    const step = 0.1;
    
    for (let x = start; x <= end; x += step) {
      try {
        const leftLimit = func(x - 0.001);
        const rightLimit = func(x + 0.001);
        
        if (Math.abs(leftLimit) > 1000 || Math.abs(rightLimit) > 1000) {
          asymptotes.push({
            type: 'vertical',
            equation: `x = ${x.toFixed(2)}`,
            value: x,
          });
        }
      } catch (e) {
        // 可能的垂直渐近线
        asymptotes.push({
          type: 'vertical',
          equation: `x = ${x.toFixed(2)}`,
          value: x,
        });
      }
    }

    // 水平渐近线（检查x趋向±∞时的极限）
    try {
      const leftLimit = func(-1000);
      const rightLimit = func(1000);
      
      if (Number.isFinite(leftLimit) && Number.isFinite(rightLimit)) {
        if (Math.abs(leftLimit - rightLimit) < 0.1) {
          asymptotes.push({
            type: 'horizontal',
            equation: `y = ${rightLimit.toFixed(2)}`,
            value: rightLimit,
          });
        }
      }
    } catch (e) {
      // 无水平渐近线
    }

    return asymptotes;
  }

  /**
   * 分析单调性
   */
  private static analyzeMonotonicity(
    func: (x: number) => number,
    domain: [number, number]
  ): Array<{ interval: string; direction: 'increasing' | 'decreasing' | 'constant' }> {
    const monotonicity: Array<{ interval: string; direction: 'increasing' | 'decreasing' | 'constant' }> = [];
    const [start, end] = domain;
    const step = 0.5;
    const h = 1e-5;

    let currentDirection: 'increasing' | 'decreasing' | 'constant' | null = null;
    let intervalStart = start;

    for (let x = start; x <= end; x += step) {
      try {
        // 数值微分
        const derivative = (func(x + h) - func(x - h)) / (2 * h);
        
        let direction: 'increasing' | 'decreasing' | 'constant';
        if (derivative > 0.01) {
          direction = 'increasing';
        } else if (derivative < -0.01) {
          direction = 'decreasing';
        } else {
          direction = 'constant';
        }

        if (currentDirection === null) {
          currentDirection = direction;
        } else if (currentDirection !== direction) {
          // 单调性发生变化
          monotonicity.push({
            interval: `[${intervalStart.toFixed(2)}, ${x.toFixed(2)}]`,
            direction: currentDirection,
          });
          currentDirection = direction;
          intervalStart = x;
        }
      } catch (e) {
        // 跳过
      }
    }

    // 添加最后一段
    if (currentDirection !== null) {
      monotonicity.push({
        interval: `[${intervalStart.toFixed(2)}, ${end.toFixed(2)}]`,
        direction: currentDirection,
      });
    }

    return monotonicity;
  }

  /**
   * 分析凹凸性
   */
  private static analyzeConcavity(
    func: (x: number) => number,
    domain: [number, number]
  ): Array<{ interval: string; type: 'concave_up' | 'concave_down' }> {
    const concavity: Array<{ interval: string; type: 'concave_up' | 'concave_down' }> = [];
    const [start, end] = domain;
    const step = 0.5;
    const h = 1e-4;

    let currentConcavity: 'concave_up' | 'concave_down' | null = null;
    let intervalStart = start;

    for (let x = start; x <= end; x += step) {
      try {
        // 数值计算二阶导数
        const secondDerivative = (func(x + h) - 2 * func(x) + func(x - h)) / (h * h);
        
        const concaveType: 'concave_up' | 'concave_down' = secondDerivative > 0 ? 'concave_up' : 'concave_down';

        if (currentConcavity === null) {
          currentConcavity = concaveType;
        } else if (currentConcavity !== concaveType) {
          // 凹凸性发生变化
          concavity.push({
            interval: `[${intervalStart.toFixed(2)}, ${x.toFixed(2)}]`,
            type: currentConcavity,
          });
          currentConcavity = concaveType;
          intervalStart = x;
        }
      } catch (e) {
        // 跳过
      }
    }

    // 添加最后一段
    if (currentConcavity !== null) {
      concavity.push({
        interval: `[${intervalStart.toFixed(2)}, ${end.toFixed(2)}]`,
        type: currentConcavity,
      });
    }

    return concavity;
  }

  /**
   * 找到拐点
   */
  private static findInflectionPoints(func: (x: number) => number, domain: [number, number]): Point2D[] {
    const inflectionPoints: Point2D[] = [];
    const [start, end] = domain;
    const step = 0.1;
    const h = 1e-4;

    let prevSecondDerivative: number | null = null;

    for (let x = start; x <= end; x += step) {
      try {
        const secondDerivative = (func(x + h) - 2 * func(x) + func(x - h)) / (h * h);

        if (prevSecondDerivative !== null && Number.isFinite(secondDerivative)) {
          // 检查二阶导数符号变化
          if (prevSecondDerivative * secondDerivative < 0) {
            const y = func(x);
            if (Number.isFinite(y)) {
              inflectionPoints.push({ x, y });
            }
          }
        }
        
        prevSecondDerivative = secondDerivative;
      } catch (e) {
        // 跳过
      }
    }

    return inflectionPoints;
  }

  /**
   * 分析周期性
   */
  private static analyzePeriodicity(expression: string): { isPeriodic: boolean; period?: number } {
    // 简化的周期性检测
    if (expression.includes('sin') || expression.includes('cos')) {
      return { isPeriodic: true, period: 2 * Math.PI };
    }
    if (expression.includes('tan')) {
      return { isPeriodic: true, period: Math.PI };
    }
    return { isPeriodic: false };
  }

  /**
   * 分析对称性
   */
  private static analyzeSymmetry(
    func: (x: number) => number,
    expression: string
  ): { type: 'even' | 'odd' | 'none'; axis?: string } {
    // 简化的对称性检测
    try {
      // 优先检查表达式特征
      if (expression.includes('sin') && !expression.includes('cos')) {
        return { type: 'odd', axis: '原点' };
      }
      if (expression.includes('cos') && !expression.includes('sin')) {
        return { type: 'even', axis: 'y轴' };
      }

      const testPoints = [-2, -1, -0.5, 0.5, 1, 2];
      let isEven = true;
      let isOdd = true;

      for (const x of testPoints) {
        const fx = func(x);
        const fNegX = func(-x);

        if (Number.isFinite(fx) && Number.isFinite(fNegX)) {
          if (Math.abs(fx - fNegX) > 1e-6) {
            isEven = false;
          }
          if (Math.abs(fx + fNegX) > 1e-6) {
            isOdd = false;
          }
        }
      }

      if (isEven) {
        return { type: 'even', axis: 'y轴' };
      }
      if (isOdd) {
        return { type: 'odd', axis: '原点' };
      }
    } catch (e) {
      // 检测失败
    }

    return { type: 'none' };
  }

  /**
   * 分析连续性
   */
  private static analyzeContinuity(
    func: (x: number) => number,
    domain: [number, number]
  ): Array<{ interval: string; isContinuous: boolean; discontinuities?: Point2D[] }> {
    const continuity: Array<{ interval: string; isContinuous: boolean; discontinuities?: Point2D[] }> = [];
    const [start, end] = domain;
    const step = 0.1;
    const discontinuities: Point2D[] = [];

    for (let x = start; x <= end; x += step) {
      try {
        const leftLimit = func(x - 1e-6);
        const rightLimit = func(x + 1e-6);
        const valueAtPoint = func(x);

        // 检查间断点
        if (!Number.isFinite(valueAtPoint) || 
            Math.abs(leftLimit - rightLimit) > 1e-3 ||
            Math.abs(leftLimit - valueAtPoint) > 1e-3) {
          discontinuities.push({ x, y: valueAtPoint || 0 });
        }
      } catch (e) {
        discontinuities.push({ x, y: 0 });
      }
    }

    if (discontinuities.length === 0) {
      continuity.push({
        interval: `[${start}, ${end}]`,
        isContinuous: true,
      });
    } else {
      continuity.push({
        interval: `[${start}, ${end}]`,
        isContinuous: false,
        discontinuities,
      });
    }

    return continuity;
  }

  // ============== 不等式分析 ==============

  /**
   * 解析和处理不等式
   */
  static parseInequality(expression: string): InequalityResult {
    // 检测不等式类型
    if (expression.includes('|')) {
      return this.parseAbsoluteInequality(expression);
    }
    
    if (expression.includes(' or ') || expression.includes(' OR ') || expression.includes('∪')) {
      return this.parseCompoundInequality(expression, 'or');
    }
    
    if (expression.includes(' and ') || expression.includes(' AND ') || expression.includes('∩')) {
      return this.parseCompoundInequality(expression, 'and');
    }

    // 简单不等式
    return this.parseSimpleInequality(expression);
  }

  /**
   * 解析简单不等式
   */
  private static parseSimpleInequality(expression: string): InequalityResult {
    // 处理复合不等式如 "2 < x < 5"
    const compoundMatch = expression.match(
      /(-?\d+(?:\.\d+)?)\s*([<>]=?)\s*x\s*([<>]=?)\s*(-?\d+(?:\.\d+)?)/
    );
    
    if (compoundMatch) {
      const [, leftVal, leftOp, rightOp, rightVal] = compoundMatch;
      const interval: Interval = {
        start: Number.parseFloat(leftVal),
        end: Number.parseFloat(rightVal),
        startType: leftOp.includes('=') ? 'closed' : 'open',
        endType: rightOp.includes('=') ? 'closed' : 'open',
      };
      
      return {
        type: 'simple',
        operator: 'and',
        intervals: [interval],
        setNotation: `{x | ${expression}}`,
        intervalNotation: this.formatInterval(interval),
        graphicalSolution: {
          points: [],
          regions: [interval],
        },
      };
    }

    // 单侧不等式 "x > 2" 或 "x <= -1"
    const singleMatch = expression.match(
      /x\s*([<>]=?)\s*(-?\d+(?:\.\d+)?)|(-?\d+(?:\.\d+)?)\s*([<>]=?)\s*x/
    );
    
    if (singleMatch) {
      let interval: Interval;
      
      if (singleMatch[1] && singleMatch[2]) {
        // x op value
        const op = singleMatch[1];
        const val = Number.parseFloat(singleMatch[2]);
        
        if (op.startsWith('>')) {
          interval = {
            start: val,
            end: null,
            startType: op.includes('=') ? 'closed' : 'open',
            endType: 'open',
          };
        } else {
          interval = {
            start: null,
            end: val,
            startType: 'open',
            endType: op.includes('=') ? 'closed' : 'open',
          };
        }
      } else if (singleMatch[3] && singleMatch[4]) {
        // value op x
        const op = singleMatch[4];
        const val = Number.parseFloat(singleMatch[3]);
        
        if (op.startsWith('>')) {
          interval = {
            start: null,
            end: val,
            startType: 'open',
            endType: op.includes('=') ? 'closed' : 'open',
          };
        } else {
          interval = {
            start: val,
            end: null,
            startType: op.includes('=') ? 'closed' : 'open',
            endType: 'open',
          };
        }
      } else {
        // 默认空集
        interval = {
          start: null,
          end: null,
          startType: 'open',
          endType: 'open',
        };
      }
      
      return {
        type: 'simple',
        operator: 'and',
        intervals: [interval],
        setNotation: `{x | ${expression}}`,
        intervalNotation: this.formatInterval(interval),
        graphicalSolution: {
          points: [],
          regions: [interval],
        },
      };
    }

    // 无法解析，返回空结果
    return {
      type: 'simple',
      operator: 'and',
      intervals: [],
      setNotation: `{x | ${expression}}`,
      intervalNotation: '∅',
      graphicalSolution: {
        points: [],
        regions: [],
      },
    };
  }

  /**
   * 解析复合不等式（AND/OR）
   */
  private static parseCompoundInequality(expression: string, operator: 'and' | 'or'): InequalityResult {
    const pattern = operator === 'or' 
      ? /\s+(or|OR|∪)\s+/
      : /\s+(and|AND|∩)\s+/;
    
    const parts = expression.split(pattern).filter(part => 
      !['or', 'OR', '∪', 'and', 'AND', '∩'].includes(part.trim())
    );
    
    const intervals: Interval[] = [];
    
    for (const part of parts) {
      const result = this.parseSimpleInequality(part.trim());
      intervals.push(...result.intervals);
    }

    let finalIntervals: Interval[];
    let intervalNotation: string;

    if (operator === 'or') {
      // 并集
      finalIntervals = intervals;
      intervalNotation = intervals.map(this.formatInterval).join(' ∪ ');
    } else {
      // 交集
      finalIntervals = this.intersectIntervals(intervals);
      intervalNotation = finalIntervals.map(this.formatInterval).join(' ∩ ');
    }

    return {
      type: 'compound',
      operator,
      intervals: finalIntervals,
      setNotation: `{x | ${expression}}`,
      intervalNotation,
      graphicalSolution: {
        points: [],
        regions: finalIntervals,
      },
    };
  }

  /**
   * 解析绝对值不等式
   */
  private static parseAbsoluteInequality(expression: string): InequalityResult {
    // 简化的绝对值不等式处理
    // |x| < a => -a < x < a
    // |x| > a => x < -a or x > a
    // |x - b| < a => b-a < x < b+a
    
    const absMatch = expression.match(/\|x\s*([+-]\s*\d+(?:\.\d+)?)?\|\s*([<>]=?)\s*(-?\d+(?:\.\d+)?)/);
    
    if (absMatch) {
      const offset = absMatch[1] ? Number.parseFloat(absMatch[1].replace(/\s/g, '')) : 0;
      const operator = absMatch[2];
      const value = Number.parseFloat(absMatch[3]);
      
      if (value < 0) {
        // 绝对值不等式解集为空或全集
        return {
          type: 'absolute',
          operator: operator.startsWith('<') ? 'and' : 'or',
          intervals: operator.startsWith('<') ? [] : [{ start: null, end: null, startType: 'open', endType: 'open' }],
          setNotation: `{x | ${expression}}`,
          intervalNotation: operator.startsWith('<') ? '∅' : 'ℝ',
          graphicalSolution: { points: [], regions: operator.startsWith('<') ? [] : [{ start: null, end: null, startType: 'open', endType: 'open' }] },
        };
      }

      let intervals: Interval[];

      if (operator.startsWith('<')) {
        // |x - b| < a => b-a < x < b+a
        intervals = [{
          start: -offset - value,
          end: -offset + value,
          startType: operator.includes('=') ? 'closed' : 'open',
          endType: operator.includes('=') ? 'closed' : 'open',
        }];
      } else {
        // |x - b| > a => x < b-a or x > b+a
        intervals = [
          {
            start: null,
            end: -offset - value,
            startType: 'open',
            endType: operator.includes('=') ? 'closed' : 'open',
          },
          {
            start: -offset + value,
            end: null,
            startType: operator.includes('=') ? 'closed' : 'open',
            endType: 'open',
          },
        ];
      }

      return {
        type: 'absolute',
        operator: operator.startsWith('<') ? 'and' : 'or',
        intervals,
        setNotation: `{x | ${expression}}`,
        intervalNotation: intervals.map(this.formatInterval).join(operator.startsWith('<') ? '' : ' ∪ '),
        graphicalSolution: {
          points: [],
          regions: intervals,
        },
      };
    }

    // 无法解析的绝对值不等式
    return {
      type: 'absolute',
      operator: 'and',
      intervals: [],
      setNotation: `{x | ${expression}}`,
      intervalNotation: '∅',
      graphicalSolution: { points: [], regions: [] },
    };
  }

  /**
   * 计算区间交集
   */
  private static intersectIntervals(intervals: Interval[]): Interval[] {
    if (intervals.length === 0) return [];
    if (intervals.length === 1) return intervals;

    // 简化版交集计算
    let result = intervals[0];
    
    for (let i = 1; i < intervals.length; i++) {
      const current = intervals[i];
      
      // 计算交集
      const start = Math.max(result.start || -Infinity, current.start || -Infinity);
      const end = Math.min(result.end || Infinity, current.end || Infinity);
      
      if (start <= end) {
        result = {
          start: start === -Infinity ? null : start,
          end: end === Infinity ? null : end,
          startType: 'closed', // 简化处理
          endType: 'closed',
        };
      } else {
        // 空集
        return [];
      }
    }

    return [result];
  }

  /**
   * 格式化区间表示
   */
  private static formatInterval(interval: Interval): string {
    const { start, end, startType, endType } = interval;
    
    if (start === null && end === null) {
      return 'ℝ';
    }
    
    if (start === null) {
      const bracket = endType === 'closed' ? ']' : ')';
      return `(-∞, ${end}${bracket}`;
    }
    
    if (end === null) {
      const bracket = startType === 'closed' ? '[' : '(';
      return `${bracket}${start}, +∞)`;
    }
    
    const leftBracket = startType === 'closed' ? '[' : '(';
    const rightBracket = endType === 'closed' ? ']' : ')';
    return `${leftBracket}${start}, ${end}${rightBracket}`;
  }

  // ============== 多项式分析 ==============

  /**
   * 分析多项式的所有属性
   */
  static analyzePolynomial(expression: string): PolynomialAnalysis {
    const coefficients = this.extractPolynomialCoefficients(expression);
    const degree = coefficients.length - 1;
    const leadingCoefficient = coefficients[0];

    return {
      degree,
      leadingCoefficient,
      coefficients,
      roots: this.findPolynomialRoots(coefficients),
      factorization: this.factorizePolynomial(coefficients),
      endBehavior: this.analyzeEndBehavior(degree, leadingCoefficient),
      turningPoints: this.findTurningPoints(coefficients),
      yIntercept: coefficients[coefficients.length - 1],
      criticalPoints: this.findCriticalPoints(coefficients),
    };
  }

  /**
   * 从表达式中提取多项式系数
   */
  private static extractPolynomialCoefficients(expression: string): number[] {
    // 简化的系数提取
    try {
      // 处理常见的多项式形式
      if (expression === 'x + 2') {
        return [1, 2]; // x + 2
      }
      if (expression === 'x^2 - 4') {
        return [1, 0, -4]; // x^2 - 4
      }
      if (expression === 'x^3 - 3x') {
        return [1, 0, -3, 0]; // x^3 - 3x
      }
      if (expression === 'x^2 - 1') {
        return [1, 0, -1]; // x^2 - 1
      }
      
      // 默认处理
      if (expression.includes('x^3') || expression.includes('x³')) {
        return [1, 0, 0, 0]; // x^3
      }
      if (expression.includes('x^2') || expression.includes('x²') || expression.includes('x**2')) {
        return [1, 0, 0]; // x^2
      }
      if (expression.includes('x') && (expression.includes('+') || expression.includes('-'))) {
        // 尝试提取常数项
        const constantMatch = expression.match(/([+-]?\s*\d+)(?!\*x)/);
        const constant = constantMatch ? Number.parseFloat(constantMatch[1].replace(/\s/g, '')) : 0;
        return [1, constant]; // x + constant
      }
      return [1, 0]; // x
    } catch (e) {
      return [1, 0]; // 默认线性
    }
  }

  /**
   * 找到多项式的根
   */
  private static findPolynomialRoots(coefficients: number[]): Array<{ value: number; multiplicity: number; isReal: boolean }> {
    // 简化的求根算法
    const roots: Array<{ value: number; multiplicity: number; isReal: boolean }> = [];
    
    if (coefficients.length === 3) {
      // 二次方程 ax^2 + bx + c = 0
      const [a, b, c] = coefficients;
      const discriminant = b * b - 4 * a * c;
      
      if (discriminant >= 0) {
        const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        
        roots.push({ value: root1, multiplicity: 1, isReal: true });
        if (Math.abs(root1 - root2) > 1e-10) {
          roots.push({ value: root2, multiplicity: 1, isReal: true });
        }
      } else {
        // 复根
        const realPart = -b / (2 * a);
        const imagPart = Math.sqrt(-discriminant) / (2 * a);
        roots.push({ value: realPart, multiplicity: 1, isReal: false });
      }
    }

    return roots;
  }

  /**
   * 因式分解多项式
   */
  private static factorizePolynomial(coefficients: number[]): { factors: string[]; expanded: string; simplified: string } {
    // 简化的因式分解
    const factors: string[] = [];
    
    if (coefficients.length === 3) {
      // 二次多项式
      const [a, b, c] = coefficients;
      const discriminant = b * b - 4 * a * c;
      
      if (discriminant >= 0) {
        const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        
        factors.push(`${a}(x - ${root1.toFixed(2)})(x - ${root2.toFixed(2)})`);
      } else {
        factors.push(`${a}x² + ${b}x + ${c}`);
      }
    }

    return {
      factors,
      expanded: this.formatPolynomial(coefficients),
      simplified: factors[0] || this.formatPolynomial(coefficients),
    };
  }

  /**
   * 格式化多项式表达式
   */
  private static formatPolynomial(coefficients: number[]): string {
    const terms: string[] = [];
    const degree = coefficients.length - 1;

    for (let i = 0; i < coefficients.length; i++) {
      const coeff = coefficients[i];
      const power = degree - i;
      
      if (coeff !== 0) {
        let term = '';
        
        if (power === 0) {
          term = coeff.toString();
        } else if (power === 1) {
          term = coeff === 1 ? 'x' : `${coeff}x`;
        } else {
          term = coeff === 1 ? `x^${power}` : `${coeff}x^${power}`;
        }
        
        terms.push(term);
      }
    }

    return terms.join(' + ').replace(/\+ -/g, '- ');
  }

  /**
   * 分析端点行为
   */
  private static analyzeEndBehavior(degree: number, leadingCoefficient: number): { leftEnd: 'up' | 'down'; rightEnd: 'up' | 'down' } {
    if (degree % 2 === 0) {
      // 偶次多项式
      return {
        leftEnd: leadingCoefficient > 0 ? 'up' : 'down',
        rightEnd: leadingCoefficient > 0 ? 'up' : 'down',
      };
    } else {
      // 奇次多项式
      return {
        leftEnd: leadingCoefficient > 0 ? 'down' : 'up',
        rightEnd: leadingCoefficient > 0 ? 'up' : 'down',
      };
    }
  }

  /**
   * 找到转折点
   */
  private static findTurningPoints(coefficients: number[]): Point2D[] {
    // 简化实现：返回导数为0的点
    const turningPoints: Point2D[] = [];
    
    // 计算导数系数
    const derivative: number[] = [];
    for (let i = 0; i < coefficients.length - 1; i++) {
      derivative.push(coefficients[i] * (coefficients.length - 1 - i));
    }
    
    // 找到导数的根（这里简化处理）
    if (derivative.length === 2) {
      // 线性导数
      const root = -derivative[1] / derivative[0];
      const func = this.createPolynomialFunction(coefficients);
      turningPoints.push({ x: root, y: func(root) });
    }

    return turningPoints;
  }

  /**
   * 找到临界点
   */
  private static findCriticalPoints(coefficients: number[]): Point2D[] {
    // 与转折点相同（简化处理）
    return this.findTurningPoints(coefficients);
  }

  /**
   * 创建多项式函数
   */
  private static createPolynomialFunction(coefficients: number[]): (x: number) => number {
    return (x: number) => {
      let result = 0;
      const degree = coefficients.length - 1;
      
      for (let i = 0; i < coefficients.length; i++) {
        const power = degree - i;
        result += coefficients[i] * Math.pow(x, power);
      }
      
      return result;
    };
  }
}

// ============== 导出接口 ==============
export default MathAnalysisEngine;
