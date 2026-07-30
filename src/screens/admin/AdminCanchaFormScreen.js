import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Alert from '../../services/alert';
import ScreenContainer from '../../components/ScreenContainer';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import PillSelector from '../../components/PillSelector';
import api from '../../services/api';
import { spacing, typography } from '../../theme/colors';

const TIPOS_DISPLAY = ['Fútbol 5', 'Fútbol 7', 'Fútbol 11'];
const TIPO_MAP = { 'Fútbol 5': 'FUTBOL5', 'Fútbol 7': 'FUTBOL7', 'Fútbol 11': 'FUTBOL11' };
const TIPO_REVERSE = { FUTBOL5: 'Fútbol 5', FUTBOL7: 'Fútbol 7', FUTBOL11: 'Fútbol 11' };
const SUPERFICIES = ['Pasto sintético', 'Pasto natural'];

export default function AdminCanchaFormScreen({ navigation, route }) {
  const { cancha, sedeId, sede } = route.params || {};
  const [nombre, setNombre] = useState(cancha?.nombre || '');
  const [tipo, setTipo] = useState(cancha ? (TIPO_REVERSE[cancha.tipo] || TIPOS_DISPLAY[1]) : TIPOS_DISPLAY[1]);
  const [superficie, setSuperficie] = useState(cancha?.superficie || SUPERFICIES[0]);
  const [capacidad, setCapacidad] = useState(cancha ? String(cancha.capacidad) : '');
  const [precioHora, setPrecioHora] = useState(cancha?.precioPorHora ? String(Number(cancha.precioPorHora)) : '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleGuardar = async () => {
    if (!nombre || !capacidad || !precioHora) {
      Alert.alert('Faltan datos', 'Completa el nombre, capacidad y precio por hora.');
      return;
    }
    setSaving(true);
    try {
      const body = {
        sedeId: cancha?.sedeId || sedeId,
        nombre,
        tipo: TIPO_MAP[tipo],
        superficie,
        capacidad: parseInt(capacidad, 10),
        precioPorHora: precioHora,
      };
      if (cancha) {
        await api.put(`/canchas/${cancha.id}`, body);
      } else {
        await api.post('/canchas', body);
      }
      Alert.alert('Cancha guardada', `${nombre} se guardó en ${sede}.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'No se pudo guardar la cancha.');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = () => {
    Alert.alert('Eliminar cancha', `¿Eliminar ${cancha.nombre}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await api.delete(`/canchas/${cancha.id}`);
            navigation.goBack();
          } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'No se pudo eliminar la cancha.');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{cancha ? 'Editar cancha' : 'Nueva cancha'}</Text>
      <Text style={styles.subtitle}>{sede}</Text>

      <FormInput label="Nombre de la cancha" placeholder="Cancha 1" value={nombre} onChangeText={setNombre} />

      <PillSelector label="Tipo de cancha" options={TIPOS_DISPLAY} value={tipo} onChange={setTipo} />
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
        <PrimaryButton title="Guardar" onPress={handleGuardar} loading={saving} style={styles.actionBtn} />
      </View>

      {cancha ? (
        <PrimaryButton
          title="Eliminar cancha"
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
  title: { ...typography.title, marginBottom: spacing.xs },
  subtitle: { ...typography.body, marginBottom: spacing.lg },
  rowInputs: { flexDirection: 'row' },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  actionBtn: { flex: 1 },
});
