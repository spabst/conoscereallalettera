# Opzionale / futuro — Handwriting Recognition nativo su iPadOS 27

> Questo documento NON fa parte della v1.

## Perché non serve alla v1

Nel tracing guidato l'app conosce già la lettera attesa.

Un recognizer generico prova a rispondere:
> "Che cosa ha scritto l'utente?"

La feature v1 deve rispondere:
> "Quanto bene il tratto segue la A che ho chiesto?"

La seconda domanda è più facile, più controllabile e più utile pedagogicamente.

---

## Quando PencilKit diventa interessante

Per una futura modalità:

- "Scrivi una lettera libera";
- nessuna guida;
- l'app identifica A/B/C/...;
- parole scritte a mano.

Su iPadOS 27 Apple espone `PKStrokeRecognizer` in PencilKit, con riconoscimento on-device.

Possibile architettura futura:

```txt
React Native / Skia
      |
      | strokes
      v
Expo Native Module (Swift)
      |
      v
PKDrawing / PencilKit representation
      |
      v
PKStrokeRecognizer
      |
      v
recognizedText
```

## Vincoli

- API iOS/iPadOS 27;
- al momento della stesura la documentazione Apple la indica come beta;
- richiede codice native Swift;
- Expo Go non è il target giusto per custom native code;
- servirebbe development build / prebuild;
- bisogna gestire availability e fallback.

## Design recommendation

Non accoppiare la screen direttamente a PencilKit.

Interfaccia futura:

```js
const result = await handwritingRecognizer.recognize({
  strokes,
  locale: 'it',
});
```

Così il riconoscitore native resta sostituibile.

## Privacy

Il valore principale di PencilKit per questa app è che il riconoscimento dichiarato da Apple è on-device. Nessun bisogno di inviare la scrittura di un bambino a un servizio cloud.

## Criterio per decidere se implementarlo

Implementarlo soltanto quando esiste una user story di **scrittura libera**.

Non introdurlo solo per validare il tracing guidato.
