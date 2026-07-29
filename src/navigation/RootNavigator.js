import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import AdminStack from './AdminStack';
import OrganizadorStack from './OrganizadorStack';
import UsuarioStack from './UsuarioStack';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

const ROLE_CONFIG = {
  ADMIN: { name: 'AdminRoot', component: AdminStack },
  ORGANIZADOR: { name: 'OrganizadorRoot', component: OrganizadorStack },
  USUARIO: { name: 'UsuarioRoot', component: UsuarioStack },
};

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const roleConfig = user ? ROLE_CONFIG[user.role] : null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user || !roleConfig ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : (
        <Stack.Screen name={roleConfig.name} component={roleConfig.component} />
      )}
    </Stack.Navigator>
  );
}
