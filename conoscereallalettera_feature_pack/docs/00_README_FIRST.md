# Conoscere alla Lettera — Sand Tracing Feature Pack

Questo pacchetto serve per dare a Claude Code / Claude in VS Code una specifica molto precisa per implementare la nuova esperienza **“traccia la lettera nella sabbia”** nel repository:

`https://github.com/spabst/conoscereallalettera`

## Obiettivo

Sostituire l'attuale esperienza di tracing, che disegna una linea SVG blu e considera riuscito il tentativo in base al numero di punti, con una feature iPad-first composta da:

1. canvas con **effetto sabbia cartoon**;
2. rendering fluido del solco sotto dito / Apple Pencil;
3. guida visiva della lettera;
4. valutazione reale del tracciato;
5. feedback positivo e adatto a bambini;
6. architettura pronta per un riconoscitore nativo iOS in futuro.

## Decisione fondamentale

Per la prima versione **non usare OCR per validare il tracing**.

L'app conosce già la lettera richiesta. È quindi più affidabile confrontare geometricamente il tratto del bambino con la forma target. Questo permette di distinguere:

- copertura della lettera;
- precisione del tratto;
- eccesso di disegno fuori dalla lettera;
- quantità minima di tratto.

L'OCR / handwriting recognition rimane un'estensione opzionale per una futura modalità di scrittura libera.

## Stato del repository analizzato

Al momento della preparazione di questo pacchetto il progetto:

- usa Expo ~57;
- usa React Native 0.86.3 e React 19.2.3;
- è scritto prevalentemente in JavaScript;
- usa `react-native-svg` per il tracing;
- usa `expo-haptics`;
- usa `react-native-gesture-handler`;
- è landscape e supporta tablet;
- contiene `screens/LetterTraceScreen.js`;
- considera un tentativo riuscito quando `pointCounter.current > 30`.

La nuova implementazione deve mantenere il progetto semplice e non effettuare una migrazione generale a TypeScript.

## Ordine consigliato per Claude

Usare prima `04_CLAUDE_MASTER_PROMPT.md`.

Se Claude tende a fare modifiche troppo grandi o perde il contesto, usare invece i prompt sequenziali in `05_CLAUDE_PROMPT_SEQUENCE.md`, uno alla volta.

Prima di iniziare l'implementazione, Claude deve leggere:

1. `01_FEATURE_SPEC.md`
2. `02_ARCHITECTURE.md`
3. `03_ACCEPTANCE_CRITERIA.md`
4. `06_TEST_PLAN.md`

Il documento `07_OPTIONAL_IOS27_HANDWRITING.md` è deliberatamente **fuori scope per la v1**.
