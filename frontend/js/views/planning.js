// Planning & Calendar View — 2026 Commercial Edition (Étude Math Pro)
const PlanningView = {
  viewMode: 'week', // 'day', 'week', 'month', 'list'
  currentDate: new Date(),
  sessions: [],

  async render(container) {
    const isAr = I18n.currentLang === 'ar';

    container.innerHTML = `
      <div class="space-y-6 animate-fade-in max-w-7xl mx-auto">
        
        <!-- Header & View Switcher -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-2xl bg-[#fdfaf3] border border-[#ebd9b5] text-[#a27e38] flex items-center justify-center font-bold shadow-xs">
                <i data-lucide="calendar" class="w-5 h-5"></i>
              </div>
              <span>${isAr ? 'برنامج الحصص والتخطيط الأسبوعي' : 'Planning & Emploi du Temps'}</span>
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">
              ${isAr ? 'تنظيم الحصص الأسبوعية من الإثنين إلى الأحد مع التحديد التلقائي للتواريخ.' : 'Organisez vos séances par jour de la semaine (Lundi à Dimanche) avec calcul automatique des dates.'}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2.5">
            <!-- View Mode Switcher -->
            <div class="flex bg-[#eee7db] p-1 rounded-2xl border border-[#ded5c5] text-xs font-bold text-slate-700">
              <button onclick="PlanningView.setViewMode('week')" id="plan-btn-week" class="px-3 py-1.5 rounded-xl transition-all ${this.viewMode === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}">${isAr ? 'الأسبوع (7 أيام)' : 'Semaine (7 Jours)'}</button>
              <button onclick="PlanningView.setViewMode('day')" id="plan-btn-day" class="px-3 py-1.5 rounded-xl transition-all ${this.viewMode === 'day' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}">${I18n.t('day')}</button>
              <button onclick="PlanningView.setViewMode('month')" id="plan-btn-month" class="px-3 py-1.5 rounded-xl transition-all ${this.viewMode === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}">${I18n.t('month')}</button>
              <button onclick="PlanningView.setViewMode('list')" id="plan-btn-list" class="px-3 py-1.5 rounded-xl transition-all ${this.viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}">${I18n.t('list')}</button>
            </div>

            <a href="/api/reports/daily/tomorrow/pdf" target="_blank" class="px-3.5 py-2.5 bg-white hover:bg-[#fbf9f4] text-slate-700 border border-[#ded7ca] text-xs sm:text-sm font-bold rounded-2xl shadow-xs transition-all flex items-center gap-1.5">
              <i data-lucide="file-text" class="w-4 h-4 text-[#a27e38]"></i>
              <span>${I18n.t('downloadTomorrowPdf')}</span>
            </a>

            <button onclick="app.openNewSessionModal()" class="px-4 py-2.5 btn-gold-action text-xs sm:text-sm font-black flex items-center gap-2">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>+ ${isAr ? 'برمجة حصة جديدة' : 'Nouvelle Séance'}</span>
            </button>
          </div>
        </div>

        <!-- Navigation Bar (Prev / Today / Next / Date Label) -->
        <div class="bg-white p-4 rounded-3xl border border-[#ede7db] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <button onclick="PlanningView.navigateDate(-1)" class="p-2 text-slate-600 hover:text-slate-900 hover:bg-[#ede5d8] rounded-xl transition-colors" title="Semaine précédente">
              <i data-lucide="chevron-left" class="w-5 h-5 rtl:rotate-180"></i>
            </button>
            <button onclick="PlanningView.today()" class="px-3.5 py-1.5 text-xs font-bold text-slate-800 bg-[#f4eee3] hover:bg-[#ede5d8] rounded-xl transition-colors border border-[#ded5c5]">
              ${I18n.t('today')}
            </button>
            <button onclick="PlanningView.navigateDate(1)" class="p-2 text-slate-600 hover:text-slate-900 hover:bg-[#ede5d8] rounded-xl transition-colors" title="Semaine suivante">
              <i data-lucide="chevron-right" class="w-5 h-5 rtl:rotate-180"></i>
            </button>
          </div>

          <h3 class="text-sm sm:text-base font-black text-slate-900 capitalize text-center" id="plan-period-label">
            ${I18n.t('currentWeek')}
          </h3>

          <div class="flex items-center justify-center sm:justify-end gap-3 text-xs font-semibold text-slate-500">
            <span class="inline-flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> ${I18n.t('attendanceTaken')}</span>
            <span class="inline-flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span> ${I18n.t('scheduled')}</span>
            <span class="inline-flex items-center gap-1.5 hidden md:inline-flex"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> ${I18n.t('conflictDetected')}</span>
          </div>
        </div>

        <!-- Visual Calendar / Planning Container -->
        <div id="calendar-content" class="bg-white rounded-3xl p-4 sm:p-6 border border-[#ede7db] shadow-xs min-h-[480px]">
          <!-- Injected dynamically -->
        </div>

      </div>
    `;

    if (window.lucide) lucide.createIcons();
    await this.loadSessions(container);
  },

  setViewMode(mode) {
    this.viewMode = mode;
    ['day', 'week', 'month', 'list'].forEach(m => {
      const btn = document.getElementById(`plan-btn-${m}`);
      if (btn) {
        btn.className = `px-3 py-1.5 rounded-xl transition-all ${this.viewMode === m ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`;
      }
    });
    this.renderCalendar();
  },

  navigateDate(delta) {
    if (this.viewMode === 'day') {
      this.currentDate.setDate(this.currentDate.getDate() + delta);
    } else if (this.viewMode === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() + (delta * 7));
    } else if (this.viewMode === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() + delta);
    } else {
      this.currentDate.setDate(this.currentDate.getDate() + (delta * 7));
    }
    this.renderCalendar();
  },

  today() {
    this.currentDate = new Date();
    this.renderCalendar();
  },

  async loadSessions(container) {
    try {
      this.sessions = await API.get('/api/sessions');
      State.sessions = this.sessions;
      this.renderCalendar();
    } catch (e) {
      Toast.error('Erreur lors du chargement des séances.');
    }
  },

  renderCalendar() {
    const calContent = document.getElementById('calendar-content');
    const periodLabel = document.getElementById('plan-period-label');
    if (!calContent) return;

    if (this.viewMode === 'week') {
      this.renderWeekView(calContent, periodLabel);
    } else if (this.viewMode === 'day') {
      this.renderDayView(calContent, periodLabel);
    } else if (this.viewMode === 'month') {
      this.renderMonthView(calContent, periodLabel);
    } else {
      this.renderListView(calContent, periodLabel);
    }

    if (window.lucide) lucide.createIcons();
  },

  // 7-Day Visual Week Planner (LUNDI | MARDI | MERCREDI | JEUDI | VENDREDI | SAMEDI | DIMANCHE)
  renderWeekView(container, labelEl) {
    const curr = new Date(this.currentDate);
    const day = curr.getDay(); // 0 is Sunday, 1 is Monday, ...
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const monday = new Date(curr);
    monday.setDate(curr.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDays.push(d);
    }

    const locale = I18n.currentLang === 'ar' ? 'ar-TN' : 'fr-FR';

    if (labelEl) {
      const opt = { day: 'numeric', month: 'short' };
      labelEl.innerText = `${weekDays[0].toLocaleDateString(locale, opt)} — ${weekDays[6].toLocaleDateString(locale, { ...opt, year: 'numeric' })}`;
    }

    const dayNamesFr = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'];
    const dayNamesAr = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];
    const dayNames = I18n.currentLang === 'ar' ? dayNamesAr : dayNamesFr;
    const todayStr = new Date().toISOString().split('T')[0];

    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3.5">
        ${weekDays.map((dateObj, idx) => {
          const yyyy = dateObj.getFullYear();
          const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
          const dd = String(dateObj.getDate()).padStart(2, '0');
          const dateStr = `${yyyy}-${mm}-${dd}`;
          const isToday = (todayStr === dateStr);
          const daySessions = (this.sessions || []).filter(s => s.date === dateStr);
          
          // Sort day sessions chronologically by start time
          daySessions.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));

          return `
            <div class="rounded-3xl p-3 sm:p-3.5 border transition-all flex flex-col min-h-[340px] ${
              isToday 
                ? 'bg-gradient-to-b from-[#fdfbf6] to-[#f8f2e4] border-[#d8c29d] shadow-sm ring-2 ring-[#c5a059]/30' 
                : 'bg-[#faf8f5] border-[#ede7db] hover:border-[#dfd3c0]'
            }">
              
              <!-- Column Day Header (LUNDI, MARDI...) -->
              <div class="pb-2.5 mb-3 border-b ${isToday ? 'border-[#ebd9b5]' : 'border-[#ede7db]'} flex items-center justify-between">
                <div>
                  <div class="flex items-center gap-1.5">
                    <p class="text-xs font-black tracking-wider ${isToday ? 'text-[#856428]' : 'text-slate-800'} uppercase">
                      ${dayNames[idx]}
                    </p>
                    ${isToday ? `<span class="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-[#c5a059] text-white tracking-wider">Auj</span>` : ''}
                  </div>
                  <p class="text-[11px] text-slate-500 font-bold mt-0.5">
                    ${dateObj.getDate()} ${dateObj.toLocaleDateString(locale, { month: 'short' })}
                  </p>
                </div>

                <!-- Add Session Shortcut for this specific Day -->
                <button onclick="app.openNewSessionModal('${dateStr}', ${idx})" title="Planifier une séance ce jour" class="p-1.5 text-slate-400 hover:text-[#856428] hover:bg-white rounded-xl transition-all shadow-2xs">
                  <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                </button>
              </div>

              <!-- Sessions List for this Day -->
              <div class="space-y-2.5 flex-1 overflow-y-auto pr-0.5">
                ${daySessions.length === 0 ? `
                  <div onclick="app.openNewSessionModal('${dateStr}', ${idx})" class="h-36 rounded-2xl border-2 border-dashed border-[#e8dfd1] hover:border-[#c5a059] hover:bg-white/60 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all group">
                    <i data-lucide="plus-circle" class="w-5 h-5 text-slate-300 group-hover:text-[#a27e38] transition-colors mb-1.5"></i>
                    <p class="text-[11px] font-bold text-slate-400 group-hover:text-slate-700 transition-colors">
                      ${I18n.t('noLessons')}
                    </p>
                    <span class="text-[9px] text-slate-400 group-hover:text-[#856428] mt-0.5">+ Planifier</span>
                  </div>
                ` : daySessions.map(s => {
                  const levelLabel = I18n.getLevelLabel(s.level);
                  return `
                    <div class="p-3 rounded-2xl border cursor-pointer hover:shadow-sm transition-all relative group ${
                      s.has_conflict ? 'bg-rose-50 border-rose-300 text-rose-950 ring-1 ring-rose-300' :
                      s.is_completed ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950' : 'bg-white border-[#ded7ca] text-slate-900 shadow-2xs'
                    }">
                      
                      <!-- Top Line: Time & Conflict -->
                      <div class="flex items-center justify-between text-[10px] font-black pb-1 border-b border-black/5">
                        <span class="px-2 py-0.5 rounded-lg font-mono ${s.is_completed ? 'bg-emerald-100/70 text-emerald-900' : 'bg-[#f4eee3] text-slate-800'}">
                          ${s.start_time} — ${s.end_time}
                        </span>
                        ${s.has_conflict ? `<span class="text-rose-600 font-extrabold flex items-center gap-0.5" title="${s.conflict_details || 'Conflit'}">⚠️ Conflit</span>` : ''}
                      </div>

                      <!-- Group Name & Level -->
                      <div class="pt-2">
                        <h4 class="text-xs font-black text-slate-900 truncate leading-tight">${s.group_name}</h4>
                        <p class="text-[10px] text-slate-500 font-semibold truncate mt-0.5">${levelLabel} • 📍 ${s.location || 'Salle 1'}</p>
                        ${s.topic ? `<p class="text-[10px] text-slate-600 italic truncate mt-1">📖 ${s.topic}</p>` : ''}
                      </div>

                      <!-- Bottom Line: Attendance Status & Actions -->
                      <div class="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between text-[10px]">
                        <span class="font-bold ${s.is_completed ? 'text-emerald-700' : 'text-slate-500'}">
                          ${s.is_completed ? `✅ Présences (${s.attended_count}/${s.student_count})` : `👥 ${s.student_count} élève${s.student_count > 1 ? 's' : ''}`}
                        </span>

                        <!-- Action Buttons on Card -->
                        <div class="flex items-center gap-1">
                          <button onclick="AttendanceView.openForSession(${s.id})" title="Faire l'appel" class="p-1 rounded-lg ${s.is_completed ? 'bg-emerald-100 text-emerald-800' : 'bg-[#c5a059]/15 text-[#856428]'} hover:scale-105 transition-transform">
                            <i data-lucide="check-circle" class="w-3 h-3"></i>
                          </button>
                          <button onclick="PlanningView.openSessionDetail(${s.id})" title="Modifier" class="p-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                            <i data-lucide="edit-2" class="w-3 h-3"></i>
                          </button>
                        </div>
                      </div>

                    </div>
                  `;
                }).join('')}
              </div>

            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderDayView(container, labelEl) {
    const locale = I18n.currentLang === 'ar' ? 'ar-TN' : 'fr-FR';
    const yyyy = this.currentDate.getFullYear();
    const mm = String(this.currentDate.getMonth() + 1).padStart(2, '0');
    const dd = String(this.currentDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    if (labelEl) {
      labelEl.innerText = this.currentDate.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    const daySessions = (this.sessions || []).filter(s => s.date === dateStr);
    daySessions.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));

    container.innerHTML = `
      <div class="max-w-2xl mx-auto space-y-4">
        ${daySessions.length === 0 ? `
          <div class="text-center py-12 text-slate-400 text-sm">
            <i data-lucide="calendar-x" class="w-10 h-10 mx-auto text-slate-300 mb-2"></i>
            <p class="font-bold text-slate-700">${I18n.t('noSessionsToday')}</p>
            <button onclick="app.openNewSessionModal('${dateStr}')" class="mt-4 px-4 py-2.5 btn-gold-action text-xs font-black">
              + ${I18n.t('newSession')}
            </button>
          </div>
        ` : daySessions.map(s => {
          const levelLabel = I18n.getLevelLabel(s.level);
          return `
            <div class="p-5 rounded-3xl border ${s.has_conflict ? 'border-rose-300 bg-rose-50/60' : 'border-[#ede7db] bg-[#faf8f5]'} hover:bg-white transition-all space-y-3">
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="text-base font-black text-slate-900">${s.group_name}</h4>
                    <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#eee7db] text-slate-700">${levelLabel}</span>
                    ${s.has_conflict ? `<span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700">⚠️ ${I18n.t('conflictDetected')}</span>` : ''}
                  </div>
                  <p class="text-xs text-slate-600 mt-1 font-medium">${s.topic || I18n.t('mathLesson')}</p>
                  <p class="text-xs text-slate-400 mt-0.5">📍 ${s.location} • 👥 ${s.student_count} ${I18n.t('students')}</p>
                </div>

                <div class="text-right rtl:text-left">
                  <span class="text-sm font-black text-slate-900 px-3 py-1 rounded-xl bg-white border border-[#ded7ca] inline-block font-mono">${s.start_time} - ${s.end_time}</span>
                </div>
              </div>

              <div class="pt-3 border-t border-[#ede7db] flex items-center justify-between">
                <span class="text-xs font-semibold ${s.is_completed ? 'text-emerald-700' : 'text-slate-500'}">
                  ${s.is_completed ? `✅ ${I18n.t('attendanceTaken')} (${s.attended_count}/${s.student_count})` : `🕒 ${I18n.t('scheduled')}`}
                </span>
                <div class="flex items-center gap-2">
                  <button onclick="AttendanceView.openForSession(${s.id})" class="px-3 py-1.5 rounded-xl ${s.is_completed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'btn-gold-action'} text-xs font-black">
                    ${s.is_completed ? I18n.t('editAttendance') : I18n.t('takeAttendance')}
                  </button>
                  <button onclick="PlanningView.openSessionDetail(${s.id})" class="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-[#ede5d8]">
                    <i data-lucide="edit-3" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderMonthView(container, labelEl) {
    const locale = I18n.currentLang === 'ar' ? 'ar-TN' : 'fr-FR';
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    if (labelEl) {
      labelEl.innerText = this.currentDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    }

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    let startDayOfWeek = (firstDay.getDay() + 6) % 7; // Lundi = 0

    const dayNames = I18n.currentLang === 'ar'
      ? ['إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت', 'أحد']
      : ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    let html = `
      <div class="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-black text-slate-500 uppercase">
        ${dayNames.map(d => `<div class="py-1">${d}</div>`).join('')}
      </div>
      <div class="grid grid-cols-7 gap-2">
    `;

    for (let i = 0; i < startDayOfWeek; i++) {
      html += `<div class="h-20 bg-transparent"></div>`;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(dateObj.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const isToday = dateStr === todayStr;
      const count = (this.sessions || []).filter(s => s.date === dateStr).length;

      html += `
        <div onclick="PlanningView.goToDay('${dateStr}')" class="h-24 p-2 rounded-2xl border ${isToday ? 'bg-[#fdf9f0] border-[#c5a059]' : 'bg-[#faf8f5] border-[#ede7db]'} hover:bg-white hover:border-[#c5a059] transition-all cursor-pointer flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-black ${isToday ? 'text-[#856428]' : 'text-slate-800'}">${d}</span>
            ${isToday ? `<span class="w-2 h-2 rounded-full bg-[#c5a059]"></span>` : ''}
          </div>
          ${count > 0 ? `
            <div class="px-2 py-1 rounded-xl bg-[#eee7db] text-slate-900 font-bold text-[10px] text-center truncate">
              ${count} ${I18n.t('sessions')}
            </div>
          ` : ''}
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  },

  renderListView(container, labelEl) {
    if (labelEl) labelEl.innerText = I18n.t('all_sessions');

    if (this.sessions.length === 0) {
      container.innerHTML = `
        <div class="p-12 text-center text-slate-400 text-sm">
          <i data-lucide="calendar" class="w-10 h-10 mx-auto text-slate-300 mb-2"></i>
          <p class="font-bold text-slate-700">${I18n.t('noLessons')}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-left rtl:text-right text-xs sm:text-sm">
          <thead class="bg-[#faf8f5] text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-[#ede7db]">
            <tr>
              <th class="px-6 py-3.5">${I18n.t('date')}</th>
              <th class="px-6 py-3.5">${I18n.t('time')}</th>
              <th class="px-6 py-3.5">${I18n.t('group')}</th>
              <th class="px-6 py-3.5">${I18n.t('topic')}</th>
              <th class="px-6 py-3.5">${I18n.t('students')}</th>
              <th class="px-6 py-3.5">${I18n.t('status')}</th>
              <th class="px-6 py-3.5 text-right rtl:text-left">${I18n.t('actions')}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#f2ece1]">
            ${this.sessions.map(s => `
              <tr class="hover:bg-[#fdfbf7] transition-colors">
                <td class="px-6 py-4 font-bold text-slate-900">${s.date}</td>
                <td class="px-6 py-4 font-mono font-semibold text-slate-700">${s.start_time} - ${s.end_time}</td>
                <td class="px-6 py-4 font-black text-slate-900">${s.group_name}</td>
                <td class="px-6 py-4 text-slate-600">${s.topic || '---'}</td>
                <td class="px-6 py-4 font-bold">${s.student_count}</td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${s.is_completed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-[#eee7db] text-slate-700'}">
                    ${s.is_completed ? `✅ ${I18n.t('attendanceTaken')}` : `🕒 ${I18n.t('scheduled')}`}
                  </span>
                </td>
                <td class="px-6 py-4 text-right rtl:text-left">
                  <div class="flex items-center justify-end rtl:justify-start gap-1.5">
                    <button onclick="AttendanceView.openForSession(${s.id})" class="p-1.5 text-slate-400 hover:text-emerald-600 rounded-xl transition-colors">
                      <i data-lucide="check-circle-2" class="w-4 h-4"></i>
                    </button>
                    <button onclick="PlanningView.openSessionDetail(${s.id})" class="p-1.5 text-slate-400 hover:text-[#a27e38] rounded-xl transition-colors">
                      <i data-lucide="edit-3" class="w-4 h-4"></i>
                    </button>
                    <button onclick="PlanningView.deleteSession(${s.id})" class="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl transition-colors">
                      <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  goToDay(dateStr) {
    this.currentDate = new Date(dateStr);
    this.setViewMode('day');
  },

  async openSessionDetail(sessionId) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) return;
    const isAr = I18n.currentLang === 'ar';

    Modal.open({
      title: `${isAr ? 'تعديل الحصة' : 'Modifier la séance'} : ${session.group_name}`,
      size: 'max-w-lg',
      html: `
        <form id="edit-session-form" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${I18n.t('date')}</label>
              <input id="edit-sess-date" type="date" value="${session.date}" required class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 font-medium">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${I18n.t('status')}</label>
              <select id="edit-sess-status" class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 bg-white font-medium">
                <option value="scheduled" ${session.status === 'scheduled' ? 'selected' : ''}>${isAr ? 'مبرمجة' : 'Programmée'}</option>
                <option value="completed" ${session.status === 'completed' ? 'selected' : ''}>${isAr ? 'مكتملة' : 'Terminée'}</option>
                <option value="cancelled" ${session.status === 'cancelled' ? 'selected' : ''}>${isAr ? 'ملغاة' : 'Annulée'}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${I18n.t('startTime')}</label>
              <input id="edit-sess-start" type="time" value="${session.start_time}" required class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 font-bold">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${I18n.t('endTime')}</label>
              <input id="edit-sess-end" type="time" value="${session.end_time}" required class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 font-bold">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${I18n.t('topic')}</label>
            <input id="edit-sess-topic" type="text" value="${session.topic || ''}" class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 font-medium">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${I18n.t('location')}</label>
            <input id="edit-sess-location" type="text" value="${session.location || 'Salle 1'}" class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 font-medium">
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-[#ede7db]">
            <button type="button" onclick="PlanningView.deleteSession(${session.id})" class="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-2xl">
              ${I18n.t('delete')}
            </button>
            <div class="flex items-center gap-2">
              <button type="button" onclick="Modal.close()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-[#ede5d8] rounded-2xl">
                ${I18n.t('cancel')}
              </button>
              <button type="submit" class="px-5 py-2.5 btn-gold-action text-xs font-black">
                ${I18n.t('save')}
              </button>
            </div>
          </div>
        </form>
      `,
      onOpen: (content) => {
        const form = content.querySelector('#edit-session-form');
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const payload = {
            date: content.querySelector('#edit-sess-date').value,
            start_time: content.querySelector('#edit-sess-start').value,
            end_time: content.querySelector('#edit-sess-end').value,
            topic: content.querySelector('#edit-sess-topic').value.trim() || null,
            location: content.querySelector('#edit-sess-location').value.trim() || 'Salle 1',
            status: content.querySelector('#edit-sess-status').value
          };

          try {
            await API.put(`/api/sessions/${session.id}`, payload);
            Toast.success(isAr ? 'تم تعديل الحصة بنجاح.' : 'Séance mise à jour.');
            Modal.close();
            await PlanningView.loadSessions(document.getElementById('main-view'));
          } catch (err) {
            Toast.error(err.message);
          }
        });
      }
    });
  },

  deleteSession(sessionId) {
    const isAr = I18n.currentLang === 'ar';
    Modal.confirm({
      title: isAr ? 'حذف الحصة' : 'Supprimer la séance',
      message: isAr ? 'هل أنت متأكد من حذف هذه الحصة ؟ سيتم حذف تسجيلات الحضور المرتبطة بها.' : 'Supprimer cette séance ? Les présences associées seront également supprimées.',
      confirmText: isAr ? 'حذف' : 'Supprimer',
      onConfirm: async () => {
        try {
          await API.delete(`/api/sessions/${sessionId}`);
          Toast.success(isAr ? 'تم حذف الحصة.' : 'Séance supprimée.');
          await PlanningView.loadSessions(document.getElementById('main-view'));
        } catch (e) {
          Toast.error(e.message);
        }
      }
    });
  }
};
