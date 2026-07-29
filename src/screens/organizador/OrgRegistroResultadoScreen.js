import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import PillSelector from '../../components/PillSelector';
import Card from '../../components/Card';
import api from '../../services/api';
import { colors, fonts, spacing, typography } from '../../theme/colors';

const TIPOS_GOL = [
  { label: 'Gol', value: 'GOL' },
  { label: 'Autogol', value: 'AUTOGOL' },
];

const SANCIONES = [
  { label: 'Amarilla', value: 'TARJETA_AMARILLA' },
  { label: 'Roja', value: 'TARJETA_ROJA' },
];

const EVENTO_LABELS = {
  GOL: 'Gol',
  AUTOGOL: 'Autogol',
  TARJETA_AMARILLA: 'Amarilla',
  TARJETA_ROJA: 'Roja',
  SUSTITUCION: 'Cambio',
};

const EVENTO_COLORS = {
  GOL: colors.primary,
  AUTOGOL: colors.textMuted,
  TARJETA_AMARILLA: colors.warning,
  TARJETA_ROJA: colors.danger,
  SUSTITUCION: colors.secondary,
};

function EventoForm({ titulo, equipos, jugadoresLocal, jugadoresVisitante, localName, tipos, tipoLabel, onAgregar }) {
  const [equipo, setEquipo] = useState(equipos[0]);
  const [jugadorIdx, setJugadorIdx] = useState(0);
  const [minuto, setMinuto] = useState('');
  const [tipo, setTipo] = useState(tipos[0].label);

  const jugadores = equipo === localName ? jugadoresLocal : jugadoresVisitante;
  const selectedJugador = jugadores[jugadorIdx] || jugadores[0];

  const handleAgregar = () => {
    if (!selectedJugador || !minuto) {
      Alert.alert('Faltan datos', 'Selecciona el jugador y el minuto.');
      return;
    }
    const tipoValue = tipos.find((t) => t.label === tipo)?.value || tipo;
    onAgregar({
      jugadorId: selectedJugador.id,
      jugadorNombre: selectedJugador.nombre,
      equipoNombre: equipo,
      teamSide: equipo === localName ? 'local' : 'visitante',
      minuto: parseInt(minuto, 10),
      tipo: tipoValue,
    });
    setMinuto('');
  };

  return (
    <Card>
      <Text style={styles.cardTitle}>{titulo}</Text>
      <PillSelector label="Equipo" options={equipos} value={equipo} onChange={(v) => { setEquipo(v); setJugadorIdx(0); }} />
      <PillSelector
        label="Jugador"
        options={jugadores.map((j) => j.nombre)}
        value={selectedJugador?.nombre || ''}
        onChange={(name) => {
          const idx = jugadores.findIndex((j) => j.nombre === name);
          if (idx >= 0) setJugadorIdx(idx);
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

function SustitucionForm({ equipos, jugadoresLocal, jugadoresVisitante, localName, onAgregar }) {
  const [equipo, setEquipo] = useState(equipos[0]);
  const [saleIdx, setSaleIdx] = useState(0);
  const [entraIdx, setEntraIdx] = useState(1);
  const [minuto, setMinuto] = useState('');

  const jugadores = equipo === localName ? jugadoresLocal : jugadoresVisitante;
  const jugadorSale = jugadores[saleIdx] || jugadores[0];
  const jugadorEntra = jugadores[entraIdx] || jugadores[0];

  const handleAgregar = () => {
    if (!jugadorSale || !jugadorEntra || !minuto) {
      Alert.alert('Faltan datos', 'Selecciona ambos jugadores y el minuto.');
      return;
    }
    if (jugadorSale.id === jugadorEntra.id) {
      Alert.alert('Jugadores inválidos', 'El jugador que sale y el que entra deben ser distintos.');
      return;
    }
    onAgregar({
      jugadorId: jugadorSale.id,
      jugadorNombre: jugadorSale.nombre,
      jugadorEntraId: jugadorEntra.id,
      jugadorEntraNombre: jugadorEntra.nombre,
      equipoNombre: equipo,
      teamSide: equipo === localName ? 'local' : 'visitante',
      minuto: parseInt(minuto, 10),
      tipo: 'SUSTITUCION',
    });
    setMinuto('');
  };

  return (
    <Card>
      <Text style={styles.cardTitle}>Cambios / Salidas</Text>
      <PillSelector label="Equipo" options={equipos} value={equipo} onChange={(v) => { setEquipo(v); setSaleIdx(0); setEntraIdx(1); }} />
      <PillSelector
        label="Sale"
        options={jugadores.map((j) => j.nombre)}
        value={jugadorSale?.nombre || ''}
        onChange={(name) => {
          const idx = jugadores.findIndex((j) => j.nombre === name);
          if (idx >= 0) setSaleIdx(idx);
        }}
      />
      <PillSelector
        label="Entra"
        options={jugadores.map((j) => j.nombre)}
        value={jugadorEntra?.nombre || ''}
        onChange={(name) => {
          const idx = jugadores.findIndex((j) => j.nombre === name);
          if (idx >= 0) setEntraIdx(idx);
        }}
      />
      <FormInput
        label="Minuto"
        placeholder="45"
        keyboardType="numeric"
        value={minuto}
        onChangeText={setMinuto}
      />
      <PrimaryButton title="Agregar" variant="outline" small onPress={handleAgregar} />
    </Card>
  );
}

function EventoRow({ evento, onDelete }) {
  const color = EVENTO_COLORS[evento.tipo] || colors.textMuted;
  const equipoNombre = evento.equipoNombre || evento.jugador?.equipo?.nombre || '';

  if (evento.tipo === 'SUSTITUCION') {
    const sale = evento.jugadorNombre || evento.jugador?.nombre || '';
    const entra = evento.jugadorEntraNombre || evento.jugadorEntra?.nombre || '';
    return (
      <View style={styles.eventoRow}>
        <Text style={styles.eventoMinuto}>{evento.minuto}'</Text>
        <View style={[styles.cardIcon, { backgroundColor: color }]} />
        <View style={{ flex: 1 }}>
          <Text style={typography.body}>Sale {sale}, entra {entra}</Text>
          <Text style={styles.eventoEquipo}>{equipoNombre}</Text>
        </View>
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>
    );
  }

  const label = EVENTO_LABELS[evento.tipo] || evento.tipo;
  return (
    <View style={styles.eventoRow}>
      <Text style={styles.eventoMinuto}>{evento.minuto}'</Text>
      <View style={[styles.cardIcon, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <Text style={typography.body}>{label} - {evento.jugadorNombre || evento.jugador?.nombre || ''}</Text>
        <Text style={styles.eventoEquipo}>{equipoNombre}</Text>
      </View>
      <TouchableOpacity onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="trash-outline" size={18} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );
}

export default function OrgRegistroResultadoScreen({ navigation, route }) {
  const { partido } = route.params;
  const [jugadoresLocal, setJugadoresLocal] = useState([]);
  const [jugadoresVisitante, setJugadoresVisitante] = useState([]);
  const [savedEventos, setSavedEventos] = useState([]);
  const [newEventos, setNewEventos] = useState([]);
  const [penalesLocal, setPenalesLocal] = useState('');
  const [penalesVisitante, setPenalesVisitante] = useState('');
  const [estadoActual, setEstadoActual] = useState(partido.estado);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const isLiguilla = partido.fase === 'LIGUILLA';

  const cargarDatos = useCallback(() => {
    return Promise.all([
      api.get(`/jugadores/equipo/${partido.equipoLocal.id}`),
      api.get(`/jugadores/equipo/${partido.equipoVisitante.id}`),
      api.get(`/partidos/${partido.id}`),
    ]).then(([jl, jv, p]) => {
      setJugadoresLocal(jl.data);
      setJugadoresVisitante(jv.data);
      const existingEvents = (p.data.eventos || []).map((e) => ({
        ...e,
        jugadorNombre: e.jugador?.nombre || '',
        jugadorEntraNombre: e.jugadorEntra?.nombre || '',
        equipoNombre: e.jugador?.equipo?.nombre || '',
        teamSide: e.jugador?.equipo?.id === partido.equipoLocal.id ? 'local' : 'visitante',
      }));
      setSavedEventos(existingEvents);
      setEstadoActual(p.data.estado);
      if (p.data.penalesLocal) setPenalesLocal(String(p.data.penalesLocal));
      if (p.data.penalesVisitante) setPenalesVisitante(String(p.data.penalesVisitante));
    });
  }, [partido.id, partido.equipoLocal.id, partido.equipoVisitante.id]);

  useFocusEffect(
    useCallback(() => {
      cargarDatos().finally(() => setLoading(false));
    }, [cargarDatos])
  );

  const allEventos = [...savedEventos, ...newEventos];

  const golesLocal = allEventos.filter((e) =>
    (e.tipo === 'GOL' && e.teamSide === 'local') ||
    (e.tipo === 'AUTOGOL' && e.teamSide === 'visitante')
  ).length;

  const golesVisitante = allEventos.filter((e) =>
    (e.tipo === 'GOL' && e.teamSide === 'visitante') ||
    (e.tipo === 'AUTOGOL' && e.teamSide === 'local')
  ).length;

  const handleDeleteSaved = async (evento) => {
    Alert.alert('Eliminar evento', `¿Eliminar este evento (min ${evento.minuto})?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/partidos/${partido.id}/eventos/${evento.id}`);
            setSavedEventos((prev) => prev.filter((e) => e.id !== evento.id));
          } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'No se pudo eliminar.');
          }
        },
      },
    ]);
  };

  const handleDeleteNew = (index) => {
    setNewEventos((prev) => prev.filter((_, i) => i !== index));
  };

  const persistirEventosNuevos = async () => {
    for (const evento of newEventos) {
      const body = {
        tipo: evento.tipo,
        jugadorId: evento.jugadorId,
        minuto: evento.minuto,
      };
      if (evento.tipo === 'SUSTITUCION') body.jugadorEntraId = evento.jugadorEntraId;
      await api.post(`/partidos/${partido.id}/eventos`, body);
    }
  };

  const handleGuardar = async () => {
    setSaving(true);
    try {
      await persistirEventosNuevos();
      if (partido.estado === 'PENDIENTE' && estadoActual === 'PENDIENTE') {
        await api.put(`/partidos/${partido.id}`, { estado: 'EN_CURSO' });
      }
      setNewEventos([]);
      await cargarDatos();
      Alert.alert('Cambios guardados', 'Los eventos se guardaron sin finalizar el partido.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleFinalizar = async () => {
    setFinalizando(true);
    try {
      await persistirEventosNuevos();

      const body = { golesLocal, golesVisitante };
      if (isLiguilla && penalesLocal && penalesVisitante) {
        body.penalesLocal = parseInt(penalesLocal, 10);
        body.penalesVisitante = parseInt(penalesVisitante, 10);
      }
      await api.patch(`/partidos/${partido.id}/resultado`, body);

      Alert.alert(
        'Resultado guardado',
        `${partido.local} ${golesLocal} - ${golesVisitante} ${partido.visitante}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Error', err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'No se pudo guardar.');
    } finally {
      setFinalizando(false);
    }
  };

  if (loading) {
    return <ScreenContainer><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} /></ScreenContainer>;
  }

  const equipos = [partido.local, partido.visitante];
  const saving_any = saving || finalizando;

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
        <Text style={styles.scoreCaption}>
          {estadoActual === 'EN_CURSO' ? 'En curso' : 'Marcador provisional'}
        </Text>
      </Card>

      {allEventos.length > 0 && (
        <Card>
          <Text style={styles.cardTitle}>Eventos registrados</Text>
          {savedEventos.map((e) => (
            <EventoRow key={e.id} evento={e} onDelete={() => handleDeleteSaved(e)} />
          ))}
          {newEventos.map((e, i) => (
            <EventoRow key={`new-${i}`} evento={e} onDelete={() => handleDeleteNew(i)} />
          ))}
        </Card>
      )}

      <EventoForm
        titulo="Goles"
        equipos={equipos}
        jugadoresLocal={jugadoresLocal}
        jugadoresVisitante={jugadoresVisitante}
        localName={partido.local}
        tipos={TIPOS_GOL}
        tipoLabel="Tipo"
        onAgregar={(evento) => setNewEventos((prev) => [...prev, evento])}
      />

      <SustitucionForm
        equipos={equipos}
        jugadoresLocal={jugadoresLocal}
        jugadoresVisitante={jugadoresVisitante}
        localName={partido.local}
        onAgregar={(evento) => setNewEventos((prev) => [...prev, evento])}
      />

      <EventoForm
        titulo="Faltas / Tarjetas"
        equipos={equipos}
        jugadoresLocal={jugadoresLocal}
        jugadoresVisitante={jugadoresVisitante}
        localName={partido.local}
        tipos={SANCIONES}
        tipoLabel="Sanción"
        onAgregar={(evento) => setNewEventos((prev) => [...prev, evento])}
      />

      {isLiguilla && (
        <Card>
          <Text style={styles.cardTitle}>Penales (solo eliminatoria)</Text>
          <View style={styles.rowInputs}>
            <FormInput
              label={partido.local}
              placeholder="0"
              keyboardType="numeric"
              value={penalesLocal}
              onChangeText={setPenalesLocal}
              containerStyle={{ flex: 1, marginRight: spacing.sm }}
            />
            <FormInput
              label={partido.visitante}
              placeholder="0"
              keyboardType="numeric"
              value={penalesVisitante}
              onChangeText={setPenalesVisitante}
              containerStyle={{ flex: 1 }}
            />
          </View>
        </Card>
      )}

      <View style={styles.actions}>
        <PrimaryButton title="Volver" variant="outline" onPress={() => navigation.goBack()} style={styles.actionBtn} />
        <PrimaryButton title={saving ? 'Guardando...' : 'Guardar'} onPress={handleGuardar} disabled={saving_any} style={styles.actionBtn} />
      </View>
      <PrimaryButton
        title={finalizando ? 'Finalizando...' : 'Finalizar partido'}
        onPress={handleFinalizar}
        disabled={saving_any}
        style={{ marginTop: spacing.sm, marginBottom: spacing.xl }}
      />
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
  eventoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  eventoMinuto: {
    ...typography.caption,
    fontFamily: fonts.semiBold,
    color: colors.text,
    width: 30,
  },
  cardIcon: {
    width: 14,
    height: 18,
    borderRadius: 2,
  },
  eventoEquipo: {
    ...typography.caption,
    fontSize: 11,
  },
});
