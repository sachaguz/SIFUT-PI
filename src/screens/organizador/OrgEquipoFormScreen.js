import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import FormInput from '../../components/FormInput';
import PillSelector from '../../components/PillSelector';
import PrimaryButton from '../../components/PrimaryButton';
import { TORNEOS } from '../../data/torneos';
import { spacing, typography } from '../../theme/colors';

export default function OrgEquipoFormScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [competicion, setCompeticion] = useState(TORNEOS[0].nombre);

  const handleGuardar = () => {
    if (!nombre) {
      Alert.alert('Falta el nombre', 'Ingresa el nombre del equipo.');
      return;
    }
    Alert.alert('Equipo inscrito', `${nombre} fue inscrito en ${competicion}.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Inscripción de equipo</Text>

      <FormInput label="Equipo" placeholder="Nombre del equipo" value={nombre} onChangeText={setNombre} />

      <PillSelector
        label="Competición"
        options={TORNEOS.map((t) => t.nombre)}
        value={competicion}
        onChange={setCompeticion}
      />

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
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionBtn: {
    flex: 1,
  },
});
