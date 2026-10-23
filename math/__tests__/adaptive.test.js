import {
  createInitialState,
  normalizeState,
  recordAttempt,
  pickNextItem,
  recommendSkill,
  skillProgress,
} from '../adaptive';
import { SKILLS } from '../curriculum';
import { generateItem, checkAnswer, makeOptions } from '../generators';
import { computeInsights } from '../insights';

jest.mock('expo-speech', () => ({ speak: jest.fn(), stop: jest.fn() }));

// Generatore pseudo-casuale deterministico
function seeded(seed = 1) {
  let x = seed;
  return () => {
    x = (x * 16807) % 2147483647;
    return (x - 1) / 2147483646;
  };
}

function attempt(skillId, tier, correct, extra = {}) {
  return {
    skillId,
    tier,
    key: `${skillId}:${tier}:x`,
    params: { target: 1 },
    correct,
    tries: correct ? 0 : 1,
    hint: false,
    ms: 3000,
    errorTag: correct ? null : 'off_by_one',
    withMaterial: true,
    ...extra,
  };
}

function run(state, skillId, results, extra) {
  let events = [];
  for (const ok of results) {
    const res = recordAttempt(state, attempt(skillId, state.skills[skillId].tier, ok, extra));
    state = res.state;
    events = events.concat(res.events);
  }
  return { state, events };
}

const times = (n, v) => Array(n).fill(v);

describe('stato iniziale', () => {
  test('sono sbloccate solo le abilità senza prerequisiti', () => {
    const state = createInitialState();
    const unlocked = SKILLS.filter((s) => state.skills[s.id].unlocked).map((s) => s.id);
    expect(unlocked).toEqual(['rods', 'digits']);
  });

  test('normalizeState scarta versioni sconosciute e aggiunge abilità mancanti', () => {
    expect(normalizeState({ version: 99 })).toEqual(createInitialState());
    const partial = { version: 1, skills: { rods: { tier: 7, unlocked: true } } };
    const state = normalizeState(partial);
    expect(state.skills.rods.tier).toBe(2);
    expect(state.skills.within20).toBeDefined();
  });
});

describe('livelli', () => {
  test('10 risposte giuste al primo colpo fanno salire di livello', () => {
    const { state, events } = run(createInitialState(), 'rods', times(10, true));
    expect(state.skills.rods.tier).toBe(1);
    expect(events).toContainEqual(expect.objectContaining({ type: 'tierUp', tier: 1 }));
  });

  test('le risposte con aiuto non contano per salire', () => {
    const { state } = run(createInitialState(), 'rods', times(10, true), { hint: true });
    expect(state.skills.rods.tier).toBe(0);
  });

  test('4 errori su 6 fanno scendere di livello', () => {
    let { state } = run(createInitialState(), 'rods', times(10, true));
    ({ state } = run(state, 'rods', [false, true, false, true, false, false]));
    expect(state.skills.rods.tier).toBe(0);
  });

  test('al livello 0 non si scende sotto zero', () => {
    const { state } = run(createInitialState(), 'rods', times(8, false));
    expect(state.skills.rods.tier).toBe(0);
  });

  test("all'ultimo livello si ottiene la padronanza", () => {
    const { state, events } = run(createInitialState(), 'rods', times(40, true));
    expect(state.skills.rods.tier).toBe(2);
    expect(state.skills.rods.mastered).toBe(true);
    expect(skillProgress(state, 'rods')).toBe(1);
    expect(events.filter((e) => e.type === 'mastered')).toHaveLength(1);
  });
});

describe('sblocchi', () => {
  test('match si sblocca solo quando aste e cifre sono acquisite', () => {
    let { state } = run(createInitialState(), 'rods', times(40, true));
    expect(state.skills.match.unlocked).toBe(false);
    const res = run(state, 'digits', times(50, true));
    expect(res.state.skills.match.unlocked).toBe(true);
    expect(res.events).toContainEqual(expect.objectContaining({ type: 'unlocked', skillId: 'match' }));
  });

  test('ripassi andati male tolgono la padronanza', () => {
    let { state } = run(createInitialState(), 'rods', times(40, true));
    ({ state } = run(state, 'rods', times(4, false), { review: true }));
    expect(state.skills.rods.mastered).toBe(false);
    expect(recommendSkill(state)).toBe('rods');
  });
});

describe('scelta degli esercizi', () => {
  test('le cifre vanno prima presentate, poi riconosciute', () => {
    const state = createInitialState();
    const item = pickNextItem(state, 'digits', { rng: seeded(3) });
    expect(item.kind).toBe('digitTrace');
    expect(item.practice).toBe(true);

    let s = state;
    for (const d of [1, 2, 3]) {
      s = recordAttempt(s, { ...attempt('digits', 0, true), practice: true, presentKey: d }).state;
    }
    expect(s.skills.digits.presented).toEqual([1, 2, 3]);
    expect(pickNextItem(s, 'digits', { rng: seeded(3) }).kind).toBe('digitPick');
  });

  test('ogni generatore produce esercizi validi a ogni livello', () => {
    const rng = seeded(7);
    const state = createInitialState();
    for (const skill of SKILLS) {
      skill.tiers.forEach((_, tier) => {
        for (let i = 0; i < 50; i++) {
          const item = generateItem(skill.id, tier, { ...state.skills[skill.id], presented: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }, rng);
          expect(item.answer).toBeDefined();
          if (item.options) {
            expect(item.options).toContain(item.answer);
            expect(new Set(item.options).size).toBe(item.options.length);
          }
          if (typeof item.answer === 'number') expect(item.answer).toBeGreaterThanOrEqual(0);
          expect(checkAnswer(item, item.answer).correct).toBe(true);
        }
      });
    }
  });

  test('makeOptions include la risposta e i vicini', () => {
    const opts = makeOptions(seeded(2), 5, 3, 1, 10);
    expect(opts).toContain(5);
    expect(opts).toHaveLength(3);
  });
});

describe('verifica e difficoltà', () => {
  test('errori tipici vengono etichettati', () => {
    const rng = seeded(5);
    const sub = generateItem('subtraction', 3, createInitialState().skills.subtraction, rng);
    expect(checkAnswer(sub, sub.a + sub.b).errorTag).toBe('added_instead');
    expect(checkAnswer({ kind: 'digitPick', answer: 6 }, 9).errorTag).toBe('confusion:6-9');
    expect(checkAnswer({ kind: 'rods', answer: 4 }, 5).errorTag).toBe('off_by_one');
  });

  test('confusioni ripetute compaiono tra le difficoltà', () => {
    let state = createInitialState();
    for (let i = 0; i < 3; i++) {
      state = recordAttempt(state, attempt('digits', 0, false, { errorTag: 'confusion:6-9' })).state;
    }
    const { difficulties } = computeInsights(state);
    expect(difficulties.map((d) => d.id)).toContain('confusion:6-9');
  });

  test('materiale sì, astratto no', () => {
    let state = createInitialState();
    for (let i = 0; i < 6; i++) {
      state = recordAttempt(state, attempt('addition', 2, true, { withMaterial: true })).state;
      state = recordAttempt(state, attempt('addition', 3, false, { withMaterial: false, errorTag: null })).state;
    }
    const { difficulties } = computeInsights(state);
    expect(difficulties.map((d) => d.id)).toContain('abstract:addition');
  });
});
