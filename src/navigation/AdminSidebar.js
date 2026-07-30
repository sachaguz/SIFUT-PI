import { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSidebar } from './SidebarContext';
import { colors, fonts, spacing } from '../theme/colors';

const SIDEBAR_WIDTH = 260;

export default function AdminSidebar({ state, descriptors, navigation, icons }) {
  const { open, close } = useSidebar();
  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: open ? 0 : -SIDEBAR_WIDTH,
      duration: 200,
      // react-native-web has no native driver; this only ever runs on web.
      useNativeDriver: false,
    }).start();
  }, [open, translateX]);

  if (!open) {
    // Keep the backdrop/panel out of the layout (and out of tab order)
    // once fully hidden, instead of leaving an invisible overlay around.
    return (
      <Animated.View
        pointerEvents="none"
        style={[styles.panel, { transform: [{ translateX }] }]}
      >
        {renderPanelContent()}
      </Animated.View>
    );
  }

  return (
    <>
      <Pressable style={styles.backdrop} onPress={close} />
      <Animated.View style={[styles.panel, { transform: [{ translateX }] }]}>
        {renderPanelContent()}
      </Animated.View>
    </>
  );

  function renderPanelContent() {
    return (
      <View style={styles.panelInner}>
        <View style={styles.brandRow}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brand}>SIFut Admin</Text>
        </View>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
            close();
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[styles.item, focused && styles.itemActive]}
            >
              <Ionicons
                name={icons[route.name]}
                size={20}
                color={focused ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.itemLabel, focused && styles.itemLabelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(21, 32, 24, 0.35)',
    zIndex: 10,
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    zIndex: 11,
  },
  panelInner: {
    flex: 1,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  logo: {
    width: 28,
    height: 28,
  },
  brand: {
    fontFamily: fonts.extraBold,
    fontSize: 18,
    color: colors.primary,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    marginBottom: 2,
  },
  itemActive: {
    backgroundColor: colors.primaryLight,
  },
  itemLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textMuted,
  },
  itemLabelActive: {
    color: colors.primary,
  },
});
