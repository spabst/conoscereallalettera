# Acceptance Criteria

Claude non deve considerare la feature completa finché questi criteri non sono verificati.

## Funzionali

- [ ] La schermata "Traccia le Lettere" continua ad aprirsi dal menu esistente.
- [ ] La lettera corrente è visibile come guida nella sabbia.
- [ ] Disegnare col dito produce un solco sabbia, non una semplice linea blu.
- [ ] Il tratto segue il dito senza lag evidente.
- [ ] Più stroke possono comporre la stessa lettera.
- [ ] "Ricomincia" pulisce tutti gli stroke.
- [ ] "Prossima" passa alla lettera successiva e pulisce il canvas.
- [ ] Il successo non dipende più da `pointCounter > 30`.
- [ ] Uno scribble lungo ma lontano dalla lettera non passa.
- [ ] Un tap o stroke molto corto non passa.
- [ ] Un tracing ragionevolmente corretto passa.
- [ ] Il sistema è tollerante a piccole deviazioni.
- [ ] Il feedback di successo include haptic.
- [ ] Gli haptic durante il disegno sono throttled e non vengono chiamati per ogni move event.
- [ ] Tutte le lettere esistenti rimangono navigabili.

## Visivi

- [ ] Background sabbia cartoon.
- [ ] Solco più scuro del background.
- [ ] Almeno un layer che suggerisce sabbia accumulata / bordo.
- [ ] Particelle limitate e non flickering.
- [ ] Nessun effetto fotorealistico pesante necessario.
- [ ] Guida lettera visibile ma non dominante.
- [ ] UI landscape senza overlap tra canvas, feedback e pulsanti.

## Performance

- [ ] Nessun React `setState` per ogni punto del touch path.
- [ ] Nessuna lista non limitata di `<Circle>` React per i granelli.
- [ ] Nessun `Date.now() + Math.random()` usato per rigenerare particelle ad ogni movimento.
- [ ] Evaluation non blocca percepibilmente la UI.
- [ ] Non vengono effettuate richieste di rete.
- [ ] Nessun warning/error ricorrente in console durante il tracing.

## Qualità codice

- [ ] Logica evaluator separata dalla screen.
- [ ] Config/soglie centralizzate.
- [ ] Nomi descrittivi.
- [ ] Nessun refactor non necessario delle altre due attività dell'app.
- [ ] README aggiornato per la nuova dipendenza e i comandi di avvio.
- [ ] Commenti usati per spiegare "perché", non per ripetere il codice.
- [ ] Nessun codice morto della vecchia implementazione SVG nella screen.
- [ ] `npm install` / lockfile coerenti.

## Test

- [ ] Test unitario per path length / normalization o utility equivalenti.
- [ ] Test evaluator: stroke vuoto.
- [ ] Test evaluator: stroke troppo corto.
- [ ] Test evaluator: caso chiaramente fuori target.
- [ ] Test evaluator: caso valido almeno su una lettera.
- [ ] Test evaluator deterministico.
- [ ] I test esistenti, se presenti, continuano a passare.

## Manual QA su iPad

Eseguire almeno:

1. A: tracing corretto.
2. A: scribble orizzontale casuale.
3. O: cerchio vicino alla guida.
4. O: cerchio molto distante.
5. I: singolo stroke breve.
6. M: più stroke.
7. Reset durante un tentativo.
8. Next dopo successo.
9. 30–60 secondi di scribble continuo per osservare performance/memoria.
