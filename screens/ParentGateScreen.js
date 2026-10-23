import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import BackButton from '../components/BackButton';
import OptionButton from '../components/OptionButton';
import { randInt, shuffle } from '../math/generators';
import { colors } from '../theme';

// Domanda per adulti: una moltiplicazione che un bambino piccolo non sa risolvere
function makeQuestion() {
  const a = randInt(Math.random, 6, 9);
  const b = randInt(Math.random, 6, 9);
  const answer = a * b;
  const options = new Set([answer]);
  for (const d of shuffle(Math.random, [a, b, -a, -b, 1, -1, 10])) {
    if (options.size >= 4) break;
    options.add(answer + d);
  }
  return { a, b, answer, options: shuffle(Math.random, [...options]) };
}

export default function ParentGateScreen({ navigation }) {
  const question = useMemo(makeQuestion, []);

  const choose = (value) => {
    if (value === question.answer) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace('ParentDashboard');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} style={styles.back} />
      <Text style={styles.title}>👪 Area genitori</Text>
      <Text style={styles.subtitle}>Per entrare, rispondi a questa domanda:</Text>
      <Text style={styles.question}>
        Quanto fa {question.a} × {question.b}?
      </Text>
      <View style={styles.options}>
        {question.options.map((value) => (
          <OptionButton key={value} label={String(value)} size={110} onPress={() => choose(value)} />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  back: {
    position: 'absolute',
    top: 30,
    left: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 22,
    color: colors.muted,
  },
  question: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
  },
  options: {
    flexDirection: 'row',
    gap: 24,
  },
});
