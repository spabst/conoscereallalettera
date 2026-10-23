import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Spindle } from '../../components/Materials';
import { DigitTile } from './QuantityMatch';
import { numberWord, speak } from '../../utils/speech';
import { colors, shadow } from '../../theme';

const PILE = 12;

// Il bambino crea la quantità: tocca il mucchio per mettere un fuso nella scatola, tocca la scatola per toglierlo
export default function Spindles({ item, onChoose, feedback }) {
  const [count, setCount] = useState(0);

  const add = () => {
    if (feedback.locked || count >= PILE) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    speak(numberWord(count + 1));
    setCount(count + 1);
  };

  const remove = () => {
    if (feedback.locked || count === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCount(count - 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.boxColumn}>
          <DigitTile value={item.answer} size={90} />
          <TouchableOpacity style={styles.box} onPress={remove} activeOpacity={0.8}>
            <View style={styles.inBox}>
              {Array.from({ length: count }, (_, i) => (
                <Spindle key={i} height={110} />
              ))}
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.pile} onPress={add} activeOpacity={0.7}>
          <View style={styles.pileInner}>
            {Array.from({ length: PILE - count }, (_, i) => (
              <View key={i} style={{ transform: [{ rotate: `${(i % 5) * 8 - 16}deg` }] }}>
                <Spindle height={90} />
              </View>
            ))}
          </View>
          <Text style={styles.pileLabel}>Tocca per prendere un fuso</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.doneButton, feedback.locked && styles.disabled]}
        onPress={() => onChoose(count)}
        disabled={feedback.locked}
      >
        <Text style={styles.doneText}>Fatto ✓</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 60,
  },
  boxColumn: {
    alignItems: 'center',
    gap: 12,
  },
  box: {
    width: 300,
    height: 150,
    backgroundColor: '#F0E2C8',
    borderWidth: 4,
    borderColor: '#A0703A',
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  inBox: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  pile: {
    width: 280,
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.white,
    ...shadow,
  },
  pileInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    minHeight: 200,
  },
  pileLabel: {
    marginTop: 8,
    fontSize: 16,
    color: colors.muted,
  },
  doneButton: {
    backgroundColor: colors.green,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 20,
    ...shadow,
  },
  disabled: {
    opacity: 0.5,
  },
  doneText: {
    color: colors.white,
    fontSize: 30,
    fontWeight: 'bold',
  },
});
