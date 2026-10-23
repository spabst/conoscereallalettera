import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme';

export default function BackButton({ onPress, label = '← Menu', style }) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={handlePress}>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.red,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  text: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '600',
  },
});
