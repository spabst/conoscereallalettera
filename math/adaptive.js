// Motore adattivo: funzioni pure che, dato lo stato dei progressi, decidono
// livello, sblocchi ed esercizio successivo. Nessuna dipendenza da React o dallo storage.
import { SKILLS, getSkill, lastTier } from './curriculum';
import { generateItem, buildItem } from './generators';

export const STATE_VERSION = 1;
export const SESSION_LENGTH = 8;

const UP_WINDOW = 10; // risposte considerate per salire di livello
const UP_RATE = 0.8;
const DOWN_WINDOW = 6; // risposte considerate per scendere di livello
const DOWN_RATE = 0.5;
const HISTORY_MAX = 20;
const REVIEW_SHARE = 0.3;
const RETRY_SHARE = 0.4;
const STALE_DAYS = 7;
const LOG_DAYS = 90;
const LOG_MAX = 3000;
const DAY = 24 * 60 * 60 * 1000;

function newSkillState(unlocked) {
  return {
    unlocked,
    tier: 0,
    history: [], // esiti (true/false) al tier corrente
    reviews: [], // esiti dei ripassi dopo la padronanza
    presented: [], // elementi già presentati (lezione in tre tempi)
    mastered: false,
    lastPracticed: null,
    events: [], // cambi di livello, per il genitore
  };
}

export function createInitialState() {
  return {
    version: STATE_VERSION,
    childName: '',
    voice: true,
    skills: Object.fromEntries(SKILLS.map((s) => [s.id, newSkillState(s.prereqs.length === 0)])),
    log: [],
    sessions: [],
  };
}

// Rende valido uno stato caricato dallo storage (versione diversa, abilità aggiunte nel tempo...)
export function normalizeState(raw) {
  if (!raw || raw.version !== STATE_VERSION) return createInitialState();
  const initial = createInitialState();
  const skills = {};
  for (const s of SKILLS) {
    skills[s.id] = { ...initial.skills[s.id], ...(raw.skills?.[s.id] ?? {}) };
    skills[s.id].tier = Math.min(skills[s.id].tier, lastTier(s));
  }
  return { ...initial, ...raw, skills, log: raw.log ?? [], sessions: raw.sessions ?? [] };
}

// "Giusto al primo colpo, senza aiuto": è l'unico esito che fa salire di livello
export function isClean(attempt) {
  return attempt.correct && attempt.tries === 0 && !attempt.hint;
}

const rate = (list) => list.filter(Boolean).length / list.length;

function applyUnlocks(skills, now, events) {
  let changed = true;
  while (changed) {
    changed = false;
    for (const skill of SKILLS) {
      const s = skills[skill.id];
      if (s.unlocked) continue;
      if (skill.prereqs.every((id) => skills[id].mastered)) {
        skills[skill.id] = { ...s, unlocked: true };
        events.push({ type: 'unlocked', skillId: skill.id, ts: now });
        changed = true;
      }
    }
  }
}

/**
 * Registra un tentativo e restituisce { state, events }.
 * attempt: { skillId, tier, key, params, correct, tries, hint, ms, errorTag, withMaterial, review, practice, presentKey }
 */
export function recordAttempt(state, attempt, now = Date.now()) {
  const skill = getSkill(attempt.skillId);
  const skills = { ...state.skills };
  const s = { ...skills[attempt.skillId] };
  const events = [];
  const clean = isClean(attempt);

  const entry = {
    s: attempt.skillId,
    t: attempt.tier,
    k: attempt.key,
    p: attempt.params,
    c: attempt.correct,
    n: attempt.tries,
    h: !!attempt.hint,
    m: !!attempt.withMaterial,
    e: attempt.errorTag ?? null,
    ms: attempt.ms,
    r: !!attempt.review,
    pr: !!attempt.practice,
    ts: now,
  };
  const log = [...state.log, entry].filter((e) => now - e.ts < LOG_DAYS * DAY).slice(-LOG_MAX);

  s.lastPracticed = now;

  if (attempt.practice) {
    if (attempt.presentKey != null && !s.presented.includes(attempt.presentKey)) {
      s.presented = [...s.presented, attempt.presentKey];
    }
  } else if (attempt.review) {
    // Ripasso di un'abilità già acquisita: se va male, torna tra quelle da esercitare
    s.reviews = [...s.reviews, clean].slice(-4);
    if (s.reviews.length >= 4 && rate(s.reviews) <= 0.25) {
      s.mastered = false;
      s.history = [];
      s.reviews = [];
      events.push({ type: 'needsPractice', skillId: skill.id, ts: now });
    }
  } else {
    s.history = [...s.history, clean].slice(-HISTORY_MAX);
    const up = s.history.slice(-UP_WINDOW);
    const down = s.history.slice(-DOWN_WINDOW);
    if (up.length >= UP_WINDOW && rate(up) >= UP_RATE) {
      if (s.tier < lastTier(skill)) {
        s.tier += 1;
        s.history = [];
        events.push({ type: 'tierUp', skillId: skill.id, tier: s.tier, ts: now });
      } else if (!s.mastered) {
        s.mastered = true;
        s.reviews = [];
        events.push({ type: 'mastered', skillId: skill.id, ts: now });
      }
    } else if (down.length >= DOWN_WINDOW && rate(down) < DOWN_RATE && s.tier > 0) {
      s.tier -= 1;
      s.history = [];
      events.push({ type: 'tierDown', skillId: skill.id, tier: s.tier, ts: now });
    }
  }

  if (events.length) s.events = [...s.events, ...events].slice(-50);
  skills[attempt.skillId] = s;
  applyUnlocks(skills, now, events);
  return { state: { ...state, skills, log }, events };
}

// Avanzamento 0..1 di un'abilità: tier raggiunti + risposte giuste verso il prossimo traguardo
export function skillProgress(state, skillId) {
  const skill = getSkill(skillId);
  const s = state.skills[skillId];
  if (s.mastered) return 1;
  const steps = skill.tiers.length + 1;
  const toward = Math.min(UP_WINDOW, s.history.slice(-UP_WINDOW).filter(Boolean).length) / UP_WINDOW;
  return (s.tier + toward) / steps;
}

// Abilità consigliata: la prima non ancora acquisita, altrimenti un ripasso di ciò che non si fa da tempo
export function recommendSkill(state, now = Date.now()) {
  const next = SKILLS.find((sk) => state.skills[sk.id].unlocked && !state.skills[sk.id].mastered);
  if (next) return next.id;
  const stale = SKILLS.filter((sk) => {
    const s = state.skills[sk.id];
    return s.mastered && (s.lastPracticed == null || now - s.lastPracticed > STALE_DAYS * DAY);
  }).sort((a, b) => (state.skills[a.id].lastPracticed ?? 0) - (state.skills[b.id].lastPracticed ?? 0));
  return stale[0]?.id ?? null;
}

/**
 * Sceglie il prossimo esercizio della sessione su `skillId`.
 * - una parte sono ripassi di abilità già acquisite (preferendo quelle trascurate)
 * - una parte ripropone esercizi sbagliati di recente
 * - si evita di ripetere l'ultimo esercizio
 */
export function pickNextItem(state, skillId, { rng = Math.random, now = Date.now(), lastKey = null } = {}) {
  const s = state.skills[skillId];

  const mastered = SKILLS.filter((sk) => sk.id !== skillId && state.skills[sk.id].mastered);
  if (mastered.length > 0 && rng() < REVIEW_SHARE) {
    const stale = mastered.filter((sk) => now - (state.skills[sk.id].lastPracticed ?? 0) > STALE_DAYS * DAY);
    const pool = stale.length ? stale : mastered;
    const review = pool[Math.floor(rng() * pool.length)];
    const item = generateItem(review.id, lastTier(review), state.skills[review.id], rng);
    if (!item.practice) return { ...item, review: true };
  }

  const recentWrong = state.log
    .filter((e) => e.s === skillId && e.t === s.tier && !e.r && !e.pr)
    .slice(-UP_WINDOW)
    .filter((e) => !e.c || e.n > 0)
    .filter((e) => e.k !== lastKey);
  if (recentWrong.length > 0 && rng() < RETRY_SHARE) {
    const retry = recentWrong[Math.floor(rng() * recentWrong.length)];
    return buildItem(skillId, s.tier, retry.p, rng);
  }

  let item = generateItem(skillId, s.tier, s, rng);
  for (let i = 0; i < 5 && item.key === lastKey; i++) item = generateItem(skillId, s.tier, s, rng);
  return item;
}

export function addSession(state, session) {
  const cutoff = Date.now() - LOG_DAYS * DAY;
  return { ...state, sessions: [...state.sessions, session].filter((x) => x.start > cutoff) };
}

// Intervento manuale del genitore
export function setSkillUnlocked(state, skillId, unlocked) {
  return { ...state, skills: { ...state.skills, [skillId]: { ...state.skills[skillId], unlocked } } };
}
