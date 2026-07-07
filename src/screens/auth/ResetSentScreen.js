import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, spacing, typography } from '../../theme/colors';

export default function ResetSentScreen({ navigation, route }) {
  const email = route.params?.email || 'tu correo registrado';

  return (
    <ScreenContainer>
      <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={20} color={colors.text} />
        <Text style={styles.backText}>Atrás</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Notificación de recuperar contraseña</Text>
      <Text style={styles.message}>
        Hemos enviado un mensaje al correo: {email}, sigue los pasos para recuperar tu contraseña.
      </Text>

      <PrimaryButton title="Listo" onPress={() => navigation.navigate('Login')} style={{ marginTop: spacing.lg }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backText: {
    ...typography.body,
    marginLeft: 4,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.md,
  },
  message: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 20,
  },
});
