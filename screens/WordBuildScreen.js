import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';

const WORDS = [
  { word: 'CANE', emoji: '🐕' },
  { word: 'GATTO', emoji: '🐱' },
  { word: 'MELA', emoji: '🍎' },
  { word: 'SOLE', emoji: '☀️' },
  { word: 'LUNA', emoji: '🌙' },
  { word: 'CASA', emoji: '🏠' },
  { word: 'FIORE', emoji: '🌸' },
  { word: 'MARE', emoji: '🌊' },
];

export default function WordBuildScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledLetters, setShuffledLetters] = useState([]);
  const [placedLetters, setPlacedLetters] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [feedbackColor, setFeedbackColor] = useState('#4A90E2');
  const [usedIndices, setUsedIndices] = useState([]);
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    setupWord();
  }, [currentIndex]);

  const setupWord = () => {
    const current = WORDS[currentIndex].word;
    const letters = current.split('');
    const shuffled = [...letters].sort(() => 0.5 - Math.random());
    setShuffledLetters(shuffled);
    setPlacedLetters([]);
    setUsedIndices([]);
    setFeedback('');
  };

  const addLetter = (letter, index) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newPlaced = [...placedLetters, letter];
    setPlacedLetters(newPlaced);
    setUsedIndices([...usedIndices, index]);

    // Controlla se la parola è completa
    if (newPlaced.length === WORDS[currentIndex].word.length) {
      checkWord(newPlaced.join(''));
    }
  };

  const checkWord = (builtWord) => {
    const correct = WORDS[currentIndex].word;

    if (builtWord === correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setFeedback(`Perfetto! Hai scritto ${correct}! 🌟`);
      setFeedbackColor('#50C878');

      // Animazione
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Prossima parola dopo 2 secondi
      setTimeout(() => {
        nextWord();
      }, 2000);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setFeedback('Ops! Riprova! 💡');
      setFeedbackColor('#E74C3C');
    }
  };

  const reset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setupWord();
  };

  const nextWord = () => {
    setCurrentIndex((prev) => (prev + 1) % WORDS.length);
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.goBack();
  };

  const current = WORDS[currentIndex];
  const wordLength = current.word.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Pulsante indietro */}
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Text style={styles.backButtonText}>← Menu</Text>
      </TouchableOpacity>

      {/* Istruzioni */}
      <Text style={styles.instructions}>Metti le lettere in ordine!</Text>

      {/* Emoji */}
      <Text style={styles.emoji}>{current.emoji}</Text>

      {/* Area per le lettere posizionate */}
      <Animated.View style={[styles.wordDisplay, { transform: [{ scale: scaleAnim }] }]}>
        {Array.from({ length: wordLength }).map((_, index) => (
          <View key={index} style={styles.letterSlot}>
            <Text style={styles.letterSlotText}>
              {placedLetters[index] || '_'}
            </Text>
          </View>
        ))}
      </Animated.View>

      {/* Pulsante reset */}
      <TouchableOpacity style={styles.resetButton} onPress={reset}>
        <Text style={styles.resetButtonText}>Ricomincia</Text>
      </TouchableOpacity>

      {/* Lettere disponibili */}
      <View style={styles.lettersContainer}>
        {shuffledLetters.map((letter, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.letterButton,
              usedIndices.includes(index) && styles.letterButtonDisabled
            ]}
            onPress={() => !usedIndices.includes(index) && addLetter(letter, index)}
            disabled={usedIndices.includes(index)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.letterButtonText,
              usedIndices.includes(index) && styles.letterButtonTextDisabled
            ]}>
              {letter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feedback */}
      {feedback ? (
        <View style={styles.feedbackContainer}>
          <Text style={[styles.feedbackText, { color: feedbackColor }]}>
            {feedback}
          </Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
  instructions: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 100,
    marginBottom: 30,
  },
  wordDisplay: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  letterSlot: {
    width: 60,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#4A90E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  letterSlotText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  resetButton: {
    backgroundColor: '#F39C12',
    padding: 12,
    borderRadius: 10,
    marginBottom: 30,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  lettersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'center',
    maxWidth: 600,
  },
  letterButton: {
    backgroundColor: '#50C878',
    width: 70,
    height: 70,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  letterButtonDisabled: {
    backgroundColor: '#BDC3C7',
    opacity: 0.5,
  },
  letterButtonText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  letterButtonTextDisabled: {
    color: '#95A5A6',
  },
  feedbackContainer: {
    position: 'absolute',
    bottom: 60,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  feedbackText: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
  },
});
