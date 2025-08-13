import { describe, test, expect } from 'vitest';
import { MathAnalysisEngine } from '../../src/utils/math-analysis-engine';

describe('MathAnalysisEngine', () => {
  describe('函数属性分析', () => {
    test('应该正确分析二次函数 x^2', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('x**2');
      
      expect(properties.domain).toBe('ℝ (所有实数)');
      expect(properties.intercepts.x).toContain(0);
      expect(properties.intercepts.y).toBe(0);
      expect(properties.extrema).toHaveLength(1);
      expect(properties.extrema[0].type).toBe('minimum');
      expect(properties.symmetry?.type).toBe('even');
    });

    test('应该正确分析线性函数 x + 1', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('x + 1');
      
      expect(properties.domain).toBe('ℝ (所有实数)');
      expect(properties.intercepts.y).toBe(1);
      expect(properties.monotonicity[0].direction).toBe('increasing');
    });

    test('应该正确分析包含根号的函数', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('Math.sqrt(x)');
      
      expect(properties.domain).toContain('根号内表达式≥0');
      expect(properties.intercepts.x).toContain(0);
      expect(properties.intercepts.y).toBe(0);
    });

    test('应该正确分析三角函数', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('Math.sin(x)');
      
      expect(properties.periodicity?.isPeriodic).toBe(true);
      expect(properties.periodicity?.period).toBe(2 * Math.PI);
      expect(properties.symmetry?.type).toBe('odd');
    });

    test('应该正确分析有理函数', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('1/x');
      
      expect(properties.domain).toContain('分母不能为0');
      expect(properties.asymptotes.length).toBeGreaterThan(0);
    });
  });

  describe('不等式解析', () => {
    test('应该正确解析简单不等式 x > 2', () => {
      const result = MathAnalysisEngine.parseInequality('x > 2');
      
      expect(result.type).toBe('simple');
      expect(result.intervals).toHaveLength(1);
      expect(result.intervals[0].start).toBe(2);
      expect(result.intervals[0].startType).toBe('open');
      expect(result.intervals[0].end).toBeNull();
      expect(result.intervalNotation).toContain('(2, +∞)');
    });

    test('应该正确解析复合不等式 2 < x < 5', () => {
      const result = MathAnalysisEngine.parseInequality('2 < x < 5');
      
      expect(result.type).toBe('simple');
      expect(result.intervals).toHaveLength(1);
      expect(result.intervals[0].start).toBe(2);
      expect(result.intervals[0].end).toBe(5);
      expect(result.intervals[0].startType).toBe('open');
      expect(result.intervals[0].endType).toBe('open');
      expect(result.intervalNotation).toContain('(2, 5)');
    });

    test('应该正确解析包含等号的不等式 x <= -1', () => {
      const result = MathAnalysisEngine.parseInequality('x <= -1');
      
      expect(result.type).toBe('simple');
      expect(result.intervals).toHaveLength(1);
      expect(result.intervals[0].end).toBe(-1);
      expect(result.intervals[0].endType).toBe('closed');
      expect(result.intervals[0].start).toBeNull();
      expect(result.intervalNotation).toContain('(-∞, -1]');
    });

    test('应该正确解析OR复合不等式', () => {
      const result = MathAnalysisEngine.parseInequality('x < -1 or x > 3');
      
      expect(result.type).toBe('compound');
      expect(result.operator).toBe('or');
      expect(result.intervals).toHaveLength(2);
      expect(result.intervalNotation).toContain('∪');
    });

    test('应该正确解析AND复合不等式', () => {
      const result = MathAnalysisEngine.parseInequality('x > 0 and x < 10');
      
      expect(result.type).toBe('compound');
      expect(result.operator).toBe('and');
      expect(result.intervals).toHaveLength(1);
    });

    test('应该正确解析绝对值不等式 |x| < 3', () => {
      const result = MathAnalysisEngine.parseInequality('|x| < 3');
      
      expect(result.type).toBe('absolute');
      expect(result.intervals).toHaveLength(1);
      expect(result.intervals[0].start).toBe(-3);
      expect(result.intervals[0].end).toBe(3);
    });

    test('应该正确解析绝对值不等式 |x| > 2', () => {
      const result = MathAnalysisEngine.parseInequality('|x| > 2');
      
      expect(result.type).toBe('absolute');
      expect(result.operator).toBe('or');
      expect(result.intervals).toHaveLength(2);
      expect(result.intervalNotation).toContain('∪');
    });

    test('应该正确解析平移的绝对值不等式 |x - 1| < 2', () => {
      const result = MathAnalysisEngine.parseInequality('|x - 1| < 2');
      
      expect(result.type).toBe('absolute');
      expect(result.intervals).toHaveLength(1);
      expect(result.intervals[0].start).toBe(-1);
      expect(result.intervals[0].end).toBe(3);
    });
  });

  describe('多项式分析', () => {
    test('应该正确分析线性多项式', () => {
      const analysis = MathAnalysisEngine.analyzePolynomial('x + 2');
      
      expect(analysis.degree).toBe(1);
      expect(analysis.leadingCoefficient).toBe(1);
      expect(analysis.yIntercept).toBe(2);
      expect(analysis.endBehavior.leftEnd).toBe('down');
      expect(analysis.endBehavior.rightEnd).toBe('up');
    });

    test('应该正确分析二次多项式', () => {
      const analysis = MathAnalysisEngine.analyzePolynomial('x^2 - 4');
      
      expect(analysis.degree).toBe(2);
      expect(analysis.leadingCoefficient).toBe(1);
      expect(analysis.endBehavior.leftEnd).toBe('up');
      expect(analysis.endBehavior.rightEnd).toBe('up');
    });

    test('应该正确分析三次多项式', () => {
      const analysis = MathAnalysisEngine.analyzePolynomial('x^3 - 3x');
      
      expect(analysis.degree).toBe(3);
      expect(analysis.leadingCoefficient).toBe(1);
      expect(analysis.endBehavior.leftEnd).toBe('down');
      expect(analysis.endBehavior.rightEnd).toBe('up');
    });

    test('应该正确找到二次多项式的根', () => {
      const analysis = MathAnalysisEngine.analyzePolynomial('x^2 - 4');
      
      expect(analysis.roots.length).toBeGreaterThan(0);
      expect(analysis.roots.every(root => root.isReal)).toBe(true);
    });

    test('应该正确处理因式分解', () => {
      const analysis = MathAnalysisEngine.analyzePolynomial('x^2 - 1');
      
      expect(analysis.factorization.factors.length).toBeGreaterThan(0);
      expect(analysis.factorization.simplified).toBeTruthy();
    });
  });

  describe('边界情况和错误处理', () => {
    test('应该处理无效的函数表达式', () => {
      expect(() => {
        MathAnalysisEngine.analyzeFunctionProperties('invalid_function');
      }).not.toThrow();
    });

    test('应该处理无效的不等式表达式', () => {
      const result = MathAnalysisEngine.parseInequality('invalid inequality');
      
      expect(result.intervals).toHaveLength(0);
      expect(result.intervalNotation).toBe('∅');
    });

    test('应该处理空字符串输入', () => {
      expect(() => {
        MathAnalysisEngine.analyzeFunctionProperties('');
      }).not.toThrow();
      
      const result = MathAnalysisEngine.parseInequality('');
      expect(result.intervals).toHaveLength(0);
    });

    test('应该处理复杂的函数表达式', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('Math.sin(x) + Math.cos(x)');
      
      expect(properties.domain).toBeTruthy();
      expect(properties.periodicity?.isPeriodic).toBe(true);
    });

    test('应该正确处理负值的绝对值不等式', () => {
      const result = MathAnalysisEngine.parseInequality('|x| < -1');
      
      expect(result.intervals).toHaveLength(0);
      expect(result.intervalNotation).toBe('∅');
    });

    test('应该正确处理绝对值大于负数的情况', () => {
      const result = MathAnalysisEngine.parseInequality('|x| > -2');
      
      expect(result.intervalNotation).toBe('ℝ');
    });
  });

  describe('数值精度测试', () => {
    test('应该在合理精度范围内找到函数零点', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('x**2 - 2*x + 1');
      
      expect(properties.intercepts.x).toHaveLength(1);
      expect(Math.abs(properties.intercepts.x[0] - 1)).toBeLessThan(1e-5);
    });

    test('应该正确处理极值点的精度', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('x**2 - 4*x + 3');
      
      if (properties.extrema.length > 0) {
        expect(Math.abs(properties.extrema[0].x - 2)).toBeLessThan(0.5);
      }
    });
  });

  describe('性能测试', () => {
    test('应该在合理时间内完成函数分析', () => {
      const startTime = Date.now();
      MathAnalysisEngine.analyzeFunctionProperties('x**3 - 6*x**2 + 11*x - 6');
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    test('应该在合理时间内解析复杂不等式', () => {
      const startTime = Date.now();
      MathAnalysisEngine.parseInequality('x > 1 and x < 10 or x > 20 and x < 30');
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });
  });
});
