import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';

const WORDS = [
  // Animali
  { word: 'CANE', emoji: '🐕' },
  { word: 'GATTO', emoji: '🐱' },
  { word: 'LEONE', emoji: '🦁' },
  { word: 'TIGRE', emoji: '🐯' },
  { word: 'ORSO', emoji: '🐻' },
  { word: 'LUPO', emoji: '🐺' },
  { word: 'PESCE', emoji: '🐟' },
  { word: 'RANA', emoji: '🐸' },
  { word: 'UCCELLO', emoji: '🐦' },
  // { word: 'FARFALLA', emoji: '🦋' },
  { word: 'APE', emoji: '🐝' },
  //  { word: 'ELEFANTE', emoji: '🐘' },
  { word: 'MUCCA', emoji: '🐄' },
  { word: 'CAVALLO', emoji: '🐴' },
  { word: 'CONIGLIO', emoji: '🐰' },
  { word: 'TOPO', emoji: '🐭' },
  { word: 'PANDA', emoji: '🐼' },
  // { word: 'KOALA', emoji: '🐨' },

  // Frutti
  { word: 'MELA', emoji: '🍎' },
  { word: 'PERA', emoji: '🍐' },
  { word: 'BANANA', emoji: '🍌' },
  { word: 'UVA', emoji: '🍇' },
  { word: 'ARANCIA', emoji: '🍊' },
  { word: 'LIMONE', emoji: '🍋' },
  { word: 'CILIEGIA', emoji: '🍒' },
  { word: 'FRAGOLA', emoji: '🍓' },
  { word: 'ANGURIA', emoji: '🍉' },
  { word: 'ANANAS', emoji: '🍍' },
  { word: 'PESCA', emoji: '🍑' },

  // Natura
  { word: 'SOLE', emoji: '☀️' },
  { word: 'LUNA', emoji: '🌙' },
  { word: 'STELLA', emoji: '⭐' },
  { word: 'NUVOLA', emoji: '☁️' },
  { word: 'PIOGGIA', emoji: '🌧️' },
  { word: 'NEVE', emoji: '❄️' },
  { word: 'ARCOBALENO', emoji: '🌈' },
  { word: 'FIORE', emoji: '🌸' },
  { word: 'ROSA', emoji: '🌹' },
  { word: 'ALBERO', emoji: '🌳' },
  { word: 'FOGLIA', emoji: '🍂' },
  { word: 'MARE', emoji: '🌊' },
  // { word: 'MONTAGNA', emoji: '⛰️' },
  { word: 'FUOCO', emoji: '🔥' },

  // Oggetti e luoghi
  { word: 'CASA', emoji: '🏠' },
  // { word: 'SCUOLA', emoji: '🏫' },
  { word: 'AUTO', emoji: '🚗' },
  { word: 'TRENO', emoji: '🚂' },
  { word: 'AEREO', emoji: '✈️' },
  { word: 'NAVE', emoji: '🚢' },
  { word: 'BICI', emoji: '🚲' },
  { word: 'PALLA', emoji: '⚽' },
  { word: 'LIBRO', emoji: '📚' },
  { word: 'MATITA', emoji: '✏️' },
  // { word: 'FORBICI', emoji: '✂️' },
  { word: 'CUORE', emoji: '❤️' },
  { word: 'REGALO', emoji: '🎁' },
  { word: 'TORTA', emoji: '🎂' },
  { word: 'PIZZA', emoji: '🍕' },
  { word: 'GELATO', emoji: '🍦' },
  { word: 'PANE', emoji: '🍞' },
  { word: 'LATTE', emoji: '🥛' },

  // Emozioni e azioni
  { word: 'GIOIA', emoji: '😊' },
  { word: 'AMORE', emoji: '💕' },
  { word: 'SOGNO', emoji: '💭' },
  { word: 'MUSICA', emoji: '🎵' },
  { word: 'FESTA', emoji: '🎉' },
  { word: 'BACIO', emoji: '💋' },

  // Colori
  { word: 'ROSSO', emoji: '🔴' },
  { word: 'BLU', emoji: '🔵' },
  { word: 'VERDE', emoji: '🟢' },
  { word: 'GIALLO', emoji: '🟡' },
];

export default function WordBuildScreen({ navigation }) {
  const [shuffledWords, setShuffledWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledLetters, setShuffledLetters] = useState([]);
  const [placedLetters, setPlacedLetters] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [feedbackColor, setFeedbackColor] = useState('#4A90E2');
  const [usedIndices, setUsedIndices] = useState([]);
  const scaleAnim = new Animated.Value(1);

  // Mescola le parole all'inizio
  useEffect(() => {
    const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
  }, []);

  useEffect(() => {
    if (shuffledWords.length > 0) {
      setupWord();
    }
  }, [currentIndex, shuffledWords]);

  const setupWord = () => {
    if (shuffledWords.length === 0) return;
    const current = shuffledWords[currentIndex].word;
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
    if (newPlaced.length === shuffledWords[currentIndex].word.length) {
      checkWord(newPlaced.join(''));
    }
  };

  const checkWord = (builtWord) => {
    const correct = shuffledWords[currentIndex].word;

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
    setCurrentIndex((prev) => (prev + 1) % shuffledWords.length);
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.goBack();
  };

  // Proteggi da accesso a array vuoto
  if (shuffledWords.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Caricamento...</Text>
      </SafeAreaView>
    );
  }

  const current = shuffledWords[currentIndex];
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
