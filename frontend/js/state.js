// Centralized App State
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
        this.currency = user.currency || 'DT';
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
    if (this.dashboardStats) {
      const stCountEl = document.getElementById('sidebar-students-count');
      if (stCountEl) stCountEl.innerText = this.dashboardStats.total_students || 0;

      const grpCountEl = document.getElementById('sidebar-groups-count');
      if (grpCountEl) grpCountEl.innerText = this.dashboardStats.total_groups || 0;

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
          const parts = (this.user.name || 'P M').trim().split(/\s+/);
          const initials = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
          avatarContainer.innerHTML = `<span id="user-initials">${initials}</span>`;
        }
      }

      const userNameEl = document.getElementById('user-display-name');
      if (userNameEl) userNameEl.innerText = this.user.name || 'Professeur';
      const userMenuName = document.getElementById('user-menu-name');
      if (userMenuName) userMenuName.innerText = this.user.name || 'Professeur';
      const userMenuEmail = document.getElementById('user-menu-email');
      if (userMenuEmail) userMenuEmail.innerText = this.user.email || '';

      const schoolYearEl = document.getElementById('sidebar-school-year');
      if (schoolYearEl) schoolYearEl.innerText = `Année ${this.user.school_year || '2025-2026'}`;
      const currencyLabelEl = document.getElementById('sidebar-currency-label');
      if (currencyLabelEl) {
        const currName = this.user.currency === 'DT' ? 'Dinar Tunisien (DT)' :
                         this.user.currency === '€' ? 'Euro (€)' :
                         this.user.currency === '$' ? 'Dollar ($)' :
                         this.user.currency === 'MAD' ? 'Dirham Marocain (MAD)' :
                         this.user.currency === 'DZD' ? 'Dinar Algérien (DZD)' :
                         this.user.currency || 'DT';
        currencyLabelEl.innerText = `Devise : ${currName}`;
      }
    }
  }
};
