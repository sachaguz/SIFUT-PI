import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme/colors';

const VARIANT_STYLES = {
  primary: { container: { backgroundColor: colors.primary }, text: { color: colors.white } },
  outline: {
    container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
    text: { color: colors.primary },
  },
  danger: { container: { backgroundColor: colors.danger }, text: { color: colors.white } },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: colors.secondary },
  },
};

export default function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  small = false,
}) {
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        small && styles.small,
        variantStyle.container,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.text.color} />
      ) : (
        <Text style={[styles.text, small && styles.smallText, variantStyle.text]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
  },
  text: {
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  smallText: {
    fontSize: 13,
  },
  disabled: {
    backgroundColor: colors.disabled,
    borderColor: colors.disabled,
  },
});
