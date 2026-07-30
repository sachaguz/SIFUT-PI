import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminTabs from './AdminTabs';
import AdminSedeFormScreen from '../screens/admin/AdminSedeFormScreen';
import AdminCanchaFormScreen from '../screens/admin/AdminCanchaFormScreen';
import AdminHorariosScreen from '../screens/admin/AdminHorariosScreen';
import AdminRegistroResultadoScreen from '../screens/admin/AdminRegistroResultadoScreen';
import AdminPagosRealizadosScreen from '../screens/admin/AdminPagosRealizadosScreen';
import AdminReportesScreen from '../screens/admin/AdminReportesScreen';
import AdminUsuarioFormScreen from '../screens/admin/AdminUsuarioFormScreen';
import AdminEquipoFormScreen from '../screens/admin/AdminEquipoFormScreen';
import AdminTorneoDetalleScreen from '../screens/admin/AdminTorneoDetalleScreen';
import AdminJugadoresScreen from '../screens/admin/AdminJugadoresScreen';
import PartidoDetalleScreen from '../screens/shared/PartidoDetalleScreen';
// Reused as-is: these forms have no organizador-specific navigation (only
// navigation.goBack()), so admin gets full create+edit for free instead of
// a duplicate screen.
import OrgTorneoFormScreen from '../screens/organizador/OrgTorneoFormScreen';
import OrgPartidoFormScreen from '../screens/organizador/OrgPartidoFormScreen';
import { stackScreenOptions } from './navigationTheme';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} options={{ headerShown: false }} />
      <Stack.Screen name="AdminSedeForm" component={AdminSedeFormScreen} options={{ title: 'Sede' }} />
      <Stack.Screen name="AdminCanchaForm" component={AdminCanchaFormScreen} options={{ title: 'Cancha' }} />
      <Stack.Screen name="AdminHorarios" component={AdminHorariosScreen} options={{ title: 'Horarios' }} />
      <Stack.Screen
        name="AdminRegistroResultado"
        component={AdminRegistroResultadoScreen}
        options={{ title: 'Registrar resultado' }}
      />
      <Stack.Screen name="PartidoDetalle" component={PartidoDetalleScreen} options={{ title: 'Partido' }} />
      <Stack.Screen
        name="AdminPagosRealizados"
        component={AdminPagosRealizadosScreen}
        options={{ title: 'Pagos realizados' }}
      />
      <Stack.Screen name="AdminReportes" component={AdminReportesScreen} options={{ title: 'Reportes' }} />
      <Stack.Screen name="AdminUsuarioForm" component={AdminUsuarioFormScreen} options={{ title: 'Usuario' }} />
      <Stack.Screen name="AdminEquipoForm" component={AdminEquipoFormScreen} options={{ title: 'Equipo' }} />
      <Stack.Screen name="AdminTorneoDetalle" component={AdminTorneoDetalleScreen} options={{ title: 'Torneo' }} />
      <Stack.Screen name="AdminTorneoForm" component={OrgTorneoFormScreen} options={{ title: 'Torneo' }} />
      <Stack.Screen name="AdminPartidoForm" component={OrgPartidoFormScreen} options={{ title: 'Partido' }} />
      <Stack.Screen name="AdminJugadores" component={AdminJugadoresScreen} options={{ title: 'Jugadores' }} />
    </Stack.Navigator>
  );
}
