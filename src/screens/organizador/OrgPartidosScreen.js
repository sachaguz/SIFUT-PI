import { useCallback, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import ListRow from '../../components/ListRow';
import Badge from '../../components/Badge';
import PrimaryButton from '../../components/PrimaryButton';
import api, { formatDate, estadoLabel } from '../../services/api';
import { colors, spacing } from '../../theme/colors';

export default function OrgPartidosScreen({ navigation }) {
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
      <SectionHeader title="Partidos" subtitle="Calendario de encuentros" />

      {partidos.map((partido) => {
        const local = partido.equipoLocal?.nombre || '';
        const visitante = partido.equipoVisitante?.nombre || '';
        const torneo = partido.torneo?.nombre || '';
        const cancha = partido.cancha ? `${partido.cancha.nombre} - ${partido.cancha.sede?.nombre || ''}` : '';
        const isFinalizado = partido.estado === 'FINALIZADO';
        return (
          <ListRow
            key={partido.id}
            icon="football-outline"
            title={`${local} vs ${visitante}`}
            subtitle={`${torneo} · Jornada ${partido.jornada}${partido.fase === 'LIGUILLA' ? ' (Liguilla)' : ''}`}
            meta={`${formatDate(partido.fecha)} · ${partido.hora} · ${cancha}`}
            right={<Badge label={estadoLabel(partido.estado)} tone={isFinalizado ? 'success' : 'warning'} />}
            onPress={() => isFinalizado
              ? navigation.navigate('PartidoDetalle', {
                  partido: { ...partido, local, visitante, torneo, cancha, fecha: formatDate(partido.fecha) },
                })
              : navigation.navigate('OrgRegistroResultado', {
                  partido: { ...partido, local, visitante, torneo, cancha, fecha: formatDate(partido.fecha) },
                })
            }
          />
        );
      })}

      <View style={{ marginTop: spacing.md }}>
        <PrimaryButton title="+ Programar partido" onPress={() => navigation.navigate('OrgPartidoForm')} />
      </View>
    </ScreenContainer>
  );
}
