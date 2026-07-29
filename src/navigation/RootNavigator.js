import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import AdminStack from './AdminStack';
import OrganizadorStack from './OrganizadorStack';
import UsuarioStack from './UsuarioStack';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

const ROLE_SCREEN = {
  ADMIN: 'AdminRoot',
  ORGANIZADOR: 'OrganizadorRoot',
  USUARIO: 'UsuarioRoot',
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

  const initialRoute = user ? ROLE_SCREEN[user.role] || 'Auth' : 'Auth';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : (
        <>
          <Stack.Screen name="AdminRoot" component={AdminStack} />
          <Stack.Screen name="OrganizadorRoot" component={OrganizadorStack} />
          <Stack.Screen name="UsuarioRoot" component={UsuarioStack} />
        </>
      )}
    </Stack.Navigator>
  );
}
