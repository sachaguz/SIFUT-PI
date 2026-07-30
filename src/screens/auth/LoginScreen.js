import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Alert from '../../services/alert';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { colors, fonts, radius, spacing, typography } from '../../theme/colors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Faltan datos', 'Ingresa tu correo y contraseña.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al iniciar sesión. Verifica tu conexión.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.logoWrap}>
        <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.appName}>SIFut</Text>
        <Text style={styles.title}>Inicio de sesión</Text>
      </View>

      <FormInput
        label="Correo electrónico"
        icon="person-outline"
        placeholder="usuario@correo.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <FormInput
        label="Contraseña"
        icon="lock-closed-outline"
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <View style={styles.row}>
        <TouchableOpacity style={styles.checkboxRow} onPress={() => setRemember((prev) => !prev)}>
          <Ionicons
            name={remember ? 'checkbox' : 'square-outline'}
            size={20}
            color={colors.primary}
          />
          <Text style={styles.checkboxLabel}>Recordar contraseña</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.link}>Recuperar contraseña</Text>
        </TouchableOpacity>
      </View>

      <PrimaryButton title="Ingresar" onPress={handleLogin} loading={loading} style={{ marginTop: spacing.md }} />

      <View style={styles.footer}>
        <Text style={typography.body}>¿No tienes cuenta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Regístrate</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logoWrap: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  logo: {
    width: 96,
    height: 96,
    marginBottom: spacing.sm,
  },
  appName: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.primary,
    letterSpacing: 1,
  },
  title: {
    ...typography.body,
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  checkboxLabel: {
    ...typography.body,
    marginLeft: spacing.xs,
  },
  link: {
    color: colors.secondary,
    fontFamily: fonts.semiBold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
});
