import { useCallback, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import ListRow from '../../components/ListRow';
import Badge from '../../components/Badge';
import api, { formatDate, estadoLabel } from '../../services/api';
import { colors } from '../../theme/colors';

const TONE_BY_ESTADO = { CONFIRMADA: 'success', COMPLETADA: 'neutral', CANCELADA: 'danger' };

export default function UserMisReservasScreen({ navigation }) {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      api.get('/reservas').then((r) => setReservas(r.data)).finally(() => setLoading(false));
    }, [])
  );

  if (loading) {
    return <ScreenContainer><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} /></ScreenContainer>;
  }

  return (
    <ScreenContainer>
      <SectionHeader title="Mis reservaciones" subtitle="Historial de rentas" />

      {reservas.map((reserva) => (
        <ListRow
          key={reserva.id}
          icon="receipt-outline"
          title={`${reserva.cancha?.sede?.nombre || ''} - ${reserva.cancha?.nombre || ''}`}
          subtitle={`${formatDate(reserva.fecha)} · ${reserva.horaInicio} - ${reserva.horaFin}`}
          meta={reserva.folio}
          right={<Badge label={estadoLabel(reserva.estado)} tone={TONE_BY_ESTADO[reserva.estado]} />}
          onPress={() => navigation.navigate('UserReservaDetalle', { reserva })}
        />
      ))}
    </ScreenContainer>
  );
}
