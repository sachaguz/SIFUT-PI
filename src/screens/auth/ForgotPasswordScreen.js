import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Alert from '../../services/alert';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, spacing, typography } from '../../theme/colors';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    if (!email) {
      Alert.alert('Falta el correo', 'Ingresa tu correo electrónico.');
      return;
    }
    navigation.navigate('ResetSent', { email });
  };

  return (
    <ScreenContainer>
      <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={20} color={colors.text} />
        <Text style={styles.backText}>Atrás</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Recuperar contraseña</Text>
      <Text style={styles.subtitle}>Ingresa tu correo electrónico</Text>

      <FormInput
        label="Correo"
        placeholder="correo@correo.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <PrimaryButton title="Ingresar" onPress={handleSubmit} style={{ marginTop: spacing.md }} />
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
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
});
