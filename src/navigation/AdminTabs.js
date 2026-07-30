import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AdminSedesScreen from '../screens/admin/AdminSedesScreen';
import AdminCanchasScreen from '../screens/admin/AdminCanchasScreen';
import AdminReservasScreen from '../screens/admin/AdminReservasScreen';
import AdminResultadosScreen from '../screens/admin/AdminResultadosScreen';
import AdminTesoreriaScreen from '../screens/admin/AdminTesoreriaScreen';
import LogoutButton from '../components/LogoutButton';
import HamburgerButton from './HamburgerButton';
import AdminSidebar from './AdminSidebar';
import { SidebarProvider } from './SidebarContext';
import { useTabScreenOptions } from './navigationTheme';

const Tab = createBottomTabNavigator();
const isWeb = Platform.OS === 'web';

const ICONS = {
  Sedes: 'business-outline',
  Canchas: 'football-outline',
  Reservas: 'calendar-outline',
  Resultados: 'stats-chart-outline',
  Tesoreria: 'cash-outline',
};

function AdminTabNavigator() {
  const tabScreenOptions = useTabScreenOptions();

  return (
    <Tab.Navigator
      tabBar={isWeb ? (props) => <AdminSidebar {...props} icons={ICONS} /> : undefined}
      screenOptions={({ route }) => ({
        ...tabScreenOptions,
        headerLeft: isWeb ? () => <HamburgerButton /> : undefined,
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

export default function AdminTabs() {
  if (!isWeb) return <AdminTabNavigator />;

  return (
    <SidebarProvider>
      <AdminTabNavigator />
    </SidebarProvider>
  );
}
