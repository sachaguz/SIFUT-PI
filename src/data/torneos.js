export const TORNEOS = [
  {
    id: '1',
    nombre: 'UEFA Champions League',
    tipo: 'Fútbol 11',
    categoria: 'Profesional',
    fechaInicio: '17/09/2025',
    fechaFin: '30/05/2026',
    estado: 'Activo',
    equipos: ['Real Madrid', 'Manchester City', 'Bayern Múnich', 'Paris Saint-Germain'],
    tabla: [
      { pos: 1, equipo: 'Real Madrid', jj: 6, dg: 9, pts: 16 },
      { pos: 2, equipo: 'Manchester City', jj: 6, dg: 6, pts: 13 },
      { pos: 3, equipo: 'Bayern Múnich', jj: 6, dg: 2, pts: 10 },
      { pos: 4, equipo: 'Paris Saint-Germain', jj: 6, dg: -3, pts: 4 },
    ],
  },
  {
    id: '2',
    nombre: 'Liga MX',
    tipo: 'Fútbol 11',
    categoria: 'Profesional',
    fechaInicio: '11/01/2026',
    fechaFin: '24/05/2026',
    estado: 'Activo',
    equipos: ['Club América', 'Chivas Guadalajara', 'Tigres UANL', 'Monterrey'],
    tabla: [
      { pos: 1, equipo: 'Club América', jj: 8, dg: 11, pts: 20 },
      { pos: 2, equipo: 'Monterrey', jj: 8, dg: 5, pts: 16 },
      { pos: 3, equipo: 'Tigres UANL', jj: 8, dg: 2, pts: 13 },
      { pos: 4, equipo: 'Chivas Guadalajara', jj: 8, dg: -4, pts: 9 },
    ],
  },
];

export const EQUIPOS = [
  { id: '1', nombre: 'Real Madrid', categoria: 'Profesional', torneo: 'UEFA Champions League', jugadores: 24 },
  { id: '2', nombre: 'Manchester City', categoria: 'Profesional', torneo: 'UEFA Champions League', jugadores: 23 },
  { id: '3', nombre: 'Bayern Múnich', categoria: 'Profesional', torneo: 'UEFA Champions League', jugadores: 25 },
  { id: '4', nombre: 'Paris Saint-Germain', categoria: 'Profesional', torneo: 'UEFA Champions League', jugadores: 22 },
  { id: '5', nombre: 'Club América', categoria: 'Profesional', torneo: 'Liga MX', jugadores: 26 },
  { id: '6', nombre: 'Monterrey', categoria: 'Profesional', torneo: 'Liga MX', jugadores: 24 },
];

export const JUGADORES_POR_EQUIPO = {
  'Real Madrid': [
    { id: '1', nombre: 'Kylian Mbappé', numero: 9, posicion: 'Delantero' },
    { id: '2', nombre: 'Jude Bellingham', numero: 5, posicion: 'Mediocampista' },
    { id: '3', nombre: 'Thibaut Courtois', numero: 1, posicion: 'Portero' },
    { id: '4', nombre: 'Vinícius Júnior', numero: 7, posicion: 'Delantero' },
  ],
  'Manchester City': [
    { id: '5', nombre: 'Erling Haaland', numero: 9, posicion: 'Delantero' },
    { id: '6', nombre: 'Kevin De Bruyne', numero: 17, posicion: 'Mediocampista' },
  ],
  'Bayern Múnich': [
    { id: '7', nombre: 'Harry Kane', numero: 9, posicion: 'Delantero' },
    { id: '8', nombre: 'Jamal Musiala', numero: 42, posicion: 'Mediocampista' },
  ],
  'Paris Saint-Germain': [
    { id: '9', nombre: 'Ousmane Dembélé', numero: 10, posicion: 'Delantero' },
    { id: '10', nombre: 'Achraf Hakimi', numero: 2, posicion: 'Defensa' },
  ],
  'Club América': [
    { id: '11', nombre: 'Henry Martín', numero: 21, posicion: 'Delantero' },
    { id: '12', nombre: 'Rodolfo Cota', numero: 1, posicion: 'Portero' },
  ],
  Monterrey: [{ id: '13', nombre: 'Sergio Ramos', numero: 4, posicion: 'Defensa' }],
};

export const GOLEO_INDIVIDUAL = [
  { jugador: 'Kylian Mbappé', equipo: 'Real Madrid', goles: 9 },
  { jugador: 'Erling Haaland', equipo: 'Manchester City', goles: 8 },
  { jugador: 'Harry Kane', equipo: 'Bayern Múnich', goles: 7 },
  { jugador: 'Henry Martín', equipo: 'Club América', goles: 5 },
];

export const REPORTES_DISCIPLINARIOS = [
  { jugador: 'Sergio Ramos', equipo: 'Monterrey', amarillas: 4, rojas: 1 },
  { jugador: 'Achraf Hakimi', equipo: 'Paris Saint-Germain', amarillas: 3, rojas: 0 },
];
