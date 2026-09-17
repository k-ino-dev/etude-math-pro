// MathsProf SPA Router & Orchestrator — 2026 SaaS Commercial Edition
const app = {
  mainContainer: null,
  appShell: null,
  loginContainer: null,

  init() {
    this.mainContainer = document.getElementById('main-view');
    this.appShell = document.getElementById('app');
    this.loginContainer = document.getElementById('login-container');

    // Initialize Global Components
    Toast.init();
    Modal.init();
    Navbar.init();
    Sidebar.init();

    // Listen to hash changes
    window.addEventListener('hashchange', () => this.handleRoute());

    // Multi-Device Auto-Sync: Refresh state when tab is focused or becomes visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && API.isAuthenticated()) {
        State.loadInitialData();
      }
    });

    window.addEventListener('focus', () => {
      if (API.isAuthenticated()) {
        State.loadInitialData();
      }
    });

    // Periodic background sync every 30 seconds when active
    setInterval(() => {
      if (document.visibilityState === 'visible' && API.isAuthenticated()) {
        State.loadInitialData();
      }
    }, 30000);

    // Initial routing
    this.handleRoute();
  },

  async handleRoute() {
    const hash = window.location.hash || '#dashboard';
    const isAuth = API.isAuthenticated();

    if (!isAuth && hash !== '#login') {
      this.showLogin();
      return;
    }

    if (isAuth && hash === '#login') {
      window.location.hash = '#dashboard';
      return;
    }

    if (isAuth) {
      this.showApp();
      // Ensure initial state is loaded
      if (!State.user) {
        await State.loadInitialData();
      }
    }

    Sidebar.setActiveRoute(hash);

    // Route dispatch
    if (hash === '#login') {
      this.showLogin();
    } else if (hash === '#dashboard' || hash === '' || hash === '#') {
      DashboardView.render(this.mainContainer);
    } else if (hash.startsWith('#students/')) {
      const studentId = parseInt(hash.replace('#students/', ''));
      StudentDetailView.render(this.mainContainer, studentId);
    } else if (hash === '#students') {
      StudentsView.render(this.mainContainer);
    } else if (hash === '#groups') {
      GroupsView.render(this.mainContainer);
    } else if (hash === '#repartition') {
      RepartitionView.render(this.mainContainer);
    } else if (hash === '#planning') {
      PlanningView.render(this.mainContainer);
    } else if (hash.startsWith('#attendance')) {
      const sessionId = hash.includes('/') ? hash.split('/')[1] : null;
      AttendanceView.render(this.mainContainer, sessionId);
    } else if (hash === '#payments') {
      PaymentsView.render(this.mainContainer);
    } else if (hash.startsWith('#settings')) {
      SettingsView.render(this.mainContainer);
    } else {
      DashboardView.render(this.mainContainer);
    }

    window.scrollTo(0, 0);
  },

  showToast(message, type = 'info') {
    if (type === 'success') Toast.success(message);
    else if (type === 'error') Toast.error(message);
    else if (type === 'warning') Toast.warning(message);
    else Toast.info(message);
  },

  showLogin() {
    this.appShell.classList.add('hidden');
    this.loginContainer.classList.remove('hidden');
    LoginView.render(this.loginContainer);
  },

  showApp() {
    this.loginContainer.classList.add('hidden');
    this.appShell.classList.remove('hidden');
  },

  logout() {
    API.setToken(null);
    API.setUser(null);
    State.user = null;
    Toast.info(I18n.currentLang === 'ar' ? 'تم تسجيل الخروج بنجاح.' : 'Vous êtes déconnecté.');
    window.location.hash = '#login';
  },

  navigate(route) {
    window.location.hash = route;
  },

  // Modal shortcuts
  openNewStudentModal() {
    StudentsView.openModal();
  },

  openNewGroupModal() {
    GroupsView.openModal();
  },

  async openNewSessionModal(defaultDate = null) {
    const groups = State.groups || [];
    const dateVal = defaultDate || new Date().toISOString().split('T')[0];
    const isAr = I18n.currentLang === 'ar';

    Modal.open({
      title: `+ ${I18n.t('add_session')}`,
      size: 'max-w-lg',
      html: `
        <form id="session-form" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${isAr ? 'الفوج المعني *' : 'Groupe concerné *'}</label>
            <select id="sess-group-id" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 bg-white font-semibold">
              <option value="">-- ${isAr ? 'اختر الفوج' : 'Choisir un groupe'} --</option>
              ${groups.map(g => {
                const levelLabel = I18n.getLevelLabel(g.level);
                return `
                  <option value="${g.id}">
                    ${g.name} (${levelLabel} • ${g.student_count || 0} ${I18n.t('students')})
                  </option>
                `;
              }).join('')}
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${isAr ? 'تاريخ الحصة *' : 'Date de la séance *'}</label>
            <input id="sess-date" type="date" required value="${dateVal}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${isAr ? 'وقت البداية *' : 'Heure de début *'}</label>
              <input id="sess-start" type="time" required value="17:00" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-bold">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${isAr ? 'وقت النهاية *' : 'Heure de fin *'}</label>
              <input id="sess-end" type="time" required value="18:30" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-bold">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${isAr ? 'الموضوع / الدرس' : 'Sujet / Chapitre prévu'}</label>
            <input id="sess-topic" type="text" placeholder="${isAr ? 'مثال: الدوال اللوغاريتمية، المتتاليات...' : 'ex: Fonctions exponentielles, Théorème de Thalès...'}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${isAr ? 'المكان / القاعة' : 'Lieu / Salle'}</label>
              <input id="sess-location" type="text" value="Salle 1" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${isAr ? 'الحالة' : 'Statut'}</label>
              <select id="sess-status" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 bg-white">
                <option value="scheduled" selected>${isAr ? 'مبرمجة' : 'Programmée'}</option>
                <option value="completed">${isAr ? 'مكتملة' : 'Terminée'}</option>
                <option value="cancelled">${isAr ? 'ملغاة' : 'Annulée'}</option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" onclick="Modal.close()" class="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
              ${isAr ? 'إلغاء' : 'Annuler'}
            </button>
            <button type="submit" class="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-600/20">
              ${isAr ? 'تأكيد البرمجة' : 'Planifier la séance'}
            </button>
          </div>
        </form>
      `,
      onOpen: (content) => {
        const form = content.querySelector('#session-form');
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const payload = {
            group_id: parseInt(content.querySelector('#sess-group-id').value),
            date: content.querySelector('#sess-date').value,
            start_time: content.querySelector('#sess-start').value,
            end_time: content.querySelector('#sess-end').value,
            topic: content.querySelector('#sess-topic').value.trim() || null,
            location: content.querySelector('#sess-location').value.trim() || 'Salle 1',
            status: content.querySelector('#sess-status').value,
            force: false
          };

          try {
            await API.post('/api/sessions', payload);
            Toast.success(isAr ? 'تمت برمجة الحصة بنجاح !' : 'Séance planifiée avec succès !');
            Modal.close();
            await State.loadInitialData();
            app.navigate('#planning');
          } catch (err) {
            // Check if conflict error
            if (err.message && err.message.toLowerCase().includes('conflit')) {
              Modal.confirm({
                title: isAr ? "تم اكتشاف تعارض في التوقيت" : "Conflit d'horaire détecté",
                message: isAr ? `${err.message}. هل ترغب في فرض إضافة هذه الحصة رغم التعارض ؟` : `${err.message}. Souhaitez-vous quand même forcer la création de cette séance ?`,
                confirmText: isAr ? "نعم، فرض الحصة" : "Oui, forcer la séance",
                cancelText: isAr ? "تعديل التوقيت" : "Modifier les horaires",
                onConfirm: async () => {
                  try {
                    payload.force = true;
                    await API.post('/api/sessions', payload);
                    Toast.warning(isAr ? 'تمت إضافة الحصة رغم التعارض.' : 'Séance créée malgré le conflit d\'horaire.');
                    Modal.close();
                    await State.loadInitialData();
                    app.navigate('#planning');
                  } catch (e2) {
                    Toast.error(e2.message);
                  }
                }
              });
            } else {
              Toast.error(err.message);
            }
          }
        });
      }
    });
  },

  openNewPaymentModal(preSelectedStudentId = null) {
    PaymentsView.openModal(preSelectedStudentId);
  }
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
