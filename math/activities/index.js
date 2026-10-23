import NumberRods from './NumberRods';
import SandpaperDigit from './SandpaperDigit';
import DigitPick from './DigitPick';
import QuantityMatch from './QuantityMatch';
import Spindles from './Spindles';
import Sequence from './Sequence';
import OddEven from './OddEven';
import Operation from './Operation';
import TenFriends from './TenFriends';

// item.kind → componente che disegna l'esercizio
export const ACTIVITIES = {
  rods: NumberRods,
  digitTrace: SandpaperDigit,
  digitPick: DigitPick,
  matchQuantityToSymbol: QuantityMatch,
  matchSymbolToQuantity: QuantityMatch,
  spindles: Spindles,
  sequence: Sequence,
  oddEven: OddEven,
  operation: Operation,
  tenFriends: TenFriends,
};
