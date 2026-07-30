// Standalone, idempotent script to add two demo tournaments (15 invented
// teams each, full rosters, NO jornadas generated) on top of an already
// seeded database - so "Generar jornadas" can be tested live from the
// Organizador panel instead of shipping pre-made fixtures like Liga MX.
//
// Run it once against the deployed backend, e.g.:
//   docker compose exec api-1 node prisma/seed-demo-torneos.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const POSICIONES_PLANTILLA = [
  'PORTERO',
  'DEFENSA', 'DEFENSA', 'DEFENSA', 'DEFENSA',
  'MEDIOCAMPISTA', 'MEDIOCAMPISTA', 'MEDIOCAMPISTA', 'MEDIOCAMPISTA',
  'DELANTERO', 'DELANTERO',
];

const NOMBRES = [
  'Carlos', 'Luis', 'Jorge', 'Miguel', 'José', 'Fernando', 'Alejandro', 'Diego', 'Ricardo', 'Roberto',
  'Eduardo', 'Francisco', 'Javier', 'Manuel', 'Antonio', 'Raúl', 'Sergio', 'Rafael', 'Iván', 'Óscar',
  'Adrián', 'Emilio', 'Gustavo', 'Héctor', 'Julio', 'Mario', 'Pablo', 'Rodrigo', 'Salvador', 'Vicente',
];

const APELLIDOS = [
  'Hernández', 'García', 'Martínez', 'López', 'González', 'Rodríguez', 'Pérez', 'Sánchez', 'Ramírez', 'Torres',
  'Flores', 'Rivera', 'Gómez', 'Díaz', 'Cruz', 'Morales', 'Reyes', 'Jiménez', 'Ortiz', 'Gutiérrez',
  'Chávez', 'Ramos', 'Vargas', 'Castillo', 'Romero', 'Álvarez', 'Mendoza', 'Aguilar', 'Medina', 'Vázquez',
];

function generarNombreJugador(seed) {
  const nombre = NOMBRES[seed % NOMBRES.length];
  const apellido = APELLIDOS[(seed * 7 + 3) % APELLIDOS.length];
  return `${nombre} ${apellido}`;
}

const EQUIPOS_PRUEBA = [
  'Halcones FC', 'Real Cimatario', 'Lobos del Marqués', 'Atlético Juriquilla', 'Tigres de la Cañada',
  'Deportivo Peñuelas', 'Unión Corregidora', 'Rayos del Pueblito', 'Águilas del Bosque', 'Real Menchaca',
  'Deportivo Milenio', 'Titanes FC', 'Centauros de Querétaro', 'Halcones del Sur', 'Estrella Azul FC',
];

const EQUIPOS_PRESENTACION = [
  'Panteras FC', 'Real Balvanera', 'Cometas de Epigmenio', 'Deportivo Candiles', 'Toros del Refugio',
  'Halcón Dorado FC', 'Unidos San Pablo', 'Guerreros de la Sierra', 'Real Acueducto', 'Independiente Loma Linda',
  'Deportivo Menchaca', 'Cóndores FC', 'Real Constituyentes', 'Fénix de Santa Rosa', 'Atlético Prados',
];

const TORNEOS = [
  {
    nombre: 'Copa Bosque Querétaro',
    tipo: 'Fútbol 7',
    categoria: 'Amateur',
    fechaInicio: new Date('2026-08-01'),
    fechaFin: new Date('2026-12-13'),
    diasJuego: ['Sáb', 'Dom'],
    estado: 'ACTIVO',
    equipos: EQUIPOS_PRUEBA,
  },
  {
    nombre: 'Copa Fundadores SIFut',
    tipo: 'Fútbol 7',
    categoria: 'Amateur',
    fechaInicio: new Date('2026-09-05'),
    fechaFin: new Date('2027-01-17'),
    diasJuego: ['Sáb', 'Dom'],
    estado: 'PROXIMO',
    equipos: EQUIPOS_PRESENTACION,
  },
];

async function crearTorneo(config, seedInicial) {
  const existente = await prisma.torneo.findFirst({ where: { nombre: config.nombre } });
  if (existente) {
    console.log(`"${config.nombre}" ya existe, se omite.`);
    return seedInicial;
  }

  const torneo = await prisma.torneo.create({
    data: {
      nombre: config.nombre,
      tipo: config.tipo,
      categoria: config.categoria,
      fechaInicio: config.fechaInicio,
      fechaFin: config.fechaFin,
      diasJuego: config.diasJuego,
      estado: config.estado,
    },
  });

  let seed = seedInicial;
  for (const nombreEquipo of config.equipos) {
    const equipo = await prisma.equipo.create({
      data: {
        nombre: nombreEquipo,
        categoria: config.categoria,
        torneos: { connect: { id: torneo.id } },
      },
    });

    const jugadores = POSICIONES_PLANTILLA.map((posicion, i) => ({
      nombre: generarNombreJugador(seed + i),
      numeroCamiseta: i + 1,
      posicion,
      equipoId: equipo.id,
    }));
    seed += POSICIONES_PLANTILLA.length;

    await prisma.jugador.createMany({ data: jugadores });
  }

  console.log(`"${config.nombre}" creado con ${config.equipos.length} equipos (sin jornadas).`);
  return seed;
}

async function main() {
  let seed = 1000;
  for (const config of TORNEOS) {
    seed = await crearTorneo(config, seed);
  }
  console.log('Listo. Entra al panel de Organizador y usa "Generar jornadas" en cada torneo.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
