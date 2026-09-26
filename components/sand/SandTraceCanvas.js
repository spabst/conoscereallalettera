/**
 * Sand tracing canvas with Skia rendering and gesture handling
 * Updates every 3 points to balance responsiveness and performance
 */

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Group, Path, Skia } from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import SandBackground from './SandBackground';
import SandStroke from './SandStroke';
import { getLetterTarget, scaleLetterToCanvas } from '../../features/tracing/letterTargets';
import { TRACE_CONFIG } from '../../features/tracing/traceConfig';

/**
 * Convert points array to Skia path (imperative API)
 */
function pointsToSkiaPath(points) {
  if (!points || points.length === 0) {
    return null;
  }

  const path = Skia.Path.Make();
  path.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    path.lineTo(points[i].x, points[i].y);
  }

  return path;
}

export default function SandTraceCanvas({
  targetLetter,
  disabled = false,
  onStrokeComplete,
  resetToken,
  width,
  height,
}) {
  const [completedStrokes, setCompletedStrokes] = useState([]);
  const [liveStrokePoints, setLiveStrokePoints] = useState([]);

  // Refs for accumulating touch points
  const currentStrokePointsRef = useRef([]);
  const strokeIdCounter = useRef(0);
  const isDrawingRef = useRef(false);

  // Reset when resetToken changes
  React.useEffect(() => {
    setCompletedStrokes([]);
    setLiveStrokePoints([]);
    currentStrokePointsRef.current = [];
    strokeIdCounter.current = 0;
    isDrawingRef.current = false;
  }, [resetToken]);

  // Handle stroke completion
  const handleStrokeEnd = useCallback(() => {
    const points = currentStrokePointsRef.current;

    if (points.length >= 2) {
      const stroke = {
        id: `stroke-${Date.now()}-${strokeIdCounter.current++}`,
        points: [...points],
      };

      // Add to completed strokes
      setCompletedStrokes(prev => [...prev, stroke]);

      // Notify parent
      if (onStrokeComplete) {
        onStrokeComplete(stroke);
      }
    }

    // Clear live stroke
    currentStrokePointsRef.current = [];
    isDrawingRef.current = false;
    setLiveStrokePoints([]);
  }, [onStrokeComplete]);

  // Gesture handling
  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .onStart((event) => {
      const point = { x: event.x, y: event.y, t: Date.now() };
      currentStrokePointsRef.current = [point];
      isDrawingRef.current = true;
      setLiveStrokePoints([point]);
    })
    .onUpdate((event) => {
      if (!isDrawingRef.current) return;

      const point = { x: event.x, y: event.y, t: Date.now() };
      currentStrokePointsRef.current.push(point);

      // Update visual every 3 points to reduce re-renders
      if (currentStrokePointsRef.current.length % 3 === 0) {
        setLiveStrokePoints([...currentStrokePointsRef.current]);
      }
    })
    .onEnd(() => {
      handleStrokeEnd();
    })
    .onFinalize(() => {
      if (isDrawingRef.current) {
        handleStrokeEnd();
      }
    });

  // Memoize target letter paths
  const targetPaths = useMemo(() => {
    const targetStrokes = getLetterTarget(targetLetter);
    const scaledStrokes = targetStrokes.map(stroke =>
      scaleLetterToCanvas(stroke, {
        width,
        height,
        padding: TRACE_CONFIG.visual.canvasPadding,
      })
    );

    return scaledStrokes.map(stroke => pointsToSkiaPath(stroke));
  }, [targetLetter, width, height]);

  // Create live stroke path
  const liveStrokePath = useMemo(() => {
    if (liveStrokePoints.length < 2) {
      return null;
    }
    return pointsToSkiaPath(liveStrokePoints);
  }, [liveStrokePoints]);

  return (
    <GestureDetector gesture={panGesture}>
      <Canvas style={[styles.canvas, { width, height }]}>
        {/* Background */}
        <SandBackground width={width} height={height} />

        {/* Letter guide */}
        <Group>
          {targetPaths.map((path, idx) => (
            <Path
              key={`guide-${idx}`}
              path={path}
              color={TRACE_CONFIG.visual.guideColor}
              style="stroke"
              strokeWidth={TRACE_CONFIG.visual.guideStrokeWidth}
              strokeCap="round"
              strokeJoin="round"
              opacity={TRACE_CONFIG.visual.guideOpacity}
            />
          ))}
        </Group>

        {/* Completed strokes */}
        {completedStrokes.map((stroke) => (
          <SandStroke key={stroke.id} stroke={stroke} config={TRACE_CONFIG.visual} />
        ))}

        {/* Live stroke - simple rendering without particles */}
        {liveStrokePath && (
          <Path
            path={liveStrokePath}
            color={TRACE_CONFIG.visual.sandDarkColor}
            style="stroke"
            strokeWidth={TRACE_CONFIG.visual.grooveWidth}
            strokeCap="round"
            strokeJoin="round"
          />
        )}
      </Canvas>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
});
