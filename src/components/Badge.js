import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme/colors';

const TONES = {
  success: { backgroundColor: colors.successLight, color: colors.primaryDark },
  warning: { backgroundColor: colors.warningLight, color: colors.warning },
  danger: { backgroundColor: colors.dangerLight, color: colors.danger },
  neutral: { backgroundColor: colors.background, color: colors.textMuted },
};

export default function Badge({ label, tone = 'neutral' }) {
  const toneStyle = TONES[tone] || TONES.neutral;

  return (
    <View style={[styles.badge, { backgroundColor: toneStyle.backgroundColor }]}>
      <Text style={[styles.text, { color: toneStyle.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
});
