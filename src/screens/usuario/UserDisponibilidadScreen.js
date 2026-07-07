import { StyleSheet, Text } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import ListRow from '../../components/ListRow';
import Badge from '../../components/Badge';
import { colors, typography } from '../../theme/colors';

const HORARIOS = [
  { hora: '09:00 - 10:00', precio: 450, disponible: true },
  { hora: '10:00 - 11:00', precio: 450, disponible: false },
  { hora: '15:00 - 16:00', precio: 500, disponible: true },
  { hora: '16:00 - 17:00', precio: 500, disponible: true },
  { hora: '19:00 - 20:00', precio: 650, disponible: false },
  { hora: '20:00 - 21:00', precio: 650, disponible: true },
];

export default function UserDisponibilidadScreen({ navigation, route }) {
  const { sede, cancha, fecha } = route.params;

  return (
    <ScreenContainer>
      <SectionHeader title="Disponibilidad" subtitle={`${sede} · ${cancha} · ${fecha}`} />

      {HORARIOS.map((bloque) => (
        <ListRow
          key={bloque.hora}
          icon="time-outline"
          title={bloque.hora}
          subtitle={bloque.disponible ? 'Disponible' : 'No disponible'}
          meta={`$${bloque.precio} MXN`}
          right={<Badge label={bloque.disponible ? 'Libre' : 'Ocupado'} tone={bloque.disponible ? 'success' : 'danger'} />}
          onPress={
            bloque.disponible
              ? () => navigation.navigate('UserPago', { sede, cancha, fecha, ...bloque })
              : undefined
          }
        />
      ))}

      <Text style={styles.hint}>Selecciona un horario disponible para continuar con el pago.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
});
