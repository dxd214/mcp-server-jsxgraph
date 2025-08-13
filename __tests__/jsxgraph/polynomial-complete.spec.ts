import { describe, test, expect } from 'vitest';
import { generatePolynomialComplete } from '../../src/jsxgraph/polynomial-complete';

describe('Polynomial Complete Analyzer', () => {
  describe('基本多项式分析', () => {
    test('应该正确分析线性多项式', () => {
      const input = {
        polynomial: {
          coefficients: [1, -2], // x - 2
          expression: 'x - 2',
        },
        display: {
          showFactorization: true,
          showRootTable: true,
          showEndBehavior: true,
        },
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('多项式综合分析');
      expect(html).toContain('x - 2');
      expect(html).toContain('因式分解');
      expect(html).toContain('根分析');
      expect(html).toContain('端点行为');
    });

    test('应该正确分析二次多项式', () => {
      const input = {
        polynomial: {
          coefficients: [1, -5, 6], // x^2 - 5x + 6 = (x-2)(x-3)
          expression: 'x² - 5x + 6',
        },
        factorization: {
          showProcess: true,
          useRationalRootTest: true,
        },
        rootAnalysis: {
          analyzeMultiplicity: true,
        },
        display: {
          showFactorization: true,
          showRootTable: true,
        },
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('x² - 5x + 6');
      expect(html).toContain('有理根测试结果');
      expect(html).toContain('因子');
      expect(html).toContain('穿过'); // 单重根应该穿过x轴
    });

    test('应该正确分析三次多项式', () => {
      const input = {
        polynomial: {
          coefficients: [1, -6, 11, -6], // x^3 - 6x^2 + 11x - 6 = (x-1)(x-2)(x-3)
          expression: 'x³ - 6x² + 11x - 6',
        },
        display: {
          showFactorization: true,
          showRootTable: true,
          showEndBehavior: true,
        },
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('x³ - 6x² + 11x - 6');
      expect(html).toContain('奇数次多项式');
      expect(html).toContain('两端行为相反');
    });

    test('应该正确分析完全平方多项式', () => {
      const input = {
        polynomial: {
          coefficients: [1, -4, 4], // x^2 - 4x + 4 = (x-2)^2
          expression: 'x² - 4x + 4',
        },
        rootAnalysis: {
          analyzeMultiplicity: true,
        },
        display: {
          showFactorization: true,
          showRootTable: true,
        },
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('重数: 2');
      expect(html).toContain('相切'); // 双重根应该相切x轴
    });
  });

  describe('有理根测试', () => {
    test('应该正确找到有理根', () => {
      const input = {
        polynomial: {
          coefficients: [2, -3, -2, 3], // 2x^3 - 3x^2 - 2x + 3
        },
        factorization: {
          useRationalRootTest: true,
        },
        display: {
          showFactorization: true,
        },
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('有理根测试结果');
    });

    test('应该处理没有有理根的情况', () => {
      const input = {
        polynomial: {
          coefficients: [1, 0, 2], // x^2 + 2 (无实根)
        },
        display: {
          showRootTable: true,
        },
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('无有理根');
    });
  });

  describe('综合除法', () => {
    test('应该正确执行综合除法', () => {
      const input = {
        polynomial: {
          coefficients: [1, -6, 11, -6], // x^3 - 6x^2 + 11x - 6
        },
        syntheticDivision: {
          divisors: [1, 2, 3],
          showSteps: true,
          verifyResults: true,
        },
        display: {
          showSyntheticDivision: true,
        },
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('综合除法');
      expect(html).toContain('除以 (x - 1)');
      expect(html).toContain('除以 (x - 2)');
      expect(html).toContain('除以 (x - 3)');
      expect(html).toContain('商:');
      expect(html).toContain('余数:');
      expect(html).toContain('计算步骤:');
    });

    test('应该显示除法步骤', () => {
      const input = {
        polynomial: {
          coefficients: [1, -3, 2], // x^2 - 3x + 2
        },
        syntheticDivision: {
          divisors: [1],
          showSteps: true,
        },
        display: {
          showSyntheticDivision: true,
        },
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('综合除法: (多项式) ÷ (x - 1)');
      expect(html).toContain('系数:');
      expect(html).toContain('第1步:');
    });
  });

  describe('因式分解', () => {
    test('应该显示因式分解过程', () => {
      const input = {
        polynomial: {
          coefficients: [1, -1, -6], // x^2 - x - 6 = (x-3)(x+2)
        },
        factorization: {
          showProcess: true,
          factorizeCompletely: true,
        },
        display: {
          showFactorization: true,
        },
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('开始因式分解多项式');
      expect(html).toContain('有理根测试结果');
      expect(html).toContain('找到因子');
    });

    test('应该标识完全因式分解', () => {
      const input = {
        polynomial: {
          coefficients: [1, -1, -2], // x^2 - x - 2 = (x-2)(x+1)
        },
        display: {
          showFactorization: true,
        },
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('完全因式分解');
    });
  });

  describe('端点行为分析', () => {
    test('应该正确分析偶数次多项式的端点行为', () => {
      const input = {
        polynomial: {
          coefficients: [1, 0, -4], // x^2 - 4
        },
        endBehavior: {
          analyzeLeadingTerm: true,
          showLimits: true,
        },
        display: {
          showEndBehavior: true,
        },
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('偶数次多项式');
      expect(html).toContain('两端行为相同');
      expect(html).toContain('x → -∞');
      expect(html).toContain('x → +∞');
    });

    test('应该正确分析奇数次多项式的端点行为', () => {
      const input = {
        polynomial: {
          coefficients: [1, 0, 0, -8], // x^3 - 8
        },
        display: {
          showEndBehavior: true,
        },
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('奇数次多项式');
      expect(html).toContain('两端行为相反');
    });

    test('应该正确处理负首项系数', () => {
      const input = {
        polynomial: {
          coefficients: [-1, 2, 1], // -x^2 + 2x + 1
        },
        display: {
          showEndBehavior: true,
        },
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('首项系数: -1 (负)');
    });
  });

  describe('根的重数分析', () => {
    test('应该正确识别单重根', () => {
      const input = {
        polynomial: {
          coefficients: [1, -3, 2], // x^2 - 3x + 2 = (x-1)(x-2)
        },
        rootAnalysis: {
          analyzeMultiplicity: true,
        },
        display: {
          showRootTable: true,
        },
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('重数: 1');
      expect(html).toContain('穿过');
    });

    test('应该正确识别重根', () => {
      const input = {
        polynomial: {
          coefficients: [1, -6, 9], // x^2 - 6x + 9 = (x-3)^2
        },
        rootAnalysis: {
          analyzeMultiplicity: true,
        },
        display: {
          showRootTable: true,
        },
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('重数: 2');
      expect(html).toContain('相切');
    });

    test('应该正确显示根的行为标签', () => {
      const input = {
        polynomial: {
          coefficients: [1, -2, 1], // x^2 - 2x + 1 = (x-1)^2
        },
        display: {
          showRootTable: true,
        },
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('root-behavior touches');
    });
  });

  describe('显示选项', () => {
    test('应该在启用时显示图像', () => {
      const input = {
        polynomial: {
          coefficients: [1, 0, -1], // x^2 - 1
        },
        display: {
          showGraph: true,
        },
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('jxgbox');
      expect(html).toContain('JXG.JSXGraph.initBoard');
      expect(html).toContain('functiongraph');
    });

    test('应该在禁用时不显示图像', () => {
      const input = {
        polynomial: {
          coefficients: [1, -1],
        },
        display: {
          showGraph: false,
        },
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).not.toContain('jxgbox');
    });

    test('应该支持图像标注', () => {
      const input = {
        polynomial: {
          coefficients: [1, 0, -4], // x^2 - 4, 根在 ±2
        },
        display: {
          showGraph: true,
          annotateGraph: true,
        },
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('Root: x =');
      expect(html).toContain('标注根');
    });

    test('应该支持端点箭头显示', () => {
      const input = {
        polynomial: {
          coefficients: [1, 0, 0], // x^2
        },
        endBehavior: {
          visualizeArrows: true,
        },
        display: {
          showGraph: true,
        },
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('端点行为箭头');
      expect(html).toContain('create(\'arrow\'');
    });
  });

  describe('样式和布局', () => {
    test('应该支持自定义样式', () => {
      const input = {
        polynomial: {
          coefficients: [1, -1],
        },
        style: {
          backgroundColor: '#f0f0f0',
          theme: 'dark',
        },
        width: 1000,
        height: 800,
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('#f0f0f0');
      expect(html).toContain('width:1000px');
      expect(html).toContain('height:800px');
    });

    test('应该支持自定义标题', () => {
      const input = {
        polynomial: {
          coefficients: [2, -4, 2],
        },
        title: '二次函数综合分析',
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('二次函数综合分析');
    });

    test('应该生成响应式布局', () => {
      const input = {
        polynomial: {
          coefficients: [1, -1],
        },
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('analysis-grid');
      expect(html).toContain('grid-template-columns: 1fr 1fr');
      expect(html).toContain('full-width');
    });
  });

  describe('复杂多项式测试', () => {
    test('应该处理高次多项式', () => {
      const input = {
        polynomial: {
          coefficients: [1, -10, 35, -50, 24], // x^4 - 10x^3 + 35x^2 - 50x + 24
          expression: 'x⁴ - 10x³ + 35x² - 50x + 24',
        },
        display: {
          showFactorization: true,
          showRootTable: true,
          showEndBehavior: true,
        },
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('x⁴ - 10x³ + 35x² - 50x + 24');
      expect(html).toContain('偶数次多项式');
    });

    test('应该处理有分数系数的多项式', () => {
      const input = {
        polynomial: {
          coefficients: [0.5, -1.5, 1], // 0.5x^2 - 1.5x + 1
        },
        display: {
          showFactorization: true,
        },
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('提取公因式');
    });
  });

  describe('错误处理', () => {
    test('应该处理空系数数组', () => {
      const input = {
        polynomial: {
          coefficients: [],
        },
      };

      expect(() => generatePolynomialComplete(input)).not.toThrow();
    });

    test('应该处理单项式', () => {
      const input = {
        polynomial: {
          coefficients: [5], // 常数项
        },
        display: {
          showEndBehavior: true,
        },
      };

      expect(() => generatePolynomialComplete(input)).not.toThrow();
    });

    test('应该处理缺失的可选字段', () => {
      const input = {
        polynomial: {
          coefficients: [1, -1],
        },
        // 所有其他字段都是可选的
      };

      const html = generatePolynomialComplete(input);
      expect(html).toContain('多项式');
    });
  });

  describe('数学准确性测试', () => {
    test('应该正确计算二次公式的根', () => {
      const input = {
        polynomial: {
          coefficients: [1, -5, 6], // x^2 - 5x + 6，根应该是2和3
        },
        display: {
          showRootTable: true,
        },
      };

      const html = generatePolynomialComplete(input);
      
      // 应该包含根2和3
      expect(html).toMatch(/x = 2/);
      expect(html).toMatch(/x = 3/);
    });

    test('应该正确计算综合除法', () => {
      const input = {
        polynomial: {
          coefficients: [1, -3, 2], // x^2 - 3x + 2
        },
        syntheticDivision: {
          divisors: [1], // 除以(x-1)，商应该是x-2，余数0
          showSteps: true,
        },
        display: {
          showSyntheticDivision: true,
        },
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('余数: 0');
    });
  });

  describe('HTML结构验证', () => {
    test('应该生成有效的HTML结构', () => {
      const input = {
        polynomial: {
          coefficients: [1, -1],
        },
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html>');
      expect(html).toContain('<head>');
      expect(html).toContain('<body>');
      expect(html).toContain('</html>');
      expect(html).toContain('jsxgraphcore.js');
    });

    test('应该包含适当的CSS样式', () => {
      const input = {
        polynomial: {
          coefficients: [1, -1],
        },
      };

      const html = generatePolynomialComplete(input);
      
      expect(html).toContain('.analysis-section');
      expect(html).toContain('.factor-item');
      expect(html).toContain('.root-item');
      expect(html).toContain('.synthetic-division');
      expect(html).toContain('.behavior-arrow');
    });
  });
});
