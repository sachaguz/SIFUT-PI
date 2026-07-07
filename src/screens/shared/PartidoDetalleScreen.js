import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, spacing, typography } from '../../theme/colors';

const EVENTO_MARCA = {
  Gol: { icon: 'football', color: colors.primary, label: 'Gol' },
  Autogol: { icon: 'football', color: colors.textMuted, label: 'Autogol' },
  'Tarjeta roja': { icon: 'card', color: colors.danger, label: 'Roja' },
  'Tarjeta amarilla': { icon: 'card', color: colors.warning, label: 'Amarilla' },
  Cambio: { icon: 'swap-horizontal', color: colors.secondary, label: 'Cambio' },
};

export default function PartidoDetalleScreen({ route }) {
  const { partido } = route.params;
  const eventos = partido.eventos || [];
  const stats = partido.estadisticas;

  return (
    <ScreenContainer>
      <Card style={styles.scoreCard}>
        <View style={styles.scoreRow}>
          <Text style={styles.equipo}>{partido.local}</Text>
          <Text style={styles.score}>
            {partido.golesLocal ?? 0} - {partido.golesVisitante ?? 0}
          </Text>
          <Text style={styles.equipo}>{partido.visitante}</Text>
        </View>
        <Text style={styles.meta}>
          {partido.torneo} · {partido.cancha}
        </Text>
      </Card>

      <Text style={typography.subtitle}>Eventos del partido</Text>
      <Card style={{ marginTop: spacing.sm }}>
        {eventos.length === 0 ? (
          <Text style={styles.empty}>Aún no hay eventos registrados.</Text>
        ) : (
          eventos.map((evento, index) => {
            const marca = EVENTO_MARCA[evento.tipo];
            return (
              <View key={index} style={styles.eventoRow}>
                <Text style={styles.eventoMinuto}>{evento.minuto}'</Text>
                <Ionicons
                  name={marca?.icon || 'ellipse'}
                  size={16}
                  color={marca?.color || colors.textMuted}
                  style={styles.eventoIcon}
                />
                <Text style={styles.eventoTexto}>
                  {marca?.label || evento.tipo} · {evento.jugador} ({evento.equipo})
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
            <StatRow label="Posesión" values={stats.posesion} suffix="%" />
            <StatRow label="Tiros al arco" values={stats.tirosAlArco} />
            <StatRow label="Pases efectivos" values={stats.pasesEfectivos} suffix="%" />
            <StatRow label="Faltas" values={stats.faltas} />
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
