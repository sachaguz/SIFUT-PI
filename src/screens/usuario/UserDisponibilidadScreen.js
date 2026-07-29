import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import ListRow from '../../components/ListRow';
import Badge from '../../components/Badge';
import api from '../../services/api';
import { colors, typography } from '../../theme/colors';

export default function UserDisponibilidadScreen({ navigation, route }) {
  const { canchaId, canchaName, sedeName, fecha, fechaLabel, precio } = route.params;
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      api.get(`/reservas/disponibilidad?canchaId=${canchaId}&fecha=${fecha}`)
        .then((r) => setSlots(r.data))
        .finally(() => setLoading(false));
    }, [canchaId, fecha])
  );

  if (loading) {
    return <ScreenContainer><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} /></ScreenContainer>;
  }

  return (
    <ScreenContainer>
      <SectionHeader title="Disponibilidad" subtitle={`${sedeName} · ${canchaName} · ${fechaLabel}`} />

      {slots.length === 0 ? (
        <Text style={styles.hint}>No hay horarios configurados para este día.</Text>
      ) : (
        slots.map((slot) => (
          <ListRow
            key={slot.horaInicio}
            icon="time-outline"
            title={`${slot.horaInicio} - ${slot.horaFin}`}
            subtitle={slot.disponible ? 'Disponible' : 'No disponible'}
            meta={`$${precio} MXN`}
            right={<Badge label={slot.disponible ? 'Libre' : 'Ocupado'} tone={slot.disponible ? 'success' : 'danger'} />}
            onPress={
              slot.disponible
                ? () => navigation.navigate('UserPago', {
                    canchaId,
                    sedeName,
                    canchaName,
                    fecha,
                    fechaLabel,
                    horaInicio: slot.horaInicio,
                    horaFin: slot.horaFin,
                    precio,
                  })
                : undefined
            }
          />
        ))
      )}

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
