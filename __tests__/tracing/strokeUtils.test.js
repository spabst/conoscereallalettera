/**
 * Tests for stroke utility functions
 */

import {
  distance,
  calculatePathLength,
  getBoundingBox,
  normalizePoints,
  pointToSegmentDistance,
  pointToPathDistance,
  resamplePath,
  generateStrokeSeed,
  createSeededRandom,
  flattenStrokes,
  calculateStrokesLength,
  getStrokesBoundingBox,
} from '../../features/tracing/strokeUtils';

describe('strokeUtils', () => {
  describe('distance', () => {
    it('calculates distance between two points', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 3, y: 4 };
      expect(distance(p1, p2)).toBe(5);
    });

    it('returns 0 for same point', () => {
      const p = { x: 10, y: 20 };
      expect(distance(p, p)).toBe(0);
    });
  });

  describe('calculatePathLength', () => {
    it('returns 0 for empty array', () => {
      expect(calculatePathLength([])).toBe(0);
    });

    it('returns 0 for single point', () => {
      expect(calculatePathLength([{ x: 0, y: 0 }])).toBe(0);
    });

    it('calculates length of straight line', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 3, y: 4 },
      ];
      expect(calculatePathLength(points)).toBe(5);
    });

    it('calculates length of multi-segment path', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 3, y: 0 }, // length 3
        { x: 3, y: 4 }, // length 4
      ];
      expect(calculatePathLength(points)).toBe(7);
    });
  });

  describe('getBoundingBox', () => {
    it('returns zero bounds for empty array', () => {
      const bounds = getBoundingBox([]);
      expect(bounds.width).toBe(0);
      expect(bounds.height).toBe(0);
    });

    it('calculates correct bounds for points', () => {
      const points = [
        { x: 10, y: 20 },
        { x: 50, y: 80 },
        { x: 30, y: 40 },
      ];
      const bounds = getBoundingBox(points);
      expect(bounds.minX).toBe(10);
      expect(bounds.minY).toBe(20);
      expect(bounds.maxX).toBe(50);
      expect(bounds.maxY).toBe(80);
      expect(bounds.width).toBe(40);
      expect(bounds.height).toBe(60);
    });
  });

  describe('normalizePoints', () => {
    it('normalizes points from one bounds to another', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
      ];
      const fromBounds = { minX: 0, minY: 0, maxX: 100, maxY: 100 };
      const toBounds = { minX: 0, minY: 0, maxX: 200, maxY: 200 };

      const normalized = normalizePoints(points, fromBounds, toBounds);

      expect(normalized[0]).toEqual({ x: 0, y: 0 });
      expect(normalized[1]).toEqual({ x: 200, y: 200 });
    });

    it('handles empty array', () => {
      const fromBounds = { minX: 0, minY: 0, maxX: 100, maxY: 100 };
      const toBounds = { minX: 0, minY: 0, maxX: 200, maxY: 200 };
      expect(normalizePoints([], fromBounds, toBounds)).toEqual([]);
    });

    it('handles zero-width bounds', () => {
      const points = [{ x: 50, y: 50 }];
      const fromBounds = { minX: 50, minY: 50, maxX: 50, maxY: 50 };
      const toBounds = { minX: 0, minY: 0, maxX: 100, maxY: 100 };
      const normalized = normalizePoints(points, fromBounds, toBounds);
      expect(normalized[0]).toEqual({ x: 0, y: 0 });
    });
  });

  describe('pointToSegmentDistance', () => {
    it('calculates perpendicular distance to segment', () => {
      const point = { x: 2, y: 2 };
      const segStart = { x: 0, y: 0 };
      const segEnd = { x: 4, y: 0 };

      const dist = pointToSegmentDistance(point, segStart, segEnd);
      expect(dist).toBe(2);
    });

    it('calculates distance to segment endpoint when projection is outside', () => {
      const point = { x: 6, y: 0 };
      const segStart = { x: 0, y: 0 };
      const segEnd = { x: 4, y: 0 };

      const dist = pointToSegmentDistance(point, segStart, segEnd);
      expect(dist).toBe(2);
    });

    it('returns 0 for point on segment', () => {
      const point = { x: 2, y: 0 };
      const segStart = { x: 0, y: 0 };
      const segEnd = { x: 4, y: 0 };

      const dist = pointToSegmentDistance(point, segStart, segEnd);
      expect(dist).toBe(0);
    });

    it('handles degenerate segment (point)', () => {
      const point = { x: 5, y: 5 };
      const segStart = { x: 0, y: 0 };
      const segEnd = { x: 0, y: 0 };

      const dist = pointToSegmentDistance(point, segStart, segEnd);
      expect(dist).toBeCloseTo(Math.sqrt(50), 5);
    });
  });

  describe('pointToPathDistance', () => {
    it('finds minimum distance to path', () => {
      const point = { x: 2, y: 2 };
      const path = [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 4 },
      ];

      const dist = pointToPathDistance(point, path);
      expect(dist).toBe(2); // Distance to first segment
    });

    it('returns Infinity for empty path', () => {
      const point = { x: 0, y: 0 };
      expect(pointToPathDistance(point, [])).toBe(Infinity);
    });

    it('returns Infinity for single-point path', () => {
      const point = { x: 0, y: 0 };
      expect(pointToPathDistance(point, [{ x: 5, y: 5 }])).toBe(Infinity);
    });
  });

  describe('resamplePath', () => {
    it('returns original for too few points', () => {
      const points = [{ x: 0, y: 0 }];
      expect(resamplePath(points, 10)).toBe(points);
    });

    it('returns original for invalid spacing', () => {
      const points = [{ x: 0, y: 0 }, { x: 10, y: 0 }];
      expect(resamplePath(points, 0)).toBe(points);
    });

    it('resamples path with uniform spacing', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ];
      const resampled = resamplePath(points, 2);

      expect(resampled.length).toBeGreaterThan(2);
      expect(resampled[0]).toEqual({ x: 0, y: 0 });
      expect(resampled[resampled.length - 1]).toEqual({ x: 10, y: 0 });
    });

    it('maintains endpoint in resampled path', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 7, y: 0 },
      ];
      const resampled = resamplePath(points, 3);
      expect(resampled[resampled.length - 1]).toEqual({ x: 7, y: 0 });
    });
  });

  describe('generateStrokeSeed', () => {
    it('generates consistent seed for same ID', () => {
      const seed1 = generateStrokeSeed('test-123');
      const seed2 = generateStrokeSeed('test-123');
      expect(seed1).toBe(seed2);
    });

    it('generates different seeds for different IDs', () => {
      const seed1 = generateStrokeSeed('test-1');
      const seed2 = generateStrokeSeed('test-2');
      expect(seed1).not.toBe(seed2);
    });

    it('returns positive number', () => {
      const seed = generateStrokeSeed('test');
      expect(seed).toBeGreaterThan(0);
    });
  });

  describe('createSeededRandom', () => {
    it('generates deterministic random sequence', () => {
      const rng1 = createSeededRandom(12345);
      const rng2 = createSeededRandom(12345);

      const seq1 = [rng1(), rng1(), rng1()];
      const seq2 = [rng2(), rng2(), rng2()];

      expect(seq1).toEqual(seq2);
    });

    it('generates values between 0 and 1', () => {
      const rng = createSeededRandom(42);
      for (let i = 0; i < 100; i++) {
        const val = rng();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });

    it('generates different sequences for different seeds', () => {
      const rng1 = createSeededRandom(100);
      const rng2 = createSeededRandom(200);

      expect(rng1()).not.toBe(rng2());
    });
  });

  describe('flattenStrokes', () => {
    it('flattens multiple strokes into single array', () => {
      const strokes = [
        { points: [{ x: 0, y: 0 }, { x: 1, y: 1 }] },
        { points: [{ x: 2, y: 2 }, { x: 3, y: 3 }] },
      ];

      const flattened = flattenStrokes(strokes);
      expect(flattened.length).toBe(4);
      expect(flattened[0]).toEqual({ x: 0, y: 0 });
      expect(flattened[3]).toEqual({ x: 3, y: 3 });
    });

    it('returns empty array for empty input', () => {
      expect(flattenStrokes([])).toEqual([]);
    });

    it('handles strokes without points property', () => {
      const strokes = [{ other: 'data' }];
      expect(flattenStrokes(strokes)).toEqual([]);
    });
  });

  describe('calculateStrokesLength', () => {
    it('calculates total length of multiple strokes', () => {
      const strokes = [
        { points: [{ x: 0, y: 0 }, { x: 3, y: 0 }] }, // length 3
        { points: [{ x: 0, y: 0 }, { x: 0, y: 4 }] }, // length 4
      ];

      expect(calculateStrokesLength(strokes)).toBe(7);
    });

    it('returns 0 for empty strokes', () => {
      expect(calculateStrokesLength([])).toBe(0);
    });
  });

  describe('getStrokesBoundingBox', () => {
    it('calculates combined bounding box', () => {
      const strokes = [
        { points: [{ x: 0, y: 0 }, { x: 10, y: 10 }] },
        { points: [{ x: 20, y: 20 }, { x: 30, y: 30 }] },
      ];

      const bounds = getStrokesBoundingBox(strokes);
      expect(bounds.minX).toBe(0);
      expect(bounds.minY).toBe(0);
      expect(bounds.maxX).toBe(30);
      expect(bounds.maxY).toBe(30);
      expect(bounds.width).toBe(30);
      expect(bounds.height).toBe(30);
    });
  });
});
