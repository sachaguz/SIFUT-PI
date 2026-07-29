import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/ScreenContainer';
import SectionHeader from '../../components/SectionHeader';
import ListRow from '../../components/ListRow';
import Badge from '../../components/Badge';
import PillSelector from '../../components/PillSelector';
import PrimaryButton from '../../components/PrimaryButton';
import api, { esFaseEliminatoria, estadoLabel, faseLabel, formatDate } from '../../services/api';
import { colors, spacing, typography } from '../../theme/colors';

const FASE_POR_LABEL = { 'Cuartos de Final': 'CUARTOS', Semifinal: 'SEMIFINAL', Final: 'FINAL' };

export default function OrgPartidosScreen({ navigation }) {
  const [torneos, setTorneos] = useState([]);
  const [torneoId, setTorneoId] = useState('');
  const [partidos, setPartidos] = useState([]);
  const [jornadaSel, setJornadaSel] = useState('');
  const [loadingTorneos, setLoadingTorneos] = useState(true);
  const [loadingPartidos, setLoadingPartidos] = useState(false);

  useFocusEffect(
    useCallback(() => {
      api.get('/torneos').then((r) => {
        setTorneos(r.data);
        if (r.data.length > 0) setTorneoId((prev) => prev || r.data[0].id);
      }).finally(() => setLoadingTorneos(false));
    }, [])
  );

  useEffect(() => {
    if (!torneoId) return;
    setLoadingPartidos(true);
    setJornadaSel('');
    api.get(`/partidos?torneoId=${torneoId}`)
      .then((r) => setPartidos(r.data))
      .finally(() => setLoadingPartidos(false));
  }, [torneoId]);

  if (loadingTorneos) {
    return <ScreenContainer><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} /></ScreenContainer>;
  }

  if (torneos.length === 0) {
    return (
      <ScreenContainer>
        <SectionHeader title="Partidos" subtitle="Calendario de encuentros" />
        <Text style={typography.body}>Crea un torneo primero para poder programar partidos.</Text>
      </ScreenContainer>
    );
  }

  const jornadaNumeros = [...new Set(
    partidos.filter((p) => p.fase === 'JORNADA').map((p) => p.jornada)
  )].sort((a, b) => a - b);
  const fasesPresentes = ['CUARTOS', 'SEMIFINAL', 'FINAL'].filter((f) => partidos.some((p) => p.fase === f));

  const jornadaLabels = [
    ...jornadaNumeros.map((n) => `Jornada ${n}`),
    ...fasesPresentes.map(faseLabel),
  ];

  const jornadaPendiente = jornadaLabels.find((label) => {
    const fase = FASE_POR_LABEL[label];
    return partidos.some((p) => (fase ? p.fase === fase : `Jornada ${p.jornada}` === label && p.fase === 'JORNADA') && p.estado !== 'FINALIZADO');
  });

  const activeLabel = jornadaLabels.includes(jornadaSel) ? jornadaSel : (jornadaPendiente || jornadaLabels[0] || '');
  const activeFase = FASE_POR_LABEL[activeLabel];

  const partidosMostrados = partidos.filter((p) => (
    activeFase ? p.fase === activeFase : `Jornada ${p.jornada}` === activeLabel && p.fase === 'JORNADA'
  ));

  const selectedTorneo = torneos.find((t) => t.id === torneoId);

  return (
    <ScreenContainer>
      <SectionHeader title="Partidos" subtitle="Calendario de encuentros" />

      <PillSelector
        label="Torneo"
        options={torneos.map((t) => t.nombre)}
        value={selectedTorneo?.nombre || ''}
        onChange={(label) => {
          const t = torneos.find((item) => item.nombre === label);
          if (t) setTorneoId(t.id);
        }}
      />

      {loadingPartidos ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : jornadaLabels.length === 0 ? (
        <Text style={typography.body}>Este torneo aún no tiene partidos programados.</Text>
      ) : (
        <>
          <PillSelector
            label="Jornada"
            options={jornadaLabels}
            value={activeLabel}
            onChange={setJornadaSel}
          />

          {partidosMostrados.map((partido) => {
            const local = partido.equipoLocal?.nombre || '';
            const visitante = partido.equipoVisitante?.nombre || '';
            const torneo = partido.torneo?.nombre || '';
            const cancha = partido.cancha ? `${partido.cancha.nombre} - ${partido.cancha.sede?.nombre || ''}` : '';
            const isFinalizado = partido.estado === 'FINALIZADO';
            return (
              <ListRow
                key={partido.id}
                icon="football-outline"
                title={isFinalizado ? `${local} ${partido.golesLocal}-${partido.golesVisitante} ${visitante}` : `${local} vs ${visitante}`}
                subtitle={`${torneo} · ${esFaseEliminatoria(partido.fase) ? faseLabel(partido.fase) : `Jornada ${partido.jornada}`}`}
                meta={`${formatDate(partido.fecha)} · ${partido.hora} · ${cancha}`}
                right={(
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <Badge label={estadoLabel(partido.estado)} tone={isFinalizado ? 'success' : 'warning'} />
                    <TouchableOpacity
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      onPress={() => navigation.navigate('OrgPartidoForm', {
                        partido: { ...partido, fecha: partido.fecha },
                      })}
                    >
                      <Ionicons name="create-outline" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                )}
                onPress={() => isFinalizado
                  ? navigation.navigate('PartidoDetalle', {
                      partido: { ...partido, local, visitante, torneo, cancha, fecha: formatDate(partido.fecha) },
                    })
                  : navigation.navigate('OrgRegistroResultado', {
                      partido: { ...partido, local, visitante, torneo, cancha, fecha: formatDate(partido.fecha) },
                    })
                }
              />
            );
          })}
        </>
      )}

      <View style={{ marginTop: spacing.md }}>
        <PrimaryButton title="+ Programar partido" onPress={() => navigation.navigate('OrgPartidoForm', { torneoId })} />
      </View>
    </ScreenContainer>
  );
}
