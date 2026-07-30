import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Alert from '../../services/alert';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import ListRow from '../../components/ListRow';
import Card from '../../components/Card';
import FormInput from '../../components/FormInput';
import PillSelector from '../../components/PillSelector';
import PrimaryButton from '../../components/PrimaryButton';
import api, { posicionLabel } from '../../services/api';
import { colors, spacing, typography } from '../../theme/colors';

const POSICIONES_LABEL = ['Portero', 'Defensa', 'Mediocampista', 'Delantero'];
const POSICIONES_ENUM = { Portero: 'PORTERO', Defensa: 'DEFENSA', Mediocampista: 'MEDIOCAMPISTA', Delantero: 'DELANTERO' };
const POSICION_POR_ENUM = Object.fromEntries(Object.entries(POSICIONES_ENUM).map(([k, v]) => [v, k]));

export default function AdminJugadoresScreen({ route }) {
  const { equipoId, equipoNombre } = route.params;
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [numero, setNumero] = useState('');
  const [posicion, setPosicion] = useState(POSICIONES_LABEL[3]);
  const [saving, setSaving] = useState(false);

  const fetchJugadores = useCallback(() => {
    api.get(`/jugadores/equipo/${equipoId}`).then((r) => setJugadores(r.data)).finally(() => setLoading(false));
  }, [equipoId]);

  useFocusEffect(fetchJugadores);

  const resetForm = () => {
    setEditingId(null);
    setNombre('');
    setNumero('');
    setPosicion(POSICIONES_LABEL[3]);
  };

  const handleEditar = (jugador) => {
    setEditingId(jugador.id);
    setNombre(jugador.nombre);
    setNumero(String(jugador.numeroCamiseta));
    setPosicion(POSICION_POR_ENUM[jugador.posicion] || POSICIONES_LABEL[3]);
  };

  const handleGuardar = async () => {
    if (!nombre || !numero) {
      Alert.alert('Faltan datos', 'Ingresa el nombre y el número del jugador.');
      return;
    }
    setSaving(true);
    try {
      const body = { nombre, numeroCamiseta: parseInt(numero, 10), posicion: POSICIONES_ENUM[posicion], equipoId };
      if (editingId) {
        await api.put(`/jugadores/${editingId}`, body);
      } else {
        await api.post('/jugadores', body);
      }
      resetForm();
      fetchJugadores();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'No se pudo guardar el jugador.');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = (jugador) => {
    Alert.alert('Eliminar jugador', `¿Eliminar a ${jugador.nombre}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/jugadores/${jugador.id}`);
            if (editingId === jugador.id) resetForm();
            fetchJugadores();
          } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'No se pudo eliminar el jugador.');
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
      <Text style={styles.title}>{equipoNombre}</Text>
      <Text style={styles.subtitle}>Plantilla de jugadores</Text>

      {jugadores.map((jugador) => (
        <ListRow
          key={jugador.id}
          icon="person-outline"
          title={jugador.nombre}
          subtitle={posicionLabel(jugador.posicion)}
          meta={`Dorsal #${jugador.numeroCamiseta}`}
          right={(
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => handleEditar(jugador)}>
                <Ionicons name="create-outline" size={20} color={colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => handleEliminar(jugador)}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          )}
        />
      ))}

      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.cardTitle}>{editingId ? 'Editar jugador' : 'Registrar jugador'}</Text>
        <FormInput label="Jugador" placeholder="Nombre completo" value={nombre} onChangeText={setNombre} />
        <View style={styles.row}>
          <FormInput
            label="Dorsal"
            placeholder="10"
            keyboardType="numeric"
            value={numero}
            onChangeText={setNumero}
            containerStyle={{ flex: 1, marginRight: spacing.sm }}
          />
        </View>
        <PillSelector label="Posición" options={POSICIONES_LABEL} value={posicion} onChange={setPosicion} />
        <PrimaryButton title={editingId ? 'Guardar cambios' : 'Agregar jugador'} onPress={handleGuardar} loading={saving} />
        {editingId ? (
          <PrimaryButton title="Cancelar edición" variant="ghost" onPress={resetForm} style={{ marginTop: spacing.sm }} />
        ) : null}
      </Card>
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
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.subtitle,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
  },
});
