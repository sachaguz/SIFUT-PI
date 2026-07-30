import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import PillSelector from '../../components/PillSelector';
import PrimaryButton from '../../components/PrimaryButton';
import Card from '../../components/Card';
import api, { localDateString } from '../../services/api';
import { colors, spacing, typography } from '../../theme/colors';

function buildDateOptions() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);
  return [
    { label: 'Hoy', value: localDateString(today) },
    { label: 'Mañana', value: localDateString(tomorrow) },
    { label: 'Pasado mañana', value: localDateString(dayAfter) },
  ];
}

const FECHAS = buildDateOptions();

export default function UserReservarScreen({ navigation }) {
  const [sedes, setSedes] = useState([]);
  const [sedeId, setSedeId] = useState('');
  const [canchas, setCanchas] = useState([]);
  const [canchaId, setCanchaId] = useState('');
  const [fechaLabel, setFechaLabel] = useState(FECHAS[0].label);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      api.get('/sedes').then((r) => {
        const activas = r.data.filter((s) => s.activa);
        setSedes(activas);
        if (activas.length > 0) setSedeId(activas[0].id);
      }).finally(() => setLoading(false));
    }, [])
  );

  useEffect(() => {
    if (sedeId) {
      api.get(`/canchas?sedeId=${sedeId}`).then((r) => {
        setCanchas(r.data);
        if (r.data.length > 0) setCanchaId(r.data[0].id);
      });
    }
  }, [sedeId]);

  if (loading) {
    return <ScreenContainer><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} /></ScreenContainer>;
  }

  const selectedSede = sedes.find((s) => s.id === sedeId);
  const selectedCancha = canchas.find((c) => c.id === canchaId);
  const selectedFecha = FECHAS.find((f) => f.label === fechaLabel);

  return (
    <ScreenContainer>
      <SectionHeader title="Reservaciones" subtitle="¡Reserva un lugar para ti!" />

      <PillSelector
        label="Sucursal"
        options={sedes.map((s) => s.nombre)}
        value={selectedSede?.nombre || ''}
        onChange={(label) => {
          const s = sedes.find((item) => item.nombre === label);
          if (s) setSedeId(s.id);
        }}
      />
      <PillSelector
        label="Cancha"
        options={canchas.map((c) => c.nombre)}
        value={selectedCancha?.nombre || ''}
        onChange={(label) => {
          const c = canchas.find((item) => item.nombre === label);
          if (c) setCanchaId(c.id);
        }}
      />
      <PillSelector
        label="Fecha"
        options={FECHAS.map((f) => f.label)}
        value={fechaLabel}
        onChange={setFechaLabel}
      />

      <Card style={styles.summary}>
        <Text style={typography.body}>
          {selectedSede?.nombre || ''} · {selectedCancha?.nombre || ''}
        </Text>
        <Text style={styles.summaryMuted}>{fechaLabel}</Text>
      </Card>

      <PrimaryButton
        title="Revisar disponibilidad"
        onPress={() => navigation.navigate('UserDisponibilidad', {
          canchaId,
          canchaName: selectedCancha?.nombre || '',
          sedeName: selectedSede?.nombre || '',
          fecha: selectedFecha?.value || '',
          fechaLabel,
          precio: Number(selectedCancha?.precioPorHora || 0),
        })}
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
