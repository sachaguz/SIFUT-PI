import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AdminSedesScreen from '../screens/admin/AdminSedesScreen';
import AdminCanchasScreen from '../screens/admin/AdminCanchasScreen';
import AdminReservasScreen from '../screens/admin/AdminReservasScreen';
import AdminResultadosScreen from '../screens/admin/AdminResultadosScreen';
import AdminTesoreriaScreen from '../screens/admin/AdminTesoreriaScreen';
import AdminUsuariosScreen from '../screens/admin/AdminUsuariosScreen';
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
  Usuarios: 'people-outline',
};

// Bottom tabs only fit the core operational screens on a phone. The web
// sidebar has room for the rest of the admin CRUD sections, so those are
// added as web-only tabs (see the `isWeb &&` guards below) instead of
// cluttering the native tab bar.

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
      {isWeb && <Tab.Screen name="Usuarios" component={AdminUsuariosScreen} options={{ title: 'Usuarios' }} />}
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
