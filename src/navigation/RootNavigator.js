import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from './AuthStack';
import AdminStack from './AdminStack';
import OrganizadorStack from './OrganizadorStack';
import UsuarioStack from './UsuarioStack';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthStack} />
      <Stack.Screen name="AdminRoot" component={AdminStack} />
      <Stack.Screen name="OrganizadorRoot" component={OrganizadorStack} />
      <Stack.Screen name="UsuarioRoot" component={UsuarioStack} />
    </Stack.Navigator>
  );
}
