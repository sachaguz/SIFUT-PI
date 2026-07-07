import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import UserReservarScreen from '../screens/usuario/UserReservarScreen';
import UserMisReservasScreen from '../screens/usuario/UserMisReservasScreen';
import LogoutButton from '../components/LogoutButton';
import { useTabScreenOptions } from './navigationTheme';

const Tab = createBottomTabNavigator();

const ICONS = {
  Reservar: 'search-outline',
  MisReservas: 'receipt-outline',
};

export default function UsuarioTabs() {
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
      <Tab.Screen name="Reservar" component={UserReservarScreen} />
      <Tab.Screen name="MisReservas" component={UserMisReservasScreen} options={{ title: 'Mis reservas' }} />
    </Tab.Navigator>
  );
}
