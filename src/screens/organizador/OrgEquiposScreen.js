import { useCallback, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import ListRow from '../../components/ListRow';
import PillSelector from '../../components/PillSelector';
import PrimaryButton from '../../components/PrimaryButton';
import api from '../../services/api';
import { colors, spacing } from '../../theme/colors';

const TODAS = 'Todas las ligas';

export default function OrgEquiposScreen({ navigation }) {
  const [equipos, setEquipos] = useState([]);
  const [torneos, setTorneos] = useState([]);
  const [filtro, setFiltro] = useState(TODAS);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        api.get('/equipos'),
        api.get('/torneos'),
      ]).then(([e, t]) => {
        setEquipos(e.data);
        setTorneos(t.data);
      }).finally(() => setLoading(false));
    }, [])
  );

  if (loading) {
    return <ScreenContainer><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} /></ScreenContainer>;
  }

  const filtroTorneo = torneos.find((t) => t.nombre === filtro);
  const equiposFiltrados = filtroTorneo
    ? equipos.filter((e) => (e.torneos || []).some((t) => t.id === filtroTorneo.id))
    : equipos;

  return (
    <ScreenContainer>
      <SectionHeader title="Equipos" subtitle="Plantillas registradas" />

      <PillSelector
        label="Liga"
        options={[TODAS, ...torneos.map((t) => t.nombre)]}
        value={filtro}
        onChange={setFiltro}
      />

      {equiposFiltrados.map((equipo) => (
        <ListRow
          key={equipo.id}
          icon="people-outline"
          title={equipo.nombre}
          subtitle={`${equipo.categoria} · ${(equipo.torneos || []).map((t) => t.nombre).join(', ') || 'Sin liga'}`}
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
