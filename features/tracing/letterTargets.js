/**
 * Letter target geometry for tracing
 *
 * All coordinates are normalized to 0..1 range.
 * Each letter is an array of strokes (paths).
 * Each stroke is an array of {x, y} points.
 *
 * These definitions serve as the single source of truth for:
 * 1. Visual letter guide rendering
 * 2. Trace evaluation geometry
 *
 * Curved letters contain enough sampled points for smooth rendering.
 */

// Helper to create circle/arc points
function createArcPoints(cx, cy, radius, startAngle, endAngle, numPoints = 20) {
  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / numPoints);
    points.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    });
  }
  return points;
}

// Helper to create ellipse points
function createEllipsePoints(cx, cy, rx, ry, numPoints = 30) {
  return createArcPoints(cx, cy, rx, 0, Math.PI * 2, numPoints).map(p => ({
    x: cx + (p.x - cx) * (rx / ry) / (rx / ry),
    y: cy + (p.y - cy) * (ry / rx) / (ry / rx)
  }));
}

const LETTER_TARGETS = {
  A: [
    // Left diagonal
    [
      { x: 0.3, y: 0.85 },
      { x: 0.35, y: 0.7 },
      { x: 0.4, y: 0.55 },
      { x: 0.45, y: 0.4 },
      { x: 0.5, y: 0.25 },
    ],
    // Right diagonal
    [
      { x: 0.5, y: 0.25 },
      { x: 0.55, y: 0.4 },
      { x: 0.6, y: 0.55 },
      { x: 0.65, y: 0.7 },
      { x: 0.7, y: 0.85 },
    ],
    // Crossbar
    [
      { x: 0.38, y: 0.6 },
      { x: 0.45, y: 0.6 },
      { x: 0.55, y: 0.6 },
      { x: 0.62, y: 0.6 },
    ],
  ],

  B: [
    // Vertical stem
    [
      { x: 0.3, y: 0.2 },
      { x: 0.3, y: 0.35 },
      { x: 0.3, y: 0.5 },
      { x: 0.3, y: 0.65 },
      { x: 0.3, y: 0.8 },
    ],
    // Top bump
    ...[[
      { x: 0.3, y: 0.2 },
      ...createArcPoints(0.5, 0.2, 0.2, Math.PI, 0, 15).slice(1),
      { x: 0.3, y: 0.5 },
    ]],
    // Bottom bump
    ...[[
      { x: 0.3, y: 0.5 },
      ...createArcPoints(0.52, 0.5, 0.22, Math.PI, 0, 15).slice(1),
      { x: 0.3, y: 0.8 },
    ]],
  ],

  C: [
    // Arc
    createArcPoints(0.5, 0.5, 0.28, Math.PI * 0.75, Math.PI * 2.25, 25),
  ],

  D: [
    // Vertical stem
    [
      { x: 0.3, y: 0.2 },
      { x: 0.3, y: 0.35 },
      { x: 0.3, y: 0.5 },
      { x: 0.3, y: 0.65 },
      { x: 0.3, y: 0.8 },
    ],
    // Curve
    ...[[
      { x: 0.3, y: 0.2 },
      ...createArcPoints(0.5, 0.5, 0.3, -Math.PI / 2, Math.PI / 2, 20).slice(1, -1),
      { x: 0.3, y: 0.8 },
    ]],
  ],

  E: [
    // Vertical stem
    [
      { x: 0.35, y: 0.2 },
      { x: 0.35, y: 0.35 },
      { x: 0.35, y: 0.5 },
      { x: 0.35, y: 0.65 },
      { x: 0.35, y: 0.8 },
    ],
    // Top bar
    [
      { x: 0.35, y: 0.2 },
      { x: 0.45, y: 0.2 },
      { x: 0.55, y: 0.2 },
      { x: 0.65, y: 0.2 },
    ],
    // Middle bar
    [
      { x: 0.35, y: 0.5 },
      { x: 0.45, y: 0.5 },
      { x: 0.55, y: 0.5 },
      { x: 0.62, y: 0.5 },
    ],
    // Bottom bar
    [
      { x: 0.35, y: 0.8 },
      { x: 0.45, y: 0.8 },
      { x: 0.55, y: 0.8 },
      { x: 0.65, y: 0.8 },
    ],
  ],

  F: [
    // Vertical stem
    [
      { x: 0.35, y: 0.2 },
      { x: 0.35, y: 0.35 },
      { x: 0.35, y: 0.5 },
      { x: 0.35, y: 0.65 },
      { x: 0.35, y: 0.8 },
    ],
    // Top bar
    [
      { x: 0.35, y: 0.2 },
      { x: 0.45, y: 0.2 },
      { x: 0.55, y: 0.2 },
      { x: 0.65, y: 0.2 },
    ],
    // Middle bar
    [
      { x: 0.35, y: 0.5 },
      { x: 0.45, y: 0.5 },
      { x: 0.55, y: 0.5 },
      { x: 0.62, y: 0.5 },
    ],
  ],

  G: [
    // Arc with horizontal bar
    [
      ...createArcPoints(0.5, 0.5, 0.28, Math.PI * 0.75, Math.PI * 2.25, 20),
      { x: 0.78, y: 0.5 },
      { x: 0.65, y: 0.5 },
      { x: 0.55, y: 0.5 },
    ],
  ],

  H: [
    // Left vertical
    [
      { x: 0.3, y: 0.2 },
      { x: 0.3, y: 0.35 },
      { x: 0.3, y: 0.5 },
      { x: 0.3, y: 0.65 },
      { x: 0.3, y: 0.8 },
    ],
    // Right vertical
    [
      { x: 0.7, y: 0.2 },
      { x: 0.7, y: 0.35 },
      { x: 0.7, y: 0.5 },
      { x: 0.7, y: 0.65 },
      { x: 0.7, y: 0.8 },
    ],
    // Crossbar
    [
      { x: 0.3, y: 0.5 },
      { x: 0.4, y: 0.5 },
      { x: 0.5, y: 0.5 },
      { x: 0.6, y: 0.5 },
      { x: 0.7, y: 0.5 },
    ],
  ],

  I: [
    // Vertical line
    [
      { x: 0.5, y: 0.2 },
      { x: 0.5, y: 0.35 },
      { x: 0.5, y: 0.5 },
      { x: 0.5, y: 0.65 },
      { x: 0.5, y: 0.8 },
    ],
  ],

  L: [
    // Vertical stem
    [
      { x: 0.35, y: 0.2 },
      { x: 0.35, y: 0.35 },
      { x: 0.35, y: 0.5 },
      { x: 0.35, y: 0.65 },
      { x: 0.35, y: 0.8 },
    ],
    // Bottom bar
    [
      { x: 0.35, y: 0.8 },
      { x: 0.45, y: 0.8 },
      { x: 0.55, y: 0.8 },
      { x: 0.65, y: 0.8 },
    ],
  ],

  M: [
    // Left vertical
    [
      { x: 0.25, y: 0.8 },
      { x: 0.25, y: 0.65 },
      { x: 0.25, y: 0.5 },
      { x: 0.25, y: 0.35 },
      { x: 0.25, y: 0.2 },
    ],
    // Left diagonal down
    [
      { x: 0.25, y: 0.2 },
      { x: 0.32, y: 0.35 },
      { x: 0.4, y: 0.5 },
      { x: 0.47, y: 0.65 },
      { x: 0.5, y: 0.7 },
    ],
    // Right diagonal up
    [
      { x: 0.5, y: 0.7 },
      { x: 0.53, y: 0.65 },
      { x: 0.6, y: 0.5 },
      { x: 0.68, y: 0.35 },
      { x: 0.75, y: 0.2 },
    ],
    // Right vertical
    [
      { x: 0.75, y: 0.2 },
      { x: 0.75, y: 0.35 },
      { x: 0.75, y: 0.5 },
      { x: 0.75, y: 0.65 },
      { x: 0.75, y: 0.8 },
    ],
  ],

  N: [
    // Left vertical
    [
      { x: 0.3, y: 0.8 },
      { x: 0.3, y: 0.65 },
      { x: 0.3, y: 0.5 },
      { x: 0.3, y: 0.35 },
      { x: 0.3, y: 0.2 },
    ],
    // Diagonal
    [
      { x: 0.3, y: 0.2 },
      { x: 0.4, y: 0.35 },
      { x: 0.5, y: 0.5 },
      { x: 0.6, y: 0.65 },
      { x: 0.7, y: 0.8 },
    ],
    // Right vertical
    [
      { x: 0.7, y: 0.8 },
      { x: 0.7, y: 0.65 },
      { x: 0.7, y: 0.5 },
      { x: 0.7, y: 0.35 },
      { x: 0.7, y: 0.2 },
    ],
  ],

  O: [
    createArcPoints(0.5, 0.5, 0.28, 0, Math.PI * 2, 30),
  ],

  P: [
    // Vertical stem
    [
      { x: 0.3, y: 0.2 },
      { x: 0.3, y: 0.35 },
      { x: 0.3, y: 0.5 },
      { x: 0.3, y: 0.65 },
      { x: 0.3, y: 0.8 },
    ],
    // Top loop
    ...[[
      { x: 0.3, y: 0.2 },
      ...createArcPoints(0.5, 0.2, 0.2, Math.PI, 0, 15).slice(1),
      { x: 0.7, y: 0.35 },
      { x: 0.65, y: 0.43 },
      { x: 0.55, y: 0.5 },
      { x: 0.4, y: 0.5 },
      { x: 0.3, y: 0.5 },
    ]],
  ],

  Q: [
    // Circle
    createArcPoints(0.5, 0.48, 0.28, 0, Math.PI * 2, 30),
    // Tail
    [
      { x: 0.62, y: 0.65 },
      { x: 0.68, y: 0.72 },
      { x: 0.73, y: 0.78 },
      { x: 0.78, y: 0.83 },
    ],
  ],

  R: [
    // Vertical stem
    [
      { x: 0.3, y: 0.2 },
      { x: 0.3, y: 0.35 },
      { x: 0.3, y: 0.5 },
      { x: 0.3, y: 0.65 },
      { x: 0.3, y: 0.8 },
    ],
    // Top loop
    ...[[
      { x: 0.3, y: 0.2 },
      ...createArcPoints(0.5, 0.2, 0.2, Math.PI, 0, 15).slice(1),
      { x: 0.7, y: 0.35 },
      { x: 0.65, y: 0.43 },
      { x: 0.55, y: 0.5 },
      { x: 0.4, y: 0.5 },
      { x: 0.3, y: 0.5 },
    ]],
    // Leg
    [
      { x: 0.5, y: 0.5 },
      { x: 0.57, y: 0.6 },
      { x: 0.63, y: 0.7 },
      { x: 0.7, y: 0.8 },
    ],
  ],

  S: [
    [
      // Top curve
      ...createArcPoints(0.5, 0.3, 0.18, Math.PI, 0, 12),
      // Middle transition
      { x: 0.65, y: 0.4 },
      { x: 0.55, y: 0.5 },
      { x: 0.45, y: 0.6 },
      { x: 0.35, y: 0.7 },
      // Bottom curve
      ...createArcPoints(0.5, 0.7, 0.18, Math.PI, Math.PI * 2, 12).slice(1),
    ],
  ],

  T: [
    // Top bar
    [
      { x: 0.25, y: 0.2 },
      { x: 0.35, y: 0.2 },
      { x: 0.5, y: 0.2 },
      { x: 0.65, y: 0.2 },
      { x: 0.75, y: 0.2 },
    ],
    // Vertical stem
    [
      { x: 0.5, y: 0.2 },
      { x: 0.5, y: 0.35 },
      { x: 0.5, y: 0.5 },
      { x: 0.5, y: 0.65 },
      { x: 0.5, y: 0.8 },
    ],
  ],

  U: [
    // Left side
    [
      { x: 0.3, y: 0.2 },
      { x: 0.3, y: 0.35 },
      { x: 0.3, y: 0.5 },
      { x: 0.3, y: 0.65 },
    ],
    // Bottom curve
    ...[[
      { x: 0.3, y: 0.65 },
      ...createArcPoints(0.5, 0.65, 0.2, Math.PI, 0, 15).slice(1, -1),
      { x: 0.7, y: 0.65 },
    ]],
    // Right side
    [
      { x: 0.7, y: 0.65 },
      { x: 0.7, y: 0.5 },
      { x: 0.7, y: 0.35 },
      { x: 0.7, y: 0.2 },
    ],
  ],

  V: [
    // Left diagonal
    [
      { x: 0.25, y: 0.2 },
      { x: 0.3, y: 0.35 },
      { x: 0.35, y: 0.5 },
      { x: 0.42, y: 0.65 },
      { x: 0.5, y: 0.8 },
    ],
    // Right diagonal
    [
      { x: 0.5, y: 0.8 },
      { x: 0.58, y: 0.65 },
      { x: 0.65, y: 0.5 },
      { x: 0.7, y: 0.35 },
      { x: 0.75, y: 0.2 },
    ],
  ],

  Z: [
    // Top bar
    [
      { x: 0.3, y: 0.2 },
      { x: 0.4, y: 0.2 },
      { x: 0.5, y: 0.2 },
      { x: 0.6, y: 0.2 },
      { x: 0.7, y: 0.2 },
    ],
    // Diagonal
    [
      { x: 0.7, y: 0.2 },
      { x: 0.6, y: 0.35 },
      { x: 0.5, y: 0.5 },
      { x: 0.4, y: 0.65 },
      { x: 0.3, y: 0.8 },
    ],
    // Bottom bar
    [
      { x: 0.3, y: 0.8 },
      { x: 0.4, y: 0.8 },
      { x: 0.5, y: 0.8 },
      { x: 0.6, y: 0.8 },
      { x: 0.7, y: 0.8 },
    ],
  ],
};

// Export supported letters (derived from target definitions)
export const SUPPORTED_LETTERS = Object.keys(LETTER_TARGETS).sort();

/**
 * Get the target geometry for a letter
 * @param {string} letter - Letter character (A-Z)
 * @returns {Array<Array<{x: number, y: number}>>} Array of strokes, each stroke is an array of points
 */
export function getLetterTarget(letter) {
  const target = LETTER_TARGETS[letter.toUpperCase()];
  if (!target) {
    throw new Error(`No target geometry defined for letter: ${letter}`);
  }
  return target;
}

/**
 * Scale normalized letter points to actual canvas bounds
 * @param {Array<{x: number, y: number}>} points - Normalized points (0..1)
 * @param {{width: number, height: number, padding: number}} bounds - Target canvas bounds
 * @returns {Array<{x: number, y: number}>} Scaled points
 */
export function scaleLetterToCanvas(points, bounds) {
  const { width, height, padding = 40 } = bounds;
  const availableWidth = width - padding * 2;
  const availableHeight = height - padding * 2;
  const centerX = width / 2;
  const centerY = height / 2;

  // Determine aspect-correct size
  const size = Math.min(availableWidth, availableHeight);

  return points.map(p => ({
    x: centerX + (p.x - 0.5) * size,
    y: centerY + (p.y - 0.5) * size,
  }));
}

export default LETTER_TARGETS;
