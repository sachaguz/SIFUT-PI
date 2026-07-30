import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Alert from '../../services/alert';
import ScreenContainer from '../../components/ScreenContainer';
import FormInput from '../../components/FormInput';
import PillSelector from '../../components/PillSelector';
import PrimaryButton from '../../components/PrimaryButton';
import api from '../../services/api';
import { spacing, typography } from '../../theme/colors';

const ROLES = ['USUARIO', 'ORGANIZADOR', 'ADMIN'];

export default function AdminUsuarioFormScreen({ navigation, route }) {
  const usuario = route.params?.usuario;
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [apellido, setApellido] = useState(usuario?.apellido || '');
  const [email, setEmail] = useState(usuario?.email || '');
  const [telefono, setTelefono] = useState(usuario?.telefono || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(usuario?.role || 'USUARIO');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleGuardar = async () => {
    if (!nombre || !apellido || !email || (!usuario && !password)) {
      Alert.alert('Faltan datos', 'Completa nombre, apellido, correo y contraseña.');
      return;
    }
    setSaving(true);
    try {
      if (usuario) {
        await api.put(`/usuarios/${usuario.id}`, { nombre, apellido, email, telefono, role });
      } else {
        await api.post('/usuarios', { nombre, apellido, email, telefono, password, role });
      }
      Alert.alert('Usuario guardado', `${nombre} se guardó correctamente.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo guardar el usuario.');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = () => {
    Alert.alert('Eliminar usuario', `¿Eliminar la cuenta de ${usuario.nombre} ${usuario.apellido}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await api.delete(`/usuarios/${usuario.id}`);
            navigation.goBack();
          } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'No se pudo eliminar el usuario.');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{usuario ? 'Editar usuario' : 'Nuevo usuario'}</Text>

      <FormInput label="Nombre" placeholder="Nombre" value={nombre} onChangeText={setNombre} />
      <FormInput label="Apellido" placeholder="Apellido" value={apellido} onChangeText={setApellido} />
      <FormInput
        label="Correo electrónico"
        placeholder="usuario@correo.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <FormInput
        label="Teléfono (opcional)"
        placeholder="442 123 4567"
        keyboardType="phone-pad"
        value={telefono}
        onChangeText={setTelefono}
      />
      {!usuario ? (
        <FormInput
          label="Contraseña"
          placeholder="Mínimo 8 caracteres"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      ) : null}

      <PillSelector label="Rol" options={ROLES} value={role} onChange={setRole} />

      <View style={styles.actions}>
        <PrimaryButton title="Volver" variant="outline" onPress={() => navigation.goBack()} style={styles.actionBtn} />
        <PrimaryButton title="Guardar" onPress={handleGuardar} loading={saving} style={styles.actionBtn} />
      </View>

      {usuario ? (
        <PrimaryButton
          title="Eliminar usuario"
          variant="ghost"
          onPress={handleEliminar}
          loading={deleting}
          style={styles.deleteBtn}
        />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.title,
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
  deleteBtn: {
    marginTop: spacing.md,
  },
});
