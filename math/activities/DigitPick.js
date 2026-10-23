import React from 'react';
import { View, StyleSheet } from 'react-native';
import OptionsRow from '../../components/OptionsRow';

// Secondo tempo della lezione: "Dov'è il 3?" tra cifre smerigliate
export default function DigitPick({ item, onChoose, feedback }) {
  return (
    <View style={styles.container}>
      <OptionsRow options={item.options} onChoose={onChoose} feedback={feedback} size={170} variant="sandpaper" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});
