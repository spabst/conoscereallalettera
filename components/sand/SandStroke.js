/**
 * Sand stroke renderer with multi-layer effect
 * - Shadow layer (opacity-based, no blur for compatibility)
 * - Groove layer
 * - Rim layer
 * - Deterministic particles
 */

import React, { useMemo } from 'react';
import { Path, Group, Circle, Skia } from '@shopify/react-native-skia';
import { TRACE_CONFIG } from '../../features/tracing/traceConfig';
import {
  generateStrokeSeed,
  createSeededRandom,
  calculatePathLength,
} from '../../features/tracing/strokeUtils';

/**
 * Convert points array to Skia path
 */
function pointsToPath(points) {
  if (!points || points.length < 2) {
    return null;
  }

  const path = Skia.Path.Make();
  path.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    path.lineTo(points[i].x, points[i].y);
  }

  return path;
}

/**
 * Generate deterministic particles along stroke
 */
function generateParticles(points, strokeId, config) {
  if (!points || points.length < 2) {
    return [];
  }

  const seed = generateStrokeSeed(strokeId);
  const rng = createSeededRandom(seed);

  const pathLength = calculatePathLength(points);
  const numParticles = Math.min(
    Math.floor(pathLength * config.particleDensity),
    config.maxParticlesPerStroke
  );

  const particles = [];

  for (let i = 0; i < numParticles; i++) {
    // Random position along path
    const t = rng();
    const segmentLength = pathLength * t;

    // Find point at this distance along path
    let accumulated = 0;
    let point = points[0];
    let normal = { x: 0, y: 1 };

    for (let j = 1; j < points.length; j++) {
      const dx = points[j].x - points[j - 1].x;
      const dy = points[j].y - points[j - 1].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (accumulated + dist >= segmentLength) {
        const ratio = (segmentLength - accumulated) / dist;
        point = {
          x: points[j - 1].x + dx * ratio,
          y: points[j - 1].y + dy * ratio,
        };

        // Calculate normal (perpendicular)
        const length = Math.sqrt(dx * dx + dy * dy);
        normal = {
          x: -dy / length,
          y: dx / length,
        };
        break;
      }

      accumulated += dist;
    }

    // Offset particle to side of stroke
    const offsetDist = (rng() - 0.5) * config.rimWidth;
    const size = config.particleMinSize + rng() * (config.particleMaxSize - config.particleMinSize);

    particles.push({
      x: point.x + normal.x * offsetDist,
      y: point.y + normal.y * offsetDist,
      r: size,
      opacity: config.particleOpacity * (0.6 + rng() * 0.4),
    });
  }

  return particles;
}

export default function SandStroke({ stroke, config = TRACE_CONFIG.visual }) {
  const { points, id } = stroke;

  // Memoize path creation and particles
  const path = useMemo(() => pointsToPath(points), [points]);

  const particles = useMemo(
    () => generateParticles(points, id, config),
    [points, id, config]
  );

  if (!path) {
    return null;
  }

  const {
    sandShadowColor,
    sandDarkColor,
    sandLightColor,
    baseStrokeWidth,
    grooveWidth,
    rimWidth,
    shadowOffset,
  } = config;

  return (
    <Group>
      {/* Shadow layer - wider stroke with transparency (no blur for compatibility) */}
      <Path
        path={path}
        color={sandShadowColor}
        style="stroke"
        strokeWidth={baseStrokeWidth + shadowOffset * 2}
        strokeCap="round"
        strokeJoin="round"
        opacity={0.3}
      />

      {/* Groove layer - dark center */}
      <Path
        path={path}
        color={sandDarkColor}
        style="stroke"
        strokeWidth={grooveWidth}
        strokeCap="round"
        strokeJoin="round"
      />

      {/* Rim layer - light edges suggesting displaced sand */}
      <Path
        path={path}
        color={sandLightColor}
        style="stroke"
        strokeWidth={rimWidth}
        strokeCap="round"
        strokeJoin="round"
        opacity={0.4}
      />

      {/* Deterministic particles */}
      {particles.map((particle, idx) => (
        <Circle
          key={`${id}-particle-${idx}`}
          cx={particle.x}
          cy={particle.y}
          r={particle.r}
          color={sandLightColor}
          opacity={particle.opacity}
        />
      ))}
    </Group>
  );
}
