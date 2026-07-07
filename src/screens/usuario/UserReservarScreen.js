import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import PillSelector from '../../components/PillSelector';
import PrimaryButton from '../../components/PrimaryButton';
import Card from '../../components/Card';
import { SEDES, canchasDeSede } from '../../data/sedes';
import { colors, spacing, typography } from '../../theme/colors';

const SEDES_DISPONIBLES = SEDES.filter((sede) => sede.activa).map((sede) => sede.nombre);
const FECHAS = ['Hoy', 'Mañana', 'Pasado mañana'];

export default function UserReservarScreen({ navigation }) {
  const [sede, setSede] = useState(SEDES_DISPONIBLES[0]);
  const [cancha, setCancha] = useState(canchasDeSede(SEDES_DISPONIBLES[0])[0]);
  const [fecha, setFecha] = useState('Hoy');

  const canchasDisponibles = useMemo(() => canchasDeSede(sede), [sede]);

  return (
    <ScreenContainer>
      <SectionHeader title="Reservaciones" subtitle="¡Reserva un lugar para ti!" />

      <PillSelector label="Sucursal" options={SEDES_DISPONIBLES} value={sede} onChange={setSede} />
      <PillSelector label="Cancha" options={canchasDisponibles} value={cancha} onChange={setCancha} />
      <PillSelector label="Fecha" options={FECHAS} value={fecha} onChange={setFecha} />

      <Card style={styles.summary}>
        <Text style={typography.body}>
          {sede} · {cancha}
        </Text>
        <Text style={styles.summaryMuted}>{fecha}</Text>
      </Card>

      <PrimaryButton
        title="Revisar disponibilidad"
        onPress={() => navigation.navigate('UserDisponibilidad', { sede, cancha, fecha })}
        style={{ marginTop: spacing.md }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summary: {
    marginTop: spacing.sm,
  },
  summaryMuted: {
    ...typography.caption,
    marginTop: spacing.xs,
    color: colors.textMuted,
  },
});
