import { useCallback, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import ListRow from '../../components/ListRow';
import Badge from '../../components/Badge';
import api, { formatDate, estadoLabel } from '../../services/api';
import { colors } from '../../theme/colors';

export default function AdminResultadosScreen({ navigation }) {
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      api.get('/partidos').then((r) => setPartidos(r.data)).finally(() => setLoading(false));
    }, [])
  );

  if (loading) {
    return <ScreenContainer><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} /></ScreenContainer>;
  }

  return (
    <ScreenContainer>
      <SectionHeader title="Resultados" subtitle="Registro de resultados y eventos de partido" />

      {partidos.map((partido) => {
        const local = partido.equipoLocal?.nombre || '';
        const visitante = partido.equipoVisitante?.nombre || '';
        const torneo = partido.torneo?.nombre || '';
        const cancha = partido.cancha ? `${partido.cancha.nombre} - ${partido.cancha.sede?.nombre || ''}` : '';
        const finalizado = partido.estado === 'FINALIZADO';
        return (
          <ListRow
            key={partido.id}
            icon="football-outline"
            title={`${local} vs ${visitante}`}
            subtitle={`${torneo} · ${cancha}`}
            meta={`${formatDate(partido.fecha)} · ${partido.hora}`}
            right={<Badge label={estadoLabel(partido.estado)} tone={finalizado ? 'success' : 'warning'} />}
            onPress={() =>
              navigation.navigate(
                finalizado ? 'PartidoDetalle' : 'AdminRegistroResultado',
                { partido: { ...partido, local, visitante, torneo, cancha, fecha: formatDate(partido.fecha) } }
              )
            }
          />
        );
      })}
    </ScreenContainer>
  );
}
