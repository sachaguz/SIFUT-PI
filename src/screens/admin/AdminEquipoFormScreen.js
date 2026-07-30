import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Alert from '../../services/alert';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import FormInput from '../../components/FormInput';
import PillSelector from '../../components/PillSelector';
import PrimaryButton from '../../components/PrimaryButton';
import api from '../../services/api';
import { colors, fonts, radius, spacing, typography } from '../../theme/colors';

const CATEGORIAS = ['Libre', 'Sub-18', 'Sub-15', 'Veteranos'];

export default function AdminEquipoFormScreen({ navigation, route }) {
  const equipo = route.params?.equipo;
  const [nombre, setNombre] = useState(equipo?.nombre || '');
  const [categoria, setCategoria] = useState(equipo?.categoria || CATEGORIAS[0]);
  const [torneos, setTorneos] = useState([]);
  const [torneoIds, setTorneoIds] = useState((equipo?.torneos || []).map((t) => t.id));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      api.get('/torneos').then((r) => {
        setTorneos(r.data);
        if (!equipo && r.data.length > 0) setTorneoIds([r.data[0].id]);
      }).finally(() => setLoading(false));
    }, [equipo])
  );

  const toggleTorneo = (id) => {
    setTorneoIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const handleGuardar = async () => {
    if (!nombre) {
      Alert.alert('Falta el nombre', 'Ingresa el nombre del equipo.');
      return;
    }
    if (torneoIds.length === 0) {
      Alert.alert('Falta liga', 'Selecciona al menos una liga.');
      return;
    }
    setSaving(true);
    try {
      if (equipo) {
        await api.put(`/equipos/${equipo.id}`, { nombre, categoria });
        const originalIds = (equipo.torneos || []).map((t) => t.id);
        const toAdd = torneoIds.filter((id) => !originalIds.includes(id));
        const toRemove = originalIds.filter((id) => !torneoIds.includes(id));
        await Promise.all([
          ...toAdd.map((torneoId) => api.post(`/equipos/${equipo.id}/torneos`, { torneoId })),
          ...toRemove.map((torneoId) => api.delete(`/equipos/${equipo.id}/torneos/${torneoId}`)),
        ]);
      } else {
        await api.post('/equipos', { nombre, categoria, torneoIds });
      }
      Alert.alert('Equipo guardado', `${nombre} se guardó correctamente.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'No se pudo guardar el equipo.');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = () => {
    Alert.alert('Eliminar equipo', `¿Eliminar a ${equipo.nombre}? Se perderán sus jugadores y partidos asociados.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await api.delete(`/equipos/${equipo.id}`);
            navigation.goBack();
          } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'No se pudo eliminar el equipo.');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return <ScreenContainer><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} /></ScreenContainer>;
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>{equipo ? 'Editar equipo' : 'Nuevo equipo'}</Text>

      <FormInput label="Equipo" placeholder="Nombre del equipo" value={nombre} onChangeText={setNombre} />

      <PillSelector label="Categoría" options={CATEGORIAS} value={categoria} onChange={setCategoria} />

      <Text style={styles.label}>Ligas / competiciones</Text>
      <Text style={styles.hint}>Un equipo puede participar en varias ligas a la vez.</Text>
      <View style={styles.multiRow}>
        {torneos.map((t) => {
          const active = torneoIds.includes(t.id);
          return (
            <TouchableOpacity key={t.id} style={[styles.torneoPill, active && styles.torneoPillActive]} onPress={() => toggleTorneo(t.id)}>
              <Text style={[styles.torneoPillText, active && styles.torneoPillTextActive]}>{t.nombre}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.actions}>
        <PrimaryButton title="Volver" variant="outline" onPress={() => navigation.goBack()} style={styles.actionBtn} />
        <PrimaryButton title="Guardar" onPress={handleGuardar} loading={saving} style={styles.actionBtn} />
      </View>

      {equipo ? (
        <PrimaryButton
          title="Eliminar equipo"
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
  label: {
    ...typography.caption,
    fontFamily: fonts.semiBold,
    color: colors.textMuted,
    marginBottom: 2,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  multiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  torneoPill: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 4,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  torneoPillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  torneoPillText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.textMuted,
  },
  torneoPillTextActive: {
    color: colors.accentText,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionBtn: {
    flex: 1,
  },
  deleteBtn: {
    marginTop: spacing.md,
  },
});
