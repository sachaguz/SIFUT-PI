import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import PillSelector from '../../components/PillSelector';
import { spacing, typography } from '../../theme/colors';

const TIPOS = ['Fútbol 5', 'Fútbol 7', 'Fútbol 11'];
const SUPERFICIES = ['Pasto sintético', 'Pasto natural'];

export default function AdminCanchaFormScreen({ navigation, route }) {
  const { cancha, sede } = route.params || {};
  const [nombre, setNombre] = useState(cancha?.nombre || '');
  const [tipo, setTipo] = useState(cancha?.tipo || TIPOS[1]);
  const [superficie, setSuperficie] = useState(cancha?.superficie || SUPERFICIES[0]);
  const [capacidad, setCapacidad] = useState(cancha ? String(cancha.capacidad) : '');
  const [precioHora, setPrecioHora] = useState(cancha?.precioHora ? String(cancha.precioHora) : '');

  const handleGuardar = () => {
    if (!nombre || !capacidad || !precioHora) {
      Alert.alert('Faltan datos', 'Completa el nombre, capacidad y precio por hora.');
      return;
    }
    Alert.alert('Cancha guardada', `${nombre} se guardó en ${sede}.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{cancha ? 'Editar cancha' : 'Nueva cancha'}</Text>
      <Text style={styles.subtitle}>{sede}</Text>

      <FormInput label="Nombre de la cancha" placeholder="Cancha 1" value={nombre} onChangeText={setNombre} />

      <PillSelector label="Tipo de cancha" options={TIPOS} value={tipo} onChange={setTipo} />
      <PillSelector label="Superficie" options={SUPERFICIES} value={superficie} onChange={setSuperficie} />

      <View style={styles.rowInputs}>
        <FormInput
          label="Capacidad"
          placeholder="14"
          keyboardType="numeric"
          value={capacidad}
          onChangeText={setCapacidad}
          containerStyle={{ flex: 1, marginRight: spacing.sm }}
        />
        <FormInput
          label="Precio por hora (MXN)"
          placeholder="450"
          keyboardType="numeric"
          value={precioHora}
          onChangeText={setPrecioHora}
          containerStyle={{ flex: 1 }}
        />
      </View>

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
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.lg,
  },
  rowInputs: {
    flexDirection: 'row',
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
