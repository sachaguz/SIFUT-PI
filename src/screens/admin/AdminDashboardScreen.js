import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import Card from '../../components/Card';
import FormInput from '../../components/FormInput';
import BarChart from '../../components/BarChart';
import api from '../../services/api';
import { colors, spacing, typography } from '../../theme/colors';

const METODO_LABELS = { TARJETA: 'Tarjeta', EFECTIVO: 'Efectivo', TRANSFERENCIA: 'Transferencia' };
const ROL_LABELS = { ADMIN: 'Admin', ORGANIZADOR: 'Organizador', USUARIO: 'Usuario' };

function haceUnMesISO() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
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

  const reservasPorSede = sedes
    .map((s) => ({
      label: s.nombre,
      value: reservas.filter((r) => r.cancha?.sede?.nombre === s.nombre).length,
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const ingresoPorMetodo = Object.keys(METODO_LABELS)
    .map((key) => ({
      label: METODO_LABELS[key],
      value: pagos.filter((p) => p.metodo === key).reduce((sum, p) => sum + Number(p.monto), 0),
    }))
    .filter((d) => d.value > 0);

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
            <Text style={styles.chartTitle}>Reservas por sede</Text>
            <BarChart data={reservasPorSede} color={colors.primary} />
          </Card>

          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Ingreso por método de pago</Text>
            <BarChart data={ingresoPorMetodo} color={colors.secondary} formatValue={(v) => `$${v.toLocaleString()}`} />
          </Card>

          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Usuarios por rol</Text>
            <BarChart data={usuariosPorRol} color={colors.accent} />
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
});
