import { useCallback, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import ListRow from '../../components/ListRow';
import Badge from '../../components/Badge';
import api, { estadoLabel } from '../../services/api';
import { colors } from '../../theme/colors';

export default function AdminReservasScreen() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const hoy = new Date().toISOString().slice(0, 10);
      api.get(`/reservas?fecha=${hoy}`).then((r) => setReservas(r.data)).finally(() => setLoading(false));
    }, [])
  );

  if (loading) {
    return <ScreenContainer><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} /></ScreenContainer>;
  }

  return (
    <ScreenContainer>
      <SectionHeader title="Ocupación de hoy" subtitle="Tablero de canchas reservadas en el día en curso" />

      {reservas.length === 0 ? (
        <SectionHeader subtitle="No hay reservaciones para hoy." />
      ) : (
        reservas.map((item) => {
          const sedeName = item.cancha?.sede?.nombre || '';
          const canchaName = item.cancha?.nombre || '';
          const userName = item.user ? `${item.user.nombre} ${item.user.apellido}` : '—';
          const ocupada = item.estado !== 'CANCELADA';
          return (
            <ListRow
              key={item.id}
              icon="calendar-outline"
              title={`${sedeName} · ${canchaName}`}
              subtitle={`${item.horaInicio} - ${item.horaFin}`}
              meta={ocupada ? `Reservó: ${userName}` : 'Cancelada'}
              right={<Badge label={ocupada ? 'Ocupada' : 'Libre'} tone={ocupada ? 'warning' : 'success'} />}
            />
          );
        })
      )}
    </ScreenContainer>
  );
}
