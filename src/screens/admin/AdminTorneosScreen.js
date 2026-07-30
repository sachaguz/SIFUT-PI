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

export default function AdminTorneosScreen({ navigation }) {
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      api.get('/torneos').then((r) => setTorneos(r.data)).finally(() => setLoading(false));
    }, [])
  );

  if (loading) {
    return <ScreenContainer><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} /></ScreenContainer>;
  }

  return (
    <ScreenContainer>
      <SectionHeader title="Torneos" subtitle="Competiciones activas" />

      {torneos.map((torneo) => (
        <ListRow
          key={torneo.id}
          icon="trophy-outline"
          title={torneo.nombre}
          subtitle={`${torneo.tipo} · ${torneo.categoria}`}
          meta={`${formatDate(torneo.fechaInicio)} - ${formatDate(torneo.fechaFin)} · ${torneo.equipos?.length || 0} equipos`}
          right={<Badge label={estadoLabel(torneo.estado)} tone={torneo.estado === 'ACTIVO' ? 'success' : 'neutral'} />}
          onPress={() => navigation.navigate('AdminTorneoDetalle', { torneoId: torneo.id })}
        />
      ))}

      <View style={{ marginTop: spacing.md }}>
        <PrimaryButton title="+ Nuevo torneo" onPress={() => navigation.navigate('AdminTorneoForm')} />
      </View>
    </ScreenContainer>
  );
}
