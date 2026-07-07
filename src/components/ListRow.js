import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { colors, spacing, typography } from '../theme/colors';

export default function ListRow({ title, subtitle, meta, right, onPress, icon }) {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper activeOpacity={0.7} onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.row}>
          {icon ? (
            <View style={styles.iconWrap}>
              <Ionicons name={icon} size={18} color={colors.primary} />
            </View>
          ) : null}
          <View style={{ flex: 1 }}>
            <Text style={typography.subtitle}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            {meta ? <Text style={styles.meta}>{meta}</Text> : null}
          </View>
          {right}
          {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
        </View>
      </Card>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm + 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: 2,
  },
  meta: {
    ...typography.caption,
    marginTop: 4,
  },
});
