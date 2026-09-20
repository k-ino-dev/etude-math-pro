// Planning & Timetable View — 2026 Commercial Edition (Étude Math Pro)
const PlanningView = {
  viewMode: 'grid', // 'grid' (Timetable 06:00-22:00), 'week', 'day', 'month', 'list'
  currentDate: new Date(),
  sessions: [],
  minHour: 6,  // 06:00
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
              ${isAr ? 'جدول أوقات أسبوعي قار ومنظم من 06:00 إلى 22:00 مع إمكانية التعديل الاستثنائي أو الدائم.' : 'Emploi du temps hebdomadaire fixe (06h00 à 22h00) avec placement par créneaux et gestion des exceptions.'}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2.5">
            <!-- View Mode Switcher -->
            <div class="flex bg-[#eee7db] p-1 rounded-2xl border border-[#ded5c5] text-xs font-bold text-slate-700">
              <button onclick="PlanningView.setViewMode('grid')" id="plan-btn-grid" class="px-3 py-1.5 rounded-xl transition-all ${this.viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}">${isAr ? 'جدول الساعات' : 'Emploi du Temps'}</button>
              <button onclick="PlanningView.setViewMode('week')" id="plan-btn-week" class="px-3 py-1.5 rounded-xl transition-all ${this.viewMode === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}">${isAr ? 'الأسبوع' : 'Semaine'}</button>
              <button onclick="PlanningView.setViewMode('day')" id="plan-btn-day" class="px-3 py-1.5 rounded-xl transition-all ${this.viewMode === 'day' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}">${I18n.t('day')}</button>
              <button onclick="PlanningView.setViewMode('month')" id="plan-btn-month" class="px-3 py-1.5 rounded-xl transition-all ${this.viewMode === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}">${I18n.t('month')}</button>
              <button onclick="PlanningView.setViewMode('list')" id="plan-btn-list" class="px-3 py-1.5 rounded-xl transition-all ${this.viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}">${I18n.t('list')}</button>
            </div>

            <!-- Master Timetable Overview Button -->
            <button onclick="PlanningView.openTimetableSummaryModal()" class="px-3.5 py-2.5 bg-white hover:bg-[#fbf9f4] text-slate-800 border border-[#ded7ca] text-xs sm:text-sm font-bold rounded-2xl shadow-xs transition-all flex items-center gap-1.5">
              <i data-lucide="layout-grid" class="w-4 h-4 text-[#a27e38]"></i>
              <span>${isAr ? 'عرض جدول الأوقات الكامل' : 'Emploi du temps complet'}</span>
            </button>

            <!-- Download Tomorrow's PDF -->
            <a href="/api/reports/daily/tomorrow/pdf" target="_blank" class="px-3.5 py-2.5 bg-white hover:bg-[#fbf9f4] text-slate-700 border border-[#ded7ca] text-xs sm:text-sm font-bold rounded-2xl shadow-xs transition-all flex items-center gap-1.5 hidden sm:inline-flex">
              <i data-lucide="file-text" class="w-4 h-4 text-[#a27e38]"></i>
              <span>${I18n.t('downloadTomorrowPdf')}</span>
            </a>

            <!-- Add Slot / Session Button -->
            <button onclick="PlanningView.openSchedulerModal()" class="px-4 py-2.5 btn-gold-action text-xs sm:text-sm font-black flex items-center gap-2">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>+ ${isAr ? 'برمجة حصة / فوج' : 'Programmer un créneau'}</span>
            </button>
          </div>
        </div>

        <!-- Navigation Bar & Visual Legend -->
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
            <span class="inline-flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> ${I18n.t('attendanceTaken')}</span>
            <span class="inline-flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-[#c5a059]"></span> ${isAr ? 'أسبوعي قار' : 'Horaire habituel fixe'}</span>
            <span class="inline-flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> ${isAr ? 'تعديل استثنائي' : 'Exception'}</span>
            <span class="inline-flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> ${I18n.t('conflictDetected')}</span>
          </div>
        </div>

        <!-- Timetable / Calendar Content Container -->
        <div id="calendar-content" class="bg-white rounded-3xl p-3 sm:p-5 border border-[#ede7db] shadow-xs min-h-[580px] overflow-hidden">
          <!-- Injected dynamically -->
        </div>

      </div>
    `;

    if (window.lucide) lucide.createIcons();
    await this.loadSessions(container);
  },

  setViewMode(mode) {
    this.viewMode = mode;
    ['grid', 'week', 'day', 'month', 'list'].forEach(m => {
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

    if (this.viewMode === 'grid') {
      this.renderTimetableGrid(calContent, periodLabel);
    } else if (this.viewMode === 'week') {
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

  // Calculate 7 days of the current week (Lundi to Dimanche)
  getWeekDates() {
    const curr = new Date(this.currentDate);
    const day = curr.getDay(); // 0 is Sunday, 1 is Monday...
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

  // --- 1. TRUE TIMETABLE GRID (06:00 → 22:00) ---
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

    // Generate hours: 06:00, 07:00, ..., 22:00
    const hours = [];
    for (let h = this.minHour; h <= this.maxHour; h++) {
      hours.push(String(h).padStart(2, '0') + ':00');
    }

    const totalMinutes = (this.maxHour - this.minHour + 1) * 60;
    const hourRowHeight = 60; // 60px per hour
    const totalGridHeight = hours.length * hourRowHeight;

    container.innerHTML = `
      <div class="overflow-x-auto select-none">
        <div class="min-w-[850px]">
          
          <!-- Sticky Header: Days of the week -->
          <div class="grid grid-cols-8 gap-0 border-b border-[#ebd9b5] bg-[#fbf9f4] rounded-2xl overflow-hidden sticky top-0 z-20 shadow-2xs">
            <!-- Time axis header corner -->
            <div class="p-3 text-center border-r border-[#ebd9b5] flex flex-col items-center justify-center bg-[#f7f2e7]">
              <i data-lucide="clock" class="w-4 h-4 text-[#a27e38]"></i>
              <span class="text-[10px] font-black text-slate-500 mt-0.5">${isAr ? 'التوقيت' : 'HEURE'}</span>
            </div>

            <!-- 7 Days headers -->
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

          <!-- Timetable Body: Time Slots Grid + Floating Session Blocks -->
          <div class="relative grid grid-cols-8 gap-0 border-b border-l border-r border-[#ede7db] bg-white rounded-b-2xl overflow-hidden" style="height: ${totalGridHeight}px;">
            
            <!-- Left Column: Hours Axis -->
            <div class="border-r border-[#ebd9b5] bg-[#faf8f5] flex flex-col">
              ${hours.map((h, i) => `
                <div class="h-[60px] border-b border-[#ede7db] pr-2.5 pt-1.5 text-right rtl:text-left rtl:pl-2.5 text-xs font-mono font-bold text-slate-500">
                  ${h}
                </div>
              `).join('')}
            </div>

            <!-- 7 Day Columns with Background Grid & Sessions -->
            ${weekDays.map((dObj, idx) => {
              const yyyy = dObj.getFullYear();
              const mm = String(dObj.getMonth() + 1).padStart(2, '0');
              const dd = String(dObj.getDate()).padStart(2, '0');
              const dStr = `${yyyy}-${mm}-${dd}`;
              const isToday = (todayStr === dStr);

              // Filter sessions on this day
              const daySessions = (this.sessions || []).filter(s => s.date === dStr);

              return `
                <div class="relative border-r last:border-r-0 border-[#ede7db] ${isToday ? 'bg-[#fdfbf7]/60' : 'bg-white'} group/col">
                  
                  <!-- Clickable Background Hour Cells -->
                  ${hours.map((h, hIdx) => {
                    const slotHour = String(this.minHour + hIdx).padStart(2, '0') + ':00';
                    return `
                      <div 
                        onclick="PlanningView.openSlotScheduler('${dStr}', ${idx}, '${slotHour}')"
                        class="h-[60px] border-b border-[#f2ece1] hover:bg-[#c5a059]/10 cursor-pointer transition-colors relative group/cell"
                        title="Programmer une séance ${dayNames[idx]} à ${slotHour}"
                      >
                        <span class="absolute top-1 left-1.5 text-[9px] font-bold text-[#c5a059] opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-none">
                          + ${slotHour}
                        </span>
                      </div>
                    `;
                  }).join('')}

                  <!-- Floating Session Blocks on this day -->
                  ${daySessions.map(s => {
                    // Calculate top and height in percentages
                    const [sH, sM] = (s.start_time || '10:00').split(':').map(Number);
                    const [eH, eM] = (s.end_time || '12:00').split(':').map(Number);
                    
                    const startMinutesFromBase = (sH - this.minHour) * 60 + sM;
                    const durationMinutes = (eH * 60 + eM) - (sH * 60 + sM);
                    
                    const topPx = (startMinutesFromBase / 60) * hourRowHeight;
                    const heightPx = Math.max(38, (durationMinutes / 60) * hourRowHeight - 4);

                    const groupColor = s.group_color || '#4f46e5';
                    const isCancelled = s.status === 'cancelled';
                    const isExc = s.is_exception;

                    return `
                      <div 
                        onclick="PlanningView.openSessionDetail(${s.group_id}, '${s.date}')"
                        class="absolute left-1 right-1 rounded-xl p-2 transition-all cursor-pointer shadow-xs hover:shadow-md hover:scale-[1.01] z-10 flex flex-col justify-between overflow-hidden border ${
                          isCancelled ? 'bg-slate-100 border-slate-300 text-slate-400 opacity-60' :
                          s.has_conflict ? 'bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-400' :
                          isExc ? 'bg-amber-50 border-amber-400 text-amber-950 ring-1 ring-amber-300' :
                          'bg-white border-[#ded7ca] text-slate-900'
                        }"
                        style="top: ${topPx}px; height: ${heightPx}px; border-left: 4px solid ${groupColor};"
                      >
                        <!-- Header Line: Time Range & Badges -->
                        <div class="flex items-center justify-between text-[10px] font-black leading-none gap-1">
                          <span class="font-mono px-1.5 py-0.5 rounded bg-black/5 ${s.is_completed ? 'text-emerald-800' : 'text-slate-800'}">
                            ${s.start_time} - ${s.end_time}
                          </span>

                          <div class="flex items-center gap-1">
                            ${isExc ? `<span class="px-1 py-0.2 rounded bg-amber-200 text-amber-900 font-extrabold text-[8px]" title="Exception">⚡ Exception</span>` : `<span class="px-1 py-0.2 rounded bg-[#eee7db] text-slate-700 font-bold text-[8px]" title="Horaire habituel">🔁 Fixe</span>`}
                            ${s.has_conflict ? `<span class="text-rose-600 font-black">⚠️</span>` : ''}
                            ${s.is_completed ? `<span class="text-emerald-700 font-black">✅</span>` : ''}
                          </div>
                        </div>

                        <!-- Body: Group Name & Details -->
                        <div class="my-auto py-0.5">
                          <h4 class="text-xs font-black truncate leading-tight flex items-center gap-1" style="color: ${groupColor};">
                            <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${groupColor};"></span>
                            <span class="truncate">${s.group_name}</span>
                          </h4>
                          <p class="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                            📍 ${s.location || 'Salle 1'} • 👥 ${s.student_count} élève${s.student_count > 1 ? 's' : ''}
                          </p>
                          ${s.topic ? `<p class="text-[9px] text-slate-600 italic truncate mt-0.5">📖 ${s.topic}</p>` : ''}
                        </div>

                        <!-- Footer Quick Action Bar (Visible on Hover/Touch) -->
                        <div class="flex items-center justify-between text-[9px] font-bold pt-1 border-t border-black/5" onclick="event.stopPropagation()">
                          <span class="${s.is_completed ? 'text-emerald-700' : 'text-slate-400'}">
                            ${s.is_completed ? `Pointé (${s.attended_count}/${s.student_count})` : `${Math.floor(durationMinutes / 60)}h${durationMinutes % 60 ? durationMinutes % 60 : ''}`}
                          </span>

                          <div class="flex items-center gap-1">
                            <button onclick="PlanningView.quickTakeAttendance(${s.group_id}, '${s.date}', ${s.id || 'null'})" title="Faire l'appel" class="p-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors">
                              <i data-lucide="check-circle" class="w-3 h-3"></i>
                            </button>
                            <button onclick="PlanningView.openSessionDetail(${s.group_id}, '${s.date}')" title="Modifier" class="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
                              <i data-lucide="edit-2" class="w-3 h-3"></i>
                            </button>
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

  // --- 2. COLUMNS WEEK VIEW ---
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

                <button onclick="PlanningView.openSlotScheduler('${dateStr}', ${idx})" title="Ajouter un créneau ce jour" class="p-1.5 text-slate-400 hover:text-[#856428] hover:bg-white rounded-xl transition-all shadow-2xs">
                  <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                </button>
              </div>

              <!-- Sessions List -->
              <div class="space-y-2.5 flex-1 overflow-y-auto pr-0.5">
                ${daySessions.length === 0 ? `
                  <div onclick="PlanningView.openSlotScheduler('${dateStr}', ${idx})" class="h-36 rounded-2xl border-2 border-dashed border-[#e8dfd1] hover:border-[#c5a059] hover:bg-white/60 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all group">
                    <i data-lucide="plus-circle" class="w-5 h-5 text-slate-300 group-hover:text-[#a27e38] transition-colors mb-1.5"></i>
                    <p class="text-[11px] font-bold text-slate-400 group-hover:text-slate-700 transition-colors">
                      ${I18n.t('noLessons')}
                    </p>
                    <span class="text-[9px] text-slate-400 group-hover:text-[#856428] mt-0.5">+ Programmer</span>
                  </div>
                ` : daySessions.map(s => {
                  const levelLabel = I18n.getLevelLabel(s.level);
                  const isCancelled = s.status === 'cancelled';
                  const groupColor = s.group_color || '#4f46e5';

                  return `
                    <div class="p-3 rounded-2xl border transition-all relative group ${
                      isCancelled ? 'bg-slate-100 border-slate-300 text-slate-400 opacity-75' :
                      s.has_conflict ? 'bg-rose-50 border-rose-300 text-rose-950 ring-1 ring-rose-300' :
                      s.is_completed ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950' : 
                      s.is_exception ? 'bg-amber-50/70 border-amber-300 text-amber-950 shadow-2xs' :
                      'bg-white border-[#ded7ca] text-slate-900 shadow-2xs'
                    }" style="border-left: 4px solid ${groupColor};">
                      
                      <!-- Top Line: Time & Badges -->
                      <div class="flex items-center justify-between text-[10px] font-black pb-1 border-b border-black/5 gap-1">
                        <span class="px-2 py-0.5 rounded-lg font-mono ${s.is_completed ? 'bg-emerald-100/70 text-emerald-900' : 'bg-[#f4eee3] text-slate-800'}">
                          ${s.start_time} — ${s.end_time}
                        </span>

                        <div class="flex items-center gap-1">
                          ${s.is_exception ? `<span class="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 border border-amber-300">⚡ Exception</span>` : `<span class="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-[#f4eee3] text-slate-600">🔁 Fixe</span>`}
                          ${s.has_conflict ? `<span class="text-rose-600 font-extrabold">⚠️</span>` : ''}
                        </div>
                      </div>

                      <!-- Group Name & Level -->
                      <div class="pt-2">
                        <h4 class="text-xs font-black truncate leading-tight flex items-center gap-1.5" style="color: ${groupColor};">
                          <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${groupColor};"></span>
                          <span class="truncate text-slate-900">${s.group_name}</span>
                        </h4>
                        <p class="text-[10px] text-slate-500 font-semibold truncate mt-0.5">${levelLabel} • 📍 ${s.location || 'Salle 1'}</p>
                        ${s.topic ? `<p class="text-[10px] text-slate-600 italic truncate mt-1">📖 ${s.topic}</p>` : ''}
                      </div>

                      <!-- Bottom Line: Attendance Status & Actions -->
                      <div class="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between text-[10px]">
                        <span class="font-bold ${s.is_completed ? 'text-emerald-700' : 'text-slate-500'}">
                          ${s.is_completed ? `✅ (${s.attended_count}/${s.student_count})` : `👥 ${s.student_count} élève${s.student_count > 1 ? 's' : ''}`}
                        </span>

                        <div class="flex items-center gap-1">
                          <button onclick="PlanningView.quickTakeAttendance(${s.group_id}, '${s.date}', ${s.id || 'null'})" title="Faire l'appel" class="p-1 rounded-lg ${s.is_completed ? 'bg-emerald-100 text-emerald-800' : 'bg-[#c5a059]/15 text-[#856428]'} hover:scale-105 transition-transform">
                            <i data-lucide="check-circle" class="w-3 h-3"></i>
                          </button>
                          <button onclick="PlanningView.openSessionDetail(${s.group_id}, '${s.date}')" title="Modifier" class="p-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
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

  // --- 3. DAY VIEW ---
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
            <button onclick="PlanningView.openSlotScheduler('${dateStr}', ${this.currentDate.getDay() === 0 ? 6 : this.currentDate.getDay() - 1})" class="mt-4 px-4 py-2.5 btn-gold-action text-xs font-black">
              + ${I18n.t('newSession')}
            </button>
          </div>
        ` : daySessions.map(s => {
          const levelLabel = I18n.getLevelLabel(s.level);
          const groupColor = s.group_color || '#4f46e5';

          return `
            <div class="p-5 rounded-3xl border ${s.has_conflict ? 'border-rose-300 bg-rose-50/60' : s.is_exception ? 'border-amber-300 bg-amber-50/40' : 'border-[#ede7db] bg-[#faf8f5]'} hover:bg-white transition-all space-y-3" style="border-left: 5px solid ${groupColor};">
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <h4 class="text-base font-black text-slate-900">${s.group_name}</h4>
                    <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#eee7db] text-slate-700">${levelLabel}</span>
                    ${s.is_exception ? `<span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">⚡ Exception</span>` : `<span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#f4eee3] text-slate-700">🔁 Horaire habituel</span>`}
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
                  <button onclick="PlanningView.quickTakeAttendance(${s.group_id}, '${s.date}', ${s.id || 'null'})" class="px-3 py-1.5 rounded-xl ${s.is_completed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'btn-gold-action'} text-xs font-black">
                    ${s.is_completed ? I18n.t('editAttendance') : I18n.t('takeAttendance')}
                  </button>
                  <button onclick="PlanningView.openSessionDetail(${s.group_id}, '${s.date}')" class="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-[#ede5d8]">
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

  // --- 4. MONTH VIEW ---
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

  // --- 5. LIST VIEW ---
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
                <td class="px-6 py-4 font-black text-slate-900">
                  <div class="flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${s.group_color || '#4f46e5'};"></span>
                    <span>${s.group_name}</span>
                    ${s.is_exception ? `<span class="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">⚡ Exc</span>` : ''}
                  </div>
                </td>
                <td class="px-6 py-4 text-slate-600">${s.topic || '---'}</td>
                <td class="px-6 py-4 font-bold">${s.student_count}</td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${s.is_completed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-[#eee7db] text-slate-700'}">
                    ${s.is_completed ? `✅ ${I18n.t('attendanceTaken')}` : `🕒 ${I18n.t('scheduled')}`}
                  </span>
                </td>
                <td class="px-6 py-4 text-right rtl:text-left">
                  <div class="flex items-center justify-end rtl:justify-start gap-1.5">
                    <button onclick="PlanningView.quickTakeAttendance(${s.group_id}, '${s.date}', ${s.id || 'null'})" class="p-1.5 text-slate-400 hover:text-emerald-600 rounded-xl transition-colors">
                      <i data-lucide="check-circle-2" class="w-4 h-4"></i>
                    </button>
                    <button onclick="PlanningView.openSessionDetail(${s.group_id}, '${s.date}')" class="p-1.5 text-slate-400 hover:text-[#a27e38] rounded-xl transition-colors">
                      <i data-lucide="edit-3" class="w-4 h-4"></i>
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

  async quickTakeAttendance(groupId, dateStr, sessionId) {
    if (sessionId) {
      AttendanceView.openForSession(sessionId);
    } else {
      AttendanceView.openForGroupAndDate(groupId, dateStr);
    }
  },

  // --- 6. MASTER TIMETABLE OVERVIEW MODAL ---
  async openTimetableSummaryModal() {
    const isAr = I18n.currentLang === 'ar';
    try {
      const summary = await API.get('/api/sessions/timetable-summary');
      const items = summary.schedule_items || [];

      Modal.open({
        title: isAr ? '📋 جدول الأوقات الأسبوعي العام للأستاذ' : '📋 Emploi du Temps Hebdomadaire Complet du Professeur',
        size: 'max-w-3xl',
        html: `
          <div class="space-y-6">
            
            <!-- KPI Summary Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="p-4 rounded-2xl bg-[#faf8f5] border border-[#ede7db]">
                <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">${isAr ? 'مجموع ساعات التدريس' : 'Volume horaire hebdo'}</p>
                <h3 class="text-2xl font-black text-slate-900 mt-1">${summary.total_weekly_hours} <span class="text-xs text-[#a27e38] font-bold">h / sem</span></h3>
              </div>

              <div class="p-4 rounded-2xl bg-[#faf8f5] border border-[#ede7db]">
                <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">${isAr ? 'الأفواج المبرمجة' : 'Groupes au planning'}</p>
                <h3 class="text-2xl font-black text-slate-900 mt-1">${summary.active_scheduled_groups} <span class="text-xs text-slate-400 font-bold">/ ${summary.total_groups}</span></h3>
              </div>

              <div class="p-4 rounded-2xl bg-[#faf8f5] border border-[#ede7db]">
                <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">${isAr ? 'الحصص الأسبوعية' : 'Séances par semaine'}</p>
                <h3 class="text-2xl font-black text-slate-900 mt-1">${items.length} <span class="text-xs text-emerald-600 font-bold">séances fixes</span></h3>
              </div>
            </div>

            <!-- Master Timetable Roster -->
            <div class="border border-[#ede7db] rounded-2xl overflow-hidden bg-white">
              <div class="px-4 py-3 bg-[#fbf9f4] border-b border-[#ebd9b5] flex items-center justify-between">
                <span class="text-xs font-black text-slate-800 uppercase tracking-wider">${isAr ? 'توزيع الحصص الأسبوعية القارة' : 'Répartition des cours hebdomadaires'}</span>
                <span class="text-[11px] font-bold text-[#856428]">🔁 Emploi du temps récurrent</span>
              </div>

              <div class="divide-y divide-[#f2ece1] max-h-[380px] overflow-y-auto">
                ${items.length === 0 ? `
                  <div class="p-8 text-center text-slate-400 text-xs">
                    <p>${isAr ? 'لم تتم برمجة أي فوج في جدول الأوقات حتى الآن.' : 'Aucun groupe n\'a encore d\'horaire fixe configuré.'}</p>
                  </div>
                ` : items.map(item => {
                  const h = Math.floor(item.duration_minutes / 60);
                  const m = item.duration_minutes % 60;
                  const durStr = `${h}h${m ? m : '00'}`;
                  return `
                    <div class="p-3.5 hover:bg-[#faf8f5] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-xs shadow-2xs shrink-0" style="background-color: ${item.color};">
                          ${item.day_name_fr ? item.day_name_fr.substring(0, 2).toUpperCase() : 'JR'}
                        </div>
                        <div>
                          <div class="flex items-center gap-2">
                            <h4 class="text-sm font-black text-slate-900">${item.group_name}</h4>
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#eee7db] text-slate-700">${item.level}</span>
                          </div>
                          <p class="text-xs text-slate-500 font-medium mt-0.5">
                            📍 ${item.location} • 👥 ${item.student_count} / ${item.capacity} élèves
                          </p>
                        </div>
                      </div>

                      <div class="flex items-center gap-3 self-end sm:self-center">
                        <div class="text-right rtl:text-left">
                          <p class="text-xs font-black font-mono text-slate-900 bg-[#f4eee3] px-2.5 py-1 rounded-xl border border-[#ded5c5]">
                            ${isAr ? item.day_name_ar : item.day_name_fr} : ${item.start_time} - ${item.end_time}
                          </p>
                          <p class="text-[10px] text-slate-400 font-semibold mt-0.5">Durée : ${durStr}</p>
                        </div>
                        <button onclick="Modal.close(); PlanningView.openSchedulerModal(${item.group_id})" class="p-2 text-slate-400 hover:text-[#856428] rounded-xl hover:bg-white transition-colors" title="Modifier le créneau">
                          <i data-lucide="edit-3" class="w-4 h-4"></i>
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Footer Action -->
            <div class="flex items-center justify-between pt-3 border-t border-[#ede7db]">
              <a href="/api/reports/daily/tomorrow/pdf" target="_blank" class="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-[#ede5d8] rounded-2xl flex items-center gap-1.5 transition-colors">
                <i data-lucide="printer" class="w-4 h-4 text-[#a27e38]"></i>
                <span>${isAr ? 'طباعة تقرير الحصص' : 'Imprimer le planning'}</span>
              </a>
              <button onclick="Modal.close()" class="px-5 py-2.5 btn-gold-action text-xs font-black">
                ${isAr ? 'إغلاق' : 'Fermer'}
              </button>
            </div>

          </div>
        `,
        onOpen: () => {
          if (window.lucide) lucide.createIcons();
        }
      });
    } catch (e) {
      Toast.error(e.message || 'Erreur lors du chargement de l\'emploi du temps.');
    }
  },

  // --- 7. INTERACTIVE 3-MODE SESSION SCHEDULER MODAL ---
  openSlotScheduler(dateStr = null, dayIndex = null, hourStr = null) {
    this.openSchedulerModal(null, dateStr, dayIndex, hourStr);
  },

  openSchedulerModal(preSelectedGroupId = null, defaultDate = null, defaultDayIdx = null, defaultStartHour = null) {
    const groups = State.groups || [];
    const isAr = I18n.currentLang === 'ar';
    const weekdaysFr = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const weekdaysAr = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];
    const weekdays = isAr ? weekdaysAr : weekdaysFr;

    const baseDate = defaultDate ? new Date(defaultDate) : new Date();
    let initialDayIndex = defaultDayIdx !== null && defaultDayIdx !== undefined 
      ? defaultDayIdx 
      : (baseDate.getDay() === 0 ? 6 : baseDate.getDay() - 1);

    const startTime = defaultStartHour || '10:00';
    // Default 2 hours later
    const [h, m] = startTime.split(':').map(Number);
    const endH = Math.min(22, h + 2);
    const endTime = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    Modal.open({
      title: isAr ? '🗓️ برمجة حصة في جدول الأوقات' : '🗓️ Programmer un créneau dans l\'emploi du temps',
      size: 'max-w-xl',
      html: `
        <form id="scheduler-form" class="space-y-4">
          
          <!-- 3-MODE ACTION SELECTOR -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-2">${isAr ? 'نوع البرمجة *' : 'Type d\'opération *'}</label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2" id="scheduler-mode-cards">
              
              <!-- Option A: Horaire Fixe Récurrent -->
              <label class="p-3 rounded-2xl border-2 border-[#c5a059] bg-[#fdfbf7] cursor-pointer hover:border-[#a27e38] transition-all flex flex-col justify-between mode-card active" data-mode="fixed">
                <input type="radio" name="scheduler_action_type" value="fixed" checked class="hidden">
                <div class="flex items-center gap-1.5 text-xs font-black text-[#856428]">
                  <span>🔁 ${isAr ? 'توقيت قار' : 'Horaire Fixe'}</span>
                </div>
                <p class="text-[10px] text-slate-600 mt-1 leading-snug">
                  ${isAr ? 'يتكرر أسبوعياً كل أسبوع تلقائياً.' : 'Répété automatiquement chaque semaine.'}
                </p>
              </label>

              <!-- Option B: Exception Ponctuelle -->
              <label class="p-3 rounded-2xl border-2 border-[#ede7db] bg-white cursor-pointer hover:border-amber-400 transition-all flex flex-col justify-between mode-card" data-mode="exception">
                <input type="radio" name="scheduler_action_type" value="exception" class="hidden">
                <div class="flex items-center gap-1.5 text-xs font-black text-slate-800">
                  <span>⚡ ${isAr ? 'استثناء فقط' : 'Exception'}</span>
                </div>
                <p class="text-[10px] text-slate-500 mt-1 leading-snug">
                  ${isAr ? 'تعديل لهذا التاريخ فقط دون تغيير باقي الأسابيع.' : 'Valable uniquement pour cette date précise.'}
                </p>
              </label>

              <!-- Option C: Déplacement Définitif -->
              <label class="p-3 rounded-2xl border-2 border-[#ede7db] bg-white cursor-pointer hover:border-indigo-400 transition-all flex flex-col justify-between mode-card" data-mode="permanent_move">
                <input type="radio" name="scheduler_action_type" value="permanent_move" class="hidden">
                <div class="flex items-center gap-1.5 text-xs font-black text-slate-800">
                  <span>🔄 ${isAr ? 'تغيير نهائي' : 'Changement définitif'}</span>
                </div>
                <p class="text-[10px] text-slate-500 mt-1 leading-snug">
                  ${isAr ? 'حذف التوقيت القديم وتثبيت التوقيت الجديد دائماً.' : 'Déplace définitivement le groupe vers ce jour.'}
                </p>
              </label>

            </div>
          </div>

          <!-- Group Select -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${isAr ? 'الفوج المعني *' : 'Groupe concerné *'}</label>
            <select id="sched-group-id" required class="w-full px-3.5 py-2.5 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 bg-white font-bold text-slate-900">
              <option value="">-- ${isAr ? 'اختر الفوج' : 'Sélectionner un groupe'} --</option>
              ${groups.map(g => {
                const levelLabel = I18n.getLevelLabel(g.level);
                return `
                  <option value="${g.id}" ${preSelectedGroupId && g.id === parseInt(preSelectedGroupId) ? 'selected' : ''}>
                    ${g.name} (${levelLabel} • ${g.student_count || 0} élèves) ${g.schedule ? `[${g.schedule}]` : ''}
                  </option>
                `;
              }).join('')}
            </select>
          </div>

          <!-- Weekday & Auto Date Sync -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${isAr ? 'يوم الحصة في الأسبوع *' : 'Jour de la semaine *'}</label>
            <div class="grid grid-cols-7 gap-1.5" id="sched-weekday-pills">
              ${weekdays.map((wName, idx) => `
                <button type="button" class="weekday-pill ${idx === initialDayIndex ? 'active' : ''}" data-idx="${idx}" data-name="${wName}">
                  <span class="text-[10px] font-black uppercase">${wName.substring(0, 3)}</span>
                </button>
              `).join('')}
            </div>

            <!-- Date indicator for this week -->
            <div class="mt-2 p-2 bg-[#faf8f5] rounded-xl border border-[#ede7db] flex items-center justify-between text-xs">
              <span class="text-slate-500 font-medium flex items-center gap-1.5">
                <i data-lucide="calendar" class="w-3.5 h-3.5 text-[#c5a059]"></i>
                ${isAr ? 'تاريخ الحصة لهذه الدورة :' : 'Date calculée :'}
              </span>
              <strong class="text-slate-900 font-bold bg-white px-2 py-0.5 rounded-lg border border-[#e8dfd1]" id="sched-date-badge">---</strong>
            </div>
            <input type="hidden" id="sched-date-val" value="${baseDate.toISOString().split('T')[0]}">
          </div>

          <!-- Hours & Duration Quick Chips -->
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

            <!-- Quick Duration Chips (1h, 1h30, 2h, 2h30) -->
            <div class="flex items-center gap-1.5 pt-0.5">
              <span class="text-[10px] text-slate-400 font-bold uppercase">${isAr ? 'المدة :' : 'Durée :'}</span>
              <button type="button" onclick="PlanningView.setDuration(60)" class="px-2.5 py-1 rounded-lg bg-[#eee7db] hover:bg-[#c5a059] hover:text-white text-[10px] font-black transition-colors">1h00</button>
              <button type="button" onclick="PlanningView.setDuration(90)" class="px-2.5 py-1 rounded-lg bg-[#eee7db] hover:bg-[#c5a059] hover:text-white text-[10px] font-black transition-colors">1h30</button>
              <button type="button" onclick="PlanningView.setDuration(120)" class="px-2.5 py-1 rounded-lg bg-[#c5a059] text-white text-[10px] font-black transition-colors">2h00</button>
              <button type="button" onclick="PlanningView.setDuration(150)" class="px-2.5 py-1 rounded-lg bg-[#eee7db] hover:bg-[#c5a059] hover:text-white text-[10px] font-black transition-colors">2h30</button>
            </div>
          </div>

          <!-- Conflict Live Warning Alert Area -->
          <div id="sched-conflict-alert" class="hidden p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
            <i data-lucide="alert-triangle" class="w-4 h-4 text-rose-600 shrink-0"></i>
            <span id="sched-conflict-msg" class="font-bold"></span>
          </div>

          <!-- Topic & Location -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${isAr ? 'المكان / القاعة' : 'Salle / Lieu'}</label>
              <input id="sched-location" type="text" value="Salle 1" class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 font-medium">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${isAr ? 'الموضوع / الدرس (اختياري)' : 'Chapitre / Sujet'}</label>
              <input id="sched-topic" type="text" placeholder="${isAr ? 'مثال: الدوال اللوغاريتمية...' : 'ex: Nombres complexes, Dérivation...'}" class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 font-medium">
            </div>
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

        // Mode Card selection styling
        const modeCards = content.querySelectorAll('.mode-card');
        modeCards.forEach(card => {
          card.addEventListener('click', () => {
            modeCards.forEach(c => {
              c.classList.remove('active', 'border-[#c5a059]', 'bg-[#fdfbf7]');
              c.classList.add('border-[#ede7db]', 'bg-white');
              const t = c.querySelector('div span');
              if (t) t.className = 'text-xs font-black text-slate-800';
            });
            card.classList.add('active', 'border-[#c5a059]', 'bg-[#fdfbf7]');
            card.classList.remove('border-[#ede7db]', 'bg-white');
            const radio = card.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
          });
        });

        // Weekday selection & Date computation
        const dateInput = content.querySelector('#sched-date-val');
        const dateBadge = content.querySelector('#sched-date-badge');
        const weekdayPills = content.querySelectorAll('#sched-weekday-pills .weekday-pill');

        const weekDates = this.getWeekDates();

        function selectWeekday(idx) {
          weekdayPills.forEach(p => p.classList.remove('active'));
          const targetPill = content.querySelector(`#sched-weekday-pills .weekday-pill[data-idx="${idx}"]`);
          if (targetPill) targetPill.classList.add('active');

          const dObj = weekDates[idx] || new Date();
          const yyyy = dObj.getFullYear();
          const mm = String(dObj.getMonth() + 1).padStart(2, '0');
          const dd = String(dObj.getDate()).padStart(2, '0');
          const dStr = `${yyyy}-${mm}-${dd}`;
          dateInput.value = dStr;

          const locale = isAr ? 'ar-TN' : 'fr-FR';
          dateBadge.innerText = dObj.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        }

        weekdayPills.forEach(p => {
          p.addEventListener('click', () => {
            const idx = parseInt(p.getAttribute('data-idx'));
            selectWeekday(idx);
          });
        });

        selectWeekday(initialDayIndex);

        // Conflict check function
        const groupSelect = content.querySelector('#sched-group-id');
        const startInput = content.querySelector('#sched-start-time');
        const endInput = content.querySelector('#sched-end-time');
        const alertBox = content.querySelector('#sched-conflict-alert');
        const alertMsg = content.querySelector('#sched-conflict-msg');

        const checkConflicts = () => {
          const gid = parseInt(groupSelect.value);
          const dStr = dateInput.value;
          const sT = startInput.value;
          const eT = endInput.value;
          if (!gid || !dStr || !sT || !eT) {
            alertBox.classList.add('hidden');
            return;
          }

          const overlapping = (this.sessions || []).filter(s => {
            if (s.date !== dStr || s.group_id === gid || s.status === 'cancelled') return false;
            return (sT < s.end_time) && (eT > s.start_time);
          });

          if (overlapping.length > 0) {
            alertBox.classList.remove('hidden');
            alertMsg.innerText = `Attention : Chevauchement d'horaire avec ${overlapping[0].group_name} (${overlapping[0].start_time} - ${overlapping[0].end_time})`;
          } else {
            alertBox.classList.add('hidden');
          }
        };

        groupSelect.addEventListener('change', checkConflicts);
        startInput.addEventListener('change', checkConflicts);
        endInput.addEventListener('change', checkConflicts);

        // Form Submission
        const form = content.querySelector('#scheduler-form');
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const selectedMode = content.querySelector('input[name="scheduler_action_type"]:checked').value;
          const groupId = parseInt(groupSelect.value);
          const date = dateInput.value;
          const startTime = startInput.value;
          const endTime = endInput.value;
          const location = content.querySelector('#sched-location').value.trim() || 'Salle 1';
          const topic = content.querySelector('#sched-topic').value.trim() || null;

          const activePill = content.querySelector('#sched-weekday-pills .weekday-pill.active');
          const dayIdx = activePill ? parseInt(activePill.getAttribute('data-idx')) : initialDayIndex;

          try {
            if (selectedMode === 'fixed') {
              // 1. Set group recurring schedule
              await API.post('/api/sessions/set-group-recurring', {
                group_id: groupId,
                day_of_week: dayIdx,
                start_time: startTime,
                end_time: endTime,
                location: location
              });
              Toast.success(isAr ? 'تم تثبيت التوقيت الأسبوعي القار للفوج بنجاح.' : 'Horaire hebdomadaire récurrent configuré avec succès !');
            } else if (selectedMode === 'permanent_move') {
              // 2. Permanent Move
              await API.post('/api/sessions/resolve', {
                group_id: groupId,
                date: date,
                start_time: startTime,
                end_time: endTime,
                location: location,
                topic: topic,
                status: 'scheduled',
                is_permanent_move: true
              });
              Toast.success(isAr ? 'تم نقل الفوج نهائياً إلى التوقيت الجديد.' : 'Groupe déplacé définitivement vers le nouveau jour.');
            } else {
              // 3. Exception for this date only
              await API.post('/api/sessions/resolve', {
                group_id: groupId,
                date: date,
                start_time: startTime,
                end_time: endTime,
                location: location,
                topic: topic,
                status: 'scheduled',
                is_permanent_move: false
              });
              Toast.success(isAr ? 'تمت إضافة الحصة الاستثنائية لهذا التاريخ فقط.' : 'Séance exceptionnelle programmée pour cette date !');
            }

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

    // Trigger change for conflict verification
    endInput.dispatchEvent(new Event('change'));
  },

  // --- 8. SESSION DETAIL / EDIT / REVERT / DELETE MODAL ---
  async openSessionDetail(groupId, dateStr) {
    const session = this.sessions.find(s => s.group_id === groupId && s.date === dateStr) || {
      group_id: groupId,
      date: dateStr,
      start_time: '10:00',
      end_time: '12:00',
      location: 'Salle 1',
      topic: '',
      status: 'scheduled',
      is_recurring: true,
      is_exception: false
    };

    const isAr = I18n.currentLang === 'ar';
    const isException = session.is_exception;

    Modal.open({
      title: `${isAr ? 'تعديل الحصة' : 'Modifier la séance'} : ${session.group_name || 'Groupe'} (${session.date})`,
      size: 'max-w-lg',
      html: `
        <form id="edit-session-form" class="space-y-4">
          
          <!-- Explanatory Banner -->
          <div class="p-3.5 rounded-2xl ${isException ? 'bg-amber-50 border border-amber-200 text-amber-900' : 'bg-[#faf8f5] border border-[#ede7db] text-slate-700'} text-xs space-y-1">
            <div class="flex items-center gap-1.5 font-bold">
              <span>${isException ? '⚡ Séance modifiée exceptionnellement' : '🔁 Horaire fixe du groupe'}</span>
            </div>
            <p class="text-[11px] leading-relaxed text-slate-600">
              ${isException 
                ? (isAr ? 'هذه الحصة معدلة كاستثناء لهذا التاريخ فقط. يمكنك حفظ التعديل أو استرجاع التوقيت الأسبوعي الأصلي للفوج.' : 'Cette séance a un horaire exceptionnel pour ce jour. Vous pouvez le modifier ou rétablir l\'horaire fixe habituel.') 
                : (isAr ? 'هذه الحصة تتبع التوقيت الأسبوعي الثابت للفوج. تعديل التوقيت الآن سيسجل كاستثناء لهذا التاريخ فقط دون المساس بباقي الأسابيع.' : 'Ce groupe a un horaire fixe récurrent. Modifier l\'horaire ci-dessous s\'appliquera uniquement pour cette séance (exception) sans altérer les autres semaines.')}
            </p>
          </div>

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
              <input id="edit-sess-start" type="time" value="${session.start_time}" required class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 font-mono font-bold">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${I18n.t('endTime')}</label>
              <input id="edit-sess-end" type="time" value="${session.end_time}" required class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 font-mono font-bold">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${I18n.t('topic')}</label>
            <input id="edit-sess-topic" type="text" value="${session.topic || ''}" placeholder="${isAr ? 'موضوع الدرس...' : 'ex: Suites numériques, Dérivation...'}" class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 font-medium">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${I18n.t('location')}</label>
            <input id="edit-sess-location" type="text" value="${session.location || 'Salle 1'}" class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 font-medium">
          </div>

          <!-- Permanent Move Option Checkbox -->
          <div class="p-3 bg-[#faf8f5] rounded-2xl border border-[#ede7db] flex items-center gap-2.5">
            <input type="checkbox" id="edit-is-permanent-move" class="rounded border-[#ded7ca] text-[#c5a059] focus:ring-[#c5a059]/30">
            <label for="edit-is-permanent-move" class="text-xs font-bold text-slate-800 cursor-pointer">
              ${isAr ? 'تطبيق هذا التغيير نهائياً على جميع الأسابيع القادمة (تغيير قار للفوج)' : 'Appliquer définitivement à toutes les semaines futures (Déplacement fixe)'}
            </label>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-[#ede7db]">
            <div>
              ${isException ? `
                <button type="button" onclick="PlanningView.revertToRecurring(${session.group_id}, '${session.date}')" class="px-3.5 py-2 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-2xl border border-amber-300 transition-colors flex items-center gap-1.5">
                  <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                  <span>${isAr ? 'استرجاع التوقيت الأصلي' : 'Rétablir l\'horaire habituel'}</span>
                </button>
              ` : session.id ? `
                <button type="button" onclick="PlanningView.deleteSession(${session.id}, ${session.group_id}, '${session.date}')" class="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors">
                  ${I18n.t('delete')}
                </button>
              ` : `<span></span>`}
            </div>

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
        if (window.lucide) lucide.createIcons();
        const form = content.querySelector('#edit-session-form');
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const isPerm = content.querySelector('#edit-is-permanent-move').checked;
          const payload = {
            group_id: session.group_id,
            date: content.querySelector('#edit-sess-date').value,
            start_time: content.querySelector('#edit-sess-start').value,
            end_time: content.querySelector('#edit-sess-end').value,
            topic: content.querySelector('#edit-sess-topic').value.trim() || null,
            location: content.querySelector('#edit-sess-location').value.trim() || 'Salle 1',
            status: content.querySelector('#edit-sess-status').value,
            is_permanent_move: isPerm
          };

          try {
            await API.post('/api/sessions/resolve', payload);
            Toast.success(isPerm 
              ? (isAr ? 'تم تعديل التوقيت القار للفوج نهائياً.' : 'Horaire habituel du groupe mis à jour définitivement.') 
              : (isAr ? 'تم حفظ تعديل الحصة بنجاح.' : 'Séance mise à jour avec succès.'));
            Modal.close();
            await PlanningView.loadSessions(document.getElementById('main-view'));
          } catch (err) {
            Toast.error(err.message);
          }
        });
      }
    });
  },

  async revertToRecurring(groupId, dateStr) {
    const isAr = I18n.currentLang === 'ar';
    try {
      await API.post(`/api/sessions/revert-to-recurring?group_id=${groupId}&date=${dateStr}`);
      Toast.success(isAr ? 'تم استرجاع التوقيت الأسبوعي الأصلي للفوج.' : 'Horaire habituel du groupe rétabli avec succès.');
      Modal.close();
      await this.loadSessions(document.getElementById('main-view'));
    } catch (e) {
      Toast.error(e.message);
    }
  },

  deleteSession(sessionId, groupId = null, dateStr = null) {
    const isAr = I18n.currentLang === 'ar';
    Modal.confirm({
      title: isAr ? 'حذف الحصة' : 'Supprimer la séance',
      message: isAr ? 'هل أنت متأكد من حذف هذه الحصة ؟ سيتم استرجاع التوقيت الأصلي أو إزالتها.' : 'Supprimer cette séance ?',
      confirmText: isAr ? 'حذف' : 'Supprimer',
      onConfirm: async () => {
        try {
          if (sessionId) {
            await API.delete(`/api/sessions/${sessionId}`);
          } else if (groupId && dateStr) {
            await API.post(`/api/sessions/revert-to-recurring?group_id=${groupId}&date=${dateStr}`);
          }
          Toast.success(isAr ? 'تم حذف الحصة.' : 'Séance supprimée.');
          await PlanningView.loadSessions(document.getElementById('main-view'));
        } catch (e) {
          Toast.error(e.message);
        }
      }
    });
  }
};


