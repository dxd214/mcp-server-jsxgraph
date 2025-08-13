import { describe, test, expect } from 'vitest';
import { generateNumberLine } from '../../src/jsxgraph/number-line';

describe('Enhanced Number Line Inequalities', () => {
  describe('简单不等式', () => {
    test('应该正确处理简单不等式 x > 2', () => {
      const input = {
        range: [-5, 10],
        inequalities: [{
          type: 'simple',
          expression: 'x > 2',
        }],
        showSetNotation: true,
        showIntervalNotation: true,
        showWorkSpace: true,
      };

      const html = generateNumberLine(input);
      
      expect(html).toContain('number line');
      expect(html).toContain('集合记号');
      expect(html).toContain('区间记号');
      expect(html).toContain('解题过程');
      expect(html).toContain('(2, +∞)');
    });

    test('应该正确处理包含等号的不等式 x <= -1', () => {
      const input = {
        inequalities: [{
          expression: 'x <= -1',
        }],
        showSetNotation: true,
        showIntervalNotation: true,
      };

      const html = generateNumberLine(input);
      
      expect(html).toContain('(-∞, -1]');
    });

    test('应该正确处理复合不等式 2 < x < 5', () => {
      const input = {
        inequalities: [{
          expression: '2 < x < 5',
        }],
        showSetNotation: true,
        showIntervalNotation: true,
      };

      const html = generateNumberLine(input);
      
      expect(html).toContain('(2, 5)');
    });
  });

  describe('复合不等式 (AND/OR)', () => {
    test('应该正确处理OR复合不等式', () => {
      const input = {
        inequalities: [{
          type: 'compound',
          expressions: ['x < -1', 'x > 3'],
          operator: 'or',
          color: '#ff0000',
        }],
        showSetNotation: true,
        showIntervalNotation: true,
        showWorkSpace: true,
      };

      const html = generateNumberLine(input);
      
      expect(html).toContain('∪');
      expect(html).toContain('(-∞, -1)');
      expect(html).toContain('(3, +∞)');
      expect(html).toContain('#ff0000');
    });

    test('应该正确处理AND复合不等式', () => {
      const input = {
        inequalities: [{
          type: 'compound',
          expressions: ['x > 0', 'x < 10'],
          operator: 'and',
        }],
        showSetNotation: true,
        showIntervalNotation: true,
      };

      const html = generateNumberLine(input);
      
      expect(html).toContain('(0, 10)');
    });
  });

  describe('绝对值不等式', () => {
    test('应该正确处理绝对值不等式 |x| < 3', () => {
      const input = {
        inequalities: [{
          type: 'absolute',
          expression: '|x| < 3',
        }],
        showSetNotation: true,
        showIntervalNotation: true,
        showWorkSpace: true,
      };

      const html = generateNumberLine(input);
      
      expect(html).toContain('(-3, 3)');
    });

    test('应该正确处理绝对值不等式 |x| > 2', () => {
      const input = {
        inequalities: [{
          type: 'absolute',
          expression: '|x| > 2',
        }],
        showSetNotation: true,
        showIntervalNotation: true,
      };

      const html = generateNumberLine(input);
      
      expect(html).toContain('∪');
      expect(html).toContain('(-∞, -2)');
      expect(html).toContain('(2, +∞)');
    });

    test('应该正确处理平移的绝对值不等式 |x - 1| < 2', () => {
      const input = {
        inequalities: [{
          type: 'absolute',
          expression: '|x - 1| < 2',
        }],
        showSetNotation: true,
        showIntervalNotation: true,
      };

      const html = generateNumberLine(input);
      
      expect(html).toContain('(-1, 3)');
    });

    test('应该正确处理绝对值大于负数的情况', () => {
      const input = {
        inequalities: [{
          type: 'absolute',
          expression: '|x| > -2',
        }],
        showSetNotation: true,
        showIntervalNotation: true,
      };

      const html = generateNumberLine(input);
      
      expect(html).toContain('ℝ');
    });

    test('应该正确处理绝对值小于负数的情况', () => {
      const input = {
        inequalities: [{
          type: 'absolute',
          expression: '|x| < -1',
        }],
        showSetNotation: true,
        showIntervalNotation: true,
      };

      const html = generateNumberLine(input);
      
      expect(html).toContain('∅');
    });
  });

  describe('显示选项', () => {
    test('应该在启用时显示集合记号', () => {
      const input = {
        inequalities: [{
          expression: 'x > 1',
        }],
        showSetNotation: true,
        showIntervalNotation: false,
      };

      const html = generateNumberLine(input);
      
      expect(html).toContain('集合记号');
      expect(html).toContain('{x |');
      expect(html).not.toContain('区间记号');
    });

    test('应该在启用时显示区间记号', () => {
      const input = {
        inequalities: [{
          expression: 'x <= 5',
        }],
        showSetNotation: false,
        showIntervalNotation: true,
      };

      const html = generateNumberLine(input);
      
      expect(html).not.toContain('集合记号');
      expect(html).toContain('区间记号');
      expect(html).toContain('(-∞, 5]');
    });

    test('应该在启用时显示工作区', () => {
      const input = {
        inequalities: [{
          expression: 'x > 0',
        }],
        showWorkSpace: true,
        autoAnalyze: true,
      };

      const html = generateNumberLine(input);
      
      expect(html).toContain('解题过程');
      expect(html).toContain('原始表达式');
      expect(html).toContain('解析为');
    });

    test('应该在禁用时不显示工作区', () => {
      const input = {
        inequalities: [{
          expression: 'x > 0',
        }],
        showWorkSpace: false,
      };

      const html = generateNumberLine(input);
      
      expect(html).not.toContain('解题过程');
    });
  });

  describe('自定义样式', () => {
    test('应该支持自定义颜色', () => {
      const input = {
        inequalities: [{
          expression: 'x > 1',
          color: '#ff5500',
          opacity: 0.5,
        }],
      };

      const html = generateNumberLine(input);
      
      expect(html).toContain('#ff5500');
      expect(html).toContain('0.5');
    });

    test('应该支持自定义标签', () => {
      const input = {
        inequalities: [{
          expression: 'x < 3',
          label: '自定义标签',
        }],
      };

      const html = generateNumberLine(input);
      
      expect(html).toContain('自定义标签');
    });
  });

  describe('多个不等式', () => {
    test('应该正确处理多个不等式', () => {
      const input = {
        inequalities: [
          {
            expression: 'x > 1',
            color: '#ff0000',
          },
          {
            expression: 'x < 5',
            color: '#00ff00',
          },
          {
            type: 'absolute',
            expression: '|x| > 2',
            color: '#0000ff',
          }
        ],
        showSetNotation: true,
        showIntervalNotation: true,
      };

      const html = generateNumberLine(input);
      
      expect(html).toContain('#ff0000');
      expect(html).toContain('#00ff00');
      expect(html).toContain('#0000ff');
      expect(html).toContain('(1, +∞)');
      expect(html).toContain('(-∞, 5)');
      expect(html).toContain('(-∞, -2) ∪ (2, +∞)');
    });
  });

  describe('向后兼容性', () => {
    test('应该在禁用autoAnalyze时使用回退模式', () => {
      const input = {
        inequalities: [{
          expression: 'x > 2',
        }],
        autoAnalyze: false,
        showSetNotation: true,
        showIntervalNotation: true,
      };

      const html = generateNumberLine(input);
      
      expect(html).toContain('需要自动分析');
      expect(html).toContain('{x | x > 2}');
    });

    test('应该支持传统的简单模式', () => {
      const input = {
        points: [
          { value: 2, type: 'open' },
          { value: 5, type: 'closed' }
        ],
        intervals: [{
          start: 2,
          end: 5,
          startType: 'open',
          endType: 'closed',
        }],
      };

      const html = generateNumberLine(input);
      
      expect(html).toContain('strokeColor');
      expect(html).toContain('fillColor');
    });
  });

  describe('错误处理', () => {
    test('应该处理无效的不等式表达式', () => {
      const input = {
        inequalities: [{
          expression: 'invalid expression',
        }],
        showWorkSpace: true,
      };

      const html = generateNumberLine(input);
      
      expect(html).toContain('number line');
      expect(html).not.toThrow;
    });

    test('应该处理空的不等式数组', () => {
      const input = {
        inequalities: [],
        showSetNotation: true,
      };

      const html = generateNumberLine(input);
      
      expect(html).toContain('number line');
      expect(html).not.toContain('集合记号');
    });

    test('应该处理缺失的operator字段', () => {
      const input = {
        inequalities: [{
          type: 'compound',
          expressions: ['x > 1', 'x < 5'],
          // missing operator
        }],
      };

      expect(() => generateNumberLine(input)).not.toThrow();
    });
  });

  describe('HTML结构', () => {
    test('应该生成有效的HTML结构', () => {
      const input = {
        title: '测试标题',
        inequalities: [{
          expression: 'x > 0',
        }],
        showSetNotation: true,
        showIntervalNotation: true,
        showWorkSpace: true,
      };

      const html = generateNumberLine(input);
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html>');
      expect(html).toContain('<head>');
      expect(html).toContain('<body>');
      expect(html).toContain('</html>');
      expect(html).toContain('测试标题');
      expect(html).toContain('container');
      expect(html).toContain('jxgbox');
    });

    test('应该包含JSXGraph脚本', () => {
      const input = {
        inequalities: [{
          expression: 'x > 1',
        }],
      };

      const html = generateNumberLine(input);
      
      expect(html).toContain('jsxgraphcore.js');
      expect(html).toContain('JXG.JSXGraph.initBoard');
    });

    test('应该包含适当的CSS样式', () => {
      const input = {
        inequalities: [{
          expression: 'x > 1',
        }],
        showSetNotation: true,
        showWorkSpace: true,
      };

      const html = generateNumberLine(input);
      
      expect(html).toContain('.notation-section');
      expect(html).toContain('.workspace-section');
      expect(html).toContain('.work-step');
      expect(html).toContain('.notation-item');
    });
  });
});
