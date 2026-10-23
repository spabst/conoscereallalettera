import React from 'react';
import { View, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { NumberRod } from '../../components/Materials';
import { optionState } from '../../components/OptionsRow';
import { colors } from '../../theme';

export function rodUnit(width, max = 10) {
  return Math.min(60, Math.floor((width * 0.6) / max));
}

// Aste disposte una sotto l'altra, allineate a sinistra come quando si costruisce la "scala"
export function RodChoices({ options, onChoose, feedback, unit, height = 30 }) {
  return (
    <View style={styles.list}>
      {options.map((n) => {
        const state = optionState(n, feedback);
        return (
          <TouchableOpacity
            key={n}
            onPress={() => onChoose(n)}
            disabled={feedback.locked || state === 'wrong'}
            style={[styles.rodButton, state === 'wrong' && styles.wrong, state !== 'idle' && state !== 'wrong' && styles.correct]}
            activeOpacity={0.7}
          >
            <NumberRod n={n} unit={unit} height={height} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function NumberRods({ item, onChoose, feedback }) {
  const { width } = useWindowDimensions();
  return (
    <View style={styles.container}>
      <RodChoices options={item.options} onChoose={onChoose} feedback={feedback} unit={rodUnit(width)} height={36} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    alignItems: 'flex-start',
    gap: 10,
  },
  rodButton: {
    padding: 8,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: 'transparent',
  },
  wrong: {
    opacity: 0.3,
  },
  correct: {
    borderColor: colors.green,
    backgroundColor: '#E8F8EE',
  },
});
