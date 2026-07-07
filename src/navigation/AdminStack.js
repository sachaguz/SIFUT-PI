import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminTabs from './AdminTabs';
import AdminSedeFormScreen from '../screens/admin/AdminSedeFormScreen';
import AdminCanchaFormScreen from '../screens/admin/AdminCanchaFormScreen';
import AdminHorariosScreen from '../screens/admin/AdminHorariosScreen';
import AdminRegistroResultadoScreen from '../screens/admin/AdminRegistroResultadoScreen';
import AdminPagosRealizadosScreen from '../screens/admin/AdminPagosRealizadosScreen';
import AdminReportesScreen from '../screens/admin/AdminReportesScreen';
import PartidoDetalleScreen from '../screens/shared/PartidoDetalleScreen';
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
    </Stack.Navigator>
  );
}
