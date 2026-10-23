import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import OptionsRow from '../../components/OptionsRow';
import { NumberRod, Counters } from '../../components/Materials';
import { RodChoices, rodUnit } from './NumberRods';
import { colors, shadow } from '../../theme';

export function DigitTile({ value, size = 140 }) {
  return (
    <View style={[styles.tile, { width: size, height: size * 1.2 }]}>
      <Text style={[styles.tileText, { fontSize: size * 0.7 }]}>{value}</Text>
    </View>
  );
}

// Quantità → simbolo (asta o gettoni, poi si sceglie la cifra) e simbolo → quantità (cifra, poi si sceglie l'asta)
export default function QuantityMatch({ item, onChoose, feedback }) {
  const { width } = useWindowDimensions();

  if (item.kind === 'matchSymbolToQuantity') {
    return (
      <View style={styles.split}>
        <DigitTile value={item.answer} />
        <RodChoices options={item.options} onChoose={onChoose} feedback={feedback} unit={rodUnit(width, 14)} />
      </View>
    );
  }

  return (
    <View style={styles.column}>
      <View style={styles.material}>
        {item.show === 'rod' ? (
          <NumberRod n={item.answer} unit={rodUnit(width)} height={40} />
        ) : (
          <Counters n={item.answer} size={50} />
        )}
      </View>
      <OptionsRow options={item.options} onChoose={onChoose} feedback={feedback} size={120} />
    </View>
  );
}

const styles = StyleSheet.create({
  split: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 60,
  },
  column: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  material: {
    minHeight: 120,
    justifyContent: 'center',
  },
  tile: {
    backgroundColor: colors.sandpaperBoard,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  tileText: {
    color: colors.sandpaper,
    fontWeight: 'bold',
  },
});
