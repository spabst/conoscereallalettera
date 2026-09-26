/**
 * Geometric trace evaluator
 *
 * Target-aware comparison using point-to-segment distance
 * Pure JS implementation, no Skia dependency
 * Testable with synthetic data
 */

import { getLetterTarget, scaleLetterToCanvas } from './letterTargets';
import {
  calculatePathLength,
  resamplePath,
  pointToPathDistance,
  flattenStrokes,
  calculateStrokesLength,
} from './strokeUtils';
import { TRACE_CONFIG } from './traceConfig';

/**
 * Prepare target geometry for evaluation
 * @param {string} targetLetter
 * @param {{width: number, height: number}} canvasSize
 * @param {object} config
 * @returns {{paths: Array, totalLength: number, samples: Array}}
 */
function prepareTarget(targetLetter, canvasSize, config) {
  // Get normalized target geometry
  const targetStrokes = getLetterTarget(targetLetter);

  // Scale to canvas
  const scaledStrokes = targetStrokes.map(stroke =>
    scaleLetterToCanvas(stroke, {
      width: canvasSize.width,
      height: canvasSize.height,
      padding: config.visual.canvasPadding,
    })
  );

  // Calculate total target length
  const totalLength = scaledStrokes.reduce((sum, stroke) => {
    return sum + calculatePathLength(stroke);
  }, 0);

  // Resample each target stroke uniformly
  const sampleSpacing = config.evaluation.sampleSpacing;
  const resampledStrokes = scaledStrokes.map(stroke =>
    resamplePath(stroke, sampleSpacing)
  );

  // Flatten to single array of sample points
  const samples = resampledStrokes.reduce((acc, stroke) => acc.concat(stroke), []);

  return {
    paths: scaledStrokes,
    totalLength,
    samples,
  };
}

/**
 * Prepare user strokes for evaluation
 * @param {Array<{points: Array}>} userStrokes
 * @param {object} config
 * @returns {{paths: Array, totalLength: number, samples: Array}}
 */
function prepareUserStrokes(userStrokes, config) {
  if (!userStrokes || userStrokes.length === 0) {
    return {
      paths: [],
      totalLength: 0,
      samples: [],
    };
  }

  // Extract point arrays
  const paths = userStrokes.map(stroke => stroke.points || []);

  // Calculate total length
  const totalLength = calculateStrokesLength(userStrokes);

  // Resample each user stroke uniformly
  const sampleSpacing = config.evaluation.sampleSpacing;
  const resampledStrokes = paths.map(stroke =>
    resamplePath(stroke, sampleSpacing)
  );

  // Flatten to single array of sample points
  const samples = resampledStrokes.reduce((acc, stroke) => acc.concat(stroke), []);

  return {
    paths,
    totalLength,
    samples,
  };
}

/**
 * Calculate coverage: fraction of target covered by user strokes
 * @param {Array} targetSamples - Sampled target points
 * @param {Array} userPaths - User stroke paths
 * @param {number} tolerance - Distance tolerance in pixels
 * @returns {number} Coverage ratio (0..1)
 */
function calculateCoverage(targetSamples, userPaths, tolerance) {
  if (targetSamples.length === 0) {
    return 0;
  }

  if (userPaths.length === 0 || userPaths.every(path => path.length === 0)) {
    return 0;
  }

  let coveredCount = 0;

  targetSamples.forEach(targetPoint => {
    // Check if this target point is within tolerance of any user path
    const minDistance = Math.min(
      ...userPaths.map(path => pointToPathDistance(targetPoint, path))
    );

    if (minDistance <= tolerance) {
      coveredCount++;
    }
  });

  return coveredCount / targetSamples.length;
}

/**
 * Calculate precision: fraction of user strokes near target
 * @param {Array} userSamples - Sampled user points
 * @param {Array} targetPaths - Target stroke paths
 * @param {number} tolerance - Distance tolerance in pixels
 * @returns {number} Precision ratio (0..1)
 */
function calculatePrecision(userSamples, targetPaths, tolerance) {
  if (userSamples.length === 0) {
    return 0;
  }

  if (targetPaths.length === 0) {
    return 0;
  }

  let nearTargetCount = 0;

  userSamples.forEach(userPoint => {
    // Check if this user point is within tolerance of any target path
    const minDistance = Math.min(
      ...targetPaths.map(path => pointToPathDistance(userPoint, path))
    );

    if (minDistance <= tolerance) {
      nearTargetCount++;
    }
  });

  return nearTargetCount / userSamples.length;
}

/**
 * Determine failure reason from metrics
 * @param {object} metrics
 * @param {object} config
 * @returns {string}
 */
function determineFailureReason(metrics, config) {
  const { coverage, precision, normalizedLength } = metrics;
  const { minCoverage, minPrecision, minNormalizedLength, minScore } = config.evaluation;

  if (normalizedLength < minNormalizedLength) {
    return 'too_short';
  }

  if (coverage < minCoverage) {
    return 'low_coverage';
  }

  if (precision < minPrecision) {
    return 'low_precision';
  }

  if (metrics.score < minScore) {
    return 'low_score';
  }

  return 'unknown';
}

/**
 * Evaluate trace against target letter
 * @param {object} params
 * @param {string} params.targetLetter - Expected letter
 * @param {Array<{points: Array}>} params.strokes - User strokes
 * @param {{width: number, height: number}} params.canvasSize
 * @param {object} params.config - Configuration object (optional, uses default)
 * @returns {object} Evaluation result
 */
export function evaluateTrace({ targetLetter, strokes, canvasSize, config = TRACE_CONFIG }) {
  // Handle empty input
  if (!strokes || strokes.length === 0) {
    return {
      target: targetLetter,
      coverage: 0,
      precision: 0,
      normalizedLength: 0,
      score: 0,
      success: false,
      reason: 'empty',
      targetSampleCount: 0,
      userSampleCount: 0,
    };
  }

  // Prepare geometry
  const target = prepareTarget(targetLetter, canvasSize, config);
  const user = prepareUserStrokes(strokes, config);

  // Early exit if user didn't draw enough
  if (user.totalLength < 1 || user.samples.length === 0) {
    return {
      target: targetLetter,
      coverage: 0,
      precision: 0,
      normalizedLength: 0,
      score: 0,
      success: false,
      reason: 'too_short',
      targetSampleCount: target.samples.length,
      userSampleCount: 0,
    };
  }

  // Calculate metrics
  const tolerance = config.evaluation.tolerancePixels;

  const coverage = calculateCoverage(target.samples, user.paths, tolerance);
  const precision = calculatePrecision(user.samples, target.paths, tolerance);
  const normalizedLength = target.totalLength > 0 ? user.totalLength / target.totalLength : 0;

  // Calculate combined score
  const score =
    config.evaluation.coverageWeight * coverage +
    config.evaluation.precisionWeight * precision;

  // Determine success
  const success =
    coverage >= config.evaluation.minCoverage &&
    precision >= config.evaluation.minPrecision &&
    normalizedLength >= config.evaluation.minNormalizedLength &&
    score >= config.evaluation.minScore;

  const reason = success ? 'passed' : determineFailureReason(
    { coverage, precision, normalizedLength, score },
    config
  );

  return {
    target: targetLetter,
    coverage,
    precision,
    normalizedLength,
    score,
    success,
    reason,
    targetSampleCount: target.samples.length,
    userSampleCount: user.samples.length,
    // Internal data for debugging
    _debug: __DEV__ ? {
      targetLength: target.totalLength,
      userLength: user.totalLength,
      tolerance,
    } : undefined,
  };
}

export default evaluateTrace;
