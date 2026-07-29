const prisma = require('../config/database');

async function getGoleo(req, res, next) {
  try {
    const where = { tipo: 'GOL' };
    if (req.query.torneoId) {
      where.partido = { torneoId: req.query.torneoId };
    }

    const goles = await prisma.eventoPartido.groupBy({
      by: ['jugadorId'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 20,
    });

    const jugadorIds = goles.map((g) => g.jugadorId);
    const jugadores = await prisma.jugador.findMany({
      where: { id: { in: jugadorIds } },
      include: { equipo: { select: { nombre: true } } },
    });

    const jugadorMap = Object.fromEntries(jugadores.map((j) => [j.id, j]));

    const goleo = goles.map((g) => {
      const j = jugadorMap[g.jugadorId];
      return {
        jugador: j?.nombre || 'Desconocido',
        equipo: j?.equipo?.nombre || 'Desconocido',
        goles: g._count.id,
      };
    });

    res.json(goleo);
  } catch (err) {
    next(err);
  }
}

async function getDisciplina(req, res, next) {
  try {
    const where = { tipo: { in: ['TARJETA_AMARILLA', 'TARJETA_ROJA'] } };
    if (req.query.torneoId) {
      where.partido = { torneoId: req.query.torneoId };
    }

    const tarjetas = await prisma.eventoPartido.findMany({
      where,
      include: {
        jugador: { include: { equipo: { select: { nombre: true } } } },
      },
    });

    const porJugador = {};
    for (const t of tarjetas) {
      const key = t.jugadorId;
      if (!porJugador[key]) {
        porJugador[key] = {
          jugador: t.jugador.nombre,
          equipo: t.jugador.equipo.nombre,
          amarillas: 0,
          rojas: 0,
        };
      }
      if (t.tipo === 'TARJETA_AMARILLA') porJugador[key].amarillas++;
      else porJugador[key].rojas++;
    }

    const reporte = Object.values(porJugador).sort(
      (a, b) => b.rojas - a.rojas || b.amarillas - a.amarillas
    );

    res.json(reporte);
  } catch (err) {
    next(err);
  }
}

module.exports = { getGoleo, getDisciplina };
