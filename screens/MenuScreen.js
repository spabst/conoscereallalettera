import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function MenuScreen({ navigation }) {
  const exercises = [
    { title: '🖊️ Traccia le Lettere', screen: 'LetterTrace', color: '#4A90E2' },
    { title: '🎨 Associa le Immagini', screen: 'ImageMatch', color: '#50C878' },
    { title: '🔤 Componi le Parole', screen: 'WordBuild', color: '#F39C12' },
  ];

  const handlePress = (screen) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Impariamo a Leggere! 📚</Text>

      <View style={styles.buttonsContainer}>
        {exercises.map((exercise, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.button, { backgroundColor: exercise.color }]}
            onPress={() => handlePress(exercise.screen)}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>{exercise.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subtitle}>Scegli un esercizio per iniziare!</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 60,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '80%',
    gap: 25,
  },
  button: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 24,
    color: '#7F8C8D',
    marginTop: 40,
  },
});
