import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import BackButton from '../components/BackButton';
import FeedbackBubble from '../components/FeedbackBubble';
import { ACTIVITIES } from '../math/activities';
import { getSkill } from '../math/curriculum';
import { pickNextItem, SESSION_LENGTH } from '../math/adaptive';
import { checkAnswer } from '../math/generators';
import { useMathProgress } from '../storage/progressStore';
import { speak, stopSpeaking, numberWord, theNumber } from '../utils/speech';
import { colors, shadow } from '../theme';

const MAX_TRIES = 3;
const PRAISE = ['Ottimo lavoro!', 'Esatto!', 'Ce l\'hai fatta!', 'Benissimo!', 'Giusto!'];

function praise(name) {
  const p = PRAISE[Math.floor(Math.random() * PRAISE.length)];
  return name ? `${p.slice(0, -1)}, ${name}!` : p;
}

function spokenAnswer(answer) {
  return typeof answer === 'number' ? numberWord(answer) : answer;
}

export default function MathActivityScreen({ navigation, route }) {
  const { skillId } = route.params;
  const skill = getSkill(skillId);
  const { getState, recordAttempt, addSession } = useMathProgress();

  const [item, setItem] = useState(null);
  const [index, setIndex] = useState(0);
  const [tries, setTries] = useState(0);
  const [wrongChoices, setWrongChoices] = useState([]);
  const [phase, setPhase] = useState('asking'); // asking | solved | revealed | done
  const [showMaterial, setShowMaterial] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', color: colors.blue });
  const [news, setNews] = useState([]);

  const firstError = useRef(null);
  const startedAt = useRef(Date.now());
  const session = useRef({ start: Date.now(), skillId, items: 0, correct: 0 });
  const timer = useRef(null);
  const results = useRef([]);

  const loadItem = useCallback(
    (lastKey) => {
      const next = pickNextItem(getState(), skillId, { lastKey });
      setItem(next);
      setTries(0);
      setWrongChoices([]);
      setPhase('asking');
      setShowMaterial(false);
      setFeedback({ text: next.text, color: colors.blue });
      firstError.current = null;
      startedAt.current = Date.now();
      speak(next.prompt);
    },
    [getState, skillId],
  );

  useEffect(() => {
    loadItem(null);
    return () => {
      clearTimeout(timer.current);
      stopSpeaking();
      const s = session.current;
      if (s.items > 0) addSession({ ...s, end: Date.now() });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goNext = (delay) => {
    timer.current = setTimeout(() => {
      if (index + 1 >= SESSION_LENGTH) {
        setPhase('done');
        speak('Hai finito! Ottimo lavoro.');
      } else {
        setIndex(index + 1);
        loadItem(item.key);
      }
    }, delay);
  };

  const record = (correct, extra = {}) => {
    const events = recordAttempt({
      skillId: item.skillId,
      tier: item.tier,
      key: item.key,
      params: item.params,
      correct,
      tries: extra.tries ?? tries,
      hint: showMaterial,
      ms: Date.now() - startedAt.current,
      errorTag: firstError.current,
      withMaterial: item.withMaterial,
      review: !!item.review,
      practice: !!item.practice,
      presentKey: item.presentKey,
    });
    session.current.items += 1;
    if (correct && tries === 0) session.current.correct += 1;
    results.current.push(correct && tries === 0);

    const messages = events.map((ev) => {
      const sk = getSkill(ev.skillId);
      if (ev.type === 'tierUp') return `🚀 Nuova sfida: ${sk.tiers[ev.tier].label}`;
      if (ev.type === 'mastered') return `🏆 Hai imparato: ${sk.title}`;
      if (ev.type === 'unlocked') return `🎁 Nuova attività: ${sk.emoji} ${sk.title}`;
      return null;
    });
    if (messages.some(Boolean)) setNews((prev) => [...prev, ...messages.filter(Boolean)]);
  };

  const onChoose = (value) => {
    if (phase !== 'asking') return;
    const result = checkAnswer(item, value);

    if (result.correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const text = item.practice ? `Questo è ${theNumber(item.answer)}! ⭐` : `${praise(getState().childName.trim())} 🌟`;
      setPhase('solved');
      setFeedback({ text, color: colors.green });
      speak(item.practice ? `Questo è ${theNumber(item.answer)}. Ottimo lavoro!` : text);
      record(true);
      goNext(1800);
      return;
    }

    // Controllo dell'errore: nessuna punizione, si invita a guardare il materiale e a riprovare
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    if (firstError.current == null) firstError.current = result.errorTag;
    const nextTries = tries + 1;
    setTries(nextTries);
    setWrongChoices((prev) => [...prev, value]);

    if (nextTries >= MAX_TRIES) {
      setPhase('revealed');
      setFeedback({ text: `Era ${item.answer}. La prossima volta andrà meglio! 💪`, color: colors.orange });
      speak(`La risposta era ${spokenAnswer(item.answer)}. Guardiamola insieme.`);
      record(false, { tries: nextTries });
      goNext(3500);
    } else {
      setFeedback({ text: 'Quasi! Guarda bene e riprova 💡', color: colors.orange });
      speak(result.wrongSpeech);
    }
  };

  const askHint = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowMaterial(true);
    speak('Ecco il materiale. Conta con gli occhi, o con il dito.');
  };

  const restart = () => {
    addSession({ ...session.current, end: Date.now() });
    session.current = { start: Date.now(), skillId, items: 0, correct: 0 };
    results.current = [];
    setNews([]);
    setIndex(0);
    loadItem(item?.key);
  };

  if (!item) return <SafeAreaView style={styles.container} />;

  if (phase === 'done') {
    const stars = results.current.filter(Boolean).length;
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Hai finito! 🎉</Text>
          <Text style={styles.stars}>{'⭐'.repeat(Math.max(1, Math.round((stars / results.current.length) * 5)))}</Text>
          {news.map((n, i) => (
            <Text key={i} style={styles.news}>{n}</Text>
          ))}
          <View style={styles.summaryButtons}>
            <TouchableOpacity style={[styles.bigButton, { backgroundColor: skill.color }]} onPress={restart}>
              <Text style={styles.bigButtonText}>Ancora! 🔁</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.bigButton, { backgroundColor: colors.blue }]} onPress={() => navigation.goBack()}>
              <Text style={styles.bigButtonText}>Altre attività 🔢</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const Activity = ACTIVITIES[item.kind];
  const itemSkill = getSkill(item.skillId);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton label="← Numeri" onPress={() => navigation.goBack()} />
        <View style={styles.titleBox}>
          <Text style={styles.title}>
            {itemSkill.emoji} {itemSkill.title}
          </Text>
          {item.review && <Text style={styles.review}>Ripasso</Text>}
        </View>
        <TouchableOpacity style={styles.speaker} onPress={() => speak(item.prompt)}>
          <Text style={styles.speakerText}>🔊</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dots}>
        {Array.from({ length: SESSION_LENGTH }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < results.current.length && { backgroundColor: results.current[i] ? colors.green : colors.orange },
              i === index && styles.dotCurrent,
            ]}
          />
        ))}
      </View>

      <FeedbackBubble text={feedback.text} color={feedback.color} />

      <View style={styles.activity}>
        <Activity
          key={`${index}-${item.key}`}
          item={item}
          onChoose={onChoose}
          showMaterial={showMaterial}
          feedback={{
            answer: item.answer,
            wrongChoices,
            solved: phase === 'solved',
            revealed: phase === 'revealed',
            locked: phase !== 'asking',
          }}
        />
      </View>

      {item.hintable && phase === 'asking' && !showMaterial && (
        <TouchableOpacity style={styles.hint} onPress={askHint}>
          <Text style={styles.hintText}>💡 Aiuto</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  titleBox: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  review: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    backgroundColor: colors.purple,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  speaker: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  speakerText: {
    fontSize: 32,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 10,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#D5DBDB',
  },
  dotCurrent: {
    borderWidth: 3,
    borderColor: colors.blue,
  },
  activity: {
    flex: 1,
    paddingVertical: 10,
  },
  hint: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: colors.orange,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    ...shadow,
  },
  hintText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  summary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  summaryTitle: {
    fontSize: 56,
    fontWeight: 'bold',
    color: colors.text,
  },
  stars: {
    fontSize: 56,
  },
  news: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.purple,
  },
  summaryButtons: {
    flexDirection: 'row',
    gap: 30,
    marginTop: 20,
  },
  bigButton: {
    paddingVertical: 22,
    paddingHorizontal: 40,
    borderRadius: 20,
    ...shadow,
  },
  bigButtonText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.white,
  },
});
