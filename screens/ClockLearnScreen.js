import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView, PanResponder } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const CLOCK_RADIUS = Math.min(width, height) * 0.3;
const CENTER_X = width / 2;
const CENTER_Y = height / 2;

// Esercizi progressivi Montessori
const LEVELS = [
  // Livello 1: Solo ore intere
  { type: 'ore', exercises: [
    { hour: 3, minute: 0, text: 'Imposta le 3:00' },
    { hour: 6, minute: 0, text: 'Imposta le 6:00' },
    { hour: 9, minute: 0, text: 'Imposta le 9:00' },
    { hour: 12, minute: 0, text: 'Imposta le 12:00' },
  ]},
  // Livello 2: Mezz'ore
  { type: 'mezze', exercises: [
    { hour: 3, minute: 30, text: 'Imposta le 3:30' },
    { hour: 6, minute: 30, text: 'Imposta le 6:30' },
    { hour: 9, minute: 30, text: 'Imposta le 9:30' },
  ]},
  // Livello 3: Quarti d'ora
  { type: 'quarti', exercises: [
    { hour: 3, minute: 15, text: 'Imposta le 3:15' },
    { hour: 6, minute: 45, text: 'Imposta le 6:45' },
    { hour: 9, minute: 15, text: 'Imposta le 9:15' },
  ]},
  // Livello 4: Minuti vari
  { type: 'minuti', exercises: [
    { hour: 2, minute: 20, text: 'Imposta le 2:20' },
    { hour: 5, minute: 40, text: 'Imposta le 5:40' },
    { hour: 8, minute: 10, text: 'Imposta le 8:10' },
  ]},
];

export default function ClockLearnScreen({ navigation }) {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [hourAngle, setHourAngle] = useState(0);
  const [minuteAngle, setMinuteAngle] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [feedbackColor, setFeedbackColor] = useState('#4A90E2');
  const [score, setScore] = useState(0);

  const exercise = LEVELS[currentLevel].exercises[currentExercise];

  // Calcola angolo dalla posizione del tocco
  const calculateAngle = (x, y) => {
    const dx = x - CENTER_X;
    const dy = y - CENTER_Y;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    angle = (angle + 90 + 360) % 360; // Normalizza per iniziare da 12
    return angle;
  };

  // PanResponder per la lancetta delle ore
  const hourPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false, // Non permettere interruzioni
      onShouldBlockNativeResponder: () => true, // Blocca altri responder nativi
      onPanResponderGrant: () => {
        // Gesto iniziato
      },
      onPanResponderMove: (evt, gestureState) => {
        const angle = calculateAngle(gestureState.moveX, gestureState.moveY);
        setHourAngle(angle);
        Haptics.selectionAsync();
      },
      onPanResponderRelease: () => {
        // Gesto terminato
      },
    })
  ).current;

  // PanResponder per la lancetta dei minuti
  const minutePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false, // Non permettere interruzioni
      onShouldBlockNativeResponder: () => true, // Blocca altri responder nativi
      onPanResponderGrant: () => {
        // Gesto iniziato
      },
      onPanResponderMove: (evt, gestureState) => {
        const angle = calculateAngle(gestureState.moveX, gestureState.moveY);
        setMinuteAngle(angle);
        Haptics.selectionAsync();
      },
      onPanResponderRelease: () => {
        // Gesto terminato
      },
    })
  ).current;

  // Verifica se l'ora impostata è corretta
  const checkTime = () => {
    const expectedHourAngle = ((exercise.hour % 12) * 30 + exercise.minute * 0.5) % 360;
    const expectedMinuteAngle = (exercise.minute * 6) % 360;

    // Tolleranza di 15 gradi (più permissivo per i bambini)
    const hourDiff = Math.abs(hourAngle - expectedHourAngle);
    const minuteDiff = Math.abs(minuteAngle - expectedMinuteAngle);

    const hourCorrect = hourDiff < 15 || hourDiff > 345;
    const minuteCorrect = minuteDiff < 15 || minuteDiff > 345;

    if (hourCorrect && minuteCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setFeedback('Bravissimo! Ora corretta! ⭐');
      setFeedbackColor('#50C878');
      setScore(score + 1);

      // Passa al prossimo esercizio dopo 1.5 secondi
      setTimeout(() => {
        nextExercise();
      }, 1500);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      if (!hourCorrect && !minuteCorrect) {
        setFeedback('Riprova! Controlla sia le ore che i minuti');
      } else if (!hourCorrect) {
        setFeedback('Quasi! Controlla la lancetta delle ore');
      } else {
        setFeedback('Quasi! Controlla la lancetta dei minuti');
      }
      setFeedbackColor('#E74C3C');
    }
  };

  const nextExercise = () => {
    if (currentExercise < LEVELS[currentLevel].exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setFeedback('');
      resetClock();
    } else if (currentLevel < LEVELS.length - 1) {
      // Passa al livello successivo
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCurrentLevel(currentLevel + 1);
      setCurrentExercise(0);
      setFeedback('Livello completato! Prossimo livello! 🎉');
      setFeedbackColor('#F39C12');
      setTimeout(() => {
        setFeedback('');
        resetClock();
      }, 2000);
    } else {
      // Tutti i livelli completati!
      setFeedback('Complimenti! Hai completato tutti gli esercizi! 🏆');
      setFeedbackColor('#FFD700');
    }
  };

  const resetClock = () => {
    setHourAngle(0);
    setMinuteAngle(0);
  };

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.goBack();
  };

  // Converti angolo in coordinate per le lancette
  const getHandPosition = (angle, length) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: CENTER_X + length * Math.cos(rad),
      y: CENTER_Y + length * Math.sin(rad),
    };
  };

  const hourHandPos = getHandPosition(hourAngle, CLOCK_RADIUS * 0.5);
  const minuteHandPos = getHandPosition(minuteAngle, CLOCK_RADIUS * 0.7);

  return (
    <SafeAreaView style={styles.container}>
      {/* Pulsante indietro */}
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Text style={styles.backButtonText}>← Menu</Text>
      </TouchableOpacity>

      {/* Livello e punteggio */}
      <View style={styles.headerContainer}>
        <Text style={styles.levelText}>
          Livello {currentLevel + 1}: {LEVELS[currentLevel].type}
        </Text>
        <Text style={styles.scoreText}>Punteggio: {score}</Text>
      </View>

      {/* Istruzioni */}
      <Text style={styles.instructionText}>{exercise.text}</Text>

      {/* Orologio SVG */}
      <View style={styles.clockContainer}>
        <Svg width={width} height={height * 0.7}>
          {/* Cerchio esterno orologio */}
          <Circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={CLOCK_RADIUS}
            fill="#FFFFFF"
            stroke="#2C3E50"
            strokeWidth="4"
          />

          {/* Numeri dell'orologio */}
          {[...Array(12)].map((_, i) => {
            const hour = i === 0 ? 12 : i;
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x = CENTER_X + CLOCK_RADIUS * 0.8 * Math.cos(angle);
            const y = CENTER_Y + CLOCK_RADIUS * 0.8 * Math.sin(angle);
            return (
              <SvgText
                key={i}
                x={x}
                y={y}
                fontSize="24"
                fontWeight="bold"
                fill="#2C3E50"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {hour}
              </SvgText>
            );
          })}

          {/* Tacche dei minuti */}
          {[...Array(60)].map((_, i) => {
            const angle = (i * 6 - 90) * (Math.PI / 180);
            const isHour = i % 5 === 0;
            const startRadius = isHour ? CLOCK_RADIUS * 0.9 : CLOCK_RADIUS * 0.95;
            const endRadius = CLOCK_RADIUS;
            return (
              <Line
                key={`tick-${i}`}
                x1={CENTER_X + startRadius * Math.cos(angle)}
                y1={CENTER_Y + startRadius * Math.sin(angle)}
                x2={CENTER_X + endRadius * Math.cos(angle)}
                y2={CENTER_Y + endRadius * Math.sin(angle)}
                stroke="#BDC3C7"
                strokeWidth={isHour ? '2' : '1'}
              />
            );
          })}

          {/* Lancetta delle ore (più corta e spessa) */}
          <G {...hourPanResponder.panHandlers}>
            <Line
              x1={CENTER_X}
              y1={CENTER_Y}
              x2={hourHandPos.x}
              y2={hourHandPos.y}
              stroke="#2C3E50"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <Circle cx={hourHandPos.x} cy={hourHandPos.y} r="15" fill="#2C3E50" opacity="0.3" />
          </G>

          {/* Lancetta dei minuti (più lunga e sottile) */}
          <G {...minutePanResponder.panHandlers}>
            <Line
              x1={CENTER_X}
              y1={CENTER_Y}
              x2={minuteHandPos.x}
              y2={minuteHandPos.y}
              stroke="#E74C3C"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <Circle cx={minuteHandPos.x} cy={minuteHandPos.y} r="15" fill="#E74C3C" opacity="0.3" />
          </G>

          {/* Centro orologio */}
          <Circle cx={CENTER_X} cy={CENTER_Y} r="10" fill="#2C3E50" />
        </Svg>
      </View>

      {/* Pulsante verifica */}
      <TouchableOpacity style={styles.checkButton} onPress={checkTime}>
        <Text style={styles.checkButtonText}>✓ Verifica</Text>
      </TouchableOpacity>

      {/* Feedback */}
      {feedback !== '' && (
        <View style={styles.feedbackContainer}>
          <Text style={[styles.feedbackText, { color: feedbackColor }]}>
            {feedback}
          </Text>
        </View>
      )}

      {/* Legenda */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#2C3E50' }]} />
          <Text style={styles.legendText}>Ore</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#E74C3C' }]} />
          <Text style={styles.legendText}>Minuti</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 50,
    marginBottom: 10,
  },
  levelText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2C3E50',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#F39C12',
  },
  instructionText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 20,
    textAlign: 'center',
  },
  clockContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButton: {
    backgroundColor: '#50C878',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 15,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
  },
  feedbackContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendColor: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  legendText: {
    fontSize: 18,
    color: '#2C3E50',
    fontWeight: '500',
  },
});
