import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import FormInput from '../../components/FormInput';
import PillSelector from '../../components/PillSelector';
import PrimaryButton from '../../components/PrimaryButton';
import { TORNEOS } from '../../data/torneos';
import { SEDES } from '../../data/sedes';
import { spacing, typography } from '../../theme/colors';

const CANCHAS = SEDES.flatMap((sede) => sede.canchas.map((cancha) => `${cancha.nombre} - ${sede.nombre}`));
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function OrgPartidoFormScreen({ navigation, route }) {
  const torneoPreseleccionado = route.params?.torneo;
  const [torneo, setTorneo] = useState(torneoPreseleccionado?.nombre || TORNEOS[0].nombre);

  const equiposDisponibles = useMemo(() => {
    const t = TORNEOS.find((item) => item.nombre === torneo);
    return t ? t.equipos : [];
  }, [torneo]);

  const [equipoLocal, setEquipoLocal] = useState(equiposDisponibles[0] || '');
  const [equipoVisitante, setEquipoVisitante] = useState(equiposDisponibles[1] || '');
  const [dia, setDia] = useState('Sáb');
  const [hora, setHora] = useState('17:00');
  const [cancha, setCancha] = useState(CANCHAS[0]);
  const [jornada, setJornada] = useState('');

  const handleGuardar = () => {
    if (!equipoLocal || !equipoVisitante || equipoLocal === equipoVisitante) {
      Alert.alert('Equipos inválidos', 'Selecciona dos equipos distintos.');
      return;
    }
    Alert.alert('Partido programado', `${equipoLocal} vs ${equipoVisitante} · ${dia} ${hora}`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Nuevo partido</Text>

      <PillSelector label="Torneo" options={TORNEOS.map((t) => t.nombre)} value={torneo} onChange={setTorneo} />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <PillSelector label="Equipo local" options={equiposDisponibles} value={equipoLocal} onChange={setEquipoLocal} />
        </View>
      </View>
      <PillSelector label="Equipo visitante" options={equiposDisponibles} value={equipoVisitante} onChange={setEquipoVisitante} />

      <PillSelector label="Día" options={DIAS} value={dia} onChange={setDia} />

      <View style={styles.row}>
        <FormInput label="Hora" placeholder="17:00" value={hora} onChangeText={setHora} containerStyle={{ flex: 1, marginRight: spacing.sm }} />
        <FormInput label="Jornada" placeholder="Jornada 6" value={jornada} onChangeText={setJornada} containerStyle={{ flex: 1 }} />
      </View>

      <PillSelector label="Cancha" options={CANCHAS} value={cancha} onChange={setCancha} />

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
