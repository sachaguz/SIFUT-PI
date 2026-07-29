const FASES_ELIMINATORIA = ['CUARTOS', 'SEMIFINAL', 'FINAL'];

function esFaseEliminatoria(fase) {
  return FASES_ELIMINATORIA.includes(fase);
}

function calcularTablaPosiciones(equipos, partidos) {
  const stats = {};
  for (const eq of equipos) {
    stats[eq.id] = { equipoId: eq.id, equipo: eq.nombre, jj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 };
  }

  for (const p of partidos) {
    const local = stats[p.equipoLocalId];
    const visitante = stats[p.equipoVisitanteId];
    if (!local || !visitante) continue;

    local.jj++;
    visitante.jj++;
    local.gf += p.golesLocal;
    local.gc += p.golesVisitante;
    visitante.gf += p.golesVisitante;
    visitante.gc += p.golesLocal;

    if (p.golesLocal > p.golesVisitante) {
      local.g++;
      local.pts += 3;
      visitante.p++;
    } else if (p.golesLocal < p.golesVisitante) {
      visitante.g++;
      visitante.pts += 3;
      local.p++;
    } else {
      local.e++;
      visitante.e++;
      local.pts += 1;
      visitante.pts += 1;
    }
  }

  return Object.values(stats)
    .map((s) => ({ ...s, dg: s.gf - s.gc }))
    .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf || a.equipo.localeCompare(b.equipo));
}

function determinarGanadorId(partido) {
  if (partido.golesLocal > partido.golesVisitante) return partido.equipoLocalId;
  if (partido.golesVisitante > partido.golesLocal) return partido.equipoVisitanteId;
  if (partido.penalesLocal > partido.penalesVisitante) return partido.equipoLocalId;
  if (partido.penalesVisitante > partido.penalesLocal) return partido.equipoVisitanteId;
  return partido.equipoLocalId;
}

module.exports = { FASES_ELIMINATORIA, esFaseEliminatoria, calcularTablaPosiciones, determinarGanadorId };
