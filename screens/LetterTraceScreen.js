import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Svg, { Path, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'Z'];

export default function LetterTraceScreen({ navigation }) {
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [feedback, setFeedback] = useState('Traccia la lettera con il dito!');
  const [feedbackColor, setFeedbackColor] = useState('#4A90E2');
  const [dots, setDots] = useState([]);
  const pointCounter = useRef(0);

  const panGesture = Gesture.Pan()
    .onStart((event) => {
      const { x, y } = event;
      setCurrentPath(`M ${x} ${y}`);
      pointCounter.current = 0;
    })
    .onUpdate((event) => {
      const { x, y } = event;
      setCurrentPath((prev) => `${prev} L ${x} ${y}`);

      // Feedback aptico ogni 10 punti
      pointCounter.current++;
      if (pointCounter.current % 10 === 0) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Aggiungi un puntino colorato
        setDots((prev) => [...prev, { x, y, id: Date.now() + Math.random() }]);
      }
    })
    .onEnd(() => {
      if (pointCounter.current > 30) {
        // Ha tracciato abbastanza
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setFeedback(`Bravissima! Hai tracciato la ${LETTERS[currentLetterIndex]}! ⭐`);
        setFeedbackColor('#50C878');
        setPaths((prev) => [...prev, currentPath]);
      }
      setCurrentPath('');

      // Rimuovi i puntini dopo un po'
      setTimeout(() => setDots([]), 500);
    });

  const nextLetter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPaths([]);
    setDots([]);
    setCurrentPath('');
    setCurrentLetterIndex((prev) => (prev + 1) % LETTERS.length);
    setFeedback('Traccia la lettera con il dito!');
    setFeedbackColor('#4A90E2');
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.goBack();
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        {/* Pulsante indietro */}
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>← Menu</Text>
        </TouchableOpacity>

        {/* Pulsante prossima lettera */}
        <TouchableOpacity style={styles.nextButton} onPress={nextLetter}>
          <Text style={styles.nextButtonText}>Prossima →</Text>
        </TouchableOpacity>

        {/* Lettera grande in background */}
        <Text style={styles.letterBackground}>{LETTERS[currentLetterIndex]}</Text>

        {/* Canvas per disegnare */}
        <GestureDetector gesture={panGesture}>
          <View style={styles.canvas}>
            <Svg width={width} height={height} style={styles.svg}>
              {/* Disegna i path precedenti */}
              {paths.map((path, index) => (
                <Path
                  key={index}
                  d={path}
                  stroke="#4A90E2"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {/* Disegna il path corrente */}
              {currentPath && (
                <Path
                  d={currentPath}
                  stroke="#4A90E2"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Puntini colorati per feedback */}
              {dots.map((dot) => (
                <Circle
                  key={dot.id}
                  cx={dot.x}
                  cy={dot.y}
                  r="8"
                  fill="#F39C12"
                  opacity="0.6"
                />
              ))}
            </Svg>
          </View>
        </GestureDetector>

        {/* Feedback */}
        <View style={styles.feedbackContainer}>
          <Text style={[styles.feedbackText, { color: feedbackColor }]}>
            {feedback}
          </Text>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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
  letterBackground: {
    position: 'absolute',
    fontSize: 400,
    fontWeight: 'bold',
    color: '#E8E8E8',
    alignSelf: 'center',
    top: height / 2 - 250,
    zIndex: 0,
  },
  canvas: {
    flex: 1,
    zIndex: 1,
  },
  svg: {
    flex: 1,
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
});
