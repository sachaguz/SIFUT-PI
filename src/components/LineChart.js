import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';
import { colors, fonts, radius, spacing, typography } from '../theme/colors';

const HEIGHT = 160;
const PADDING_Y = 16;
const LABEL_WIDTH = 56;
const isWeb = Platform.OS === 'web';

function buildSmoothPath(points) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midX = (p0.x + p1.x) / 2;
    const midY = (p0.y + p1.y) / 2;
    d += ` Q ${p0.x} ${p0.y} ${midX} ${midY}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

function clampLeft(x, width) {
  return Math.min(Math.max(x - LABEL_WIDTH / 2, 0), Math.max(width - LABEL_WIDTH, 0));
}

// Smooth line + gradient area fill, built on react-native-svg (renders as
// real SVG on web, native views on iOS/Android) so it needs no separate
// web implementation. One hue per chart - every point encodes the same
// measure across time, so color carries no extra identity here.
export default function LineChart({ data, color = colors.primary, formatValue = (v) => String(v), labelEvery = 1 }) {
  const [width, setWidth] = useState(0);
  const [hoverIndex, setHoverIndex] = useState(null);
  const gradientId = `lineFill-${color.replace('#', '')}`;

  if (data.length === 0) {
    return <Text style={styles.empty}>Sin datos para este rango.</Text>;
  }

  const values = data.map((d) => d.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const points = data.map((d, i) => ({
    x: data.length > 1 ? (i / (data.length - 1)) * width : width / 2,
    y: PADDING_Y + (1 - (d.value - min) / range) * (HEIGHT - PADDING_Y * 2),
  }));

  const linePath = buildSmoothPath(points);
  const areaPath = width > 0
    ? `${linePath} L ${points[points.length - 1].x} ${HEIGHT} L ${points[0].x} ${HEIGHT} Z`
    : '';

  const activeIndex = hoverIndex ?? data.length - 1;
  const active = points[activeIndex];
  // Above the point unless that would clip off the top of the chart.
  const tooltipAbove = active.y > 32;

  const handleMove = (evt) => {
    if (!width) return;
    const x = evt.nativeEvent.locationX ?? evt.nativeEvent.offsetX;
    if (x == null) return;
    const index = Math.round((x / width) * (data.length - 1));
    setHoverIndex(Math.min(Math.max(index, 0), data.length - 1));
  };

  return (
    <View>
      <View
        style={{ height: HEIGHT, position: 'relative' }}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        {...(isWeb ? { onMouseMove: handleMove, onMouseLeave: () => setHoverIndex(null) } : {})}
      >
        {width > 0 && (
          <>
            <Svg width={width} height={HEIGHT}>
              <Defs>
                <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={color} stopOpacity={0.25} />
                  <Stop offset="1" stopColor={color} stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <Path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
              <Path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              {hoverIndex !== null && (
                <Line x1={active.x} y1={0} x2={active.x} y2={HEIGHT} stroke={colors.border} strokeWidth={1} />
              )}
              {points.map((p, i) => (
                <Circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={i === activeIndex ? 4.5 : 3}
                  fill={colors.surface}
                  stroke={color}
                  strokeWidth={i === activeIndex ? 2.5 : 2}
                />
              ))}
            </Svg>
            <View
              pointerEvents="none"
              style={[
                styles.tooltip,
                {
                  left: clampLeft(active.x, width),
                  top: tooltipAbove ? active.y - 40 : active.y + 10,
                },
              ]}
            >
              <Text style={[styles.tooltipValue, { color }]} numberOfLines={1}>
                {formatValue(data[activeIndex].value)}
              </Text>
              <Text style={styles.tooltipLabel} numberOfLines={1}>{data[activeIndex].label}</Text>
            </View>
          </>
        )}
      </View>
      <View style={{ height: 16 }}>
        {data.map((d, i) => {
          const isLast = i === data.length - 1;
          const isRegular = i % labelEvery === 0;
          if (!isRegular && !isLast) return null;
          // Skip a "regular" tick if it would nearly collide with the
          // final label right after it.
          if (isRegular && !isLast && data.length - 1 - i <= labelEvery / 2) return null;
          return (
            <Text
              key={d.label}
              numberOfLines={1}
              style={[styles.label, { left: clampLeft(points[i].x, width) }]}
            >
              {d.label}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    position: 'absolute',
    width: LABEL_WIDTH,
    ...typography.caption,
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  tooltip: {
    position: 'absolute',
    width: LABEL_WIDTH,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tooltipValue: {
    ...typography.caption,
    fontFamily: fonts.bold,
  },
  tooltipLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
  empty: {
    ...typography.body,
    color: colors.textMuted,
  },
});
