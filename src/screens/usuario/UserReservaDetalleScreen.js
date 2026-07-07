import { Alert, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, fonts, spacing, typography } from '../../theme/colors';

const TONE_BY_ESTADO = { Confirmada: 'success', Completada: 'neutral', Cancelada: 'danger' };

export default function UserReservaDetalleScreen({ navigation, route }) {
  const { reserva } = route.params;

  const handleCancelar = () => {
    Alert.alert('Cancelar reserva', '¿Deseas cancelar esta reservación? Se procesará el reembolso a tu método de pago original.', [
      { text: 'No', style: 'cancel' },
      { text: 'Sí, cancelar', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <ScreenContainer>
      <Card style={styles.card}>
        <Ionicons name="qr-code-outline" size={96} color={colors.text} style={{ alignSelf: 'center' }} />
        <Text style={styles.folio}>{reserva.folio}</Text>
        <Badge label={reserva.estado} tone={TONE_BY_ESTADO[reserva.estado]} />
      </Card>

      <Card>
        <Row label="Sede" value={reserva.sede} />
        <Row label="Cancha" value={reserva.cancha} />
        <Row label="Fecha" value={reserva.fecha} />
        <Row label="Horario" value={reserva.hora} />
        <Row label="Total pagado" value={`$${reserva.precio} MXN`} />
      </Card>

      {reserva.estado === 'Confirmada' ? (
        <PrimaryButton title="Cancelar reserva" variant="danger" onPress={handleCancelar} style={{ marginTop: spacing.md }} />
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
