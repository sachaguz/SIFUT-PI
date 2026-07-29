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
