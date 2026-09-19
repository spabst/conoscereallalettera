import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';

const PAIRS = [
  { letter: 'A', word: 'APE', emoji: '🐝' },
  { letter: 'B', word: 'BARCA', emoji: '⛵' },
  { letter: 'C', word: 'CASA', emoji: '🏠' },
  { letter: 'D', word: 'DADO', emoji: '🎲' },
  { letter: 'E', word: 'ELEFANTE', emoji: '🐘' },
  { letter: 'F', word: 'FIORE', emoji: '🌸' },
  { letter: 'G', word: 'GATTO', emoji: '🐱' },
  { letter: 'L', word: 'LUNA', emoji: '🌙' },
  { letter: 'M', word: 'MELA', emoji: '🍎' },
  { letter: 'P', word: 'PALLA', emoji: '⚽' },
  { letter: 'S', word: 'SOLE', emoji: '☀️' },
  { letter: 'T', word: 'TORRE', emoji: '🗼' },
];

export default function ImageMatchScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [feedbackColor, setFeedbackColor] = useState('#4A90E2');
  const [score, setScore] = useState(0);
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    generateOptions();
  }, [currentIndex]);

  const generateOptions = () => {
    const correct = PAIRS[currentIndex].letter;
    const allLetters = PAIRS.map(p => p.letter);
    const wrongOptions = allLetters.filter(l => l !== correct);

    // Prendi 2 lettere sbagliate random
    const shuffled = wrongOptions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 2);

    // Mescola le opzioni
    const opts = [correct, ...selected].sort(() => 0.5 - Math.random());
    setOptions(opts);
    setFeedback('');
  };

  const checkAnswer = (chosen) => {
    const correct = PAIRS[currentIndex].letter;

    if (chosen === correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setFeedback(`Bravissima! ${correct} come ${PAIRS[currentIndex].word}! ⭐`);
      setFeedbackColor('#50C878');
      setScore(score + 1);

      // Animazione
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Prossima domanda dopo 1.5 secondi
      setTimeout(() => {
        nextQuestion();
      }, 1500);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setFeedback('Riprova! 💭');
      setFeedbackColor('#E74C3C');
    }
  };

  const nextQuestion = () => {
    setCurrentIndex((prev) => (prev + 1) % PAIRS.length);
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.goBack();
  };

  const current = PAIRS[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Pulsante indietro */}
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Text style={styles.backButtonText}>← Menu</Text>
      </TouchableOpacity>

      {/* Score */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>Punti: {score}</Text>
      </View>

      {/* Istruzioni */}
      <Text style={styles.instructions}>Con quale lettera inizia?</Text>

      {/* Parola/Emoji */}
      <Animated.View style={[styles.wordContainer, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.emoji}>{current.emoji}</Text>
        <Text style={styles.word}>{current.word}</Text>
      </Animated.View>

      {/* Opzioni */}
      <View style={styles.optionsContainer}>
        {options.map((letter, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            onPress={() => checkAnswer(letter)}
            activeOpacity={0.7}
          >
            <Text style={styles.optionText}>{letter}</Text>
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
  scoreContainer: {
    position: 'absolute',
    top: 60,
    right: 30,
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 12,
    zIndex: 10,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  instructions: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 30,
  },
  wordContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  emoji: {
    fontSize: 120,
    marginBottom: 10,
  },
  word: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 25,
  },
  optionButton: {
    backgroundColor: '#4A90E2',
    width: 100,
    height: 100,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  optionText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
