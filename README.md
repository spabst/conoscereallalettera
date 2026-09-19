# Impariamo a Leggere 📚

App educativa Montessoriana per bambini in età prescolare/scolare, pensata per iPad.

## Caratteristiche

L'app include **3 esercizi interattivi** con feedback aptico:

### 1. Traccia le Lettere 🖊️
- Il bambino traccia le lettere con il dito
- Feedback aptico (vibrazione) mentre disegna
- Puntini colorati che appaiono durante il tracciamento
- Rinforzo positivo quando completa la lettera

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
- Node.js (v14 o superiore)
- npm o yarn
- Expo Go app sull'iPad ([scarica dall'App Store](https://apps.apple.com/app/expo-go/id982107779))

### Setup del progetto

1. **Installa le dipendenze:**
```bash
npm install
```

2. **Avvia il progetto:**
```bash
npm start
```

3. **Apri sull'iPad:**
   - Apri l'app Expo Go sull'iPad
   - Scansiona il QR code che appare nel terminale
   - L'app si caricherà automaticamente!

## Comandi disponibili

```bash
npm start       # Avvia Expo
npm run ios     # Avvia su simulatore iOS
npm run android # Avvia su simulatore Android
```

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

## Tecnologie utilizzate

- **React Native** - Framework per app mobile
- **Expo** - Piattaforma di sviluppo
- **Expo Haptics** - Feedback aptico
- **React Navigation** - Navigazione tra schermate
- **React Native Gesture Handler** - Gestione touch e gesti
- **React Native SVG** - Disegno vettoriale

## Personalizzazione

### Aggiungere nuove lettere
Modifica l'array `LETTERS` in `screens/LetterTraceScreen.js`

### Aggiungere nuove parole
Modifica l'array `PAIRS` in `screens/ImageMatchScreen.js` o `WORDS` in `screens/WordBuildScreen.js`

### Modificare i colori
I colori principali sono definiti negli stili di ogni schermata:
- Blu: `#4A90E2`
- Verde: `#50C878`
- Arancione: `#F39C12`
- Rosso: `#E74C3C`

## Note pedagogiche

L'app segue i principi Montessoriani:
- **Auto-correzione**: il bambino riceve feedback immediato
- **Apprendimento multisensoriale**: vista, tatto e feedback aptico
- **Progressione graduale**: da tracciare lettere a comporre parole
- **Rinforzo positivo**: celebrazione dei successi

## Licenza

Creato per uso personale educativo.

---

Buon divertimento nell'insegnamento! 🌟
