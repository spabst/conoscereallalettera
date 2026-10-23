import * as Speech from 'expo-speech';

const NUMBER_WORDS = [
  'zero', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove', 'dieci',
  'undici', 'dodici', 'tredici', 'quattordici', 'quindici', 'sedici', 'diciassette', 'diciotto',
  'diciannove', 'venti',
];

let enabled = true;

export function setSpeechEnabled(value) {
  enabled = value;
  if (!value) Speech.stop();
}

export function numberWord(n) {
  return NUMBER_WORDS[n] ?? String(n);
}

// "uno, due, tre"
export function countingWords(n) {
  return Array.from({ length: n }, (_, i) => numberWord(i + 1)).join(', ');
}

// Interrompe la frase precedente così il bambino sente sempre l'ultima consegna
export function speak(text) {
  if (!enabled || !text) return;
  Speech.stop();
  Speech.speak(text, { language: 'it-IT', rate: 0.85, pitch: 1.05 });
}

export function stopSpeaking() {
  Speech.stop();
}

// Articolo corretto davanti al numero: "lo zero", "l'otto", "il tre"
export function theNumber(n) {
  if (n === 0) return 'lo zero';
  if (n === 1 || n === 8 || n === 11) return `l'${numberWord(n)}`;
  return `il ${numberWord(n)}`;
}

// "dello zero", "dell'otto", "del tre"
export function ofNumber(n) {
  if (n === 0) return 'dello zero';
  if (n === 1 || n === 8 || n === 11) return `dell'${numberWord(n)}`;
  return `del ${numberWord(n)}`;
}
