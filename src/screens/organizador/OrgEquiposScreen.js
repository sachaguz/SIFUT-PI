import { useState } from 'react';
import { View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import ListRow from '../../components/ListRow';
import PrimaryButton from '../../components/PrimaryButton';
import { EQUIPOS } from '../../data/torneos';
import { spacing } from '../../theme/colors';

export default function OrgEquiposScreen({ navigation }) {
  const [equipos] = useState(EQUIPOS);

  return (
    <ScreenContainer>
      <SectionHeader title="Equipos" subtitle="Plantillas registradas" />

      {equipos.map((equipo) => (
        <ListRow
          key={equipo.id}
          icon="people-outline"
          title={equipo.nombre}
          subtitle={`${equipo.categoria} · ${equipo.torneo}`}
          meta={`${equipo.jugadores} jugadores`}
          onPress={() => navigation.navigate('OrgJugadores', { equipo })}
        />
      ))}

      <View style={{ marginTop: spacing.md }}>
        <PrimaryButton title="+ Inscribir equipo" onPress={() => navigation.navigate('OrgEquipoForm')} />
      </View>
    </ScreenContainer>
  );
}
