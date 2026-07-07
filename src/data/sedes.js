export const SEDES = [
  {
    id: '1',
    nombre: 'Sede Centro Histórico',
    direccion: 'Av. Corregidora Norte 128, Centro Histórico, Querétaro',
    telefono: '442 214 5588',
    activa: true,
    canchas: [
      { id: '1', nombre: 'Cancha 1', tipo: 'Fútbol 7', superficie: 'Pasto sintético', capacidad: 14, precioHora: 500 },
      { id: '2', nombre: 'Cancha 2', tipo: 'Fútbol 11', superficie: 'Pasto natural', capacidad: 22, precioHora: 750 },
    ],
  },
  {
    id: '2',
    nombre: 'Sede Juriquilla',
    direccion: 'Blvd. Juriquilla Privada 3000, Juriquilla, Querétaro',
    telefono: '442 238 1200',
    activa: true,
    canchas: [
      { id: '3', nombre: 'Cancha 1', tipo: 'Fútbol 5', superficie: 'Pasto sintético', capacidad: 10, precioHora: 450 },
    ],
  },
  {
    id: '3',
    nombre: 'Sede Corregidora',
    direccion: 'Av. Camino Real 445, Corregidora, Qro.',
    telefono: '442 350 7711',
    activa: true,
    canchas: [
      { id: '4', nombre: 'Cancha 1', tipo: 'Fútbol 5', superficie: 'Pasto sintético', capacidad: 10, precioHora: 480 },
      { id: '5', nombre: 'Cancha 2', tipo: 'Fútbol 7', superficie: 'Pasto sintético', capacidad: 14, precioHora: 600 },
    ],
  },
  {
    id: '4',
    nombre: 'Sede El Marqués',
    direccion: 'Carretera Estatal 420 s/n, El Marqués, Qro.',
    telefono: '442 101 9000',
    activa: false,
    canchas: [
      { id: '6', nombre: 'Cancha 1', tipo: 'Fútbol 7', superficie: 'Pasto sintético', capacidad: 14, precioHora: 550 },
    ],
  },
];

export function canchasDeSede(nombreSede) {
  const sede = SEDES.find((s) => s.nombre === nombreSede);
  return sede ? sede.canchas.map((c) => c.nombre) : [];
}
