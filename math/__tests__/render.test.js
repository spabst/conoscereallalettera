// Verifica che ogni attività e le schermate del percorso si disegnino senza errori
import React from 'react';
import { act, create } from 'react-test-renderer';
import { SKILLS } from '../curriculum';
import { generateItem } from '../generators';
import { createInitialState, recordAttempt } from '../adaptive';
import { ACTIVITIES } from '../activities';
import { MathProgressProvider } from '../../storage/progressStore';
import MathHomeScreen from '../../screens/MathHomeScreen';
import MathActivityScreen from '../../screens/MathActivityScreen';
import ParentDashboardScreen from '../../screens/ParentDashboardScreen';
import ParentGateScreen from '../../screens/ParentGateScreen';

jest.mock('expo-speech', () => ({ speak: jest.fn(), stop: jest.fn() }));
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {},
  NotificationFeedbackType: {},
}));
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View, SafeAreaProvider: ({ children }) => children };
});

const feedback = { answer: 1, wrongChoices: [], solved: false, revealed: false, locked: false };
const navigation = { navigate: jest.fn(), goBack: jest.fn(), replace: jest.fn() };

function render(element) {
  let tree;
  act(() => {
    tree = create(<MathProgressProvider>{element}</MathProgressProvider>);
  });
  return tree;
}

test('ogni tipo di esercizio si disegna a ogni livello', () => {
  const skillState = { ...createInitialState().skills.digits, presented: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] };
  for (const skill of SKILLS) {
    skill.tiers.forEach((_, tier) => {
      for (const showMaterial of [false, true]) {
        const item = generateItem(skill.id, tier, skillState);
        const Activity = ACTIVITIES[item.kind];
        act(() => {
          create(
            <Activity item={item} onChoose={() => {}} feedback={{ ...feedback, answer: item.answer }} showMaterial={showMaterial} />,
          ).unmount();
        });
      }
    });
  }
  const trace = generateItem('digits', 0, createInitialState().skills.digits);
  act(() => create(<ActivityProbe item={trace} />).unmount());
});

function ActivityProbe({ item }) {
  const Activity = ACTIVITIES[item.kind];
  return <Activity item={item} onChoose={() => {}} feedback={feedback} />;
}

test('le schermate del percorso si aprono', async () => {
  for (const [Screen, params] of [
    [MathHomeScreen, {}],
    [MathActivityScreen, { skillId: 'rods' }],
    [MathActivityScreen, { skillId: 'within20' }],
    [ParentGateScreen, {}],
    [ParentDashboardScreen, {}],
  ]) {
    const tree = render(<Screen navigation={navigation} route={{ params }} />);
    await act(async () => {});
    act(() => tree.unmount());
  }
});

test('la dashboard mostra dati e difficoltà', async () => {
  let state = createInitialState();
  for (let i = 0; i < 5; i++) {
    state = recordAttempt(state, {
      skillId: 'digits', tier: 1, key: 'k', params: { mode: 'recognize', digit: 6 },
      correct: false, tries: 3, hint: false, ms: 4000, errorTag: 'confusion:6-9', withMaterial: true,
    }).state;
  }
  const AsyncStorage = require('@react-native-async-storage/async-storage');
  await AsyncStorage.setItem('math.progress.v1', JSON.stringify(state));
  const tree = render(<ParentDashboardScreen navigation={navigation} />);
  await act(async () => {});
  expect(JSON.stringify(tree.toJSON())).toContain('Confonde spesso la cifra 6 con la 9');
  act(() => tree.unmount());
});

test('una sessione completa arriva al riepilogo e salva i progressi', async () => {
  jest.useFakeTimers();
  const tree = render(<MathActivityScreen navigation={navigation} route={{ params: { skillId: 'rods' } }} />);
  await act(async () => {});
  for (let i = 0; i < 8; i++) {
    const activity = tree.root.findByType(ACTIVITIES.rods);
    act(() => activity.props.onChoose(activity.props.item.answer));
    act(() => jest.advanceTimersByTime(2000));
  }
  expect(JSON.stringify(tree.toJSON())).toContain('Hai finito');
  act(() => jest.advanceTimersByTime(1000));
  const AsyncStorage = require('@react-native-async-storage/async-storage');
  const saved = JSON.parse(await AsyncStorage.getItem('math.progress.v1'));
  expect(saved.log.filter((e) => e.s === 'rods')).toHaveLength(8);
  act(() => tree.unmount());
  jest.useRealTimers();
});
