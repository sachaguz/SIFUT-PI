import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, spacing, typography } from '../../theme/colors';

export default function AdminSedeFormScreen({ navigation, route }) {
  const sede = route.params?.sede;
  const [nombre, setNombre] = useState(sede?.nombre || '');
  const [direccion, setDireccion] = useState(sede?.direccion || '');
  const [telefono, setTelefono] = useState(sede?.telefono || '');
  const [activa, setActiva] = useState(sede?.activa ?? true);

  const handleGuardar = () => {
    if (!nombre || !direccion) {
      Alert.alert('Faltan datos', 'Ingresa al menos el nombre y la dirección de la sede.');
      return;
    }
    Alert.alert('Sede guardada', `${nombre} se guardó correctamente.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
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
        <PrimaryButton title="Guardar" onPress={handleGuardar} style={styles.actionBtn} />
      </View>
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
