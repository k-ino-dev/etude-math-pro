// Planning & Calendar View
const PlanningView = {
  viewMode: 'week', // 'day', 'week', 'month', 'list'
  currentDate: new Date(),
  sessions: [],

  async render(container) {
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in">
        
        <!-- Header & View Switcher -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <i data-lucide="calendar" class="w-5 h-5"></i>
              </div>
              Planning & Emploi du Temps
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">Planifiez vos cours avec détection automatique de conflits d'horaires.</p>
          </div>

          <div class="flex items-center gap-2.5">
            <!-- View Mode Switcher -->
            <div class="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
              <button onclick="PlanningView.setViewMode('day')" id="plan-btn-day" class="px-3 py-1.5 rounded-lg transition-colors ${this.viewMode === 'day' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}">Jour</button>
              <button onclick="PlanningView.setViewMode('week')" id="plan-btn-week" class="px-3 py-1.5 rounded-lg transition-colors ${this.viewMode === 'week' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}">Semaine</button>
              <button onclick="PlanningView.setViewMode('month')" id="plan-btn-month" class="px-3 py-1.5 rounded-lg transition-colors ${this.viewMode === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}">Mois</button>
              <button onclick="PlanningView.setViewMode('list')" id="plan-btn-list" class="px-3 py-1.5 rounded-lg transition-colors ${this.viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}">Liste</button>
            </div>

            <button onclick="PlanningView.sendTomorrowWhatsApp()" class="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5">
              <i data-lucide="send" class="w-4 h-4 text-emerald-600"></i>
              <span>📲 WhatsApp Demain</span>
            </button>

            <a href="/api/reports/daily/tomorrow/pdf" target="_blank" class="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5">
              <i data-lucide="file-text" class="w-4 h-4"></i>
              <span>PDF Demain</span>
            </a>

            <button onclick="app.openNewSessionModal()" class="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm shadow-brand-600/30 transition-all flex items-center gap-2">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>+ Nouvelle Séance</span>
            </button>
          </div>
        </div>

        <!-- Navigation Bar (Prev / Today / Next / Date Label) -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button onclick="PlanningView.navigateDate(-1)" class="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">
              <i data-lucide="chevron-left" class="w-5 h-5"></i>
            </button>
            <button onclick="PlanningView.today()" class="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              Aujourd'hui
            </button>
            <button onclick="PlanningView.navigateDate(1)" class="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">
              <i data-lucide="chevron-right" class="w-5 h-5"></i>
            </button>
          </div>

          <h3 class="text-sm sm:text-base font-bold text-slate-900 capitalize" id="plan-period-label">
            Semaine en cours
          </h3>

          <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Présence prise</span>
            <span class="inline-flex items-center gap-1 hidden sm:inline-flex"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Conflit horaire</span>
          </div>
        </div>

        <!-- Calendar Container -->
        <div id="calendar-content" class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm min-h-[450px]">
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
        btn.className = `px-3 py-1.5 rounded-lg transition-colors ${this.viewMode === m ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}`;
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

  renderWeekView(container, labelEl) {
    const curr = new Date(this.currentDate);
    const firstDay = new Date(curr.setDate(curr.getDate() - curr.getDay() + 1)); // Lundi

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(firstDay);
      d.setDate(firstDay.getDate() + i);
      days.push(d);
    }

    if (labelEl) {
      const opt = { day: 'numeric', month: 'short' };
      labelEl.innerText = `${days[0].toLocaleDateString('fr-FR', opt)} — ${days[6].toLocaleDateString('fr-FR', { ...opt, year: 'numeric' })}`;
    }

    const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-7 gap-3">
        ${days.map((day, idx) => {
          const dateStr = day.toISOString().split('T')[0];
          const isToday = new Date().toISOString().split('T')[0] === dateStr;
          const daySessions = this.sessions.filter(s => s.date === dateStr);

          return `
            <div class="rounded-2xl p-3 border ${isToday ? 'bg-brand-50/40 border-brand-200' : 'bg-slate-50/50 border-slate-100'} flex flex-col min-h-[320px]">
              <div class="pb-2 mb-3 border-b ${isToday ? 'border-brand-200' : 'border-slate-200/60'} flex items-center justify-between">
                <div>
                  <p class="text-xs font-bold ${isToday ? 'text-brand-700' : 'text-slate-700'}">${dayNames[idx]}</p>
                  <p class="text-[11px] text-slate-400 font-medium">${day.getDate()} ${day.toLocaleDateString('fr-FR', { month: 'short' })}</p>
                </div>
                ${isToday ? '<span class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-brand-600 text-white">Aujourd\'hui</span>' : ''}
              </div>

              <!-- Sessions in this day -->
              <div class="space-y-2.5 flex-1">
                ${daySessions.length === 0 ? `
                  <p class="text-[11px] text-slate-300 italic text-center py-6">Aucun cours</p>
                ` : daySessions.map(s => `
                  <div onclick="PlanningView.openSessionDetail(${s.id})" class="p-2.5 rounded-xl border cursor-pointer hover:shadow-md transition-all ${
                    s.has_conflict ? 'bg-rose-50 border-rose-300 text-rose-900 ring-2 ring-rose-200' :
                    s.is_completed ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-white border-slate-200 text-slate-800'
                  }">
                    <div class="flex items-center justify-between text-[10px] font-bold pb-1">
                      <span class="bg-black/5 px-1.5 py-0.5 rounded">${s.start_time} - ${s.end_time}</span>
                      ${s.has_conflict ? '<span class="text-rose-600 font-extrabold">⚠️ CONFLIT</span>' : ''}
                    </div>
                    <p class="text-xs font-extrabold truncate mt-1">${s.group_name}</p>
                    <p class="text-[11px] text-slate-500 truncate">${s.topic || 'Mathématiques'}</p>
                    <div class="mt-2 pt-1.5 border-t border-black/5 flex items-center justify-between text-[10px] text-slate-500">
                      <span>👥 ${s.student_count} él.</span>
                      <span class="${s.is_completed ? 'text-emerald-600 font-bold' : ''}">
                        ${s.is_completed ? '✅ Pointé' : '🕒 Prévu'}
                      </span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderDayView(container, labelEl) {
    const dateStr = this.currentDate.toISOString().split('T')[0];
    if (labelEl) {
      labelEl.innerText = this.currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    const daySessions = this.sessions.filter(s => s.date === dateStr);

    container.innerHTML = `
      <div class="max-w-2xl mx-auto space-y-4">
        ${daySessions.length === 0 ? `
          <div class="text-center py-12 text-slate-400 text-sm">
            <i data-lucide="calendar-x" class="w-10 h-10 mx-auto text-slate-300 mb-2"></i>
            <p class="font-bold text-slate-700">Aucune séance ce jour</p>
            <button onclick="app.openNewSessionModal('${dateStr}')" class="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-sm">
              + Planifier un cours
            </button>
          </div>
        ` : daySessions.map(s => `
          <div class="p-5 rounded-2xl border ${s.has_conflict ? 'border-rose-300 bg-rose-50/60' : 'border-slate-200 bg-slate-50/50'} hover:bg-white transition-all space-y-3">
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="text-base font-black text-slate-900">${s.group_name}</h4>
                  <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">${s.level}</span>
                  ${s.has_conflict ? '<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">⚠️ Conflit Horaire</span>' : ''}
                </div>
                <p class="text-xs text-slate-600 mt-1">${s.topic || 'Cours de mathématiques'}</p>
                <p class="text-xs text-slate-400 mt-0.5">📍 ${s.location} • 👥 ${s.student_count} élèves</p>
              </div>

              <div class="text-right">
                <span class="text-sm font-black text-slate-900 px-3 py-1 rounded-xl bg-slate-100 inline-block">${s.start_time} - ${s.end_time}</span>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
              <button onclick="AttendanceView.openForSession(${s.id})" class="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5">
                <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Présences
              </button>
              <button onclick="PlanningView.openSessionDetail(${s.id})" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold">
                Détails
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderMonthView(container, labelEl) {
    if (labelEl) {
      labelEl.innerText = this.currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }
    this.renderListView(container, labelEl);
  },

  renderListView(container, labelEl) {
    if (labelEl && this.viewMode === 'list') {
      labelEl.innerText = "Toutes les séances";
    }

    container.innerHTML = `
      <div class="divide-y divide-slate-100 max-w-4xl mx-auto">
        ${this.sessions.length === 0 ? `
          <p class="text-center text-slate-400 py-10 text-xs">Aucune séance enregistrée.</p>
        ` : this.sessions.map(s => `
          <div class="py-4 flex items-center justify-between hover:bg-slate-50/60 px-4 rounded-xl transition-colors">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex flex-col items-center justify-center font-bold text-xs shrink-0">
                <span>${s.start_time}</span>
                <span class="text-[10px] text-blue-500 font-normal">${s.date.split('-').slice(1).join('/')}</span>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="font-bold text-slate-900 text-sm">${s.group_name}</h4>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">${s.level}</span>
                  ${s.has_conflict ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">⚠️ Conflit</span>' : ''}
                </div>
                <p class="text-xs text-slate-500 mt-0.5">${s.topic || 'Séance de cours'} • 📍 ${s.location}</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button onclick="AttendanceView.openForSession(${s.id})" class="px-3 py-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-xl text-xs font-bold flex items-center gap-1">
                <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Présence
              </button>
              <button onclick="PlanningView.openSessionDetail(${s.id})" class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <i data-lucide="more-horizontal" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  async openSessionDetail(sessionId) {
    try {
      const s = await API.get(`/api/sessions/${sessionId}`);
      
      Modal.open({
        title: `Séance : ${s.group_name}`,
        size: 'max-w-md',
        html: `
          <div class="space-y-4">
            ${s.has_conflict ? `
              <div class="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2">
                <i data-lucide="alert-triangle" class="w-4 h-4 shrink-0 text-rose-600 mt-0.5"></i>
                <div>
                  <strong class="font-bold">Alerte Conflit d'Horaire :</strong>
                  <p class="mt-0.5">${s.conflict_details}</p>
                </div>
              </div>
            ` : ''}

            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div class="flex justify-between">
                <span class="text-slate-500">Date :</span>
                <strong class="text-slate-900">${s.date}</strong>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Horaire :</span>
                <strong class="text-slate-900">${s.start_time} - ${s.end_time}</strong>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Lieu / Salle :</span>
                <strong class="text-slate-900">${s.location}</strong>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Sujet abordé :</span>
                <strong class="text-slate-900">${s.topic || 'Non spécifié'}</strong>
              </div>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-slate-100">
              <button onclick="PlanningView.deleteSession(${s.id})" class="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl">
                Supprimer
              </button>

              <div class="flex items-center gap-2">
                <button onclick="Modal.close()" class="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">
                  Fermer
                </button>
                <button onclick="Modal.close(); AttendanceView.openForSession(${s.id});" class="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-sm">
                  Prendre Présence
                </button>
              </div>
            </div>
          </div>
        `
      });
      if (window.lucide) lucide.createIcons();
    } catch (e) {
      Toast.error('Erreur lors du chargement de la séance.');
    }
  },

  deleteSession(sessionId) {
    Modal.confirm({
      title: "Supprimer la séance",
      message: "Êtes-vous sûr de vouloir supprimer cette séance du planning ?",
      confirmText: "Supprimer",
      onConfirm: async () => {
        try {
          await API.delete(`/api/sessions/${sessionId}`);
          Toast.success("Séance supprimée.");
          Modal.close();
          await PlanningView.loadSessions();
        } catch (e) {
          Toast.error(e.message);
        }
      }
    });
  },

  async sendTomorrowWhatsApp() {
    try {
      Toast.info("Envoi du planning de demain en cours...");
      const res = await API.post('/api/whatsapp/send-schedule-now', { force: true });
      Toast.success(`Planning WhatsApp envoyé avec succès (${res.total_sessions || 0} séance(s)) !`);
      if (window.confetti) confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
    } catch (e) {
      Toast.error(e.message || "Erreur lors de l'envoi WhatsApp.");
    }
  }
};

