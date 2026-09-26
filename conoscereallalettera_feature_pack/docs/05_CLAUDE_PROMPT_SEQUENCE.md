# Prompt sequenziali per Claude

Usali se vuoi controllare l'implementazione step-by-step invece di usare il Master Prompt.

---

## Prompt 1 — Audit senza modifiche

Analizza questo repository senza modificare file.

Concentrati su:
- `LetterTraceScreen`;
- touch handling;
- rendering;
- Expo / React Native versions;
- dipendenze;
- testing setup;
- vincoli iPad landscape.

Leggi anche tutti i documenti in `docs/`.

Restituisci:
1. architettura attuale;
2. problemi tecnici dell'attuale tracing;
3. piano preciso dei file da creare/modificare;
4. rischio Expo Go / native build;
5. strategia per mantenere 60fps percepiti;
6. strategia per trace evaluation target-aware.

Non scrivere codice ancora.

---

## Prompt 2 — Foundation + dependency

Implementa soltanto le fondamenta della feature.

Obiettivi:
- installa/configura React Native Skia correttamente;
- crea `features/tracing/traceConfig.js`;
- crea `features/tracing/strokeUtils.js`;
- aggiungi test per utility pure;
- non cambiare ancora il comportamento visuale finale della screen oltre a quanto strettamente necessario.

Esegui i test e mostra il diff concettuale.

Non implementare OCR né native modules.

---

## Prompt 3 — Sand canvas

Ora implementa il canvas sabbia.

Crea componenti sotto `components/sand/`.

Requisiti:
- background cartoon sand;
- path sotto il dito;
- groove + trench + rim;
- particelle limitate e deterministiche;
- no `setState` per ogni move;
- no componente React per ogni granello;
- callback con stroke finale in forma `{id, points}`.

Integra temporaneamente il canvas in `LetterTraceScreen`.

Non implementare ancora la decisione success/fail.

Verifica performance architecture e test.

---

## Prompt 4 — Target guide

Aggiungi la lettera guida direttamente nel sistema grafico del canvas.

Requisiti:
- stessa forma/font usata anche dal recognizer;
- sizing responsivo basato sulle reali dimensioni del canvas;
- centro corretto;
- opacità discreta;
- supporto a tutte le lettere presenti nell'array attuale.

Elimina il vecchio `Text` assoluto da 400px se non serve più.

Non usare offset hardcoded diversi per ogni device.

---

## Prompt 5 — Evaluator

Implementa `features/tracing/traceEvaluator.js`.

Deve valutare la corrispondenza tra stroke e target noto.

Metriche:
- coverage;
- precision;
- normalized length;
- score;
- reason;
- success.

Preferisci offscreen/raster mask piccola se le API Skia realmente disponibili lo permettono in modo robusto.

Non inventare API Skia: verifica gli export effettivi installati / docs del package.

Se serve fallback geometrico, mantieni la stessa API e spiega il compromesso.

Aggiungi test:
- empty;
- too short;
- bad/off-target;
- plausible valid trace;
- deterministic.

Non collegare ancora feedback celebrativo.

---

## Prompt 6 — UX integration

Collega evaluator e screen.

Rimuovi definitivamente la vecchia regola basata su `pointCounter > 30`.

Introduci gli stati:
- idle;
- drawing;
- evaluating;
- retry;
- success.

Aggiungi:
- feedback incoraggiante;
- haptics throttled;
- haptic di successo;
- reset;
- next;
- più stroke per lettera.

Non mostrare metriche al bambino.

In `__DEV__` puoi prevedere un piccolo debug opzionale, disabilitato di default.

---

## Prompt 7 — QA e polish

Non aggiungere nuove feature.

Fai solo quality pass:
- controlla acceptance criteria;
- cerca memory/performance issues;
- rimuovi vecchio codice SVG tracing non usato;
- verifica import;
- verifica landscape;
- verifica safe area;
- aggiorna README;
- esegui test;
- esegui Expo doctor;
- rivedi `git diff`.

Correggi i problemi trovati.

Alla fine produci un report con:
- cosa è verificato automaticamente;
- cosa richiede test su iPad fisico;
- eventuali rischi residui.

---

## Prompt 8 — Solo dopo la v1: spike PencilKit

NON implementare questo prompt insieme alla v1.

Fai uno spike tecnico, senza compromettere il codice esistente, per valutare una futura modalità "scrittura libera" su iPadOS 27 usando `PKStrokeRecognizer`.

Prima:
- verifica availability SDK;
- verifica se è ancora beta;
- definisci minimum iOS impact;
- valuta Expo Modules API + development build;
- definisci bridge tra i nostri `{points}` e PencilKit.

Restituisci una ADR / design proposal. Non modificare la feature v1.
