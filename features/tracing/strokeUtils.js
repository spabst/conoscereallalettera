/**
 * Pure geometry utilities for stroke manipulation and analysis
 * All functions are deterministic and side-effect free for testability
 */

/**
 * Calculate Euclidean distance between two points
 */
export function distance(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate total path length from array of points
 * @param {Array<{x: number, y: number}>} points
 * @returns {number} Total length
 */
export function calculatePathLength(points) {
  if (!points || points.length < 2) {
    return 0;
  }

  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += distance(points[i - 1], points[i]);
  }
  return length;
}

/**
 * Get bounding box of points
 * @param {Array<{x: number, y: number}>} points
 * @returns {{minX: number, minY: number, maxX: number, maxY: number, width: number, height: number}}
 */
export function getBoundingBox(points) {
  if (!points || points.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  points.forEach(p => {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Normalize points from one bounds to another
 * @param {Array<{x: number, y: number}>} points
 * @param {{minX: number, minY: number, maxX: number, maxY: number}} fromBounds
 * @param {{minX: number, minY: number, maxX: number, maxY: number}} toBounds
 * @returns {Array<{x: number, y: number}>}
 */
export function normalizePoints(points, fromBounds, toBounds) {
  if (!points || points.length === 0) {
    return [];
  }

  const fromWidth = fromBounds.maxX - fromBounds.minX;
  const fromHeight = fromBounds.maxY - fromBounds.minY;
  const toWidth = toBounds.maxX - toBounds.minX;
  const toHeight = toBounds.maxY - toBounds.minY;

  // Avoid division by zero
  if (fromWidth === 0 || fromHeight === 0) {
    return points.map(p => ({ x: toBounds.minX, y: toBounds.minY }));
  }

  return points.map(p => ({
    x: toBounds.minX + ((p.x - fromBounds.minX) / fromWidth) * toWidth,
    y: toBounds.minY + ((p.y - fromBounds.minY) / fromHeight) * toHeight,
  }));
}

/**
 * Calculate shortest distance from a point to a line segment
 * @param {{x: number, y: number}} point
 * @param {{x: number, y: number}} segStart
 * @param {{x: number, y: number}} segEnd
 * @returns {number} Distance
 */
export function pointToSegmentDistance(point, segStart, segEnd) {
  const dx = segEnd.x - segStart.x;
  const dy = segEnd.y - segStart.y;
  const lengthSquared = dx * dx + dy * dy;

  // Degenerate segment (point)
  if (lengthSquared === 0) {
    return distance(point, segStart);
  }

  // Calculate projection parameter t
  // t represents where the projection falls on the segment (0 = start, 1 = end)
  let t = ((point.x - segStart.x) * dx + (point.y - segStart.y) * dy) / lengthSquared;

  // Clamp t to [0, 1] to stay on segment
  t = Math.max(0, Math.min(1, t));

  // Calculate closest point on segment
  const closestX = segStart.x + t * dx;
  const closestY = segStart.y + t * dy;

  // Return distance to closest point
  return distance(point, { x: closestX, y: closestY });
}

/**
 * Find minimum distance from a point to any segment in a path
 * @param {{x: number, y: number}} point
 * @param {Array<{x: number, y: number}>} path
 * @returns {number} Minimum distance
 */
export function pointToPathDistance(point, path) {
  if (!path || path.length < 2) {
    return Infinity;
  }

  let minDist = Infinity;

  for (let i = 1; i < path.length; i++) {
    const dist = pointToSegmentDistance(point, path[i - 1], path[i]);
    minDist = Math.min(minDist, dist);
  }

  return minDist;
}

/**
 * Resample a path to have approximately uniform spacing between points
 * @param {Array<{x: number, y: number}>} points
 * @param {number} spacing - Target spacing between points
 * @returns {Array<{x: number, y: number}>}
 */
export function resamplePath(points, spacing) {
  if (!points || points.length < 2 || spacing <= 0) {
    return points;
  }

  const resampled = [points[0]];
  let accumulated = 0;

  for (let i = 1; i < points.length; i++) {
    const dist = distance(points[i - 1], points[i]);
    accumulated += dist;

    // Add intermediate points if segment is longer than spacing
    while (accumulated >= spacing) {
      const ratio = (spacing - (accumulated - dist)) / dist;
      const interpX = points[i - 1].x + ratio * (points[i].x - points[i - 1].x);
      const interpY = points[i - 1].y + ratio * (points[i].y - points[i - 1].y);
      resampled.push({ x: interpX, y: interpY });
      accumulated -= spacing;
    }
  }

  // Always include last point
  const lastPoint = points[points.length - 1];
  if (
    resampled[resampled.length - 1].x !== lastPoint.x ||
    resampled[resampled.length - 1].y !== lastPoint.y
  ) {
    resampled.push(lastPoint);
  }

  return resampled;
}

/**
 * Generate a deterministic seed from a stroke ID for particle generation
 * @param {string} strokeId
 * @returns {number} Seed value
 */
export function generateStrokeSeed(strokeId) {
  let hash = 0;
  for (let i = 0; i < strokeId.length; i++) {
    const char = strokeId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Seeded random number generator for deterministic particle placement
 * @param {number} seed
 * @returns {() => number} Function that returns random values between 0 and 1
 */
export function createSeededRandom(seed) {
  let state = seed;
  return function() {
    // Simple LCG (Linear Congruential Generator)
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * Flatten array of strokes into single array of points
 * @param {Array<{points: Array}>} strokes
 * @returns {Array<{x: number, y: number}>}
 */
export function flattenStrokes(strokes) {
  if (!strokes || strokes.length === 0) {
    return [];
  }

  return strokes.reduce((acc, stroke) => {
    return acc.concat(stroke.points || []);
  }, []);
}

/**
 * Calculate total length of multiple strokes
 * @param {Array<{points: Array}>} strokes
 * @returns {number}
 */
export function calculateStrokesLength(strokes) {
  if (!strokes || strokes.length === 0) {
    return 0;
  }

  return strokes.reduce((total, stroke) => {
    return total + calculatePathLength(stroke.points || []);
  }, 0);
}

/**
 * Get combined bounding box of multiple strokes
 * @param {Array<{points: Array}>} strokes
 * @returns {{minX, minY, maxX, maxY, width, height}}
 */
export function getStrokesBoundingBox(strokes) {
  const allPoints = flattenStrokes(strokes);
  return getBoundingBox(allPoints);
}
