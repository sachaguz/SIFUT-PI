import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import PillSelector from '../../components/PillSelector';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import api from '../../services/api';
import { colors, fonts, spacing, typography } from '../../theme/colors';

const VISTAS = ['Goleo individual', 'Reportes disciplinarios'];

export default function OrgEstadisticasScreen() {
  const [vista, setVista] = useState(VISTAS[0]);
  const [goleo, setGoleo] = useState([]);
  const [disciplina, setDisciplina] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        api.get('/estadisticas/goleo'),
        api.get('/estadisticas/disciplina'),
      ]).then(([g, d]) => {
        setGoleo(g.data);
        setDisciplina(d.data);
      }).finally(() => setLoading(false));
    }, [])
  );

  if (loading) {
    return <ScreenContainer><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} /></ScreenContainer>;
  }

  return (
    <ScreenContainer>
      <SectionHeader eyebrow="Torneos" title="Estadísticas" subtitle="Desempeño de la competencia" />

      <PillSelector options={VISTAS} value={vista} onChange={setVista} />

      {vista === 'Goleo individual' ? (
        <Card>
          {goleo.map((item, index) => (
            <View key={`${item.jugador}-${index}`} style={styles.row}>
              <Text style={styles.rank}>{index + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={typography.body}>{item.jugador}</Text>
                <Text style={styles.equipo}>{item.equipo}</Text>
              </View>
              <Badge label={`${item.goles} goles`} tone="success" />
            </View>
          ))}
        </Card>
      ) : (
        <Card>
          {disciplina.map((item, index) => (
            <View key={`${item.jugador}-${index}`} style={styles.rowDisciplinario}>
              <View style={{ flex: 1 }}>
                <Text style={typography.body}>{item.jugador}</Text>
                <Text style={styles.equipo}>{item.equipo}</Text>
              </View>
              <View style={styles.tarjeta}>
                <Ionicons name="card" size={14} color={colors.warning} />
                <Text style={styles.tarjetaCount}>{item.amarillas}</Text>
              </View>
              <View style={styles.tarjeta}>
                <Ionicons name="card" size={14} color={colors.danger} />
                <Text style={styles.tarjetaCount}>{item.rojas}</Text>
              </View>
            </View>
          ))}
        </Card>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowDisciplinario: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md },
  rank: { ...typography.displaySmall, fontSize: 18, width: 28 },
  equipo: { ...typography.caption },
  tarjeta: { flexDirection: 'row', alignItems: 'center', gap: 4, width: 40 },
  tarjetaCount: { ...typography.body, fontFamily: fonts.semiBold },
});
