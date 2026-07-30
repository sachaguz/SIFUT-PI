import { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Alert from '../../services/alert';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import ListRow from '../../components/ListRow';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import PillSelector from '../../components/PillSelector';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import api from '../../services/api';
import { colors, spacing, typography } from '../../theme/colors';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DIA_INDEX = { Lun: 1, Mar: 2, Mié: 3, Jue: 4, Vie: 5, Sáb: 6, Dom: 0 };

export default function AdminHorariosScreen({ route }) {
  const { sedeId, sede } = route.params || {};
  const [dia, setDia] = useState('Lun');
  const [horarios, setHorarios] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [canchaId, setCanchaId] = useState('');
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('09:00');
  const [disponible, setDisponible] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(() => {
    if (!sedeId) return;
    setLoading(true);
    Promise.all([
      api.get(`/horarios/sede/${sedeId}`),
      api.get('/canchas', { params: { sedeId } }),
    ]).then(([h, c]) => {
      setHorarios(h.data);
      setCanchas(c.data);
      if (c.data.length > 0) setCanchaId((prev) => prev || c.data[0].id);
    }).finally(() => setLoading(false));
  }, [sedeId]);

  useFocusEffect(fetchData);

  const resetForm = () => {
    setEditingId(null);
    setHoraInicio('08:00');
    setHoraFin('09:00');
    setDisponible(true);
  };

  const handleEditar = (bloque) => {
    setEditingId(bloque.id);
    setCanchaId(bloque.canchaId);
    setHoraInicio(bloque.horaInicio);
    setHoraFin(bloque.horaFin);
    setDisponible(bloque.disponible);
  };

  const handleGuardar = async () => {
    if (!canchaId || !horaInicio || !horaFin) {
      Alert.alert('Faltan datos', 'Selecciona la cancha y las horas de inicio y fin.');
      return;
    }
    setSaving(true);
    try {
      const body = { canchaId, diaSemana: DIA_INDEX[dia], horaInicio, horaFin, disponible };
      if (editingId) {
        await api.put(`/horarios/${editingId}`, body);
      } else {
        await api.post('/horarios', body);
      }
      resetForm();
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'No se pudo guardar el horario.');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = (bloque) => {
    Alert.alert('Eliminar horario', `¿Eliminar el bloque ${bloque.horaInicio} - ${bloque.horaFin}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/horarios/${bloque.id}`);
            if (editingId === bloque.id) resetForm();
            fetchData();
          } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'No se pudo eliminar el horario.');
          }
        },
      },
    ]);
  };

  const bloques = horarios.filter((h) => h.diaSemana === DIA_INDEX[dia]);

  return (
    <ScreenContainer>
      <SectionHeader title="Horarios" subtitle={sede || 'Sede seleccionada'} />

      {canchas.length === 0 && !loading ? (
        <Text style={styles.empty}>
          Esta sede aún no tiene canchas registradas. Agrega una cancha primero para poder configurar horarios.
        </Text>
      ) : (
        <>
          <PillSelector label="Día" options={DIAS} value={dia} onChange={setDia} />

          {bloques.length === 0 ? (
            <Text style={styles.empty}>No hay bloques configurados este día.</Text>
          ) : (
            bloques.map((bloque) => (
              <ListRow
                key={bloque.id}
                icon="time-outline"
                title={`${bloque.horaInicio} - ${bloque.horaFin}`}
                subtitle={bloque.cancha?.nombre || 'Cancha'}
                meta={`$${Number(bloque.cancha?.precioPorHora || 0)} MXN/hora`}
                right={(
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <Badge label={bloque.disponible ? 'Disponible' : 'Ocupado'} tone={bloque.disponible ? 'success' : 'danger'} />
                    <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => handleEditar(bloque)}>
                      <Ionicons name="create-outline" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => handleEliminar(bloque)}>
                      <Ionicons name="trash-outline" size={20} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                )}
              />
            ))
          )}

          <Card style={{ marginTop: spacing.md }}>
            <Text style={styles.cardTitle}>{editingId ? 'Editar bloque' : 'Nuevo bloque de horario'}</Text>

            <PillSelector
              label="Cancha"
              options={canchas.map((c) => c.nombre)}
              value={canchas.find((c) => c.id === canchaId)?.nombre || ''}
              onChange={(label) => {
                const c = canchas.find((item) => item.nombre === label);
                if (c) setCanchaId(c.id);
              }}
            />

            <View style={styles.row}>
              <FormInput
                label="Hora inicio"
                placeholder="08:00"
                value={horaInicio}
                onChangeText={setHoraInicio}
                containerStyle={{ flex: 1, marginRight: spacing.sm }}
              />
              <FormInput
                label="Hora fin"
                placeholder="09:00"
                value={horaFin}
                onChangeText={setHoraFin}
                containerStyle={{ flex: 1 }}
              />
            </View>

            <TouchableOpacity style={styles.switchRow} onPress={() => setDisponible((prev) => !prev)}>
              <Ionicons name={disponible ? 'toggle' : 'toggle-outline'} size={30} color={disponible ? colors.primary : colors.textMuted} />
              <Text style={styles.switchLabel}>Disponible para reservar</Text>
            </TouchableOpacity>

            <PrimaryButton title={editingId ? 'Guardar cambios' : 'Agregar bloque'} onPress={handleGuardar} loading={saving} />
            {editingId ? (
              <PrimaryButton title="Cancelar edición" variant="ghost" onPress={resetForm} style={{ marginTop: spacing.sm }} />
            ) : null}
          </Card>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  empty: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.lg,
    color: colors.textMuted,
  },
  cardTitle: {
    ...typography.subtitle,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  switchLabel: {
    ...typography.body,
    marginLeft: spacing.sm,
  },
});
