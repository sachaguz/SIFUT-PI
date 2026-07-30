import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme/colors';

const isWeb = Platform.OS === 'web';
const MAX_WIDTH = 960;

export default function ScreenContainer({ children, scroll = true, style }) {
  const Wrapper = scroll ? ScrollView : View;
  const wrapperProps = scroll
    ? { contentContainerStyle: styles.scrollContent, keyboardShouldPersistTaps: 'handled' }
    : { style: styles.content };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Wrapper {...wrapperProps}>
        <View style={[styles.inner, style]}>{children}</View>
      </Wrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
    // Native mobile is untouched: full-bleed content is correct on a
    // phone. On web the admin panel is viewed on wide laptop/desktop
    // screens, where the same layout stretched edge-to-edge reads as
    // oversized - centering a capped-width column keeps it readable
    // while staying just as responsive below that width.
    ...(isWeb ? { alignItems: 'center' } : {}),
  },
  content: {
    flex: 1,
    ...(isWeb ? { alignItems: 'center' } : {}),
  },
  inner: {
    width: '100%',
    padding: spacing.md,
    ...(isWeb ? { maxWidth: MAX_WIDTH } : {}),
  },
});
