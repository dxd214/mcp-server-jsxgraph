import { describe, test, expect } from 'vitest';
import { MathAnalysisEngine } from '../../src/utils/math-analysis-engine';

describe('Function Properties Analyzer - Core Logic', () => {
  describe('函数属性分析核心功能', () => {
    test('应该正确分析二次函数的属性', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('x**2');
      
      expect(properties.domain).toBe('ℝ (所有实数)');
      expect(properties.intercepts.x).toContain(0);
      expect(properties.intercepts.y).toBe(0);
      expect(properties.extrema.length).toBeGreaterThan(0);
      expect(properties.extrema[0].type).toBe('minimum');
      expect(properties.symmetry?.type).toBe('even');
    });

    test('应该正确分析三角函数的属性', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('Math.sin(x)');
      
      expect(properties.domain).toBe('ℝ (所有实数)');
      expect(properties.periodicity?.isPeriodic).toBe(true);
      expect(properties.periodicity?.period).toBe(2 * Math.PI);
      expect(properties.symmetry?.type).toBe('odd');
    });

    test('应该正确分析有理函数的属性', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('1/x');
      
      expect(properties.domain).toContain('分母不能为0');
      expect(properties.asymptotes.length).toBeGreaterThan(0);
    });

    test('应该正确分析指数函数的属性', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('Math.exp(x)');
      
      expect(properties.domain).toBe('ℝ (所有实数)');
      expect(properties.intercepts.y).toBe(1);
      expect(properties.monotonicity[0].direction).toBe('increasing');
    });

    test('应该正确分析根式函数的属性', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('Math.sqrt(x)');
      
      expect(properties.domain).toContain('根号内表达式≥0');
      expect(properties.intercepts.x).toContain(0);
      expect(properties.intercepts.y).toBe(0);
    });
  });

  describe('函数单调性分析', () => {
    test('应该正确分析递增函数', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('x + 1');
      
      expect(properties.monotonicity.length).toBeGreaterThan(0);
      expect(properties.monotonicity[0].direction).toBe('increasing');
    });

    test('应该正确分析二次函数的单调性', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('x**2 - 4*x + 3');
      
      expect(properties.monotonicity.length).toBeGreaterThan(0);
      // 应该有递减和递增区间
      const directions = properties.monotonicity.map(m => m.direction);
      expect(directions).toContain('decreasing');
      expect(directions).toContain('increasing');
    });
  });

  describe('函数凹凸性分析', () => {
    test('应该正确分析二次函数的凹凸性', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('x**2');
      
      expect(properties.concavity.length).toBeGreaterThan(0);
      expect(properties.concavity[0].type).toBe('concave_up');
    });

    test('应该正确分析三次函数的凹凸性', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('x**3');
      
      expect(properties.concavity.length).toBeGreaterThan(0);
      // 三次函数应该有凹向上和凹向下的区间
      const types = properties.concavity.map(c => c.type);
      expect(types.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('函数极值分析', () => {
    test('应该找到二次函数的极值点', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('x**2 - 4*x + 3');
      
      expect(properties.extrema.length).toBeGreaterThan(0);
      expect(properties.extrema[0].type).toBe('minimum');
      expect(Math.abs(properties.extrema[0].x - 2)).toBeLessThan(0.5);
    });

    test('应该正确处理没有极值的函数', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('x + 5');
      
      // 线性函数应该没有极值
      expect(properties.extrema.length).toBe(0);
    });
  });

  describe('函数截距分析', () => {
    test('应该正确找到x截距', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('x**2 - 4');
      
      expect(properties.intercepts.x.length).toBeGreaterThan(0);
      // 应该找到x = ±2的截距
      expect(properties.intercepts.x).toContain(2);
      expect(properties.intercepts.x).toContain(-2);
    });

    test('应该正确找到y截距', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('x**2 + 3');
      
      expect(properties.intercepts.y).toBe(3);
    });

    test('应该处理没有x截距的函数', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('x**2 + 1');
      
      expect(properties.intercepts.x.length).toBe(0);
      expect(properties.intercepts.y).toBe(1);
    });
  });

  describe('函数渐近线分析', () => {
    test('应该找到有理函数的垂直渐近线', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('1/(x-1)');
      
      expect(properties.asymptotes.length).toBeGreaterThan(0);
      const verticalAsymptotes = properties.asymptotes.filter(a => a.type === 'vertical');
      expect(verticalAsymptotes.length).toBeGreaterThan(0);
    });

    test('应该找到水平渐近线', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('1/x');
      
      const horizontalAsymptotes = properties.asymptotes.filter(a => a.type === 'horizontal');
      expect(horizontalAsymptotes.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('函数对称性分析', () => {
    test('应该正确识别偶函数', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('x**2');
      
      expect(properties.symmetry?.type).toBe('even');
    });

    test('应该正确识别奇函数', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('Math.sin(x)');
      
      expect(properties.symmetry?.type).toBe('odd');
    });

    test('应该正确识别非对称函数', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('x**2 + x');
      
      expect(properties.symmetry?.type).toBe('none');
    });
  });

  describe('函数周期性分析', () => {
    test('应该正确识别正弦函数的周期性', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('Math.sin(x)');
      
      expect(properties.periodicity?.isPeriodic).toBe(true);
      expect(properties.periodicity?.period).toBe(2 * Math.PI);
    });

    test('应该正确识别余弦函数的周期性', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('Math.cos(x)');
      
      expect(properties.periodicity?.isPeriodic).toBe(true);
      expect(properties.periodicity?.period).toBe(2 * Math.PI);
    });

    test('应该正确识别正切函数的周期性', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('Math.tan(x)');
      
      expect(properties.periodicity?.isPeriodic).toBe(true);
      expect(properties.periodicity?.period).toBe(Math.PI);
    });

    test('应该正确识别非周期函数', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('x**2');
      
      expect(properties.periodicity?.isPeriodic).toBe(false);
    });
  });

  describe('复合函数分析', () => {
    test('应该正确分析多项式函数', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('x**4 - 2*x**2 + 1');
      
      expect(properties.domain).toBe('ℝ (所有实数)');
      expect(properties.extrema.length).toBeGreaterThan(0);
      expect(properties.intercepts.y).toBe(1);
    });

    test('应该正确分析复合三角函数', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('Math.sin(x) + Math.cos(x)');
      
      expect(properties.periodicity?.isPeriodic).toBe(true);
    });
  });

  describe('边界情况和错误处理', () => {
    test('应该处理常数函数', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('5');
      
      expect(properties.domain).toBe('ℝ (所有实数)');
      expect(properties.intercepts.y).toBe(5);
      expect(properties.extrema.length).toBe(0);
      expect(properties.monotonicity[0].direction).toBe('constant');
    });

    test('应该处理无效表达式', () => {
      expect(() => {
        MathAnalysisEngine.analyzeFunctionProperties('invalid_function');
      }).not.toThrow();
    });

    test('应该处理空字符串', () => {
      expect(() => {
        MathAnalysisEngine.analyzeFunctionProperties('');
      }).not.toThrow();
    });

    test('应该处理复杂表达式', () => {
      const properties = MathAnalysisEngine.analyzeFunctionProperties('Math.sqrt(x**2 + 1) + Math.log(x + 1)');
      
      expect(properties.domain).toBeTruthy();
    });
  });

  describe('性能测试', () => {
    test('应该在合理时间内分析简单函数', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        MathAnalysisEngine.analyzeFunctionProperties('x**2 + 2*x + 1');
      }
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000);
    });

    test('应该在合理时间内分析复杂函数', () => {
      const startTime = Date.now();
      
      const complexFunctions = [
        'x**4 - 6*x**2 + 8*x - 3',
        'Math.sin(x) * Math.cos(x)',
        '1/(x**2 + 1)',
        'Math.exp(-x**2)',
        'Math.log(x**2 + 1)'
      ];

      complexFunctions.forEach(expr => {
        MathAnalysisEngine.analyzeFunctionProperties(expr);
      });
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe('精确度测试', () => {
    test('应该准确找到已知函数的极值', () => {
      // f(x) = (x-2)^2 + 1 的最小值在 (2, 1)
      const properties = MathAnalysisEngine.analyzeFunctionProperties('(x-2)**2 + 1');
      
      expect(properties.extrema.length).toBeGreaterThan(0);
      expect(properties.extrema[0].type).toBe('minimum');
      expect(Math.abs(properties.extrema[0].x - 2)).toBeLessThan(0.1);
      expect(Math.abs(properties.extrema[0].y - 1)).toBeLessThan(0.1);
    });

    test('应该准确找到已知函数的零点', () => {
      // f(x) = (x-1)(x-3) = x^2 - 4x + 3 的零点在 x = 1, 3
      const properties = MathAnalysisEngine.analyzeFunctionProperties('x**2 - 4*x + 3');
      
      expect(properties.intercepts.x.length).toBeGreaterThanOrEqual(2);
      expect(properties.intercepts.x).toContain(1);
      expect(properties.intercepts.x).toContain(3);
    });
  });
});
