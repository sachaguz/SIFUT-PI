import { useState } from 'react';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import ListRow from '../../components/ListRow';
import Badge from '../../components/Badge';

const RESERVAS_HOY = [
  { id: '1', sede: 'Sede Centro Histórico', cancha: 'Cancha 1', hora: '15:00 - 16:00', usuario: 'Juan Pérez', estado: 'Ocupada' },
  { id: '2', sede: 'Sede Centro Histórico', cancha: 'Cancha 2', hora: '16:00 - 17:00', usuario: '—', estado: 'Libre' },
  { id: '3', sede: 'Sede Juriquilla', cancha: 'Cancha 1', hora: '18:00 - 19:00', usuario: 'Equipo Halcones', estado: 'Ocupada' },
  { id: '4', sede: 'Sede El Marqués', cancha: 'Cancha 1', hora: '20:00 - 21:00', usuario: '—', estado: 'Libre' },
];

const TONE_BY_ESTADO = { Ocupada: 'warning', Libre: 'success' };

export default function AdminReservasScreen() {
  const [reservas] = useState(RESERVAS_HOY);

  return (
    <ScreenContainer>
      <SectionHeader title="Ocupación de hoy" subtitle="Tablero de canchas reservadas en el día en curso" />

      {reservas.map((item) => (
        <ListRow
          key={item.id}
          icon="calendar-outline"
          title={`${item.sede} · ${item.cancha}`}
          subtitle={item.hora}
          meta={item.usuario !== '—' ? `Reservó: ${item.usuario}` : 'Sin reservación'}
          right={<Badge label={item.estado} tone={TONE_BY_ESTADO[item.estado]} />}
        />
      ))}
    </ScreenContainer>
  );
}
