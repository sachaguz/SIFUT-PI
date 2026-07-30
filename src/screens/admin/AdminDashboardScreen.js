import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import Card from '../../components/Card';
import FormInput from '../../components/FormInput';
import LineChart from '../../components/LineChart';
import api, { localDateString } from '../../services/api';
import { colors, spacing, typography } from '../../theme/colors';

const ROL_LABELS = { ADMIN: 'Admin', ORGANIZADOR: 'Organizador', USUARIO: 'Usuario' };

function haceUnMesISO() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return localDateString(d);
}

function hoyISO() {
  return localDateString();
}

// Dates here are nominal calendar days (no real time-of-day), stored and
// filtered as UTC midnight on the backend - matching that with UTC getters
// (rather than local ones) keeps the day-bucketing correct regardless of
// the viewer's timezone. See localDateString() in api.js for the same
// reasoning applied to "today" defaults.
function dayKeyUTC(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

function buildDailySeries(desde, hasta, items, getDate, getValue) {
  const days = [];
  const cursor = new Date(`${desde}T00:00:00.000Z`);
  const end = new Date(`${hasta}T00:00:00.000Z`);
  while (cursor <= end && days.length < 366) {
    days.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days.map((day) => {
    const key = dayKeyUTC(day);
    const value = items
      .filter((item) => dayKeyUTC(new Date(getDate(item))) === key)
      .reduce((sum, item) => sum + getValue(item), 0);
    const label = `${String(day.getUTCDate()).padStart(2, '0')}/${String(day.getUTCMonth() + 1).padStart(2, '0')}`;
    return { label, value };
  });
}

export default function AdminDashboardScreen() {
  const [desde, setDesde] = useState(haceUnMesISO());
  const [hasta, setHasta] = useState(hoyISO());
  const [sedes, setSedes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [torneos, setTorneos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      Promise.all([api.get('/sedes'), api.get('/usuarios'), api.get('/torneos')]).then(([s, u, t]) => {
        setSedes(s.data);
        setUsuarios(u.data);
        setTorneos(t.data);
      });
    }, [])
  );

  const fetchRango = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/reservas', { params: { desde, hasta } }),
      api.get('/pagos', { params: { desde, hasta, estado: 'APROBADO' } }),
    ]).then(([r, p]) => {
      setReservas(r.data);
      setPagos(p.data);
    }).finally(() => setLoading(false));
  }, [desde, hasta]);

  useEffect(() => {
    fetchRango();
  }, [desde, hasta]);

  const totalCanchas = sedes.reduce((sum, s) => sum + (s.canchas?.length || 0), 0);
  const torneosActivos = torneos.filter((t) => t.estado === 'ACTIVO').length;
  const ingresoRango = pagos.reduce((sum, p) => sum + Number(p.monto), 0);

  const reservasPorDia = buildDailySeries(desde, hasta, reservas, (r) => r.fecha, () => 1);
  const ingresoPorDia = buildDailySeries(desde, hasta, pagos, (p) => p.fecha, (p) => Number(p.monto));
  const labelEvery = Math.max(1, Math.ceil(reservasPorDia.length / 8));

  const usuariosPorRol = Object.keys(ROL_LABELS)
    .map((key) => ({ label: ROL_LABELS[key], value: usuarios.filter((u) => u.role === key).length }))
    .filter((d) => d.value > 0);

  return (
    <ScreenContainer>
      <SectionHeader eyebrow="Panel" title="Resumen" subtitle="Vista general del sistema" />

      <View style={styles.cardsGrid}>
        <StatCard label="Sedes" value={sedes.length} />
        <StatCard label="Canchas" value={totalCanchas} />
        <StatCard label="Usuarios" value={usuarios.length} />
        <StatCard label="Torneos activos" value={torneosActivos} />
        <StatCard label="Reservas (rango)" value={reservas.length} />
        <StatCard label="Ingreso (rango)" value={`$${ingresoRango.toLocaleString()}`} />
      </View>

      <View style={styles.row}>
        <FormInput label="Desde" value={desde} onChangeText={setDesde} containerStyle={{ flex: 1, marginRight: spacing.sm }} />
        <FormInput label="Hasta" value={hasta} onChangeText={setHasta} containerStyle={{ flex: 1 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Reservas por día</Text>
            <LineChart data={reservasPorDia} color={colors.primary} labelEvery={labelEvery} />
          </Card>

          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Ingreso por día</Text>
            <LineChart
              data={ingresoPorDia}
              color={colors.secondary}
              formatValue={(v) => `$${v.toLocaleString()}`}
              labelEvery={labelEvery}
            />
          </Card>

          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Usuarios por rol</Text>
            <View style={styles.rolRow}>
              {usuariosPorRol.map((r) => (
                <View key={r.label} style={styles.rolItem}>
                  <Text style={styles.rolValue}>{r.value}</Text>
                  <Text style={styles.rolLabel}>{r.label}</Text>
                </View>
              ))}
            </View>
          </Card>
        </>
      )}
    </ScreenContainer>
  );
}

function StatCard({ label, value }) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: '30%',
    alignItems: 'center',
  },
  statValue: {
    ...typography.displaySmall,
  },
  statLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  chartCard: {
    marginBottom: spacing.md,
  },
  chartTitle: {
    ...typography.subtitle,
    marginBottom: spacing.md,
  },
  rolRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rolItem: {
    alignItems: 'center',
  },
  rolValue: {
    ...typography.displaySmall,
  },
  rolLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
});
