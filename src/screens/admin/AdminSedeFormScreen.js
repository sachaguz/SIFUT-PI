import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Alert from '../../services/alert';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import api from '../../services/api';
import { colors, spacing, typography } from '../../theme/colors';

export default function AdminSedeFormScreen({ navigation, route }) {
  const sede = route.params?.sede;
  const [nombre, setNombre] = useState(sede?.nombre || '');
  const [direccion, setDireccion] = useState(sede?.direccion || '');
  const [telefono, setTelefono] = useState(sede?.telefono || '');
  const [activa, setActiva] = useState(sede?.activa ?? true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleGuardar = async () => {
    if (!nombre || !direccion) {
      Alert.alert('Faltan datos', 'Ingresa al menos el nombre y la dirección de la sede.');
      return;
    }
    setSaving(true);
    try {
      const body = { nombre, direccion, telefono, activa };
      if (sede) {
        await api.put(`/sedes/${sede.id}`, body);
        Alert.alert('Sede guardada', `${nombre} se guardó correctamente.`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        const { data: nuevaSede } = await api.post('/sedes', body);
        Alert.alert(
          'Sede creada',
          `${nombre} se creó correctamente. Ahora agrega una cancha para poder configurar sus horarios.`,
          [
            { text: 'Después', style: 'cancel', onPress: () => navigation.goBack() },
            {
              text: 'Agregar cancha',
              onPress: () => navigation.replace('AdminCanchaForm', { sedeId: nuevaSede.id, sede: nuevaSede.nombre }),
            },
          ]
        );
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo guardar la sede.');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = () => {
    Alert.alert('Eliminar sede', `¿Eliminar ${sede.nombre}? Se perderán sus canchas asociadas.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await api.delete(`/sedes/${sede.id}`);
            navigation.goBack();
          } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'No se pudo eliminar la sede.');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{sede ? 'Editar sede' : 'Nueva sede'}</Text>

      <FormInput label="Nombre" placeholder="Nombre de la sede" value={nombre} onChangeText={setNombre} />
      <FormInput label="Dirección" placeholder="Calle, número, colonia" value={direccion} onChangeText={setDireccion} />
      <FormInput
        label="Teléfono de contacto"
        placeholder="442 000 0000"
        keyboardType="phone-pad"
        value={telefono}
        onChangeText={setTelefono}
      />

      <TouchableOpacity style={styles.switchRow} onPress={() => setActiva((prev) => !prev)}>
        <Ionicons name={activa ? 'toggle' : 'toggle-outline'} size={30} color={activa ? colors.primary : colors.textMuted} />
        <Text style={styles.switchLabel}>Sede activa</Text>
      </TouchableOpacity>

      <View style={styles.actions}>
        <PrimaryButton title="Volver" variant="outline" onPress={() => navigation.goBack()} style={styles.actionBtn} />
        <PrimaryButton title="Guardar" onPress={handleGuardar} loading={saving} style={styles.actionBtn} />
      </View>

      {sede ? (
        <PrimaryButton
          title="Eliminar sede"
          variant="ghost"
          onPress={handleEliminar}
          loading={deleting}
          style={{ marginTop: spacing.md }}
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  switchLabel: {
    ...typography.body,
    marginLeft: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
});
