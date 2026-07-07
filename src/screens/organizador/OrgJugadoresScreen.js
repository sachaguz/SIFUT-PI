import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import ListRow from '../../components/ListRow';
import Card from '../../components/Card';
import FormInput from '../../components/FormInput';
import PillSelector from '../../components/PillSelector';
import PrimaryButton from '../../components/PrimaryButton';
import { JUGADORES_POR_EQUIPO } from '../../data/torneos';
import { spacing, typography } from '../../theme/colors';

const POSICIONES = ['Portero', 'Defensa', 'Mediocampista', 'Delantero'];

export default function OrgJugadoresScreen({ route }) {
  const { equipo } = route.params;
  const [jugadores, setJugadores] = useState(JUGADORES_POR_EQUIPO[equipo.nombre] || []);
  const [nombre, setNombre] = useState('');
  const [numero, setNumero] = useState('');
  const [posicion, setPosicion] = useState(POSICIONES[3]);

  const handleAgregar = () => {
    if (!nombre || !numero) {
      Alert.alert('Faltan datos', 'Ingresa el nombre y el número del jugador.');
      return;
    }
    setJugadores((prev) => [...prev, { id: String(Date.now()), nombre, numero, posicion }]);
    setNombre('');
    setNumero('');
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{equipo.nombre}</Text>
      <Text style={styles.subtitle}>Plantilla de jugadores</Text>

      {jugadores.map((jugador) => (
        <ListRow
          key={jugador.id}
          icon="person-outline"
          title={jugador.nombre}
          subtitle={jugador.posicion}
          meta={`Dorsal #${jugador.numero}`}
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
        <PillSelector label="Posición" options={POSICIONES} value={posicion} onChange={setPosicion} />
        <PrimaryButton title="Agregar jugador" onPress={handleAgregar} />
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
