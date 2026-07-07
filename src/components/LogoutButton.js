import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { logout } from '../navigation/navigationRef';
import { colors, spacing } from '../theme/colors';

export default function LogoutButton() {
  return (
    <TouchableOpacity onPress={logout} style={{ paddingHorizontal: spacing.sm }}>
      <Ionicons name="log-out-outline" size={22} color={colors.danger} />
    </TouchableOpacity>
  );
}
