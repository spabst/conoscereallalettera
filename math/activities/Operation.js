import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import OptionsRow from '../../components/OptionsRow';
import { NumberRod, BeadBar, Counters, TenFrames } from '../../components/Materials';
import { rodUnit } from './NumberRods';
import { colors, beadColors } from '../../theme';

const FIRST = colors.blue;
const SECOND = colors.orange;

function Material({ item, show }) {
  const { width } = useWindowDimensions();
  const { a, b, op } = item;
  const unit = rodUnit(width, 11);

  switch (show) {
    case 'rods':
      // Addizione: aste messe una dopo l'altra. Sottrazione: dall'asta si tolgono gli ultimi pezzi.
      return op === '+' ? (
        <View style={styles.inline}>
          <NumberRod n={a} unit={unit} height={36} />
          <View style={styles.gap} />
          <NumberRod n={b} unit={unit} height={36} />
        </View>
      ) : (
        <NumberRod n={a} unit={unit} height={36} removed={b} />
      );
    case 'beads':
      return (
        <View style={styles.inline}>
          <BeadBar n={a} size={36} />
          <View style={styles.gap} />
          <BeadBar n={b} size={36} />
        </View>
      );
    case 'counters':
      return op === '+' ? (
        <View style={styles.inline}>
          <Counters n={a} size={40} />
          <View style={styles.bigGap} />
          <Counters n={b} size={40} />
        </View>
      ) : (
        <Counters n={a} size={40} removed={b} />
      );
    case 'goldenBar':
      return (
        <View style={styles.inline}>
          <BeadBar n={10} size={30} />
          <View style={styles.bigGap} />
          <BeadBar n={b} size={30} />
        </View>
      );
    case 'tenFrames':
      return op === '+' ? (
        <TenFrames frames={2} size={36} groups={[{ count: a, color: FIRST }, { count: b, color: SECOND }]} />
      ) : (
        <TenFrames
          frames={2}
          size={36}
          groups={[{ count: a - b, color: beadColors[1] }, { count: b, color: beadColors[1], crossed: true }]}
        />
      );
    default:
      return null;
  }
}

// Materiale da mostrare quando il bambino chiede aiuto in un esercizio solo-cifre
function hintMaterial(item) {
  if (item.a + item.b > 10 || item.a > 10) return 'tenFrames';
  return 'counters';
}

export default function Operation({ item, onChoose, feedback, showMaterial }) {
  const show = item.show !== 'none' ? item.show : showMaterial ? hintMaterial(item) : null;
  const result = feedback.solved || feedback.revealed ? item.answer : '?';

  return (
    <View style={styles.container}>
      <Text style={styles.equation}>
        {item.a} {item.op === '+' ? '+' : '−'} {item.b} = <Text style={styles.result}>{result}</Text>
      </Text>
      <View style={styles.material}>{show && <Material item={item} show={show} />}</View>
      <OptionsRow options={item.options} onChoose={onChoose} feedback={feedback} size={110} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  equation: {
    fontSize: 72,
    fontWeight: 'bold',
    color: colors.text,
  },
  result: {
    color: colors.orange,
  },
  material: {
    minHeight: 110,
    justifyContent: 'center',
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gap: {
    width: 4,
  },
  bigGap: {
    width: 40,
  },
});
