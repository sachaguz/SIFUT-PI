import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AdminSedesScreen from '../screens/admin/AdminSedesScreen';
import AdminCanchasScreen from '../screens/admin/AdminCanchasScreen';
import AdminReservasScreen from '../screens/admin/AdminReservasScreen';
import AdminResultadosScreen from '../screens/admin/AdminResultadosScreen';
import AdminTesoreriaScreen from '../screens/admin/AdminTesoreriaScreen';
import LogoutButton from '../components/LogoutButton';
import { useTabScreenOptions } from './navigationTheme';

const Tab = createBottomTabNavigator();

const ICONS = {
  Sedes: 'business-outline',
  Canchas: 'football-outline',
  Reservas: 'calendar-outline',
  Resultados: 'stats-chart-outline',
  Tesoreria: 'cash-outline',
};

export default function AdminTabs() {
  const tabScreenOptions = useTabScreenOptions();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...tabScreenOptions,
        headerRight: () => <LogoutButton />,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Sedes" component={AdminSedesScreen} options={{ title: 'Sedes' }} />
      <Tab.Screen name="Canchas" component={AdminCanchasScreen} options={{ title: 'Canchas' }} />
      <Tab.Screen name="Reservas" component={AdminReservasScreen} options={{ title: 'Reservas' }} />
      <Tab.Screen name="Resultados" component={AdminResultadosScreen} options={{ title: 'Resultados' }} />
      <Tab.Screen name="Tesoreria" component={AdminTesoreriaScreen} options={{ title: 'Tesorería' }} />
    </Tab.Navigator>
  );
}
