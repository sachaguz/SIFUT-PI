import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import ListRow from '../../components/ListRow';
import Badge from '../../components/Badge';
import PrimaryButton from '../../components/PrimaryButton';
import { SEDES } from '../../data/sedes';
import { spacing } from '../../theme/colors';

export default function AdminSedesScreen({ navigation }) {
  const [sedes] = useState(SEDES);

  return (
    <ScreenContainer>
      <SectionHeader eyebrow="Querétaro" title="Sedes" subtitle={`${sedes.length} sucursales registradas`} />

      {sedes.map((sede) => (
        <ListRow
          key={sede.id}
          icon="business-outline"
          title={sede.nombre}
          subtitle={sede.direccion}
          meta={`${sede.telefono}  ·  ${sede.canchas.length} canchas`}
          right={<Badge label={sede.activa ? 'Activa' : 'Inactiva'} tone={sede.activa ? 'success' : 'neutral'} />}
          onPress={() => navigation.navigate('AdminSedeForm', { sede })}
        />
      ))}

      <View style={styles.footer}>
        <PrimaryButton title="+ Nueva sede" onPress={() => navigation.navigate('AdminSedeForm')} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: spacing.md,
  },
});
