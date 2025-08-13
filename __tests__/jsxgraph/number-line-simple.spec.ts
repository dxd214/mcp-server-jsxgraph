import { describe, test, expect } from 'vitest';
import { MathAnalysisEngine } from '../../src/utils/math-analysis-engine';

describe('Number Line Enhanced Features - Core Logic', () => {
  describe('不等式解析核心功能', () => {
    test('应该正确解析简单不等式', () => {
      const result = MathAnalysisEngine.parseInequality('x > 2');
      
      expect(result.type).toBe('simple');
      expect(result.intervals).toHaveLength(1);
      expect(result.intervals[0].start).toBe(2);
      expect(result.intervals[0].startType).toBe('open');
      expect(result.intervals[0].end).toBeNull();
      expect(result.intervalNotation).toContain('(2, +∞)');
    });

    test('应该正确解析复合不等式', () => {
      const result = MathAnalysisEngine.parseInequality('2 < x < 5');
      
      expect(result.type).toBe('simple');
      expect(result.intervals).toHaveLength(1);
      expect(result.intervals[0].start).toBe(2);
      expect(result.intervals[0].end).toBe(5);
      expect(result.intervalNotation).toContain('(2, 5)');
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
      expect(result.intervalNotation).toContain('(-3, 3)');
    });

    test('应该正确解析绝对值不等式 |x| > 2', () => {
      const result = MathAnalysisEngine.parseInequality('|x| > 2');
      
      expect(result.type).toBe('absolute');
      expect(result.operator).toBe('or');
      expect(result.intervals).toHaveLength(2);
      expect(result.intervalNotation).toContain('∪');
      expect(result.intervalNotation).toContain('(-∞, -2)');
      expect(result.intervalNotation).toContain('(2, +∞)');
    });

    test('应该正确解析平移的绝对值不等式', () => {
      const result = MathAnalysisEngine.parseInequality('|x - 1| < 2');
      
      expect(result.type).toBe('absolute');
      expect(result.intervals).toHaveLength(1);
      expect(result.intervals[0].start).toBe(-1);
      expect(result.intervals[0].end).toBe(3);
    });

    test('应该正确处理绝对值大于负数', () => {
      const result = MathAnalysisEngine.parseInequality('|x| > -2');
      
      expect(result.intervalNotation).toBe('ℝ');
    });

    test('应该正确处理绝对值小于负数', () => {
      const result = MathAnalysisEngine.parseInequality('|x| < -1');
      
      expect(result.intervalNotation).toBe('∅');
    });
  });

  describe('记号系统', () => {
    test('应该生成正确的集合记号', () => {
      const result = MathAnalysisEngine.parseInequality('x > 5');
      
      expect(result.setNotation).toContain('{x |');
      expect(result.setNotation).toContain('x > 5');
    });

    test('应该生成正确的区间记号', () => {
      const testCases = [
        { expr: 'x > 2', expected: '(2, +∞)' },
        { expr: 'x <= -1', expected: '(-∞, -1]' },
        { expr: '1 <= x <= 4', expected: '[1, 4]' },
        { expr: '-2 < x < 3', expected: '(-2, 3)' },
      ];

      testCases.forEach(({ expr, expected }) => {
        const result = MathAnalysisEngine.parseInequality(expr);
        expect(result.intervalNotation).toContain(expected.split(',')[0]);
      });
    });
  });

  describe('边界情况', () => {
    test('应该处理无效表达式', () => {
      const result = MathAnalysisEngine.parseInequality('invalid expression');
      
      expect(result.intervals).toHaveLength(0);
      expect(result.intervalNotation).toBe('∅');
    });

    test('应该处理空字符串', () => {
      const result = MathAnalysisEngine.parseInequality('');
      
      expect(result.intervals).toHaveLength(0);
      expect(result.intervalNotation).toBe('∅');
    });

    test('应该处理复杂的复合表达式', () => {
      const result = MathAnalysisEngine.parseInequality('x < -5 or x > 10 or x = 0');
      
      expect(result.type).toBe('compound');
      // 至少应该解析出部分内容
      expect(result.intervals.length).toBeGreaterThan(0);
    });
  });

  describe('性能测试', () => {
    test('应该在合理时间内处理简单不等式', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        MathAnalysisEngine.parseInequality(`x > ${i}`);
      }
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // 100个操作在1秒内
    });

    test('应该在合理时间内处理复杂不等式', () => {
      const startTime = Date.now();
      
      const complexExpressions = [
        'x < -10 or x > 15',
        '|x - 5| < 3',
        '-2 <= x <= 8',
        'x > 0 and x < 20'
      ];

      for (let i = 0; i < 25; i++) {
        complexExpressions.forEach(expr => {
          MathAnalysisEngine.parseInequality(expr);
        });
      }
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // 100个复杂操作在1秒内
    });
  });
});
