import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import PrimaryButton from '../../components/PrimaryButton';
import ListRow from '../../components/ListRow';
import api, { formatDate, estadoLabel } from '../../services/api';
import { colors, fonts, spacing, typography } from '../../theme/colors';

export default function OrgTorneoDetalleScreen({ navigation, route }) {
  const { torneoId } = route.params;
  const [torneo, setTorneo] = useState(null);
  const [tabla, setTabla] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        api.get(`/torneos/${torneoId}`),
        api.get(`/torneos/${torneoId}/tabla`),
      ]).then(([t, tb]) => {
        setTorneo(t.data);
        setTabla(tb.data);
      }).finally(() => setLoading(false));
    }, [torneoId])
  );

  if (loading || !torneo) {
    return <ScreenContainer><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} /></ScreenContainer>;
  }

  const jornadaPartidos = (torneo.partidos || []).filter((p) => p.fase !== 'LIGUILLA');
  const liguiPartidos = (torneo.partidos || []).filter((p) => p.fase === 'LIGUILLA');
  const proximosPartidos = (torneo.partidos || []).filter((p) => p.estado === 'PENDIENTE');
  const hasJornadas = jornadaPartidos.length > 0;
  const hasLiguilla = liguiPartidos.length > 0;

  const handleGenerarJornadas = async () => {
    Alert.alert(
      'Generar jornadas',
      'Se crearán todos los partidos de liga (round-robin) para que cada equipo juegue contra todos los demás una vez. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Generar',
          onPress: async () => {
            setGenerating(true);
            try {
              const res = await api.post(`/torneos/${torneo.id}/generar-jornadas`);
              Alert.alert('Jornadas generadas', `Se crearon ${res.data.partidosCreados} partidos en ${res.data.totalJornadas} jornadas.`);
              const [t, tb] = await Promise.all([
                api.get(`/torneos/${torneo.id}`),
                api.get(`/torneos/${torneo.id}/tabla`),
              ]);
              setTorneo(t.data);
              setTabla(tb.data);
            } catch (err) {
              Alert.alert('Error', err.response?.data?.error || 'No se pudieron generar las jornadas.');
            } finally {
              setGenerating(false);
            }
          },
        },
      ]
    );
  };

  const handleGenerarLiguilla = async () => {
    Alert.alert(
      'Generar liguilla',
      'Se crearán los cuartos de final con los 8 mejores equipos (1° vs 8°, 2° vs 7°, etc). ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Generar',
          onPress: async () => {
            setGenerating(true);
            try {
              const res = await api.post(`/torneos/${torneo.id}/generar-liguilla`);
              Alert.alert('Liguilla generada', `Se crearon ${res.data.partidos.length} partidos de cuartos de final.`);
              const [t, tb] = await Promise.all([
                api.get(`/torneos/${torneo.id}`),
                api.get(`/torneos/${torneo.id}/tabla`),
              ]);
              setTorneo(t.data);
              setTabla(tb.data);
            } catch (err) {
              Alert.alert('Error', err.response?.data?.error || 'No se pudo generar la liguilla.');
            } finally {
              setGenerating(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{torneo.nombre}</Text>
      <Text style={styles.subtitle}>
        {torneo.tipo} · {torneo.categoria}
      </Text>

      <Card>
        <Text style={styles.cardTitle}>Tabla de posiciones</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 0.4 }]}>#</Text>
          <Text style={[styles.th, { flex: 2 }]}>Equipo</Text>
          <Text style={styles.th}>JJ</Text>
          <Text style={styles.th}>DG</Text>
          <Text style={styles.th}>Pts</Text>
        </View>
        {tabla.length === 0 ? (
          <Text style={styles.empty}>Aún no hay datos en la tabla.</Text>
        ) : (
          tabla.map((fila) => (
            <View key={fila.pos} style={styles.tableRow}>
              <Text style={[styles.td, { flex: 0.4 }]}>{fila.pos}</Text>
              <Text style={[styles.td, { flex: 2, textAlign: 'left' }]}>{fila.equipo}</Text>
              <Text style={styles.td}>{fila.jj}</Text>
              <Text style={styles.td}>{fila.dg}</Text>
              <Text style={[styles.td, styles.puntos]}>{fila.pts}</Text>
            </View>
          ))
        )}
      </Card>

      {liguiPartidos.length > 0 && (
        <>
          <Text style={typography.subtitle}>Liguilla</Text>
          <View style={{ marginTop: spacing.sm }}>
            {liguiPartidos.map((partido) => (
              <ListRow
                key={partido.id}
                icon="trophy-outline"
                title={`${partido.equipoLocal?.nombre || ''} vs ${partido.equipoVisitante?.nombre || ''}`}
                subtitle={`${formatDate(partido.fecha)} · ${partido.hora}`}
                right={<Badge label={estadoLabel(partido.estado)} tone={partido.estado === 'FINALIZADO' ? 'success' : 'warning'} />}
              />
            ))}
          </View>
        </>
      )}

      <Text style={typography.subtitle}>Próximos partidos</Text>
      <View style={{ marginTop: spacing.sm }}>
        {proximosPartidos.length === 0 ? (
          <Text style={styles.empty}>No hay partidos próximos programados.</Text>
        ) : (
          proximosPartidos.slice(0, 10).map((partido) => (
            <ListRow
              key={partido.id}
              icon="football-outline"
              title={`${partido.equipoLocal?.nombre || ''} vs ${partido.equipoVisitante?.nombre || ''}`}
              subtitle={`Jornada ${partido.jornada} · ${formatDate(partido.fecha)} · ${partido.hora}`}
              meta={partido.cancha?.nombre || ''}
            />
          ))
        )}
      </View>

      {!hasJornadas && (torneo.equipos || []).length >= 2 && (
        <PrimaryButton
          title={generating ? 'Generando...' : 'Generar jornadas (round-robin)'}
          onPress={handleGenerarJornadas}
          disabled={generating}
          style={{ marginTop: spacing.md }}
        />
      )}

      {hasJornadas && !hasLiguilla && (torneo.equipos || []).length >= 8 && (
        <PrimaryButton
          title={generating ? 'Generando...' : 'Generar liguilla (8 equipos)'}
          variant="outline"
          onPress={handleGenerarLiguilla}
          disabled={generating}
          style={{ marginTop: spacing.md }}
        />
      )}

      <View style={styles.actions}>
        <PrimaryButton
          title="Editar torneo"
          variant="outline"
          onPress={() => navigation.navigate('OrgTorneoForm', { torneo })}
          style={styles.actionBtn}
        />
        <PrimaryButton
          title="Programar partido"
          onPress={() => navigation.navigate('OrgPartidoForm', { torneoId: torneo.id })}
          style={styles.actionBtn}
        />
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
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.subtitle,
    marginBottom: spacing.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.xs,
    marginBottom: spacing.xs,
  },
  th: {
    flex: 1,
    ...typography.eyebrow,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.xs + 2,
  },
  td: {
    flex: 1,
    ...typography.body,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  puntos: {
    fontFamily: fonts.extraBold,
    color: colors.primary,
  },
  empty: {
    ...typography.body,
    color: colors.textMuted,
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
