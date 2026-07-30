import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSidebar } from './SidebarContext';
import { colors, spacing } from '../theme/colors';

export default function HamburgerButton() {
  const { toggle } = useSidebar();

  return (
    <Pressable onPress={toggle} hitSlop={8} style={{ paddingHorizontal: spacing.md }}>
      <Ionicons name="menu-outline" size={26} color={colors.text} />
    </Pressable>
  );
}
