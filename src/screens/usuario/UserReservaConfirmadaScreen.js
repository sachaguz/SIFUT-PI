import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, spacing, typography } from '../../theme/colors';

export default function UserReservaConfirmadaScreen({ navigation, route }) {
  const { sede, cancha, fecha, hora, precio, folio } = route.params;

  return (
    <ScreenContainer>
      <View style={styles.iconWrap}>
        <Ionicons name="checkmark-circle" size={64} color={colors.primary} />
      </View>
      <Text style={styles.title}>¡Reserva confirmada!</Text>

      <Card style={styles.card}>
        <Ionicons name="qr-code-outline" size={96} color={colors.text} style={{ alignSelf: 'center' }} />
        <Text style={styles.folio}>Folio: {folio}</Text>
        <Text style={styles.detail}>
          {sede} · {cancha}
        </Text>
        <Text style={styles.detail}>
          {fecha} · {hora}
        </Text>
        <Text style={styles.detail}>Total pagado: ${precio} MXN</Text>
      </Card>

      <PrimaryButton
        title="Ver mis reservas"
        onPress={() => navigation.navigate('UsuarioTabs', { screen: 'MisReservas' })}
        style={{ marginTop: spacing.md }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  title: {
    ...typography.title,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  card: {
    alignItems: 'center',
  },
  folio: {
    ...typography.subtitle,
    marginTop: spacing.sm,
  },
  detail: {
    ...typography.body,
    marginTop: 4,
  },
});
