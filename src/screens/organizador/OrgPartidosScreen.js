import { useState } from 'react';
import { View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import ListRow from '../../components/ListRow';
import Badge from '../../components/Badge';
import PrimaryButton from '../../components/PrimaryButton';
import { PARTIDOS } from '../../data/partidos';
import { spacing } from '../../theme/colors';

export default function OrgPartidosScreen({ navigation }) {
  const [partidos] = useState(PARTIDOS);

  return (
    <ScreenContainer>
      <SectionHeader title="Partidos" subtitle="Calendario de encuentros" />

      {partidos.map((partido) => (
        <ListRow
          key={partido.id}
          icon="football-outline"
          title={`${partido.local} vs ${partido.visitante}`}
          subtitle={`${partido.torneo} · ${partido.jornada}`}
          meta={`${partido.fecha} · ${partido.hora} · ${partido.cancha}`}
          right={<Badge label={partido.estado} tone={partido.estado === 'Finalizado' ? 'success' : 'warning'} />}
          onPress={() => navigation.navigate('PartidoDetalle', { partido })}
        />
      ))}

      <View style={{ marginTop: spacing.md }}>
        <PrimaryButton title="+ Programar partido" onPress={() => navigation.navigate('OrgPartidoForm')} />
      </View>
    </ScreenContainer>
  );
}
