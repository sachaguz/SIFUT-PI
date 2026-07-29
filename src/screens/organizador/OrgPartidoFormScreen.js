import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import FormInput from '../../components/FormInput';
import PillSelector from '../../components/PillSelector';
import PrimaryButton from '../../components/PrimaryButton';
import api from '../../services/api';
import { colors, spacing, typography } from '../../theme/colors';

export default function OrgPartidoFormScreen({ navigation, route }) {
  const preselectedTorneoId = route.params?.torneoId;
  const [torneos, setTorneos] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [torneoId, setTorneoId] = useState(preselectedTorneoId || '');
  const [equipos, setEquipos] = useState([]);
  const [equipoLocalId, setEquipoLocalId] = useState('');
  const [equipoVisitanteId, setEquipoVisitanteId] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('17:00');
  const [jornada, setJornada] = useState('');
  const [canchaId, setCanchaId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        api.get('/torneos'),
        api.get('/canchas'),
      ]).then(([t, c]) => {
        setTorneos(t.data);
        setCanchas(c.data);
        if (!preselectedTorneoId && t.data.length > 0) setTorneoId(t.data[0].id);
        if (c.data.length > 0) setCanchaId(c.data[0].id);
      }).finally(() => setLoading(false));
    }, [])
  );

  useEffect(() => {
    if (torneoId) {
      api.get(`/equipos?torneoId=${torneoId}`).then((r) => {
        setEquipos(r.data);
        if (r.data.length > 0) setEquipoLocalId(r.data[0].id);
        if (r.data.length > 1) setEquipoVisitanteId(r.data[1].id);
      });
    }
  }, [torneoId]);

  const handleGuardar = async () => {
    if (!equipoLocalId || !equipoVisitanteId || equipoLocalId === equipoVisitanteId) {
      Alert.alert('Equipos inválidos', 'Selecciona dos equipos distintos.');
      return;
    }
    if (!fecha || !jornada) {
      Alert.alert('Faltan datos', 'Ingresa la fecha y la jornada.');
      return;
    }
    setSaving(true);
    try {
      const body = {
        torneoId,
        equipoLocalId,
        equipoVisitanteId,
        fecha,
        hora,
        jornada: parseInt(jornada, 10),
        canchaId: canchaId || undefined,
      };
      await api.post('/partidos', body);
      const local = equipos.find((e) => e.id === equipoLocalId)?.nombre || '';
      const visitante = equipos.find((e) => e.id === equipoVisitanteId)?.nombre || '';
      Alert.alert('Partido programado', `${local} vs ${visitante}`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'No se pudo programar el partido.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ScreenContainer><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} /></ScreenContainer>;
  }

  const selectedTorneo = torneos.find((t) => t.id === torneoId);
  const selectedLocal = equipos.find((e) => e.id === equipoLocalId);
  const selectedVisitante = equipos.find((e) => e.id === equipoVisitanteId);
  const selectedCancha = canchas.find((c) => c.id === canchaId);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Nuevo partido</Text>

      <PillSelector
        label="Torneo"
        options={torneos.map((t) => t.nombre)}
        value={selectedTorneo?.nombre || ''}
        onChange={(label) => {
          const t = torneos.find((item) => item.nombre === label);
          if (t) setTorneoId(t.id);
        }}
      />

      <PillSelector
        label="Equipo local"
        options={equipos.map((e) => e.nombre)}
        value={selectedLocal?.nombre || ''}
        onChange={(label) => {
          const e = equipos.find((item) => item.nombre === label);
          if (e) setEquipoLocalId(e.id);
        }}
      />

      <PillSelector
        label="Equipo visitante"
        options={equipos.map((e) => e.nombre)}
        value={selectedVisitante?.nombre || ''}
        onChange={(label) => {
          const e = equipos.find((item) => item.nombre === label);
          if (e) setEquipoVisitanteId(e.id);
        }}
      />

      <View style={styles.row}>
        <FormInput label="Fecha" placeholder="2026-08-15" value={fecha} onChangeText={setFecha} containerStyle={{ flex: 1, marginRight: spacing.sm }} />
        <FormInput label="Hora" placeholder="17:00" value={hora} onChangeText={setHora} containerStyle={{ flex: 1 }} />
      </View>

      <FormInput label="Jornada" placeholder="1" keyboardType="numeric" value={jornada} onChangeText={setJornada} />

      <PillSelector
        label="Cancha"
        options={canchas.map((c) => `${c.nombre} - ${c.sede?.nombre || ''}`)}
        value={selectedCancha ? `${selectedCancha.nombre} - ${selectedCancha.sede?.nombre || ''}` : ''}
        onChange={(label) => {
          const c = canchas.find((item) => `${item.nombre} - ${item.sede?.nombre || ''}` === label);
          if (c) setCanchaId(c.id);
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
  row: {
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
