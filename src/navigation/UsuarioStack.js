import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UsuarioTabs from './UsuarioTabs';
import UserDisponibilidadScreen from '../screens/usuario/UserDisponibilidadScreen';
import UserPagoScreen from '../screens/usuario/UserPagoScreen';
import UserReservaConfirmadaScreen from '../screens/usuario/UserReservaConfirmadaScreen';
import UserReservaDetalleScreen from '../screens/usuario/UserReservaDetalleScreen';
import { stackScreenOptions } from './navigationTheme';

const Stack = createNativeStackNavigator();

export default function UsuarioStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="UsuarioTabs" component={UsuarioTabs} options={{ headerShown: false }} />
      <Stack.Screen name="UserDisponibilidad" component={UserDisponibilidadScreen} options={{ title: 'Disponibilidad' }} />
      <Stack.Screen name="UserPago" component={UserPagoScreen} options={{ title: 'Pago' }} />
      <Stack.Screen
        name="UserReservaConfirmada"
        component={UserReservaConfirmadaScreen}
        options={{ title: 'Confirmación', headerBackVisible: false }}
      />
      <Stack.Screen name="UserReservaDetalle" component={UserReservaDetalleScreen} options={{ title: 'Detalle de reserva' }} />
    </Stack.Navigator>
  );
}
