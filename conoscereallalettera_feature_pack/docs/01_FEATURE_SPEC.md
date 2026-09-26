# Feature Spec — Traccia la lettera nella sabbia

## 1. User story

Come bambino che sta imparando le lettere,
voglio seguire con il dito una grande lettera disegnata sulla sabbia,
così da ricevere un feedback visivo, tattile e positivo mentre imparo il gesto grafico.

Come genitore / educatore,
voglio che l'app distingua tra un tracciato ragionevolmente corretto e uno casuale,
senza penalizzare piccole imprecisioni naturali di un bambino.

---

## 2. Esperienza desiderata

La schermata mostra una superficie di sabbia calda e cartoon.

Al centro compare una grande lettera target, inizialmente come guida delicata. Quando il bambino trascina il dito:

- la sabbia sembra scavarsi;
- appare un solco leggermente più scuro;
- sui bordi del solco si accumula sabbia più chiara;
- piccoli granelli compaiono in modo controllato;
- l'effetto deve sembrare illustrato/cartoon, non fotorealistico;
- la risposta al gesto deve essere immediata.

Al termine del tentativo l'app valuta il tracciato.

### Successo

Se il tracciato è sufficientemente vicino alla lettera e ne copre una parte adeguata:

- haptic di successo;
- messaggio breve e positivo;
- piccola celebrazione non invasiva;
- pulsante / possibilità di passare alla lettera successiva.

### Tentativo da riprovare

Se il tracciato è molto incompleto o fuori bersaglio:

- niente messaggi negativi;
- messaggio neutro e incoraggiante, per esempio "Quasi! Segui ancora la lettera";
- nessuna penalità o punteggio rosso;
- possibilità immediata di riprovare o continuare il disegno.

---

## 3. Scope v1

### Incluso

- iPad landscape come dispositivo principale.
- Touch con dito.
- Apple Pencil trattato come pointer/touch compatibile.
- React Native Skia per il rendering del canvas.
- Effetto sabbia cartoon.
- Collezione di stroke come dati vettoriali.
- Guida della lettera renderizzata nel canvas.
- Valutazione target-aware del tracing.
- Pulsante reset / ricomincia.
- Pulsante lettera successiva.
- Haptic throttled.
- Supporto alle lettere già presenti nell'app:
  `A B C D E F G H I L M N O P Q R S T U V Z`.
- Nessuna rete necessaria.
- Nessun dato del bambino inviato fuori dal device.
- Funzionamento offline.

### Non incluso

- Riconoscimento di parole.
- Modalità libera "indovina cosa ho scritto".
- Classificatore ML custom.
- Account / analytics.
- Backend.
- Salvataggio storico.
- Riconoscimento PencilKit iOS 27.
- Migrazione completa del repository a TypeScript.
- Android pixel-perfect parity come blocker della v1.

---

## 4. Vincoli UX

L'esperienza è per bambini piccoli.

Pertanto:

- target touch grandi;
- nessun controllo piccolo vicino ai bordi;
- testo minimo;
- niente errori aggressivi;
- nessun timer;
- nessun punteggio numerico mostrato al bambino;
- niente confetti continui che distraggano dal gesto;
- il feedback tecnico può esistere solo in development mode.

La lettera target deve occupare circa il 45–60% dell'altezza utile del canvas, adattandosi all'iPad.

---

## 5. Visual design del canvas

### Background

Base sabbia con:

- colore caldo chiaro;
- noise / granelli a bassa opacità;
- leggere variazioni tonali;
- pattern deterministico o precomputato, per evitare flickering.

### Stroke sabbia

Renderizzare lo stesso path con più layer:

1. **ombra morbida del solco**
   - più larga;
   - marrone tenue;
   - blur leggero.

2. **solco**
   - marrone sabbia più scuro;
   - larghezza principale;
   - estremità e join arrotondati.

3. **bordo/rim chiaro**
   - piccole particelle o segmenti laterali;
   - deve sembrare sabbia spostata.

4. **granelli**
   - pochi;
   - dimensione variabile;
   - posizione deterministica rispetto ai punti dello stroke;
   - non creare migliaia di React component.

Il canvas deve restare leggibile: l'effetto è "sabbia cartoon", non una simulazione fisica.

---

## 6. Dati dello stroke

Ogni stroke deve mantenere almeno:

```js
{
  id: string,
  points: [
    {
      x: number,
      y: number,
      t: number,
      pressure?: number
    }
  ]
}
```

Coordinate in spazio locale del canvas.

Non aggiornare React state ad ogni singolo evento touch se questo causa re-render della schermata.

Al termine dello stroke, consolidare i dati necessari per la valutazione.

---

## 7. Validazione del tracing

### Principio

La lettera target è nota.

Non chiedere "che lettera è questa?".
Chiedere invece:

> "Il disegno effettuato segue abbastanza bene la forma della lettera target?"

### Metriche minime

Il recognizer deve calcolare almeno:

- `coverage`: quanta parte utile della lettera è stata coperta;
- `precision`: quanta parte del disegno è vicina alla lettera;
- `drawnLength`: evita successi causati da un tap o tratto minuscolo;
- `score`: combinazione interna delle metriche.

Esempio di result:

```js
{
  target: "A",
  coverage: 0.74,
  precision: 0.86,
  score: 0.79,
  success: true,
  reason: "passed"
}
```

Il valore numerico non viene mostrato al bambino.

### Tolleranza

Il sistema deve essere volutamente tollerante:

- un bambino non segue un centroline perfetto;
- il tratto può uscire leggermente dalla guida;
- ordine degli stroke non obbligatorio in v1;
- direzione dello stroke non obbligatoria in v1.

### Strategia consigliata

Usare una rappresentazione raster ridotta, per esempio 256×256:

1. renderizzare la lettera target in una mask;
2. renderizzare gli stroke utente in una seconda mask;
3. creare una versione tollerante/dilatata della target mask;
4. calcolare overlap, coverage e precision;
5. applicare soglie configurabili.

La guida visiva e la mask di validazione devono derivare dalla **stessa forma/font**, così non possono divergere.

Non usare screenshot dell'intera UI.

---

## 8. Configurazione

Centralizzare valori regolabili:

```js
export const TRACE_CONFIG = {
  evaluationSize: 256,
  success: {
    minCoverage: 0.58,
    minPrecision: 0.72,
    minNormalizedLength: 0.35,
    minScore: 0.66,
  },
  visual: {
    baseStrokeWidth: 34,
    grooveWidth: 24,
    rimWidth: 38,
  },
};
```

I numeri sono valori iniziali da calibrare, non verità assolute.

Evitare magic numbers sparsi nei componenti.

---

## 9. Stati della schermata

Minimo:

```txt
idle
drawing
evaluating
success
retry
```

L'evaluation deve essere breve e non bloccare il rendering.

Se l'utente continua a disegnare dopo un tentativo `retry`, l'app deve poter rivalutare l'insieme dei tratti.

---

## 10. Accessibilità e privacy

- Nessuna dipendenza da cloud.
- Nessun upload dei tratti.
- Label accessibili per i pulsanti.
- Non basarsi solo sul colore per comunicare successo.
- Rispettare Safe Area.
- L'app deve poter funzionare senza Apple Pencil.
