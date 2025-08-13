import { describe, test, expect } from 'vitest';
import { generateFunctionProperties } from '../../src/jsxgraph/function-properties';

describe('Function Properties Analyzer', () => {
  describe('基本函数分析', () => {
    test('应该正确分析二次函数', () => {
      const input = {
        function: {
          expression: 'x**2',
          name: 'f(x)',
          color: '#0066cc',
        },
        analyze: {
          domain: true,
          range: true,
          intercepts: true,
          extrema: true,
          monotonicity: true,
          concavity: true,
        },
        display: {
          showGraph: true,
          showTable: true,
          annotateGraph: true,
        },
      };

      const html = generateFunctionProperties(input);
      
      expect(html).toContain('函数属性分析');
      expect(html).toContain('定义域');
      expect(html).toContain('极值点');
      expect(html).toContain('f(x)');
      expect(html).toContain('x**2');
      expect(html).toContain('JXG.JSXGraph.initBoard');
      expect(html).toContain('properties-table');
    });

    test('应该正确分析正弦函数', () => {
      const input = {
        function: {
          expression: 'Math.sin(x)',
          name: 'sin(x)',
          color: '#ff6600',
        },
        analyze: {
          periodicity: true,
          symmetry: true,
          domain: true,
        },
        display: {
          showTable: true,
        },
      };

      const html = generateFunctionProperties(input);
      
      expect(html).toContain('sin(x)');
      expect(html).toContain('Math.sin(x)');
      expect(html).toContain('#ff6600');
      expect(html).toContain('周期性');
      expect(html).toContain('对称性');
    });

    test('应该正确分析有理函数', () => {
      const input = {
        function: {
          expression: '1/x',
          name: 'f(x)',
        },
        analyze: {
          domain: true,
          asymptotes: true,
        },
        display: {
          showAsymptoteLines: true,
          showTable: true,
        },
      };

      const html = generateFunctionProperties(input);
      
      expect(html).toContain('渐近线');
      expect(html).toContain('1/x');
      expect(html).toContain('dash: 2'); // 渐近线样式
    });
  });

  describe('多函数对比模式', () => {
    test('应该支持多函数对比', () => {
      const input = {
        functions: [
          {
            expression: 'x**2',
            name: 'f(x) = x²',
            color: '#ff0000',
          },
          {
            expression: 'x**3',
            name: 'g(x) = x³',
            color: '#0000ff',
          },
        ],
        advanced: {
          compareMode: true,
        },
        analyze: {
          extrema: true,
          monotonicity: true,
        },
        display: {
          showGraph: true,
          showTable: true,
        },
      };

      const html = generateFunctionProperties(input);
      
      expect(html).toContain('函数列表');
      expect(html).toContain('f(x) = x²');
      expect(html).toContain('g(x) = x³');
      expect(html).toContain('#ff0000');
      expect(html).toContain('#0000ff');
      expect(html).toContain('x**2');
      expect(html).toContain('x**3');
    });
  });

  describe('显示选项', () => {
    test('应该在启用时显示图像', () => {
      const input = {
        function: {
          expression: 'x + 1',
        },
        display: {
          showGraph: true,
          showTable: false,
        },
      };

      const html = generateFunctionProperties(input);
      
      expect(html).toContain('jxgbox');
      expect(html).toContain('functiongraph');
      expect(html).toContain('display: none;'); // table should be hidden
    });

    test('应该在启用时显示属性表格', () => {
      const input = {
        function: {
          expression: 'x**2 + 2*x + 1',
        },
        analyze: {
          domain: true,
          range: true,
          extrema: true,
        },
        display: {
          showGraph: false,
          showTable: true,
        },
      };

      const html = generateFunctionProperties(input);
      
      expect(html).toContain('properties-table');
      expect(html).toContain('定义域');
      expect(html).toContain('值域');
      expect(html).toContain('极值点');
      expect(html).toContain('display: none;'); // graph should be hidden
    });

    test('应该在启用时显示工作步骤', () => {
      const input = {
        function: {
          expression: 'x**2 - 4',
        },
        analyze: {
          intercepts: true,
        },
        advanced: {
          showWorkSteps: true,
        },
      };

      const html = generateFunctionProperties(input);
      
      expect(html).toContain('work-steps');
      expect(html).toContain('分析过程');
      expect(html).toContain('开始分析函数');
    });

    test('应该在启用时显示图像标注', () => {
      const input = {
        function: {
          expression: 'x**2',
        },
        analyze: {
          intercepts: true,
          extrema: true,
        },
        display: {
          annotateGraph: true,
          showGraph: true,
        },
      };

      const html = generateFunctionProperties(input);
      
      expect(html).toContain('图像标注说明');
      expect(html).toContain('截距点');
      expect(html).toContain('最大值点');
      expect(html).toContain('最小值点');
    });

    test('应该在启用时显示切线', () => {
      const input = {
        function: {
          expression: 'x**2',
        },
        display: {
          showTangentLines: [1, 2, -1],
          showGraph: true,
        },
      };

      const html = generateFunctionProperties(input);
      
      expect(html).toContain('绘制切线');
      expect(html).toContain('tangent at x=1');
      expect(html).toContain('tangent at x=2');
      expect(html).toContain('tangent at x=-1');
    });
  });

  describe('高级选项', () => {
    test('应该支持精度设置', () => {
      const input = {
        function: {
          expression: 'Math.PI * x',
        },
        analyze: {
          intercepts: true,
        },
        advanced: {
          precision: 6,
        },
        display: {
          showTable: true,
        },
      };

      const html = generateFunctionProperties(input);
      
      expect(html).toContain('toFixed(6)');
    });

    test('应该支持自定义域', () => {
      const input = {
        function: {
          expression: 'Math.sin(x)',
          domain: [-3.14, 3.14],
        },
        display: {
          showGraph: true,
        },
      };

      const html = generateFunctionProperties(input);
      
      expect(html).toContain('-3.14, 3.14');
    });
  });

  describe('分析功能', () => {
    test('应该分析函数的定义域', () => {
      const input = {
        function: {
          expression: 'Math.sqrt(x)',
        },
        analyze: {
          domain: true,
        },
        display: {
          showTable: true,
        },
        advanced: {
          showWorkSteps: true,
        },
      };

      const html = generateFunctionProperties(input);
      
      expect(html).toContain('定义域');
      expect(html).toContain('根号内表达式');
    });

    test('应该分析函数的极值', () => {
      const input = {
        function: {
          expression: 'x**2 - 4*x + 3',
        },
        analyze: {
          extrema: true,
        },
        display: {
          showTable: true,
        },
      };

      const html = generateFunctionProperties(input);
      
      expect(html).toContain('极值点');
    });

    test('应该分析函数的对称性', () => {
      const input = {
        function: {
          expression: 'x**2',
        },
        analyze: {
          symmetry: true,
        },
        display: {
          showTable: true,
        },
      };

      const html = generateFunctionProperties(input);
      
      expect(html).toContain('对称性');
      expect(html).toContain('偶函数');
    });

    test('应该分析函数的周期性', () => {
      const input = {
        function: {
          expression: 'Math.sin(x)',
        },
        analyze: {
          periodicity: true,
        },
        display: {
          showTable: true,
        },
      };

      const html = generateFunctionProperties(input);
      
      expect(html).toContain('周期性');
      expect(html).toContain('周期');
    });
  });

  describe('样式和布局', () => {
    test('应该支持自定义样式', () => {
      const input = {
        function: {
          expression: 'x**2',
          color: '#123456',
          strokeWidth: 3,
        },
        style: {
          backgroundColor: '#f0f0f0',
          theme: 'dark',
        },
        width: 1000,
        height: 800,
      };

      const html = generateFunctionProperties(input);
      
      expect(html).toContain('#123456');
      expect(html).toContain('strokeWidth: 3');
      expect(html).toContain('#f0f0f0');
      expect(html).toContain('width:1000px');
      expect(html).toContain('height:800px');
    });

    test('应该支持自定义标题和坐标轴', () => {
      const input = {
        function: {
          expression: 'x**3',
        },
        title: '三次函数分析',
        axisXTitle: '输入值',
        axisYTitle: '输出值',
      };

      const html = generateFunctionProperties(input);
      
      expect(html).toContain('三次函数分析');
      expect(html).toContain('输入值');
      expect(html).toContain('输出值');
    });

    test('应该正确生成HTML结构', () => {
      const input = {
        function: {
          expression: 'x + 1',
        },
      };

      const html = generateFunctionProperties(input);
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html>');
      expect(html).toContain('<head>');
      expect(html).toContain('<body>');
      expect(html).toContain('</html>');
      expect(html).toContain('container');
    });
  });

  describe('错误处理', () => {
    test('应该处理无效的函数表达式', () => {
      const input = {
        function: {
          expression: 'invalid_function',
        },
        advanced: {
          showWorkSteps: true,
        },
      };

      expect(() => generateFunctionProperties(input)).not.toThrow();
      
      const html = generateFunctionProperties(input);
      expect(html).toContain('分析过程中出现错误');
    });

    test('应该处理空的函数表达式', () => {
      const input = {
        function: {
          expression: '',
        },
      };

      expect(() => generateFunctionProperties(input)).not.toThrow();
    });

    test('应该处理缺失的必需字段', () => {
      const input = {
        function: {
          // missing expression
        },
      };

      expect(() => generateFunctionProperties(input)).toThrow();
    });
  });

  describe('性能测试', () => {
    test('应该在合理时间内生成分析', () => {
      const input = {
        function: {
          expression: 'x**4 - 6*x**2 + 8*x - 3',
        },
        analyze: {
          domain: true,
          range: true,
          extrema: true,
          monotonicity: true,
          concavity: true,
          inflectionPoints: true,
        },
        display: {
          showGraph: true,
          showTable: true,
        },
      };

      const startTime = Date.now();
      generateFunctionProperties(input);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000);
    });

    test('应该在对比模式下保持性能', () => {
      const input = {
        functions: [
          { expression: 'x**2', name: 'f1' },
          { expression: 'x**3', name: 'f2' },
          { expression: 'Math.sin(x)', name: 'f3' },
          { expression: 'Math.exp(x)', name: 'f4' },
        ],
        advanced: {
          compareMode: true,
        },
        analyze: {
          extrema: true,
          monotonicity: true,
        },
      };

      const startTime = Date.now();
      generateFunctionProperties(input);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });
});
