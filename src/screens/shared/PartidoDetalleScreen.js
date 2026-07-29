import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import api, { esFaseEliminatoria, faseLabel } from '../../services/api';
import { colors, fonts, spacing, typography } from '../../theme/colors';

const EVENTO_MARCA = {
  GOL: { icon: 'football', color: colors.primary, label: 'Gol', useIcon: true },
  AUTOGOL: { icon: 'football', color: colors.textMuted, label: 'Autogol', useIcon: true },
  TARJETA_ROJA: { color: colors.danger, label: 'Roja', useCard: true },
  TARJETA_AMARILLA: { color: colors.warning, label: 'Amarilla', useCard: true },
  SUSTITUCION: { icon: 'swap-horizontal', color: colors.secondary, label: 'Cambio', useIcon: true },
};

export default function PartidoDetalleScreen({ route }) {
  const { partido: partidoParam } = route.params;
  const [partido, setPartido] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      api.get(`/partidos/${partidoParam.id}`)
        .then((r) => setPartido(r.data))
        .finally(() => setLoading(false));
    }, [partidoParam.id])
  );

  if (loading || !partido) {
    return <ScreenContainer><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} /></ScreenContainer>;
  }

  const local = partido.equipoLocal?.nombre || '';
  const visitante = partido.equipoVisitante?.nombre || '';
  const torneo = partido.torneo?.nombre || '';
  const cancha = partido.cancha
    ? `${partido.cancha.nombre} - ${partido.cancha.sede?.nombre || ''}`
    : '';
  const eventos = partido.eventos || [];
  const stats = partido.estadisticas;

  return (
    <ScreenContainer>
      <Card style={styles.scoreCard}>
        <View style={styles.scoreRow}>
          <Text style={styles.equipo}>{local}</Text>
          <Text style={styles.score}>
            {partido.golesLocal ?? 0} - {partido.golesVisitante ?? 0}
          </Text>
          <Text style={styles.equipo}>{visitante}</Text>
        </View>
        {(partido.penalesLocal > 0 || partido.penalesVisitante > 0) && (
          <Text style={styles.penales}>
            Penales: {partido.penalesLocal} - {partido.penalesVisitante}
          </Text>
        )}
        <Text style={styles.meta}>
          {torneo} · {cancha}{esFaseEliminatoria(partido.fase) ? ` · ${faseLabel(partido.fase)}` : ''}
        </Text>
      </Card>

      <Text style={typography.subtitle}>Eventos del partido</Text>
      <Card style={{ marginTop: spacing.sm }}>
        {eventos.length === 0 ? (
          <Text style={styles.empty}>Aún no hay eventos registrados.</Text>
        ) : (
          eventos.map((evento, index) => {
            const marca = EVENTO_MARCA[evento.tipo];
            const jugadorNombre = evento.jugador?.nombre || '';
            const equipoNombre = evento.jugador?.equipo?.nombre || '';
            const isSustitucion = evento.tipo === 'SUSTITUCION';
            const entraNombre = evento.jugadorEntra?.nombre || '';
            return (
              <View key={evento.id || index} style={styles.eventoRow}>
                <Text style={styles.eventoMinuto}>{evento.minuto}'</Text>
                {marca?.useCard ? (
                  <View style={[styles.cardIcon, { backgroundColor: marca.color }]} />
                ) : (
                  <Ionicons
                    name={marca?.icon || 'ellipse'}
                    size={16}
                    color={marca?.color || colors.textMuted}
                    style={styles.eventoIcon}
                  />
                )}
                <Text style={styles.eventoTexto}>
                  {isSustitucion
                    ? `Sale ${jugadorNombre}, entra ${entraNombre} (${equipoNombre})`
                    : `${marca?.label || evento.tipo} · ${jugadorNombre} (${equipoNombre})`}
                </Text>
              </View>
            );
          })
        )}
      </Card>

      {stats ? (
        <>
          <Text style={[typography.subtitle, { marginTop: spacing.md }]}>Estadísticas</Text>
          <Card style={{ marginTop: spacing.sm }}>
            {stats.posesion && <StatRow label="Posesión" values={stats.posesion} suffix="%" />}
            {stats.tirosAlArco && <StatRow label="Tiros al arco" values={stats.tirosAlArco} />}
            {stats.pasesEfectivos && <StatRow label="Pases efectivos" values={stats.pasesEfectivos} suffix="%" />}
            {stats.faltas && <StatRow label="Faltas" values={stats.faltas} />}
          </Card>
        </>
      ) : null}
    </ScreenContainer>
  );
}

function StatRow({ label, values, suffix = '' }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statValue}>
        {values[0]}
        {suffix}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>
        {values[1]}
        {suffix}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scoreCard: {
    alignItems: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  equipo: {
    ...typography.subtitle,
    flex: 1,
    textAlign: 'center',
  },
  score: {
    ...typography.display,
  },
  penales: {
    ...typography.caption,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
    marginTop: spacing.xs,
  },
  meta: {
    ...typography.caption,
    marginTop: spacing.sm,
  },
  empty: {
    ...typography.body,
    color: colors.textMuted,
  },
  eventoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  eventoMinuto: {
    ...typography.caption,
    width: 32,
    fontFamily: typography.subtitle.fontFamily,
    color: colors.text,
  },
  eventoIcon: {
    marginRight: spacing.sm,
  },
  cardIcon: {
    width: 14,
    height: 18,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  eventoTexto: {
    ...typography.body,
    flex: 1,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.displaySmall,
    width: 56,
    textAlign: 'center',
  },
  statLabel: {
    ...typography.body,
    color: colors.textMuted,
    flex: 1,
    textAlign: 'center',
  },
});
