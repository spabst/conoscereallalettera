// Trasforma il registro dei tentativi in informazioni leggibili per il genitore.
import { SKILLS, getSkill } from './curriculum';

const DAY = 24 * 60 * 60 * 1000;

function median(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

const scored = (log) => log.filter((e) => !e.pr);
const cleanRate = (entries) =>
  entries.length ? entries.filter((e) => e.c && e.n === 0 && !e.h).length / entries.length : null;

// Esercizi, risposte giuste e minuti per ognuno degli ultimi `days` giorni (dal più vecchio a oggi)
export function dailyStats(state, days = 7, now = Date.now()) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const start = today.getTime() - i * DAY;
    const end = start + DAY;
    const entries = scored(state.log).filter((e) => e.ts >= start && e.ts < end);
    const minutes = state.sessions
      .filter((x) => x.start >= start && x.start < end)
      .reduce((sum, x) => sum + (x.end - x.start) / 60000, 0);
    result.push({
      date: new Date(start),
      exercises: entries.length,
      correct: entries.filter((e) => e.c && e.n === 0).length,
      minutes: Math.round(minutes),
    });
  }
  return result;
}

export function skillStats(state, skillId) {
  const entries = scored(state.log).filter((e) => e.s === skillId);
  const recent = entries.slice(-20);
  return {
    attempts: entries.length,
    accuracy: cleanRate(recent),
    medianSeconds: median(recent.filter((e) => e.c).map((e) => e.ms / 1000)),
  };
}

const TAG_TEXT = {
  off_by_one: {
    text: 'Contando sbaglia spesso di uno (salta o ripete un oggetto).',
    tip: 'Contate insieme toccando o spostando ogni oggetto mentre dite il numero: un oggetto, un numero.',
  },
  zero: {
    text: 'Il concetto di zero non è ancora chiaro.',
    tip: 'Giocate a "dammi zero cucchiai": la risposta giusta è non dare niente.',
  },
  same_number: {
    text: 'Quando chiediamo "che numero viene dopo/prima" ripete lo stesso numero.',
    tip: 'Contate ad alta voce fermandovi sul numero e chiedete "e poi?".',
  },
  before_after: {
    text: 'Confonde "prima" e "dopo" nella fila dei numeri.',
    tip: 'Usate una fila di oggetti numerati e camminateci sopra in avanti (dopo) e indietro (prima).',
  },
  odd_even: {
    text: 'Distinguere pari e dispari è ancora difficile.',
    tip: 'Mettete oggetti a coppie: se ne avanza uno solo, il numero è dispari.',
  },
  chose_operand: {
    text: 'Nelle operazioni a volte sceglie uno dei numeri dati invece del risultato.',
    tip: 'Fate raccontare l\'operazione con oggetti veri: "avevo 3, ne arrivano 2, quanti ne ho adesso?".',
  },
  added_instead: {
    text: 'Nelle sottrazioni a volte aggiunge invece di togliere.',
    tip: 'Fate togliere fisicamente gli oggetti dal tavolo prima di contare ciò che resta.',
  },
  reversal: {
    text: 'Inverte le cifre dei numeri oltre il 10 (es. 12 e 21).',
    tip: 'Costruite i numeri con un mazzetto da dieci e oggetti sciolti: il 13 è "un mazzetto e tre".',
  },
};

/**
 * Restituisce { difficulties, strengths }.
 * Ogni difficoltà: { id, skillId?, text, tip }.
 */
export function computeInsights(state, now = Date.now()) {
  const recent = scored(state.log).filter((e) => now - e.ts < 30 * DAY);
  const errors = recent.filter((e) => !e.c || e.n > 0);
  const difficulties = [];

  // Errori tipici ripetuti
  const tagCounts = {};
  for (const e of errors) if (e.e) tagCounts[e.e] = (tagCounts[e.e] ?? 0) + 1;
  for (const [tag, count] of Object.entries(tagCounts).sort((a, b) => b[1] - a[1])) {
    if (count < 3) continue;
    if (tag.startsWith('confusion:')) {
      const [a, b] = tag.slice('confusion:'.length).split('-');
      difficulties.push({
        id: tag,
        text: `Confonde spesso la cifra ${a} con la ${b}.`,
        tip: `Tracciate insieme il ${a} e il ${b} con il dito su una superficie ruvida, dicendone il nome.`,
      });
    } else if (TAG_TEXT[tag]) {
      difficulties.push({ id: tag, ...TAG_TEXT[tag] });
    }
  }

  for (const skill of SKILLS) {
    const entries = recent.filter((e) => e.s === skill.id);

    // Riesce con il materiale ma non ancora senza: normale nel passaggio verso l'astratto
    const withMat = entries.filter((e) => e.m);
    const without = entries.filter((e) => !e.m);
    if (withMat.length >= 5 && without.length >= 5) {
      const rm = cleanRate(withMat);
      const rw = cleanRate(without);
      if (rm >= 0.75 && rw < 0.6) {
        difficulties.push({
          id: `abstract:${skill.id}`,
          skillId: skill.id,
          text: `${skill.title}: riesce bene con il materiale, non ancora con i soli numeri.`,
          tip: 'È un passaggio normale: lasciate usare il materiale (o le dita) finché serve, senza fretta.',
        });
      }
    }

    // Uso frequente dell'aiuto
    if (without.length >= 6 && without.filter((e) => e.h).length / without.length > 0.5) {
      difficulties.push({
        id: `hints:${skill.id}`,
        skillId: skill.id,
        text: `${skill.title}: chiede spesso l'aiuto del materiale.`,
        tip: 'Va bene così: il materiale è la strada verso il calcolo mentale.',
      });
    }

    // Bloccato: è sceso di livello più volte, o resta a lungo sullo stesso
    const s = state.skills[skill.id];
    const downs = s.events.filter((ev) => ev.type === 'tierDown' && now - ev.ts < 14 * DAY).length;
    const atTier = entries.filter((e) => e.t === s.tier && !e.r).length;
    if (!s.mastered && (downs >= 2 || atTier >= 40)) {
      difficulties.push({
        id: `stuck:${skill.id}`,
        skillId: skill.id,
        text: `${skill.title}: sta trovando difficoltà su "${skill.tiers[s.tier].label}".`,
        tip: skill.homeTip,
      });
    }
  }

  // Abilità in cui impiega molto più tempo del solito
  const times = SKILLS.map((sk) => ({ sk, t: skillStats(state, sk.id).medianSeconds })).filter((x) => x.t != null);
  const overall = median(times.map((x) => x.t));
  for (const { sk, t } of times) {
    if (times.length >= 3 && t > overall * 2 && t > 8) {
      difficulties.push({
        id: `slow:${sk.id}`,
        skillId: sk.id,
        text: `${sk.title}: ci mette più tempo che nelle altre attività (circa ${Math.round(t)} secondi).`,
        tip: 'Non serve essere veloci: osservate se conta tutto da capo, è una strategia del tutto normale.',
      });
    }
  }

  const strengths = [];
  for (const skill of SKILLS) {
    for (const ev of state.skills[skill.id].events) {
      if (now - ev.ts > 30 * DAY) continue;
      if (ev.type === 'mastered') strengths.push({ ts: ev.ts, text: `Ha acquisito: ${skill.title}` });
      if (ev.type === 'tierUp') strengths.push({ ts: ev.ts, text: `${skill.title}: nuovo livello "${skill.tiers[ev.tier].label}"` });
    }
  }
  strengths.sort((a, b) => b.ts - a.ts);

  return { difficulties, strengths: strengths.slice(0, 8) };
}

export function skillTitle(skillId) {
  return getSkill(skillId)?.title ?? skillId;
}
