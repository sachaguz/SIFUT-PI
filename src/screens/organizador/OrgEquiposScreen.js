import { useCallback, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import ListRow from '../../components/ListRow';
import PrimaryButton from '../../components/PrimaryButton';
import api from '../../services/api';
import { colors, spacing } from '../../theme/colors';

export default function OrgEquiposScreen({ navigation }) {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      api.get('/equipos').then((r) => setEquipos(r.data)).finally(() => setLoading(false));
    }, [])
  );

  if (loading) {
    return <ScreenContainer><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} /></ScreenContainer>;
  }

  return (
    <ScreenContainer>
      <SectionHeader title="Equipos" subtitle="Plantillas registradas" />

      {equipos.map((equipo) => (
        <ListRow
          key={equipo.id}
          icon="people-outline"
          title={equipo.nombre}
          subtitle={`${equipo.categoria} · ${equipo.torneo?.nombre || ''}`}
          meta={`${equipo._count?.jugadores || 0} jugadores`}
          onPress={() => navigation.navigate('OrgJugadores', { equipoId: equipo.id, equipoNombre: equipo.nombre })}
        />
      ))}

      <View style={{ marginTop: spacing.md }}>
        <PrimaryButton title="+ Inscribir equipo" onPress={() => navigation.navigate('OrgEquipoForm')} />
      </View>
    </ScreenContainer>
  );
}
