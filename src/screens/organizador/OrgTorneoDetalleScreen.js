import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import PrimaryButton from '../../components/PrimaryButton';
import ListRow from '../../components/ListRow';
import { PARTIDOS } from '../../data/partidos';
import { colors, fonts, spacing, typography } from '../../theme/colors';

export default function OrgTorneoDetalleScreen({ navigation, route }) {
  const { torneo } = route.params;
  const proximosPartidos = PARTIDOS.filter((p) => p.torneo === torneo.nombre && p.estado === 'Pendiente');

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
        {torneo.tabla.map((fila) => (
          <View key={fila.pos} style={styles.tableRow}>
            <Text style={[styles.td, { flex: 0.4 }]}>{fila.pos}</Text>
            <Text style={[styles.td, { flex: 2, textAlign: 'left' }]}>{fila.equipo}</Text>
            <Text style={styles.td}>{fila.jj}</Text>
            <Text style={styles.td}>{fila.dg}</Text>
            <Text style={[styles.td, styles.puntos]}>{fila.pts}</Text>
          </View>
        ))}
      </Card>

      <Text style={typography.subtitle}>Próximos partidos</Text>
      <View style={{ marginTop: spacing.sm }}>
        {proximosPartidos.length === 0 ? (
          <Text style={styles.empty}>No hay partidos próximos programados.</Text>
        ) : (
          proximosPartidos.map((partido) => (
            <ListRow
              key={partido.id}
              icon="football-outline"
              title={`${partido.local} vs ${partido.visitante}`}
              subtitle={`${partido.fecha} · ${partido.hora}`}
              meta={partido.cancha}
            />
          ))
        )}
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          title="Editar torneo"
          variant="outline"
          onPress={() => navigation.navigate('OrgTorneoForm', { torneo })}
          style={styles.actionBtn}
        />
        <PrimaryButton
          title="Programar partido"
          onPress={() => navigation.navigate('OrgPartidoForm', { torneo })}
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
