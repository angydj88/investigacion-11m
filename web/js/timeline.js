// ===== TIMELINE.JS — Interactive timeline component =====

const Timeline = {
  data: null,
  initialized: false,

  async init() {
    if (this.initialized) return;
    try {
      const res = await fetch('../data/timeline.json');
      this.data = await res.json();
      this.render();
      this.setupFilters();
      this.initialized = true;
    } catch (e) {
      console.warn('Could not load timeline.json:', e);
      document.getElementById('timeline-container').innerHTML =
        '<p class="text-secondary text-sm">No se pudo cargar el timeline.</p>';
    }
  },

  render(filter = 'all') {
    const container = document.getElementById('timeline-container');
    if (!container || !this.data) return;

    const categoryColors = {
      atentado: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
      investigacion: { bg: 'bg-sky-50', text: 'text-sky-700', badge: 'bg-sky-100 text-sky-700' },
      politico: { bg: 'bg-slate-50', text: 'text-slate-600', badge: 'bg-slate-100 text-slate-600' },
      judicial: { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
    };

    const categoryLabels = {
      atentado: 'Atentado',
      investigacion: 'Investigacion',
      politico: 'Politico',
      judicial: 'Judicial',
    };

    let html = '<div class="timeline-line">';

    for (const event of this.data) {
      const cat = event.categoria || 'investigacion';
      const hidden = filter !== 'all' && cat !== filter ? ' hidden' : '';
      const colors = categoryColors[cat] || categoryColors.investigacion;

      const date = this.formatDate(event.fecha);
      const time = event.hora ? `<span class="font-semibold">${event.hora}</span> &mdash; ` : '';
      const location = event.ubicacion ? `<span class="text-xs text-slate-500">${event.ubicacion}</span>` : '';

      html += `
        <div class="timeline-event${hidden}" data-cat="${cat}">
          <div class="${colors.bg} rounded-lg p-4 border border-slate-100">
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <span class="text-xs font-medium px-2 py-0.5 rounded-full ${colors.badge}">${categoryLabels[cat]}</span>
              <span class="text-xs text-slate-500">${date}</span>
              ${location}
            </div>
            <p class="text-sm text-slate-800">${time}${event.descripcion}</p>
            ${event.fuente ? `<p class="text-xs text-slate-400 mt-1">Fuente: ${event.fuente}</p>` : ''}
          </div>
        </div>`;
    }

    html += '</div>';
    container.innerHTML = html;
  },

  setupFilters() {
    document.querySelectorAll('.timeline-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.timeline-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.render(btn.dataset.category);
      });
    });
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const day = parseInt(parts[2], 10);
    const month = months[parseInt(parts[1], 10) - 1];
    const year = parts[0];
    return `${day} de ${month} de ${year}`;
  }
};
