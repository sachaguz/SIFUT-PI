import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import Card from '../../components/Card';
import PillSelector from '../../components/PillSelector';
import FormInput from '../../components/FormInput';
import ListRow from '../../components/ListRow';
import Badge from '../../components/Badge';
import api, { estadoLabel, formatDate } from '../../services/api';
import { colors, spacing, typography } from '../../theme/colors';

const METODOS = ['Todos', 'TARJETA', 'EFECTIVO', 'TRANSFERENCIA'];
const METODO_LABELS = { Todos: 'Todos', TARJETA: 'Tarjeta', EFECTIVO: 'Efectivo', TRANSFERENCIA: 'Transferencia' };
const ESTADOS = ['Todos', 'APROBADO', 'PENDIENTE', 'RECHAZADO'];
const ESTADO_TONE = { APROBADO: 'success', PENDIENTE: 'warning', RECHAZADO: 'danger' };

function haceUnMesISO() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminPagosRealizadosScreen() {
  const [pagos, setPagos] = useState([]);
  const [metodo, setMetodo] = useState('Todos');
  const [estado, setEstado] = useState('APROBADO');
  const [desde, setDesde] = useState(haceUnMesISO());
  const [hasta, setHasta] = useState(hoyISO());
  const [loading, setLoading] = useState(true);

  const fetchPagos = useCallback(() => {
    setLoading(true);
    const params = { desde, hasta };
    if (metodo !== 'Todos') params.metodo = metodo;
    if (estado !== 'Todos') params.estado = estado;
    api.get('/pagos', { params }).then((r) => setPagos(r.data)).finally(() => setLoading(false));
  }, [metodo, estado, desde, hasta]);

  useFocusEffect(fetchPagos);
  useEffect(() => {
    fetchPagos();
  }, [metodo, estado, desde, hasta]);

  const total = pagos.reduce((sum, p) => sum + Number(p.monto), 0);

  if (loading) {
    return <ScreenContainer><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} /></ScreenContainer>;
  }

  return (
    <ScreenContainer>
      <SectionHeader title="Pagos" subtitle="Historial filtrable de transacciones" />

      <Card style={styles.totalCard}>
        <Text style={styles.totalValue}>${total.toLocaleString()}</Text>
        <Text style={styles.totalLabel}>{pagos.length} transacciones en el rango seleccionado</Text>
      </Card>

      <View style={styles.row}>
        <FormInput label="Desde" value={desde} onChangeText={setDesde} containerStyle={{ flex: 1, marginRight: spacing.sm }} />
        <FormInput label="Hasta" value={hasta} onChangeText={setHasta} containerStyle={{ flex: 1 }} />
      </View>

      <PillSelector label="Estado" options={ESTADOS} value={estado} onChange={setEstado} />
      <PillSelector
        label="Método"
        options={METODOS.map((m) => METODO_LABELS[m])}
        value={METODO_LABELS[metodo]}
        onChange={(label) => {
          const key = Object.keys(METODO_LABELS).find((k) => METODO_LABELS[k] === label);
          setMetodo(key || 'Todos');
        }}
      />

      {pagos.length === 0 ? (
        <Text style={styles.empty}>No hay transacciones para este filtro.</Text>
      ) : (
        pagos.map((pago) => (
          <ListRow
            key={pago.id}
            icon="receipt-outline"
            title={pago.concepto}
            subtitle={`${METODO_LABELS[pago.metodo] || pago.metodo} · ${formatDate(pago.fecha)}`}
            meta={pago.folio}
            right={(
              <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
                <Badge label={`$${Number(pago.monto)}`} tone="neutral" />
                <Badge label={estadoLabel(pago.estado)} tone={ESTADO_TONE[pago.estado]} />
              </View>
            )}
          />
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  totalCard: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalValue: {
    ...typography.displaySmall,
  },
  totalLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
  },
  empty: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});
