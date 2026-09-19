// Dashboard View — Premium Modern SaaS EdTech 2026 Reference Design (Étude Math Pro)
const DashboardView = {
  async render(container) {
    const isAr = I18n.currentLang === 'ar';
    const now = new Date();

    const daysFr = ['DIMANCHE', 'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
    const monthsFr = ['JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN', 'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'];
    const daysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const monthsAr = ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

    const currentDayName = isAr ? daysAr[now.getDay()] : daysFr[now.getDay()];
    const currentDayNumber = now.getDate();
    const currentMonthName = isAr ? monthsAr[now.getMonth()] : monthsFr[now.getMonth()];
    const currentYear = now.getFullYear();

    const user = State.user || API.getUser();
    const teacherName = (user && user.name) ? user.name : (isAr ? 'أستاذ' : 'Professeur');
    const avatarHtml = this.getAvatarHtml(user);

    container.innerHTML = `
      <div class="space-y-6 sm:space-y-7 animate-fade-in max-w-7xl mx-auto">

        <!-- 1. Hero Welcome Card (Matching Reference Image) -->
        <div class="hero-welcome-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <!-- Left: Avatar + Greeting -->
          <div class="flex items-center gap-4 sm:gap-5 relative z-10">
            <div id="dash-teacher-avatar-box" class="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white/90 shadow-md bg-white overflow-hidden flex items-center justify-center shrink-0">
              ${avatarHtml}
            </div>
            <div>
              <p class="text-sm sm:text-base text-slate-700 font-semibold tracking-wide">
                ${isAr ? 'مرحباً أستاذ،' : 'Bienvenue Professeur,'}
              </p>
              <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5" id="dash-teacher-name">
                ${teacherName}
              </h1>
            </div>
          </div>

          <!-- Right: Calendar Date Badge (Matching Reference Image) -->
          <div class="flex items-center justify-start md:justify-end gap-3.5 relative z-10">
            <div class="text-left rtl:text-right">
              <p class="text-xs sm:text-sm font-black tracking-wider text-slate-800 uppercase">
                ${currentDayName}
              </p>
              <p class="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                ${currentMonthName}
              </p>
            </div>
            <div class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none tabular-nums">
              ${currentDayNumber}
            </div>
            <div class="text-xs sm:text-sm font-bold text-slate-700">
              ${currentYear}
            </div>
          </div>
        </div>

        <!-- 2. 6 3D Geometric Crystal KPI Cards (Matching Reference Image) -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4" id="dash-kpi-grid">
          <!-- Loading Skeletons -->
          <div class="skeleton h-32 rounded-3xl"></div>
          <div class="skeleton h-32 rounded-3xl"></div>
          <div class="skeleton h-32 rounded-3xl"></div>
          <div class="skeleton h-32 rounded-3xl"></div>
          <div class="skeleton h-32 rounded-3xl"></div>
          <div class="skeleton h-32 rounded-3xl"></div>
        </div>

        <!-- Pending Payments Alert Banner (Matching Reference) -->
        <div id="dash-pending-payments-alert" class="hidden">
          <!-- Injected dynamically -->
        </div>

        <!-- 3. Bottom Grid: Planification du jour & Flux d'activité -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <!-- Left Column: Planification du jour (7 cols) -->
          <div class="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#ede7db] shadow-sm space-y-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <h2 class="text-base sm:text-lg font-black text-slate-900">
                  ${isAr ? 'جدول الحصص اليومي' : 'Planification du jour'}
                </h2>
              </div>
              <div class="flex items-center gap-2">
                <a href="#planning" class="text-xs font-bold text-slate-600 hover:text-slate-900 bg-[#f7f3ea] hover:bg-[#ede5d8] px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1">
                  <span>${isAr ? 'عرض تفاعلي' : 'Interactive view'}</span>
                  <i data-lucide="chevron-down" class="w-3.5 h-3.5 opacity-60"></i>
                </a>
              </div>
            </div>

            <!-- Weekday Indicators Matrix (Lu, Ma, Me, Je, Ve, Sa, Di) -->
            <div class="grid grid-cols-7 gap-1.5 p-2 bg-[#fcfaf6] rounded-2xl border border-[#ede7db] text-center text-xs font-bold">
              ${['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].map((day, idx) => {
                const todayIdx = (now.getDay() + 6) % 7; // Convert Sunday(0) to 6, Monday(1) to 0
                const isToday = idx === todayIdx;
                return `
                  <div class="py-1.5 rounded-xl transition-all ${isToday ? 'bg-[#c5a059] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f4eedf]'}">
                    ${day}
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Today's Sessions List -->
            <div id="dash-today-sessions" class="space-y-3 pt-1">
              <!-- Rendered dynamically -->
            </div>
          </div>

          <!-- Right Column: Flux d'activité & Quick Actions (5 cols) -->
          <div class="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#ede7db] shadow-sm space-y-5 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-base sm:text-lg font-black text-slate-900">
                  ${isAr ? 'سير الأنشطة' : 'Flux d\'activité'}
                </h2>
                <button onclick="app.openNewSessionModal()" class="text-slate-400 hover:text-slate-600 p-1">
                  <i data-lucide="more-horizontal" class="w-5 h-5"></i>
                </button>
              </div>

              <!-- Quick Action List Items -->
              <div class="space-y-2.5">
                <div onclick="app.openNewStudentModal()" class="flex items-center justify-between p-3.5 rounded-2xl bg-[#fdfcf9] hover:bg-[#f8f4ec] border border-[#ede7db] transition-all cursor-pointer group">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <i data-lucide="user-plus" class="w-4 h-4"></i>
                    </div>
                    <div>
                      <p class="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#a27e38] transition-colors">${I18n.t('newStudent')}</p>
                      <p class="text-[10px] text-slate-500">${I18n.t('registerStudentDesc')}</p>
                    </div>
                  </div>
                  <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform"></i>
                </div>

                <div onclick="app.openNewPaymentModal()" class="flex items-center justify-between p-3.5 rounded-2xl bg-[#fdfcf9] hover:bg-[#f8f4ec] border border-[#ede7db] transition-all cursor-pointer group">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <i data-lucide="wallet" class="w-4 h-4"></i>
                    </div>
                    <div>
                      <p class="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#a27e38] transition-colors">${I18n.t('recordPayment')}</p>
                      <p class="text-[10px] text-slate-500">${I18n.t('collectMonthlyDesc')}</p>
                    </div>
                  </div>
                  <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform"></i>
                </div>

                <div onclick="app.openNewGroupModal()" class="flex items-center justify-between p-3.5 rounded-2xl bg-[#fdfcf9] hover:bg-[#f8f4ec] border border-[#ede7db] transition-all cursor-pointer group">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                      <i data-lucide="users" class="w-4 h-4"></i>
                    </div>
                    <div>
                      <p class="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#a27e38] transition-colors">${I18n.t('newGroup')}</p>
                      <p class="text-[10px] text-slate-500">${I18n.t('createGroupDesc')}</p>
                    </div>
                  </div>
                  <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform"></i>
                </div>
              </div>
            </div>

            <!-- Golden Action Button (Matching Reference "Nouvelle Action") -->
            <div class="pt-4 border-t border-[#ede7db]">
              <button onclick="app.openQuickActionMenu()" class="w-full py-3.5 px-5 btn-gold-action text-sm font-black flex items-center justify-center gap-2.5">
                <i data-lucide="plus-circle" class="w-5 h-5"></i>
                <span>${isAr ? 'إجراء جديد' : 'Nouvelle Action'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    `;

    if (window.lucide) lucide.createIcons();

    await this.loadData(container);
  },

  getAvatarHtml(user) {
    if (!user) {
      return `<div class="w-full h-full bg-gradient-to-tr from-[#c5a059] to-[#dfc288] text-white font-black flex items-center justify-center text-xl sm:text-2xl shadow-inner">P</div>`;
    }
    if (user.avatar && (user.avatar.startsWith('data:image') || user.avatar.startsWith('http') || user.avatar.startsWith('/'))) {
      return `<img src="${user.avatar}" class="w-full h-full object-cover" alt="${user.name || 'Professeur'}" onerror="this.parentElement.innerHTML='<div class=\\'w-full h-full bg-gradient-to-tr from-[#c5a059] to-[#dfc288] text-white font-black flex items-center justify-center text-xl sm:text-2xl\\'>P</div>';">`;
    }
    if (user.avatar && user.avatar.length <= 4) {
      return `<div class="w-full h-full bg-[#f4eee2] text-slate-800 flex items-center justify-center text-2xl sm:text-3xl font-bold">${user.avatar}</div>`;
    }
    const parts = (user.name || 'Professeur').trim().split(/\s+/);
    const initials = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
    return `<div class="w-full h-full bg-gradient-to-tr from-[#c5a059] to-[#dfc288] text-white font-black flex items-center justify-center text-xl sm:text-2xl shadow-inner">${initials}</div>`;
  },

  async loadData(container) {
    try {
      const stats = await API.get('/api/dashboard/stats');
      State.dashboardStats = stats;
      State.updateBadges();

      const user = State.user || API.getUser();
      if (user) {
        const teacherNameEl = container.querySelector('#dash-teacher-name');
        if (teacherNameEl) {
          teacherNameEl.innerText = user.name || (I18n.currentLang === 'ar' ? 'أستاذ' : 'Professeur');
        }
        const teacherAvatarBox = container.querySelector('#dash-teacher-avatar-box');
        if (teacherAvatarBox) {
          teacherAvatarBox.innerHTML = this.getAvatarHtml(user);
        }
      }

      const isAr = I18n.currentLang === 'ar';
      const currency = 'DT';

      // 1. Render 6 3D Geometric Crystal KPI Cards
      const kpiGrid = container.querySelector('#dash-kpi-grid');
      if (kpiGrid) {
        kpiGrid.innerHTML = `
          <!-- Total Élèves -->
          <div class="kpi-crystal-card kpi-crystal-blue group">
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">${I18n.t('totalStudents')}</p>
            <p class="text-3xl sm:text-4xl font-black text-slate-900 tabular-nums">${stats.total_students || 0}</p>
          </div>

          <!-- Total Groupes -->
          <div class="kpi-crystal-card kpi-crystal-slate group">
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">${I18n.t('totalGroups')}</p>
            <p class="text-3xl sm:text-4xl font-black text-slate-900 tabular-nums">${stats.total_groups || 0}</p>
          </div>

          <!-- Présences Aujourd'hui -->
          <div class="kpi-crystal-card kpi-crystal-green group">
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">${I18n.t('presentToday')}</p>
            <p class="text-3xl sm:text-4xl font-black text-emerald-600 tabular-nums">${stats.students_present_today || 0}</p>
          </div>

          <!-- Séances Aujourd'hui -->
          <div class="kpi-crystal-card kpi-crystal-slate group">
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">${I18n.t('sessionsToday')}</p>
            <p class="text-3xl sm:text-4xl font-black text-slate-900 tabular-nums">${stats.sessions_today || 0}</p>
          </div>

          <!-- Paiements en Attente -->
          <div class="kpi-crystal-card kpi-crystal-champagne group">
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">${I18n.t('pendingPayments')}</p>
            <p class="text-3xl sm:text-4xl font-black text-[#a27e38] tabular-nums">${stats.pending_payments_count || 0}</p>
          </div>

          <!-- Collecté ce mois -->
          <div class="kpi-crystal-card kpi-crystal-amber group">
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">${I18n.t('collectedThisMonth')}</p>
            <p class="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">${stats.total_collected_this_month || 0}<span class="text-xs font-bold text-slate-500 ml-1">${currency}</span></p>
          </div>
        `;
      }

      // 2. Pending Payments Alert Sub-Banner (Matching Reference Image)
      const pendingAlert = container.querySelector('#dash-pending-payments-alert');
      if (pendingAlert) {
        if (stats.pending_payments_count > 0) {
          const currentMonth = new Date().toLocaleDateString(isAr ? 'ar-TN' : 'fr-FR', { month: 'long', year: 'numeric' });
          pendingAlert.classList.remove('hidden');
          pendingAlert.innerHTML = `
            <div class="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#fffaf0] border border-[#edd5a6] text-xs text-amber-900">
              <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-600 shrink-0"></i>
              <span class="font-bold">${I18n.t('pendingPayments')} :</span>
              <span class="opacity-90">${stats.pending_payments_count} ${isAr ? 'تلميذ لم يقوموا بعد بتسوية معلوم هذا الشهر' : `élève(s) n'ont pas encore réglé leur mensualité pour ${currentMonth}.`}</span>
              <a href="#payments" class="ml-auto rtl:ml-0 rtl:mr-auto font-bold text-[#856428] hover:underline">${isAr ? 'عرض' : 'Voir'} &rarr;</a>
            </div>
          `;
        } else {
          pendingAlert.classList.add('hidden');
        }
      }

      // 3. Today's Sessions Rendering
      const todaySessionsEl = container.querySelector('#dash-today-sessions');
      if (todaySessionsEl) {
        if (!stats.today_sessions || stats.today_sessions.length === 0) {
          todaySessionsEl.innerHTML = `
            <div class="text-center py-8 bg-[#fdfcf9] rounded-2xl border border-dashed border-[#ede7db]">
              <i data-lucide="coffee" class="w-7 h-7 text-slate-400 mx-auto mb-2"></i>
              <p class="text-xs font-bold text-slate-700">${I18n.t('noSessionsToday')}</p>
              <p class="text-[11px] text-slate-400 mt-0.5">${I18n.t('noSessionsTodayDesc')}</p>
              <button onclick="app.openNewSessionModal()" class="mt-3 px-3.5 py-1.5 bg-[#c5a059] hover:bg-[#a27e38] text-white text-xs font-bold rounded-xl shadow-xs transition-all">
                + ${I18n.t('newSession')}
              </button>
            </div>
          `;
        } else {
          todaySessionsEl.innerHTML = stats.today_sessions.map(s => {
            const levelLabel = I18n.getLevelLabel(s.level);
            return `
              <div class="p-3.5 rounded-2xl border ${s.has_conflict ? 'border-rose-300 bg-rose-50/50' : 'border-[#ede7db] bg-[#fdfcf9]'} hover:bg-white hover:border-[#c5a059]/60 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-start gap-3">
                  <div class="w-11 h-11 rounded-xl bg-[#f4eee2] text-[#856428] flex flex-col items-center justify-center font-black shrink-0 border border-[#ebd9b5]">
                    <span class="text-[11px]">${s.start_time}</span>
                    <span class="text-[9px] opacity-75 font-normal">${s.end_time}</span>
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="text-xs sm:text-sm font-bold text-slate-900">${s.group_name}</h3>
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#eee7db] text-slate-700">${levelLabel}</span>
                      ${s.has_conflict ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">⚠️ ${I18n.t('conflictDetected')}</span>` : ''}
                    </div>
                    <p class="text-[11px] text-slate-600 mt-0.5">${s.topic || I18n.t('mathLesson')}</p>
                    <p class="text-[10px] text-slate-400 mt-0.5">📍 ${s.location || 'Salle 1'} • 👥 ${s.student_count} ${I18n.t('enrolledStudents')}</p>
                  </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <button onclick="AttendanceView.openForSession(${s.id})" class="px-3 py-1.5 rounded-xl ${s.is_completed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' : 'bg-[#c5a059] hover:bg-[#a27e38] text-white shadow-xs'} text-xs font-bold transition-all flex items-center gap-1.5">
                    <i data-lucide="${s.is_completed ? 'check-check' : 'clipboard-check'}" class="w-3.5 h-3.5"></i>
                    ${s.is_completed ? `${I18n.t('attendanceTaken')} (${s.attended_count}/${s.student_count})` : I18n.t('takeAttendance')}
                  </button>
                </div>
              </div>
            `;
          }).join('');
        }
      }

      if (window.lucide) lucide.createIcons();
    } catch (err) {
      Toast.error('Erreur lors du chargement des données du dashboard.');
    }
  }
};
