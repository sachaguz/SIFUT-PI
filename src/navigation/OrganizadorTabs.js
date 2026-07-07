import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import OrgTorneosScreen from '../screens/organizador/OrgTorneosScreen';
import OrgEquiposScreen from '../screens/organizador/OrgEquiposScreen';
import OrgPartidosScreen from '../screens/organizador/OrgPartidosScreen';
import OrgEstadisticasScreen from '../screens/organizador/OrgEstadisticasScreen';
import LogoutButton from '../components/LogoutButton';
import { useTabScreenOptions } from './navigationTheme';

const Tab = createBottomTabNavigator();

const ICONS = {
  Torneos: 'trophy-outline',
  Equipos: 'people-outline',
  Partidos: 'football-outline',
  Estadisticas: 'stats-chart-outline',
};

export default function OrganizadorTabs() {
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
      <Tab.Screen name="Torneos" component={OrgTorneosScreen} />
      <Tab.Screen name="Equipos" component={OrgEquiposScreen} />
      <Tab.Screen name="Partidos" component={OrgPartidosScreen} />
      <Tab.Screen name="Estadisticas" component={OrgEstadisticasScreen} options={{ title: 'Estadísticas' }} />
    </Tab.Navigator>
  );
}
