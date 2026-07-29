import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import FormInput from '../../components/FormInput';
import PillSelector from '../../components/PillSelector';
import PrimaryButton from '../../components/PrimaryButton';
import api from '../../services/api';
import { colors, spacing, typography } from '../../theme/colors';

const CATEGORIAS = ['Libre', 'Sub-18', 'Sub-15', 'Veteranos'];

export default function OrgEquipoFormScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [torneos, setTorneos] = useState([]);
  const [torneoId, setTorneoId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      api.get('/torneos').then((r) => {
        setTorneos(r.data);
        if (r.data.length > 0) setTorneoId(r.data[0].id);
      }).finally(() => setLoading(false));
    }, [])
  );

  const handleGuardar = async () => {
    if (!nombre) {
      Alert.alert('Falta el nombre', 'Ingresa el nombre del equipo.');
      return;
    }
    if (!torneoId) {
      Alert.alert('Falta torneo', 'Selecciona un torneo.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/equipos', { nombre, categoria, torneoId });
      const torneoNombre = torneos.find((t) => t.id === torneoId)?.nombre || '';
      Alert.alert('Equipo inscrito', `${nombre} fue inscrito en ${torneoNombre}.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'No se pudo inscribir el equipo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ScreenContainer><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} /></ScreenContainer>;
  }

  const selectedTorneo = torneos.find((t) => t.id === torneoId);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Inscripción de equipo</Text>

      <FormInput label="Equipo" placeholder="Nombre del equipo" value={nombre} onChangeText={setNombre} />

      <PillSelector label="Categoría" options={CATEGORIAS} value={categoria} onChange={setCategoria} />

      <PillSelector
        label="Competición"
        options={torneos.map((t) => t.nombre)}
        value={selectedTorneo?.nombre || ''}
        onChange={(label) => {
          const t = torneos.find((item) => item.nombre === label);
          if (t) setTorneoId(t.id);
        }}
      />

      <View style={styles.actions}>
        <PrimaryButton title="Volver" variant="outline" onPress={() => navigation.goBack()} style={styles.actionBtn} />
        <PrimaryButton title={saving ? 'Guardando...' : 'Guardar'} onPress={handleGuardar} disabled={saving} style={styles.actionBtn} />
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
