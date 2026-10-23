// Percorso montessoriano: dal concreto (materiale) all'astratto (solo cifre).
// Ogni abilità ha dei livelli (tier) crescenti; si sblocca quando i prerequisiti sono acquisiti.
// `material` di un tier indica se l'esercizio mostra il materiale o solo i simboli.

export const SKILLS = [
  {
    id: 'rods',
    title: 'Le aste numeriche',
    emoji: '📏',
    color: '#D64541',
    prereqs: [],
    tiers: [
      { label: 'Aste da 1 a 3', max: 3, material: true },
      { label: 'Aste da 1 a 5', max: 5, material: true },
      { label: 'Aste da 1 a 10', max: 10, material: true },
    ],
    parentInfo:
      'Il bambino riconosce le quantità da 1 a 10 come lunghezze: ogni asta è divisa in segmenti rossi e blu da contare.',
    homeTip:
      'Confrontate oggetti lunghi e corti (matite, cucchiai) e contateli insieme toccandoli uno alla volta.',
  },
  {
    id: 'digits',
    title: 'Le cifre smerigliate',
    emoji: '✍️',
    color: '#2E7D4F',
    prereqs: [],
    tiers: [
      { label: 'Cifre 1, 2, 3', group: [1, 2, 3], material: true },
      { label: 'Cifre 4, 5, 6', group: [4, 5, 6], material: true },
      { label: 'Cifre 7, 8, 9', group: [7, 8, 9], material: true },
      { label: 'Lo zero e tutte le cifre', group: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], material: false },
    ],
    parentInfo:
      'Lezione in tre tempi: prima si presenta la cifra (la si traccia col dito mentre la si nomina), poi si riconosce tra altre.',
    homeTip:
      'Tracciate le cifre nella sabbia, nella farina o sul vetro appannato dicendo il nome ad alta voce.',
  },
  {
    id: 'match',
    title: 'Numeri e quantità',
    emoji: '🔗',
    color: '#4A90E2',
    prereqs: ['rods', 'digits'],
    tiers: [
      { label: 'Asta → cifra (fino a 5)', max: 5, dir: 'q2s', show: 'rod', material: true },
      { label: 'Gettoni → cifra (fino a 10)', max: 10, dir: 'q2s', show: 'counters', material: true },
      { label: 'Cifra → asta (fino a 10)', max: 10, dir: 's2q', show: 'rod', material: true },
    ],
    parentInfo: 'Collega il simbolo (la cifra) alla quantità che rappresenta, in entrambe le direzioni.',
    homeTip: 'Chiedete "mi porti 4 mollette?" e poi fate scrivere o indicare il numero corrispondente.',
  },
  {
    id: 'spindles',
    title: 'I fuselli e lo zero',
    emoji: '🥢',
    color: '#C8955A',
    prereqs: ['match'],
    tiers: [
      { label: 'Da 0 a 4', max: 4, material: true },
      { label: 'Da 0 a 9', max: 9, material: true },
    ],
    parentInfo:
      'Il bambino crea la quantità da solo mettendo i fuselli nello scomparto. Lo scomparto dello zero resta vuoto: lo zero è "niente".',
    homeTip: 'Giocate a "mettine zero": ridete insieme quando la ciotola resta vuota, lo zero diventa concreto.',
  },
  {
    id: 'sequence',
    title: 'Prima e dopo',
    emoji: '🪜',
    color: '#9B59B6',
    prereqs: ['match'],
    tiers: [
      { label: 'Che numero viene dopo? (fino a 5)', max: 5, mode: 'after', material: true },
      { label: 'Prima e dopo (fino a 10)', max: 10, mode: 'mixed', material: true },
      { label: 'Il numero mancante', max: 10, mode: 'missing', material: false },
    ],
    parentInfo: 'Ordine della successione numerica: ogni numero è uno in più del precedente.',
    homeTip: 'Salite le scale contando i gradini, poi chiedete "che gradino viene dopo il 5?".',
  },
  {
    id: 'oddEven',
    title: 'Pari e dispari',
    emoji: '👫',
    color: '#E67E22',
    prereqs: ['spindles', 'sequence'],
    tiers: [
      { label: 'Gettoni in coppia (fino a 5)', max: 5, material: true },
      { label: 'Gettoni in coppia (fino a 10)', max: 10, material: true },
      { label: 'Solo la cifra', max: 10, material: false },
    ],
    parentInfo:
      'Con "cifre e gettoni" il bambino scopre che alcuni numeri si dividono in coppie (pari) e altri lasciano un gettone da solo (dispari).',
    homeTip: 'Mettete in fila calzini o scarpe a coppie: ne avanza uno da solo?',
  },
  {
    id: 'addition',
    title: 'Addizione fino a 10',
    emoji: '➕',
    color: '#27AE60',
    prereqs: ['spindles', 'sequence'],
    tiers: [
      { label: 'Unire le aste (fino a 5)', max: 5, show: 'rods', material: true },
      { label: 'Unire le aste (fino a 10)', max: 10, show: 'rods', material: true },
      { label: 'Con le perline (fino a 10)', max: 10, show: 'beads', material: true },
      { label: 'Solo cifre (fino a 10)', max: 10, show: 'none', material: false },
    ],
    parentInfo: 'Addizionare significa unire: prima si uniscono le aste e si conta, poi si passa ai soli numeri.',
    homeTip: 'Apparecchiando: "3 forchette e 2 forchette, quante sono?". Contate tutte insieme.',
  },
  {
    id: 'tenFriends',
    title: 'Gli amici del 10',
    emoji: '🔟',
    color: '#E0A526',
    prereqs: ['addition'],
    tiers: [
      { label: 'Completa la decina con le perline', material: true },
      { label: 'Completa la decina con i numeri', material: false },
    ],
    parentInfo: 'Le coppie che fanno 10 (7+3, 6+4…) sono la base per i calcoli oltre la decina.',
    homeTip: 'Usate le dita: "alzo 7 dita, quante ne mancano per avere tutte e dieci le dita alzate?".',
  },
  {
    id: 'subtraction',
    title: 'Sottrazione fino a 10',
    emoji: '➖',
    color: '#C0392B',
    prereqs: ['addition'],
    tiers: [
      { label: 'Togliere dalle aste (fino a 5)', max: 5, show: 'rods', material: true },
      { label: 'Togliere dalle aste (fino a 10)', max: 10, show: 'rods', material: true },
      { label: 'Togliere i gettoni (fino a 10)', max: 10, show: 'counters', material: true },
      { label: 'Solo cifre (fino a 10)', max: 10, show: 'none', material: false },
    ],
    parentInfo: 'Sottrarre significa togliere: si copre una parte della quantità e si conta ciò che resta.',
    homeTip: 'Con dei biscotti: "ne hai 6, ne mangi 2, quanti ne restano?". Toglieteli davvero dal piatto.',
  },
  {
    id: 'within20',
    title: 'Oltre il 10',
    emoji: '🌟',
    color: '#16A085',
    prereqs: ['tenFriends', 'subtraction'],
    tiers: [
      { label: 'Dieci più… (11-19)', mode: 'teen', material: true },
      { label: 'Addizioni oltre il 10', mode: 'add', material: true },
      { label: 'Sottrazioni dal 20', mode: 'sub', material: true },
      { label: 'Solo cifre fino a 20', mode: 'mixed', material: false },
    ],
    parentInfo:
      'Con la decina dorata e le perline colorate il bambino scopre che 13 è "dieci e tre" e impara a passare la decina.',
    homeTip: 'Fate mazzetti da 10 (cannucce, stecchini) e chiedete "un mazzetto e 4 sciolti, quanti sono?".',
  },
];

const BY_ID = Object.fromEntries(SKILLS.map((skill) => [skill.id, skill]));

export function getSkill(id) {
  return BY_ID[id];
}

export function lastTier(skill) {
  return skill.tiers.length - 1;
}
