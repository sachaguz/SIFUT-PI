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
  const partido = route.params?.partido;
  const isEdit = !!partido?.id;
  const preselectedTorneoId = route.params?.torneoId || partido?.torneoId;
  const [torneos, setTorneos] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [torneoId, setTorneoId] = useState(preselectedTorneoId || '');
  const [equipos, setEquipos] = useState([]);
  const [equipoLocalId, setEquipoLocalId] = useState(partido?.equipoLocalId || '');
  const [equipoVisitanteId, setEquipoVisitanteId] = useState(partido?.equipoVisitanteId || '');
  const [fecha, setFecha] = useState(partido?.fecha ? partido.fecha.substring(0, 10) : '');
  const [hora, setHora] = useState(partido?.hora || '17:00');
  const [jornada, setJornada] = useState(partido?.jornada ? String(partido.jornada) : '');
  const [canchaId, setCanchaId] = useState(partido?.canchaId || '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [equiposLoaded, setEquiposLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        api.get('/torneos'),
        api.get('/canchas'),
      ]).then(([t, c]) => {
        setTorneos(t.data);
        setCanchas(c.data);
        if (!preselectedTorneoId && t.data.length > 0) setTorneoId(t.data[0].id);
        if (!isEdit && c.data.length > 0) setCanchaId(c.data[0].id);
      }).finally(() => setLoading(false));
    }, [])
  );

  useEffect(() => {
    if (torneoId) {
      api.get(`/equipos?torneoId=${torneoId}`).then((r) => {
        setEquipos(r.data);
        if (!isEdit || !equiposLoaded) {
          if (!equipoLocalId && r.data.length > 0) setEquipoLocalId(r.data[0].id);
          if (!equipoVisitanteId && r.data.length > 1) setEquipoVisitanteId(r.data[1].id);
        }
        setEquiposLoaded(true);
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
      if (isEdit) {
        await api.put(`/partidos/${partido.id}`, body);
      } else {
        await api.post('/partidos', body);
      }
      const local = equipos.find((e) => e.id === equipoLocalId)?.nombre || '';
      const visitante = equipos.find((e) => e.id === equipoVisitanteId)?.nombre || '';
      Alert.alert(isEdit ? 'Partido actualizado' : 'Partido programado', `${local} vs ${visitante}`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'No se pudo guardar el partido.');
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
      <Text style={styles.title}>{isEdit ? 'Editar partido' : 'Nuevo partido'}</Text>

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
