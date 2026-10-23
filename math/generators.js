// Generazione degli esercizi e verifica delle risposte.
// Ogni generatore crea dei parametri casuali (params) per un tier e da quelli costruisce l'esercizio:
// così un esercizio sbagliato può essere riproposto identico a partire dai suoi params.
import { getSkill } from './curriculum';
import { numberWord, countingWords, theNumber, ofNumber } from '../utils/speech';

export function randInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

export function shuffle(rng, array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pick(rng, array) {
  return array[Math.floor(rng() * array.length)];
}

// Opzioni di risposta: la risposta giusta, i "vicini" (±1, errori tipici di conteggio)
// e altri distrattori dati, il tutto entro [min, max].
export function makeOptions(rng, answer, count, min, max, extra = []) {
  const options = [answer];
  const candidates = [...extra, answer - 1, answer + 1];
  for (const c of shuffle(rng, candidates)) {
    if (options.length >= count) break;
    if (c >= min && c <= max && !options.includes(c)) options.push(c);
  }
  let guard = 0;
  while (options.length < count && guard++ < 100) {
    const c = randInt(rng, min, max);
    if (!options.includes(c)) options.push(c);
  }
  return shuffle(rng, options);
}

const reversed = (n) => Number(String(n).split('').reverse().join(''));

const generators = {
  rods: {
    params: (tier, rng) => ({ target: randInt(rng, 1, tier.max) }),
    build: ({ target }, tier, rng) => {
      const rods =
        tier.max <= 5
          ? shuffle(rng, Array.from({ length: tier.max }, (_, i) => i + 1))
          : makeOptions(rng, target, 4, 1, tier.max);
      return {
        kind: 'rods',
        prompt: `Toccami l'asta ${ofNumber(target)}`,
        text: 'Trova l\'asta giusta',
        answer: target,
        options: rods,
      };
    },
  },

  digits: {
    params: (tier, rng, skillState) => {
      const notPresented = tier.group.filter((d) => !skillState.presented.includes(d));
      if (notPresented.length > 0) return { mode: 'present', digit: notPresented[0] };
      return { mode: 'recognize', digit: pick(rng, tier.group) };
    },
    build: ({ mode, digit }, tier, rng) => {
      if (mode === 'present') {
        return {
          kind: 'digitTrace',
          prompt: `Questo è ${theNumber(digit)}. Traccialo con il dito.`,
          text: 'Traccia la cifra con il dito',
          answer: digit,
          practice: true,
          presentKey: digit,
        };
      }
      // Riconoscimento: tra le cifre del gruppo, più qualche cifra già nota (e le "gemelle" 6/9)
      let options;
      if (tier.group.length <= 3) {
        options = shuffle(rng, tier.group);
      } else {
        const lookalike = { 6: [9], 9: [6], 1: [7], 7: [1], 2: [5], 5: [2] }[digit] ?? [];
        options = makeOptions(rng, digit, 4, 0, 9, lookalike);
      }
      return {
        kind: 'digitPick',
        prompt: `Dov'è ${theNumber(digit)}?`,
        text: 'Tocca la cifra giusta',
        answer: digit,
        options,
      };
    },
  },

  match: {
    params: (tier, rng) => ({ target: randInt(rng, 1, tier.max) }),
    build: ({ target }, tier, rng) => {
      const options = makeOptions(rng, target, tier.max <= 5 ? 3 : 4, 1, tier.max);
      if (tier.dir === 's2q') {
        return {
          kind: 'matchSymbolToQuantity',
          prompt: 'Trova l\'asta che va con questo numero',
          text: 'Quale asta va con questo numero?',
          answer: target,
          options,
        };
      }
      return {
        kind: 'matchQuantityToSymbol',
        show: tier.show,
        prompt: tier.show === 'rod' ? 'Quanto è lunga quest\'asta? Tocca il numero giusto.' : 'Quanti gettoni ci sono?',
        text: tier.show === 'rod' ? 'Quanto è lunga l\'asta?' : 'Quanti gettoni?',
        answer: target,
        options,
      };
    },
  },

  spindles: {
    params: (tier, rng) => ({ target: rng() < 0.2 ? 0 : randInt(rng, 1, tier.max) }),
    build: ({ target }, tier) => ({
      kind: 'spindles',
      prompt:
        tier.max <= 4
          ? `Questo è ${theNumber(target)}. Metti nella scatola i fuselli giusti, poi premi fatto.`
          : 'Metti nella scatola tanti fuselli quanti ne dice il numero, poi premi fatto.',
      text: 'Metti i fuselli nella scatola',
      answer: target,
    }),
  },

  sequence: {
    params: (tier, rng) => {
      const mode = tier.mode === 'mixed' ? pick(rng, ['after', 'before']) : tier.mode;
      if (mode === 'after') return { mode, n: randInt(rng, 1, tier.max - 1) };
      if (mode === 'before') return { mode, n: randInt(rng, 2, tier.max) };
      return { mode, start: randInt(rng, 1, tier.max - 4), hole: randInt(rng, 0, 4) };
    },
    build: (params, tier, rng) => {
      if (params.mode === 'missing') {
        const row = Array.from({ length: 5 }, (_, i) => params.start + i);
        const answer = row[params.hole];
        return {
          kind: 'sequence',
          mode: 'missing',
          row,
          hole: params.hole,
          prompt: 'Quale numero manca nella fila?',
          text: 'Quale numero manca?',
          answer,
          options: makeOptions(rng, answer, 4, 1, tier.max),
        };
      }
      const { n, mode } = params;
      const answer = mode === 'after' ? n + 1 : n - 1;
      const extra = mode === 'after' ? [n, n - 1] : [n, n + 1];
      return {
        kind: 'sequence',
        mode,
        n,
        prompt: mode === 'after' ? `Che numero viene dopo ${theNumber(n)}?` : `Che numero viene prima ${ofNumber(n)}?`,
        text: mode === 'after' ? 'Che numero viene dopo?' : 'Che numero viene prima?',
        answer,
        options: makeOptions(rng, answer, tier.max <= 5 ? 3 : 4, 1, tier.max, extra),
      };
    },
  },

  oddEven: {
    params: (tier, rng) => ({ n: randInt(rng, 1, tier.max) }),
    build: ({ n }, tier) => ({
      kind: 'oddEven',
      n,
      prompt: tier.material
        ? 'Metti i gettoni in coppia. È un numero pari o dispari?'
        : `${theNumber(n).replace(/^./, (c) => c.toUpperCase())} è pari o dispari?`,
      text: 'Pari o dispari?',
      answer: n % 2 === 0 ? 'pari' : 'dispari',
      options: ['pari', 'dispari'],
    }),
  },

  addition: {
    params: (tier, rng) => {
      const a = randInt(rng, 1, tier.max - 1);
      return { a, b: randInt(rng, 1, tier.max - a) };
    },
    build: ({ a, b }, tier, rng) => ({
      kind: 'operation',
      op: '+',
      a,
      b,
      show: tier.show,
      prompt: `Quanto fa ${numberWord(a)} più ${numberWord(b)}?`,
      text: `${a} + ${b} = ?`,
      answer: a + b,
      options: makeOptions(rng, a + b, 4, 1, 10, [a, b]),
    }),
  },

  tenFriends: {
    params: (tier, rng) => ({ a: randInt(rng, 1, 9) }),
    build: ({ a }, tier, rng) => ({
      kind: 'tenFriends',
      a,
      prompt: `Ho ${numberWord(a)}. Quanti ne mancano per arrivare a dieci?`,
      text: `${a} + ? = 10`,
      answer: 10 - a,
      options: makeOptions(rng, 10 - a, 4, 1, 9, [a]),
    }),
  },

  subtraction: {
    params: (tier, rng) => {
      const a = randInt(rng, 2, tier.max);
      return { a, b: randInt(rng, 1, a - 1) };
    },
    build: ({ a, b }, tier, rng) => ({
      kind: 'operation',
      op: '-',
      a,
      b,
      show: tier.show,
      prompt: `Quanto fa ${numberWord(a)} meno ${numberWord(b)}?`,
      text: `${a} − ${b} = ?`,
      answer: a - b,
      options: makeOptions(rng, a - b, 4, 0, 10, a + b <= 10 ? [a + b, b] : [b]),
    }),
  },

  within20: {
    params: (tier, rng) => {
      const mode = tier.mode === 'mixed' ? pick(rng, ['teen', 'add', 'sub']) : tier.mode;
      if (mode === 'teen') return { mode, a: 10, b: randInt(rng, 1, 9) };
      if (mode === 'add') {
        const a = randInt(rng, 2, 9);
        return { mode, a, b: randInt(rng, Math.max(2, 11 - a), 9) };
      }
      const a = randInt(rng, 11, 18);
      return { mode, a, b: randInt(rng, a - 9, 9) };
    },
    build: ({ mode, a, b }, tier, rng) => {
      const op = mode === 'sub' ? '-' : '+';
      const answer = op === '+' ? a + b : a - b;
      const extra = [reversed(answer)].filter((r) => r !== answer && r <= 20);
      return {
        kind: 'operation',
        op,
        a,
        b,
        show: tier.material ? (mode === 'teen' ? 'goldenBar' : 'tenFrames') : 'none',
        prompt: `Quanto fa ${numberWord(a)} ${op === '+' ? 'più' : 'meno'} ${numberWord(b)}?`,
        text: `${a} ${op === '+' ? '+' : '−'} ${b} = ?`,
        answer,
        options: makeOptions(rng, answer, 4, 1, 20, extra),
      };
    },
  },
};

function itemKey(skillId, tierIndex, params) {
  return `${skillId}:${tierIndex}:${Object.values(params).join('-')}`;
}

export function buildItem(skillId, tierIndex, params, rng = Math.random) {
  const skill = getSkill(skillId);
  const tier = skill.tiers[tierIndex];
  const item = generators[skillId].build(params, tier, rng);
  return {
    ...item,
    skillId,
    tier: tierIndex,
    params,
    key: itemKey(skillId, tierIndex, params),
    withMaterial: tier.material,
    // Negli esercizi senza materiale il bambino può chiedere aiuto e far comparire il materiale
    hintable: !tier.material && item.kind !== 'digitPick' && item.kind !== 'sequence',
  };
}

export function generateItem(skillId, tierIndex, skillState, rng = Math.random) {
  const tier = getSkill(skillId).tiers[tierIndex];
  const params = generators[skillId].params(tier, rng, skillState);
  return buildItem(skillId, tierIndex, params, rng);
}

// Restituisce se la risposta è giusta, un'etichetta per il tipo di errore (per il genitore)
// e una frase che aiuta il bambino a correggersi da solo guardando il materiale.
export function checkAnswer(item, chosen) {
  const { answer } = item;
  if (chosen === answer) return { correct: true, errorTag: null };

  let errorTag = 'other';
  let wrongSpeech = 'Non ancora. Guarda bene e riprova.';
  const numeric = typeof chosen === 'number' && typeof answer === 'number';
  const diff = numeric ? Math.abs(chosen - answer) : null;

  switch (item.kind) {
    case 'rods':
    case 'matchSymbolToQuantity':
      if (diff === 1) errorTag = 'off_by_one';
      wrongSpeech = `Questa è l'asta ${ofNumber(chosen)}: ${countingWords(chosen)}. Riprova.`;
      break;
    case 'matchQuantityToSymbol':
      if (diff === 1) errorTag = 'off_by_one';
      wrongSpeech = 'Contiamo insieme toccando ogni pezzo, uno alla volta. Riprova.';
      break;
    case 'digitPick':
      errorTag = `confusion:${Math.min(chosen, answer)}-${Math.max(chosen, answer)}`;
      wrongSpeech = `Questo è ${theNumber(chosen)}. Cerchiamo ${theNumber(answer)}.`;
      break;
    case 'spindles':
      if (diff === 1) errorTag = 'off_by_one';
      if (answer === 0) errorTag = 'zero';
      wrongSpeech =
        answer === 0
          ? 'Zero vuol dire niente: la scatola deve restare vuota.'
          : chosen === 1
            ? 'Nella scatola c\'è un fuso solo. Guarda il numero e riprova.'
            : `Nella scatola ci sono ${numberWord(chosen)} fuselli. Contali e riprova.`;
      break;
    case 'sequence':
      if (item.mode !== 'missing' && chosen === item.n) errorTag = 'same_number';
      else if (item.mode === 'after' && chosen === item.n - 1) errorTag = 'before_after';
      else if (item.mode === 'before' && chosen === item.n + 1) errorTag = 'before_after';
      else if (diff === 1) errorTag = 'off_by_one';
      wrongSpeech = 'Contiamo insieme dall\'inizio e ascolta bene. Riprova.';
      break;
    case 'oddEven':
      errorTag = 'odd_even';
      wrongSpeech = 'Guarda bene: ogni gettone ha un compagno?';
      break;
    case 'tenFriends':
      if (chosen === item.a) errorTag = 'chose_operand';
      else if (diff === 1) errorTag = 'off_by_one';
      wrongSpeech = 'Conta i posti vuoti. Riprova.';
      break;
    case 'operation':
      if (item.op === '-' && chosen === item.a + item.b) errorTag = 'added_instead';
      else if (chosen === item.a || chosen === item.b) errorTag = 'chose_operand';
      else if (numeric && answer >= 10 && chosen === reversed(answer)) errorTag = 'reversal';
      else if (diff === 1) errorTag = 'off_by_one';
      wrongSpeech =
        item.op === '+'
          ? 'Unisci tutto e conta dall\'inizio. Riprova.'
          : 'Togli, e poi conta quelli che restano. Riprova.';
      break;
    default:
      break;
  }
  return { correct: false, errorTag, wrongSpeech };
}
