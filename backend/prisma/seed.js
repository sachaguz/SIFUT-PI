const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: 'admin@sifut.com' } });
  if (existing) {
    console.log('Database already seeded, skipping.');
    return;
  }

  console.log('Seeding database...');

  // --- Users ---
  const adminPassword = await bcrypt.hash('Admin1234!', 12);
  const orgPassword = await bcrypt.hash('Org12345!', 12);
  const userPassword = await bcrypt.hash('User1234!', 12);

  const admin = await prisma.user.create({
    data: { nombre: 'Carlos', apellido: 'García', email: 'admin@sifut.com', password: adminPassword, role: 'ADMIN' },
  });
  const organizador = await prisma.user.create({
    data: { nombre: 'Ana', apellido: 'López', email: 'organizador@sifut.com', password: orgPassword, role: 'ORGANIZADOR' },
  });
  const usuario = await prisma.user.create({
    data: { nombre: 'Luis', apellido: 'Martínez', email: 'usuario@sifut.com', password: userPassword, role: 'USUARIO' },
  });

  // --- Sedes ---
  const sede1 = await prisma.sede.create({
    data: { nombre: 'Sede Centro Histórico', direccion: 'Av. Corregidora Norte 128, Centro Histórico, Querétaro', telefono: '442 214 5588', activa: true },
  });
  const sede2 = await prisma.sede.create({
    data: { nombre: 'Sede Juriquilla', direccion: 'Blvd. Juriquilla Privada 3000, Juriquilla, Querétaro', telefono: '442 238 1200', activa: true },
  });
  const sede3 = await prisma.sede.create({
    data: { nombre: 'Sede Corregidora', direccion: 'Av. Camino Real 445, Corregidora, Qro.', telefono: '442 350 7711', activa: true },
  });
  const sede4 = await prisma.sede.create({
    data: { nombre: 'Sede El Marqués', direccion: 'Carretera Estatal 420 s/n, El Marqués, Qro.', telefono: '442 101 9000', activa: false },
  });

  // --- Canchas ---
  const cancha1 = await prisma.cancha.create({
    data: { sedeId: sede1.id, nombre: 'Cancha 1', tipo: 'FUTBOL7', superficie: 'Pasto sintético', capacidad: 14, precioPorHora: 500 },
  });
  const cancha2 = await prisma.cancha.create({
    data: { sedeId: sede1.id, nombre: 'Cancha 2', tipo: 'FUTBOL11', superficie: 'Pasto natural', capacidad: 22, precioPorHora: 750 },
  });
  const cancha3 = await prisma.cancha.create({
    data: { sedeId: sede2.id, nombre: 'Cancha 1', tipo: 'FUTBOL5', superficie: 'Pasto sintético', capacidad: 10, precioPorHora: 450 },
  });
  const cancha4 = await prisma.cancha.create({
    data: { sedeId: sede3.id, nombre: 'Cancha 1', tipo: 'FUTBOL5', superficie: 'Pasto sintético', capacidad: 10, precioPorHora: 480 },
  });
  const cancha5 = await prisma.cancha.create({
    data: { sedeId: sede3.id, nombre: 'Cancha 2', tipo: 'FUTBOL7', superficie: 'Pasto sintético', capacidad: 14, precioPorHora: 600 },
  });
  const cancha6 = await prisma.cancha.create({
    data: { sedeId: sede4.id, nombre: 'Cancha 1', tipo: 'FUTBOL7', superficie: 'Pasto sintético', capacidad: 14, precioPorHora: 550 },
  });

  // --- Horarios (sample for cancha1) ---
  const horas = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
  for (const cancha of [cancha1, cancha2, cancha3, cancha4, cancha5]) {
    for (let dia = 1; dia <= 6; dia++) {
      for (let i = 0; i < horas.length - 1; i++) {
        await prisma.horario.create({
          data: { canchaId: cancha.id, diaSemana: dia, horaInicio: horas[i], horaFin: horas[i + 1], disponible: true },
        });
      }
    }
  }

  // --- Torneos ---
  const torneo1 = await prisma.torneo.create({
    data: {
      nombre: 'UEFA Champions League',
      tipo: 'Fútbol 11',
      categoria: 'Profesional',
      fechaInicio: new Date('2025-09-17'),
      fechaFin: new Date('2026-05-30'),
      diasJuego: ['Miércoles', 'Jueves'],
      estado: 'ACTIVO',
    },
  });
  const torneo2 = await prisma.torneo.create({
    data: {
      nombre: 'Liga MX',
      tipo: 'Fútbol 11',
      categoria: 'Profesional',
      fechaInicio: new Date('2026-01-11'),
      fechaFin: new Date('2026-05-24'),
      diasJuego: ['Sábado', 'Domingo'],
      estado: 'ACTIVO',
    },
  });

  // --- Equipos ---
  const realMadrid = await prisma.equipo.create({ data: { nombre: 'Real Madrid', categoria: 'Profesional', torneoId: torneo1.id } });
  const manCity = await prisma.equipo.create({ data: { nombre: 'Manchester City', categoria: 'Profesional', torneoId: torneo1.id } });
  const bayern = await prisma.equipo.create({ data: { nombre: 'Bayern Múnich', categoria: 'Profesional', torneoId: torneo1.id } });
  const psg = await prisma.equipo.create({ data: { nombre: 'Paris Saint-Germain', categoria: 'Profesional', torneoId: torneo1.id } });
  const america = await prisma.equipo.create({ data: { nombre: 'Club América', categoria: 'Profesional', torneoId: torneo2.id } });
  const monterrey = await prisma.equipo.create({ data: { nombre: 'Monterrey', categoria: 'Profesional', torneoId: torneo2.id } });
  const chivas = await prisma.equipo.create({ data: { nombre: 'Chivas Guadalajara', categoria: 'Profesional', torneoId: torneo2.id } });
  const tigres = await prisma.equipo.create({ data: { nombre: 'Tigres UANL', categoria: 'Profesional', torneoId: torneo2.id } });

  // --- Jugadores ---
  const mbappe = await prisma.jugador.create({ data: { nombre: 'Kylian Mbappé', numeroCamiseta: 9, posicion: 'DELANTERO', equipoId: realMadrid.id } });
  await prisma.jugador.create({ data: { nombre: 'Jude Bellingham', numeroCamiseta: 5, posicion: 'MEDIOCAMPISTA', equipoId: realMadrid.id } });
  await prisma.jugador.create({ data: { nombre: 'Thibaut Courtois', numeroCamiseta: 1, posicion: 'PORTERO', equipoId: realMadrid.id } });
  await prisma.jugador.create({ data: { nombre: 'Vinícius Júnior', numeroCamiseta: 7, posicion: 'DELANTERO', equipoId: realMadrid.id } });

  const haaland = await prisma.jugador.create({ data: { nombre: 'Erling Haaland', numeroCamiseta: 9, posicion: 'DELANTERO', equipoId: manCity.id } });
  await prisma.jugador.create({ data: { nombre: 'Kevin De Bruyne', numeroCamiseta: 17, posicion: 'MEDIOCAMPISTA', equipoId: manCity.id } });

  const kane = await prisma.jugador.create({ data: { nombre: 'Harry Kane', numeroCamiseta: 9, posicion: 'DELANTERO', equipoId: bayern.id } });
  await prisma.jugador.create({ data: { nombre: 'Jamal Musiala', numeroCamiseta: 42, posicion: 'MEDIOCAMPISTA', equipoId: bayern.id } });

  await prisma.jugador.create({ data: { nombre: 'Ousmane Dembélé', numeroCamiseta: 10, posicion: 'DELANTERO', equipoId: psg.id } });
  const hakimi = await prisma.jugador.create({ data: { nombre: 'Achraf Hakimi', numeroCamiseta: 2, posicion: 'DEFENSA', equipoId: psg.id } });

  const henryMartin = await prisma.jugador.create({ data: { nombre: 'Henry Martín', numeroCamiseta: 21, posicion: 'DELANTERO', equipoId: america.id } });
  await prisma.jugador.create({ data: { nombre: 'Rodolfo Cota', numeroCamiseta: 1, posicion: 'PORTERO', equipoId: america.id } });

  const sergioRamos = await prisma.jugador.create({ data: { nombre: 'Sergio Ramos', numeroCamiseta: 4, posicion: 'DEFENSA', equipoId: monterrey.id } });

  // --- Partidos ---
  await prisma.partido.create({
    data: {
      torneoId: torneo1.id,
      equipoLocalId: realMadrid.id,
      equipoVisitanteId: manCity.id,
      canchaId: cancha1.id,
      fecha: new Date('2026-07-05'),
      hora: '17:00',
      jornada: 6,
      estado: 'PENDIENTE',
    },
  });

  await prisma.partido.create({
    data: {
      torneoId: torneo1.id,
      equipoLocalId: bayern.id,
      equipoVisitanteId: psg.id,
      canchaId: cancha5.id,
      fecha: new Date('2026-07-05'),
      hora: '19:00',
      jornada: 6,
      estado: 'PENDIENTE',
    },
  });

  const partidoFinalizado = await prisma.partido.create({
    data: {
      torneoId: torneo2.id,
      equipoLocalId: america.id,
      equipoVisitanteId: monterrey.id,
      canchaId: cancha3.id,
      fecha: new Date('2026-07-04'),
      hora: '18:00',
      jornada: 8,
      estado: 'FINALIZADO',
      golesLocal: 2,
      golesVisitante: 1,
      estadisticas: { posesion: [50, 50], tirosAlArco: [9, 10], pasesEfectivos: [70, 30], faltas: [2, 20] },
    },
  });

  // --- Eventos del partido finalizado ---
  await prisma.eventoPartido.createMany({
    data: [
      { partidoId: partidoFinalizado.id, tipo: 'GOL', jugadorId: henryMartin.id, minuto: 30 },
      { partidoId: partidoFinalizado.id, tipo: 'SUSTITUCION', jugadorId: henryMartin.id, minuto: 50 },
      { partidoId: partidoFinalizado.id, tipo: 'GOL', jugadorId: sergioRamos.id, minuto: 81 },
      { partidoId: partidoFinalizado.id, tipo: 'TARJETA_ROJA', jugadorId: sergioRamos.id, minuto: 90 },
    ],
  });

  // --- More matches for standings ---
  const generateMatches = [
    { local: realMadrid, visitante: bayern, gl: 3, gv: 1 },
    { local: realMadrid, visitante: psg, gl: 2, gv: 0 },
    { local: manCity, visitante: realMadrid, gl: 1, gv: 2 },
    { local: manCity, visitante: bayern, gl: 2, gv: 0 },
    { local: manCity, visitante: psg, gl: 3, gv: 1 },
    { local: bayern, visitante: manCity, gl: 1, gv: 1 },
    { local: bayern, visitante: psg, gl: 2, gv: 1 },
    { local: psg, visitante: realMadrid, gl: 0, gv: 1 },
    { local: psg, visitante: manCity, gl: 1, gv: 2 },
    { local: america, visitante: chivas, gl: 3, gv: 0 },
    { local: america, visitante: tigres, gl: 2, gv: 1 },
    { local: monterrey, visitante: america, gl: 1, gv: 2 },
    { local: monterrey, visitante: chivas, gl: 2, gv: 0 },
    { local: monterrey, visitante: tigres, gl: 3, gv: 1 },
    { local: tigres, visitante: america, gl: 1, gv: 1 },
    { local: tigres, visitante: monterrey, gl: 2, gv: 1 },
    { local: chivas, visitante: monterrey, gl: 1, gv: 2 },
    { local: chivas, visitante: tigres, gl: 0, gv: 1 },
  ];

  for (let i = 0; i < generateMatches.length; i++) {
    const m = generateMatches[i];
    const isChampions = [realMadrid.id, manCity.id, bayern.id, psg.id].includes(m.local.id);
    await prisma.partido.create({
      data: {
        torneoId: isChampions ? torneo1.id : torneo2.id,
        equipoLocalId: m.local.id,
        equipoVisitanteId: m.visitante.id,
        canchaId: cancha1.id,
        fecha: new Date(`2026-${String(Math.floor(i / 4) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`),
        hora: '18:00',
        jornada: (i % 5) + 1,
        estado: 'FINALIZADO',
        golesLocal: m.gl,
        golesVisitante: m.gv,
      },
    });
  }

  // --- Reserva de ejemplo ---
  const reserva = await prisma.reserva.create({
    data: {
      userId: usuario.id,
      canchaId: cancha1.id,
      fecha: new Date('2026-07-30'),
      horaInicio: '17:00',
      horaFin: '18:00',
      folio: 'RES-20260730-A1B2C3',
      totalPagado: 500,
      metodoPago: 'TARJETA',
    },
  });

  await prisma.pago.create({
    data: {
      reservaId: reserva.id,
      monto: 500,
      metodo: 'TARJETA',
      folio: 'PAG-20260730-D4E5F6',
      concepto: 'Reserva RES-20260730-A1B2C3 - Cancha 1',
      estado: 'APROBADO',
    },
  });

  // --- Eventos extra for goleo stats ---
  for (let i = 0; i < 8; i++) {
    await prisma.eventoPartido.create({
      data: { partidoId: partidoFinalizado.id, tipo: 'GOL', jugadorId: mbappe.id, minuto: 10 + i },
    });
  }
  for (let i = 0; i < 7; i++) {
    await prisma.eventoPartido.create({
      data: { partidoId: partidoFinalizado.id, tipo: 'GOL', jugadorId: haaland.id, minuto: 10 + i },
    });
  }
  for (let i = 0; i < 6; i++) {
    await prisma.eventoPartido.create({
      data: { partidoId: partidoFinalizado.id, tipo: 'GOL', jugadorId: kane.id, minuto: 10 + i },
    });
  }
  for (let i = 0; i < 4; i++) {
    await prisma.eventoPartido.create({
      data: { partidoId: partidoFinalizado.id, tipo: 'GOL', jugadorId: henryMartin.id, minuto: 10 + i },
    });
  }

  // --- Tarjetas for disciplina stats ---
  for (let i = 0; i < 4; i++) {
    await prisma.eventoPartido.create({
      data: { partidoId: partidoFinalizado.id, tipo: 'TARJETA_AMARILLA', jugadorId: sergioRamos.id, minuto: 20 + i },
    });
  }
  for (let i = 0; i < 3; i++) {
    await prisma.eventoPartido.create({
      data: { partidoId: partidoFinalizado.id, tipo: 'TARJETA_AMARILLA', jugadorId: hakimi.id, minuto: 30 + i },
    });
  }

  console.log('Seed completed successfully!');
  console.log('');
  console.log('Usuarios de prueba:');
  console.log('  Admin:       admin@sifut.com       / Admin1234!');
  console.log('  Organizador: organizador@sifut.com  / Org12345!');
  console.log('  Usuario:     usuario@sifut.com      / User1234!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
