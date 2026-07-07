import { useState } from 'react';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import ListRow from '../../components/ListRow';
import Badge from '../../components/Badge';

const RESERVAS = [
  {
    id: '1',
    folio: 'RSV-4821',
    sede: 'Sede Centro Histórico',
    cancha: 'Cancha 1',
    fecha: '05/07/2026',
    hora: '15:00 - 16:00',
    precio: 500,
    estado: 'Confirmada',
  },
  {
    id: '2',
    folio: 'RSV-4790',
    sede: 'Sede Juriquilla',
    cancha: 'Cancha 1',
    fecha: '28/06/2026',
    hora: '18:00 - 19:00',
    precio: 450,
    estado: 'Completada',
  },
  {
    id: '3',
    folio: 'RSV-4765',
    sede: 'Sede Centro Histórico',
    cancha: 'Cancha 2',
    fecha: '20/06/2026',
    hora: '10:00 - 11:00',
    precio: 750,
    estado: 'Cancelada',
  },
];

const TONE_BY_ESTADO = { Confirmada: 'success', Completada: 'neutral', Cancelada: 'danger' };

export default function UserMisReservasScreen({ navigation }) {
  const [reservas] = useState(RESERVAS);

  return (
    <ScreenContainer>
      <SectionHeader title="Mis reservaciones" subtitle="Historial de rentas" />

      {reservas.map((reserva) => (
        <ListRow
          key={reserva.id}
          icon="receipt-outline"
          title={`${reserva.sede} - ${reserva.cancha}`}
          subtitle={`${reserva.fecha} · ${reserva.hora}`}
          meta={reserva.folio}
          right={<Badge label={reserva.estado} tone={TONE_BY_ESTADO[reserva.estado]} />}
          onPress={() => navigation.navigate('UserReservaDetalle', { reserva })}
        />
      ))}
    </ScreenContainer>
  );
}
