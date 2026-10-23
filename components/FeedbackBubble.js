import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { colors, shadow } from '../theme';

export default function FeedbackBubble({ text, color = colors.blue }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!text) return;
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.08, duration: 150, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  }, [text, scale]);

  if (!text) return null;
  return (
    <Animated.View style={[styles.bubble, { transform: [{ scale }] }]}>
      <Text style={[styles.text, { color }]}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 20,
    alignSelf: 'center',
    ...shadow,
  },
  text: {
    fontSize: 26,
    fontWeight: '600',
    textAlign: 'center',
  },
});
