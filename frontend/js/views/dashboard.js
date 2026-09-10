// Dashboard View
const DashboardView = {
  async render(container) {
    container.innerHTML = `
      <div class="space-y-6 sm:space-y-8 animate-fade-in">
        
        <!-- Welcome Header & Date Banner -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 relative overflow-hidden">
          <!-- Background decoration math symbols -->
          <div class="absolute -right-6 -bottom-8 text-white/5 text-9xl font-serif font-black select-none pointer-events-none">∫dx</div>
          <div class="relative z-10">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-brand-200 mb-3">
              <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-300"></i>
              Tableau de bord Enseignant
            </div>
            <h1 class="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">Bonjour, <span id="dash-teacher-name">Professeur</span> 👋</h1>
            <p class="text-xs sm:text-sm text-slate-300 mt-1">Voici le récapitulatif de votre activité et de vos cours pour aujourd'hui.</p>
          </div>
          
          <div class="relative z-10 flex items-center gap-3">
            <div class="p-3 bg-white/10 backdrop-blur rounded-2xl border border-white/10 text-right">
              <p class="text-[11px] text-brand-200 font-medium uppercase tracking-wider">Aujourd'hui</p>
              <p class="text-sm font-bold capitalize" id="dash-current-date">Samedi 22 Août 2026</p>
            </div>
          </div>
        </div>

        <!-- 6 Main KPI Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4" id="dash-kpi-grid">
          <!-- Loading Skeletons -->
          <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-pulse h-28"></div>
          <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-pulse h-28"></div>
          <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-pulse h-28"></div>
          <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-pulse h-28"></div>
          <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-pulse h-28"></div>
          <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-pulse h-28"></div>
        </div>

        <!-- Quick Action Buttons -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <button onclick="app.openNewStudentModal()" class="flex items-center gap-3 p-4 rounded-2xl bg-white hover:bg-brand-50/50 border border-slate-200/80 hover:border-brand-200 shadow-sm transition-all group text-left">
            <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <i data-lucide="user-plus" class="w-5 h-5"></i>
            </div>
            <div>
              <p class="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-brand-600">+ Élève</p>
              <p class="text-[11px] text-slate-500 hidden sm:block">Inscrire un élève</p>
            </div>
          </button>

          <button onclick="app.openNewGroupModal()" class="flex items-center gap-3 p-4 rounded-2xl bg-white hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-200 shadow-sm transition-all group text-left">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <i data-lucide="users" class="w-5 h-5"></i>
            </div>
            <div>
              <p class="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600">+ Groupe</p>
              <p class="text-[11px] text-slate-500 hidden sm:block">Créer une classe</p>
            </div>
          </button>

          <button onclick="app.openNewSessionModal()" class="flex items-center gap-3 p-4 rounded-2xl bg-white hover:bg-emerald-50/50 border border-slate-200/80 hover:border-emerald-200 shadow-sm transition-all group text-left">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <i data-lucide="calendar-plus" class="w-5 h-5"></i>
            </div>
            <div>
              <p class="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-600">+ Séance</p>
              <p class="text-[11px] text-slate-500 hidden sm:block">Planifier un cours</p>
            </div>
          </button>

          <button onclick="app.openNewPaymentModal()" class="flex items-center gap-3 p-4 rounded-2xl bg-white hover:bg-amber-50/50 border border-slate-200/80 hover:border-amber-200 shadow-sm transition-all group text-left">
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <i data-lucide="credit-card" class="w-5 h-5"></i>
            </div>
            <div>
              <p class="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-600">+ Paiement</p>
              <p class="text-[11px] text-slate-500 hidden sm:block">Encaisser mensualité</p>
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
          <div class="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <i data-lucide="calendar" class="w-4 h-4"></i>
                </div>
                <div>
                  <h2 class="text-base font-bold text-slate-900">Planning d'aujourd'hui</h2>
                  <p class="text-xs text-slate-500">Séances programmées pour la journée</p>
                </div>
              </div>
              <a href="#planning" class="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                Voir tout l'emploi du temps <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
              </a>
            </div>

            <!-- Sessions List -->
            <div id="dash-today-sessions" class="space-y-3 pt-2">
              <!-- Rendered dynamically -->
            </div>
          </div>

          <!-- Right Column: Financial Snapshot & Next Session -->
          <div class="space-y-6">
            
            <!-- Next Upcoming Session Card -->
            <div class="bg-gradient-to-br from-indigo-600 to-brand-700 rounded-3xl p-6 text-white shadow-lg shadow-brand-600/20" id="dash-next-session-card">
              <div class="flex items-center justify-between mb-4">
                <span class="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur px-2.5 py-1 rounded-full">Prochaine séance</span>
                <i data-lucide="clock" class="w-4 h-4 text-brand-200"></i>
              </div>
              <div id="dash-next-session-content">
                <p class="text-xs text-brand-200">Chargement...</p>
              </div>
            </div>

            <!-- Tomorrow's Planning Card (Daily PDF) -->
            <div class="bg-gradient-to-br from-indigo-50/80 to-brand-50/60 border border-indigo-200/80 rounded-3xl p-6 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-indigo-950 font-bold text-sm">
                  <i data-lucide="calendar" class="w-4 h-4 text-brand-600"></i>
                  Planning de Demain
                </div>
                <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">Fiche PDF</span>
              </div>
              
              <p class="text-xs text-indigo-900/80 leading-relaxed">
                Consultez, imprimez ou recevez le récapitulatif des cours et séances programmés pour demain.
              </p>

              <div class="space-y-2 pt-1">
                <button type="button" id="dash-send-whatsapp-btn" class="w-full py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2">
                  <i data-lucide="send" class="w-4 h-4"></i>
                  <span>📲 Envoyer sur WhatsApp Maintenant</span>
                </button>

                <a href="/api/reports/daily/tomorrow/pdf" target="_blank" class="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2">
                  <i data-lucide="file-text" class="w-3.5 h-3.5 text-brand-600"></i>
                  <span>📄 Télécharger la Fiche PDF</span>
                </a>
              </div>
            </div>

            <!-- Smart Auto-Balancing Promo Card -->
            <div class="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-3xl p-6 space-y-3">
              <div class="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <i data-lucide="sparkles" class="w-4 h-4 text-amber-600"></i>
                Répartition Intelligente des Élèves
              </div>
              <p class="text-xs text-amber-800 leading-relaxed">
                Besoin d'équilibrer vos groupes automatiquement selon une capacité maximale ? Testez notre algorithme de répartition !
              </p>
              <a href="#repartition" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all">
                Lancer la répartition <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
              </a>
            </div>

          </div>

        </div>

      </div>
    `;

    if (window.lucide) lucide.createIcons();

    // Set formatted date
    const dateEl = container.querySelector('#dash-current-date');
    if (dateEl) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      dateEl.innerText = new Date().toLocaleDateString('fr-FR', options);
    }

    // Bind WhatsApp send button
    const waBtn = container.querySelector('#dash-send-whatsapp-btn');
    if (waBtn) {
      waBtn.addEventListener('click', async () => {
        waBtn.disabled = true;
        waBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> <span>Envoi en cours...</span>';
        if (window.lucide) lucide.createIcons();

        try {
          const res = await API.post('/api/whatsapp/send-schedule-now', { force: true });
          Toast.success(`Planning WhatsApp envoyé ! (${res.total_sessions || 0} séance(s))`);
          if (window.confetti) confetti({ particleCount: 30, spread: 45, origin: { y: 0.6 } });
        } catch (err) {
          Toast.error(err.message || 'Erreur lors de l\'envoi WhatsApp.');
        } finally {
          waBtn.disabled = false;
          waBtn.innerHTML = '<i data-lucide="send" class="w-4 h-4"></i> <span>📲 Envoyer sur WhatsApp Maintenant</span>';
          if (window.lucide) lucide.createIcons();
        }
      });
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
        teacherNameEl.innerText = user.name || 'Professeur';
      }

      const currency = user ? (user.currency || 'DT') : 'DT';

      // 1. Render 6 KPIs
      const kpiGrid = container.querySelector('#dash-kpi-grid');
      if (kpiGrid) {
        kpiGrid.innerHTML = `
          <!-- Total Élèves -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-2">
              <i data-lucide="graduation-cap" class="w-4 h-4"></i>
            </div>
            <p class="text-[11px] font-semibold text-slate-500">Total Élèves</p>
            <p class="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">${stats.total_students}</p>
          </div>

          <!-- Total Groupes -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
              <i data-lucide="users" class="w-4 h-4"></i>
            </div>
            <p class="text-[11px] font-semibold text-slate-500">Total Groupes</p>
            <p class="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">${stats.total_groups}</p>
          </div>

          <!-- Présents Aujourd'hui -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <i data-lucide="check-circle" class="w-4 h-4"></i>
            </div>
            <p class="text-[11px] font-semibold text-slate-500">Présents ce jour</p>
            <p class="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">${stats.students_present_today}</p>
          </div>

          <!-- Séances Aujourd'hui -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <i data-lucide="calendar" class="w-4 h-4"></i>
            </div>
            <p class="text-[11px] font-semibold text-slate-500">Séances ce jour</p>
            <p class="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">${stats.sessions_today}</p>
          </div>

          <!-- Paiements en Attente -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
              <i data-lucide="alert-circle" class="w-4 h-4"></i>
            </div>
            <p class="text-[11px] font-semibold text-slate-500">En attente paiement</p>
            <p class="text-xl sm:text-2xl font-black text-rose-600 mt-0.5">${stats.pending_payments_count}</p>
          </div>

          <!-- Montant Encaissé ce mois -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
              <i data-lucide="coins" class="w-4 h-4"></i>
            </div>
            <p class="text-[11px] font-semibold text-slate-500">Encaissé ce mois</p>
            <p class="text-lg sm:text-xl font-black text-slate-900 mt-0.5">${stats.total_collected_this_month} <span class="text-xs font-bold text-slate-500">${currency}</span></p>
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
            ${a.type === 'warning' ? '<a href="#payments" class="text-xs font-bold underline shrink-0">Voir les impayés</a>' : ''}
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
              <p class="text-sm font-semibold text-slate-700">Aucune séance prévue aujourd'hui</p>
              <p class="text-xs text-slate-400 mt-0.5">Profitez de votre journée ou planifiez un nouveau cours.</p>
              <button onclick="app.openNewSessionModal()" class="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all">
                + Ajouter une séance
              </button>
            </div>
          `;
        } else {
          todaySessionsEl.innerHTML = stats.today_sessions.map(s => `
            <div class="p-4 rounded-2xl border ${s.has_conflict ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200/80 bg-slate-50/40'} hover:bg-white hover:border-brand-200 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex items-start gap-3">
                <div class="w-12 h-12 rounded-xl bg-brand-100 text-brand-700 flex flex-col items-center justify-center font-black shrink-0">
                  <span class="text-xs">${s.start_time}</span>
                  <span class="text-[10px] text-brand-600 font-normal">🕒 ${s.end_time}</span>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-bold text-slate-900">${s.group_name}</h3>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">${s.level}</span>
                    ${s.has_conflict ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">⚠️ Conflit</span>' : ''}
                  </div>
                  <p class="text-xs text-slate-600 mt-1">${s.topic || 'Séance de mathématiques'}</p>
                  <p class="text-[11px] text-slate-400 mt-0.5">📍 ${s.location || 'Salle 1'} • 👥 ${s.student_count} élèves inscrits</p>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <button onclick="AttendanceView.openForSession(${s.id})" class="px-3.5 py-2 rounded-xl ${s.is_completed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/20'} text-xs font-bold transition-all flex items-center gap-1.5">
                  <i data-lucide="${s.is_completed ? 'check-check' : 'clipboard-check'}" class="w-4 h-4"></i>
                  ${s.is_completed ? `Présence prise (${s.attended_count}/${s.student_count})` : 'Prendre présence'}
                </button>
              </div>
            </div>
          `).join('');
        }
      }

      // 4. Next Session Card
      const nextSessionContent = container.querySelector('#dash-next-session-content');
      if (nextSessionContent) {
        if (stats.next_session) {
          const ns = stats.next_session;
          nextSessionContent.innerHTML = `
            <h3 class="text-lg font-black text-white">${ns.group_name}</h3>
            <p class="text-xs text-brand-100 mt-0.5">📚 ${ns.topic || 'Cours de mathématiques'}</p>
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
            <p class="text-sm font-semibold text-white">Aucune séance à venir</p>
            <p class="text-xs text-brand-100 mt-1">Planifiez une séance depuis le calendrier.</p>
          `;
        }
      }

      if (window.lucide) lucide.createIcons();
    } catch (err) {
      Toast.error('Erreur lors du chargement des données du dashboard.');
    }
  }
};
