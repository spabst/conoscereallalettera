import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import * as Haptics from 'expo-haptics';
import SandTraceCanvas from '../components/sand/SandTraceCanvas';
import { SUPPORTED_LETTERS } from '../features/tracing/letterTargets';
import { evaluateTrace } from '../features/tracing/traceEvaluator';
import { TRACE_CONFIG } from '../features/tracing/traceConfig';

const { width, height } = Dimensions.get('window');

// State machine: idle -> drawing -> (success | drawing)
const STATE = {
  IDLE: 'idle',
  DRAWING: 'drawing',
  SUCCESS: 'success',
};

export default function LetterTraceScreen({ navigation }) {
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [state, setState] = useState(STATE.IDLE);
  const [strokes, setStrokes] = useState([]);
  const [feedback, setFeedback] = useState('Traccia la lettera con il dito!');
  const [feedbackColor, setFeedbackColor] = useState('#4A90E2');
  const [resetToken, setResetToken] = useState(0);

  // Dev mode metrics (only shown in __DEV__)
  const [devMetrics, setDevMetrics] = useState(null);

  const currentLetter = SUPPORTED_LETTERS[currentLetterIndex];

  // Handle stroke completion from canvas
  const handleStrokeComplete = useCallback((stroke) => {
    // Use functional update to avoid stale closure
    setStrokes(prevStrokes => {
      const newStrokes = [...prevStrokes, stroke];

      // Evaluate immediately after each stroke
      const result = evaluateTrace({
        targetLetter: currentLetter,
        strokes: newStrokes,
        canvasSize: { width, height },
        config: TRACE_CONFIG,
      });

      // Store metrics for dev mode
      if (__DEV__) {
        setDevMetrics(result);
      }

      if (result.success) {
        // Success! Transition to success state
        setState(STATE.SUCCESS);
        setFeedback(`Bravissima! Hai tracciato la ${currentLetter}! ⭐`);
        setFeedbackColor('#50C878');

        // Success haptic only
        if (TRACE_CONFIG.haptics.enableSuccessHaptic) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        // Not yet successful - stay in drawing state, no negative feedback
        // Child can continue adding strokes
        setState(STATE.DRAWING);
      }

      return newStrokes;
    });
  }, [currentLetter]);

  // Reset current attempt
  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStrokes([]);
    setState(STATE.IDLE);
    setFeedback('Traccia la lettera con il dito!');
    setFeedbackColor('#4A90E2');
    setResetToken(prev => prev + 1);
    if (__DEV__) {
      setDevMetrics(null);
    }
  };

  // Move to next letter
  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStrokes([]);
    setState(STATE.IDLE);
    setCurrentLetterIndex((prev) => (prev + 1) % SUPPORTED_LETTERS.length);
    setFeedback('Traccia la lettera con il dito!');
    setFeedbackColor('#4A90E2');
    setResetToken(prev => prev + 1);
    if (__DEV__) {
      setDevMetrics(null);
    }
  };

  // Go back to menu
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>← Menu</Text>
      </TouchableOpacity>

      {/* Reset button */}
      <TouchableOpacity
        style={[styles.resetButton, strokes.length === 0 && styles.buttonDisabled]}
        onPress={handleReset}
        disabled={strokes.length === 0}
      >
        <Text style={styles.resetButtonText}>Ricomincia</Text>
      </TouchableOpacity>

      {/* Next button - enabled after success */}
      <TouchableOpacity
        style={[styles.nextButton, state !== STATE.SUCCESS && styles.buttonDisabled]}
        onPress={handleNext}
        disabled={state !== STATE.SUCCESS}
      >
        <Text style={styles.nextButtonText}>Prossima →</Text>
      </TouchableOpacity>

      {/* Sand canvas */}
      <View style={styles.canvasContainer}>
        <SandTraceCanvas
          targetLetter={currentLetter}
          disabled={state === STATE.SUCCESS}
          onStrokeComplete={handleStrokeComplete}
          resetToken={resetToken}
          width={width}
          height={height}
        />
      </View>

      {/* Feedback */}
      <View style={styles.feedbackContainer}>
        <Text style={[styles.feedbackText, { color: feedbackColor }]}>
          {feedback}
        </Text>
      </View>

      {/* Dev diagnostics - only in __DEV__ */}
      {__DEV__ && devMetrics && (
        <View style={styles.devContainer}>
          <Text style={styles.devText}>
            Coverage: {(devMetrics.coverage * 100).toFixed(1)}% |
            Precision: {(devMetrics.precision * 100).toFixed(1)}% |
            Score: {(devMetrics.score * 100).toFixed(1)}%
          </Text>
          <Text style={styles.devText}>
            Length: {(devMetrics.normalizedLength * 100).toFixed(1)}% |
            Samples: {devMetrics.userSampleCount}/{devMetrics.targetSampleCount}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  canvasContainer: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 30,
    backgroundColor: '#E74C3C',
    padding: 15,
    borderRadius: 12,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  resetButton: {
    position: 'absolute',
    top: 60,
    right: 180,
    backgroundColor: '#F39C12',
    padding: 15,
    borderRadius: 12,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  nextButton: {
    position: 'absolute',
    top: 60,
    right: 30,
    backgroundColor: '#50C878',
    padding: 15,
    borderRadius: 12,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  feedbackContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  feedbackText: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  devContainer: {
    position: 'absolute',
    top: 140,
    left: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 8,
    zIndex: 10,
  },
  devText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
