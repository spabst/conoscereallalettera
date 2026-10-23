import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors, shadow } from '../theme';

// Pulsante-risposta grande. `state`: 'idle' | 'wrong' (già provato) | 'correct' | 'reveal'
export default function OptionButton({ label, children, onPress, state = 'idle', disabled, size = 110, variant = 'card' }) {
  const isSandpaper = variant === 'sandpaper';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || state === 'wrong'}
      activeOpacity={0.7}
      style={[
        styles.button,
        { minWidth: size, minHeight: size },
        isSandpaper && styles.sandpaperBoard,
        state === 'wrong' && styles.wrong,
        (state === 'correct' || state === 'reveal') && styles.correct,
      ]}
    >
      {children ?? (
        <View>
          <Text style={[styles.label, { fontSize: size * 0.55 }, isSandpaper && styles.sandpaperText]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.white,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 4,
    borderColor: 'transparent',
    ...shadow,
  },
  sandpaperBoard: {
    backgroundColor: colors.sandpaperBoard,
  },
  wrong: {
    opacity: 0.35,
  },
  correct: {
    borderColor: colors.green,
    backgroundColor: '#E8F8EE',
  },
  label: {
    fontWeight: 'bold',
    color: colors.text,
  },
  sandpaperText: {
    color: colors.sandpaper,
  },
});
