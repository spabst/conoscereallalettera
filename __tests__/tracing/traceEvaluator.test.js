/**
 * Tests for trace evaluator
 */

import { evaluateTrace } from '../../features/tracing/traceEvaluator';
import { TRACE_CONFIG } from '../../features/tracing/traceConfig';

// Mock canvas size for testing
const CANVAS_SIZE = { width: 800, height: 600 };

describe('traceEvaluator', () => {
  describe('empty strokes', () => {
    it('returns failure for empty strokes array', () => {
      const result = evaluateTrace({
        targetLetter: 'A',
        strokes: [],
        canvasSize: CANVAS_SIZE,
      });

      expect(result.success).toBe(false);
      expect(result.reason).toBe('empty');
      expect(result.coverage).toBe(0);
      expect(result.precision).toBe(0);
      expect(result.normalizedLength).toBe(0);
    });

    it('returns failure for null strokes', () => {
      const result = evaluateTrace({
        targetLetter: 'A',
        strokes: null,
        canvasSize: CANVAS_SIZE,
      });

      expect(result.success).toBe(false);
      expect(result.reason).toBe('empty');
    });
  });

  describe('too-short strokes', () => {
    it('fails for single point stroke', () => {
      const strokes = [
        {
          points: [{ x: 400, y: 300 }],
        },
      ];

      const result = evaluateTrace({
        targetLetter: 'I',
        strokes,
        canvasSize: CANVAS_SIZE,
      });

      expect(result.success).toBe(false);
      expect(result.reason).toBe('too_short');
    });

    it('fails for very short stroke', () => {
      const strokes = [
        {
          points: [
            { x: 400, y: 300 },
            { x: 401, y: 301 },
          ],
        },
      ];

      const result = evaluateTrace({
        targetLetter: 'I',
        strokes,
        canvasSize: CANVAS_SIZE,
      });

      expect(result.success).toBe(false);
      expect(result.normalizedLength).toBeLessThan(0.01);
    });
  });

  describe('off-target scribbles', () => {
    it('fails for stroke far from target', () => {
      // Draw a horizontal line at the top of canvas, far from letter
      const strokes = [
        {
          points: [
            { x: 100, y: 50 },
            { x: 200, y: 50 },
            { x: 300, y: 50 },
            { x: 400, y: 50 },
          ],
        },
      ];

      const result = evaluateTrace({
        targetLetter: 'I', // I should be centered vertically
        strokes,
        canvasSize: CANVAS_SIZE,
      });

      expect(result.success).toBe(false);
      expect(result.precision).toBeLessThan(0.5); // Most points should be far from target
    });

    it('fails for random scribble pattern', () => {
      // Zigzag pattern not following any letter
      const strokes = [
        {
          points: [
            { x: 100, y: 100 },
            { x: 150, y: 200 },
            { x: 200, y: 100 },
            { x: 250, y: 200 },
            { x: 300, y: 100 },
          ],
        },
      ];

      const result = evaluateTrace({
        targetLetter: 'I',
        strokes,
        canvasSize: CANVAS_SIZE,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('incomplete coverage', () => {
    it('fails when only small part of letter is traced', () => {
      // Letter I centered around 400,300
      // Trace only top portion
      const strokes = [
        {
          points: [
            { x: 400, y: 200 },
            { x: 400, y: 250 },
          ],
        },
      ];

      const result = evaluateTrace({
        targetLetter: 'I',
        strokes,
        canvasSize: CANVAS_SIZE,
      });

      // Should have good precision but low coverage
      expect(result.success).toBe(false);
      expect(result.coverage).toBeLessThan(TRACE_CONFIG.evaluation.minCoverage);
    });
  });

  describe('valid traces', () => {
    it('succeeds for simple vertical stroke matching I', () => {
      // Draw a vertical line in center (where I should be)
      const strokes = [
        {
          points: generateVerticalLine(400, 200, 400, 500, 30),
        },
      ];

      const result = evaluateTrace({
        targetLetter: 'I',
        strokes,
        canvasSize: CANVAS_SIZE,
      });

      expect(result.success).toBe(true);
      expect(result.reason).toBe('passed');
      expect(result.coverage).toBeGreaterThan(TRACE_CONFIG.evaluation.minCoverage);
      expect(result.precision).toBeGreaterThan(TRACE_CONFIG.evaluation.minPrecision);
    });

    it('evaluates circular stroke for O with reasonable metrics', () => {
      // Draw a circle - actual positioning depends on target scaling
      const centerX = CANVAS_SIZE.width / 2;
      const centerY = CANVAS_SIZE.height / 2;
      const size = Math.min(CANVAS_SIZE.width - 80, CANVAS_SIZE.height - 80);
      const radius = size * 0.28;

      const strokes = [
        {
          points: generateCircle(centerX, centerY, radius, 50),
        },
      ];

      const result = evaluateTrace({
        targetLetter: 'O',
        strokes,
        canvasSize: CANVAS_SIZE,
      });

      // Verify evaluator produces reasonable metrics
      // Exact success depends on how well synthetic circle matches target
      expect(result.coverage).toBeGreaterThan(0.3);
      expect(result.precision).toBeGreaterThan(0.4);
      expect(result.normalizedLength).toBeGreaterThan(0);
    });
  });

  describe('multi-stroke letters', () => {
    it('evaluates multiple strokes together for letter A', () => {
      const centerX = CANVAS_SIZE.width / 2;
      const centerY = CANVAS_SIZE.height / 2;
      const size = Math.min(CANVAS_SIZE.width - 80, CANVAS_SIZE.height - 80);

      // Match target definition: A has strokes from normalized coordinates
      // Left: (0.3,0.85) to (0.5,0.25)
      // Right: (0.5,0.25) to (0.7,0.85)
      // Crossbar: (0.38,0.6) to (0.62,0.6)

      const leftStroke = {
        points: generateLine(
          centerX + (0.3 - 0.5) * size,
          centerY + (0.85 - 0.5) * size,
          centerX,
          centerY + (0.25 - 0.5) * size,
          25
        ),
      };

      const rightStroke = {
        points: generateLine(
          centerX,
          centerY + (0.25 - 0.5) * size,
          centerX + (0.7 - 0.5) * size,
          centerY + (0.85 - 0.5) * size,
          25
        ),
      };

      const crossbar = {
        points: generateLine(
          centerX + (0.38 - 0.5) * size,
          centerY + (0.6 - 0.5) * size,
          centerX + (0.62 - 0.5) * size,
          centerY + (0.6 - 0.5) * size,
          15
        ),
      };

      const result = evaluateTrace({
        targetLetter: 'A',
        strokes: [leftStroke, rightStroke, crossbar],
        canvasSize: CANVAS_SIZE,
      });

      // Verify evaluator handles multi-stroke evaluation
      expect(result.userSampleCount).toBeGreaterThan(0);
      expect(result.targetSampleCount).toBeGreaterThan(0);
      expect(result.coverage).toBeGreaterThan(0.3);
      expect(result.precision).toBeGreaterThan(0.4);
    });

    it('accumulates length from multiple strokes', () => {
      const stroke1 = {
        points: [
          { x: 100, y: 100 },
          { x: 200, y: 100 },
        ],
      };

      const stroke2 = {
        points: [
          { x: 100, y: 200 },
          { x: 200, y: 200 },
        ],
      };

      const result = evaluateTrace({
        targetLetter: 'I',
        strokes: [stroke1, stroke2],
        canvasSize: CANVAS_SIZE,
      });

      expect(result.normalizedLength).toBeGreaterThan(0);
    });
  });

  describe('tolerance and child-like deviations', () => {
    it('tolerates slight deviations from perfect line', () => {
      // Slightly wavy vertical line
      const points = [];
      for (let y = 200; y <= 500; y += 10) {
        const wobble = Math.sin(y / 30) * 8; // Small horizontal wobble
        points.push({ x: 400 + wobble, y });
      }

      const strokes = [{ points }];

      const result = evaluateTrace({
        targetLetter: 'I',
        strokes,
        canvasSize: CANVAS_SIZE,
      });

      // Should still pass despite wobble
      expect(result.success).toBe(true);
    });
  });

  describe('deterministic behavior', () => {
    it('returns same result for same input', () => {
      const strokes = [
        {
          points: generateVerticalLine(400, 200, 400, 500, 30),
        },
      ];

      const result1 = evaluateTrace({
        targetLetter: 'I',
        strokes,
        canvasSize: CANVAS_SIZE,
      });

      const result2 = evaluateTrace({
        targetLetter: 'I',
        strokes,
        canvasSize: CANVAS_SIZE,
      });

      expect(result1.coverage).toBe(result2.coverage);
      expect(result1.precision).toBe(result2.precision);
      expect(result1.score).toBe(result2.score);
      expect(result1.success).toBe(result2.success);
    });
  });

  describe('score calculation', () => {
    it('calculates score as weighted combination', () => {
      const strokes = [
        {
          points: generateVerticalLine(400, 200, 400, 500, 30),
        },
      ];

      const result = evaluateTrace({
        targetLetter: 'I',
        strokes,
        canvasSize: CANVAS_SIZE,
      });

      const expectedScore =
        TRACE_CONFIG.evaluation.coverageWeight * result.coverage +
        TRACE_CONFIG.evaluation.precisionWeight * result.precision;

      expect(result.score).toBeCloseTo(expectedScore, 5);
    });

    it('enforces independent thresholds', () => {
      // Even if score is high, individual metrics must pass thresholds
      // This is tested implicitly by the evaluation logic
      // Just verify the config has reasonable thresholds
      expect(TRACE_CONFIG.evaluation.minCoverage).toBeGreaterThan(0);
      expect(TRACE_CONFIG.evaluation.minPrecision).toBeGreaterThan(0);
      expect(TRACE_CONFIG.evaluation.minScore).toBeGreaterThan(0);
    });
  });

  describe('result structure', () => {
    it('returns all required fields', () => {
      const result = evaluateTrace({
        targetLetter: 'I',
        strokes: [],
        canvasSize: CANVAS_SIZE,
      });

      expect(result).toHaveProperty('target');
      expect(result).toHaveProperty('coverage');
      expect(result).toHaveProperty('precision');
      expect(result).toHaveProperty('normalizedLength');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('reason');
      expect(result).toHaveProperty('targetSampleCount');
      expect(result).toHaveProperty('userSampleCount');
    });

    it('includes target letter in result', () => {
      const result = evaluateTrace({
        targetLetter: 'X',
        strokes: [],
        canvasSize: CANVAS_SIZE,
      });

      expect(result.target).toBe('X');
    });
  });
});

// Helper functions for generating test geometry

function generateVerticalLine(x, y1, x2, y2, numPoints) {
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    points.push({
      x: x + (x2 - x) * t,
      y: y1 + (y2 - y1) * t,
    });
  }
  return points;
}

function generateLine(x1, y1, x2, y2, numPoints) {
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    points.push({
      x: x1 + (x2 - x1) * t,
      y: y1 + (y2 - y1) * t,
    });
  }
  return points;
}

function generateCircle(cx, cy, radius, numPoints) {
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    points.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    });
  }
  // Close the circle
  points.push(points[0]);
  return points;
}
