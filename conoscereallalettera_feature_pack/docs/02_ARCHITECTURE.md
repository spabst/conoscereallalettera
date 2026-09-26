# Architettura proposta

## Obiettivo architetturale

Separare nettamente:

1. gesture/input;
2. modello degli stroke;
3. rendering;
4. scoring;
5. feedback UI.

Questo rende possibile cambiare il rendering della sabbia senza rompere il riconoscimento, e in futuro sostituire il recognizer senza cambiare il canvas.

---

## Struttura suggerita

```txt
screens/
  LetterTraceScreen.js

components/
  sand/
    SandTraceCanvas.js
    SandStroke.js
    SandBackground.js

features/
  tracing/
    traceConfig.js
    strokeUtils.js
    traceEvaluator.js
    traceFeedback.js

__tests__/
  tracing/
    strokeUtils.test.js
    traceEvaluator.test.js
```

Se il repository non ha ancora Jest configurato, Claude può aggiungere la configurazione minima necessaria, ma non deve introdurre un test framework alternativo solo per questa feature.

---

## Responsabilità

### `LetterTraceScreen.js`

Responsabile di:

- lettera corrente;
- state machine UX;
- navigazione;
- testo feedback;
- reset;
- next;
- chiamata a evaluator.

Non deve contenere logica grafica dettagliata o formule di scoring.

### `SandTraceCanvas.js`

Responsabile di:

- area di disegno;
- gesture;
- punti correnti;
- rendering della lettera guida;
- rendering della sabbia;
- callback `onStrokeEnd`;
- callback `onCanvasReady` se necessaria.

API indicativa:

```jsx
<SandTraceCanvas
  targetLetter={letter}
  disabled={state === 'evaluating' || state === 'success'}
  onStrokeEnd={handleStrokeEnd}
  onStrokesChange={handleStrokesChange}
  resetToken={resetToken}
/>
```

### `SandStroke.js`

Renderizza un path con i layer visivi del solco.

Non deve creare un componente React per ogni granello.

Se servono particelle:

- generarle da punti campionati;
- limitare il numero;
- usare Skia;
- usare seed stabile per evitare che cambino ad ogni frame.

### `strokeUtils.js`

Funzioni pure:

- simplification/resampling;
- bounding box;
- normalization;
- path length;
- deterministic hash / seed;
- conversione points → Skia path se opportuno.

### `traceEvaluator.js`

Funzione pura o servizio isolato:

```js
evaluateTrace({
  targetLetter,
  strokes,
  canvasSize,
  config,
})
```

Restituisce metriche e decisione.

Il renderer non deve decidere se il tentativo è corretto.

---

## Performance

### Regola importante

Non eseguire:

```js
setState([...points, newPoint])
```

per ogni `onTouchMove`.

Sul canvas, mantenere il path "live" con primitive Skia / shared values / ref appropriati.

Commit dello stroke a React state soltanto quando necessario.

### Target

Su iPad M-series l'esperienza deve apparire stabilmente fluida.

Obiettivo pratico:

- gesture visivamente sotto il dito;
- nessun freeze alla fine dello stroke;
- evaluation raster a bassa risoluzione;
- niente migliaia di view/circle.

Non è necessario implementare una simulazione particellare fisica.

---

## React Native Skia

Aggiungere:

```bash
npx expo install @shopify/react-native-skia
```

Verificare la versione risolta dal progetto anziché hardcodare una versione arbitraria.

Il repository usa React Native 0.86 / React 19, compatibili con le versioni moderne di React Native Skia.

Se l'ambiente richiede una development build, documentare i comandi necessari anziché modificare l'intero progetto senza spiegazione.

---

## Rendering della lettera target

La lettera guida dovrebbe essere renderizzata nel medesimo sistema grafico del canvas.

Requisiti:

- font coerente;
- grande;
- bold / facilmente tracciabile;
- opacità bassa;
- centrato geometricamente, non "a occhio" con offset hardcoded per singolo iPad.

Calcolare bounds e scala sulla dimensione reale del canvas.

---

## Evaluation: approccio tecnico consigliato

### Mask target

Renderizzare la lettera target su una surface offscreen piccola.

- background 0;
- target 255;
- stessa famiglia/font usata per la guida;
- padding sufficiente.

### Mask user

Renderizzare gli stroke in coordinate normalizzate sulla stessa surface.

Lo stroke di evaluation può essere più largo del solco visivo per introdurre tolleranza.

### Precision

Indicativamente:

```txt
user pixels inside tolerant target / all meaningful user pixels
```

### Coverage

Indicativamente:

```txt
target pixels covered by dilated user stroke / all meaningful target pixels
```

### Score

La formula può essere configurabile; evitare che una metrica ottima nasconda una metrica pessima.

Una combinazione semplice:

```js
score = 0.55 * coverage + 0.45 * precision;
```

ma richiedere comunque soglie minime individuali.

### Failure reasons tecnici

Possibili:

```txt
too_short
low_coverage
low_precision
low_score
```

Non mostrare questi codici al bambino.

---

## Fallback se offscreen Skia rende l'implementazione fragile

Claude deve privilegiare robustezza.

Se la lettura pixel offscreen risulta non stabile con la versione installata di Skia:

1. isolare l'evaluator dietro la stessa API;
2. implementare una prima versione geometrica basata su sampled points e hit zones;
3. documentare chiaramente il compromesso;
4. non fingere di aver implementato un confronto raster se non esiste.

Non introdurre una dipendenza OCR cloud come workaround.

---

## Expo Go vs development build

La v1 dovrebbe cercare di restare il più possibile nel mondo Expo/JS.

Per qualsiasi custom native module futuro, usare Expo Development Build / prebuild. Non modificare manualmente cartelle native generate senza una ragione documentata.

---

## Estensibilità futura

L'API di riconoscimento dovrebbe poter diventare:

```js
recognizer.evaluate({
  expected: "A",
  strokes,
  canvas,
});
```

Implementazioni future:

```txt
TargetMaskTraceRecognizer
PencilKitRecognizer
CoreMLRecognizer
```

La UI non deve conoscere quale recognizer è attivo.
