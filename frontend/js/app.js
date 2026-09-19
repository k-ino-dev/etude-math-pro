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

  openQuickActionMenu() {
    const quickMenu = document.getElementById('quick-action-menu');
    if (quickMenu) {
      quickMenu.classList.toggle('hidden');
    } else {
      this.openNewSessionModal();
    }
  },

  async openNewSessionModal(defaultDate = null, defaultDayIdx = null) {
    const groups = State.groups || [];
    const isAr = I18n.currentLang === 'ar';
    const weekdaysFr = [
      { name: 'Lundi', short: 'Lu', dayIndex: 1 },
      { name: 'Mardi', short: 'Ma', dayIndex: 2 },
      { name: 'Mercredi', short: 'Me', dayIndex: 3 },
      { name: 'Jeudi', short: 'Je', dayIndex: 4 },
      { name: 'Vendredi', short: 'Ve', dayIndex: 5 },
      { name: 'Samedi', short: 'Sa', dayIndex: 6 },
      { name: 'Dimanche', short: 'Di', dayIndex: 0 }
    ];
    const weekdaysAr = [
      { name: 'الإثنين', short: 'إثن', dayIndex: 1 },
      { name: 'الثلاثاء', short: 'ثلا', dayIndex: 2 },
      { name: 'الأربعاء', short: 'أرب', dayIndex: 3 },
      { name: 'الخميس', short: 'خمي', dayIndex: 4 },
      { name: 'الجمعة', short: 'جمع', dayIndex: 5 },
      { name: 'السبت', short: 'سبت', dayIndex: 6 },
      { name: 'الأحد', short: 'أحد', dayIndex: 0 }
    ];
    const weekdays = isAr ? weekdaysAr : weekdaysFr;

    const initialDate = defaultDate ? new Date(defaultDate) : new Date();
    // If explicit day index is passed (e.g., from planning column click), convert Monday=0..Sunday=6 index to JS getDay()
    let initialDayIndex = initialDate.getDay();
    if (defaultDayIdx !== null && defaultDayIdx !== undefined) {
      // If defaultDayIdx is 0..6 (Mon..Sun from planning board)
      initialDayIndex = defaultDayIdx === 6 ? 0 : defaultDayIdx + 1;
    }

    // Helper to calculate exact date corresponding to selected weekday within current/selected week
    function getDateForWeekday(targetDayIndex, baseDate) {
      const base = new Date(baseDate);
      const curDay = base.getDay(); // 0 is Sunday, 1 is Monday...
      const diffToMonday = (curDay === 0 ? -6 : 1) - curDay;
      const monday = new Date(base);
      monday.setDate(base.getDate() + diffToMonday);

      const offsetFromMon = targetDayIndex === 0 ? 6 : targetDayIndex - 1;
      const target = new Date(monday);
      target.setDate(monday.getDate() + offsetFromMon);
      return target;
    }

    Modal.open({
      title: `+ ${I18n.t('add_session')}`,
      size: 'max-w-lg',
      html: `
        <form id="session-form" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${isAr ? 'الفوج المعني *' : 'Groupe concerné *'}</label>
            <select id="sess-group-id" required class="w-full px-3.5 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 bg-white font-semibold text-slate-900">
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

          <!-- Weekday Selection (Strict Calendar Sync) -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${isAr ? 'يوم الحصة (من الإثنين إلى الأحد) *' : 'Jour de la semaine *'}</label>
            <div class="grid grid-cols-7 gap-1.5" id="sess-weekday-selector">
              ${weekdays.map(w => {
                const isSelected = w.dayIndex === initialDayIndex;
                return `
                  <button type="button" class="weekday-pill ${isSelected ? 'active' : ''}" data-day="${w.dayIndex}" data-name="${w.name}">
                    <span class="text-[10px] uppercase font-bold">${w.short}</span>
                  </button>
                `;
              }).join('')}
            </div>

            <!-- Auto-Assigned Date Indicator -->
            <div class="mt-2 p-2.5 bg-[#faf8f5] rounded-xl border border-[#ede7db] flex items-center justify-between text-xs">
              <span class="text-slate-500 font-medium flex items-center gap-1.5">
                <svg class="w-4 h-4 text-[#c5a059]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                ${isAr ? 'التاريخ المحدد للحصة :' : 'Date calculée de la séance :'}
              </span>
              <strong class="text-slate-900 font-bold bg-white px-2.5 py-1 rounded-lg border border-[#e8dfd1] shadow-2xs" id="sess-auto-date-badge">---</strong>
            </div>

            <!-- Hidden Input Holding the Auto-calculated Date Value -->
            <input id="sess-date" type="hidden" required value="${initialDate.toISOString().split('T')[0]}">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${isAr ? 'وقت البداية *' : 'Heure de début *'}</label>
              <input id="sess-start" type="time" required value="17:00" class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 font-bold">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${isAr ? 'وقت النهاية *' : 'Heure de fin *'}</label>
              <input id="sess-end" type="time" required value="18:30" class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 font-bold">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${isAr ? 'الموضوع / الدرس' : 'Sujet / Chapitre prévu'}</label>
            <input id="sess-topic" type="text" placeholder="${isAr ? 'مثال: الدوال اللوغاريتمية، المتتاليات...' : 'ex: Fonctions exponentielles, Théorème de Thalès...'}" class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 font-medium">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${isAr ? 'المكان / القاعة' : 'Lieu / Salle'}</label>
              <input id="sess-location" type="text" value="Salle 1" class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 font-medium">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${isAr ? 'الحالة' : 'Statut'}</label>
              <select id="sess-status" class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 bg-white font-medium">
                <option value="scheduled" selected>${isAr ? 'مبرمجة' : 'Programmée'}</option>
                <option value="completed">${isAr ? 'مكتملة' : 'Terminée'}</option>
                <option value="cancelled">${isAr ? 'ملغاة' : 'Annulée'}</option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-[#ede7db]">
            <button type="button" onclick="Modal.close()" class="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-[#ede5d8] rounded-2xl transition-colors">
              ${isAr ? 'إلغاء' : 'Annuler'}
            </button>
            <button type="submit" class="px-5 py-2.5 btn-gold-action text-xs sm:text-sm font-black">
              ${isAr ? 'تأكيد البرمجة' : 'Planifier la séance'}
            </button>
          </div>
        </form>
      `,
      onOpen: (content) => {
        const dateInput = content.querySelector('#sess-date');
        const autoDateBadge = content.querySelector('#sess-auto-date-badge');
        const weekdayButtons = content.querySelectorAll('#sess-weekday-selector .weekday-pill');

        function updateSelectedDate(dayIndex, dayName) {
          const calculatedDate = getDateForWeekday(dayIndex, initialDate);
          const yyyy = calculatedDate.getFullYear();
          const mm = String(calculatedDate.getMonth() + 1).padStart(2, '0');
          const dd = String(calculatedDate.getDate()).padStart(2, '0');
          const dateStr = `${yyyy}-${mm}-${dd}`;
          dateInput.value = dateStr;

          const locale = isAr ? 'ar-TN' : 'fr-FR';
          const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
          autoDateBadge.innerText = calculatedDate.toLocaleDateString(locale, options);
        }

        // Initialize display
        const activeBtn = content.querySelector('#sess-weekday-selector .weekday-pill.active') || weekdayButtons[0];
        if (activeBtn) {
          const dIdx = parseInt(activeBtn.getAttribute('data-day'));
          const dName = activeBtn.getAttribute('data-name');
          updateSelectedDate(dIdx, dName);
        }

        weekdayButtons.forEach(btn => {
          btn.addEventListener('click', () => {
            weekdayButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const dIdx = parseInt(btn.getAttribute('data-day'));
            const dName = btn.getAttribute('data-name');
            updateSelectedDate(dIdx, dName);
          });
        });

        const form = content.querySelector('#session-form');
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const payload = {
            group_id: parseInt(content.querySelector('#sess-group-id').value),
            date: dateInput.value,
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

// Auto-initialize application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}
