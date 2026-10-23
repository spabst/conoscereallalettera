import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import BackButton from '../components/BackButton';
import { SKILLS } from '../math/curriculum';
import { recommendSkill, skillProgress } from '../math/adaptive';
import { useMathProgress } from '../storage/progressStore';
import { speak } from '../utils/speech';
import { colors, shadow } from '../theme';

// Libera scelta guidata: il bambino sceglie tra le attività aperte, quella consigliata è in evidenza
export default function MathHomeScreen({ navigation }) {
  const { state, loaded } = useMathProgress();

  if (!loaded) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.blue} />
      </SafeAreaView>
    );
  }

  const recommended = recommendSkill(state);

  const open = (skill) => {
    if (!state.skills[skill.id].unlocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      speak('Questa attività si aprirà più avanti.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    speak(skill.title);
    navigation.navigate('MathActivity', { skillId: skill.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Il Mondo dei Numeri 🔢</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {SKILLS.map((skill) => {
          const s = state.skills[skill.id];
          const stars = s.mastered ? 3 : Math.floor(skillProgress(state, skill.id) * 3);
          const isRecommended = skill.id === recommended;
          return (
            <TouchableOpacity
              key={skill.id}
              style={[
                styles.card,
                { backgroundColor: s.unlocked ? skill.color : '#BDC3C7' },
                isRecommended && styles.recommended,
              ]}
              onPress={() => open(skill)}
              activeOpacity={0.75}
            >
              {isRecommended && <Text style={styles.badge}>Ti aspetta! ✨</Text>}
              <Text style={styles.emoji}>{s.unlocked ? skill.emoji : '🔒'}</Text>
              <Text style={styles.cardTitle}>{skill.title}</Text>
              {s.unlocked && (
                <Text style={styles.stars}>
                  {'⭐'.repeat(stars)}
                  {'☆'.repeat(3 - stars)}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  headerSpacer: {
    width: 110,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 20,
  },
  card: {
    width: 180,
    height: 190,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 5,
    borderColor: 'transparent',
    ...shadow,
  },
  recommended: {
    borderColor: '#F1C40F',
    transform: [{ scale: 1.05 }],
  },
  badge: {
    position: 'absolute',
    top: -14,
    backgroundColor: '#F1C40F',
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 15,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  emoji: {
    fontSize: 56,
  },
  cardTitle: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  stars: {
    marginTop: 6,
    fontSize: 22,
    color: colors.white,
  },
});
