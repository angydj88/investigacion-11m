// ===== DATA-TABLES.JS — Interactive data tables =====

const DataTables = {
  initialized: false,
  currentTable: 'gtd',
  datasets: {},

  async init() {
    if (this.initialized) return;
    this.setupTabs();
    this.setupFilter();
    await this.loadAll();
    this.showTable('gtd');
    this.initialized = true;
  },

  async loadAll() {
    const basePath = '..';
    try {
      const [gtd, victimas, imputados, spain2004] = await Promise.all([
        fetch(`${basePath}/data/gtd_11m_raw.json`).then(r => r.json()),
        fetch(`${basePath}/data/victimas.json`).then(r => r.json()),
        fetch(`${basePath}/data/imputados.json`).then(r => r.json()),
        fetch(`${basePath}/data/gtd_spain_2004_otros.json`).then(r => r.json()),
      ]);
      this.datasets = { gtd, victimas, imputados, spain2004 };
    } catch (e) {
      console.warn('Could not load data:', e);
    }
  },

  setupTabs() {
    document.querySelectorAll('.data-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.data-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.showTable(btn.dataset.table);
      });
    });
  },

  setupFilter() {
    const input = document.getElementById('data-filter');
    if (!input) return;
    let debounce;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => this.filterRows(input.value), 200);
    });
  },

  showTable(tableId) {
    this.currentTable = tableId;
    const container = document.getElementById('data-tables-container');
    if (!container) return;

    switch (tableId) {
      case 'gtd': container.innerHTML = this.buildGtdTable(); break;
      case 'victimas': container.innerHTML = this.buildVictimasTable(); break;
      case 'imputados': container.innerHTML = this.buildImputadosTable(); break;
      case 'spain2004': container.innerHTML = this.buildSpain2004Table(); break;
    }

    // Clear filter
    const filterInput = document.getElementById('data-filter');
    if (filterInput) filterInput.value = '';
  },

  // === GTD TABLE ===
  buildGtdTable() {
    const data = this.datasets.gtd;
    if (!data || !data.length) return '<p class="p-6 text-secondary">Sin datos</p>';

    let html = '<div class="overflow-x-auto"><table class="data-table"><thead><tr>';
    html += '<th>ID</th><th>Ubicacion</th><th>Grupo</th><th>Tipo ataque</th>';
    html += '<th>Fallecidos</th><th>Heridos</th><th>Exito</th><th>Arma</th>';
    html += '</tr></thead><tbody>';

    for (const r of data) {
      html += `<tr data-searchable="${this.searchText(r)}">
        <td class="font-mono text-xs">${r.eventid}</td>
        <td>${r.summary ? r.summary.substring(0, 80) + '...' : r.city || '-'}</td>
        <td>${r.gname || '-'}</td>
        <td>${r.attacktype1_txt || '-'}</td>
        <td class="text-center font-semibold ${r.nkill > 0 ? 'text-red-600' : ''}">${r.nkill || 0}</td>
        <td class="text-center">${r.nwound || 0}</td>
        <td class="text-center">${r.success ? 'Si' : 'No'}</td>
        <td>${r.weaptype1_txt || '-'}</td>
      </tr>`;
    }

    html += '</tbody></table></div>';
    html += `<div class="px-4 py-3 text-xs text-slate-400 border-t border-slate-100">
      Fuente: Global Terrorism Database (GTD), START, Universidad de Maryland. ${data.length} registros del 11-M.
    </div>`;
    return html;
  },

  // === VICTIMAS TABLE ===
  buildVictimasTable() {
    const data = this.datasets.victimas;
    if (!data) return '<p class="p-6 text-secondary">Sin datos</p>';

    let html = '<div class="overflow-x-auto"><table class="data-table"><thead><tr>';
    html += '<th>Ubicacion</th><th>Tren</th><th>Hora</th><th>Bombas detonadas</th><th>Vagones</th><th>Fallecidos</th>';
    html += '</tr></thead><tbody>';

    for (const loc of data.por_ubicacion) {
      html += `<tr data-searchable="${loc.lugar}">
        <td class="font-medium">${loc.lugar}</td>
        <td>${loc.tren || '-'}</td>
        <td class="text-center">${loc.hora_explosion || '-'}</td>
        <td class="text-center">${loc.bombas_detonadas || '-'}</td>
        <td>${loc.vagones_afectados || '-'}</td>
        <td class="text-center font-bold text-red-600">${loc.fallecidos || '-'}</td>
      </tr>`;
    }

    html += `<tr class="font-semibold bg-slate-50">
      <td colspan="5" class="font-semibold">TOTAL</td>
      <td class="text-center font-bold text-red-600">${data.resumen.fallecidos}</td>
    </tr>`;

    html += '</tbody></table></div>';
    html += `<div class="px-4 py-3 text-xs text-slate-400 border-t border-slate-100">
      ${data.resumen.nota}. Heridos: ${data.resumen.heridos}. Fuente: Sentencia AN 65/2007, GTD.
    </div>`;
    return html;
  },

  // === IMPUTADOS TABLE ===
  buildImputadosTable() {
    const data = this.datasets.imputados;
    if (!data) return '<p class="p-6 text-secondary">Sin datos</p>';

    let html = '<div class="p-4 bg-slate-50 border-b border-slate-100 text-sm text-secondary">';
    html += `Juicio: ${data.proceso}. Sentencia: ${data.sentencia} (${data.fecha_sentencia}). `;
    html += `Tribunal: ${data.presidente_tribunal}. ${data.sesiones} sesiones, ${data.paginas_sentencia} paginas.`;
    html += '</div>';

    html += '<div class="overflow-x-auto"><table class="data-table"><thead><tr>';
    html += '<th>Condenado</th><th>Nacionalidad</th><th>Condena (anos)</th><th>Delitos</th>';
    html += '</tr></thead><tbody>';

    for (const c of data.condenados_principales) {
      html += `<tr data-searchable="${c.nombre} ${c.nacionalidad} ${c.delitos}">
        <td class="font-medium">${c.nombre}</td>
        <td>${c.nacionalidad}</td>
        <td class="text-center font-semibold">${c.condena_anos.toLocaleString('es-ES')}</td>
        <td class="text-sm">${c.delitos}</td>
      </tr>`;
    }

    html += '</tbody></table></div>';

    // Suicidas
    html += '<div class="px-4 py-4 border-t border-slate-200">';
    html += '<h4 class="font-semibold text-primary text-sm mb-2">Suicidas de Leganes (3 abril 2004)</h4>';
    html += '<ul class="text-sm text-secondary space-y-1">';
    for (const s of data.suicidas_leganes.nombres) {
      html += `<li>${s}</li>`;
    }
    html += '</ul>';
    html += `<p class="text-xs text-slate-400 mt-2">Policia fallecido: ${data.suicidas_leganes.policia_fallecido}</p>`;
    html += '</div>';

    html += `<div class="px-4 py-3 text-xs text-slate-400 border-t border-slate-100">
      Total acusados: ${data.total_acusados}. Condenados: ${data.total_condenados}. Absueltos: ${data.total_absueltos}.
      Absueltos posteriores TS: ${data.absueltos_posteriores_TS}.
    </div>`;
    return html;
  },

  // === SPAIN 2004 TABLE ===
  buildSpain2004Table() {
    const data = this.datasets.spain2004;
    if (!data || !data.length) return '<p class="p-6 text-secondary">Sin datos</p>';

    let html = '<div class="overflow-x-auto"><table class="data-table"><thead><tr>';
    html += '<th>Fecha</th><th>Ciudad</th><th>Grupo</th><th>Fallecidos</th><th>Heridos</th><th>Resumen</th>';
    html += '</tr></thead><tbody>';

    for (const r of data) {
      const date = `${r.iyear}-${String(r.imonth).padStart(2,'0')}-${String(r.iday).padStart(2,'0')}`;
      const summary = r.summary ? r.summary.substring(0, 120) + '...' : '-';
      html += `<tr data-searchable="${date} ${r.city || ''} ${r.gname || ''} ${r.summary || ''}">
        <td class="whitespace-nowrap">${date}</td>
        <td>${r.city || '-'}</td>
        <td class="text-xs">${r.gname || 'Desconocido'}</td>
        <td class="text-center ${r.nkill > 0 ? 'font-semibold text-red-600' : ''}">${r.nkill || 0}</td>
        <td class="text-center">${r.nwound || 0}</td>
        <td class="text-xs text-secondary max-w-xs">${summary}</td>
      </tr>`;
    }

    html += '</tbody></table></div>';
    html += `<div class="px-4 py-3 text-xs text-slate-400 border-t border-slate-100">
      Fuente: Global Terrorism Database. ${data.length} eventos terroristas en Espana durante 2004 (excluyendo 11-M).
    </div>`;
    return html;
  },

  // === FILTER ===
  filterRows(query) {
    const q = query.toLowerCase().trim();
    const rows = document.querySelectorAll('#data-tables-container tbody tr');
    rows.forEach(row => {
      const text = (row.dataset.searchable || row.textContent).toLowerCase();
      row.classList.toggle('hidden', q.length > 0 && !text.includes(q));
    });
  },

  searchText(obj) {
    return Object.values(obj).filter(v => v != null).join(' ').toLowerCase();
  }
};
