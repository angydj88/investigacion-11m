// ===== APP.JS — Main application logic =====

const App = {
  basePath: '..',
  currentSection: 'inicio',
  currentArticle: null,
  mdCache: {},

  sections: {
    cronologia: {
      label: 'Cronologia',
      folder: 'src/timeline',
      articles: [
        { file: 'cronologia_general.md', label: 'Cronologia general' },
        { file: 'dia_11_marzo_2004.md', label: 'Dia 11 de marzo 2004' },
        { file: 'investigacion_policial.md', label: 'Investigacion policial' },
        { file: 'proceso_judicial.md', label: 'Proceso judicial' },
      ]
    },
    analisis: {
      label: 'Analisis',
      folder: 'src/analisis',
      articles: [
        { file: 'hechos_probados.md', label: 'Hechos probados' },
        { file: 'hipotesis.md', label: 'Hipotesis investigadas' },
        { file: 'explosivos.md', label: 'Explosivos' },
        { file: 'comunicaciones.md', label: 'Comunicaciones' },
        { file: 'controversias_irregularidades.md', label: 'Controversias e irregularidades', danger: true },
      ]
    },
    documentos: {
      label: 'Documentos',
      folder: 'src/documentos',
      articles: [
        { file: 'indice_documentos.md', label: 'Indice de documentos' },
        { file: 'sentencia_audiencia.md', label: 'Sentencia Audiencia Nacional' },
        { file: 'comision_investigacion.md', label: 'Comision de investigacion' },
        { file: 'informes_policiales.md', label: 'Informes policiales' },
      ]
    },
    perfiles: {
      label: 'Perfiles',
      folder: 'src/perfiles',
      articles: [
        { file: 'autores_materiales.md', label: 'Autores materiales' },
        { file: 'red_logistica.md', label: 'Red logistica' },
        { file: 'organizaciones.md', label: 'Organizaciones' },
      ]
    },
    mapas: {
      label: 'Mapas',
      folder: 'src/mapas',
      articles: [
        { file: 'ubicaciones_atentados.md', label: 'Ubicaciones de los atentados' },
        { file: 'red_pisos.md', label: 'Red de pisos francos' },
        { file: 'leganes.md', label: 'Leganes (3 abril 2004)' },
      ]
    },
    fuentes: {
      label: 'Fuentes',
      folder: 'src/fuentes',
      articles: [
        { file: 'fuentes_oficiales.md', label: 'Fuentes oficiales' },
        { file: 'fuentes_periodisticas.md', label: 'Fuentes periodisticas' },
        { file: 'bibliografia.md', label: 'Bibliografia' },
        { file: 'recursos_audiovisuales.md', label: 'Recursos audiovisuales' },
      ]
    },
  },

  init() {
    this.buildSidebar();
    this.buildArticleCards();
    this.loadTrainsTable();
    this.setupMobileMenu();
    this.setupSearch();
    this.handleRoute();
    window.addEventListener('hashchange', () => this.handleRoute());
  },

  // === SIDEBAR ===
  buildSidebar() {
    const nav = document.getElementById('sidebar-nav');
    let html = '';
    html += `<a href="#inicio" data-section="inicio"><span>Inicio</span></a>`;
    for (const [key, sec] of Object.entries(this.sections)) {
      html += `<div class="section-title">${sec.label}</div>`;
      for (const art of sec.articles) {
        const slug = art.file.replace('.md', '');
        const cls = art.danger ? ' danger' : '';
        html += `<a href="#${key}/${slug}" data-section="${key}" data-article="${slug}" class="${cls}"><span>${art.label}</span></a>`;
      }
    }
    html += `<div class="section-title">Datos</div>`;
    html += `<a href="#datos" data-section="datos"><span>Global Terrorism Database</span></a>`;
    nav.innerHTML = html;
  },

  // === ARTICLE CARDS ===
  buildArticleCards() {
    for (const [key, sec] of Object.entries(this.sections)) {
      const container = document.getElementById(`${key}-articles`);
      if (!container) continue;
      let html = '';
      for (const art of sec.articles) {
        const slug = art.file.replace('.md', '');
        const cls = art.danger ? ' danger' : '';
        html += `<a href="#${key}/${slug}" class="article-card${cls}" data-article="${slug}"><span>${art.label}</span></a>`;
      }
      container.innerHTML = html;
    }
  },

  // === TRAINS TABLE (Hero) ===
  async loadTrainsTable() {
    try {
      const res = await fetch(`${this.basePath}/data/trenes.json`);
      const data = await res.json();
      const tbody = document.getElementById('trains-table-body');
      if (!tbody) return;
      let html = '';
      for (const t of data.trenes) {
        html += `<tr>
          <td class="px-4 py-3 font-medium">${t.ubicacion_explosion}</td>
          <td class="px-4 py-3">${t.numero_tren || '-'}</td>
          <td class="px-4 py-3 text-center">${t.hora_explosion}</td>
          <td class="px-4 py-3 text-center">${t.bombas_detonadas} / ${t.bombas_detonadas + t.bombas_no_detonadas}</td>
          <td class="px-4 py-3 text-center font-bold text-red-600">${t.fallecidos}</td>
        </tr>`;
      }
      html += `<tr class="font-semibold bg-slate-50">
        <td class="px-4 py-3" colspan="2">TOTAL</td>
        <td class="px-4 py-3 text-center">07:37-07:39</td>
        <td class="px-4 py-3 text-center">${data.resumen.total_detonadas} / ${data.resumen.total_bombas_colocadas}</td>
        <td class="px-4 py-3 text-center font-bold text-red-600">${data.resumen.total_fallecidos}</td>
      </tr>`;
      tbody.innerHTML = html;
    } catch (e) {
      console.warn('Could not load trenes.json:', e);
    }
  },

  // === ROUTING ===
  handleRoute() {
    const hash = window.location.hash.slice(1) || 'inicio';
    const parts = hash.split('/');
    const section = parts[0];
    const article = parts[1] || null;

    // Show correct section
    document.querySelectorAll('.section-panel').forEach(el => el.classList.add('hidden'));
    const panel = document.getElementById(section);
    if (panel) {
      panel.classList.remove('hidden');
    } else {
      document.getElementById('inicio').classList.remove('hidden');
    }

    // Update nav highlights
    document.querySelectorAll('#top-nav .nav-link').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${section}`);
    });
    document.querySelectorAll('#sidebar-nav a').forEach(a => {
      const s = a.dataset.section;
      const art = a.dataset.article;
      if (article) {
        a.classList.toggle('active', s === section && art === article);
      } else {
        a.classList.toggle('active', s === section && !art);
      }
    });

    // Update article card highlights
    document.querySelectorAll('.article-card').forEach(a => {
      a.classList.toggle('active', a.dataset.article === article);
    });

    // Load article if specified
    if (article && this.sections[section]) {
      this.loadArticle(section, article);
    }

    // Init timeline if on cronologia
    if (section === 'cronologia' && typeof Timeline !== 'undefined') {
      Timeline.init();
    }

    // Init data tables if on datos
    if (section === 'datos' && typeof DataTables !== 'undefined') {
      DataTables.init();
    }

    this.currentSection = section;
    this.currentArticle = article;

    // Close mobile menu
    this.closeMobileMenu();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // === LOAD MARKDOWN ARTICLE ===
  async loadArticle(section, articleSlug) {
    const sec = this.sections[section];
    if (!sec) return;
    const art = sec.articles.find(a => a.file.replace('.md', '') === articleSlug);
    if (!art) return;

    const contentEl = document.getElementById(`${section}-content`);
    if (!contentEl) return;

    const filePath = `${this.basePath}/${sec.folder}/${art.file}`;
    const cacheKey = `${section}/${articleSlug}`;

    // Show loading
    contentEl.innerHTML = '<div class="flex items-center gap-2 text-secondary py-8"><div class="spinner"></div><span>Cargando...</span></div>';

    try {
      let mdText;
      if (this.mdCache[cacheKey]) {
        mdText = this.mdCache[cacheKey];
      } else {
        const res = await fetch(filePath);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        mdText = await res.text();
        this.mdCache[cacheKey] = mdText;
      }

      // Convert links to other .md files into hash links
      mdText = mdText.replace(/\[([^\]]+)\]\(([^)]*\.md)\)/g, (match, text, href) => {
        // Convert relative .md links to hash navigation
        if (href.startsWith('../')) {
          const clean = href.replace('../', '').replace('.md', '');
          const parts = clean.split('/');
          if (parts.length === 2) return `[${text}](#${parts[0]}/${parts[1]})`;
        }
        if (href.startsWith('./') || !href.includes('/')) {
          const clean = href.replace('./', '').replace('.md', '');
          return `[${text}](#${section}/${clean})`;
        }
        return match;
      });

      const html = marked.parse(mdText);
      contentEl.innerHTML = `<div class="md-content">${html}</div>`;
    } catch (e) {
      contentEl.innerHTML = `<div class="text-danger py-8">Error al cargar el articulo: ${e.message}</div>`;
    }
  },

  // === MOBILE MENU ===
  setupMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
      overlay.classList.toggle('hidden');
    });

    overlay.addEventListener('click', () => this.closeMobileMenu());
  },

  closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar.classList.contains('-translate-x-full')) {
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
    }
  },

  // === SEARCH ===
  setupSearch() {
    const toggle = document.getElementById('search-toggle');
    const bar = document.getElementById('search-bar');
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');

    toggle.addEventListener('click', () => {
      bar.classList.toggle('hidden');
      if (!bar.classList.contains('hidden')) {
        input.focus();
      }
    });

    let debounce;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => this.doSearch(input.value, results), 300);
    });
  },

  async doSearch(query, resultsEl) {
    if (query.length < 2) {
      resultsEl.classList.add('hidden');
      resultsEl.innerHTML = '';
      return;
    }

    const q = query.toLowerCase();
    const matches = [];

    for (const [key, sec] of Object.entries(this.sections)) {
      for (const art of sec.articles) {
        if (art.label.toLowerCase().includes(q)) {
          matches.push({ section: key, article: art, source: 'title' });
          continue;
        }
        // Search in cached content
        const cacheKey = `${key}/${art.file.replace('.md', '')}`;
        if (this.mdCache[cacheKey] && this.mdCache[cacheKey].toLowerCase().includes(q)) {
          matches.push({ section: key, article: art, source: 'content' });
        }
      }
    }

    if (matches.length === 0) {
      resultsEl.innerHTML = '<p class="text-sm text-slate-400 py-2">Sin resultados</p>';
    } else {
      resultsEl.innerHTML = matches.slice(0, 8).map(m => {
        const slug = m.article.file.replace('.md', '');
        return `<a href="#${m.section}/${slug}">${m.article.label} <span class="text-xs text-slate-500">(${this.sections[m.section].label})</span></a>`;
      }).join('');
    }
    resultsEl.classList.remove('hidden');
  },
};
