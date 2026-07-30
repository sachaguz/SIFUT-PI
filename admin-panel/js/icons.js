// Set de íconos SVG (stroke, 24x24) — sustituye emojis en todo el panel.
// Uso: ICONS.sedes, ICONS.canchas, etc. Cada valor es un string <svg>...</svg>.
// currentColor hereda el color de texto del elemento contenedor.

const ICON_WRAP_START = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">';
const ICON_WRAP_END = '</svg>';

function svg(path) {
  return `${ICON_WRAP_START}${path}${ICON_WRAP_END}`;
}

const ICONS = {
  dashboard: svg('<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>'),
  sedes: svg('<path d="M4 21V9l8-5 8 5v12"/><path d="M9 21v-6h6v6"/><path d="M4 9h16"/>'),
  canchas: svg('<circle cx="12" cy="12" r="9"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l3 3M18 18l-3-3M18 6l-3 3M6 18l3-3"/>'),
  horarios: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'),
  reservas: svg('<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/><path d="M8 13h3M8 17h6"/>'),
  resultados: svg('<path d="M8 21h8M12 17v4"/><path d="M6 3h12v5a6 6 0 0 1-12 0V3z"/><path d="M6 5H3v2a4 4 0 0 0 3 3.87M18 5h3v2a4 4 0 0 1-3 3.87"/>'),
  tesoreria: svg('<rect x="2.5" y="6" width="19" height="13" rx="2"/><path d="M2.5 10h19"/><circle cx="16.5" cy="14.5" r="1.5"/>'),
  pagos: svg('<path d="M6 2h9l3 3v17H6z"/><path d="M9 8h6M9 12h6M9 16h4"/>'),
  search: svg('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>'),
  user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>'),
  logout: svg('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>'),
  edit: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>'),
  trash: svg('<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  check: svg('<path d="M20 6L9 17l-5-5"/>'),
  close: svg('<path d="M18 6L6 18M6 6l12 12"/>'),
  chevronRight: svg('<path d="M9 18l6-6-6-6"/>'),
  building: svg('<rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 6h1M14 6h1M9 10h1M14 10h1M9 14h1M14 14h1"/><path d="M10 22v-4h4v4"/>'),
  ball: svg('<circle cx="12" cy="12" r="9"/><path d="M12 8l3 2.2-1.1 3.6H10.1L9 10.2 12 8z"/><path d="M12 3v5M4.2 8l4.8 2.2M6.6 19l2.5-5.6M17.4 19l-2.5-5.6M19.8 8L15 10.2"/>'),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'),
  wallet: svg('<path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3"/><path d="M3 7v11a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-4a2 2 0 0 0 0 4h5"/>'),
  trendUp: svg('<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>'),
  users: svg('<circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c0-3.4 3-5.5 6.5-5.5s6.5 2.1 6.5 5.5"/><circle cx="18" cy="8.5" r="2.6"/><path d="M16.3 14.6c2.6.5 4.7 2.3 4.7 5.4"/>'),
  calendar: svg('<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>'),
  filter: svg('<path d="M4 5h16M7 12h10M11 19h2"/>'),
  info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>'),
};
