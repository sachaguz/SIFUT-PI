import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import PrimaryButton from '../../components/PrimaryButton';
import api, { formatDate, estadoLabel } from '../../services/api';
import { colors, fonts, spacing, typography } from '../../theme/colors';

const TONE_BY_ESTADO = { CONFIRMADA: 'success', COMPLETADA: 'neutral', CANCELADA: 'danger' };

export default function UserReservaDetalleScreen({ navigation, route }) {
  const { reserva } = route.params;
  const [estado, setEstado] = useState(reserva.estado);
  const [cancelling, setCancelling] = useState(false);

  const handleCancelar = () => {
    Alert.alert('Cancelar reserva', '¿Deseas cancelar esta reservación? Se procesará el reembolso a tu método de pago original.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          try {
            await api.patch(`/reservas/${reserva.id}/cancelar`);
            setEstado('CANCELADA');
            Alert.alert('Reserva cancelada', 'Tu reserva ha sido cancelada exitosamente.');
          } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'No se pudo cancelar la reserva.');
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <Card style={styles.card}>
        <Ionicons name="qr-code-outline" size={96} color={colors.text} style={{ alignSelf: 'center' }} />
        <Text style={styles.folio}>{reserva.folio}</Text>
        <Badge label={estadoLabel(estado)} tone={TONE_BY_ESTADO[estado]} />
      </Card>

      <Card>
        <Row label="Sede" value={reserva.cancha?.sede?.nombre || ''} />
        <Row label="Cancha" value={reserva.cancha?.nombre || ''} />
        <Row label="Fecha" value={formatDate(reserva.fecha)} />
        <Row label="Horario" value={`${reserva.horaInicio} - ${reserva.horaFin}`} />
        <Row label="Total pagado" value={`$${Number(reserva.totalPagado)} MXN`} />
      </Card>

      {estado === 'CONFIRMADA' ? (
        <PrimaryButton
          title={cancelling ? 'Cancelando...' : 'Cancelar reserva'}
          variant="danger"
          onPress={handleCancelar}
          disabled={cancelling}
          style={{ marginTop: spacing.md }}
        />
      ) : null}
    </ScreenContainer>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  folio: {
    ...typography.displaySmall,
    color: colors.text,
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 2,
  },
  label: {
    ...typography.body,
    color: colors.textMuted,
  },
  value: {
    ...typography.body,
    fontFamily: fonts.semiBold,
  },
});
