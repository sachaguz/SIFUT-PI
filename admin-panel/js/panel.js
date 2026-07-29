if (!api.isAuthenticated()) window.location.href = 'index.html';

const FASE_LABELS = { JORNADA: 'Jornada', CUARTOS: 'Cuartos de Final', SEMIFINAL: 'Semifinal', FINAL: 'Final' };
const FASES_ELIMINATORIA = ['CUARTOS', 'SEMIFINAL', 'FINAL'];
const CHART_COLORS = ['#1E5B3A', '#28456B', '#C4801F', '#B3412C', '#6B7A0E', '#8A6FB0'];

// ─── Topbar user info ───────────────────────────────────────────────
document.getElementById('userInfo').textContent = `${api.user.nombre} ${api.user.apellido}`;
const initials = `${(api.user.nombre || '?')[0] || ''}${(api.user.apellido || '')[0] || ''}`.toUpperCase();
document.getElementById('userAvatar').textContent = initials;
document.getElementById('userName').textContent = `${api.user.nombre} ${api.user.apellido}`;

// ─── Helpers ───────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}/${d.getUTCFullYear()}`;
}

function formatMoney(n) {
  return Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 });
}

function tipoLabel(t) {
  return { FUTBOL5: 'Fútbol 5', FUTBOL7: 'Fútbol 7', FUTBOL11: 'Fútbol 11' }[t] || t;
}

function faseLabel(f) {
  return FASE_LABELS[f] || f;
}

function esFaseEliminatoria(f) {
  return FASES_ELIMINATORIA.includes(f);
}

function estadoLabel(e) {
  return { ACTIVO:'Activo', FINALIZADO:'Finalizado', PROXIMO:'Próximo', PENDIENTE:'Pendiente',
    EN_CURSO:'En curso', CONFIRMADA:'Confirmada', COMPLETADA:'Completada', CANCELADA:'Cancelada',
    APROBADO:'Aprobado', RECHAZADO:'Rechazado' }[e] || e;
}

function estadoBadge(estado) {
  const tones = { ACTIVO:'success', FINALIZADO:'success', CONFIRMADA:'success', APROBADO:'success',
    PENDIENTE:'warning', EN_CURSO:'warning', PROXIMO:'neutral', COMPLETADA:'neutral',
    CANCELADA:'danger', RECHAZADO:'danger' };
  return `<span class="badge badge-${tones[estado]||'neutral'}">${estadoLabel(estado)}</span>`;
}

function emptyState(iconName, text) {
  return `<div class="empty-state"><span class="icon-badge">${ICONS[iconName] || ICONS.info}</span><p>${text}</p></div>`;
}

function toast(msg, isError) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(() => el.className = 'toast', 3000);
}

function openModal(html) {
  document.getElementById('modalContent').innerHTML = html;
  document.getElementById('modal').classList.add('open');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

document.getElementById('modal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal')) closeModal();
});

function enc(obj) { return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))); }
function dec(str) { return JSON.parse(decodeURIComponent(escape(atob(str)))); }

// ─── Simple charts (vanilla SVG, no dependencies) ───────────────────
function renderBarChart(container, data) {
  const hasData = data.length > 0 && data.some((d) => d.value > 0);
  if (!hasData) {
    container.innerHTML = emptyState('canchas', 'Aún no hay datos suficientes.');
    return;
  }
  const max = Math.max(...data.map((d) => d.value), 1);
  container.innerHTML = `<div class="bar-chart">${data.map((d) => `
    <div class="bar-col">
      <div class="bar-value">${d.value}</div>
      <div class="bar-track"><div class="bar" style="height:${Math.max((d.value / max) * 100, 4)}%"></div></div>
      <div class="bar-label">${d.label}</div>
    </div>
  `).join('')}</div>`;
}

function renderDonutChart(container, data) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    container.innerHTML = emptyState('pagos', 'Sin pagos registrados aún.');
    return;
  }
  const radius = 60, cx = 80, cy = 80, circumference = 2 * Math.PI * radius;
  let offset = 0;
  const segments = data.filter((d) => d.value > 0).map((d) => {
    const frac = d.value / total;
    const dash = frac * circumference;
    const seg = `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${d.color}" stroke-width="20" stroke-dasharray="${dash} ${circumference - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})" />`;
    offset += dash;
    return seg;
  }).join('');

  container.innerHTML = `
    <div class="donut-wrap">
      <div class="donut-svg-wrap">
        <svg viewBox="0 0 160 160" width="160" height="160">${segments}</svg>
        <div class="donut-center">
          <div class="donut-total">${total}</div>
          <div class="donut-caption">Pagos</div>
        </div>
      </div>
      <div class="donut-legend">
        ${data.map((d) => `
          <div class="donut-legend-item">
            <span class="donut-legend-dot" style="background:${d.color}"></span>
            <span class="donut-legend-label">${d.label}</span>
            <span class="donut-legend-value">${d.value}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ─── Navigation ────────────────────────────────────────────────────
const navLinks = document.querySelectorAll('.sidebar-nav a');
let currentSection = 'dashboard';

function goToSection(sec) {
  if (sec === currentSection) { loaders[sec](); return; }
  navLinks.forEach((l) => l.classList.remove('active'));
  const link = Array.from(navLinks).find((l) => l.dataset.section === sec);
  if (link) link.classList.add('active');
  document.getElementById(`sec-${currentSection}`).classList.remove('active');
  document.getElementById(`sec-${sec}`).classList.add('active');
  currentSection = sec;
  loaders[sec]();
}

navLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    goToSection(link.dataset.section);
  });
});

document.getElementById('topbarSearch').addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  const q = e.target.value.trim().toLowerCase();
  if (!q) return;
  const match = Array.from(navLinks).find((l) => l.textContent.toLowerCase().includes(q));
  if (match) goToSection(match.dataset.section);
  e.target.value = '';
});

// ─── Section Loaders ───────────────────────────────────────────────
const loaders = {
  dashboard: loadDashboard, sedes: loadSedes, canchas: loadCanchas, horarios: loadHorarios,
  reservas: loadReservas, resultados: loadResultados, tesoreria: loadTesoreria, pagos: loadPagos,
};

// ─── DASHBOARD ─────────────────────────────────────────────────────
async function loadDashboard() {
  const kpisEl = document.getElementById('dashboardKpis');
  const barEl = document.getElementById('dashboardBarChart');
  const donutEl = document.getElementById('dashboardDonutChart');
  kpisEl.innerHTML = '<div class="loading-center"><div class="spinner"></div></div>';
  barEl.innerHTML = '<div class="loading-center"><div class="spinner"></div></div>';
  donutEl.innerHTML = '<div class="loading-center"><div class="spinner"></div></div>';

  try {
    const today = new Date().toISOString().substring(0, 10);
    const [sedes, canchas, reservasHoy, resumen, pagosAprobados] = await Promise.all([
      api.get('/sedes'),
      api.get('/canchas'),
      api.get(`/reservas?fecha=${today}`),
      api.get('/pagos/resumen'),
      api.get('/pagos?estado=APROBADO'),
    ]);

    sedesCache = sedes;
    const sedesActivas = sedes.filter((s) => s.activa).length;

    kpisEl.innerHTML = `
      <div class="kpi-card">
        <div class="kpi-icon tone-primary"><span class="icon-badge">${ICONS.sedes}</span></div>
        <div class="kpi-body">
          <div class="kpi-value">${sedesActivas}</div>
          <div class="kpi-label">Sedes activas</div>
          <div class="kpi-sub">${sedes.length} en total</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon tone-accent"><span class="icon-badge">${ICONS.canchas}</span></div>
        <div class="kpi-body">
          <div class="kpi-value">${canchas.length}</div>
          <div class="kpi-label">Canchas totales</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon tone-secondary"><span class="icon-badge">${ICONS.reservas}</span></div>
        <div class="kpi-body">
          <div class="kpi-value">${reservasHoy.length}</div>
          <div class="kpi-label">Reservas hoy</div>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon tone-warning"><span class="icon-badge">${ICONS.wallet}</span></div>
        <div class="kpi-body">
          <div class="kpi-value">$${formatMoney(resumen.ingresoMensual.total)}</div>
          <div class="kpi-label">Ingresos del mes</div>
          <div class="kpi-sub">${resumen.ingresoMensual.cantidad} pagos aprobados</div>
        </div>
      </div>
    `;

    const porSede = sedes.map((s) => ({
      label: s.nombre.replace('Sede ', ''),
      value: canchas.filter((c) => c.sedeId === s.id).length,
    }));
    renderBarChart(barEl, porSede);

    const metodos = [
      { key: 'TARJETA', label: 'Tarjeta', color: CHART_COLORS[0] },
      { key: 'EFECTIVO', label: 'Efectivo', color: CHART_COLORS[1] },
      { key: 'TRANSFERENCIA', label: 'Transferencia', color: CHART_COLORS[2] },
    ].map((m) => ({ label: m.label, color: m.color, value: pagosAprobados.filter((p) => p.metodo === m.key).length }));
    renderDonutChart(donutEl, metodos);
  } catch (err) {
    kpisEl.innerHTML = '';
    barEl.innerHTML = emptyState('info', err.message);
    donutEl.innerHTML = '';
  }
}

// ─── SEDES ─────────────────────────────────────────────────────────
let sedesCache = [];

async function loadSedes() {
  const el = document.getElementById('sedesTable');
  el.innerHTML = '<div class="loading-center"><div class="spinner"></div></div>';
  try {
    sedesCache = await api.get('/sedes');
    if (sedesCache.length === 0) {
      el.innerHTML = emptyState('sedes', 'No hay sedes registradas.');
      return;
    }
    el.innerHTML = `<table><thead><tr>
      <th>Nombre</th><th>Dirección</th><th>Teléfono</th><th>Estado</th><th>Acciones</th>
    </tr></thead><tbody>${sedesCache.map(s => `<tr>
      <td><strong>${s.nombre}</strong></td>
      <td>${s.direccion}</td>
      <td>${s.telefono}</td>
      <td>${s.activa ? '<span class="badge badge-success">Activa</span>' : '<span class="badge badge-neutral">Inactiva</span>'}</td>
      <td class="actions-cell">
          <button class="btn btn-outline btn-sm" onclick="openSedeForm('${s.id}')"><span class="icon-badge">${ICONS.edit}</span> Editar</button>
          <button class="btn btn-danger btn-sm" onclick="deleteSede('${s.id}')"><span class="icon-badge">${ICONS.trash}</span></button></td>
    </tr>`).join('')}</tbody></table>`;
  } catch (err) { toast(err.message, true); }
}

function openSedeForm(id) {
  const sede = id ? sedesCache.find(s => s.id === id) : null;
  openModal(`
    <h2>${sede ? 'Editar sede' : 'Nueva sede'}</h2>
    <div class="form-group"><label>Nombre</label><input id="fNombre" value="${sede?.nombre||''}"></div>
    <div class="form-group"><label>Dirección</label><input id="fDireccion" value="${sede?.direccion||''}"></div>
    <div class="form-group"><label>Teléfono</label><input id="fTelefono" value="${sede?.telefono||''}"></div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveSede('${id||''}')">Guardar</button>
    </div>
  `);
}

async function saveSede(id) {
  const body = {
    nombre: document.getElementById('fNombre').value,
    direccion: document.getElementById('fDireccion').value,
    telefono: document.getElementById('fTelefono').value,
  };
  try {
    if (id) await api.put(`/sedes/${id}`, body);
    else await api.post('/sedes', body);
    closeModal();
    toast(id ? 'Sede actualizada' : 'Sede creada');
    loadSedes();
  } catch (err) { toast(err.message, true); }
}

async function deleteSede(id) {
  if (!confirm('¿Eliminar esta sede?')) return;
  try {
    await api.del(`/sedes/${id}`);
    toast('Sede eliminada');
    loadSedes();
  } catch (err) { toast(err.message, true); }
}

// ─── CANCHAS ───────────────────────────────────────────────────────
let canchasSedeId = '';
let canchasReqId = 0;

async function loadCanchas() {
  const pillsEl = document.getElementById('canchasSedePills');
  const tableEl = document.getElementById('canchasTable');
  const reqId = ++canchasReqId;
  try {
    if (sedesCache.length === 0) sedesCache = await api.get('/sedes');
    if (reqId !== canchasReqId) return;
    if (!canchasSedeId && sedesCache.length > 0) canchasSedeId = sedesCache[0].id;

    pillsEl.innerHTML = sedesCache.map(s =>
      `<button class="pill ${s.id===canchasSedeId?'active':''}" onclick="selectCanchaSede('${s.id}')">${s.nombre}</button>`
    ).join('');

    if (!canchasSedeId) { tableEl.innerHTML = emptyState('sedes', 'Selecciona una sede.'); return; }

    tableEl.innerHTML = '<div class="loading-center"><div class="spinner"></div></div>';
    const canchas = await api.get(`/canchas?sedeId=${canchasSedeId}`);
    if (reqId !== canchasReqId) return;
    if (canchas.length === 0) {
      tableEl.innerHTML = emptyState('canchas', 'No hay canchas en esta sede.');
      return;
    }
    tableEl.innerHTML = `<table><thead><tr>
      <th>Nombre</th><th>Tipo</th><th>Superficie</th><th>Capacidad</th><th>Precio/hora</th><th>Acciones</th>
    </tr></thead><tbody>${canchas.map(c => `<tr>
      <td><strong>${c.nombre}</strong></td>
      <td>${tipoLabel(c.tipo)}</td>
      <td>${c.superficie}</td>
      <td>${c.capacidad}</td>
      <td>$${formatMoney(c.precioPorHora)}</td>
      <td class="actions-cell">
          <button class="btn btn-outline btn-sm" onclick="openCanchaForm('${c.id}','${enc(c)}')"><span class="icon-badge">${ICONS.edit}</span> Editar</button>
          <button class="btn btn-danger btn-sm" onclick="deleteCancha('${c.id}')"><span class="icon-badge">${ICONS.trash}</span></button></td>
    </tr>`).join('')}</tbody></table>`;
  } catch (err) { if (reqId === canchasReqId) toast(err.message, true); }
}

function selectCanchaSede(id) { canchasSedeId = id; loadCanchas(); }

function openCanchaForm(id, encoded) {
  const cancha = encoded ? dec(encoded) : null;
  const tipos = ['FUTBOL5','FUTBOL7','FUTBOL11'];
  openModal(`
    <h2>${cancha ? 'Editar cancha' : 'Nueva cancha'}</h2>
    <div class="form-group"><label>Sede</label>
      <select id="fSedeId">${sedesCache.map(s => `<option value="${s.id}" ${s.id===(cancha?.sedeId||canchasSedeId)?'selected':''}>${s.nombre}</option>`).join('')}</select>
    </div>
    <div class="form-group"><label>Nombre</label><input id="fNombre" value="${cancha?.nombre||''}"></div>
    <div class="form-group"><label>Tipo</label>
      <select id="fTipo">${tipos.map(t => `<option value="${t}" ${t===cancha?.tipo?'selected':''}>${tipoLabel(t)}</option>`).join('')}</select>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Superficie</label><input id="fSuperficie" value="${cancha?.superficie||'Pasto sintético'}"></div>
      <div class="form-group"><label>Capacidad</label><input id="fCapacidad" type="number" value="${cancha?.capacidad||10}"></div>
    </div>
    <div class="form-group"><label>Precio por hora</label><input id="fPrecio" type="number" step="0.01" value="${cancha?Number(cancha.precioPorHora):'450'}"></div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveCancha('${id||''}')">Guardar</button>
    </div>
  `);
}

async function saveCancha(id) {
  const body = {
    sedeId: document.getElementById('fSedeId').value,
    nombre: document.getElementById('fNombre').value,
    tipo: document.getElementById('fTipo').value,
    superficie: document.getElementById('fSuperficie').value,
    capacidad: parseInt(document.getElementById('fCapacidad').value),
    precioPorHora: document.getElementById('fPrecio').value,
  };
  try {
    if (id) await api.put(`/canchas/${id}`, body);
    else await api.post('/canchas', body);
    closeModal();
    toast(id ? 'Cancha actualizada' : 'Cancha creada');
    loadCanchas();
  } catch (err) { toast(err.message, true); }
}

async function deleteCancha(id) {
  if (!confirm('¿Eliminar esta cancha?')) return;
  try { await api.del(`/canchas/${id}`); toast('Cancha eliminada'); loadCanchas(); }
  catch (err) { toast(err.message, true); }
}

// ─── HORARIOS ──────────────────────────────────────────────────────
let horariosSedeId = '', horariosDia = 1;
let horariosReqId = 0;

async function loadHorarios() {
  const sedePills = document.getElementById('horariosSedePills');
  const diaPills = document.getElementById('horariosDiaPills');
  const tableEl = document.getElementById('horariosTable');
  const reqId = ++horariosReqId;
  try {
    if (sedesCache.length === 0) sedesCache = await api.get('/sedes');
    if (reqId !== horariosReqId) return;
    if (!horariosSedeId && sedesCache.length > 0) horariosSedeId = sedesCache[0].id;

    sedePills.innerHTML = sedesCache.map(s =>
      `<button class="pill ${s.id===horariosSedeId?'active':''}" onclick="selectHorarioSede('${s.id}')">${s.nombre}</button>`
    ).join('');

    const dayNames = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    diaPills.innerHTML = dayNames.map((d,i) =>
      `<button class="pill ${i===horariosDia?'active':''}" onclick="selectHorarioDia(${i})">${d}</button>`
    ).join('');

    if (!horariosSedeId) { tableEl.innerHTML = ''; return; }

    tableEl.innerHTML = '<div class="loading-center"><div class="spinner"></div></div>';
    const horarios = await api.get(`/horarios/sede/${horariosSedeId}`);
    if (reqId !== horariosReqId) return;
    const filtered = horarios.filter(h => h.diaSemana === horariosDia);
    if (filtered.length === 0) {
      tableEl.innerHTML = emptyState('horarios', 'No hay horarios para este día.');
      return;
    }
    tableEl.innerHTML = `<table><thead><tr>
      <th>Cancha</th><th>Hora inicio</th><th>Hora fin</th><th>Estado</th><th>Acciones</th>
    </tr></thead><tbody>${filtered.map(h => `<tr>
      <td>${h.cancha?.nombre||''}</td>
      <td>${h.horaInicio}</td>
      <td>${h.horaFin}</td>
      <td>${h.disponible ? '<span class="badge badge-success">Disponible</span>' : '<span class="badge badge-danger">No disponible</span>'}</td>
      <td><button class="btn btn-outline btn-sm" onclick="toggleHorarioDisponible('${h.id}', ${h.disponible})">
          ${h.disponible ? 'Bloquear' : 'Habilitar'}</button></td>
    </tr>`).join('')}</tbody></table>`;
  } catch (err) { if (reqId === horariosReqId) toast(err.message, true); }
}

function selectHorarioSede(id) { horariosSedeId = id; loadHorarios(); }
function selectHorarioDia(d) { horariosDia = d; loadHorarios(); }

async function toggleHorarioDisponible(id, current) {
  try {
    await api.put(`/horarios/${id}`, { disponible: !current });
    toast('Horario actualizado');
    loadHorarios();
  } catch (err) { toast(err.message, true); }
}

// ─── RESERVAS ──────────────────────────────────────────────────────
async function loadReservas() {
  const el = document.getElementById('reservasTable');
  el.innerHTML = '<div class="loading-center"><div class="spinner"></div></div>';
  try {
    const today = new Date().toISOString().substring(0,10);
    const reservas = await api.get(`/reservas?fecha=${today}`);
    if (reservas.length === 0) {
      el.innerHTML = emptyState('reservas', 'No hay reservas para hoy.');
      return;
    }
    el.innerHTML = `<table><thead><tr>
      <th>Folio</th><th>Usuario</th><th>Sede</th><th>Cancha</th><th>Horario</th><th>Total</th><th>Estado</th>
    </tr></thead><tbody>${reservas.map(r => `<tr>
      <td><strong>${r.folio}</strong></td>
      <td>${r.user?.nombre||''} ${r.user?.apellido||''}</td>
      <td>${r.cancha?.sede?.nombre||''}</td>
      <td>${r.cancha?.nombre||''}</td>
      <td>${r.horaInicio} - ${r.horaFin}</td>
      <td>$${formatMoney(r.totalPagado)}</td>
      <td>${estadoBadge(r.estado)}</td>
    </tr>`).join('')}</tbody></table>`;
  } catch (err) { toast(err.message, true); }
}

// ─── RESULTADOS ────────────────────────────────────────────────────
async function loadResultados() {
  const el = document.getElementById('resultadosTable');
  el.innerHTML = '<div class="loading-center"><div class="spinner"></div></div>';
  try {
    const partidos = await api.get('/partidos');
    if (partidos.length === 0) {
      el.innerHTML = emptyState('resultados', 'No hay partidos registrados.');
      return;
    }
    el.innerHTML = `<table><thead><tr>
      <th>Partido</th><th>Torneo</th><th>Fase</th><th>Fecha</th><th>Cancha</th><th>Marcador</th><th>Estado</th><th>Acciones</th>
    </tr></thead><tbody>${partidos.map(p => {
      const local = p.equipoLocal?.nombre||'';
      const vis = p.equipoVisitante?.nombre||'';
      const cancha = p.cancha ? `${p.cancha.nombre}` : '';
      const fin = p.estado === 'FINALIZADO';
      return `<tr>
        <td><strong>${local} vs ${vis}</strong></td>
        <td>${p.torneo?.nombre||''}</td>
        <td>${esFaseEliminatoria(p.fase) ? faseLabel(p.fase) : `J${p.jornada}`}</td>
        <td>${formatDate(p.fecha)} · ${p.hora}</td>
        <td>${cancha}</td>
        <td>${fin ? `<strong>${p.golesLocal} - ${p.golesVisitante}</strong>${(p.penalesLocal||p.penalesVisitante) ? ` <span class="badge badge-neutral">Pen. ${p.penalesLocal}-${p.penalesVisitante}</span>` : ''}` : '-'}</td>
        <td>${estadoBadge(p.estado)}</td>
        <td>${fin
          ? `<button class="btn btn-outline btn-sm" onclick="viewPartido('${p.id}')">Ver</button>`
          : `<button class="btn btn-primary btn-sm" onclick="openResultadoForm('${p.id}','${enc({id:p.id,local,visitante:vis,fase:p.fase,equipoLocal:p.equipoLocal,equipoVisitante:p.equipoVisitante})}')">Registrar</button>`
        }</td>
      </tr>`;
    }).join('')}</tbody></table>`;
  } catch (err) { toast(err.message, true); }
}

async function viewPartido(id) {
  try {
    const p = await api.get(`/partidos/${id}`);
    const local = p.equipoLocal?.nombre||'';
    const vis = p.equipoVisitante?.nombre||'';
    const eventos = (p.eventos||[]).map(e => {
      const labels = { GOL:'Gol', AUTOGOL:'Autogol', TARJETA_AMARILLA:'Amarilla', TARJETA_ROJA:'Roja', SUSTITUCION:'Cambio' };
      const detalle = e.tipo === 'SUSTITUCION'
        ? `Sale ${e.jugador?.nombre||''}, entra ${e.jugadorEntra?.nombre||''}`
        : (e.jugador?.nombre||'');
      return `<tr><td>${e.minuto}'</td><td>${labels[e.tipo]||e.tipo}</td><td>${detalle}</td><td>${e.jugador?.equipo?.nombre||''}</td></tr>`;
    }).join('');
    const penalesHtml = (p.penalesLocal || p.penalesVisitante)
      ? `<p style="color:var(--text-muted);margin-bottom:8px">Penales: ${p.penalesLocal} - ${p.penalesVisitante}</p>` : '';
    openModal(`
      <h2>${local} ${p.golesLocal} - ${p.golesVisitante} ${vis}</h2>
      <p style="color:var(--text-muted);margin-bottom:8px">${p.torneo?.nombre||''} · ${esFaseEliminatoria(p.fase) ? faseLabel(p.fase) : `Jornada ${p.jornada}`} · ${formatDate(p.fecha)} · ${p.hora}</p>
      ${penalesHtml}
      ${eventos ? `<table><thead><tr><th>Min</th><th>Evento</th><th>Jugador</th><th>Equipo</th></tr></thead><tbody>${eventos}</tbody></table>`
        : '<p style="color:var(--text-muted)">No hay eventos registrados.</p>'}
      <div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Cerrar</button></div>
    `);
  } catch (err) { toast(err.message, true); }
}

async function openResultadoForm(id, encoded) {
  const p = dec(encoded);
  try {
    const [jl, jv] = await Promise.all([
      api.get(`/jugadores/equipo/${p.equipoLocal.id}`),
      api.get(`/jugadores/equipo/${p.equipoVisitante.id}`),
    ]);
    const allJugadores = [...jl.map(j=>({...j,team:'local',teamName:p.local})), ...jv.map(j=>({...j,team:'visitante',teamName:p.visitante}))];
    const jugadorOpts = allJugadores.map(j => `<option value="${j.id}">${j.nombre} (${j.teamName})</option>`).join('');
    const tipoOpts = '<option value="GOL">Gol</option><option value="AUTOGOL">Autogol</option><option value="TARJETA_AMARILLA">Tarjeta amarilla</option><option value="TARJETA_ROJA">Tarjeta roja</option><option value="SUSTITUCION">Sustitución</option>';
    const isLiguilla = esFaseEliminatoria(p.fase);

    openModal(`
      <h2>Registrar resultado</h2>
      <p style="color:var(--text-muted);margin-bottom:16px">${p.local} vs ${p.visitante}${isLiguilla ? ` · ${faseLabel(p.fase)}` : ''}</p>
      <div id="eventosList" style="margin-bottom:16px"></div>
      <div class="card" style="background:var(--bg)">
        <strong style="font-size:13px">Agregar evento</strong>
        <div class="form-row mt-sm">
          <div class="form-group"><label>Jugador</label><select id="fJugador">${jugadorOpts}</select></div>
          <div class="form-group"><label>Tipo</label><select id="fTipo" onchange="toggleSustitucionField()">${tipoOpts}</select></div>
        </div>
        <div class="form-group" id="fJugadorEntraWrap" style="display:none">
          <label>Jugador que entra</label>
          <select id="fJugadorEntra">${jugadorOpts}</select>
        </div>
        <div class="form-group"><label>Minuto</label><input id="fMinuto" type="number" min="0" max="120" placeholder="45"></div>
        <button class="btn btn-outline btn-sm" onclick="addEvento()"><span class="icon-badge">${ICONS.plus}</span> Agregar</button>
      </div>
      ${isLiguilla ? `
        <div class="card">
          <strong style="font-size:13px">Penales (solo si hubo empate y eliminatoria)</strong>
          <div class="form-row mt-sm">
            <div class="form-group"><label>${p.local}</label><input id="fPenalesLocal" type="number" min="0" placeholder="0"></div>
            <div class="form-group"><label>${p.visitante}</label><input id="fPenalesVisitante" type="number" min="0" placeholder="0"></div>
          </div>
        </div>
      ` : ''}
      <div class="modal-actions">
        <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="saveResultado('${id}')">Finalizar partido</button>
      </div>
    `);

    window._resultadoEventos = [];
    window._resultadoJugadores = allJugadores;
    window._resultadoPartido = p;
  } catch (err) { toast(err.message, true); }
}

function toggleSustitucionField() {
  const tipo = document.getElementById('fTipo').value;
  document.getElementById('fJugadorEntraWrap').style.display = tipo === 'SUSTITUCION' ? 'block' : 'none';
}

function addEvento() {
  const jugadorId = document.getElementById('fJugador').value;
  const tipo = document.getElementById('fTipo').value;
  const minuto = document.getElementById('fMinuto').value;
  if (!jugadorId || !minuto) { toast('Selecciona jugador y minuto', true); return; }

  let jugadorEntraId = null;
  if (tipo === 'SUSTITUCION') {
    jugadorEntraId = document.getElementById('fJugadorEntra').value;
    if (!jugadorEntraId || jugadorEntraId === jugadorId) {
      toast('Selecciona un jugador distinto que entra', true);
      return;
    }
  }

  const j = window._resultadoJugadores.find(x => x.id === jugadorId);
  const jEntra = jugadorEntraId ? window._resultadoJugadores.find(x => x.id === jugadorEntraId) : null;
  window._resultadoEventos.push({
    jugadorId, tipo, minuto: parseInt(minuto), jugadorNombre: j?.nombre||'', team: j?.team||'',
    jugadorEntraId, jugadorEntraNombre: jEntra?.nombre || '',
  });
  document.getElementById('fMinuto').value = '';
  renderEventos();
}

function renderEventos() {
  const labels = { GOL:'Gol', AUTOGOL:'Autogol (AG)', TARJETA_AMARILLA:'Amarilla', TARJETA_ROJA:'Roja', SUSTITUCION:'Cambio' };
  const el = document.getElementById('eventosList');
  if (window._resultadoEventos.length === 0) { el.innerHTML = ''; return; }
  el.innerHTML = window._resultadoEventos.map((e,i) => {
    const desc = e.tipo === 'SUSTITUCION' ? `Sale ${e.jugadorNombre}, entra ${e.jugadorEntraNombre}` : `${labels[e.tipo]||e.tipo} - ${e.jugadorNombre}`;
    return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">
      <span style="width:30px;font-weight:700">${e.minuto}'</span>
      <span style="flex:1">${desc}</span>
      <button class="btn btn-danger btn-sm" onclick="removeEvento(${i})"><span class="icon-badge">${ICONS.close}</span></button>
    </div>`;
  }).join('');
}

function removeEvento(i) {
  window._resultadoEventos.splice(i, 1);
  renderEventos();
}

async function saveResultado(partidoId) {
  try {
    for (const e of window._resultadoEventos) {
      const body = { tipo: e.tipo, jugadorId: e.jugadorId, minuto: e.minuto };
      if (e.tipo === 'SUSTITUCION') body.jugadorEntraId = e.jugadorEntraId;
      await api.post(`/partidos/${partidoId}/eventos`, body);
    }
    const p = window._resultadoPartido;
    const evts = window._resultadoEventos;
    const golesLocal = evts.filter(e => (e.tipo==='GOL'&&e.team==='local')||(e.tipo==='AUTOGOL'&&e.team==='visitante')).length;
    const golesVisitante = evts.filter(e => (e.tipo==='GOL'&&e.team==='visitante')||(e.tipo==='AUTOGOL'&&e.team==='local')).length;

    const body = { golesLocal, golesVisitante };
    const penL = document.getElementById('fPenalesLocal');
    const penV = document.getElementById('fPenalesVisitante');
    if (penL && penV && penL.value !== '' && penV.value !== '') {
      body.penalesLocal = parseInt(penL.value, 10);
      body.penalesVisitante = parseInt(penV.value, 10);
    }

    const data = await api.patch(`/partidos/${partidoId}/resultado`, body);
    closeModal();
    const siguienteMsg = data.siguienteFaseGenerada ? ` — ¡${faseLabel(data.siguienteFaseGenerada)} generada!` : '';
    toast(`Resultado: ${p.local} ${golesLocal} - ${golesVisitante} ${p.visitante}${siguienteMsg}`);
    loadResultados();
  } catch (err) { toast(err.message, true); }
}

// ─── TESORERIA ─────────────────────────────────────────────────────
async function loadTesoreria() {
  const statsEl = document.getElementById('tesoreriaStats');
  const tableEl = document.getElementById('tesoreriaPendientes');
  try {
    const resumen = await api.get('/pagos/resumen');
    statsEl.innerHTML = `
      <div class="kpi-card">
        <div class="kpi-icon tone-primary"><span class="icon-badge">${ICONS.wallet}</span></div>
        <div class="kpi-body"><div class="kpi-value">$${formatMoney(resumen.ingresoDiario.total)}</div><div class="kpi-label">Ingresos hoy</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon tone-accent"><span class="icon-badge">${ICONS.trendUp}</span></div>
        <div class="kpi-body"><div class="kpi-value">$${formatMoney(resumen.ingresoMensual.total)}</div><div class="kpi-label">Ingresos del mes</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon tone-secondary"><span class="icon-badge">${ICONS.pagos}</span></div>
        <div class="kpi-body"><div class="kpi-value">${resumen.pendientes.length}</div><div class="kpi-label">Pagos pendientes</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon tone-warning"><span class="icon-badge">${ICONS.info}</span></div>
        <div class="kpi-body"><div class="kpi-value">$${formatMoney(resumen.montoPendiente)}</div><div class="kpi-label">Monto pendiente</div></div>
      </div>
    `;
    if (resumen.pendientes.length === 0) {
      tableEl.innerHTML = emptyState('tesoreria', 'No hay pagos pendientes.');
      return;
    }
    tableEl.innerHTML = `<table><thead><tr>
      <th>Folio</th><th>Concepto</th><th>Método</th><th>Monto</th><th>Fecha</th><th>Acciones</th>
    </tr></thead><tbody>${resumen.pendientes.map(p => `<tr>
      <td><strong>${p.folio}</strong></td>
      <td>${p.concepto}</td>
      <td>${p.metodo}</td>
      <td>$${formatMoney(p.monto)}</td>
      <td>${formatDate(p.fecha)}</td>
      <td class="actions-cell">
          <button class="btn btn-primary btn-sm" onclick="approvePago('${p.id}')"><span class="icon-badge">${ICONS.check}</span> Aprobar</button>
          <button class="btn btn-danger btn-sm" onclick="rejectPago('${p.id}')"><span class="icon-badge">${ICONS.close}</span></button></td>
    </tr>`).join('')}</tbody></table>`;
  } catch (err) { toast(err.message, true); }
}

async function approvePago(id) {
  try { await api.patch(`/pagos/${id}/aprobar`); toast('Pago aprobado'); loadTesoreria(); }
  catch (err) { toast(err.message, true); }
}

async function rejectPago(id) {
  if (!confirm('¿Rechazar este pago?')) return;
  try { await api.patch(`/pagos/${id}/rechazar`); toast('Pago rechazado'); loadTesoreria(); }
  catch (err) { toast(err.message, true); }
}

// ─── PAGOS REALIZADOS ──────────────────────────────────────────────
let pagosFiltro = 'Todos';

async function loadPagos() {
  const filtroEl = document.getElementById('pagosFiltro');
  const tableEl = document.getElementById('pagosTable');
  const filtros = ['Todos','TARJETA','EFECTIVO','TRANSFERENCIA'];
  const labels = { Todos:'Todos', TARJETA:'Tarjeta', EFECTIVO:'Efectivo', TRANSFERENCIA:'Transferencia' };

  filtroEl.innerHTML = filtros.map(f =>
    `<button class="pill ${f===pagosFiltro?'active':''}" onclick="selectPagosFiltro('${f}')">${labels[f]}</button>`
  ).join('');

  tableEl.innerHTML = '<div class="loading-center"><div class="spinner"></div></div>';
  try {
    const pagos = await api.get('/pagos?estado=APROBADO');
    const filtered = pagosFiltro === 'Todos' ? pagos : pagos.filter(p => p.metodo === pagosFiltro);
    if (filtered.length === 0) {
      tableEl.innerHTML = emptyState('pagos', 'No hay pagos registrados.');
      return;
    }
    tableEl.innerHTML = `<table><thead><tr>
      <th>Folio</th><th>Concepto</th><th>Método</th><th>Monto</th><th>Fecha</th>
    </tr></thead><tbody>${filtered.map(p => `<tr>
      <td><strong>${p.folio}</strong></td>
      <td>${p.concepto}</td>
      <td>${labels[p.metodo]||p.metodo}</td>
      <td><span class="badge badge-success">$${formatMoney(p.monto)}</span></td>
      <td>${formatDate(p.fecha)}</td>
    </tr>`).join('')}</tbody></table>`;
  } catch (err) { toast(err.message, true); }
}

function selectPagosFiltro(f) { pagosFiltro = f; loadPagos(); }

// ─── Init ──────────────────────────────────────────────────────────
loadDashboard();
