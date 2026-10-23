import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import OptionsRow from '../../components/OptionsRow';
import { Counters } from '../../components/Materials';
import { DigitTile } from './QuantityMatch';
import { colors } from '../../theme';

const LABELS = { pari: '👫 Pari', dispari: '🧍 Dispari' };

// Cifre e gettoni: i gettoni a coppie mostrano se ne avanza uno da solo
export default function OddEven({ item, onChoose, feedback, showMaterial }) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <DigitTile value={item.n} size={110} />
        {(item.withMaterial || showMaterial) && <Counters n={item.n} size={46} layout="pairs" />}
      </View>
      <OptionsRow
        options={item.options}
        onChoose={onChoose}
        feedback={feedback}
        renderOption={(value) => <Text style={styles.label}>{LABELS[value]}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 50,
  },
  label: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: 20,
  },
});
