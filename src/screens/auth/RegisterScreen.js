import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Alert from '../../services/alert';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../theme/colors';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    nombres: '',
    apellidoPaterno: '',
    correo: '',
    password: '',
    repitePassword: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const update = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.nombres || !form.correo || !form.password) {
      Alert.alert('Faltan datos', 'Completa todos los campos requeridos.');
      return;
    }
    if (form.password.length < 8) {
      Alert.alert('Contraseña muy corta', 'La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (form.password !== form.repitePassword) {
      Alert.alert('Las contraseñas no coinciden', 'Verifica que ambas contraseñas sean iguales.');
      return;
    }
    if (!acceptTerms || !acceptPrivacy) {
      Alert.alert('Falta aceptar', 'Debes aceptar los términos y la política de privacidad.');
      return;
    }
    setLoading(true);
    try {
      await register({
        nombre: form.nombres,
        apellido: form.apellidoPaterno,
        email: form.correo,
        password: form.password,
      });
      Alert.alert('¡Cuenta creada con éxito!', 'Ya puedes iniciar sesión.', [
        { text: 'Ingresar', onPress: () => navigation.replace('Login') },
      ]);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al crear la cuenta.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={20} color={colors.text} />
        <Text style={styles.backText}>Atrás</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Crear nueva cuenta</Text>

      <FormInput label="Nombre(s)" placeholder="Nombre(s)" value={form.nombres} onChangeText={update('nombres')} />
      <FormInput
        label="Apellido paterno"
        placeholder="Apellido paterno"
        value={form.apellidoPaterno}
        onChangeText={update('apellidoPaterno')}
      />
      <FormInput
        label="Correo electrónico"
        placeholder="correo@correo.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={form.correo}
        onChangeText={update('correo')}
      />
      <FormInput
        label="Contraseña"
        placeholder="Mínimo 8 caracteres"
        secureTextEntry
        value={form.password}
        onChangeText={update('password')}
      />
      <FormInput
        label="Repite tu contraseña"
        placeholder="Repite tu contraseña"
        secureTextEntry
        value={form.repitePassword}
        onChangeText={update('repitePassword')}
      />

      <TouchableOpacity style={styles.checkboxRow} onPress={() => setAcceptTerms((prev) => !prev)}>
        <Ionicons name={acceptTerms ? 'checkbox' : 'square-outline'} size={20} color={colors.primary} />
        <Text style={styles.checkboxLabel}>Acepto términos y condiciones</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.checkboxRow} onPress={() => setAcceptPrivacy((prev) => !prev)}>
        <Ionicons name={acceptPrivacy ? 'checkbox' : 'square-outline'} size={20} color={colors.primary} />
        <Text style={styles.checkboxLabel}>Acepto política de privacidad</Text>
      </TouchableOpacity>

      <PrimaryButton title="Crear cuenta" onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.lg }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backText: {
    ...typography.body,
    marginLeft: 4,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.lg,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  checkboxLabel: {
    ...typography.body,
    marginLeft: spacing.xs,
    flexShrink: 1,
  },
});
