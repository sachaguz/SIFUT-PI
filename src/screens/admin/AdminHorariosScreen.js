import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import ListRow from '../../components/ListRow';
import PillSelector from '../../components/PillSelector';
import Badge from '../../components/Badge';
import api from '../../services/api';
import { colors, spacing } from '../../theme/colors';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DIA_INDEX = { Lun: 1, Mar: 2, Mié: 3, Jue: 4, Vie: 5, Sáb: 6, Dom: 0 };

export default function AdminHorariosScreen({ route }) {
  const { sedeId, sede } = route.params || {};
  const [dia, setDia] = useState('Lun');
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!sedeId) return;
      setLoading(true);
      api.get(`/horarios/sede/${sedeId}`).then((r) => setHorarios(r.data)).finally(() => setLoading(false));
    }, [sedeId])
  );

  const bloques = horarios.filter((h) => h.diaSemana === DIA_INDEX[dia]);

  return (
    <ScreenContainer>
      <SectionHeader title="Horarios" subtitle={sede || 'Sede seleccionada'} />

      <PillSelector options={DIAS} value={dia} onChange={setDia} />

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : bloques.length === 0 ? (
        <Text style={styles.empty}>No hay bloques configurados este día.</Text>
      ) : (
        bloques.map((bloque) => (
          <ListRow
            key={bloque.id}
            icon="time-outline"
            title={`${bloque.horaInicio} - ${bloque.horaFin}`}
            subtitle={bloque.cancha?.nombre || 'Cancha'}
            meta={`$${Number(bloque.cancha?.precioPorHora || 0)} MXN/hora`}
            right={
              <Badge label={bloque.disponible ? 'Disponible' : 'Ocupado'} tone={bloque.disponible ? 'success' : 'danger'} />
            }
          />
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  empty: {
    textAlign: 'center',
    marginTop: spacing.lg,
    color: '#6B7570',
  },
});
