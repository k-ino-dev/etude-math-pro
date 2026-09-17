// Centralized App State for MathsProf
const State = {
  user: null,
  students: [],
  groups: [],
  sessions: [],
  dashboardStats: null,
  currency: 'DT',
  listeners: [],

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  notify() {
    this.listeners.forEach(listener => listener(this));
  },

  async loadInitialData() {
    try {
      const [user, groups, stats] = await Promise.all([
        API.get('/api/auth/me').catch(() => null),
        API.get('/api/groups').catch(() => []),
        API.get('/api/dashboard/stats').catch(() => null),
      ]);

      if (user) {
        this.user = user;
        this.currency = 'DT'; // Strictly DT everywhere
        API.setUser(user);
      }
      this.groups = groups || [];
      this.dashboardStats = stats;

      this.updateBadges();
      this.notify();
    } catch (e) {
      console.warn('Initial data load error:', e);
    }
  },

  updateBadges() {
    const isAr = window.I18n && I18n.currentLang === 'ar';

    if (this.dashboardStats) {
      const stCountEl = document.getElementById('sidebar-students-count');
      if (stCountEl) stCountEl.innerText = this.dashboardStats.total_students || 0;
      const mobStCountEl = document.getElementById('mobile-students-count');
      if (mobStCountEl) mobStCountEl.innerText = this.dashboardStats.total_students || 0;

      const grpCountEl = document.getElementById('sidebar-groups-count');
      if (grpCountEl) grpCountEl.innerText = this.dashboardStats.total_groups || 0;
      const mobGrpCountEl = document.getElementById('mobile-groups-count');
      if (mobGrpCountEl) mobGrpCountEl.innerText = this.dashboardStats.total_groups || 0;

      const payBadge = document.getElementById('sidebar-pending-payments-badge');
      if (payBadge) {
        const count = this.dashboardStats.pending_payments_count || 0;
        payBadge.innerText = count;
        payBadge.classList.toggle('hidden', count === 0);
      }
    }

    if (this.user) {
      const avatarContainer = document.getElementById('user-avatar-container');
      if (avatarContainer) {
        if (this.user.avatar && (this.user.avatar.startsWith('data:image') || this.user.avatar.startsWith('http') || this.user.avatar.startsWith('/'))) {
          avatarContainer.innerHTML = `<img src="${this.user.avatar}" class="w-full h-full object-cover" alt="${this.user.name || 'Avatar'}">`;
        } else {
          const parts = (this.user.name || 'Enseignant').trim().split(/\s+/);
          const initials = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
          avatarContainer.innerHTML = `<span id="user-initials">${initials}</span>`;
        }
      }

      const defaultName = isAr ? 'الأستاذ' : 'Enseignant';
      const userNameEl = document.getElementById('user-display-name');
      if (userNameEl) userNameEl.innerText = this.user.name || defaultName;
      const userMenuName = document.getElementById('user-menu-name');
      if (userMenuName) userMenuName.innerText = this.user.name || defaultName;
      const userMenuEmail = document.getElementById('user-menu-email');
      if (userMenuEmail) userMenuEmail.innerText = this.user.email || '';

      const schoolYearEl = document.getElementById('sidebar-school-year');
      if (schoolYearEl) {
        schoolYearEl.innerText = isAr ? `السنة ${this.user.school_year || '2025-2026'}` : `Année ${this.user.school_year || '2025-2026'}`;
      }
      const currencyLabelEl = document.getElementById('sidebar-currency-label');
      if (currencyLabelEl) {
        currencyLabelEl.innerText = isAr ? 'العملة : الدينار التونسي (د.ت)' : 'Devise : Dinar Tunisien (DT)';
      }
    }

    // Refresh Sidebar static labels based on active language
    if (window.I18n) {
      const navLabels = {
        'nav-label-dashboard': I18n.t('navDashboard'),
        'nav-label-students': I18n.t('navStudents'),
        'nav-label-groups': I18n.t('navGroups'),
        'nav-label-repartition': I18n.t('navRepartition'),
        'nav-label-planning': I18n.t('navPlanning'),
        'nav-label-attendance': I18n.t('navAttendance'),
        'nav-label-payments': I18n.t('navPayments'),
        'nav-label-settings': I18n.t('navSettings'),
        'mobile-label-dashboard': I18n.t('navDashboard'),
        'mobile-label-students': I18n.t('navStudents'),
        'mobile-label-groups': I18n.t('navGroups'),
        'mobile-label-repartition': I18n.t('navRepartition'),
        'mobile-label-planning': I18n.t('navPlanning'),
        'mobile-label-attendance': I18n.t('navAttendance'),
        'mobile-label-payments': I18n.t('navPayments'),
        'mobile-label-settings': I18n.t('navSettings'),
        'bottom-label-dashboard': I18n.t('navDashboard'),
        'bottom-label-students': I18n.t('navStudents'),
        'bottom-label-groups': I18n.t('navGroups'),
        'bottom-label-planning': I18n.t('navPlanning'),
        'bottom-label-payments': I18n.t('navPayments'),
        'nav-app-subtitle': I18n.t('appSubtitle'),
        'nav-search-placeholder': I18n.t('searchPlaceholder'),
        'nav-quick-action-text': I18n.t('quickAction')
      };

      for (const [id, txt] of Object.entries(navLabels)) {
        const el = document.getElementById(id);
        if (el) el.innerText = txt;
      }

      document.querySelectorAll('.i18n-text').forEach(el => {
        const k = el.getAttribute('data-key');
        if (k) el.innerText = I18n.t(k);
      });
    }
  }
};

// Re-update badges when language changes
if (window.I18n) {
  I18n.subscribe(() => State.updateBadges());
}
