import { describe, test, expect } from 'vitest';

/**
 * 高级多项式分析类 - 核心功能测试
 */
class AdvancedPolynomialAnalyzer {
  private coefficients: number[];
  private degree: number;

  constructor(coefficients: number[]) {
    this.coefficients = [...coefficients];
    this.degree = coefficients.length - 1;
  }

  rationalRootTest(): number[] {
    if (this.coefficients.length < 2) return [];

    const lastCoeff = Math.abs(this.coefficients[this.coefficients.length - 1]);
    const firstCoeff = Math.abs(this.coefficients[0]);

    const constantFactors = this.getFactors(lastCoeff);
    const leadingFactors = this.getFactors(firstCoeff);

    const possibleRoots: number[] = [];
    
    for (const p of constantFactors) {
      for (const q of leadingFactors) {
        possibleRoots.push(p / q);
        possibleRoots.push(-p / q);
      }
    }

    const uniqueRoots = [...new Set(possibleRoots)];
    const actualRoots: number[] = [];

    for (const root of uniqueRoots) {
      if (Math.abs(this.evaluate(root)) < 1e-10) {
        actualRoots.push(root);
      }
    }

    return actualRoots.sort((a, b) => a - b);
  }

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

  evaluate(x: number): number {
    let result = 0;
    let power = this.degree;
    
    for (const coeff of this.coefficients) {
      result += coeff * Math.pow(x, power);
      power--;
    }
    
    return result;
  }

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

  factorize(): {
    factors: string[];
    steps: string[];
    isComplete: boolean;
  } {
    const steps: string[] = [];
    const factors: string[] = [];
    
    steps.push(`开始因式分解多项式，次数: ${this.degree}`);
    
    const gcd = this.extractCommonFactor();
    if (gcd !== 1) {
      factors.push(gcd.toString());
      steps.push(`提取公因式: ${gcd}`);
    }

    const rationalRoots = this.rationalRootTest();
    steps.push(`有理根测试结果: [${rationalRoots.join(', ')}]`);

    let currentPoly = new AdvancedPolynomialAnalyzer(this.coefficients);
    
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

    const isComplete = currentPoly.degree <= 1 || currentPoly.coefficients.every(c => c === 0);
    
    if (!isComplete && currentPoly.degree === 2) {
      const quadraticFactors = this.factorizeQuadratic(currentPoly.coefficients);
      if (quadraticFactors.length > 0) {
        factors.push(...quadraticFactors);
        steps.push(`二次因式分解: ${quadraticFactors.join(' × ')}`);
      }
    }

    return { factors, steps, isComplete };
  }

  private extractCommonFactor(): number {
    const nonZeroCoeffs = this.coefficients.filter(c => c !== 0);
    if (nonZeroCoeffs.length === 0) return 1;
    
    return nonZeroCoeffs.reduce((gcd, coeff) => this.gcd(Math.abs(gcd), Math.abs(coeff)));
  }

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  private factorizeQuadratic(coeffs: number[]): string[] {
    if (coeffs.length !== 3) return [];
    
    const [a, b, c] = coeffs;
    const discriminant = b * b - 4 * a * c;
    
    if (discriminant < 0) return [];
    
    if (discriminant === 0) {
      const root = -b / (2 * a);
      return [`(x - ${root})²`];
    }
    
    const sqrtDisc = Math.sqrt(discriminant);
    const root1 = (-b + sqrtDisc) / (2 * a);
    const root2 = (-b - sqrtDisc) / (2 * a);
    
    return [`(x - ${root1.toFixed(4)})`, `(x - ${root2.toFixed(4)})`];
  }

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
      leftEnd = leadingCoeff > 0 ? 'up' : 'down';
      rightEnd = leadingCoeff > 0 ? 'up' : 'down';
      analysis.push(`偶数次多项式: 两端行为相同`);
    } else {
      leftEnd = leadingCoeff > 0 ? 'down' : 'up';
      rightEnd = leadingCoeff > 0 ? 'up' : 'down';
      analysis.push(`奇数次多项式: 两端行为相反`);
    }

    analysis.push(`x → -∞ 时, f(x) → ${leftEnd === 'up' ? '+∞' : '-∞'}`);
    analysis.push(`x → +∞ 时, f(x) → ${rightEnd === 'up' ? '+∞' : '-∞'}`);

    return { leftEnd, rightEnd, analysis };
  }

  analyzeRootMultiplicity(roots: number[]): Array<{
    root: number;
    multiplicity: number;
    behavior: 'crosses' | 'touches' | 'bounces';
  }> {
    const rootInfo: Array<{ root: number; multiplicity: number; behavior: 'crosses' | 'touches' | 'bounces' }> = [];
    
    for (const root of roots) {
      let multiplicity = 0;
      let testPoly = new AdvancedPolynomialAnalyzer(this.coefficients);
      
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

describe('Polynomial Complete Analyzer - Core Logic', () => {
  describe('有理根测试', () => {
    test('应该正确找到二次多项式的有理根', () => {
      // x^2 - 5x + 6 = (x-2)(x-3)
      const analyzer = new AdvancedPolynomialAnalyzer([1, -5, 6]);
      const roots = analyzer.rationalRootTest();
      
      expect(roots).toContain(2);
      expect(roots).toContain(3);
      expect(roots.length).toBe(2);
    });

    test('应该正确找到三次多项式的有理根', () => {
      // x^3 - 6x^2 + 11x - 6 = (x-1)(x-2)(x-3)
      const analyzer = new AdvancedPolynomialAnalyzer([1, -6, 11, -6]);
      const roots = analyzer.rationalRootTest();
      
      expect(roots).toContain(1);
      expect(roots).toContain(2);
      expect(roots).toContain(3);
      expect(roots.length).toBe(3);
    });

    test('应该正确处理没有有理根的情况', () => {
      // x^2 + 1 (无实根)
      const analyzer = new AdvancedPolynomialAnalyzer([1, 0, 1]);
      const roots = analyzer.rationalRootTest();
      
      expect(roots.length).toBe(0);
    });

    test('应该正确找到分数根', () => {
      // 2x^2 - 3x + 1 = (2x-1)(x-1) = 0 => x = 1/2, 1
      const analyzer = new AdvancedPolynomialAnalyzer([2, -3, 1]);
      const roots = analyzer.rationalRootTest();
      
      expect(roots).toContain(0.5);
      expect(roots).toContain(1);
    });
  });

  describe('综合除法', () => {
    test('应该正确执行综合除法 - 整除情况', () => {
      // x^2 - 3x + 2 ÷ (x - 1) = x - 2 余 0
      const analyzer = new AdvancedPolynomialAnalyzer([1, -3, 2]);
      const result = analyzer.syntheticDivision(1);
      
      expect(result.quotient).toEqual([1, -2]);
      expect(result.remainder).toBe(0);
      expect(result.steps.length).toBeGreaterThan(3);
      expect(result.steps[0]).toContain('综合除法');
    });

    test('应该正确执行综合除法 - 有余数情况', () => {
      // x^2 + x + 1 ÷ (x - 1) = x + 2 余 3
      const analyzer = new AdvancedPolynomialAnalyzer([1, 1, 1]);
      const result = analyzer.syntheticDivision(1);
      
      expect(result.quotient).toEqual([1, 2]);
      expect(result.remainder).toBe(3);
    });

    test('应该包含详细的计算步骤', () => {
      const analyzer = new AdvancedPolynomialAnalyzer([1, -2, 1]);
      const result = analyzer.syntheticDivision(1);
      
      expect(result.steps).toContain('综合除法: (多项式) ÷ (x - 1)');
      expect(result.steps).toContain('系数: [1, -2, 1]');
      expect(result.steps.some(step => step.includes('第1步:'))).toBe(true);
      expect(result.steps.some(step => step.includes('余数:'))).toBe(true);
    });
  });

  describe('因式分解', () => {
    test('应该正确因式分解二次多项式', () => {
      // x^2 - 5x + 6 = (x-2)(x-3)
      const analyzer = new AdvancedPolynomialAnalyzer([1, -5, 6]);
      const result = analyzer.factorize();
      
      expect(result.factors).toContain('(x - 2)');
      expect(result.factors).toContain('(x - 3)');
      expect(result.isComplete).toBe(true);
      expect(result.steps.some(step => step.includes('有理根测试结果'))).toBe(true);
    });

    test('应该正确因式分解三次多项式', () => {
      // x^3 - 6x^2 + 11x - 6 = (x-1)(x-2)(x-3)
      const analyzer = new AdvancedPolynomialAnalyzer([1, -6, 11, -6]);
      const result = analyzer.factorize();
      
      expect(result.factors).toContain('(x - 1)');
      expect(result.factors).toContain('(x - 2)');
      expect(result.factors).toContain('(x - 3)');
      expect(result.isComplete).toBe(true);
    });

    test('应该处理有公因式的情况', () => {
      // 2x^2 - 4x + 2 = 2(x^2 - 2x + 1) = 2(x-1)^2
      const analyzer = new AdvancedPolynomialAnalyzer([2, -4, 2]);
      const result = analyzer.factorize();
      
      expect(result.factors).toContain('2'); // 公因式
      expect(result.steps.some(step => step.includes('提取公因式: 2'))).toBe(true);
    });

    test('应该标识不完全因式分解的情况', () => {
      // x^2 + x + 1 (不能在实数范围内因式分解)
      const analyzer = new AdvancedPolynomialAnalyzer([1, 1, 1]);
      const result = analyzer.factorize();
      
      expect(result.isComplete).toBe(false);
    });
  });

  describe('端点行为分析', () => {
    test('应该正确分析偶数次正首项系数多项式', () => {
      // x^2 (偶数次，正首项)
      const analyzer = new AdvancedPolynomialAnalyzer([1, 0, 0]);
      const result = analyzer.analyzeEndBehavior();
      
      expect(result.leftEnd).toBe('up');
      expect(result.rightEnd).toBe('up');
      expect(result.analysis).toContain('偶数次多项式: 两端行为相同');
      expect(result.analysis).toContain('首项系数: 1 (正)');
    });

    test('应该正确分析偶数次负首项系数多项式', () => {
      // -x^2 (偶数次，负首项)
      const analyzer = new AdvancedPolynomialAnalyzer([-1, 0, 0]);
      const result = analyzer.analyzeEndBehavior();
      
      expect(result.leftEnd).toBe('down');
      expect(result.rightEnd).toBe('down');
      expect(result.analysis).toContain('首项系数: -1 (负)');
    });

    test('应该正确分析奇数次正首项系数多项式', () => {
      // x^3 (奇数次，正首项)
      const analyzer = new AdvancedPolynomialAnalyzer([1, 0, 0, 0]);
      const result = analyzer.analyzeEndBehavior();
      
      expect(result.leftEnd).toBe('down');
      expect(result.rightEnd).toBe('up');
      expect(result.analysis).toContain('奇数次多项式: 两端行为相反');
    });

    test('应该正确分析奇数次负首项系数多项式', () => {
      // -x^3 (奇数次，负首项)
      const analyzer = new AdvancedPolynomialAnalyzer([-1, 0, 0, 0]);
      const result = analyzer.analyzeEndBehavior();
      
      expect(result.leftEnd).toBe('up');
      expect(result.rightEnd).toBe('down');
    });

    test('应该包含详细的分析步骤', () => {
      const analyzer = new AdvancedPolynomialAnalyzer([2, -3, 1]);
      const result = analyzer.analyzeEndBehavior();
      
      expect(result.analysis).toContain('首项: 2x^2');
      expect(result.analysis).toContain('次数: 2 (偶数)');
      expect(result.analysis).toContain('x → -∞ 时, f(x) → +∞');
      expect(result.analysis).toContain('x → +∞ 时, f(x) → +∞');
    });
  });

  describe('根的重数分析', () => {
    test('应该正确识别单重根', () => {
      // x^2 - 3x + 2 = (x-1)(x-2)，都是单重根
      const analyzer = new AdvancedPolynomialAnalyzer([1, -3, 2]);
      const roots = [1, 2];
      const result = analyzer.analyzeRootMultiplicity(roots);
      
      expect(result).toHaveLength(2);
      expect(result[0].root).toBe(1);
      expect(result[0].multiplicity).toBe(1);
      expect(result[0].behavior).toBe('crosses');
      
      expect(result[1].root).toBe(2);
      expect(result[1].multiplicity).toBe(1);
      expect(result[1].behavior).toBe('crosses');
    });

    test('应该正确识别双重根', () => {
      // x^2 - 2x + 1 = (x-1)^2，双重根
      const analyzer = new AdvancedPolynomialAnalyzer([1, -2, 1]);
      const roots = [1];
      const result = analyzer.analyzeRootMultiplicity(roots);
      
      expect(result).toHaveLength(1);
      expect(result[0].root).toBe(1);
      expect(result[0].multiplicity).toBe(2);
      expect(result[0].behavior).toBe('touches');
    });

    test('应该正确识别三重根', () => {
      // (x-1)^3 = x^3 - 3x^2 + 3x - 1
      const analyzer = new AdvancedPolynomialAnalyzer([1, -3, 3, -1]);
      const roots = [1];
      const result = analyzer.analyzeRootMultiplicity(roots);
      
      expect(result).toHaveLength(1);
      expect(result[0].root).toBe(1);
      expect(result[0].multiplicity).toBe(3);
      expect(result[0].behavior).toBe('bounces');
    });

    test('应该正确处理四重根', () => {
      // (x-1)^4 = x^4 - 4x^3 + 6x^2 - 4x + 1
      const analyzer = new AdvancedPolynomialAnalyzer([1, -4, 6, -4, 1]);
      const roots = [1];
      const result = analyzer.analyzeRootMultiplicity(roots);
      
      expect(result).toHaveLength(1);
      expect(result[0].root).toBe(1);
      expect(result[0].multiplicity).toBe(4);
      expect(result[0].behavior).toBe('touches');
    });
  });

  describe('多项式计算', () => {
    test('应该正确计算多项式值', () => {
      // f(x) = x^2 - 3x + 2
      const analyzer = new AdvancedPolynomialAnalyzer([1, -3, 2]);
      
      expect(analyzer.evaluate(0)).toBe(2);  // f(0) = 2
      expect(analyzer.evaluate(1)).toBe(0);  // f(1) = 0
      expect(analyzer.evaluate(2)).toBe(0);  // f(2) = 0
      expect(analyzer.evaluate(3)).toBe(2);  // f(3) = 2
    });

    test('应该正确计算高次多项式值', () => {
      // f(x) = x^3 - 6x^2 + 11x - 6
      const analyzer = new AdvancedPolynomialAnalyzer([1, -6, 11, -6]);
      
      expect(analyzer.evaluate(1)).toBe(0);  // f(1) = 0
      expect(analyzer.evaluate(2)).toBe(0);  // f(2) = 0
      expect(analyzer.evaluate(3)).toBe(0);  // f(3) = 0
    });
  });

  describe('边界情况和错误处理', () => {
    test('应该处理常数多项式', () => {
      const analyzer = new AdvancedPolynomialAnalyzer([5]);
      
      expect(analyzer.rationalRootTest()).toEqual([]);
      expect(analyzer.evaluate(10)).toBe(5);
    });

    test('应该处理线性多项式', () => {
      // x - 2
      const analyzer = new AdvancedPolynomialAnalyzer([1, -2]);
      const roots = analyzer.rationalRootTest();
      
      expect(roots).toContain(2);
      expect(roots.length).toBe(1);
    });

    test('应该处理零系数', () => {
      // x^3 + 0x^2 + 0x + 8 = x^3 + 8
      const analyzer = new AdvancedPolynomialAnalyzer([1, 0, 0, 8]);
      const roots = analyzer.rationalRootTest();
      
      expect(roots).toContain(-2); // 立方根
    });
  });

  describe('性能测试', () => {
    test('应该在合理时间内完成有理根测试', () => {
      const startTime = Date.now();
      
      // 测试多个多项式
      for (let i = 0; i < 10; i++) {
        const analyzer = new AdvancedPolynomialAnalyzer([1, -i, i * 2, -i]);
        analyzer.rationalRootTest();
      }
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000);
    });

    test('应该在合理时间内完成因式分解', () => {
      const startTime = Date.now();
      
      const analyzer = new AdvancedPolynomialAnalyzer([1, -10, 35, -50, 24]);
      analyzer.factorize();
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe('数学准确性验证', () => {
    test('验证韦达定理 - 二次情况', () => {
      // x^2 - 5x + 6，根的和应该是5，根的积应该是6
      const analyzer = new AdvancedPolynomialAnalyzer([1, -5, 6]);
      const roots = analyzer.rationalRootTest();
      
      const sum = roots.reduce((a, b) => a + b, 0);
      const product = roots.reduce((a, b) => a * b, 1);
      
      expect(Math.abs(sum - 5)).toBeLessThan(1e-10);
      expect(Math.abs(product - 6)).toBeLessThan(1e-10);
    });

    test('验证综合除法的正确性', () => {
      // 验证 (quotient × divisor) + remainder = 原多项式
      const original = [1, -4, 5, -2];
      const analyzer = new AdvancedPolynomialAnalyzer(original);
      const result = analyzer.syntheticDivision(1);
      
      // 验证：原多项式在x=1处的值应该等于余数
      expect(Math.abs(analyzer.evaluate(1) - result.remainder)).toBeLessThan(1e-10);
    });
  });
});
