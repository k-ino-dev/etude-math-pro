// Dashboard View — 2026 Commercial Edition (Étude Math Pro)
const DashboardView = {
  async render(container) {
    const isAr = I18n.currentLang === 'ar';

    container.innerHTML = `
      <div class="space-y-6 sm:space-y-8 animate-fade-in">

        <!-- Welcome Header & Date Banner -->
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-7 sm:p-9 text-white shadow-2xl shadow-slate-900/20">
          <!-- Math grid overlay -->
          <div class="absolute inset-0" style="background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 44px 44px;"></div>
          <!-- Glow accents -->
          <div class="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-20 -left-10 w-48 h-48 bg-violet-600/15 rounded-full blur-3xl pointer-events-none"></div>
          <!-- Large math symbols (decorative) -->
          <div class="absolute right-8 top-1/2 -translate-y-1/2 rtl:right-auto rtl:left-8 text-white/[0.04] font-serif text-[120px] font-black select-none pointer-events-none leading-none">∫</div>
          <div class="absolute right-32 bottom-4 rtl:right-auto rtl:left-32 text-white/[0.03] font-serif text-5xl font-black select-none pointer-events-none">dx</div>

          <div class="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-semibold text-indigo-200 mb-4">
                <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-300"></i>
                ${I18n.t('teacherSpace')}
              </div>
              <h1 class="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                ${I18n.t('helloTeacher')}, <span id="dash-teacher-name" class="text-indigo-300">Professeur</span> 👋
              </h1>
              <p class="text-sm text-slate-300 mt-2 font-medium">${I18n.t('dashWelcome')}</p>
            </div>
            <div class="shrink-0">
              <div class="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl text-right rtl:text-left">
                <p class="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">${I18n.t('today')}</p>
                <p class="text-sm font-bold text-white capitalize" id="dash-current-date"></p>
              </div>
            </div>
          </div>
        </div>

        <!-- 6 Main KPI Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4" id="dash-kpi-grid">
          <!-- Loading Skeletons -->
          <div class="skeleton h-28 rounded-2xl"></div>
          <div class="skeleton h-28 rounded-2xl"></div>
          <div class="skeleton h-28 rounded-2xl"></div>
          <div class="skeleton h-28 rounded-2xl"></div>
          <div class="skeleton h-28 rounded-2xl"></div>
          <div class="skeleton h-28 rounded-2xl"></div>
        </div>

        <!-- Quick Action Buttons -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <button onclick="app.openNewStudentModal()" class="flex items-center gap-3 p-4 sm:p-5 rounded-2xl bg-white hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group text-left rtl:text-right">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-100 transition-all shrink-0">
              <i data-lucide="user-plus" class="w-5 h-5"></i>
            </div>
            <div>
              <p class="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">${I18n.t('newStudent')}</p>
              <p class="text-[11px] text-slate-500 hidden sm:block mt-0.5">${I18n.t('registerStudentDesc')}</p>
            </div>
          </button>

          <button onclick="app.openNewGroupModal()" class="flex items-center gap-3 p-4 sm:p-5 rounded-2xl bg-white hover:bg-violet-50 border border-slate-200/80 hover:border-violet-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group text-left rtl:text-right">
            <div class="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-violet-100 transition-all shrink-0">
              <i data-lucide="users" class="w-5 h-5"></i>
            </div>
            <div>
              <p class="text-sm font-bold text-slate-900 group-hover:text-violet-700 transition-colors">${I18n.t('newGroup')}</p>
              <p class="text-[11px] text-slate-500 hidden sm:block mt-0.5">${I18n.t('createGroupDesc')}</p>
            </div>
          </button>

          <button onclick="app.openNewSessionModal()" class="flex items-center gap-3 p-4 sm:p-5 rounded-2xl bg-white hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group text-left rtl:text-right">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-100 transition-all shrink-0">
              <i data-lucide="calendar-plus" class="w-5 h-5"></i>
            </div>
            <div>
              <p class="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">${I18n.t('newSession')}</p>
              <p class="text-[11px] text-slate-500 hidden sm:block mt-0.5">${I18n.t('planSessionDesc')}</p>
            </div>
          </button>

          <button onclick="app.openNewPaymentModal()" class="flex items-center gap-3 p-4 sm:p-5 rounded-2xl bg-white hover:bg-amber-50 border border-slate-200/80 hover:border-amber-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group text-left rtl:text-right">
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-100 transition-all shrink-0">
              <i data-lucide="credit-card" class="w-5 h-5"></i>
            </div>
            <div>
              <p class="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">${I18n.t('recordPayment')}</p>
              <p class="text-[11px] text-slate-500 hidden sm:block mt-0.5">${I18n.t('collectMonthlyDesc')}</p>
            </div>
          </button>
        </div>

        <!-- Alerts Section -->
        <div id="dash-alerts-container" class="space-y-3 hidden">
          <!-- Injected dynamically -->
        </div>

        <!-- 2 Column Layout: Today's Planning & Revenue Overview -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Today's Planning (2 Columns) -->
          <div class="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/70 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <i data-lucide="calendar" class="w-5 h-5"></i>
                </div>
                <div>
                  <h2 class="text-base font-bold text-slate-900">${I18n.t('todayPlanning')}</h2>
                  <p class="text-xs text-slate-500">${I18n.t('scheduledSessionsForDay')}</p>
                </div>
              </div>
              <a href="#planning" class="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
                ${I18n.t('viewFullSchedule')} <i data-lucide="arrow-right" class="w-3.5 h-3.5 rtl:rotate-180"></i>
              </a>
            </div>

            <!-- Sessions List -->
            <div id="dash-today-sessions" class="space-y-3 pt-2">
              <!-- Rendered dynamically -->
            </div>
          </div>

          <!-- Right Column: Next Session & Tomorrow PDF & Smart Repartition -->
          <div class="space-y-6">

            <!-- Next Upcoming Session Card -->
            <div class="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-600/25 relative overflow-hidden" id="dash-next-session-card">
              <!-- Subtle dot-grid pattern overlay -->
              <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px); background-size: 20px 20px;"></div>
              <!-- Glow accent -->
              <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
              <div class="relative z-10 flex items-center justify-between mb-4">
                <span class="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur px-2.5 py-1 rounded-full border border-white/10">${I18n.t('nextSession')}</span>
                <i data-lucide="clock" class="w-4 h-4 text-indigo-200"></i>
              </div>
              <div id="dash-next-session-content" class="relative z-10">
                <p class="text-xs text-indigo-200">${I18n.t('loading')}</p>
              </div>
            </div>

            <!-- Tomorrow's Planning Card (Daily PDF Export) -->
            <div class="bg-gradient-to-br from-indigo-50/80 to-violet-50/60 border border-indigo-200/60 rounded-3xl p-6 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-indigo-950 font-bold text-sm">
                  <i data-lucide="calendar" class="w-4 h-4 text-indigo-600"></i>
                  ${I18n.t('tomorrowSchedule')}
                </div>
                <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200/50">PDF</span>
              </div>

              <p class="text-xs text-indigo-900/80 leading-relaxed">
                ${I18n.t('exportScheduleDesc')}
              </p>

              <div class="pt-1">
                <a href="/api/reports/daily/tomorrow/pdf" target="_blank" class="w-full py-2.5 px-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm shadow-indigo-600/25 transition-all flex items-center justify-center gap-2">
                  <i data-lucide="file-text" class="w-4 h-4"></i>
                  <span>${I18n.t('downloadTomorrowPdf')}</span>
                </a>
              </div>
            </div>

            <!-- Smart Auto-Balancing Promo Card -->
            <div class="bg-gradient-to-br from-amber-50 to-orange-50/80 border border-amber-200/60 rounded-3xl p-6 space-y-3">
              <div class="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <div class="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <i data-lucide="sparkles" class="w-4 h-4 text-amber-600"></i>
                </div>
                ${I18n.t('smartRepartitionTitle')}
              </div>
              <p class="text-xs text-amber-800/90 leading-relaxed">
                ${I18n.t('smartRepartitionDesc')}
              </p>
              <a href="#repartition" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold shadow-sm shadow-amber-500/25 transition-all">
                ${I18n.t('launchRepartition')} <i data-lucide="arrow-right" class="w-3.5 h-3.5 rtl:rotate-180"></i>
              </a>
            </div>

          </div>

        </div>

      </div>
    `;

    if (window.lucide) lucide.createIcons();

    // Set formatted localized date
    const dateEl = container.querySelector('#dash-current-date');
    if (dateEl) {
      const locale = I18n.currentLang === 'ar' ? 'ar-TN' : 'fr-FR';
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      dateEl.innerText = new Date().toLocaleDateString(locale, options);
    }

    await this.loadData(container);
  },

  async loadData(container) {
    try {
      const stats = await API.get('/api/dashboard/stats');
      State.dashboardStats = stats;
      State.updateBadges();

      const user = State.user || API.getUser();
      const teacherNameEl = container.querySelector('#dash-teacher-name');
      if (teacherNameEl && user) {
        teacherNameEl.innerText = user.name || (I18n.currentLang === 'ar' ? 'أستاذ' : 'Professeur');
      }

      const currency = 'DT';

      // 1. Render 6 KPIs
      const kpiGrid = container.querySelector('#dash-kpi-grid');
      if (kpiGrid) {
        kpiGrid.innerHTML = `
          <!-- Total Élèves -->
          <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 relative overflow-hidden group">
            <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
            <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
              <i data-lucide="graduation-cap" class="w-5 h-5 text-indigo-600"></i>
            </div>
            <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">${I18n.t('totalStudents')}</p>
            <p class="text-3xl font-black text-slate-900 tabular-nums">${stats.total_students}</p>
            <div class="absolute -bottom-3 -right-3 w-14 h-14 rounded-full bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          <!-- Total Groupes -->
          <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 relative overflow-hidden group">
            <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500"></div>
            <div class="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
              <i data-lucide="users" class="w-5 h-5 text-violet-600"></i>
            </div>
            <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">${I18n.t('totalGroups')}</p>
            <p class="text-3xl font-black text-slate-900 tabular-nums">${stats.total_groups}</p>
            <div class="absolute -bottom-3 -right-3 w-14 h-14 rounded-full bg-violet-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          <!-- Présents Aujourd'hui -->
          <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 relative overflow-hidden group">
            <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
              <i data-lucide="check-circle" class="w-5 h-5 text-emerald-600"></i>
            </div>
            <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">${I18n.t('presentToday')}</p>
            <p class="text-3xl font-black text-emerald-600 tabular-nums">${stats.students_present_today}</p>
            <div class="absolute -bottom-3 -right-3 w-14 h-14 rounded-full bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          <!-- Séances Aujourd'hui -->
          <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 relative overflow-hidden group">
            <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-sky-500"></div>
            <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <i data-lucide="calendar" class="w-5 h-5 text-blue-600"></i>
            </div>
            <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">${I18n.t('sessionsToday')}</p>
            <p class="text-3xl font-black text-slate-900 tabular-nums">${stats.sessions_today}</p>
            <div class="absolute -bottom-3 -right-3 w-14 h-14 rounded-full bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          <!-- Paiements en Attente -->
          <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 relative overflow-hidden group">
            <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500"></div>
            <div class="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center mb-3">
              <i data-lucide="alert-circle" class="w-5 h-5 text-rose-600"></i>
            </div>
            <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">${I18n.t('pendingPayments')}</p>
            <p class="text-3xl font-black text-rose-600 tabular-nums">${stats.pending_payments_count}</p>
            <div class="absolute -bottom-3 -right-3 w-14 h-14 rounded-full bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          <!-- Montant Encaissé ce mois -->
          <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 relative overflow-hidden group">
            <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500"></div>
            <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
              <i data-lucide="coins" class="w-5 h-5 text-amber-600"></i>
            </div>
            <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">${I18n.t('collectedThisMonth')}</p>
            <p class="text-2xl font-black text-slate-900 tabular-nums">${stats.total_collected_this_month} <span class="text-sm font-bold text-slate-500">${I18n.t('currency')}</span></p>
            <div class="absolute -bottom-3 -right-3 w-14 h-14 rounded-full bg-amber-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        `;
      }

      // 2. Alerts Rendering
      const alertsContainer = container.querySelector('#dash-alerts-container');
      if (alertsContainer && stats.recent_alerts && stats.recent_alerts.length > 0) {
        alertsContainer.classList.remove('hidden');
        alertsContainer.innerHTML = stats.recent_alerts.map(a => `
          <div class="flex items-start gap-3 p-4 rounded-2xl ${
            a.type === 'warning' ? 'bg-amber-50 border border-amber-200/70 text-amber-900' :
            a.type === 'danger' ? 'bg-rose-50 border border-rose-200/70 text-rose-900' :
            'bg-indigo-50 border border-indigo-200/70 text-indigo-900'
          }">
            <i data-lucide="${a.icon || 'alert-triangle'}" class="w-5 h-5 shrink-0 mt-0.5"></i>
            <div class="flex-1">
              <p class="text-xs font-bold">${a.title}</p>
              <p class="text-xs opacity-90 mt-0.5">${a.message}</p>
            </div>
            ${a.type === 'warning' ? `<a href="#payments" class="text-xs font-bold underline shrink-0">${I18n.t('viewUnpaid')}</a>` : ''}
          </div>
        `).join('');
      }

      // 3. Today's Sessions List
      const todaySessionsEl = container.querySelector('#dash-today-sessions');
      if (todaySessionsEl) {
        if (!stats.today_sessions || stats.today_sessions.length === 0) {
          todaySessionsEl.innerHTML = `
            <div class="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <i data-lucide="coffee" class="w-8 h-8 text-slate-400 mx-auto mb-2"></i>
              <p class="text-sm font-semibold text-slate-700">${I18n.t('noSessionsToday')}</p>
              <p class="text-xs text-slate-400 mt-0.5">${I18n.t('noSessionsTodayDesc')}</p>
              <button onclick="app.openNewSessionModal()" class="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all">
                + ${I18n.t('newSession')}
              </button>
            </div>
          `;
        } else {
          todaySessionsEl.innerHTML = stats.today_sessions.map(s => {
            const levelLabel = I18n.getLevelLabel(s.level);
            return `
              <div class="p-4 rounded-2xl border ${s.has_conflict ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200/80 bg-slate-50/40'} hover:bg-white hover:border-brand-200 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-start gap-3">
                  <div class="w-12 h-12 rounded-xl bg-brand-100 text-brand-700 flex flex-col items-center justify-center font-black shrink-0">
                    <span class="text-xs">${s.start_time}</span>
                    <span class="text-[10px] text-brand-600 font-normal">🕒 ${s.end_time}</span>
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="text-sm font-bold text-slate-900">${s.group_name}</h3>
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">${levelLabel}</span>
                      ${s.has_conflict ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">⚠️ ${I18n.t('conflictDetected')}</span>` : ''}
                    </div>
                    <p class="text-xs text-slate-600 mt-1">${s.topic || I18n.t('mathLesson')}</p>
                    <p class="text-[11px] text-slate-400 mt-0.5">📍 ${s.location || 'Salle 1'} • 👥 ${s.student_count} ${I18n.t('enrolledStudents')}</p>
                  </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <button onclick="AttendanceView.openForSession(${s.id})" class="px-3.5 py-2 rounded-xl ${s.is_completed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/20'} text-xs font-bold transition-all flex items-center gap-1.5">
                    <i data-lucide="${s.is_completed ? 'check-check' : 'clipboard-check'}" class="w-4 h-4"></i>
                    ${s.is_completed ? `${I18n.t('attendanceTaken')} (${s.attended_count}/${s.student_count})` : I18n.t('takeAttendance')}
                  </button>
                </div>
              </div>
            `;
          }).join('');
        }
      }

      // 4. Next Session Card
      const nextSessionContent = container.querySelector('#dash-next-session-content');
      if (nextSessionContent) {
        if (stats.next_session) {
          const ns = stats.next_session;
          nextSessionContent.innerHTML = `
            <h3 class="text-lg font-black text-white">${ns.group_name}</h3>
            <p class="text-xs text-brand-100 mt-0.5">📚 ${ns.topic || I18n.t('mathLesson')}</p>
            <div class="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <span class="flex items-center gap-1.5">
                <i data-lucide="calendar" class="w-3.5 h-3.5"></i> ${ns.date}
              </span>
              <span class="font-bold bg-white/20 px-2 py-0.5 rounded-md">
                ${ns.start_time} - ${ns.end_time}
              </span>
            </div>
          `;
        } else {
          nextSessionContent.innerHTML = `
            <p class="text-sm font-semibold text-white">${I18n.t('noUpcomingSession')}</p>
            <p class="text-xs text-brand-100 mt-1">${I18n.t('planSessionFromCal')}</p>
          `;
        }
      }

      if (window.lucide) lucide.createIcons();
    } catch (err) {
      Toast.error('Erreur lors du chargement des données du dashboard.');
    }
  }
};

