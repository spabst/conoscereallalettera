/**
 * Sand background with texture
 * Rendered once for performance
 */

import React from 'react';
import { Canvas, Rect, LinearGradient, vec, Turbulence, Blend } from '@shopify/react-native-skia';
import { TRACE_CONFIG } from '../../features/tracing/traceConfig';

export default function SandBackground({ width, height }) {
  const { sandBaseColor, sandLightColor, sandDarkColor } = TRACE_CONFIG.visual;

  return (
    <>
      {/* Base gradient */}
      <Rect x={0} y={0} width={width} height={height}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width, height)}
          colors={[sandLightColor, sandBaseColor, sandDarkColor]}
          positions={[0, 0.5, 1]}
        />
      </Rect>

      {/* Subtle noise texture for grain */}
      <Rect x={0} y={0} width={width} height={height}>
        <Turbulence
          freqX={0.02}
          freqY={0.02}
          octaves={4}
          seed={42} // Deterministic
        />
        <Blend mode="overlay" opacity={0.15} />
      </Rect>
    </>
  );
}
