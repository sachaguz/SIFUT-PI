import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import ListRow from '../../components/ListRow';
import Badge from '../../components/Badge';
import PillSelector from '../../components/PillSelector';
import PrimaryButton from '../../components/PrimaryButton';
import { SEDES } from '../../data/sedes';
import { spacing } from '../../theme/colors';

const NOMBRES_SEDES = SEDES.map((sede) => sede.nombre);

export default function AdminCanchasScreen({ navigation }) {
  const [sedeSeleccionada, setSedeSeleccionada] = useState(NOMBRES_SEDES[0]);

  const canchas = useMemo(() => {
    const sede = SEDES.find((item) => item.nombre === sedeSeleccionada);
    return sede ? sede.canchas.map((cancha) => ({ ...cancha, reservadaHoy: cancha.id % 2 === 1 })) : [];
  }, [sedeSeleccionada]);

  return (
    <ScreenContainer>
      <SectionHeader eyebrow="Sucursales" title="Canchas" />

      <PillSelector options={NOMBRES_SEDES} value={sedeSeleccionada} onChange={setSedeSeleccionada} />

      {canchas.map((cancha) => (
        <ListRow
          key={cancha.id}
          icon="football-outline"
          title={cancha.nombre}
          subtitle={`${cancha.tipo} · ${cancha.superficie}`}
          meta={`Capacidad máx. ${cancha.capacidad} personas`}
          right={
            <Badge
              label={cancha.reservadaHoy ? 'Reservada hoy' : 'Sin reservar'}
              tone={cancha.reservadaHoy ? 'warning' : 'neutral'}
            />
          }
          onPress={() => navigation.navigate('AdminCanchaForm', { cancha, sede: sedeSeleccionada })}
        />
      ))}

      <View style={styles.actions}>
        <PrimaryButton
          title="Configurar horarios"
          variant="outline"
          onPress={() => navigation.navigate('AdminHorarios', { sede: sedeSeleccionada })}
        />
        <PrimaryButton
          title="+ Agregar cancha"
          onPress={() => navigation.navigate('AdminCanchaForm', { sede: sedeSeleccionada })}
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
