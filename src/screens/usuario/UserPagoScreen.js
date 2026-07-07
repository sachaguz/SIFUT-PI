import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import FormInput from '../../components/FormInput';
import PillSelector from '../../components/PillSelector';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, spacing, typography } from '../../theme/colors';

const METODOS = ['Tarjeta', 'Transferencia'];

export default function UserPagoScreen({ navigation, route }) {
  const { sede, cancha, fecha, hora, precio } = route.params;
  const [metodo, setMetodo] = useState(METODOS[0]);
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [nombreTarjeta, setNombreTarjeta] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [cvv, setCvv] = useState('');

  const handlePagar = () => {
    if (metodo === 'Tarjeta' && (!numeroTarjeta || !nombreTarjeta || !vencimiento || !cvv)) {
      Alert.alert('Faltan datos', 'Completa los datos de la tarjeta.');
      return;
    }
    const folio = `RSV-${Math.floor(1000 + Math.random() * 9000)}`;
    navigation.navigate('UserReservaConfirmada', { sede, cancha, fecha, hora, precio, folio });
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Confirmar y pagar</Text>

      <Card>
        <Text style={typography.subtitle}>
          {sede} · {cancha}
        </Text>
        <Text style={styles.meta}>
          {fecha} · {hora}
        </Text>
        <Text style={styles.precio}>${precio} MXN</Text>
      </Card>

      <PillSelector label="Método de pago" options={METODOS} value={metodo} onChange={setMetodo} />

      {metodo === 'Tarjeta' ? (
        <>
          <FormInput
            label="Número de tarjeta"
            placeholder="0000 0000 0000 0000"
            keyboardType="numeric"
            value={numeroTarjeta}
            onChangeText={setNumeroTarjeta}
          />
          <FormInput label="Nombre en la tarjeta" placeholder="Nombre completo" value={nombreTarjeta} onChangeText={setNombreTarjeta} />
          <View style={styles.row}>
            <FormInput
              label="Vencimiento"
              placeholder="MM/AA"
              value={vencimiento}
              onChangeText={setVencimiento}
              containerStyle={{ flex: 1, marginRight: spacing.sm }}
            />
            <FormInput label="CVV" placeholder="123" keyboardType="numeric" value={cvv} onChangeText={setCvv} containerStyle={{ flex: 1 }} />
          </View>
        </>
      ) : (
        <Text style={styles.transferInfo}>
          Se generará una referencia bancaria para completar tu transferencia dentro de las próximas 24 horas.
        </Text>
      )}

      <PrimaryButton title={`Pagar $${precio} MXN`} onPress={handlePagar} style={{ marginTop: spacing.md }} />
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
