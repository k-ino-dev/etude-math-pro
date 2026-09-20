// Timetable View — Emploi du Temps Hebdomadaire Fixe du Professeur
const TimetableView = {
  summaryData: null,
  groups: [],

  async render(container) {
    container.innerHTML = `
      <div class="flex items-center justify-center min-h-[400px]">
        <div class="flex flex-col items-center gap-3 text-slate-400">
          <div class="w-8 h-8 border-3 border-[#c5a059] border-t-transparent rounded-full animate-spin"></div>
          <span class="text-xs font-semibold">Chargement de l'emploi du temps...</span>
        </div>
      </div>
    `;

    try {
      const [summaryRes, groupsRes] = await Promise.all([
        API.get('/api/sessions/timetable-summary'),
        API.get('/api/groups')
      ]);

      this.summaryData = summaryRes || {
        total_groups: 0,
        active_scheduled_groups: 0,
        total_weekly_hours: 0,
        total_weekly_minutes: 0,
        schedule_items: [],
        days_breakdown: []
      };
      this.groups = groupsRes || [];

      this.renderView(container);
    } catch (error) {
      console.error('Error loading timetable:', error);
      container.innerHTML = `
        <div class="p-8 text-center bg-white rounded-3xl border border-red-200 shadow-sm max-w-lg mx-auto mt-12">
          <div class="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
            <i data-lucide="alert-circle" class="w-6 h-6"></i>
          </div>
          <h3 class="text-base font-bold text-slate-800 mb-1">Erreur de chargement</h3>
          <p class="text-xs text-slate-500 mb-4">Impossible de récupérer l'emploi du temps.</p>
          <button onclick="TimetableView.render(document.getElementById('main-view'))" class="px-4 py-2 bg-[#c5a059] text-white text-xs font-bold rounded-xl shadow hover:bg-[#b89146] transition-all">
            Réessayer
          </button>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
    }
  },

  renderView(container) {
    const isAr = I18n.currentLang === 'ar';
    const data = this.summaryData;
    const items = data.schedule_items || [];
    const breakdown = data.days_breakdown || [];

    // Calculate active days count
    const activeDaysCount = breakdown.filter(d => d.sessions_count > 0).length;
    const avgDailyHours = activeDaysCount > 0 ? (data.total_weekly_hours / activeDaysCount).toFixed(1) : '0.0';

    container.innerHTML = `
      <div class="space-y-6 max-w-7xl mx-auto printable-timetable">
        
        <!-- Header: Title & Quick Actions -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-[#ede5d8] shadow-xs">
          <div>
            <div class="flex items-center gap-3 mb-1.5">
              <span class="w-2.5 h-6 rounded-full bg-gradient-to-b from-[#c5a059] to-[#dfc288]"></span>
              <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                ${isAr ? 'جدول الأوقات الأسبوعي للأستاذ' : 'Emploi du Temps Hebdomadaire'}
              </h1>
              <span class="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-[#f4eee3] text-[#856428] border border-[#e2dacb]">
                ${isAr ? 'قار ودائم' : 'Horaire Fixe'}
              </span>
            </div>
            <p class="text-xs text-slate-500 font-medium">
              ${isAr 
                ? 'الجدول الأسبوعي الشامل والتلقائي لجميع حصص ومجموعات الأستاذ' 
                : 'Vue d’ensemble scolaire complète des créneaux fixes d’enseignement · Année 2025-2026'}
            </p>
          </div>

          <div class="flex items-center flex-wrap gap-2.5 no-print">
            <button onclick="TimetableView.printTimetable()" class="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-[#f8f6f0] hover:bg-[#efe9dd] border border-[#ded5c5] rounded-xl transition-all shadow-xs">
              <i data-lucide="printer" class="w-4 h-4 text-slate-600"></i>
              <span>${isAr ? 'طباعة / PDF' : 'Imprimer / PDF'}</span>
            </button>
            <button onclick="TimetableView.openSetScheduleModal()" class="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#c5a059] to-[#b89146] hover:brightness-105 rounded-xl transition-all shadow-md shadow-[#c5a059]/20">
              <i data-lucide="plus-circle" class="w-4 h-4"></i>
              <span>${isAr ? 'برمجة فوج' : 'Affecter un horaire'}</span>
            </button>
            <a href="#planning" class="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-[#e2dacb] rounded-xl transition-all shadow-xs">
              <i data-lucide="calendar" class="w-4 h-4 text-[#c5a059]"></i>
              <span>${isAr ? 'روزنامة الحصص' : 'Planning Calendrier'}</span>
            </a>
          </div>
        </div>

        <!-- KPI Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          <div class="bg-gradient-to-br from-white to-[#faf7f2] p-5 rounded-3xl border border-[#ede5d8] shadow-xs">
            <div class="flex items-center justify-between text-[#a27e38] mb-2">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">${isAr ? 'مجموع الساعات' : 'Total Heures'}</span>
              <div class="w-7 h-7 rounded-xl bg-[#c5a059]/15 flex items-center justify-center">
                <i data-lucide="clock" class="w-4 h-4 text-[#a27e38]"></i>
              </div>
            </div>
            <div class="text-2xl font-black text-slate-900 tracking-tight">
              ${data.total_weekly_hours}<span class="text-sm font-bold text-[#c5a059] ml-1">h / sem</span>
            </div>
            <p class="text-[10px] text-slate-500 font-medium mt-1">${data.total_weekly_minutes} minutes d'enseignement</p>
          </div>

          <div class="bg-gradient-to-br from-white to-[#faf7f2] p-5 rounded-3xl border border-[#ede5d8] shadow-xs">
            <div class="flex items-center justify-between text-indigo-600 mb-2">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">${isAr ? 'عدد الحصص' : 'Séances Hebdo'}</span>
              <div class="w-7 h-7 rounded-xl bg-indigo-50 flex items-center justify-center">
                <i data-lucide="calendar-days" class="w-4 h-4 text-indigo-600"></i>
              </div>
            </div>
            <div class="text-2xl font-black text-slate-900 tracking-tight">
              ${data.active_scheduled_groups}<span class="text-sm font-bold text-slate-500 ml-1">séances</span>
            </div>
            <p class="text-[10px] text-slate-500 font-medium mt-1">sur 7 jours ouvrables</p>
          </div>

          <div class="bg-gradient-to-br from-white to-[#faf7f2] p-5 rounded-3xl border border-[#ede5d8] shadow-xs">
            <div class="flex items-center justify-between text-emerald-600 mb-2">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">${isAr ? 'أيام التدريس' : 'Jours Actifs'}</span>
              <div class="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center">
                <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i>
              </div>
            </div>
            <div class="text-2xl font-black text-slate-900 tracking-tight">
              ${activeDaysCount}<span class="text-sm font-bold text-slate-500 ml-1">/ 7 jours</span>
            </div>
            <p class="text-[10px] text-slate-500 font-medium mt-1">Lundi au Dimanche</p>
          </div>

          <div class="bg-gradient-to-br from-white to-[#faf7f2] p-5 rounded-3xl border border-[#ede5d8] shadow-xs">
            <div class="flex items-center justify-between text-amber-600 mb-2">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">${isAr ? 'معدل الحصص' : 'Moyenne / Jour'}</span>
              <div class="w-7 h-7 rounded-xl bg-amber-50 flex items-center justify-center">
                <i data-lucide="activity" class="w-4 h-4 text-amber-600"></i>
              </div>
            </div>
            <div class="text-2xl font-black text-slate-900 tracking-tight">
              ${avgDailyHours}<span class="text-sm font-bold text-slate-500 ml-1">h / jour actif</span>
            </div>
            <p class="text-[10px] text-slate-500 font-medium mt-1">Charge moyenne journalière</p>
          </div>

        </div>

        <!-- Main Timetable School Grid (Lundi -> Dimanche) -->
        <div class="bg-white rounded-3xl border border-[#ede5d8] shadow-xs overflow-hidden">
          
          <div class="px-6 py-4 border-b border-[#ede5d8] bg-[#faf8f4] flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i data-lucide="layout-grid" class="w-4 h-4 text-[#c5a059]"></i>
              <h2 class="text-sm font-black text-slate-900 uppercase tracking-wide">
                ${isAr ? 'جدول توزيع الحصص الأسبوعي (النموذج المدرسي)' : 'Grille Scolaire Complète (08:00 → 22:00)'}
              </h2>
            </div>
            <span class="text-xs text-slate-500 font-medium hidden sm:inline">
              ${isAr ? 'الكتل تمتد حسب مدة الحصة' : 'Les séances de 2h apparaissent en un seul bloc continu'}
            </span>
          </div>

          <div class="overflow-x-auto">
            ${this.renderSchoolTimetableTable(items, isAr)}
          </div>
        </div>

        <!-- Bottom Sections: Summary Table & Day-by-Day Detailed List -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Left: Weekly Summary Table (Jour | Séances | Heures) -->
          <div class="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#ede5d8] shadow-xs flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between pb-4 mb-4 border-b border-[#ede5d8]">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-xl bg-[#c5a059]/15 flex items-center justify-center">
                    <i data-lucide="bar-chart-3" class="w-4 h-4 text-[#a27e38]"></i>
                  </div>
                  <h3 class="text-sm font-black text-slate-900 uppercase tracking-wide">
                    ${isAr ? 'ملخص ساعات الأسبوع' : 'Résumé Hebdomadaire'}
                  </h3>
                </div>
                <span class="text-[11px] font-bold text-slate-500 bg-[#f4eee3] px-2.5 py-1 rounded-lg border border-[#e2dacb]">
                  ${data.total_weekly_hours}h / sem
                </span>
              </div>

              <!-- Summary Table -->
              <table class="w-full text-xs">
                <thead>
                  <tr class="border-b border-slate-100 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                    <th class="py-2.5 text-left rtl:text-right">${isAr ? 'اليوم' : 'Jour'}</th>
                    <th class="py-2.5 text-center">${isAr ? 'عدد الحصص' : 'Nb Séances'}</th>
                    <th class="py-2.5 text-right rtl:text-left">${isAr ? 'الساعات' : 'Heures'}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-semibold text-slate-700">
                  ${breakdown.map(day => `
                    <tr class="hover:bg-[#faf8f4] transition-colors">
                      <td class="py-2.5 font-bold flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full ${day.sessions_count > 0 ? 'bg-[#c5a059]' : 'bg-slate-300'}"></span>
                        <span class="${day.sessions_count > 0 ? 'text-slate-900 font-bold' : 'text-slate-500'}">
                          ${isAr ? day.day_name_ar : day.day_name_fr}
                        </span>
                      </td>
                      <td class="py-2.5 text-center">
                        <span class="inline-block px-2 py-0.5 rounded-md ${day.sessions_count > 0 ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-400'}">
                          ${day.sessions_count} ${day.sessions_count > 1 ? 'séances' : (day.sessions_count === 1 ? 'séance' : '—')}
                        </span>
                      </td>
                      <td class="py-2.5 text-right rtl:text-left font-black ${day.sessions_count > 0 ? 'text-[#856428]' : 'text-slate-400'}">
                        ${day.total_hours_formatted}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
                <tfoot>
                  <tr class="border-t-2 border-[#ede5d8] bg-[#faf8f4] text-slate-900 font-black">
                    <td class="py-3 font-extrabold uppercase tracking-wider">${isAr ? 'المجموع الكلي' : 'TOTAL HEBDO'}</td>
                    <td class="py-3 text-center text-indigo-700 font-black">${data.active_scheduled_groups} séances</td>
                    <td class="py-3 text-right rtl:text-left text-lg text-[#856428] font-black">${data.total_weekly_hours}h</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div class="mt-6 pt-4 border-t border-[#ede5d8] bg-gradient-to-br from-[#fbf9f5] to-[#f4eee3] p-4 rounded-2xl border border-[#ded5c5]">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-[11px] uppercase font-bold text-slate-500">${isAr ? 'المجموع الأسبوعي العام' : 'Volume Horaire Total'}</p>
                  <p class="text-xl font-black text-slate-900">${data.total_weekly_hours} heures / semaine</p>
                </div>
                <div class="w-10 h-10 rounded-2xl bg-[#c5a059] text-white flex items-center justify-center font-black shadow-md shadow-[#c5a059]/30 text-base">
                  ∑
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Day-by-Day Detailed Breakdown Cards -->
          <div class="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#ede5d8] shadow-xs">
            <div class="flex items-center justify-between pb-4 mb-4 border-b border-[#ede5d8]">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <i data-lucide="list-checks" class="w-4 h-4 text-indigo-600"></i>
                </div>
                <h3 class="text-sm font-black text-slate-900 uppercase tracking-wide">
                  ${isAr ? 'التفصيل اليومي للحصص والمجموعات' : 'Détail des Séances par Jour'}
                </h3>
              </div>
              <span class="text-xs text-slate-400 font-medium">
                ${items.length} créneau(x) configuré(s)
              </span>
            </div>

            <div class="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              ${breakdown.map(day => `
                <div class="p-4 rounded-2xl border ${day.sessions_count > 0 ? 'bg-[#fcfaf6] border-[#ede5d8]' : 'bg-slate-50/60 border-slate-200/60 opacity-60'}">
                  
                  <div class="flex items-center justify-between mb-2.5">
                    <div class="flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full ${day.sessions_count > 0 ? 'bg-[#c5a059]' : 'bg-slate-300'}"></span>
                      <h4 class="text-sm font-bold text-slate-900">
                        ${isAr ? day.day_name_ar : day.day_name_fr}
                      </h4>
                    </div>
                    <span class="text-xs font-black ${day.sessions_count > 0 ? 'text-[#856428] bg-[#f4eee3] px-2.5 py-0.5 rounded-lg border border-[#ded5c5]' : 'text-slate-400'}">
                      Total : ${day.total_hours_formatted}
                    </span>
                  </div>

                  ${day.sessions_count > 0 ? `
                    <div class="space-y-2 mt-2">
                      ${day.sessions.map(s => `
                        <div class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#e8e0d3] hover:border-[#c5a059]/60 transition-all shadow-2xs">
                          <div class="flex items-center gap-3">
                            <span class="w-3 h-3 rounded-md shrink-0 shadow-2xs" style="background-color: ${s.color || '#4f46e5'}"></span>
                            <div>
                              <span class="text-xs font-bold text-slate-900">${s.group_name}</span>
                              <span class="text-[10px] font-semibold text-slate-500 ml-1.5 px-1.5 py-0.2 rounded bg-slate-100">${s.level || ''}</span>
                            </div>
                          </div>
                          
                          <div class="flex items-center gap-2.5 text-xs">
                            <span class="font-bold text-slate-700">${s.start_time} → ${s.end_time}</span>
                            <span class="font-extrabold text-[#856428] bg-[#fdfaf3] px-2 py-0.5 rounded-md border border-[#ede5d8]">
                              ${Math.floor(s.duration_minutes / 60)}h${s.duration_minutes % 60 ? (s.duration_minutes % 60) : ''}
                            </span>
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  ` : `
                    <p class="text-xs text-slate-400 italic">Aucun cours programmé ce jour-là</p>
                  `}

                </div>
              `).join('')}
            </div>

          </div>

        </div>

      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  renderSchoolTimetableTable(items, isAr) {
    const dayNamesFr = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
    const dayNamesAr = ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"];
    
    // Time slot definitions: 08:00 to 22:00 in 1-hour increments
    const hourSlots = [
      { hour: 8, label: "08:00 – 09:00", start: "08:00", end: "09:00" },
      { hour: 9, label: "09:00 – 10:00", start: "09:00", end: "10:00" },
      { hour: 10, label: "10:00 – 11:00", start: "10:00", end: "11:00" },
      { hour: 11, label: "11:00 – 12:00", start: "11:00", end: "12:00" },
      { hour: 12, label: "12:00 – 13:00", start: "12:00", end: "13:00" },
      { hour: 13, label: "13:00 – 14:00", start: "13:00", end: "14:00" },
      { hour: 14, label: "14:00 – 15:00", start: "14:00", end: "15:00" },
      { hour: 15, label: "15:00 – 16:00", start: "15:00", end: "16:00" },
      { hour: 16, label: "16:00 – 17:00", start: "16:00", end: "17:00" },
      { hour: 17, label: "17:00 – 18:00", start: "17:00", end: "18:00" },
      { hour: 18, label: "18:00 – 19:00", start: "18:00", end: "19:00" },
      { hour: 19, label: "19:00 – 20:00", start: "19:00", end: "20:00" },
      { hour: 20, label: "20:00 – 21:00", start: "20:00", end: "21:00" },
      { hour: 21, label: "21:00 – 22:00", start: "21:00", end: "22:00" },
    ];

    const timeToMinutes = (tStr) => {
      if (!tStr) return 0;
      const [h, m] = tStr.split(':').map(Number);
      return h * 60 + (m || 0);
    };

    const occupied = Array.from({ length: 7 }, () => Array(hourSlots.length).fill(false));
    const sessionMatrix = Array.from({ length: 7 }, () => Array(hourSlots.length).fill(null));

    items.forEach(item => {
      const day = item.day_of_week;
      if (day === undefined || day < 0 || day > 6) return;

      const itemStartMin = timeToMinutes(item.start_time);
      const itemEndMin = timeToMinutes(item.end_time);

      let startSlotIdx = -1;
      for (let s = 0; s < hourSlots.length; s++) {
        const slotStartMin = hourSlots[s].hour * 60;
        const slotEndMin = (hourSlots[s].hour + 1) * 60;
        if (itemStartMin >= slotStartMin && itemStartMin < slotEndMin) {
          startSlotIdx = s;
          break;
        }
      }

      if (startSlotIdx !== -1) {
        const durationHours = Math.max(1, Math.ceil((itemEndMin - itemStartMin) / 60));
        const rowspan = Math.min(durationHours, hourSlots.length - startSlotIdx);

        sessionMatrix[day][startSlotIdx] = {
          ...item,
          rowspan: rowspan
        };

        for (let r = 0; r < rowspan; r++) {
          if (startSlotIdx + r < hourSlots.length) {
            occupied[day][startSlotIdx + r] = true;
          }
        }
      }
    });

    let tableHtml = `
      <table class="w-full border-collapse text-xs min-w-[900px]">
        <thead>
          <tr class="bg-[#f5efe4] text-slate-800 border-b border-[#e2dacb]">
            <th class="p-3 text-center font-extrabold uppercase tracking-wider text-[11px] text-slate-600 border-r border-[#e2dacb] w-32 bg-[#eee7db]">
              ${isAr ? 'التوقيت' : 'Heure'}
            </th>
            ${dayNamesFr.map((name, idx) => `
              <th class="p-3 text-center font-extrabold uppercase tracking-wider text-[11px] border-r border-[#e2dacb] last:border-r-0">
                <div class="flex flex-col items-center gap-0.5">
                  <span class="text-slate-900 font-black">${isAr ? dayNamesAr[idx] : name}</span>
                </div>
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-[#ede5d8]">
    `;

    hourSlots.forEach((slot, slotIdx) => {
      tableHtml += `
        <tr class="hover:bg-[#fcfaf7]/50 transition-colors">
          <!-- Time Column -->
          <td class="p-2.5 text-center font-bold text-slate-600 bg-[#faf6ee] border-r border-[#e2dacb] whitespace-nowrap text-[11px]">
            ${slot.label}
          </td>
      `;

      for (let day = 0; day < 7; day++) {
        const session = sessionMatrix[day][slotIdx];

        if (session) {
          const color = session.color || '#4f46e5';
          const durHours = Math.floor(session.duration_minutes / 60);
          const durMins = session.duration_minutes % 60;
          const durText = durMins ? `${durHours}h${durMins}` : `${durHours}h00`;

          tableHtml += `
            <td rowspan="${session.rowspan}" class="p-2 align-top border-r border-[#e2dacb] last:border-r-0 bg-white" style="background: linear-gradient(135deg, ${color}0D 0%, ${color}1A 100%);">
              <div class="h-full flex flex-col justify-between p-3 rounded-2xl border-2 transition-all shadow-xs hover:shadow-md cursor-pointer group"
                   style="border-color: ${color}; background-color: #ffffff;"
                   onclick="TimetableView.openSessionActionModal(${session.group_id})">
                
                <div>
                  <div class="flex items-center justify-between gap-1 mb-1">
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold text-white shrink-0 shadow-2xs" style="background-color: ${color};">
                      ${session.group_name}
                    </span>
                    <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 truncate max-w-[80px]">
                      ${session.level || 'Groupe'}
                    </span>
                  </div>

                  <div class="text-xs font-black text-slate-900 mt-1 flex items-center gap-1">
                    <i data-lucide="clock" class="w-3.5 h-3.5 text-[#a27e38]"></i>
                    <span>${session.start_time} → ${session.end_time}</span>
                  </div>
                </div>

                <div class="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500">
                  <span class="flex items-center gap-1 text-[#856428]">
                    <i data-lucide="hourglass" class="w-3 h-3"></i>
                    ${durText}
                  </span>
                  <span class="flex items-center gap-1">
                    <i data-lucide="users" class="w-3 h-3 text-slate-400"></i>
                    ${session.student_count || 0} él.
                  </span>
                </div>

              </div>
            </td>
          `;
        } else if (!occupied[day][slotIdx]) {
          tableHtml += `
            <td class="p-2 text-center text-slate-300 font-light border-r border-[#e2dacb] last:border-r-0 hover:bg-[#faf7f0]/60 transition-colors cursor-pointer"
                onclick="TimetableView.openSlotScheduler(${day}, '${slot.start}')">
              <span class="text-slate-300 select-none text-sm">—</span>
            </td>
          `;
        }
      }

      tableHtml += `</tr>`;
    });

    tableHtml += `
        </tbody>
      </table>
    `;

    return tableHtml;
  },

  openSlotScheduler(dayIdx, hourStr) {
    if (window.PlanningView && PlanningView.openSchedulerModal) {
      PlanningView.openSchedulerModal({
        day_of_week: dayIdx,
        start_time: hourStr,
        mode: 'fixed'
      });
    } else {
      this.openSetScheduleModal(dayIdx, hourStr);
    }
  },

  openSessionActionModal(groupId) {
    const group = this.groups.find(g => g.id === groupId);
    if (!group) return;

    Modal.open({
      title: `<span class="flex items-center gap-2"><span class="w-3 h-3 rounded-full" style="background-color: ${group.color || '#4f46e5'}"></span> ${group.name} — ${group.level}</span>`,
      content: `
        <div class="space-y-4">
          <div class="p-4 rounded-2xl bg-[#faf8f4] border border-[#ede5d8] space-y-2 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-500 font-semibold">Horaire fixe actuel :</span>
              <span class="font-bold text-slate-900">${group.schedule || 'Non défini'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500 font-semibold">Salle :</span>
              <span class="font-bold text-slate-900">${group.location || 'Salle 1'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500 font-semibold">Capacité :</span>
              <span class="font-bold text-slate-900">${group.capacity || 15} élèves</span>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-2">
            <button type="button" onclick="Modal.close(); TimetableView.openSetScheduleModal(null, null, ${group.id})" class="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#b89146] text-white text-xs font-bold shadow-md hover:brightness-105">
              Modifier l'horaire fixe
            </button>
            <a href="#groups" onclick="Modal.close()" class="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold text-center">
              Fiche Groupe
            </a>
          </div>
        </div>
      `
    });
    if (window.lucide) lucide.createIcons();
  },

  openSetScheduleModal(prefillDay = null, prefillHour = null, prefillGroupId = null) {
    const dayNames = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

    const groupOptions = this.groups.map(g => `
      <option value="${g.id}" ${prefillGroupId === g.id ? 'selected' : ''}>
        ${g.name} (${g.level}) ${g.schedule ? '— Actuel: ' + g.schedule : ''}
      </option>
    `).join('');

    const dayOptions = dayNames.map((name, idx) => `
      <option value="${idx}" ${prefillDay === idx ? 'selected' : ''}>${name}</option>
    `).join('');

    const startVal = prefillHour ? `${prefillHour}:00`.slice(0, 5) : '10:00';
    let endVal = '12:00';
    if (prefillHour) {
      const h = parseInt(prefillHour.split(':')[0]);
      endVal = `${String(h + 2).padStart(2, '0')}:00`;
    }

    Modal.open({
      title: `<span class="flex items-center gap-2"><i data-lucide="clock" class="w-5 h-5 text-[#c5a059]"></i> Affecter un Horaire Fixe</span>`,
      content: `
        <form id="timetable-set-schedule-form" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Sélectionner le Groupe *</label>
            <select id="tt-modal-group-id" required class="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-[#ede5d8] bg-[#fcfaf6] focus:ring-2 focus:ring-[#c5a059]/40 focus:outline-none">
              <option value="">-- Choisir un groupe --</option>
              ${groupOptions}
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Jour de la Semaine (Fixe et récurrent) *</label>
            <select id="tt-modal-day" required class="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-[#ede5d8] bg-[#fcfaf6] focus:ring-2 focus:ring-[#c5a059]/40 focus:outline-none">
              ${dayOptions}
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Heure de Début *</label>
              <input type="time" id="tt-modal-start" required value="${startVal}" class="w-full text-xs font-bold px-3 py-2 rounded-xl border border-[#ede5d8] bg-[#fcfaf6] focus:ring-2 focus:ring-[#c5a059]/40 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Heure de Fin *</label>
              <input type="time" id="tt-modal-end" required value="${endVal}" class="w-full text-xs font-bold px-3 py-2 rounded-xl border border-[#ede5d8] bg-[#fcfaf6] focus:ring-2 focus:ring-[#c5a059]/40 focus:outline-none">
            </div>
          </div>

          <!-- Quick Duration Chips -->
          <div>
            <label class="block text-[11px] font-bold text-slate-500 mb-1.5">Durée rapide :</label>
            <div class="flex items-center gap-2">
              <button type="button" onclick="TimetableView.applyDuration(60)" class="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#faf6ee] border border-[#e2dacb] text-slate-700 hover:bg-[#ede4d3]">1h00</button>
              <button type="button" onclick="TimetableView.applyDuration(90)" class="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#faf6ee] border border-[#e2dacb] text-slate-700 hover:bg-[#ede4d3]">1h30</button>
              <button type="button" onclick="TimetableView.applyDuration(120)" class="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#c5a059]/20 border border-[#c5a059] text-[#856428]">2h00</button>
              <button type="button" onclick="TimetableView.applyDuration(150)" class="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#faf6ee] border border-[#e2dacb] text-slate-700 hover:bg-[#ede4d3]">2h30</button>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <i data-lucide="info" class="w-4 h-4 text-amber-600 shrink-0 mt-0.5"></i>
            <span>Cette modification s'applique automatiquement à <strong>toutes les semaines</strong> de l'année.</span>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onclick="Modal.close()" class="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">
              Annuler
            </button>
            <button type="submit" class="px-5 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-[#c5a059] to-[#b89146] hover:brightness-105 rounded-xl shadow-md">
              Enregistrer l'horaire fixe
            </button>
          </div>
        </form>
      `
    });

    if (window.lucide) lucide.createIcons();

    document.getElementById('timetable-set-schedule-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const groupId = parseInt(document.getElementById('tt-modal-group-id').value);
      const day = parseInt(document.getElementById('tt-modal-day').value);
      const start = document.getElementById('tt-modal-start').value;
      const end = document.getElementById('tt-modal-end').value;

      try {
        await API.post('/api/sessions/set-group-recurring', {
          group_id: groupId,
          day_of_week: day,
          start_time: start,
          end_time: end
        });
        Toast.success("Horaire fixe enregistré avec succès !");
        Modal.close();
        this.render(document.getElementById('main-view'));
      } catch (err) {
        console.error(err);
        Toast.error(err.message || "Erreur lors de l'enregistrement de l'horaire");
      }
    });
  },

  applyDuration(minutes) {
    const startIn = document.getElementById('tt-modal-start');
    const endIn = document.getElementById('tt-modal-end');
    if (!startIn || !endIn || !startIn.value) return;

    const [h, m] = startIn.value.split(':').map(Number);
    const totalStartMins = h * 60 + m;
    const totalEndMins = totalStartMins + minutes;
    const endH = Math.floor(totalEndMins / 60) % 24;
    const endM = totalEndMins % 60;
    endIn.value = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  },

  printTimetable() {
    window.print();
  }
};
