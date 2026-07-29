import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import ListRow from '../../components/ListRow';
import Badge from '../../components/Badge';
import PrimaryButton from '../../components/PrimaryButton';
import api from '../../services/api';
import { colors, spacing } from '../../theme/colors';

export default function AdminSedesScreen({ navigation }) {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      api.get('/sedes').then((r) => setSedes(r.data)).finally(() => setLoading(false));
    }, [])
  );

  if (loading) {
    return <ScreenContainer><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} /></ScreenContainer>;
  }

  return (
    <ScreenContainer>
      <SectionHeader eyebrow="Querétaro" title="Sedes" subtitle={`${sedes.length} sucursales registradas`} />

      {sedes.map((sede) => (
        <ListRow
          key={sede.id}
          icon="business-outline"
          title={sede.nombre}
          subtitle={sede.direccion}
          meta={`${sede.telefono}  ·  ${sede.canchas?.length || 0} canchas`}
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
