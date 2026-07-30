import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Alert from '../../services/alert';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import FormInput from '../../components/FormInput';
import PillSelector from '../../components/PillSelector';
import PrimaryButton from '../../components/PrimaryButton';
import api from '../../services/api';
import { colors, spacing, typography } from '../../theme/colors';

const METODOS = ['Tarjeta', 'Transferencia'];
const METODO_ENUM = { Tarjeta: 'TARJETA', Transferencia: 'TRANSFERENCIA' };

function formatNumeroTarjeta(text) {
  const digits = text.replace(/\D/g, '').slice(0, 16);
  return digits.match(/.{1,4}/g)?.join('-') || digits;
}

function formatVencimiento(text) {
  const digits = text.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function UserPagoScreen({ navigation, route }) {
  const { canchaId, sedeName, canchaName, fecha, fechaLabel, horaInicio, horaFin, precio } = route.params;
  const [metodo, setMetodo] = useState(METODOS[0]);
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [nombreTarjeta, setNombreTarjeta] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [cvv, setCvv] = useState('');
  const [saving, setSaving] = useState(false);

  const handlePagar = async () => {
    if (metodo === 'Tarjeta' && (!numeroTarjeta || !nombreTarjeta || !vencimiento || !cvv)) {
      Alert.alert('Faltan datos', 'Completa los datos de la tarjeta.');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('/reservas', {
        canchaId,
        fecha,
        horaInicio,
        horaFin,
        metodoPago: METODO_ENUM[metodo],
      });
      navigation.navigate('UserReservaConfirmada', {
        sedeName,
        canchaName,
        fechaLabel,
        hora: `${horaInicio} - ${horaFin}`,
        precio,
        folio: data.folio,
      });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo completar la reserva.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Confirmar y pagar</Text>

      <Card>
        <Text style={typography.subtitle}>
          {sedeName} · {canchaName}
        </Text>
        <Text style={styles.meta}>
          {fechaLabel} · {horaInicio} - {horaFin}
        </Text>
        <Text style={styles.precio}>${precio} MXN</Text>
      </Card>

      <PillSelector label="Método de pago" options={METODOS} value={metodo} onChange={setMetodo} />

      {metodo === 'Tarjeta' ? (
        <>
          <FormInput
            label="Número de tarjeta"
            placeholder="0000-0000-0000-0000"
            keyboardType="numeric"
            maxLength={19}
            value={numeroTarjeta}
            onChangeText={(text) => setNumeroTarjeta(formatNumeroTarjeta(text))}
          />
          <FormInput label="Nombre en la tarjeta" placeholder="Nombre completo" value={nombreTarjeta} onChangeText={setNombreTarjeta} />
          <View style={styles.row}>
            <FormInput
              label="Vencimiento"
              placeholder="MM/AA"
              keyboardType="numeric"
              maxLength={5}
              value={vencimiento}
              onChangeText={(text) => setVencimiento(formatVencimiento(text))}
              containerStyle={{ flex: 1, marginRight: spacing.sm }}
            />
            <FormInput
              label="CVV"
              placeholder="123"
              keyboardType="numeric"
              maxLength={4}
              value={cvv}
              onChangeText={(text) => setCvv(text.replace(/\D/g, '').slice(0, 4))}
              containerStyle={{ flex: 1 }}
            />
          </View>
        </>
      ) : (
        <Text style={styles.transferInfo}>
          Se generará una referencia bancaria para completar tu transferencia dentro de las próximas 24 horas.
        </Text>
      )}

      <PrimaryButton title={saving ? 'Procesando...' : `Pagar $${precio} MXN`} onPress={handlePagar} disabled={saving} style={{ marginTop: spacing.md }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.title,
    marginBottom: spacing.md,
  },
  meta: {
    ...typography.caption,
    marginTop: 4,
  },
  precio: {
    ...typography.displaySmall,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
  },
  transferInfo: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
});
