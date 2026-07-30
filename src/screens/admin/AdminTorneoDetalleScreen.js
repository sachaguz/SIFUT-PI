import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Alert from '../../services/alert';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import PrimaryButton from '../../components/PrimaryButton';
import ListRow from '../../components/ListRow';
import api, { esFaseEliminatoria, estadoLabel, faseLabel, formatDate } from '../../services/api';
import { colors, fonts, spacing, typography } from '../../theme/colors';

export default function AdminTorneoDetalleScreen({ navigation, route }) {
  const { torneoId } = route.params;
  const [torneo, setTorneo] = useState(null);
  const [tabla, setTabla] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const jornadaPartidos = (torneo.partidos || []).filter((p) => !esFaseEliminatoria(p.fase));
  const liguiPartidos = (torneo.partidos || []).filter((p) => esFaseEliminatoria(p.fase));
  const proximosPartidos = (torneo.partidos || []).filter((p) => p.estado === 'PENDIENTE' && !esFaseEliminatoria(p.fase));
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

  const handleEliminar = () => {
    Alert.alert('Eliminar torneo', `¿Eliminar ${torneo.nombre}? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await api.delete(`/torneos/${torneo.id}`);
            navigation.goBack();
          } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'No se pudo eliminar el torneo.');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
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
          <Text style={[typography.subtitle, { marginBottom: spacing.sm }]}>Liguilla</Text>
          {['CUARTOS', 'SEMIFINAL', 'FINAL'].map((faseKey) => {
            const partidosFase = liguiPartidos.filter((p) => p.fase === faseKey);
            if (partidosFase.length === 0) return null;
            return (
              <View key={faseKey} style={{ marginBottom: spacing.md }}>
                <Text style={styles.faseHeader}>{faseLabel(faseKey)}</Text>
                {partidosFase.map((partido) => {
                  const local = partido.equipoLocal?.nombre || '';
                  const visitante = partido.equipoVisitante?.nombre || '';
                  const isFinalizado = partido.estado === 'FINALIZADO';
                  return (
                    <ListRow
                      key={partido.id}
                      icon="trophy-outline"
                      title={isFinalizado ? `${local} ${partido.golesLocal}-${partido.golesVisitante} ${visitante}` : `${local} vs ${visitante}`}
                      subtitle={`${formatDate(partido.fecha)} · ${partido.hora}`}
                      right={<Badge label={estadoLabel(partido.estado)} tone={isFinalizado ? 'success' : 'warning'} />}
                      onPress={() => isFinalizado
                        ? navigation.navigate('PartidoDetalle', {
                            partido: { ...partido, local, visitante, torneo: torneo.nombre, fecha: formatDate(partido.fecha) },
                          })
                        : navigation.navigate('AdminRegistroResultado', {
                            partido: { ...partido, local, visitante, torneo: torneo.nombre, fecha: formatDate(partido.fecha) },
                          })
                      }
                    />
                  );
                })}
              </View>
            );
          })}
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
          title="Generar jornadas (round-robin)"
          onPress={handleGenerarJornadas}
          loading={generating}
          style={{ marginTop: spacing.md }}
        />
      )}

      {hasJornadas && !hasLiguilla && (torneo.equipos || []).length >= 8 && (
        <PrimaryButton
          title="Generar liguilla (8 equipos)"
          variant="outline"
          onPress={handleGenerarLiguilla}
          loading={generating}
          style={{ marginTop: spacing.md }}
        />
      )}

      <View style={styles.actions}>
        <PrimaryButton
          title="Editar torneo"
          variant="outline"
          onPress={() => navigation.navigate('AdminTorneoForm', { torneo })}
          style={styles.actionBtn}
        />
        <PrimaryButton
          title="Programar partido"
          onPress={() => navigation.navigate('AdminPartidoForm', { torneoId: torneo.id })}
          style={styles.actionBtn}
        />
      </View>

      <PrimaryButton
        title="Eliminar torneo"
        variant="ghost"
        onPress={handleEliminar}
        loading={deleting}
        style={{ marginTop: spacing.md }}
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
  faseHeader: {
    ...typography.eyebrow,
    color: colors.textMuted,
    marginBottom: spacing.xs,
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
