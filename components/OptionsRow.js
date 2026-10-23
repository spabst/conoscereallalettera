import React from 'react';
import { View, StyleSheet } from 'react-native';
import OptionButton from './OptionButton';

export function optionState(value, { wrongChoices, revealed, solved, answer }) {
  if ((revealed || solved) && value === answer) return revealed ? 'reveal' : 'correct';
  if (wrongChoices.includes(value)) return 'wrong';
  return 'idle';
}

// Fila di risposte numeriche (o testuali) con lo stato visivo di ciascuna
export default function OptionsRow({ options, onChoose, feedback, size, variant, renderOption }) {
  return (
    <View style={styles.row}>
      {options.map((value) => (
        <OptionButton
          key={String(value)}
          label={String(value)}
          size={size}
          variant={variant}
          state={optionState(value, feedback)}
          disabled={feedback.locked}
          onPress={() => onChoose(value)}
        >
          {renderOption?.(value)}
        </OptionButton>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 24,
  },
});
