# Master Prompt per Claude Code / Claude in VS Code

Copia tutto il contenuto sotto nel prompt di Claude.

---

Stai lavorando nel repository `conoscereallalettera`, un'app educativa React Native + Expo pensata soprattutto per iPad in landscape.

Voglio che tu implementi una feature production-quality: **tracciamento delle lettere con effetto sabbia cartoon e validazione reale del tracing**.

## Prima di modificare codice

1. Analizza l'intero repository.
2. Leggi questi documenti, se presenti:
   - `docs/00_README_FIRST.md`
   - `docs/01_FEATURE_SPEC.md`
   - `docs/02_ARCHITECTURE.md`
   - `docs/03_ACCEPTANCE_CRITERIA.md`
   - `docs/06_TEST_PLAN.md`
3. Leggi in particolare:
   - `package.json`
   - `App.js`
   - `screens/LetterTraceScreen.js`
   - `README.md`
   - configurazione Babel/Metro/Expo.
4. Riassumi in massimo 15 righe:
   - stato attuale;
   - file che cambierai;
   - dipendenze che aggiungerai;
   - piano in step.
5. NON modificare ancora codice finché non hai fatto questo audit.

Dopo l'audit, procedi con l'implementazione senza chiedermi conferma, a meno che non emerga un blocker reale.

## Comportamento attuale da sostituire

La screen attuale:
- disegna path blu con `react-native-svg`;
- aggiunge puntini;
- usa `pointCounter`;
- dichiara successo quando sono stati raccolti più di ~30 punti.

Questa euristica deve essere rimossa.

## Obiettivo UX

Il bambino vede una grande lettera guida sulla sabbia e la segue col dito / Pencil.

Mentre disegna:
- appare un solco sabbia cartoon;
- il solco ha profondità visuale tramite layer;
- piccoli granelli suggeriscono la sabbia spostata;
- rendering fluido e immediato.

Alla fine / durante la composizione della lettera, valuta quanto il tracing segue la lettera target.

Il feedback deve essere adatto a bambini:
- successo: positivo;
- errore: "Quasi! Segui ancora la lettera" o equivalente;
- niente punteggi numerici visibili;
- niente feedback punitivo.

## Requisito architetturale fondamentale

Per v1 NON implementare OCR cloud e NON usare il riconoscimento di testo come metodo principale.

La lettera attesa è già nota. Implementa quindi un **target-aware trace evaluator** che calcoli almeno:

- coverage;
- precision;
- lunghezza minima;
- score finale;
- success boolean.

Isola l'evaluator dalla UI in modo che in futuro possa essere sostituito da PencilKit/CoreML.

API desiderata, adattabile se hai un motivo concreto:

```js
evaluateTrace({
  targetLetter,
  strokes,
  canvasSize,
  config,
})
```

Restituzione indicativa:

```js
{
  target: "A",
  coverage: 0.0,
  precision: 0.0,
  score: 0.0,
  success: false,
  reason: "low_coverage"
}
```

## Strategia evaluator preferita

Preferisci una mask raster a bassa risoluzione (es. 256×256), usando la stessa rappresentazione/font della guida visibile:

1. render target mask;
2. render user strokes mask;
3. aggiungi tolleranza alla target mask;
4. calcola precision;
5. calcola coverage;
6. richiedi anche lunghezza minima;
7. soglie in config.

Non fare screenshot dell'intera UI.

Se, dopo aver verificato le API della versione di React Native Skia effettivamente installata, il pixel readback/offscreen rendering risulta fragile o non supportato come previsto, NON inventare API. Implementa un evaluator geometrico fallback dietro la stessa interfaccia, aggiungi test e documenta il compromesso.

## Rendering

Usa `@shopify/react-native-skia`.

Installa usando il package manager e la modalità corretta per Expo, preferibilmente:

```bash
npx expo install @shopify/react-native-skia
```

Non hardcodare una versione senza necessità.

Il rendering dello stroke deve essere Skia-based.

Usa più layer dello stesso stroke per ottenere:

- shadow/groove;
- trench;
- rim / sabbia accumulata;
- particelle controllate.

Non creare un React component per ogni punto o granello.

Le particelle devono essere:
- limitate;
- deterministic/stable per stroke;
- non flickering.

## Performance

Questo è un requisito, non un miglioramento opzionale.

NON fare `setState` per ogni touch move.

Mantieni il path live tramite ref/shared value/primitive adeguata a Skia e committa lo stroke allo stato applicativo in momenti appropriati.

Non chiamare haptic a ogni touch move; throttla.

Non usare `Math.random()` ad ogni render.

L'obiettivo è un canvas che sembri fluido su iPad.

## Scope

Mantieni le lettere già presenti:
`A B C D E F G H I L M N O P Q R S T U V Z`

Mantieni navigazione e le altre activity funzionanti.

Non fare:
- migrazione completa a TypeScript;
- riscrittura del progetto;
- backend;
- analytics;
- ML custom;
- PencilKit iOS 27 nella v1;
- refactor estesi delle altre schermate.

## File structure

Preferisci una struttura simile:

```txt
components/sand/
  SandTraceCanvas.js
  SandStroke.js
  SandBackground.js

features/tracing/
  traceConfig.js
  strokeUtils.js
  traceEvaluator.js
  traceFeedback.js
```

Puoi adattarla se il repository suggerisce una soluzione migliore, ma mantieni separazione di responsabilità.

## State UX

Gestisci almeno:

- idle
- drawing
- evaluating
- success
- retry

Il bambino deve poter aggiungere più stroke prima del successo.

Aggiungi una chiara azione "Ricomincia".

## Testing

Aggiungi test per le parti pure.

Minimo:
- empty;
- too short;
- far from target;
- valid-like trace;
- utility di normalization/path length;
- deterministic behavior.

Non scrivere test tautologici.

Se il repo non ha test runner, aggiungi solo la configurazione minima appropriata all'ecosistema esistente.

## README

Aggiorna README con:
- nuova feature;
- nuova dipendenza;
- setup;
- eventuale necessità di development build;
- come eseguire test.

Non documentare comandi che non hai verificato nel package.json finale.

## Modalità di lavoro

Lavora in piccoli step.

Dopo ogni step:
1. controlla lint/syntax se disponibile;
2. esegui test pertinenti;
3. evita di lasciare la branch in stato rotto.

Prima di dichiarare completato:
1. esegui i test;
2. esegui `npx expo-doctor` se ragionevole;
3. verifica che non ci siano import mancanti;
4. controlla git diff;
5. confronta l'implementazione con tutti gli acceptance criteria.

## Output finale richiesto

Alla fine dammi:

1. breve summary;
2. elenco file creati/modificati;
3. dipendenze aggiunte;
4. come avviare l'app;
5. come testare la feature su iPad;
6. test eseguiti e risultati;
7. acceptance criteria non verificabili automaticamente;
8. eventuali compromessi / TODO.

Non dire "completo" se non hai verificato i criteri che puoi verificare.

---
