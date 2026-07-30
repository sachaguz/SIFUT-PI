import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing, typography } from '../theme/colors';

// Plain-View bar chart (no react-native-svg dependency) so it renders
// identically on native and web. One hue per chart since every bar
// encodes the same measure across categories - magnitude, not identity.
export default function BarChart({ data, color = colors.primary, formatValue = (v) => String(v) }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  if (data.length === 0) {
    return <Text style={styles.empty}>Sin datos para este rango.</Text>;
  }

  return (
    <View>
      {data.map((d) => (
        <View key={d.label} style={styles.row}>
          <Text style={styles.label} numberOfLines={1}>{d.label}</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.max((d.value / max) * 100, 3)}%`, backgroundColor: color }]} />
          </View>
          <Text style={styles.value}>{formatValue(d.value)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm + 2,
  },
  label: {
    ...typography.caption,
    fontFamily: fonts.semiBold,
    color: colors.text,
    width: 96,
  },
  track: {
    flex: 1,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    overflow: 'hidden',
    marginHorizontal: spacing.sm,
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  value: {
    ...typography.caption,
    fontFamily: fonts.bold,
    color: colors.text,
    width: 56,
    textAlign: 'right',
  },
  empty: {
    ...typography.body,
    color: colors.textMuted,
  },
});
