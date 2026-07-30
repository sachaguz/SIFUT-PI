import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
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

export default function OrgJugadoresScreen({ route }) {
  const { equipoId, equipoNombre } = route.params;
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [numero, setNumero] = useState('');
  const [posicion, setPosicion] = useState(POSICIONES_LABEL[3]);
  const [saving, setSaving] = useState(false);

  const fetchJugadores = useCallback(() => {
    api.get(`/jugadores/equipo/${equipoId}`).then((r) => setJugadores(r.data)).finally(() => setLoading(false));
  }, [equipoId]);

  useFocusEffect(fetchJugadores);

  const handleAgregar = async () => {
    if (!nombre || !numero) {
      Alert.alert('Faltan datos', 'Ingresa el nombre y el número del jugador.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/jugadores', {
        nombre,
        numeroCamiseta: parseInt(numero, 10),
        posicion: POSICIONES_ENUM[posicion],
        equipoId,
      });
      setNombre('');
      setNumero('');
      fetchJugadores();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'No se pudo agregar el jugador.');
    } finally {
      setSaving(false);
    }
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
        />
      ))}

      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.cardTitle}>Registrar jugador</Text>
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
        <PrimaryButton title={saving ? 'Agregando...' : 'Agregar jugador'} onPress={handleAgregar} disabled={saving} />
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
    color: '#6B7570',
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
