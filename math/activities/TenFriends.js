import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import OptionsRow from '../../components/OptionsRow';
import { TenFrames } from '../../components/Materials';
import { colors, beadColors } from '../../theme';

// Gli amici del 10: quanti posti restano vuoti nella cornice da dieci?
export default function TenFriends({ item, onChoose, feedback, showMaterial }) {
  const solved = feedback.solved || feedback.revealed;
  const groups = [{ count: item.a, color: beadColors[10] }];
  if (solved) groups.push({ count: item.answer, color: colors.blue });

  return (
    <View style={styles.container}>
      <Text style={styles.equation}>
        {item.a} + <Text style={styles.result}>{solved ? item.answer : '?'}</Text> = 10
      </Text>
      <View style={styles.material}>
        {(item.withMaterial || showMaterial) && <TenFrames groups={groups} size={50} />}
      </View>
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
    minHeight: 130,
    justifyContent: 'center',
  },
});
