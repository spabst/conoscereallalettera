// Materiali montessoriani disegnati con semplici View
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, beadColors } from '../theme';

// Asta numerica: n segmenti alternati rosso/blu. Gli ultimi `removed` segmenti appaiono tolti.
export function NumberRod({ n, unit = 48, height = 30, removed = 0, startIndex = 0 }) {
  return (
    <View style={styles.rodRow}>
      {Array.from({ length: n }, (_, i) => {
        const isRemoved = i >= n - removed;
        return (
          <View
            key={i}
            style={[
              {
                width: unit,
                height,
                backgroundColor: (i + startIndex) % 2 === 0 ? colors.rodRed : colors.rodBlue,
              },
              i === 0 && styles.rodStart,
              i === n - 1 && styles.rodEnd,
              isRemoved && styles.removed,
            ]}
          >
            {isRemoved && <View style={styles.crossLine} />}
          </View>
        );
      })}
    </View>
  );
}

function Bead({ size, color, crossed }) {
  return (
    <View
      style={[
        styles.bead,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        color === beadColors[7] && styles.beadOutline,
        crossed && styles.removed,
      ]}
    >
      {crossed && <View style={styles.crossLine} />}
    </View>
  );
}

// Barretta di perline colorate (scala di perline); 10 = decina dorata
export function BeadBar({ n, size = 30, removed = 0 }) {
  return (
    <View style={styles.beadBar}>
      <View style={styles.wire} />
      {Array.from({ length: n }, (_, i) => (
        <Bead key={i} size={size} color={beadColors[n]} crossed={i >= n - removed} />
      ))}
    </View>
  );
}

// Gettoni rossi. layout 'pairs': in coppie una sotto l'altra, come in "cifre e gettoni"
export function Counters({ n, size = 44, removed = 0, layout = 'rows', perRow = 5 }) {
  const items = Array.from({ length: n }, (_, i) => i);
  if (layout === 'pairs') {
    const columns = [];
    for (let i = 0; i < n; i += 2) columns.push(items.slice(i, i + 2));
    return (
      <View style={styles.pairs}>
        {columns.map((col, c) => (
          <View key={c} style={styles.pairColumn}>
            {col.map((i) => (
              <Bead key={i} size={size} color={colors.counter} crossed={i >= n - removed} />
            ))}
          </View>
        ))}
      </View>
    );
  }
  const rows = [];
  for (let i = 0; i < n; i += perRow) rows.push(items.slice(i, i + perRow));
  return (
    <View style={styles.counterRows}>
      {rows.map((row, r) => (
        <View key={r} style={styles.counterRow}>
          {row.map((i) => (
            <Bead key={i} size={size} color={colors.counter} crossed={i >= n - removed} />
          ))}
        </View>
      ))}
    </View>
  );
}

// Una o più cornici da 10 (2 file da 5). `groups` riempie i posti in ordine:
// [{ count: 7, color }, { count: 3, color, crossed: true }]
export function TenFrames({ groups, frames = 1, size = 42 }) {
  const slots = [];
  for (const g of groups) {
    for (let i = 0; i < g.count; i++) slots.push(g);
  }
  return (
    <View style={styles.frames}>
      {Array.from({ length: frames }, (_, f) => (
        <View key={f} style={styles.frame}>
          {[0, 1].map((row) => (
            <View key={row} style={styles.frameRow}>
              {Array.from({ length: 5 }, (_, col) => {
                const g = slots[f * 10 + row * 5 + col];
                return (
                  <View key={col} style={[styles.slot, { width: size + 10, height: size + 10 }]}>
                    {g && <Bead size={size} color={g.color} crossed={g.crossed} />}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export function Spindle({ height = 80 }) {
  return <View style={[styles.spindle, { height }]} />;
}

const styles = StyleSheet.create({
  rodRow: {
    flexDirection: 'row',
  },
  rodStart: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  rodEnd: {
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  removed: {
    opacity: 0.25,
  },
  crossLine: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    top: '45%',
    height: 4,
    backgroundColor: colors.text,
    transform: [{ rotate: '-30deg' }],
  },
  bead: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 1,
  },
  beadOutline: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
  },
  beadBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wire: {
    position: 'absolute',
    left: -6,
    right: -6,
    height: 3,
    backgroundColor: '#95A5A6',
  },
  pairs: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'flex-start',
  },
  pairColumn: {
    gap: 10,
  },
  counterRows: {
    gap: 10,
  },
  counterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  frames: {
    flexDirection: 'row',
    gap: 20,
  },
  frame: {
    borderWidth: 3,
    borderColor: colors.text,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  frameRow: {
    flexDirection: 'row',
  },
  slot: {
    borderWidth: 1,
    borderColor: '#D5DBDB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spindle: {
    width: 12,
    borderRadius: 6,
    backgroundColor: colors.spindle,
    borderWidth: 1,
    borderColor: '#A0703A',
  },
});
