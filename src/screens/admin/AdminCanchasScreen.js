import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import ListRow from '../../components/ListRow';
import Badge from '../../components/Badge';
import PillSelector from '../../components/PillSelector';
import PrimaryButton from '../../components/PrimaryButton';
import api, { tipoLabel } from '../../services/api';
import { colors, spacing } from '../../theme/colors';

export default function AdminCanchasScreen({ navigation }) {
  const [sedes, setSedes] = useState([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      api.get('/sedes').then((r) => {
        setSedes(r.data);
        if (r.data.length > 0 && !sedeSeleccionada) setSedeSeleccionada(r.data[0].nombre);
      }).finally(() => setLoading(false));
    }, [])
  );

  const sedeActual = useMemo(() => sedes.find((s) => s.nombre === sedeSeleccionada), [sedes, sedeSeleccionada]);
  const canchas = sedeActual?.canchas || [];
  const nombresSedes = sedes.map((s) => s.nombre);

  if (loading) {
    return <ScreenContainer><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} /></ScreenContainer>;
  }

  return (
    <ScreenContainer>
      <SectionHeader eyebrow="Sucursales" title="Canchas" />

      <PillSelector options={nombresSedes} value={sedeSeleccionada} onChange={setSedeSeleccionada} />

      {canchas.map((cancha) => (
        <ListRow
          key={cancha.id}
          icon="football-outline"
          title={cancha.nombre}
          subtitle={`${tipoLabel(cancha.tipo)} · ${cancha.superficie}`}
          meta={`Capacidad máx. ${cancha.capacidad} personas`}
          right={<Badge label={`$${Number(cancha.precioPorHora)}/hr`} tone="neutral" />}
          onPress={() => navigation.navigate('AdminCanchaForm', { cancha, sedeId: sedeActual?.id, sede: sedeSeleccionada })}
        />
      ))}

      <View style={styles.actions}>
        <PrimaryButton
          title="Configurar horarios"
          variant="outline"
          onPress={() => navigation.navigate('AdminHorarios', { sedeId: sedeActual?.id, sede: sedeSeleccionada })}
        />
        <PrimaryButton
          title="+ Agregar cancha"
          onPress={() => navigation.navigate('AdminCanchaForm', { sedeId: sedeActual?.id, sede: sedeSeleccionada })}
          style={{ marginTop: spacing.sm }}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: spacing.md,
  },
});
