import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { colors, fonts, spacing, typography } from '../theme/colors';

const HEIGHT = 160;
const PADDING_Y = 16;

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

// Smooth line + gradient area fill, built on react-native-svg (renders as
// real SVG on web, native views on iOS/Android) so it needs no separate
// web implementation. One hue per chart - every point encodes the same
// measure across time, so color carries no extra identity here.
export default function LineChart({ data, color = colors.primary, formatValue = (v) => String(v), labelEvery = 1 }) {
  const [width, setWidth] = useState(0);
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

  const last = points[points.length - 1];
  // Only the endpoint gets a direct label (the current/most recent value) -
  // labeling every point would defeat the point of a smooth trend line.
  const labelAbove = last.y > 28;

  return (
    <View>
      <View style={{ height: HEIGHT, position: 'relative' }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
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
              {points.map((p, i) => (
                <Circle key={i} cx={p.x} cy={p.y} r={3} fill={colors.surface} stroke={color} strokeWidth={2} />
              ))}
            </Svg>
            <Text
              style={[
                styles.endpointLabel,
                {
                  left: Math.min(Math.max(last.x - 28, 0), width - 56),
                  top: labelAbove ? last.y - 24 : last.y + 8,
                  color,
                },
              ]}
            >
              {formatValue(data[data.length - 1].value)}
            </Text>
          </>
        )}
      </View>
      <View style={styles.labelsRow}>
        {data.map((d, i) => (
          (i % labelEvery === 0 || i === data.length - 1) ? (
            <Text key={d.label} style={styles.label} numberOfLines={1}>{d.label}</Text>
          ) : <View key={d.label} style={{ flex: 1 }} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  label: {
    ...typography.caption,
    fontFamily: fonts.medium,
    flex: 1,
    textAlign: 'center',
  },
  endpointLabel: {
    position: 'absolute',
    width: 56,
    textAlign: 'center',
    ...typography.caption,
    fontFamily: fonts.bold,
  },
  empty: {
    ...typography.body,
    color: colors.textMuted,
  },
});
