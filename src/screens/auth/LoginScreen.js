import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import { loginAs } from '../../navigation/navigationRef';
import { colors, fonts, radius, spacing, typography } from '../../theme/colors';

const ROLES = [
  { key: 'AdminRoot', label: 'Administrador' },
  { key: 'OrganizadorRoot', label: 'Organizador' },
  { key: 'UsuarioRoot', label: 'Usuario' },
];

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [role, setRole] = useState(ROLES[2].key);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Faltan datos', 'Ingresa tu correo y contraseña.');
      return;
    }
    loginAs(role);
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

      <Text style={styles.roleLabel}>Selecciona tu rol (demo)</Text>
      <View style={styles.roleSelector}>
        {ROLES.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.rolePill, role === item.key && styles.rolePillActive]}
            onPress={() => setRole(item.key)}
          >
            <Text style={[styles.rolePillText, role === item.key && styles.rolePillTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <PrimaryButton title="Ingresar" onPress={handleLogin} style={{ marginTop: spacing.md }} />

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
  roleLabel: {
    ...typography.eyebrow,
    marginBottom: spacing.sm,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  rolePill: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  rolePillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  rolePillText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.textMuted,
  },
  rolePillTextActive: {
    color: colors.accentText,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
});
