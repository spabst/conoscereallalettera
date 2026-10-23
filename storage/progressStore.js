import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createInitialState,
  normalizeState,
  recordAttempt as recordAttemptPure,
  addSession as addSessionPure,
  setSkillUnlocked as setSkillUnlockedPure,
} from '../math/adaptive';
import { setSpeechEnabled } from '../utils/speech';

const STORAGE_KEY = 'math.progress.v1';
const SAVE_DELAY = 500;

const MathProgressContext = createContext(null);

export function MathProgressProvider({ children }) {
  const [state, setState] = useState(createInitialState);
  const [loaded, setLoaded] = useState(false);
  const stateRef = useRef(state);
  const saveTimer = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const next = normalizeState(JSON.parse(raw));
          stateRef.current = next;
          setState(next);
        }
      })
      .catch((error) => console.warn('Impossibile leggere i progressi', error))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    setSpeechEnabled(state.voice);
  }, [state.voice]);

  const flush = useCallback(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = null;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateRef.current)).catch((error) =>
      console.warn('Impossibile salvare i progressi', error),
    );
  }, []);

  // Salva quando l'app va in background, per non perdere l'ultimo tentativo
  useEffect(() => {
    const sub = AppState.addEventListener('change', (status) => {
      if (status !== 'active' && saveTimer.current) flush();
    });
    return () => sub.remove();
  }, [flush]);

  // Aggiorna lo stato in modo sincrono (stateRef) così chi chiama riceve subito gli eventi
  const update = useCallback(
    (fn) => {
      const next = fn(stateRef.current);
      stateRef.current = next;
      setState(next);
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(flush, SAVE_DELAY);
      return next;
    },
    [flush],
  );

  const value = useMemo(
    () => ({
      state,
      loaded,
      getState: () => stateRef.current,
      recordAttempt: (attempt) => {
        let events = [];
        update((s) => {
          const result = recordAttemptPure(s, attempt);
          events = result.events;
          return result.state;
        });
        return events;
      },
      addSession: (session) => update((s) => addSessionPure(s, session)),
      setSetting: (key, val) => update((s) => ({ ...s, [key]: val })),
      setSkillUnlocked: (skillId, unlocked) => update((s) => setSkillUnlockedPure(s, skillId, unlocked)),
      resetProgress: () =>
        update((s) => ({ ...createInitialState(), childName: s.childName, voice: s.voice })),
    }),
    [state, loaded, update],
  );

  return <MathProgressContext.Provider value={value}>{children}</MathProgressContext.Provider>;
}

export function useMathProgress() {
  const ctx = useContext(MathProgressContext);
  if (!ctx) throw new Error('useMathProgress va usato dentro MathProgressProvider');
  return ctx;
}
