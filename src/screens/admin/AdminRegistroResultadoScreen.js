import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import PillSelector from '../../components/PillSelector';
import Card from '../../components/Card';
import api from '../../services/api';
import { colors, spacing, typography } from '../../theme/colors';

const TIPOS_GOL = [
  { label: 'Gol', value: 'GOL' },
  { label: 'Autogol', value: 'AUTOGOL' },
];

const SANCIONES = [
  { label: 'Amarilla', value: 'TARJETA_AMARILLA' },
  { label: 'Roja', value: 'TARJETA_ROJA' },
];

function EventoForm({ titulo, equipos, jugadoresLocal, jugadoresVisitante, localName, tipos, tipoLabel, onAgregar }) {
  const [equipo, setEquipo] = useState(equipos[0]);
  const [jugadorId, setJugadorId] = useState('');
  const [minuto, setMinuto] = useState('');
  const [tipo, setTipo] = useState(tipos[0].label);

  const jugadores = equipo === localName ? jugadoresLocal : jugadoresVisitante;
  const selectedJugador = jugadores.find((j) => j.id === jugadorId);

  useEffect(() => {
    if (jugadores.length > 0 && !jugadores.find((j) => j.id === jugadorId)) {
      setJugadorId(jugadores[0].id);
    }
  }, [equipo, jugadores]);

  const handleAgregar = () => {
    if (!jugadorId || !minuto) {
      Alert.alert('Faltan datos', 'Selecciona el jugador y el minuto.');
      return;
    }
    const tipoValue = tipos.find((t) => t.label === tipo)?.value || tipo;
    onAgregar({
      jugadorId,
      jugadorNombre: selectedJugador?.nombre || '',
      equipoNombre: equipo,
      teamSide: equipo === localName ? 'local' : 'visitante',
      minuto,
      tipo: tipoValue,
    });
    setMinuto('');
  };

  return (
    <Card>
      <Text style={styles.cardTitle}>{titulo}</Text>
      <PillSelector label="Equipo" options={equipos} value={equipo} onChange={setEquipo} />
      <PillSelector
        label="Jugador"
        options={jugadores.map((j) => j.nombre)}
        value={selectedJugador?.nombre || ''}
        onChange={(name) => {
          const j = jugadores.find((item) => item.nombre === name);
          if (j) setJugadorId(j.id);
        }}
      />
      <View style={styles.rowInputs}>
        <FormInput
          label="Minuto"
          placeholder="45"
          keyboardType="numeric"
          value={minuto}
          onChangeText={setMinuto}
          containerStyle={{ flex: 1, marginRight: spacing.sm }}
        />
        <View style={{ flex: 1.4 }}>
          <PillSelector label={tipoLabel} options={tipos.map((t) => t.label)} value={tipo} onChange={setTipo} />
        </View>
      </View>
      <PrimaryButton title="Agregar" variant="outline" small onPress={handleAgregar} />
    </Card>
  );
}

export default function AdminRegistroResultadoScreen({ navigation, route }) {
  const { partido } = route.params;
  const [jugadoresLocal, setJugadoresLocal] = useState([]);
  const [jugadoresVisitante, setJugadoresVisitante] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        api.get(`/jugadores/equipo/${partido.equipoLocal.id}`),
        api.get(`/jugadores/equipo/${partido.equipoVisitante.id}`),
      ]).then(([jl, jv]) => {
        setJugadoresLocal(jl.data);
        setJugadoresVisitante(jv.data);
      }).finally(() => setLoading(false));
    }, [])
  );

  const golesLocal = eventos.filter((e) =>
    (e.tipo === 'GOL' && e.teamSide === 'local') ||
    (e.tipo === 'AUTOGOL' && e.teamSide === 'visitante')
  ).length;

  const golesVisitante = eventos.filter((e) =>
    (e.tipo === 'GOL' && e.teamSide === 'visitante') ||
    (e.tipo === 'AUTOGOL' && e.teamSide === 'local')
  ).length;

  const handleGuardar = async () => {
    setSaving(true);
    try {
      for (const evento of eventos) {
        await api.post(`/partidos/${partido.id}/eventos`, {
          tipo: evento.tipo,
          jugadorId: evento.jugadorId,
          minuto: parseInt(evento.minuto, 10),
        });
      }
      await api.patch(`/partidos/${partido.id}/resultado`, {
        golesLocal,
        golesVisitante,
      });
      Alert.alert(
        'Resultado guardado',
        `${partido.local} ${golesLocal} - ${golesVisitante} ${partido.visitante}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Error', err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ScreenContainer><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} /></ScreenContainer>;
  }

  const equipos = [partido.local, partido.visitante];

  return (
    <ScreenContainer>
      <Text style={styles.title}>Datos de partido</Text>
      <Text style={styles.subtitle}>
        {partido.local} vs {partido.visitante} · {partido.fecha} {partido.hora}
      </Text>

      <Card style={styles.scoreCard}>
        <Text style={styles.scoreText}>
          {partido.local} {golesLocal}-{golesVisitante} {partido.visitante}
        </Text>
        <Text style={styles.scoreCaption}>Marcador provisional</Text>
      </Card>

      <EventoForm
        titulo="Goles"
        equipos={equipos}
        jugadoresLocal={jugadoresLocal}
        jugadoresVisitante={jugadoresVisitante}
        localName={partido.local}
        tipos={TIPOS_GOL}
        tipoLabel="Tipo"
        onAgregar={(evento) => setEventos((prev) => [...prev, evento])}
      />

      <EventoForm
        titulo="Cambios / Salidas"
        equipos={equipos}
        jugadoresLocal={jugadoresLocal}
        jugadoresVisitante={jugadoresVisitante}
        localName={partido.local}
        tipos={[{ label: 'Sustitución', value: 'SUSTITUCION' }]}
        tipoLabel="Tipo"
        onAgregar={(evento) => setEventos((prev) => [...prev, evento])}
      />

      <EventoForm
        titulo="Faltas / Tarjetas"
        equipos={equipos}
        jugadoresLocal={jugadoresLocal}
        jugadoresVisitante={jugadoresVisitante}
        localName={partido.local}
        tipos={SANCIONES}
        tipoLabel="Sanción"
        onAgregar={(evento) => setEventos((prev) => [...prev, evento])}
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
    ...typography.displaySmall,
    textAlign: 'center',
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
