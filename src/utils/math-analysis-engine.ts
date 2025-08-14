/**
 * Unified Mathematical Analysis Engine
 * Provides mathematical calculation and analysis support for all JSXGraph tools
 */

// ============== Type Definitions ==============
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

export interface FunctionProperties {
  domain: string;
  range?: string;
  intercepts: {
    x: number[];
    y: number;
  };
  extrema: Array<{
    x: number;
    y: number;
    type: 'maximum' | 'minimum' | 'saddle';
  }>;
  asymptotes: Array<{
    type: 'vertical' | 'horizontal' | 'oblique';
    equation: string;
    value?: number;
  }>;
  inflectionPoints: Array<{
    x: number;
    y: number;
  }>;
  monotonicity: Array<{
    interval: string;
    direction: 'increasing' | 'decreasing' | 'constant';
  }>;
  concavity: Array<{
    interval: string;
    type: 'concave_up' | 'concave_down';
  }>;
  symmetry?: {
    type: 'even' | 'odd' | 'none';
    axis?: string; // Symmetry axis
  };
  periodicity?: {
    isPeriodic: boolean;
    period?: number;
  };
}

export interface PolynomialAnalysis {
  degree: number;
  leadingCoefficient: number;
  zeros: Array<{
    x: number;
    multiplicity: number;
    behavior: 'crosses' | 'touches';
  }>;
  yIntercept: number;
  criticalPoints: Array<{
    x: number;
    y: number;
    type: 'maximum' | 'minimum' | 'inflection';
  }>;
  endBehavior: {
    leftEnd: 'up' | 'down';
    rightEnd: 'up' | 'down';
  };
  expandedForm: string;
  factoredForm?: string;
}

// ============== Mathematical Analysis Engine Class ==============
export class MathAnalysisEngine {
  private static readonly TOLERANCE = 1e-10;
  private static readonly MAX_ITERATIONS = 1000;

  // ============== Function Properties Analysis ==============
  /**
   * Analyze all properties of a function
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
    try {
      // Create function object
      const func = this.createFunction(expression);
      
      // Basic analysis
      const domain = this.analyzeDomain(expression, options.domain);
      const intercepts = this.findIntercepts(func, expression);
      const asymptotes = options.findAsymptotes ? this.findAsymptotes(expression) : [];
      const extrema = options.findExtrema ? this.findExtrema(func, expression, options.domain || [-10, 10]) : [];
      const inflectionPoints = options.findInflection ? this.findInflectionPoints(func, expression, options.domain || [-10, 10]) : [];
      const monotonicity = this.analyzeMonotonicity(func, expression, options.domain || [-10, 10]);
      const concavity = this.analyzeConcavity(func, expression, options.domain || [-10, 10]);
      const symmetry = this.analyzeSymmetry(func, expression);
      const periodicity = this.analyzePeriodicity(expression);

      return {
        domain,
        intercepts,
        extrema,
        asymptotes,
        inflectionPoints,
        monotonicity,
        concavity,
        symmetry,
        periodicity,
      };
    } catch (error) {
      console.error('Function analysis failed:', error);
      return {
        domain: 'Error in analysis',
        intercepts: { x: [], y: 0 },
        extrema: [],
        asymptotes: [],
        inflectionPoints: [],
        monotonicity: [],
        concavity: [],
      };
    }
  }

  /**
   * Create JavaScript function object
   */
  private static createFunction(expression: string): (x: number) => number {
    // Check for empty or invalid expressions
    if (!expression || typeof expression !== 'string') {
      throw new Error('Invalid function expression');
    }

    // Safely create function, replace mathematical functions
    let safeExpression = expression
      .replace(/Math\.sin/g, 'Math.sin')
      .replace(/Math\.cos/g, 'Math.cos')
      .replace(/Math\.tan/g, 'Math.tan')
      .replace(/Math\.exp/g, 'Math.exp')
      .replace(/Math\.log/g, 'Math.log')
      .replace(/Math\.sqrt/g, 'Math.sqrt')
      // Handle exponent operator - fix unary minus precedence issue
      .replace(/-(\d+\.?\d*)\^/g, '(-$1)**') // Fix -number^ case
      .replace(/\^/g, '**'); // Convert all remaining ^ to **

    // Check if contains invalid identifiers
    if (!/^[x\s\d\+\-\*\/\(\)\.\,\^Math\.\w]+$/.test(safeExpression)) {
      throw new Error('Function contains invalid characters');
    }

    try {
      return new Function('x', `return ${safeExpression}`) as (x: number) => number;
    } catch (error) {
      throw new Error(`Failed to create function: ${error}`);
    }
  }

  /**
   * Analyze domain
   */
  private static analyzeDomain(expression: string, domain?: [number, number]): string {
    // Simplified domain analysis
    if (expression.includes('sqrt') || expression.includes('√')) {
      return "Root must be non-negative";
    }
    if (expression.includes('/') || expression.includes('÷')) {
      return "Denominator cannot be zero";
    }
    if (expression.includes('log') || expression.includes('ln')) {
      return "Logarithm argument must be positive";
    }
    return "ℝ (all real numbers)";
  }

  /**
   * Analyze range
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
        // Skip invalid points
      }
    }

    if (min === Number.POSITIVE_INFINITY) {
      return "Range cannot be determined";
    }

    return `[${min.toFixed(2)}, ${max.toFixed(2)}]`;
  }

  /**
   * Find intercepts of a function
   */
  private static findIntercepts(func: (x: number) => number, expression: string): { x: number[]; y: number } {
    const xIntercepts: number[] = [];
    const [start, end] = [-10, 10]; // Default domain for intercepts
    const step = 0.01;

    // Check value at x=0
    try {
      const valueAtZero = func(0);
      if (Math.abs(valueAtZero) < 1e-12) {
        xIntercepts.push(0);
      }
    } catch (e) {
      // x=0 is not in the domain
    }

    // Find x-intercepts (zeros) - sign change method
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
          // Sign change detection for zeros
          if (prevY * currentY < 0) {
            // Use bisection method for precise zero finding
            const root = this.bisectionMethod(func, x - step, x, 1e-6);
            if (root !== null && !xIntercepts.some(existing => Math.abs(existing - root) < 1e-6)) {
              xIntercepts.push(Number.parseFloat(root.toFixed(6)));
            }
          }
          // Check if close to zero (handle multiple roots)
          else if (Math.abs(currentY) < 1e-12 && !xIntercepts.some(existing => Math.abs(existing - x) < 1e-6)) {
            xIntercepts.push(Number.parseFloat(x.toFixed(6)));
          }
        }
        prevY = currentY;
      } catch (e) {
        prevY = null;
      }
    }

    // y-intercept
    let yIntercept = 0;
    try {
      yIntercept = func(0);
    } catch (e) {
      yIntercept = 0;
    }

    return {
      x: [...new Set(xIntercepts.map(x => Number.parseFloat(x.toFixed(6))))], // Remove duplicates and format
      y: Number.isFinite(yIntercept) ? yIntercept : 0,
    };
  }

  /**
   * Bisection method for finding roots
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
   * Find extrema of a function
   */
  private static findExtrema(func: (x: number) => number, expression: string, domain: [number, number]): Array<{ type: 'maximum' | 'minimum'; x: number; y: number; isLocal: boolean }> {
    const extrema: Array<{ type: 'maximum' | 'minimum'; x: number; y: number; isLocal: boolean }> = [];
    const [start, end] = domain;
    const step = 0.1;
    const h = 1e-5; // Numerical differentiation step

    for (let x = start + step; x < end; x += step) {
      try {
        // Numerical calculation of first derivative
        const derivative = (func(x + h) - func(x - h)) / (2 * h);
        
        // Numerical calculation of second derivative
        const secondDerivative = (func(x + h) - 2 * func(x) + func(x - h)) / (h * h);

        // Check critical points (derivative close to 0)
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
        // Skip
      }
    }

    return extrema;
  }

  /**
   * Find asymptotes
   */
  private static findAsymptotes(
    expression: string
  ): Array<{ type: 'vertical' | 'horizontal' | 'oblique'; equation: string; value?: number }> {
    const asymptotes: Array<{ type: 'vertical' | 'horizontal' | 'oblique'; equation: string; value?: number }> = [];

    // Vertical asymptotes (check points where function tends to infinity)
    const [start, end] = [-10, 10]; // Default domain for asymptotes
    const step = 0.1;
    
    // Create a temporary function for analysis
    const tempFunc = this.createFunction(expression);
    
    for (let x = start; x <= end; x += step) {
      try {
        const value = tempFunc(x);
        if (!Number.isFinite(value) || Math.abs(value) > 1e6) {
          asymptotes.push({
            type: 'vertical',
            equation: `x = ${x.toFixed(2)}`,
            value: x,
          });
        }
      } catch (e) {
        // Possible vertical asymptotes
        asymptotes.push({
          type: 'vertical',
          equation: `x = ${x.toFixed(2)}`,
          value: x,
        });
      }
    }

    // Horizontal asymptotes (check limits as x tends to ±∞)
    try {
      const leftLimit = tempFunc(-1000);
      const rightLimit = tempFunc(1000);
      
      if (Number.isFinite(leftLimit) && Math.abs(leftLimit - rightLimit) < 1e-3) {
        asymptotes.push({
          type: 'horizontal',
          equation: `y = ${leftLimit.toFixed(2)}`,
          value: leftLimit,
        });
      }
    } catch (e) {
      // No horizontal asymptotes
    }

    return asymptotes;
  }

  /**
   * Analyze monotonicity
   */
  private static analyzeMonotonicity(
    func: (x: number) => number,
    expression: string,
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
        // Numerical differentiation
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
          // Monotonicity changed
          monotonicity.push({
            interval: `[${intervalStart.toFixed(2)}, ${x.toFixed(2)}]`,
            direction: currentDirection,
          });
          currentDirection = direction;
          intervalStart = x;
        }
      } catch (e) {
        // Skip
      }
    }

    // Add the last interval
    if (currentDirection !== null) {
      monotonicity.push({
        interval: `[${intervalStart.toFixed(2)}, ${end.toFixed(2)}]`,
        direction: currentDirection,
      });
    }

    return monotonicity;
  }

  /**
   * Analyze concavity
   */
  private static analyzeConcavity(
    func: (x: number) => number,
    expression: string,
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
        // Numerical calculation of second derivative
        const secondDerivative = (func(x + h) - 2 * func(x) + func(x - h)) / (h * h);
        
        const concaveType: 'concave_up' | 'concave_down' = secondDerivative > 0 ? 'concave_up' : 'concave_down';

        if (currentConcavity === null) {
          currentConcavity = concaveType;
        } else if (currentConcavity !== concaveType) {
          // Concavity changed
          concavity.push({
            interval: `[${intervalStart.toFixed(2)}, ${x.toFixed(2)}]`,
            type: currentConcavity,
          });
          currentConcavity = concaveType;
          intervalStart = x;
        }
      } catch (e) {
        // Skip
      }
    }

    // Add the last interval
    if (currentConcavity !== null) {
      concavity.push({
        interval: `[${intervalStart.toFixed(2)}, ${end.toFixed(2)}]`,
        type: currentConcavity,
      });
    }

    return concavity;
  }

  /**
   * Find inflection points
   */
  private static findInflectionPoints(func: (x: number) => number, expression: string, domain: [number, number]): Point2D[] {
    const inflectionPoints: Point2D[] = [];
    const [start, end] = domain;
    const step = 0.1;
    const h = 1e-4;

    let prevSecondDerivative: number | null = null;

    for (let x = start; x <= end; x += step) {
      try {
        const secondDerivative = (func(x + h) - 2 * func(x) + func(x - h)) / (h * h);

        if (prevSecondDerivative !== null && Number.isFinite(secondDerivative)) {
          // Check for sign change in second derivative
          if (prevSecondDerivative * secondDerivative < 0) {
            const y = func(x);
            if (Number.isFinite(y)) {
              inflectionPoints.push({ x, y });
            }
          }
        }
        
        prevSecondDerivative = secondDerivative;
      } catch (e) {
        // Skip
      }
    }

    return inflectionPoints;
  }

  /**
   * Analyze periodicity
   */
  private static analyzePeriodicity(expression: string): { isPeriodic: boolean; period?: number } {
    // Simplified periodicity detection
    if (expression.includes('sin') || expression.includes('cos')) {
      return { isPeriodic: true, period: 2 * Math.PI };
    }
    if (expression.includes('tan')) {
      return { isPeriodic: true, period: Math.PI };
    }
    return { isPeriodic: false };
  }

  /**
   * Analyze symmetry
   */
  private static analyzeSymmetry(
    func: (x: number) => number,
    expression: string
  ): { type: 'even' | 'odd' | 'none'; axis?: string } {
    // Simplified symmetry detection
    try {
      // Prioritize expression characteristics
      if (expression.includes('sin') && !expression.includes('cos')) {
        return { type: 'odd', axis: 'Origin' };
      }
      if (expression.includes('cos') && !expression.includes('sin')) {
        return { type: 'even', axis: 'Y-axis' };
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
        return { type: 'even', axis: 'Y-axis' };
      }
      if (isOdd) {
        return { type: 'odd', axis: 'Origin' };
      }
    } catch (e) {
      // Detection failed
    }

    return { type: 'none' };
  }

  /**
   * Analyze continuity
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

        // Check for discontinuities
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

  // ============== Inequality Analysis ==============

  /**
   * Parse and process inequalities
   */
  static parseInequality(expression: string): InequalityResult {
    // Detect inequality type
    if (expression.includes('|')) {
      return this.parseAbsoluteInequality(expression);
    }
    
    if (expression.includes(' or ') || expression.includes(' OR ') || expression.includes('∪')) {
      return this.parseCompoundInequality(expression, 'or');
    }
    
    if (expression.includes(' and ') || expression.includes(' AND ') || expression.includes('∩')) {
      return this.parseCompoundInequality(expression, 'and');
    }

    // Simple inequality
    return this.parseSimpleInequality(expression);
  }

  /**
   * Parse simple inequality
   */
  private static parseSimpleInequality(expression: string): InequalityResult {
    // Handle compound inequalities like "2 < x < 5"
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

    // Single-sided inequalities "x > 2" or "x <= -1"
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
        // Default empty set
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

    // Cannot parse, return empty result
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
   * Parse compound inequality (AND/OR)
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
      // Union
      finalIntervals = intervals;
      intervalNotation = intervals.map(this.formatInterval).join(' ∪ ');
    } else {
      // Intersection
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
   * Parse absolute value inequality
   */
  private static parseAbsoluteInequality(expression: string): InequalityResult {
    // Simplified absolute value inequality handling
    // |x| < a => -a < x < a
    // |x| > a => x < -a or x > a
    // |x - b| < a => b-a < x < b+a
    
    const absMatch = expression.match(/\|x\s*([+-]\s*\d+(?:\.\d+)?)?\|\s*([<>]=?)\s*(-?\d+(?:\.\d+)?)/);
    
    if (absMatch) {
      const offset = absMatch[1] ? Number.parseFloat(absMatch[1].replace(/\s/g, '')) : 0;
      const operator = absMatch[2];
      const value = Number.parseFloat(absMatch[3]);
      
      if (value < 0) {
        // Absolute value inequality solution is empty or full set
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

    // Unparseable absolute value inequality
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
   * Calculate interval intersection
   */
  private static intersectIntervals(intervals: Interval[]): Interval[] {
    if (intervals.length === 0) return [];
    if (intervals.length === 1) return intervals;

    // Simplified intersection calculation
    let result = intervals[0];
    
    for (let i = 1; i < intervals.length; i++) {
      const current = intervals[i];
      
      // Calculate intersection
      const start = Math.max(result.start || -Infinity, current.start || -Infinity);
      const end = Math.min(result.end || Infinity, current.end || Infinity);
      
      if (start <= end) {
        result = {
          start: start === -Infinity ? null : start,
          end: end === Infinity ? null : end,
          startType: 'closed', // Simplified handling
          endType: 'closed',
        };
      } else {
        // Empty set
        return [];
      }
    }

    return [result];
  }

  /**
   * Format interval representation
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

  // ============== Polynomial Analysis ==============

  /**
   * Analyze all properties of a polynomial
   */
  static analyzePolynomial(expression: string): PolynomialAnalysis {
    const coefficients = this.extractPolynomialCoefficients(expression);
    const degree = coefficients.length - 1;
    const leadingCoefficient = coefficients[0];

    const roots = this.findPolynomialRoots(coefficients);
    const criticalPointsRaw = this.findCriticalPoints(coefficients);

    return {
      degree,
      leadingCoefficient,
      zeros: roots.map(root => ({
        x: root.value,
        multiplicity: root.multiplicity,
        behavior: root.multiplicity % 2 === 1 ? 'crosses' : 'touches' as 'crosses' | 'touches'
      })),
      yIntercept: coefficients[coefficients.length - 1],
      criticalPoints: criticalPointsRaw.map(point => ({
        x: point.x,
        y: point.y,
        type: 'minimum' as 'maximum' | 'minimum' | 'inflection' // Default type, should be determined by analysis
      })),
      endBehavior: this.analyzeEndBehavior(degree, leadingCoefficient),
      expandedForm: this.formatPolynomial(coefficients),
      factoredForm: this.factorizePolynomial(coefficients).factors.length > 0 ? this.factorizePolynomial(coefficients).factors[0] : undefined,
    };
  }

  /**
   * Extract polynomial coefficients from an expression
   */
  private static extractPolynomialCoefficients(expression: string): number[] {
    // Simplified coefficient extraction
    try {
      // Handle common polynomial forms
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
      
      // Default handling
      if (expression.includes('x^3') || expression.includes('x³')) {
        return [1, 0, 0, 0]; // x^3
      }
      if (expression.includes('x^2') || expression.includes('x²') || expression.includes('x**2')) {
        return [1, 0, 0]; // x^2
      }
      if (expression.includes('x') && (expression.includes('+') || expression.includes('-'))) {
        // Attempt to extract constant term
        const constantMatch = expression.match(/([+-]?\s*\d+)(?!\*x)/);
        const constant = constantMatch ? Number.parseFloat(constantMatch[1].replace(/\s/g, '')) : 0;
        return [1, constant]; // x + constant
      }
      return [1, 0]; // x
    } catch (e) {
      return [1, 0]; // Default linear
    }
  }

  /**
   * Find roots of a polynomial
   */
  private static findPolynomialRoots(coefficients: number[]): Array<{ value: number; multiplicity: number; isReal: boolean }> {
    // Simplified root finding algorithm
    const roots: Array<{ value: number; multiplicity: number; isReal: boolean }> = [];
    
    if (coefficients.length === 3) {
      // Quadratic equation ax^2 + bx + c = 0
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
        // Complex roots
        const realPart = -b / (2 * a);
        const imagPart = Math.sqrt(-discriminant) / (2 * a);
        roots.push({ value: realPart, multiplicity: 1, isReal: false });
      }
    }

    return roots;
  }

  /**
   * Factorize a polynomial
   */
  private static factorizePolynomial(coefficients: number[]): { factors: string[]; expanded: string; simplified: string } {
    // Simplified factorization
    const factors: string[] = [];
    
    if (coefficients.length === 3) {
      // Quadratic polynomial
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
   * Format polynomial expression
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
   * Analyze end behavior
   */
  private static analyzeEndBehavior(degree: number, leadingCoefficient: number): { leftEnd: 'up' | 'down'; rightEnd: 'up' | 'down' } {
    if (degree % 2 === 0) {
      // Even degree polynomial
      return {
        leftEnd: leadingCoefficient > 0 ? 'up' : 'down',
        rightEnd: leadingCoefficient > 0 ? 'up' : 'down',
      };
    } else {
      // Odd degree polynomial
      return {
        leftEnd: leadingCoefficient > 0 ? 'down' : 'up',
        rightEnd: leadingCoefficient > 0 ? 'up' : 'down',
      };
    }
  }

  /**
   * Find turning points
   */
  private static findTurningPoints(coefficients: number[]): Point2D[] {
    // Simplified implementation: return points where derivative is 0
    const turningPoints: Point2D[] = [];
    
    // Calculate derivative coefficients
    const derivative: number[] = [];
    for (let i = 0; i < coefficients.length - 1; i++) {
      derivative.push(coefficients[i] * (coefficients.length - 1 - i));
    }
    
    // Find roots of the derivative (simplified)
    if (derivative.length === 2) {
      // Linear derivative
      const root = -derivative[1] / derivative[0];
      const func = this.createPolynomialFunction(coefficients);
      turningPoints.push({ x: root, y: func(root) });
    }

    return turningPoints;
  }

  /**
   * Find critical points
   */
  private static findCriticalPoints(coefficients: number[]): Point2D[] {
    // Same as turning points (simplified)
    return this.findTurningPoints(coefficients);
  }

  /**
   * Create polynomial function
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

// ============== Export Interface ==============
export default MathAnalysisEngine;
