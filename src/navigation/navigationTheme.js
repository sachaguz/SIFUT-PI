import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme/colors';

export const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerShadowVisible: false,
  headerTintColor: colors.text,
  headerTitleStyle: { fontFamily: fonts.bold, fontSize: 17 },
};

// ojo: sin el insets.bottom el tab bar queda pegado abajo en iPhone
export function useTabScreenOptions() {
  const insets = useSafeAreaInsets();

  return {
    headerStyle: { backgroundColor: colors.surface },
    headerShadowVisible: false,
    headerTitleStyle: { fontFamily: fonts.bold, fontSize: 17 },
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.placeholder,
    tabBarStyle: {
      borderTopColor: colors.border,
      height: 56 + insets.bottom,
      paddingBottom: insets.bottom + 6,
      paddingTop: 6,
    },
    tabBarLabelStyle: { fontFamily: fonts.semiBold, fontSize: 11 },
  };
}
