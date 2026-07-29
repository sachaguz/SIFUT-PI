import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import Card from '../../components/Card';
import ListRow from '../../components/ListRow';
import PrimaryButton from '../../components/PrimaryButton';
import api from '../../services/api';
import { colors, spacing, typography } from '../../theme/colors';

export default function AdminTesoreriaScreen({ navigation }) {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchResumen = useCallback(() => {
    setLoading(true);
    api.get('/pagos/resumen').then((r) => setResumen(r.data)).finally(() => setLoading(false));
  }, []);

  useFocusEffect(fetchResumen);

  const aprobarPago = async (pago) => {
    try {
      await api.patch(`/pagos/${pago.id}/aprobar`);
      Alert.alert('Pago validado', 'Se confirmó la recepción de fondos.');
      fetchResumen();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo aprobar el pago.');
    }
  };

  if (loading || !resumen) {
    return <ScreenContainer><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} /></ScreenContainer>;
  }

  return (
    <ScreenContainer>
      <SectionHeader eyebrow="Finanzas" title="Tesorería" subtitle="Control financiero centralizado" />

      <View style={styles.summaryRow}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryValue}>${Number(resumen.ingresoDiario.total).toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Ingresos de hoy</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryValue}>${Number(resumen.ingresoMensual.total).toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Ingresos del mes</Text>
        </Card>
      </View>

      <Text style={typography.subtitle}>Pagos pendientes de validar</Text>
      {resumen.pendientes.length === 0 ? (
        <Text style={styles.empty}>No hay pagos pendientes por validar.</Text>
      ) : (
        resumen.pendientes.map((pago) => {
          const userName = pago.reserva?.user ? `${pago.reserva.user.nombre} ${pago.reserva.user.apellido}` : '';
          return (
            <ListRow
              key={pago.id}
              icon="cash-outline"
              title={pago.concepto}
              subtitle={`${pago.metodo} · ${userName}`}
              meta={`$${Number(pago.monto)} MXN`}
              right={<PrimaryButton title="Aprobar" small onPress={() => aprobarPago(pago)} />}
            />
          );
        })
      )}

      <View style={styles.actions}>
        <PrimaryButton title="Pagos realizados" variant="outline" onPress={() => navigation.navigate('AdminPagosRealizados')} />
        <PrimaryButton title="Generar reporte financiero" variant="ghost" onPress={() => navigation.navigate('AdminReportes')} style={{ marginTop: spacing.sm }} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summaryRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  summaryCard: { flex: 1, alignItems: 'center' },
  summaryValue: { ...typography.displaySmall },
  summaryLabel: { ...typography.caption, marginTop: spacing.xs },
  empty: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm, marginBottom: spacing.md },
  actions: { marginTop: spacing.md },
});
