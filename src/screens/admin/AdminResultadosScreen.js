import { useState } from 'react';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import ListRow from '../../components/ListRow';
import Badge from '../../components/Badge';
import { PARTIDOS } from '../../data/partidos';

export default function AdminResultadosScreen({ navigation }) {
  const [partidos] = useState(PARTIDOS);

  return (
    <ScreenContainer>
      <SectionHeader title="Resultados" subtitle="Registro de resultados y eventos de partido" />

      {partidos.map((partido) => (
        <ListRow
          key={partido.id}
          icon="football-outline"
          title={`${partido.local} vs ${partido.visitante}`}
          subtitle={`${partido.torneo} · ${partido.cancha}`}
          meta={`${partido.fecha} · ${partido.hora}`}
          right={<Badge label={partido.estado} tone={partido.estado === 'Finalizado' ? 'success' : 'warning'} />}
          onPress={() =>
            navigation.navigate(
              partido.estado === 'Finalizado' ? 'PartidoDetalle' : 'AdminRegistroResultado',
              { partido }
            )
          }
        />
      ))}
    </ScreenContainer>
  );
}
