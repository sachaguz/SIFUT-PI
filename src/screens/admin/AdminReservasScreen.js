import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Alert from '../../services/alert';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import Card from '../../components/Card';
import ListRow from '../../components/ListRow';
import Badge from '../../components/Badge';
import PillSelector from '../../components/PillSelector';
import FormInput from '../../components/FormInput';
import api, { estadoLabel } from '../../services/api';
import { colors, spacing, typography } from '../../theme/colors';

const ESTADOS = ['Todas', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA'];
const TODAS_SEDES = 'Todas las sedes';

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminReservasScreen() {
  const [reservas, setReservas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [desde, setDesde] = useState(hoyISO());
  const [hasta, setHasta] = useState(hoyISO());
  const [estado, setEstado] = useState('Todas');
  const [sedeFiltro, setSedeFiltro] = useState(TODAS_SEDES);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      api.get('/sedes').then((r) => setSedes(r.data));
    }, [])
  );

  const fetchReservas = useCallback(() => {
    setLoading(true);
    const params = { desde, hasta };
    if (estado !== 'Todas') params.estado = estado;
    const sede = sedes.find((s) => s.nombre === sedeFiltro);
    if (sede) params.sedeId = sede.id;
    api.get('/reservas', { params }).then((r) => setReservas(r.data)).finally(() => setLoading(false));
  }, [desde, hasta, estado, sedeFiltro, sedes]);

  useEffect(() => {
    fetchReservas();
  }, [desde, hasta, estado, sedeFiltro]);

  const handleCancelar = (reserva) => {
    Alert.alert('Cancelar reserva', `¿Cancelar la reserva de ${reserva.user?.nombre || 'este usuario'}?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.patch(`/reservas/${reserva.id}/cancelar`);
            fetchReservas();
          } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'No se pudo cancelar la reserva.');
          }
        },
      },
    ]);
  };

  const totalConfirmadas = reservas.filter((r) => r.estado === 'CONFIRMADA').length;
  const totalCanceladas = reservas.filter((r) => r.estado === 'CANCELADA').length;
  const ingresoTotal = reservas
    .filter((r) => r.estado !== 'CANCELADA')
    .reduce((sum, r) => sum + Number(r.totalPagado || 0), 0);

  return (
    <ScreenContainer>
      <SectionHeader title="Reservas" subtitle="Tablero filtrable de reservaciones" />

      <View style={styles.summaryRow}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{reservas.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{totalConfirmadas}</Text>
          <Text style={styles.summaryLabel}>Confirmadas</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{totalCanceladas}</Text>
          <Text style={styles.summaryLabel}>Canceladas</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryValue}>${ingresoTotal.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Ingreso</Text>
        </Card>
      </View>

      <View style={styles.row}>
        <FormInput label="Desde" value={desde} onChangeText={setDesde} containerStyle={{ flex: 1, marginRight: spacing.sm }} />
        <FormInput label="Hasta" value={hasta} onChangeText={setHasta} containerStyle={{ flex: 1 }} />
      </View>

      <PillSelector label="Estado" options={ESTADOS} value={estado} onChange={setEstado} />
      <PillSelector
        label="Sede"
        options={[TODAS_SEDES, ...sedes.map((s) => s.nombre)]}
        value={sedeFiltro}
        onChange={setSedeFiltro}
      />

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : reservas.length === 0 ? (
        <Text style={styles.empty}>No hay reservaciones para este filtro.</Text>
      ) : (
        reservas.map((item) => {
          const sedeName = item.cancha?.sede?.nombre || '';
          const canchaName = item.cancha?.nombre || '';
          const userName = item.user ? `${item.user.nombre} ${item.user.apellido}` : '—';
          const cancelable = item.estado === 'CONFIRMADA';
          const tone = item.estado === 'CANCELADA' ? 'neutral' : item.estado === 'COMPLETADA' ? 'success' : 'warning';
          return (
            <ListRow
              key={item.id}
              icon="calendar-outline"
              title={`${sedeName} · ${canchaName}`}
              subtitle={`${userName} · ${item.horaInicio} - ${item.horaFin}`}
              meta={`$${Number(item.totalPagado).toLocaleString()} MXN`}
              right={(
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Badge label={estadoLabel(item.estado)} tone={tone} />
                  {cancelable ? (
                    <TouchableOpacity
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      onPress={() => handleCancelar(item)}
                    >
                      <Ionicons name="close-circle-outline" size={20} color={colors.danger} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              )}
            />
          );
        })
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flexGrow: 1,
    flexBasis: '22%',
    alignItems: 'center',
  },
  summaryValue: {
    ...typography.displaySmall,
  },
  summaryLabel: {
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
