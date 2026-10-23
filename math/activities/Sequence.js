import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import OptionsRow from '../../components/OptionsRow';
import { Counters } from '../../components/Materials';
import { colors, shadow } from '../../theme';

function Card({ value, highlight }) {
  return (
    <View style={[styles.card, highlight && styles.question]}>
      <Text style={[styles.cardText, highlight && styles.questionText]}>{value}</Text>
    </View>
  );
}

export default function Sequence({ item, onChoose, feedback }) {
  const solvedValue = feedback.solved || feedback.revealed ? item.answer : '?';

  let row;
  if (item.mode === 'missing') {
    row = item.row.map((n, i) => (
      <Card key={i} value={i === item.hole ? solvedValue : n} highlight={i === item.hole} />
    ));
  } else {
    const known = (
      <View key="known" style={styles.withCounters}>
        <Card value={item.n} />
        {item.withMaterial && <Counters n={item.n} size={18} perRow={5} />}
      </View>
    );
    const unknown = (
      <View key="unknown" style={styles.withCounters}>
        <Card value={solvedValue} highlight />
      </View>
    );
    row = item.mode === 'after' ? [known, unknown] : [unknown, known];
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>{row}</View>
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
  row: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
  },
  withCounters: {
    alignItems: 'center',
    gap: 12,
  },
  card: {
    width: 100,
    height: 120,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  question: {
    backgroundColor: '#FDF2E3',
    borderWidth: 3,
    borderColor: colors.orange,
    borderStyle: 'dashed',
  },
  cardText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: colors.text,
  },
  questionText: {
    color: colors.orange,
  },
});
