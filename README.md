# Impariamo a Leggere 📚

App educativa Montessoriana per bambini in età prescolare/scolare, pensata per iPad.

## Caratteristiche

L'app include **3 esercizi interattivi** con feedback aptico:

### 1. Traccia le Lettere 🖊️
- **Effetto sabbia cartoon**: Il bambino traccia le lettere creando un solco realistico nella sabbia
- Rendering GPU accelerato con React Native Skia
- **Valutazione geometrica intelligente**: L'app verifica che il tracciato segua realmente la lettera target
- Multi-stroke support: le lettere complesse (A, M, N) possono essere composte con più tratti
- Feedback visivo immediato senza penalizzazioni
- Haptic feedback solo al successo
- Supporta 21 lettere: A B C D E F G H I L M N O P Q R S T U V Z

### 2. Associa le Immagini 🎨
- Riconosce la lettera iniziale di parole comuni
- Abbina lettere a parole con emoji (A=Ape 🐝, G=Gatto 🐱, ecc.)
- Sistema di punteggio per motivare
- Feedback immediato con suoni aptici

### 3. Componi le Parole 🔤
- Trascina le lettere nell'ordine giusto
- Forma parole semplici (CANE, GATTO, MELA, ecc.)
- Lettere mescolate per ogni parola
- Pulsante per ricominciare se sbaglia

## Installazione

### Prerequisiti
- Node.js (v18 o superiore)
- npm
- Xcode (per iOS) o Android Studio (per Android)

### Setup del progetto

1. **Installa le dipendenze:**
```bash
npm install
```

2. **Avvia il progetto:**

**IMPORTANTE**: L'esercizio "Traccia le Lettere" utilizza React Native Skia che richiede codice nativo. Non può essere eseguito in Expo Go.

```bash
# Per iOS
npm run ios

# Per Android
npm run android
```

Il comando `npm run ios` o `npm run android` compila automaticamente il codice nativo necessario e avvia l'app sul simulatore o dispositivo connesso.

### Prima esecuzione

La prima volta potrebbe richiedere alcuni minuti per:
- Installare le dipendenze native (CocoaPods per iOS)
- Compilare il progetto
- Avviare il simulatore/dispositivo

## Comandi disponibili

```bash
npm start       # Avvia Metro bundler
npm run ios     # Compila e avvia su iOS
npm run android # Compila e avvia su Android
npm test        # Esegue i test unitari
```

## Testing

L'app include test unitari per la logica di valutazione del tracing:

```bash
npm test
```

I test verificano:
- Calcolo della lunghezza del tracciato
- Distanza punto-segmento
- Normalizzazione dei punti
- Valutazione coverage e precision
- Comportamento deterministico

## Build per produzione

Per creare una build da installare sull'iPad:

```bash
# Installa EAS CLI
npm install -g eas-cli

# Login ad Expo
eas login

# Build per iOS
eas build --platform ios
```

## Architettura tecnica

### Tracciamento lettere

L'esercizio di tracciamento utilizza un'architettura a strati:

**Rendering (React Native Skia)**:
- `SandBackground.js`: Texture sabbia con gradiente e noise
- `SandStroke.js`: Rendering multi-layer del solco (ombra, groove, rim, particelle)
- `SandTraceCanvas.js`: Canvas Skia con gesture handling

**Valutazione (Pure JavaScript)**:
- `letterTargets.js`: Geometria vettoriale normalizzata per ogni lettera
- `strokeUtils.js`: Utility geometriche (lunghezza path, distanza punto-segmento, resampling)
- `traceEvaluator.js`: Valutazione target-aware basata su coverage e precision
- `traceConfig.js`: Configurazione centralizzata delle soglie

**Principio chiave**: Nessuna chiamata a React setState durante il disegno. I punti live sono accumulati in shared values Reanimated, e committati a React state solo al completamento dello stroke.

### Valutazione geometrica

L'app NON usa OCR. Utilizza confronto geometrico diretto:
1. La lettera target è già nota
2. Target e user stroke vengono ricampionati uniformemente
3. Si calcola:
   - **Coverage**: frazione del target coperta dagli stroke utente
   - **Precision**: frazione degli stroke utente vicini al target
   - **Normalized length**: check di sanità per evitare successi con tap singoli
4. Il successo richiede il superamento di tutte le soglie indipendenti

Questo approccio è:
- Deterministico e testabile
- Veloce (nessuna rete, nessun ML)
- Tollerante alle deviazioni naturali dei bambini
- Privato (tutto on-device)

## Tecnologie utilizzate

- **React Native 0.86.3** - Framework per app mobile
- **React 19.2.3** - UI framework
- **Expo SDK 57** - Piattaforma di sviluppo
- **React Native Skia 2.6.2** - Rendering GPU accelerato
- **React Native Reanimated 4.5.1** - Animazioni e shared values
- **React Native Gesture Handler 2.32.0** - Gestione touch e gesti
- **Expo Haptics** - Feedback aptico
- **React Navigation** - Navigazione tra schermate
- **Jest** - Testing framework

## Personalizzazione

### Aggiungere nuove lettere

Le lettere sono definite come geometria vettoriale in `features/tracing/letterTargets.js`. Per aggiungere una nuova lettera:

1. Definisci la geometria normalizzata (coordinate 0..1)
2. La lettera verrà automaticamente inclusa nell'array `SUPPORTED_LETTERS`
3. L'app la renderà e valuterà automaticamente

### Calibrare le soglie di valutazione

Modifica `features/tracing/traceConfig.js`:

```javascript
evaluation: {
  minCoverage: 0.58,      // Frazione minima del target coperta
  minPrecision: 0.72,     // Frazione minima dello stroke vicino al target
  minNormalizedLength: 0.35, // Lunghezza minima relativa
  minScore: 0.66,         // Score combinato minimo
  tolerancePixels: 12,    // Distanza di tolleranza in pixel
}
```

Durante lo sviluppo, le metriche sono visibili in modalità `__DEV__` nella parte superiore sinistra dello schermo.

### Modificare l'aspetto visivo della sabbia

Modifica `features/tracing/traceConfig.js` nella sezione `visual`:

```javascript
visual: {
  sandBaseColor: '#D4A574',
  sandDarkColor: '#8B6F47',
  sandLightColor: '#E8C9A0',
  baseStrokeWidth: 34,
  grooveWidth: 24,
  // ...
}
```

## Note pedagogiche

L'app segue i principi Montessoriani:
- **Auto-correzione**: il bambino riceve feedback immediato
- **Apprendimento multisensoriale**: vista, tatto e feedback aptico
- **Progressione graduale**: da tracciare lettere a comporre parole
- **Rinforzo positivo**: celebrazione dei successi, nessun messaggio negativo
- **Libertà di esplorare**: il bambino può aggiungere più stroke senza limite
- **Controllo esplicito**: pulsante "Ricomincia" chiaro per ripartire

## Sviluppo

### Struttura del progetto

```
kids-learn/
├── screens/              # Schermate principali
│   ├── MenuScreen.js
│   ├── LetterTraceScreen.js
│   ├── ImageMatchScreen.js
│   └── WordBuildScreen.js
├── components/
│   └── sand/            # Componenti rendering sabbia
│       ├── SandBackground.js
│       ├── SandStroke.js
│       └── SandTraceCanvas.js
├── features/
│   └── tracing/         # Logica valutazione
│       ├── letterTargets.js
│       ├── strokeUtils.js
│       ├── traceEvaluator.js
│       └── traceConfig.js
└── __tests__/
    └── tracing/         # Test unitari
        ├── strokeUtils.test.js
        └── traceEvaluator.test.js
```

### Debug in sviluppo

In modalità `__DEV__`, dopo ogni stroke completato vengono mostrati:
- Coverage %
- Precision %
- Score %
- Normalized length %
- User samples / Target samples

Questi valori aiutano a calibrare le soglie in `traceConfig.js`.

## Requisiti iPad QA

I seguenti aspetti richiedono test su dispositivo fisico:

- Performance del rendering durante disegno prolungato (30+ strokes)
- Responsività del touch su lettere diverse
- Calibrazione soglie con tracciati reali di bambini
- Comportamento con Apple Pencil
- Verifica che il tracciato appaia sotto il dito senza lag visibile

## Licenza

Creato per uso personale educativo.

---

Buon divertimento nell'insegnamento! 🌟
