/**
 * Configuration for trace evaluation and visual rendering
 * Centralized to avoid magic numbers scattered through components
 */

export const TRACE_CONFIG = {
  // Evaluation thresholds
  evaluation: {
    // Minimum fraction of target that must be covered by user strokes
    minCoverage: 0.58,

    // Minimum fraction of user strokes that must be near target
    minPrecision: 0.72,

    // Minimum normalized length (user length / target length)
    minNormalizedLength: 0.35,

    // Minimum combined score
    minScore: 0.66,

    // Score weights (should sum to 1.0)
    coverageWeight: 0.55,
    precisionWeight: 0.45,

    // Tolerance distance (in pixels at evaluation scale)
    // User stroke within this distance is considered "on target"
    tolerancePixels: 12,

    // Sampling: resample paths to uniform spacing for evaluation
    sampleSpacing: 8, // pixels at evaluation scale
  },

  // Visual rendering
  visual: {
    // Sand colors
    sandBaseColor: '#D4A574',
    sandDarkColor: '#8B6F47',
    sandLightColor: '#E8C9A0',
    sandShadowColor: 'rgba(101, 67, 33, 0.3)',

    // Stroke rendering
    baseStrokeWidth: 34,
    grooveWidth: 24,
    rimWidth: 38,
    shadowBlur: 8,
    shadowOffset: 2,

    // Letter guide
    guideOpacity: 0.15,
    guideStrokeWidth: 28,
    guideColor: '#8B6F47',

    // Particles
    maxParticlesPerStroke: 50,
    particleMinSize: 2,
    particleMaxSize: 6,
    particleOpacity: 0.4,
    particleDensity: 0.15, // particles per pixel of stroke length

    // Canvas
    canvasPadding: 40,
  },

  // Haptics
  haptics: {
    // Only on success, no haptics during drawing
    enableSuccessHaptic: true,
  },
};

export default TRACE_CONFIG;
