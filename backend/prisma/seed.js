const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const LIGA_MX_EQUIPOS = [
  'Club América', 'Guadalajara', 'Cruz Azul', 'Pumas UNAM', 'Toluca', 'Monterrey',
  'Tigres UANL', 'Santos Laguna', 'León', 'Pachuca', 'Necaxa', 'Atlas',
  'Puebla', 'Querétaro', 'Mazatlán FC', 'FC Juárez', 'Atlético San Luis', 'Xolos de Tijuana',
];

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

  await prisma.user.create({
    data: { nombre: 'Carlos', apellido: 'García', email: 'admin@sifut.com', password: adminPassword, role: 'ADMIN' },
  });
  await prisma.user.create({
    data: { nombre: 'Ana', apellido: 'López', email: 'organizador@sifut.com', password: orgPassword, role: 'ORGANIZADOR' },
  });
  await prisma.user.create({
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

  // --- Horarios ---
  const horas = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
  for (const cancha of [cancha1, cancha2, cancha3, cancha4, cancha5, cancha6]) {
    for (let dia = 0; dia <= 6; dia++) {
      for (let i = 0; i < horas.length - 1; i++) {
        await prisma.horario.create({
          data: { canchaId: cancha.id, diaSemana: dia, horaInicio: horas[i], horaFin: horas[i + 1], disponible: true },
        });
      }
    }
  }

  // --- Liga MX (torneo + equipos + plantillas de 11 jugadores) ---
  const ligaMX = await prisma.torneo.create({
    data: {
      nombre: 'Liga MX',
      tipo: 'Fútbol 11',
      categoria: 'Profesional',
      fechaInicio: new Date('2026-01-10'),
      fechaFin: new Date('2026-05-24'),
      diasJuego: ['Sáb', 'Dom'],
      estado: 'ACTIVO',
    },
  });

  let seed = 0;
  for (const nombreEquipo of LIGA_MX_EQUIPOS) {
    const equipo = await prisma.equipo.create({
      data: {
        nombre: nombreEquipo,
        categoria: 'Profesional',
        torneos: { connect: { id: ligaMX.id } },
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
