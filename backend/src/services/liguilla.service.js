const prisma = require('../config/database');
const { determinarGanadorId } = require('../utils/bracket');

async function avanzarSiCorresponde(torneoId, faseFinalizada) {
  if (faseFinalizada === 'CUARTOS') {
    const cuartos = await prisma.partido.findMany({
      where: { torneoId, fase: 'CUARTOS' },
      orderBy: { createdAt: 'asc' },
    });
    if (cuartos.length < 4 || cuartos.some((p) => p.estado !== 'FINALIZADO')) return null;

    const yaExisteSemifinal = await prisma.partido.count({ where: { torneoId, fase: 'SEMIFINAL' } });
    if (yaExisteSemifinal > 0) return null;

    const ganadores = cuartos.map(determinarGanadorId);
    const maxJornada = Math.max(...cuartos.map((p) => p.jornada));

    // Cruce de bracket: ganador(1v8) vs ganador(4v5), ganador(2v7) vs ganador(3v6),
    // así el 1° y el 2° lugar solo pueden enfrentarse hasta la final.
    const fixtures = [
      { equipoLocalId: ganadores[0], equipoVisitanteId: ganadores[3] },
      { equipoLocalId: ganadores[1], equipoVisitanteId: ganadores[2] },
    ].map((f) => ({
      ...f,
      torneoId,
      fecha: cuartos[0].fecha,
      hora: '17:00',
      jornada: maxJornada + 1,
      fase: 'SEMIFINAL',
    }));

    await prisma.partido.createMany({ data: fixtures });
    return 'SEMIFINAL';
  }

  if (faseFinalizada === 'SEMIFINAL') {
    const semis = await prisma.partido.findMany({
      where: { torneoId, fase: 'SEMIFINAL' },
      orderBy: { createdAt: 'asc' },
    });
    if (semis.length < 2 || semis.some((p) => p.estado !== 'FINALIZADO')) return null;

    const yaExisteFinal = await prisma.partido.count({ where: { torneoId, fase: 'FINAL' } });
    if (yaExisteFinal > 0) return null;

    const ganadores = semis.map(determinarGanadorId);
    const maxJornada = Math.max(...semis.map((p) => p.jornada));

    await prisma.partido.create({
      data: {
        torneoId,
        equipoLocalId: ganadores[0],
        equipoVisitanteId: ganadores[1],
        fecha: semis[0].fecha,
        hora: '17:00',
        jornada: maxJornada + 1,
        fase: 'FINAL',
      },
    });
    return 'FINAL';
  }

  return null;
}

module.exports = { avanzarSiCorresponde };
