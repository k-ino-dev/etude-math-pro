// Planning & Timetable View — Simple Weekly Recurring Model (Étude Math Pro)
const PlanningView = {
  viewMode: 'week', // 'week' (7-day columns), 'grid' (Timetable 08:00-22:00), 'list'
  currentDate: new Date(),
  sessions: [],
  minHour: 8,  // 08:00
  maxHour: 22, // 22:00

  async render(container) {
    const isAr = I18n.currentLang === 'ar';

    container.innerHTML = `
      <div class="space-y-6 animate-fade-in max-w-7xl mx-auto">
        
        <!-- Header & Action Bar -->
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-2xl bg-[#fdfaf3] border border-[#ebd9b5] text-[#a27e38] flex items-center justify-center font-bold shadow-xs">
                <i data-lucide="calendar-clock" class="w-5 h-5"></i>
              </div>
              <span>${isAr ? 'جدول الأوقات والبرنامج الأسبوعي' : 'Emploi du Temps & Planning'}</span>
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">
              ${isAr 
                ? 'برمجة أسبوعية قارة وسهلة للحصص: كل حصة مبرمجة تتكرر أسبوعياً تلقائياً.' 
                : 'Planning hebdomadaire récurrent : chaque groupe programmé se répète automatiquement chaque semaine.'}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2.5">
            <!-- View Mode Switcher -->
            <div class="flex bg-[#eee7db] p-1 rounded-2xl border border-[#ded5c5] text-xs font-bold text-slate-700">
              <button onclick="PlanningView.setViewMode('week')" id="plan-btn-week" class="px-3 py-1.5 rounded-xl transition-all ${this.viewMode === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}">${isAr ? 'الأسبوع (أعمدة)' : 'Semaine'}</button>
              <button onclick="PlanningView.setViewMode('grid')" id="plan-btn-grid" class="px-3 py-1.5 rounded-xl transition-all ${this.viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}">${isAr ? 'جدول الساعات' : 'Grille Horaires'}</button>
              <button onclick="PlanningView.setViewMode('list')" id="plan-btn-list" class="px-3 py-1.5 rounded-xl transition-all ${this.viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}">${I18n.t('list')}</button>
            </div>

            <!-- Master Timetable Overview Button -->
            <a href="#timetable" class="px-3.5 py-2.5 bg-white hover:bg-[#fbf9f4] text-slate-800 border border-[#ded7ca] text-xs sm:text-sm font-bold rounded-2xl shadow-xs transition-all flex items-center gap-1.5">
              <i data-lucide="layout-grid" class="w-4 h-4 text-[#a27e38]"></i>
              <span>${isAr ? 'عرض جدول الأوقات العام' : 'Vue récapitulative'}</span>
            </a>

            <!-- Download Tomorrow's PDF -->
            <a href="/api/reports/daily/tomorrow/pdf" target="_blank" class="px-3.5 py-2.5 bg-white hover:bg-[#fbf9f4] text-slate-700 border border-[#ded7ca] text-xs sm:text-sm font-bold rounded-2xl shadow-xs transition-all flex items-center gap-1.5 hidden sm:inline-flex">
              <i data-lucide="file-text" class="w-4 h-4 text-[#a27e38]"></i>
              <span>${I18n.t('downloadTomorrowPdf')}</span>
            </a>

            <!-- Add Slot Button -->
            ${State.isAdmin() ? `
            <button onclick="PlanningView.openSchedulerModal()" class="px-4 py-2.5 btn-gold-action text-xs sm:text-sm font-black flex items-center gap-2">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>+ ${isAr ? 'برمجة حصة أسبوعية' : 'Programmer un créneau'}</span>
            </button>
            ` : ''}
          </div>
        </div>

        <!-- Navigation Bar -->
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

          <div class="flex items-center justify-center sm:justify-end gap-3 text-xs font-semibold text-slate-500 flex-wrap">
            <span class="inline-flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-[#c5a059]"></span> ${isAr ? 'حصة أسبوعية قارة' : 'Horaire récurrent hebdomadaire'}</span>
            <span class="inline-flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> ${I18n.t('attendanceTaken')}</span>
          </div>
        </div>

        <!-- Timetable Content Container -->
        <div id="calendar-content" class="bg-white rounded-3xl p-3 sm:p-5 border border-[#ede7db] shadow-xs min-h-[520px] overflow-hidden">
          <!-- Injected dynamically -->
        </div>

      </div>
    `;

    if (window.lucide) lucide.createIcons();
    await this.loadSessions(container);
  },

  setViewMode(mode) {
    this.viewMode = mode;
    ['week', 'grid', 'list'].forEach(m => {
      const btn = document.getElementById(`plan-btn-${m}`);
      if (btn) {
        btn.className = `px-3 py-1.5 rounded-xl transition-all ${this.viewMode === m ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`;
      }
    });
    this.renderCalendar();
  },

  navigateDate(delta) {
    this.currentDate.setDate(this.currentDate.getDate() + (delta * 7));
    this.renderCalendar();
  },

  today() {
    this.currentDate = new Date();
    this.renderCalendar();
  },

  async loadSessions(container) {
    try {
      const weekDates = this.getWeekDates();
      const startStr = weekDates[0].toISOString().split('T')[0];
      const endStr = weekDates[6].toISOString().split('T')[0];
      this.sessions = await API.get(`/api/sessions?start_date=${startStr}&end_date=${endStr}`);
      State.sessions = this.sessions;
      this.renderCalendar();
    } catch (e) {
      console.error(e);
      Toast.error('Erreur lors du chargement des séances.');
    }
  },

  getWeekDates() {
    const curr = new Date(this.currentDate);
    const day = curr.getDay();
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
    return weekDays;
  },

  renderCalendar() {
    const calContent = document.getElementById('calendar-content');
    const periodLabel = document.getElementById('plan-period-label');
    if (!calContent) return;

    if (this.viewMode === 'week') {
      this.renderWeekView(calContent, periodLabel);
    } else if (this.viewMode === 'grid') {
      this.renderTimetableGrid(calContent, periodLabel);
    } else {
      this.renderListView(calContent, periodLabel);
    }

    if (window.lucide) lucide.createIcons();
  },

  // --- 1. 7-DAY WEEK VIEW ---
  renderWeekView(container, labelEl) {
    const weekDays = this.getWeekDates();
    const locale = I18n.currentLang === 'ar' ? 'ar-TN' : 'fr-FR';
    const isAr = I18n.currentLang === 'ar';

    if (labelEl) {
      const opt = { day: 'numeric', month: 'short' };
      labelEl.innerText = `${weekDays[0].toLocaleDateString(locale, opt)} — ${weekDays[6].toLocaleDateString(locale, { ...opt, year: 'numeric' })}`;
    }

    const dayNamesFr = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'];
    const dayNamesAr = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];
    const dayNames = isAr ? dayNamesAr : dayNamesFr;
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
          daySessions.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));

          return `
            <div class="rounded-3xl p-3 sm:p-3.5 border transition-all flex flex-col min-h-[340px] ${
              isToday 
                ? 'bg-gradient-to-b from-[#fdfbf6] to-[#f8f2e4] border-[#d8c29d] shadow-sm ring-2 ring-[#c5a059]/30' 
                : 'bg-[#faf8f5] border-[#ede7db] hover:border-[#dfd3c0]'
            }">
              
              <!-- Column Day Header -->
              <div class="pb-2.5 mb-3 border-b ${isToday ? 'border-[#ebd9b5]' : 'border-[#ede7db]'} flex items-center justify-between">
                <div>
                  <div class="flex items-center gap-1.5">
                    <p class="text-xs font-black tracking-wider ${isToday ? 'text-[#856428]' : 'text-slate-800'} uppercase">
                      ${dayNames[idx]}
                    </p>
                    ${isToday ? `<span class="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-[#c5a059] text-white">Auj</span>` : ''}
                  </div>
                  <p class="text-[11px] text-slate-500 font-bold mt-0.5">
                    ${dateObj.getDate()} ${dateObj.toLocaleDateString(locale, { month: 'short' })}
                  </p>
                </div>

                ${State.isAdmin() ? `
                <button onclick="PlanningView.openSchedulerModal(${idx})" title="Programmer un groupe ce jour" class="p-1.5 text-slate-400 hover:text-[#856428] hover:bg-white rounded-xl transition-all shadow-2xs">
                  <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                </button>
                ` : ''}
              </div>

              <!-- Sessions List for this day -->
              <div class="space-y-2.5 flex-1 overflow-y-auto pr-0.5">
                ${daySessions.length === 0 ? `
                  <div onclick="PlanningView.openSchedulerModal(${idx})" class="h-36 rounded-2xl border-2 border-dashed border-[#e8dfd1] hover:border-[#c5a059] hover:bg-white/60 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all group">
                    <i data-lucide="plus-circle" class="w-5 h-5 text-slate-300 group-hover:text-[#a27e38] transition-colors mb-1.5"></i>
                    <p class="text-[11px] font-bold text-slate-400 group-hover:text-slate-700 transition-colors">
                      ${I18n.t('noLessons')}
                    </p>
                    <span class="text-[9px] text-slate-400 group-hover:text-[#856428] mt-0.5">+ Programmer</span>
                  </div>
                ` : daySessions.map(s => {
                  const levelLabel = I18n.getLevelLabel(s.level);
                  const groupColor = s.group_color || '#4f46e5';

                  return `
                    <div class="p-3 rounded-2xl border bg-white border-[#ded7ca] text-slate-900 shadow-2xs transition-all relative group" style="border-left: 4px solid ${groupColor};">
                      
                      <!-- Top Line: Time -->
                      <div class="flex items-center justify-between text-[10px] font-black pb-1.5 border-b border-black/5 gap-1">
                        <span class="px-2 py-0.5 rounded-lg font-mono bg-[#f4eee3] text-slate-800">
                          ${s.start_time} — ${s.end_time}
                        </span>

                        <span class="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-[#eee7db] text-slate-700">
                          🔁 Hebdo
                        </span>
                      </div>

                      <!-- Group Name & Info -->
                      <div class="pt-2">
                        <h4 class="text-xs font-black truncate leading-tight flex items-center gap-1.5" style="color: ${groupColor};">
                          <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${groupColor};"></span>
                          <span class="truncate text-slate-900">${s.group_name}</span>
                        </h4>
                        <p class="text-[10px] text-slate-500 font-semibold truncate mt-0.5">${levelLabel} • 📍 ${s.location || 'Salle 1'}</p>
                      </div>

                      <!-- Bottom Line: Attendance Status & Actions -->
                      <div class="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between text-[10px]">
                        <span class="font-bold ${s.is_completed ? 'text-emerald-700' : 'text-slate-500'}">
                          ${s.is_completed ? `✅ Appel fait` : `👥 ${s.student_count} élève${s.student_count > 1 ? 's' : ''}`}
                        </span>

                        <div class="flex items-center gap-1">
                          <button onclick="PlanningView.quickTakeAttendance(${s.group_id}, '${s.date}')" title="Faire l'appel" class="p-1.5 rounded-lg ${s.is_completed ? 'bg-emerald-100 text-emerald-800' : 'bg-[#c5a059]/15 text-[#856428]'} hover:scale-105 transition-transform">
                            <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
                          </button>
                          
                          ${State.isAdmin() ? `
                          <button onclick="PlanningView.openEditModal(${s.group_id})" title="Modifier l'horaire" class="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                            <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
                          </button>
                          <button onclick="PlanningView.confirmDirectDelete(${s.group_id}, '${s.group_name}')" title="Supprimer la programmation" class="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors flex items-center gap-1 text-[10px] font-bold">
                            <i data-lucide="trash-2" class="w-3 h-3"></i>
                            <span>${isAr ? 'حذف' : 'Supprimer'}</span>
                          </button>
                          ` : ''}
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

  // --- 2. TIMETABLE GRID VIEW (08:00 → 22:00) ---
  renderTimetableGrid(container, labelEl) {
    const weekDays = this.getWeekDates();
    const locale = I18n.currentLang === 'ar' ? 'ar-TN' : 'fr-FR';
    const isAr = I18n.currentLang === 'ar';

    if (labelEl) {
      const opt = { day: 'numeric', month: 'short' };
      labelEl.innerText = `${weekDays[0].toLocaleDateString(locale, opt)} — ${weekDays[6].toLocaleDateString(locale, { ...opt, year: 'numeric' })}`;
    }

    const dayNamesFr = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'];
    const dayNamesAr = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];
    const dayNames = isAr ? dayNamesAr : dayNamesFr;
    const todayStr = new Date().toISOString().split('T')[0];

    const hours = [];
    for (let h = this.minHour; h <= this.maxHour; h++) {
      hours.push(String(h).padStart(2, '0') + ':00');
    }

    const hourRowHeight = 60;
    const totalGridHeight = hours.length * hourRowHeight;

    container.innerHTML = `
      <div class="overflow-x-auto select-none">
        <div class="min-w-[850px]">
          
          <!-- Sticky Header: Days -->
          <div class="grid grid-cols-8 gap-0 border-b border-[#ebd9b5] bg-[#fbf9f4] rounded-2xl overflow-hidden sticky top-0 z-20 shadow-2xs">
            <div class="p-3 text-center border-r border-[#ebd9b5] flex flex-col items-center justify-center bg-[#f7f2e7]">
              <i data-lucide="clock" class="w-4 h-4 text-[#a27e38]"></i>
              <span class="text-[10px] font-black text-slate-500 mt-0.5">${isAr ? 'التوقيت' : 'HEURE'}</span>
            </div>

            ${weekDays.map((dObj, idx) => {
              const yyyy = dObj.getFullYear();
              const mm = String(dObj.getMonth() + 1).padStart(2, '0');
              const dd = String(dObj.getDate()).padStart(2, '0');
              const dStr = `${yyyy}-${mm}-${dd}`;
              const isToday = (todayStr === dStr);
              return `
                <div class="p-2.5 sm:p-3 text-center border-r last:border-r-0 border-[#ebd9b5] ${isToday ? 'bg-[#f5ecda] text-[#856428]' : 'text-slate-800'}">
                  <div class="flex items-center justify-center gap-1">
                    <span class="text-xs font-black tracking-wider uppercase">${dayNames[idx]}</span>
                    ${isToday ? `<span class="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-[#c5a059] text-white">Auj</span>` : ''}
                  </div>
                  <p class="text-[11px] font-bold text-slate-500 mt-0.5">
                    ${dObj.getDate()} ${dObj.toLocaleDateString(locale, { month: 'short' })}
                  </p>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Timetable Body Grid -->
          <div class="relative grid grid-cols-8 gap-0 border-b border-l border-r border-[#ede7db] bg-white rounded-b-2xl overflow-hidden" style="height: ${totalGridHeight}px;">
            
            <!-- Left: Hours Axis -->
            <div class="border-r border-[#ebd9b5] bg-[#faf8f5] flex flex-col">
              ${hours.map(h => `
                <div class="h-[60px] border-b border-[#ede7db] pr-2.5 pt-1.5 text-right rtl:text-left rtl:pl-2.5 text-xs font-mono font-bold text-slate-500">
                  ${h}
                </div>
              `).join('')}
            </div>

            <!-- 7 Day Columns -->
            ${weekDays.map((dObj, idx) => {
              const yyyy = dObj.getFullYear();
              const mm = String(dObj.getMonth() + 1).padStart(2, '0');
              const dd = String(dObj.getDate()).padStart(2, '0');
              const dStr = `${yyyy}-${mm}-${dd}`;
              const isToday = (todayStr === dStr);
              const daySessions = (this.sessions || []).filter(s => s.date === dStr);

              return `
                <div class="relative border-r last:border-r-0 border-[#ede7db] ${isToday ? 'bg-[#fdfbf7]/60' : 'bg-white'} group/col">
                  
                  <!-- Clickable Background Hour Cells -->
                  ${hours.map((h, hIdx) => {
                    const slotHour = String(this.minHour + hIdx).padStart(2, '0') + ':00';
                    return `
                      <div 
                        onclick="PlanningView.openSchedulerModal(${idx}, '${slotHour}')"
                        class="h-[60px] border-b border-[#f2ece1] hover:bg-[#c5a059]/10 cursor-pointer transition-colors relative group/cell"
                        title="Programmer ${dayNames[idx]} à ${slotHour}"
                      >
                        <span class="absolute top-1 left-1.5 text-[9px] font-bold text-[#c5a059] opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-none">
                          + ${slotHour}
                        </span>
                      </div>
                    `;
                  }).join('')}

                  <!-- Floating Session Blocks -->
                  ${daySessions.map(s => {
                    const [sH, sM] = (s.start_time || '10:00').split(':').map(Number);
                    const [eH, eM] = (s.end_time || '12:00').split(':').map(Number);
                    
                    const startMinutesFromBase = (sH - this.minHour) * 60 + sM;
                    const durationMinutes = (eH * 60 + eM) - (sH * 60 + sM);
                    
                    const topPx = (startMinutesFromBase / 60) * hourRowHeight;
                    const heightPx = Math.max(40, (durationMinutes / 60) * hourRowHeight - 4);
                    const groupColor = s.group_color || '#4f46e5';

                    return `
                      <div 
                        class="absolute left-1 right-1 rounded-xl p-2 transition-all shadow-xs hover:shadow-md z-10 flex flex-col justify-between overflow-hidden border bg-white border-[#ded7ca] text-slate-900"
                        style="top: ${topPx}px; height: ${heightPx}px; border-left: 4px solid ${groupColor};"
                      >
                        <div class="flex items-center justify-between text-[10px] font-black leading-none gap-1">
                          <span class="font-mono px-1.5 py-0.5 rounded bg-black/5 text-slate-800">
                            ${s.start_time} - ${s.end_time}
                          </span>
                          <span class="px-1 py-0.2 rounded bg-[#eee7db] text-slate-700 font-bold text-[8px]">🔁 Hebdo</span>
                        </div>

                        <div class="my-auto py-0.5">
                          <h4 class="text-xs font-black truncate leading-tight flex items-center gap-1" style="color: ${groupColor};">
                            <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${groupColor};"></span>
                            <span class="truncate">${s.group_name}</span>
                          </h4>
                          <p class="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                            📍 ${s.location || 'Salle 1'} • 👥 ${s.student_count} él.
                          </p>
                        </div>

                        <div class="flex items-center justify-between text-[9px] font-bold pt-1 border-t border-black/5" onclick="event.stopPropagation()">
                          <span class="${s.is_completed ? 'text-emerald-700' : 'text-slate-400'}">
                            ${s.is_completed ? `Pointé` : `${Math.floor(durationMinutes / 60)}h${durationMinutes % 60 ? durationMinutes % 60 : ''}`}
                          </span>

                          <div class="flex items-center gap-1">
                            <button onclick="PlanningView.quickTakeAttendance(${s.group_id}, '${s.date}')" title="Faire l'appel" class="p-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors">
                              <i data-lucide="check-circle" class="w-3 h-3"></i>
                            </button>
                            ${State.isAdmin() ? `
                            <button onclick="PlanningView.openEditModal(${s.group_id})" title="Modifier" class="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
                              <i data-lucide="edit-2" class="w-3 h-3"></i>
                            </button>
                            <button onclick="PlanningView.confirmDirectDelete(${s.group_id}, '${s.group_name}')" title="Supprimer la programmation" class="px-1.5 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors flex items-center gap-1 text-[9px] font-bold">
                              <i data-lucide="trash-2" class="w-2.5 h-2.5"></i>
                              <span>${isAr ? 'حذف' : 'Supprimer'}</span>
                            </button>
                            ` : ''}
                          </div>
                        </div>

                      </div>
                    `;
                  }).join('')}

                </div>
              `;
            }).join('')}

          </div>
        </div>
      </div>
    `;
  },

  // --- 3. LIST VIEW ---
  renderListView(container, labelEl) {
    const isAr = I18n.currentLang === 'ar';
    const dayNamesFr = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const dayNamesAr = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];
    const dayNames = isAr ? dayNamesAr : dayNamesFr;

    if (labelEl) labelEl.innerText = isAr ? 'جميع الحصص الأسبوعية' : 'Liste des Créneaux Hebdomadaires';

    const groups = (State.groups || []).filter(g => g.day_of_week !== null && g.day_of_week !== undefined && g.start_time && g.end_time);
    groups.sort((a, b) => (a.day_of_week - b.day_of_week) || (a.start_time || '').localeCompare(b.start_time || ''));

    if (groups.length === 0) {
      container.innerHTML = `
        <div class="p-12 text-center text-slate-400 text-sm">
          <i data-lucide="calendar" class="w-10 h-10 mx-auto text-slate-300 mb-2"></i>
          <p class="font-bold text-slate-700">${I18n.t('noLessons')}</p>
          <p class="text-xs text-slate-400 mt-1">${isAr ? 'لم تتم برمجة أي فوج بعد.' : 'Aucun groupe n\'a encore d\'horaire programmé.'}</p>
          ${State.isAdmin() ? `
          <button onclick="PlanningView.openSchedulerModal()" class="mt-4 px-4 py-2.5 btn-gold-action text-xs font-black">
            + ${isAr ? 'برمجة فوج' : 'Programmer un créneau'}
          </button>
          ` : ''}
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-left rtl:text-right text-xs sm:text-sm">
          <thead class="bg-[#faf8f5] text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-[#ede7db]">
            <tr>
              <th class="px-6 py-3.5">${isAr ? 'اليوم' : 'Jour de la semaine'}</th>
              <th class="px-6 py-3.5">${I18n.t('time')}</th>
              <th class="px-6 py-3.5">${I18n.t('group')}</th>
              <th class="px-6 py-3.5">${isAr ? 'القاعة' : 'Salle'}</th>
              <th class="px-6 py-3.5">${I18n.t('students')}</th>
              <th class="px-6 py-3.5 text-right rtl:text-left">${I18n.t('actions')}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#f2ece1]">
            ${groups.map(g => `
              <tr class="hover:bg-[#fdfbf7] transition-colors">
                <td class="px-6 py-4 font-black text-slate-900">${dayNames[g.day_of_week] || 'Jour'}</td>
                <td class="px-6 py-4 font-mono font-bold text-slate-700 bg-[#fbf9f5] rounded-lg">${g.start_time} — ${g.end_time}</td>
                <td class="px-6 py-4 font-black text-slate-900">
                  <div class="flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${g.color || '#4f46e5'};"></span>
                    <span>${g.name}</span>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-[#eee7db] text-slate-700">${g.level}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-slate-600 font-medium">📍 ${g.location || 'Salle 1'}</td>
                <td class="px-6 py-4 font-bold">${g.student_count || 0} / ${g.capacity || 15} élèves</td>
                <td class="px-6 py-4 text-right rtl:text-left">
                  <div class="flex items-center justify-end rtl:justify-start gap-2">
                    ${State.isAdmin() ? `
                    <button onclick="PlanningView.openEditModal(${g.id})" class="p-1.5 text-slate-400 hover:text-[#a27e38] rounded-xl transition-colors" title="Modifier">
                      <i data-lucide="edit-3" class="w-4 h-4"></i>
                    </button>
                    <button onclick="PlanningView.confirmDirectDelete(${g.id}, '${g.name}')" class="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 flex items-center gap-1 transition-colors" title="Supprimer">
                      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                      <span>${isAr ? 'حذف' : 'Supprimer'}</span>
                    </button>
                    ` : ''}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  async quickTakeAttendance(groupId, dateStr) {
    if (window.AttendanceView && AttendanceView.openForGroupAndDate) {
      AttendanceView.openForGroupAndDate(groupId, dateStr);
    } else {
      window.location.hash = '#attendance';
    }
  },

  // --- 4. ADD / SCHEDULE MODAL ---
  openSchedulerModal(defaultDayIdx = null, defaultStartHour = null) {
    const groups = State.groups || [];
    const isAr = I18n.currentLang === 'ar';
    const weekdaysFr = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const weekdaysAr = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];
    const weekdays = isAr ? weekdaysAr : weekdaysFr;

    const initialDayIndex = defaultDayIdx !== null && defaultDayIdx !== undefined ? defaultDayIdx : 0;
    const startTime = defaultStartHour || '10:00';
    const [h, m] = startTime.split(':').map(Number);
    const endH = Math.min(22, h + 2);
    const endTime = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    Modal.open({
      title: isAr ? '🗓️ برمجة حصة أسبوعية للفوج' : '🗓️ Programmer un créneau hebdomadaire',
      size: 'max-w-lg',
      html: `
        <form id="scheduler-form" class="space-y-4">
          
          <!-- Group Select -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${isAr ? 'الفوج المعني *' : 'Groupe concerné *'}</label>
            <select id="sched-group-id" required class="w-full px-3.5 py-2.5 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 bg-white font-bold text-slate-900">
              <option value="">-- ${isAr ? 'اختر الفوج' : 'Sélectionner un groupe'} --</option>
              ${groups.map(g => {
                const levelLabel = I18n.getLevelLabel(g.level);
                return `
                  <option value="${g.id}">
                    ${g.name} (${levelLabel} • ${g.student_count || 0} élèves) ${g.schedule ? `[Actuel: ${g.schedule}]` : ''}
                  </option>
                `;
              }).join('')}
            </select>
          </div>

          <!-- Day of week Pills -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${isAr ? 'يوم الحصة في الأسبوع (يتكرر كل أسبوع) *' : 'Jour de la semaine (Répété chaque semaine) *'}</label>
            <div class="grid grid-cols-7 gap-1.5" id="sched-weekday-pills">
              ${weekdays.map((wName, idx) => `
                <button type="button" class="weekday-pill py-2.5 text-center rounded-xl border border-[#ded7ca] bg-white font-black text-xs transition-all ${idx === initialDayIndex ? 'active bg-[#c5a059] text-white border-[#c5a059]' : 'text-slate-700 hover:bg-[#faf6ee]'}" data-idx="${idx}">
                  ${wName.substring(0, 3)}
                </button>
              `).join('')}
            </div>
            <input type="hidden" id="sched-day-idx" value="${initialDayIndex}">
          </div>

          <!-- Hours & Duration -->
          <div class="space-y-2">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${isAr ? 'وقت البداية *' : 'Heure de début *'}</label>
                <input id="sched-start-time" type="time" required value="${startTime}" class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 font-mono font-bold">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${isAr ? 'وقت النهاية *' : 'Heure de fin *'}</label>
                <input id="sched-end-time" type="time" required value="${endTime}" class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 font-mono font-bold">
              </div>
            </div>

            <!-- Quick Duration Chips -->
            <div class="flex items-center gap-1.5 pt-0.5">
              <span class="text-[10px] text-slate-400 font-bold uppercase">${isAr ? 'المدة :' : 'Durée :'}</span>
              <button type="button" onclick="PlanningView.setDuration(60)" class="px-2.5 py-1 rounded-lg bg-[#eee7db] hover:bg-[#c5a059] hover:text-white text-[10px] font-black transition-colors">1h00</button>
              <button type="button" onclick="PlanningView.setDuration(90)" class="px-2.5 py-1 rounded-lg bg-[#eee7db] hover:bg-[#c5a059] hover:text-white text-[10px] font-black transition-colors">1h30</button>
              <button type="button" onclick="PlanningView.setDuration(120)" class="px-2.5 py-1 rounded-lg bg-[#c5a059] text-white text-[10px] font-black transition-colors">2h00</button>
              <button type="button" onclick="PlanningView.setDuration(150)" class="px-2.5 py-1 rounded-lg bg-[#eee7db] hover:bg-[#c5a059] hover:text-white text-[10px] font-black transition-colors">2h30</button>
            </div>
          </div>

          <!-- Location -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${isAr ? 'المكان / القاعة' : 'Salle / Lieu'}</label>
            <input id="sched-location" type="text" value="Salle 1" class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 font-medium">
          </div>

          <!-- Footer Buttons -->
          <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-[#ede7db]">
            <button type="button" onclick="Modal.close()" class="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-[#ede5d8] rounded-2xl transition-colors">
              ${isAr ? 'إلغاء' : 'Annuler'}
            </button>
            <button type="submit" class="px-5 py-2.5 btn-gold-action text-xs sm:text-sm font-black flex items-center gap-1.5">
              <i data-lucide="calendar-check" class="w-4 h-4"></i>
              <span>${isAr ? 'تأكيد التسجيل في الجدول' : 'Enregistrer dans le planning'}</span>
            </button>
          </div>
        </form>
      `,
      onOpen: (content) => {
        if (window.lucide) lucide.createIcons();

        const dayInput = content.querySelector('#sched-day-idx');
        const weekdayPills = content.querySelectorAll('#sched-weekday-pills .weekday-pill');

        weekdayPills.forEach(p => {
          p.addEventListener('click', () => {
            weekdayPills.forEach(pill => {
              pill.classList.remove('active', 'bg-[#c5a059]', 'text-white', 'border-[#c5a059]');
              pill.classList.add('text-slate-700', 'bg-white', 'border-[#ded7ca]');
            });
            p.classList.add('active', 'bg-[#c5a059]', 'text-white', 'border-[#c5a059]');
            p.classList.remove('text-slate-700', 'bg-white', 'border-[#ded7ca]');
            dayInput.value = p.getAttribute('data-idx');
          });
        });

        const form = content.querySelector('#scheduler-form');
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const groupId = parseInt(content.querySelector('#sched-group-id').value);
          const dayIdx = parseInt(dayInput.value);
          const startTime = content.querySelector('#sched-start-time').value;
          const endTime = content.querySelector('#sched-end-time').value;
          const location = content.querySelector('#sched-location').value.trim() || 'Salle 1';

          try {
            await API.post('/api/sessions/set-group-recurring', {
              group_id: groupId,
              day_of_week: dayIdx,
              start_time: startTime,
              end_time: endTime,
              location: location
            });

            Toast.success(isAr ? 'تم تسجيل التوقيت الأسبوعي للفوج بنجاح.' : 'Créneau hebdomadaire enregistré avec succès !');
            Modal.close();
            await State.loadInitialData();
            await PlanningView.loadSessions(document.getElementById('main-view'));
          } catch (err) {
            Toast.error(err.message || 'Erreur lors de l\'enregistrement.');
          }
        });
      }
    });
  },

  // --- 5. EDIT MODAL ---
  openEditModal(groupId) {
    const group = (State.groups || []).find(g => g.id === groupId);
    if (!group) return;

    const isAr = I18n.currentLang === 'ar';
    const weekdaysFr = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const weekdaysAr = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];
    const weekdays = isAr ? weekdaysAr : weekdaysFr;

    const currentDay = (group.day_of_week !== null && group.day_of_week !== undefined) ? group.day_of_week : 0;
    const currentStart = group.start_time || '10:00';
    const currentEnd = group.end_time || '12:00';

    Modal.open({
      title: `${isAr ? 'تعديل التوقيت الأسبوعي' : 'Modifier le créneau'} : ${group.name}`,
      size: 'max-w-lg',
      html: `
        <form id="edit-scheduler-form" class="space-y-4">
          
          <div class="p-3 bg-[#faf8f5] rounded-2xl border border-[#ede7db] flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full" style="background-color: ${group.color || '#4f46e5'};"></span>
              <strong class="text-sm font-black text-slate-900">${group.name}</strong>
              <span class="text-xs font-bold px-2 py-0.5 rounded bg-[#eee7db] text-slate-700">${group.level}</span>
            </div>
            <span class="text-xs text-slate-500 font-bold">${group.student_count || 0} élèves</span>
          </div>

          <!-- Day of week Pills -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${isAr ? 'يوم الحصة في الأسبوع *' : 'Jour de la semaine *'}</label>
            <div class="grid grid-cols-7 gap-1.5" id="edit-weekday-pills">
              ${weekdays.map((wName, idx) => `
                <button type="button" class="weekday-pill py-2.5 text-center rounded-xl border border-[#ded7ca] bg-white font-black text-xs transition-all ${idx === currentDay ? 'active bg-[#c5a059] text-white border-[#c5a059]' : 'text-slate-700 hover:bg-[#faf6ee]'}" data-idx="${idx}">
                  ${wName.substring(0, 3)}
                </button>
              `).join('')}
            </div>
            <input type="hidden" id="edit-day-idx" value="${currentDay}">
          </div>

          <!-- Hours & Duration -->
          <div class="space-y-2">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${isAr ? 'وقت البداية *' : 'Heure de début *'}</label>
                <input id="edit-start-time" type="time" required value="${currentStart}" class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 font-mono font-bold">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${isAr ? 'وقت النهاية *' : 'Heure de fin *'}</label>
                <input id="edit-end-time" type="time" required value="${currentEnd}" class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 font-mono font-bold">
              </div>
            </div>

            <!-- Quick Duration Chips -->
            <div class="flex items-center gap-1.5 pt-0.5">
              <span class="text-[10px] text-slate-400 font-bold uppercase">${isAr ? 'المدة :' : 'Durée :'}</span>
              <button type="button" onclick="PlanningView.setEditDuration(60)" class="px-2.5 py-1 rounded-lg bg-[#eee7db] hover:bg-[#c5a059] hover:text-white text-[10px] font-black transition-colors">1h00</button>
              <button type="button" onclick="PlanningView.setEditDuration(90)" class="px-2.5 py-1 rounded-lg bg-[#eee7db] hover:bg-[#c5a059] hover:text-white text-[10px] font-black transition-colors">1h30</button>
              <button type="button" onclick="PlanningView.setEditDuration(120)" class="px-2.5 py-1 rounded-lg bg-[#c5a059] text-white text-[10px] font-black transition-colors">2h00</button>
              <button type="button" onclick="PlanningView.setEditDuration(150)" class="px-2.5 py-1 rounded-lg bg-[#eee7db] hover:bg-[#c5a059] hover:text-white text-[10px] font-black transition-colors">2h30</button>
            </div>
          </div>

          <!-- Location -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${isAr ? 'المكان / القاعة' : 'Salle / Lieu'}</label>
            <input id="edit-location" type="text" value="${group.location || 'Salle 1'}" class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 font-medium">
          </div>

          <!-- Footer Buttons -->
          <div class="flex items-center justify-between pt-4 border-t border-[#ede7db]">
            <button type="button" onclick="Modal.close(); PlanningView.confirmDirectDelete(${group.id}, '${group.name}')" class="px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors flex items-center gap-1.5">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
              <span>${isAr ? 'حذف من الجدول' : 'Supprimer le créneau'}</span>
            </button>

            <div class="flex items-center gap-2">
              <button type="button" onclick="Modal.close()" class="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-[#ede5d8] rounded-2xl transition-colors">
                ${isAr ? 'إلغاء' : 'Annuler'}
              </button>
              <button type="submit" class="px-5 py-2.5 btn-gold-action text-xs sm:text-sm font-black flex items-center gap-1.5">
                <i data-lucide="check" class="w-4 h-4"></i>
                <span>${isAr ? 'حفظ التعديل' : 'Enregistrer'}</span>
              </button>
            </div>
          </div>
        </form>
      `,
      onOpen: (content) => {
        if (window.lucide) lucide.createIcons();

        const dayInput = content.querySelector('#edit-day-idx');
        const weekdayPills = content.querySelectorAll('#edit-weekday-pills .weekday-pill');

        weekdayPills.forEach(p => {
          p.addEventListener('click', () => {
            weekdayPills.forEach(pill => {
              pill.classList.remove('active', 'bg-[#c5a059]', 'text-white', 'border-[#c5a059]');
              pill.classList.add('text-slate-700', 'bg-white', 'border-[#ded7ca]');
            });
            p.classList.add('active', 'bg-[#c5a059]', 'text-white', 'border-[#c5a059]');
            p.classList.remove('text-slate-700', 'bg-white', 'border-[#ded7ca]');
            dayInput.value = p.getAttribute('data-idx');
          });
        });

        const form = content.querySelector('#edit-scheduler-form');
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const dayIdx = parseInt(dayInput.value);
          const startTime = content.querySelector('#edit-start-time').value;
          const endTime = content.querySelector('#edit-end-time').value;
          const location = content.querySelector('#edit-location').value.trim() || 'Salle 1';

          try {
            await API.post('/api/sessions/set-group-recurring', {
              group_id: groupId,
              day_of_week: dayIdx,
              start_time: startTime,
              end_time: endTime,
              location: location
            });

            Toast.success(isAr ? 'تم تحديث التوقيت الأسبوعي بنجاح.' : 'Créneau mis à jour avec succès !');
            Modal.close();
            await State.loadInitialData();
            await PlanningView.loadSessions(document.getElementById('main-view'));
          } catch (err) {
            Toast.error(err.message || 'Erreur lors de la mise à jour.');
          }
        });
      }
    });
  },

  setDuration(minutes) {
    const startInput = document.getElementById('sched-start-time');
    const endInput = document.getElementById('sched-end-time');
    if (!startInput || !endInput) return;
    const [h, m] = startInput.value.split(':').map(Number);
    const totalStartMinutes = h * 60 + m;
    const totalEndMinutes = Math.min(22 * 60, totalStartMinutes + minutes);
    const endH = Math.floor(totalEndMinutes / 60);
    const endM = totalEndMinutes % 60;
    endInput.value = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  },

  setEditDuration(minutes) {
    const startInput = document.getElementById('edit-start-time');
    const endInput = document.getElementById('edit-end-time');
    if (!startInput || !endInput) return;
    const [h, m] = startInput.value.split(':').map(Number);
    const totalStartMinutes = h * 60 + m;
    const totalEndMinutes = Math.min(22 * 60, totalStartMinutes + minutes);
    const endH = Math.floor(totalEndMinutes / 60);
    const endM = totalEndMinutes % 60;
    endInput.value = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  },

  // --- 6. DIRECT DELETE METHOD ---
  confirmDirectDelete(groupId, groupName = '') {
    const isAr = I18n.currentLang === 'ar';
    Modal.confirm({
      title: isAr ? '🗑️ تأكيد حذف الحصة من الجدول' : '🗑️ Confirmation de suppression',
      message: isAr 
        ? `هل أنت متأكد من رغبتك في حذف التوقيت الأسبوعي لـ "${groupName || 'هذا الفوج'}" ؟ سيتم حذفه نهائياً من جميع الأسابيع.` 
        : `Êtes-vous sûr de vouloir supprimer la programmation hebdomadaire de "${groupName || 'ce groupe'}" ? Ce créneau sera supprimé de toutes les semaines.`,
      confirmText: isAr ? '🗑 حذف نهائي' : '🗑 Supprimer',
      cancelText: isAr ? 'إلغاء' : 'Annuler',
      confirmClass: 'bg-rose-600 hover:bg-rose-700 text-white font-bold',
      onConfirm: async () => {
        try {
          await API.delete(`/api/sessions/group/${groupId}`);
          Toast.success(isAr ? 'تم حذف الحصة الأسبوعية بنجاح.' : 'Programmation hebdomadaire supprimée avec succès.');
          await State.loadInitialData();
          await PlanningView.loadSessions(document.getElementById('main-view'));
        } catch (e) {
          Toast.error(e.message || (isAr ? 'حدث خطأ أثناء الحذف.' : 'Erreur lors de la suppression.'));
        }
      }
    });
  },

  deleteSession(sessionId, groupId = null, dateStr = null) {
    const targetGroupId = groupId || sessionId;
    this.confirmDirectDelete(targetGroupId);
  },

  openSessionDetail(groupId, dateStr) {
    this.openEditModal(groupId);
  }
};
