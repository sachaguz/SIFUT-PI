import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OrganizadorTabs from './OrganizadorTabs';
import OrgTorneoFormScreen from '../screens/organizador/OrgTorneoFormScreen';
import OrgTorneoDetalleScreen from '../screens/organizador/OrgTorneoDetalleScreen';
import OrgEquipoFormScreen from '../screens/organizador/OrgEquipoFormScreen';
import OrgJugadoresScreen from '../screens/organizador/OrgJugadoresScreen';
import OrgPartidoFormScreen from '../screens/organizador/OrgPartidoFormScreen';
import PartidoDetalleScreen from '../screens/shared/PartidoDetalleScreen';
import { stackScreenOptions } from './navigationTheme';

const Stack = createNativeStackNavigator();

export default function OrganizadorStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="OrganizadorTabs" component={OrganizadorTabs} options={{ headerShown: false }} />
      <Stack.Screen name="OrgTorneoForm" component={OrgTorneoFormScreen} options={{ title: 'Torneo' }} />
      <Stack.Screen name="OrgTorneoDetalle" component={OrgTorneoDetalleScreen} options={{ title: 'Detalle del torneo' }} />
      <Stack.Screen name="OrgEquipoForm" component={OrgEquipoFormScreen} options={{ title: 'Inscribir equipo' }} />
      <Stack.Screen name="OrgJugadores" component={OrgJugadoresScreen} options={{ title: 'Jugadores' }} />
      <Stack.Screen name="OrgPartidoForm" component={OrgPartidoFormScreen} options={{ title: 'Programar partido' }} />
      <Stack.Screen name="PartidoDetalle" component={PartidoDetalleScreen} options={{ title: 'Partido' }} />
    </Stack.Navigator>
  );
}
