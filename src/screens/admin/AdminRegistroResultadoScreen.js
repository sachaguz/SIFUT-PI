import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import PillSelector from '../../components/PillSelector';
import Card from '../../components/Card';
import { colors, spacing, typography } from '../../theme/colors';

const TIPOS_GOL = ['Gol', 'Autogol'];
const SANCIONES = ['Amarilla', 'Roja'];

function EventoForm({ titulo, equipos, tipos, tipoLabel, onAgregar }) {
  const [equipo, setEquipo] = useState(equipos[0]);
  const [jugador, setJugador] = useState('');
  const [minuto, setMinuto] = useState('');
  const [tipo, setTipo] = useState(tipos[0]);

  const handleAgregar = () => {
    if (!jugador || !minuto) {
      Alert.alert('Faltan datos', 'Ingresa el jugador y el minuto.');
      return;
    }
    onAgregar({ equipo, jugador, minuto, tipo });
    setJugador('');
    setMinuto('');
  };

  return (
    <Card>
      <Text style={styles.cardTitle}>{titulo}</Text>
      <PillSelector label="Equipo" options={equipos} value={equipo} onChange={setEquipo} />
      <FormInput label="Jugador" placeholder="Nombre del jugador" value={jugador} onChangeText={setJugador} />
      <View style={styles.rowInputs}>
        <FormInput
          label="Minuto"
          placeholder="00:00"
          keyboardType="numeric"
          value={minuto}
          onChangeText={setMinuto}
          containerStyle={{ flex: 1, marginRight: spacing.sm }}
        />
        <View style={{ flex: 1.4 }}>
          <PillSelector label={tipoLabel} options={tipos} value={tipo} onChange={setTipo} />
        </View>
      </View>
      <PrimaryButton title="Agregar" variant="outline" small onPress={handleAgregar} />
    </Card>
  );
}

export default function AdminRegistroResultadoScreen({ navigation, route }) {
  const { partido } = route.params;
  const equipos = [partido.local, partido.visitante];

  const [goles, setGoles] = useState([]);
  const [cambios, setCambios] = useState([]);
  const [faltas, setFaltas] = useState([]);

  const golesLocal = goles.filter((g) => g.equipo === partido.local && g.tipo === 'Gol').length
    + goles.filter((g) => g.equipo === partido.visitante && g.tipo === 'Autogol').length;
  const golesVisitante = goles.filter((g) => g.equipo === partido.visitante && g.tipo === 'Gol').length
    + goles.filter((g) => g.equipo === partido.local && g.tipo === 'Autogol').length;

  const handleGuardar = () => {
    Alert.alert(
      'Resultado guardado',
      `${partido.local} ${golesLocal} - ${golesVisitante} ${partido.visitante}`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Datos de partido</Text>
      <Text style={styles.subtitle}>
        {partido.local} vs {partido.visitante} · {partido.fecha} {partido.hora}
      </Text>

      <Card style={styles.scoreCard}>
        <Text style={styles.scoreText}>
          {golesLocal} - {golesVisitante}
        </Text>
        <Text style={styles.scoreCaption}>Marcador provisional</Text>
      </Card>

      <EventoForm
        titulo="Goles"
        equipos={equipos}
        tipos={TIPOS_GOL}
        tipoLabel="Tipo"
        onAgregar={(evento) => setGoles((prev) => [...prev, evento])}
      />

      <EventoForm
        titulo="Cambios / Salidas"
        equipos={equipos}
        tipos={['Titular ↔ Suplente']}
        tipoLabel="Tipo"
        onAgregar={(evento) => setCambios((prev) => [...prev, evento])}
      />

      <EventoForm
        titulo="Faltas / Tarjetas"
        equipos={equipos}
        tipos={SANCIONES}
        tipoLabel="Sanción"
        onAgregar={(evento) => setFaltas((prev) => [...prev, evento])}
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
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  scoreCard: {
    alignItems: 'center',
  },
  scoreText: {
    ...typography.display,
    fontSize: 40,
  },
  scoreCaption: {
    ...typography.caption,
  },
  cardTitle: {
    ...typography.subtitle,
    marginBottom: spacing.sm,
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
