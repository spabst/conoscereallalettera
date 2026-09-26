# Test Plan

## 1. Test automatici

La parte di scoring deve essere testabile senza UI.

### Utility

#### path length
Input con 2–3 punti noti → lunghezza attesa con tolleranza floating point.

#### normalize points
Input in un rettangolo noto → coordinate normalizzate nel range atteso.

#### resampling
Se implementato:
- numero punti stabile;
- ordine mantenuto;
- endpoint mantenuti.

#### deterministic particles / seed
Lo stesso stroke deve generare lo stesso risultato.

---

## 2. Evaluator

Evitare fixture che dipendono da casualità.

### Caso vuoto

```txt
strokes = []
success = false
reason = too_short / empty
```

### Caso troppo corto

Uno stroke di pochi pixel all'interno della A non può passare.

### Caso scribble fuori target

Stroke lungo nel margine alto del canvas:
- precision bassa;
- success false.

### Caso incompleto

Segue solo una piccola parte della lettera:
- precision può essere alta;
- coverage deve restare insufficiente;
- success false.

Questo test è importante per evitare che un singolo tratto ben posizionato venga considerato lettera completa.

### Caso plausibile

Fixture costruita in modo da seguire la lettera / target representation:
- coverage sopra threshold;
- precision sopra threshold;
- success true.

### Robustezza

Aggiungere piccole deviazioni alla fixture valida:
- il risultato deve rimanere valido entro la tolleranza prevista.

---

## 3. Component/manual behavior

### Input

- finger;
- Pencil se disponibile;
- touch start / move / end;
- touch cancel;
- più stroke.

### Navigation

- back;
- next;
- reset;
- next dopo success;
- back durante retry.

### Rotation

L'app è landscape; verificare che un layout change non lasci coordinate stale.

---

## 4. Performance QA

Su iPad fisico:

1. entra in tracing;
2. scribble continuo per 30 secondi;
3. crea almeno 20 stroke;
4. osserva:
   - lag;
   - freeze;
   - crescita incontrollata di particelle;
   - warning;
   - haptic eccessivo.

Successivamente reset:
- memoria visuale deve liberarsi;
- canvas torna pulito;
- nessun vecchio stroke resta nella evaluation.

---

## 5. Calibration session

Le soglie non vanno calibrate solo con un adulto.

Fare una piccola sessione empirica con tracing volutamente:
- preciso;
- medio;
- molto impreciso;
- scribble casuale.

Registrare in development mode:
- coverage;
- precision;
- score;
- length.

Aggiustare `traceConfig.js`.

Non introdurre soglie diverse per ogni lettera a meno che dati reali mostrino la necessità.

Se alcune lettere risultano sistematicamente più difficili (es. I vs M), preferire prima una normalizzazione migliore.

---

## 6. Definition of done

Feature pronta quando:

- test automatici verdi;
- Expo avvia senza errori;
- almeno un test su iPad fisico completato;
- A, O, M provate manualmente;
- scribble casuale non passa;
- tracing ragionevole passa;
- reset funziona;
- no regression evidente nelle altre screen.
