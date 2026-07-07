import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import Card from '../../components/Card';
import ListRow from '../../components/ListRow';
import Badge from '../../components/Badge';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, spacing, typography } from '../../theme/colors';

const PAGOS_PENDIENTES_INICIALES = [
  { id: '1', concepto: 'Renta Cancha 1 - Sede Centro Histórico', metodo: 'Efectivo', monto: 450, usuario: 'Juan Pérez' },
  { id: '2', concepto: 'Inscripción Equipo Halcones', metodo: 'Transferencia', monto: 1200, usuario: 'Regina Cortés' },
];

export default function AdminTesoreriaScreen({ navigation }) {
  const [pendientes, setPendientes] = useState(PAGOS_PENDIENTES_INICIALES);

  const aprobarPago = (pago) => {
    setPendientes((prev) => prev.filter((item) => item.id !== pago.id));
    Alert.alert('Pago validado', `Se confirmó la recepción de fondos de ${pago.usuario}.`);
  };

  return (
    <ScreenContainer>
      <SectionHeader eyebrow="Finanzas" title="Tesorería" subtitle="Control financiero centralizado" />

      <View style={styles.summaryRow}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryValue}>$18,450</Text>
          <Text style={styles.summaryLabel}>Ingresos de hoy</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryValue}>$212,300</Text>
          <Text style={styles.summaryLabel}>Ingresos del mes</Text>
        </Card>
      </View>

      <Text style={typography.subtitle}>Pagos pendientes de validar</Text>
      {pendientes.length === 0 ? (
        <Text style={styles.empty}>No hay pagos pendientes por validar.</Text>
      ) : (
        pendientes.map((pago) => (
          <ListRow
            key={pago.id}
            icon="cash-outline"
            title={pago.concepto}
            subtitle={`${pago.metodo} · ${pago.usuario}`}
            meta={`$${pago.monto} MXN`}
            right={
              <PrimaryButton title="Aprobar" small onPress={() => aprobarPago(pago)} />
            }
          />
        ))
      )}

      <View style={styles.actions}>
        <PrimaryButton
          title="Pagos realizados"
          variant="outline"
          onPress={() => navigation.navigate('AdminPagosRealizados')}
        />
        <PrimaryButton
          title="Generar reporte financiero"
          variant="ghost"
          onPress={() => navigation.navigate('AdminReportes')}
          style={{ marginTop: spacing.sm }}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    ...typography.displaySmall,
  },
  summaryLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  empty: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  actions: {
    marginTop: spacing.md,
  },
});
