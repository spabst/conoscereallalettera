import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { colors, shadow } from '../../theme';

const POINTS_TO_COMPLETE = 30;

// Presentazione (primo tempo della lezione): il bambino ripassa col dito la cifra smerigliata
export default function SandpaperDigit({ item, onChoose, feedback }) {
  const [paths, setPaths] = useState([]);
  const [current, setCurrent] = useState('');
  const [size, setSize] = useState({ width: 0, height: 0 });
  const points = useRef(0);
  const done = useRef(false);
  const drawing = useRef(false);

  const onStart = (e) => {
    const { locationX, locationY } = e.nativeEvent;
    drawing.current = true;
    setCurrent(`M ${locationX} ${locationY}`);
  };

  const onMove = (e) => {
    if (!drawing.current) return;
    const { locationX, locationY } = e.nativeEvent;
    setCurrent((prev) => `${prev} L ${locationX} ${locationY}`);
    points.current += 1;
    if (points.current % 6 === 0) Haptics.selectionAsync();
  };

  const onEnd = () => {
    drawing.current = false;
    if (current) setPaths((prev) => [...prev, current]);
    setCurrent('');
    if (!done.current && !feedback.locked && points.current > POINTS_TO_COMPLETE) {
      done.current = true;
      onChoose(item.answer);
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={styles.board}
        onLayout={(e) => setSize(e.nativeEvent.layout)}
        onTouchStart={onStart}
        onTouchMove={onMove}
        onTouchEnd={onEnd}
        onTouchCancel={onEnd}
      >
        <View pointerEvents="none">
          <Text style={styles.digit}>{item.answer}</Text>
        </View>
        <Svg width={size.width} height={size.height} style={StyleSheet.absoluteFill} pointerEvents="none">
          {[...paths, current].filter(Boolean).map((d, i) => (
            <Path key={i} d={d} stroke={colors.orange} strokeWidth={14} strokeOpacity={0.7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    width: 300,
    height: 360,
    borderRadius: 24,
    backgroundColor: colors.sandpaperBoard,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadow,
  },
  digit: {
    fontSize: 300,
    lineHeight: 340,
    fontWeight: 'bold',
    color: colors.sandpaper,
  },
});
