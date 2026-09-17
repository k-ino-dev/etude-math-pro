// Navbar & Global Search Component with I18n
const Navbar = {
  searchModal: null,
  searchInput: null,
  searchResults: null,

  init() {
    this.searchModal = document.getElementById('search-modal');
    this.searchInput = document.getElementById('global-search-input');
    this.searchResults = document.getElementById('global-search-results');

    // Quick action dropdown
    const quickBtn = document.getElementById('quick-action-btn');
    const quickMenu = document.getElementById('quick-action-menu');
    if (quickBtn && quickMenu) {
      quickBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        quickMenu.classList.toggle('hidden');
      });
      document.addEventListener('click', () => quickMenu.classList.add('hidden'));
    }

    // User profile dropdown
    const userBtn = document.getElementById('user-menu-btn');
    const userMenu = document.getElementById('user-menu-dropdown');
    if (userBtn && userMenu) {
      userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenu.classList.toggle('hidden');
      });
      document.addEventListener('click', () => userMenu.classList.add('hidden'));
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => app.logout());
    }
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
    if (mobileLogoutBtn) {
      mobileLogoutBtn.addEventListener('click', () => app.logout());
    }

    // Global Search trigger buttons
    const searchTrigger = document.getElementById('global-search-trigger');
    const mobileSearchBtn = document.getElementById('mobile-search-btn');
    if (searchTrigger) searchTrigger.addEventListener('click', () => this.openSearch());
    if (mobileSearchBtn) mobileSearchBtn.addEventListener('click', () => this.openSearch());

    const searchBackdrop = document.getElementById('search-backdrop');
    if (searchBackdrop) searchBackdrop.addEventListener('click', () => this.closeSearch());

    // Shortcut: Ctrl+K or Cmd+K
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openSearch();
      }
      if (e.key === 'Escape' && this.searchModal && !this.searchModal.classList.contains('hidden')) {
        this.closeSearch();
      }
    });

    // Real-time search debounce
    let debounceTimer;
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const q = e.target.value.trim();
        if (!q) {
          this.searchResults.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">${I18n.t('searchPlaceholder')}</p>`;
          return;
        }
        debounceTimer = setTimeout(() => this.performSearch(q), 200);
      });
    }
  },

  openSearch() {
    if (!this.searchModal) return;
    this.searchModal.classList.remove('hidden');
    if (this.searchInput) {
      this.searchInput.value = '';
      this.searchInput.placeholder = I18n.t('searchPlaceholder');
      this.searchInput.focus();
    }
    if (this.searchResults) {
      this.searchResults.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">${I18n.t('searchPlaceholder')}</p>`;
    }
    if (window.lucide) lucide.createIcons();
  },

  closeSearch() {
    if (!this.searchModal) return;
    this.searchModal.classList.add('hidden');
  },

  async performSearch(q) {
    try {
      this.searchResults.innerHTML = `<p class="text-xs text-slate-400 text-center py-6 animate-pulse">${I18n.t('loading')}</p>`;
      const res = await API.get(`/api/search?q=${encodeURIComponent(q)}`);
      
      const { students, groups, sessions, total_matches } = res.results;
      if (total_matches === 0) {
        this.searchResults.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">${I18n.currentLang === 'ar' ? 'لم يتم العثور على نتائج لـ' : 'Aucun résultat trouvé pour'} "${q}".</p>`;
        return;
      }

      let html = '';

      // Students
      if (students.length > 0) {
        html += `<div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">${I18n.t('navStudents')} (${students.length})</div>`;
        students.forEach(s => {
          const badgeLvl = I18n.getLevelLabel(s.badge);
          html += `
            <a href="#students/${s.id}" onclick="Navbar.closeSearch()" class="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                  ${s.title.charAt(0)}
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-900">${s.title}</p>
                  <p class="text-xs text-slate-500">${s.subtitle}</p>
                </div>
              </div>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">${badgeLvl}</span>
            </a>
          `;
        });
      }

      // Groups
      if (groups.length > 0) {
        html += `<div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mt-2">${I18n.t('navGroups')} (${groups.length})</div>`;
        groups.forEach(g => {
          html += `
            <a href="#groups" onclick="Navbar.closeSearch()" class="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  <i data-lucide="users" class="w-4 h-4"></i>
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-900">${g.title}</p>
                  <p class="text-xs text-slate-500">${g.subtitle}</p>
                </div>
              </div>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">${g.badge}</span>
            </a>
          `;
        });
      }

      // Sessions
      if (sessions.length > 0) {
        html += `<div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mt-2">${I18n.t('navPlanning')} (${sessions.length})</div>`;
        sessions.forEach(sess => {
          html += `
            <a href="#planning" onclick="Navbar.closeSearch()" class="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  <i data-lucide="calendar" class="w-4 h-4"></i>
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-900">${sess.title}</p>
                  <p class="text-xs text-slate-500">${sess.subtitle}</p>
                </div>
              </div>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">${sess.badge}</span>
            </a>
          `;
        });
      }

      this.searchResults.innerHTML = html;
      if (window.lucide) lucide.createIcons();
    } catch (err) {
      this.searchResults.innerHTML = `<p class="text-xs text-rose-500 text-center py-6">Erreur lors de la recherche.</p>`;
    }
  }
};
