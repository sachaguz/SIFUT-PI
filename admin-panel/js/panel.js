if (!api.isAuthenticated()) window.location.href = 'index.html';

document.getElementById('userInfo').textContent = `${api.user.nombre} ${api.user.apellido}`;

// ─── Helpers ───────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

function tipoLabel(t) {
  return { FUTBOL5: 'Fútbol 5', FUTBOL7: 'Fútbol 7', FUTBOL11: 'Fútbol 11' }[t] || t;
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

const DIAS = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

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

// ─── Navigation ────────────────────────────────────────────────────
const navLinks = document.querySelectorAll('.sidebar-nav a');
let currentSection = 'sedes';

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const sec = link.dataset.section;
    if (sec === currentSection) return;
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    document.getElementById(`sec-${currentSection}`).classList.remove('active');
    document.getElementById(`sec-${sec}`).classList.add('active');
    currentSection = sec;
    loaders[sec]();
  });
});

// ─── Section Loaders ───────────────────────────────────────────────
const loaders = { sedes: loadSedes, canchas: loadCanchas, horarios: loadHorarios,
  reservas: loadReservas, resultados: loadResultados, tesoreria: loadTesoreria, pagos: loadPagos };

// ─── SEDES ─────────────────────────────────────────────────────────
let sedesCache = [];

async function loadSedes() {
  const el = document.getElementById('sedesTable');
  el.innerHTML = '<div class="loading-center"><div class="spinner"></div></div>';
  try {
    sedesCache = await api.get('/sedes');
    if (sedesCache.length === 0) {
      el.innerHTML = '<div class="empty-state"><p>No hay sedes registradas.</p></div>';
      return;
    }
    el.innerHTML = `<table><thead><tr>
      <th>Nombre</th><th>Dirección</th><th>Teléfono</th><th>Estado</th><th>Acciones</th>
    </tr></thead><tbody>${sedesCache.map(s => `<tr>
      <td><strong>${s.nombre}</strong></td>
      <td>${s.direccion}</td>
      <td>${s.telefono}</td>
      <td>${s.activa ? '<span class="badge badge-success">Activa</span>' : '<span class="badge badge-neutral">Inactiva</span>'}</td>
      <td><button class="btn btn-outline btn-sm" onclick="openSedeForm('${s.id}')">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="deleteSede('${s.id}')">Eliminar</button></td>
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

async function loadCanchas() {
  const pillsEl = document.getElementById('canchasSedePills');
  const tableEl = document.getElementById('canchasTable');
  try {
    if (sedesCache.length === 0) sedesCache = await api.get('/sedes');
    if (!canchasSedeId && sedesCache.length > 0) canchasSedeId = sedesCache[0].id;

    pillsEl.innerHTML = sedesCache.map(s =>
      `<button class="pill ${s.id===canchasSedeId?'active':''}" onclick="selectCanchaSede('${s.id}')">${s.nombre}</button>`
    ).join('');

    if (!canchasSedeId) { tableEl.innerHTML = '<div class="empty-state"><p>Selecciona una sede.</p></div>'; return; }

    tableEl.innerHTML = '<div class="loading-center"><div class="spinner"></div></div>';
    const canchas = await api.get(`/canchas?sedeId=${canchasSedeId}`);
    if (canchas.length === 0) {
      tableEl.innerHTML = '<div class="empty-state"><p>No hay canchas en esta sede.</p></div>';
      return;
    }
    tableEl.innerHTML = `<table><thead><tr>
      <th>Nombre</th><th>Tipo</th><th>Superficie</th><th>Capacidad</th><th>Precio/hora</th><th>Acciones</th>
    </tr></thead><tbody>${canchas.map(c => `<tr>
      <td><strong>${c.nombre}</strong></td>
      <td>${tipoLabel(c.tipo)}</td>
      <td>${c.superficie}</td>
      <td>${c.capacidad}</td>
      <td>$${Number(c.precioPorHora)}</td>
      <td><button class="btn btn-outline btn-sm" onclick="openCanchaForm('${c.id}','${enc(c)}')">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="deleteCancha('${c.id}')">Eliminar</button></td>
    </tr>`).join('')}</tbody></table>`;
  } catch (err) { toast(err.message, true); }
}

function enc(obj) { return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))); }
function dec(str) { return JSON.parse(decodeURIComponent(escape(atob(str)))); }

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

async function loadHorarios() {
  const sedePills = document.getElementById('horariosSedePills');
  const diaPills = document.getElementById('horariosDiaPills');
  const tableEl = document.getElementById('horariosTable');
  try {
    if (sedesCache.length === 0) sedesCache = await api.get('/sedes');
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
    const filtered = horarios.filter(h => h.diaSemana === horariosDia);
    if (filtered.length === 0) {
      tableEl.innerHTML = '<div class="empty-state"><p>No hay horarios para este día.</p></div>';
      return;
    }
    tableEl.innerHTML = `<table><thead><tr>
      <th>Cancha</th><th>Hora inicio</th><th>Hora fin</th><th>Estado</th>
    </tr></thead><tbody>${filtered.map(h => `<tr>
      <td>${h.cancha?.nombre||''}</td>
      <td>${h.horaInicio}</td>
      <td>${h.horaFin}</td>
      <td>${h.disponible ? '<span class="badge badge-success">Disponible</span>' : '<span class="badge badge-danger">No disponible</span>'}</td>
    </tr>`).join('')}</tbody></table>`;
  } catch (err) { toast(err.message, true); }
}

function selectHorarioSede(id) { horariosSedeId = id; loadHorarios(); }
function selectHorarioDia(d) { horariosDia = d; loadHorarios(); }

// ─── RESERVAS ──────────────────────────────────────────────────────
async function loadReservas() {
  const el = document.getElementById('reservasTable');
  el.innerHTML = '<div class="loading-center"><div class="spinner"></div></div>';
  try {
    const today = new Date().toISOString().substring(0,10);
    const reservas = await api.get(`/reservas?fecha=${today}`);
    if (reservas.length === 0) {
      el.innerHTML = '<div class="empty-state"><p>No hay reservas para hoy.</p></div>';
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
      <td>$${Number(r.totalPagado)}</td>
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
      el.innerHTML = '<div class="empty-state"><p>No hay partidos registrados.</p></div>';
      return;
    }
    el.innerHTML = `<table><thead><tr>
      <th>Partido</th><th>Torneo</th><th>Fecha</th><th>Cancha</th><th>Marcador</th><th>Estado</th><th>Acciones</th>
    </tr></thead><tbody>${partidos.map(p => {
      const local = p.equipoLocal?.nombre||'';
      const vis = p.equipoVisitante?.nombre||'';
      const cancha = p.cancha ? `${p.cancha.nombre}` : '';
      const fin = p.estado === 'FINALIZADO';
      return `<tr>
        <td><strong>${local} vs ${vis}</strong></td>
        <td>${p.torneo?.nombre||''}</td>
        <td>${formatDate(p.fecha)} · ${p.hora}</td>
        <td>${cancha}</td>
        <td>${fin ? `<strong>${p.golesLocal} - ${p.golesVisitante}</strong>` : '-'}</td>
        <td>${estadoBadge(p.estado)}</td>
        <td>${fin
          ? `<button class="btn btn-outline btn-sm" onclick="viewPartido('${p.id}')">Ver</button>`
          : `<button class="btn btn-primary btn-sm" onclick="openResultadoForm('${p.id}','${enc({id:p.id,local,visitante:vis,equipoLocal:p.equipoLocal,equipoVisitante:p.equipoVisitante})}')">Registrar</button>`
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
      const labels = { GOL:'⚽ Gol', AUTOGOL:'⚽ Autogol', TARJETA_AMARILLA:'🟨 Amarilla', TARJETA_ROJA:'🟥 Roja', SUSTITUCION:'🔄 Cambio' };
      return `<tr><td>${e.minuto}'</td><td>${labels[e.tipo]||e.tipo}</td><td>${e.jugador?.nombre||''}</td><td>${e.jugador?.equipo?.nombre||''}</td></tr>`;
    }).join('');
    openModal(`
      <h2>${local} ${p.golesLocal} - ${p.golesVisitante} ${vis}</h2>
      <p style="color:var(--text-muted);margin-bottom:16px">${p.torneo?.nombre||''} · ${formatDate(p.fecha)} · ${p.hora}</p>
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

    openModal(`
      <h2>Registrar resultado</h2>
      <p style="color:var(--text-muted);margin-bottom:16px">${p.local} vs ${p.visitante}</p>
      <div id="eventosList" style="margin-bottom:16px"></div>
      <div class="card" style="background:var(--bg)">
        <strong style="font-size:13px">Agregar evento</strong>
        <div class="form-row mt-sm">
          <div class="form-group"><label>Jugador</label><select id="fJugador">${jugadorOpts}</select></div>
          <div class="form-group"><label>Tipo</label><select id="fTipo">${tipoOpts}</select></div>
        </div>
        <div class="form-group"><label>Minuto</label><input id="fMinuto" type="number" min="0" max="120" placeholder="45"></div>
        <button class="btn btn-outline btn-sm" onclick="addEvento()">+ Agregar</button>
      </div>
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

function addEvento() {
  const jugadorId = document.getElementById('fJugador').value;
  const tipo = document.getElementById('fTipo').value;
  const minuto = document.getElementById('fMinuto').value;
  if (!jugadorId || !minuto) { toast('Selecciona jugador y minuto', true); return; }
  const j = window._resultadoJugadores.find(x => x.id === jugadorId);
  window._resultadoEventos.push({ jugadorId, tipo, minuto: parseInt(minuto), jugadorNombre: j?.nombre||'', team: j?.team||'' });
  document.getElementById('fMinuto').value = '';
  renderEventos();
}

function renderEventos() {
  const labels = { GOL:'⚽', AUTOGOL:'⚽(AG)', TARJETA_AMARILLA:'🟨', TARJETA_ROJA:'🟥', SUSTITUCION:'🔄' };
  const el = document.getElementById('eventosList');
  if (window._resultadoEventos.length === 0) { el.innerHTML = ''; return; }
  el.innerHTML = window._resultadoEventos.map((e,i) =>
    `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">
      <span style="width:30px;font-weight:700">${e.minuto}'</span>
      <span>${labels[e.tipo]||e.tipo}</span>
      <span style="flex:1">${e.jugadorNombre}</span>
      <button class="btn btn-danger btn-sm" onclick="removeEvento(${i})">×</button>
    </div>`
  ).join('');
}

function removeEvento(i) {
  window._resultadoEventos.splice(i, 1);
  renderEventos();
}

async function saveResultado(partidoId) {
  try {
    for (const e of window._resultadoEventos) {
      await api.post(`/partidos/${partidoId}/eventos`, { tipo: e.tipo, jugadorId: e.jugadorId, minuto: e.minuto });
    }
    const p = window._resultadoPartido;
    const evts = window._resultadoEventos;
    const golesLocal = evts.filter(e => (e.tipo==='GOL'&&e.team==='local')||(e.tipo==='AUTOGOL'&&e.team==='visitante')).length;
    const golesVisitante = evts.filter(e => (e.tipo==='GOL'&&e.team==='visitante')||(e.tipo==='AUTOGOL'&&e.team==='local')).length;
    await api.patch(`/partidos/${partidoId}/resultado`, { golesLocal, golesVisitante });
    closeModal();
    toast(`Resultado: ${p.local} ${golesLocal} - ${golesVisitante} ${p.visitante}`);
    loadResultados();
  } catch (err) { toast(err.message, true); }
}

// ─── TESORERIA ─────────────────────────────────────────────────────
async function loadTesoreria() {
  const statsEl = document.getElementById('tesoreriaStats');
  const tableEl = document.getElementById('tesoreriaPendientes');
  try {
    const [resumen, pendientes] = await Promise.all([
      api.get('/pagos/resumen'),
      api.get('/pagos?estado=PENDIENTE'),
    ]);
    statsEl.innerHTML = `
      <div class="stat-card"><div class="stat-label">Ingresos hoy</div><div class="stat-value">$${Number(resumen.ingresosDiarios||0)}</div></div>
      <div class="stat-card"><div class="stat-label">Ingresos del mes</div><div class="stat-value">$${Number(resumen.ingresosMensuales||0)}</div></div>
      <div class="stat-card"><div class="stat-label">Pagos pendientes</div><div class="stat-value">${resumen.pagosPendientes||0}</div></div>
      <div class="stat-card"><div class="stat-label">Monto pendiente</div><div class="stat-value">$${Number(resumen.montoPendiente||0)}</div></div>
    `;
    if (pendientes.length === 0) {
      tableEl.innerHTML = '<div class="empty-state"><p>No hay pagos pendientes.</p></div>';
      return;
    }
    tableEl.innerHTML = `<table><thead><tr>
      <th>Folio</th><th>Concepto</th><th>Método</th><th>Monto</th><th>Fecha</th><th>Acciones</th>
    </tr></thead><tbody>${pendientes.map(p => `<tr>
      <td><strong>${p.folio}</strong></td>
      <td>${p.concepto}</td>
      <td>${p.metodo}</td>
      <td>$${Number(p.monto)}</td>
      <td>${formatDate(p.fecha)}</td>
      <td><button class="btn btn-primary btn-sm" onclick="approvePago('${p.id}')">Aprobar</button>
          <button class="btn btn-danger btn-sm" onclick="rejectPago('${p.id}')">Rechazar</button></td>
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
      tableEl.innerHTML = '<div class="empty-state"><p>No hay pagos registrados.</p></div>';
      return;
    }
    tableEl.innerHTML = `<table><thead><tr>
      <th>Folio</th><th>Concepto</th><th>Método</th><th>Monto</th><th>Fecha</th>
    </tr></thead><tbody>${filtered.map(p => `<tr>
      <td><strong>${p.folio}</strong></td>
      <td>${p.concepto}</td>
      <td>${labels[p.metodo]||p.metodo}</td>
      <td><span class="badge badge-success">$${Number(p.monto)}</span></td>
      <td>${formatDate(p.fecha)}</td>
    </tr>`).join('')}</tbody></table>`;
  } catch (err) { toast(err.message, true); }
}

function selectPagosFiltro(f) { pagosFiltro = f; loadPagos(); }

// ─── Init ──────────────────────────────────────────────────────────
loadSedes();
