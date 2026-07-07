import { useState } from 'react';
import { View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import ListRow from '../../components/ListRow';
import Badge from '../../components/Badge';
import PrimaryButton from '../../components/PrimaryButton';
import { TORNEOS } from '../../data/torneos';
import { spacing } from '../../theme/colors';

export default function OrgTorneosScreen({ navigation }) {
  const [torneos] = useState(TORNEOS);

  return (
    <ScreenContainer>
      <SectionHeader title="Torneos" subtitle="Competiciones activas" />

      {torneos.map((torneo) => (
        <ListRow
          key={torneo.id}
          icon="trophy-outline"
          title={torneo.nombre}
          subtitle={`${torneo.tipo} · ${torneo.categoria}`}
          meta={`${torneo.fechaInicio} - ${torneo.fechaFin} · ${torneo.equipos.length} equipos`}
          right={<Badge label={torneo.estado} tone={torneo.estado === 'Activo' ? 'success' : 'neutral'} />}
          onPress={() => navigation.navigate('OrgTorneoDetalle', { torneo })}
        />
      ))}

      <View style={{ marginTop: spacing.md }}>
        <PrimaryButton title="+ Nuevo torneo" onPress={() => navigation.navigate('OrgTorneoForm')} />
      </View>
    </ScreenContainer>
  );
}
