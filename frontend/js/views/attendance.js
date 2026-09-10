// Fast Attendance Taking View
const AttendanceView = {
  selectedSessionId: null,
  sessionData: null,

  async render(container, preSelectedSessionId = null) {
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in max-w-4xl mx-auto">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <i data-lucide="check-circle-2" class="w-5 h-5"></i>
              </div>
              Feuille de Présence Rapide
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">Pointez la présence de vos élèves en 1 clic et enregistrez le contenu du cours.</p>
          </div>

          <div class="flex items-center gap-2">
            <select id="att-session-select" class="px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 bg-white font-bold text-slate-800 shadow-sm">
              <option value="">-- Choisir une séance --</option>
              <!-- Injected dynamically -->
            </select>
          </div>
        </div>

        <!-- Attendance Sheet Container -->
        <div id="att-sheet-container" class="space-y-6">
          <div class="p-12 text-center text-slate-400 text-sm bg-white rounded-3xl border border-slate-100">
            Veuillez sélectionner une séance ci-dessus pour afficher la liste des élèves.
          </div>
        </div>

      </div>
    `;

    if (window.lucide) lucide.createIcons();

    await this.initSessionsDropdown(container, preSelectedSessionId);
  },

  async initSessionsDropdown(container, preSelectedSessionId) {
    const select = container.querySelector('#att-session-select');
    if (!select) return;

    try {
      const sessions = await API.get('/api/sessions');
      State.sessions = sessions;

      if (sessions.length === 0) {
        select.innerHTML = '<option value="">Aucune séance disponible</option>';
        return;
      }

      select.innerHTML = '<option value="">-- Choisir une séance à pointer --</option>' +
        sessions.map(s => `
          <option value="${s.id}" ${preSelectedSessionId && s.id === parseInt(preSelectedSessionId) ? 'selected' : ''}>
            ${s.date} (${s.start_time} - ${s.end_time}) • ${s.group_name} ${s.is_completed ? '✅' : '🕒'}
          </option>
        `).join('');

      select.addEventListener('change', (e) => {
        const sid = e.target.value;
        if (sid) {
          this.loadSessionSheet(container, parseInt(sid));
        } else {
          container.querySelector('#att-sheet-container').innerHTML = `
            <div class="p-12 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-100">
              Veuillez sélectionner une séance ci-dessus.
            </div>
          `;
        }
      });

      // If preselected or only 1 session, load immediately
      if (preSelectedSessionId) {
        this.loadSessionSheet(container, parseInt(preSelectedSessionId));
      } else if (sessions.length > 0) {
        // default to first session or today's session
        const today = new Date().toISOString().split('T')[0];
        const todaySession = sessions.find(s => s.date === today) || sessions[0];
        select.value = todaySession.id;
        this.loadSessionSheet(container, todaySession.id);
      }
    } catch (e) {
      Toast.error('Erreur de chargement des séances.');
    }
  },

  async openForSession(sessionId) {
    window.location.hash = '#attendance';
    setTimeout(() => {
      const container = document.getElementById('main-view');
      if (container) {
        this.render(container, sessionId);
      }
    }, 50);
  },

  async loadSessionSheet(container, sessionId) {
    this.selectedSessionId = sessionId;
    const sheet = container.querySelector('#att-sheet-container');
    if (!sheet) return;

    try {
      sheet.innerHTML = '<div class="p-12 text-center text-slate-400 text-sm animate-pulse">Chargement de la feuille de présence...</div>';
      const data = await API.get(`/api/attendance/session/${sessionId}`);
      this.sessionData = data;

      if (data.students.length === 0) {
        sheet.innerHTML = `
          <div class="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <i data-lucide="users" class="w-10 h-10 text-slate-300 mx-auto mb-2"></i>
            <p class="text-sm font-bold text-slate-700">Aucun élève inscrit dans le groupe "${data.group_name}".</p>
            <p class="text-xs text-slate-400 mt-1">Affectez d'abord des élèves à ce groupe depuis la page Élèves.</p>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      sheet.innerHTML = `
        <!-- Session Info & Fast Action Bar -->
        <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-black text-slate-900">${data.group_name}</h3>
                <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">${data.level}</span>
                ${data.is_recorded ? '<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">✅ Déjà pointé</span>' : ''}
              </div>
              <p class="text-xs text-slate-500 mt-0.5">📅 ${data.date} • 🕒 ${data.start_time} à ${data.end_time} • ${data.students.length} élèves</p>
            </div>

            <!-- MAGIC BUTTON: Tout le monde présent -->
            <button id="mark-all-present-btn" class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2">
              <i data-lucide="sparkles" class="w-4 h-4 text-amber-300"></i>
              🌟 Tout le monde présent
            </button>
          </div>

          <!-- Lesson Topic & Pedagogical Notes Input -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Sujet abordé pendant la séance</label>
              <input id="att-topic-input" type="text" value="${data.topic || ''}" placeholder="ex: Nombres complexes, équations différentielles..." class="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 bg-slate-50/50">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Observations générales</label>
              <input id="att-notes-input" type="text" value="${data.notes || ''}" placeholder="ex: Série d'exercices n°4 terminée..." class="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 bg-slate-50/50">
            </div>
          </div>
        </div>

        <!-- Attendance Roster Cards / Rows -->
        <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 text-xs font-bold text-slate-500">
            <span>Élève</span>
            <div id="att-summary-counts" class="flex items-center gap-3">
              <!-- Real-time counters -->
            </div>
          </div>

          <div class="divide-y divide-slate-100" id="att-students-list">
            ${data.students.map((st, idx) => `
              <div class="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 student-att-row" data-student-id="${st.student_id}">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                    ${st.student_name.charAt(0)}
                  </div>
                  <div>
                    <p class="font-bold text-slate-900 text-xs sm:text-sm">${st.student_name}</p>
                    <p class="text-[11px] text-slate-400 font-mono">${st.student_code}</p>
                  </div>
                </div>

                <!-- 3 Large Touch Buttons: Present, Absent, Late -->
                <div class="flex items-center gap-1.5 sm:gap-2">
                  <button type="button" onclick="AttendanceView.setStatus(${st.student_id}, 'present')" class="att-btn-present flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    st.status === 'present' ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300' : 'bg-slate-100 hover:bg-emerald-50 text-slate-600'
                  }">
                    <i data-lucide="check" class="w-3.5 h-3.5"></i>
                    Présent
                  </button>

                  <button type="button" onclick="AttendanceView.setStatus(${st.student_id}, 'absent')" class="att-btn-absent flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    st.status === 'absent' ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300' : 'bg-slate-100 hover:bg-rose-50 text-slate-600'
                  }">
                    <i data-lucide="x" class="w-3.5 h-3.5"></i>
                    Absent
                  </button>

                  <button type="button" onclick="AttendanceView.setStatus(${st.student_id}, 'late')" class="att-btn-late flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    st.status === 'late' ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300' : 'bg-slate-100 hover:bg-amber-50 text-slate-600'
                  }">
                    <i data-lucide="clock" class="w-3.5 h-3.5"></i>
                    Retard
                  </button>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Bottom Save Button -->
          <div class="pt-6 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs text-slate-400">Total : <strong>${data.students.length} élèves</strong></span>
            <button id="save-attendance-btn" class="px-6 py-3 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-sm font-bold rounded-2xl shadow-lg shadow-brand-600/30 transition-all flex items-center gap-2">
              <i data-lucide="check" class="w-4 h-4"></i>
              Enregistrer les Présences
            </button>
          </div>
        </div>
      `;

      if (window.lucide) lucide.createIcons();

      // Hook up mark all present
      const allPresentBtn = sheet.querySelector('#mark-all-present-btn');
      allPresentBtn.addEventListener('click', () => this.markAllPresent());

      // Hook up save button
      const saveBtn = sheet.querySelector('#save-attendance-btn');
      saveBtn.addEventListener('click', () => this.saveAttendance());

      this.updateSummaryCounts();
    } catch (e) {
      sheet.innerHTML = `<div class="p-8 text-center text-rose-500">Erreur lors de la récupération de la séance.</div>`;
    }
  },

  setStatus(studentId, status) {
    if (!this.sessionData) return;
    const st = this.sessionData.students.find(s => s.student_id === studentId);
    if (!st) return;

    st.status = status;
    
    // Update button states in UI
    const row = document.querySelector(`.student-att-row[data-student-id="${studentId}"]`);
    if (row) {
      const pBtn = row.querySelector('.att-btn-present');
      const aBtn = row.querySelector('.att-btn-absent');
      const lBtn = row.querySelector('.att-btn-late');

      pBtn.className = `att-btn-present flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
        status === 'present' ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300' : 'bg-slate-100 hover:bg-emerald-50 text-slate-600'
      }`;

      aBtn.className = `att-btn-absent flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
        status === 'absent' ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300' : 'bg-slate-100 hover:bg-rose-50 text-slate-600'
      }`;

      lBtn.className = `att-btn-late flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
        status === 'late' ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300' : 'bg-slate-100 hover:bg-amber-50 text-slate-600'
      }`;
    }

    this.updateSummaryCounts();
  },

  markAllPresent() {
    if (!this.sessionData) return;
    this.sessionData.students.forEach(st => {
      st.status = 'present';
    });

    document.querySelectorAll('.student-att-row').forEach(row => {
      const sid = parseInt(row.getAttribute('data-student-id'));
      this.setStatus(sid, 'present');
    });

    Toast.success('Tous les élèves ont été marqués comme présents !');
  },

  updateSummaryCounts() {
    const summaryEl = document.getElementById('att-summary-counts');
    if (!summaryEl || !this.sessionData) return;

    const presentCount = this.sessionData.students.filter(s => s.status === 'present').length;
    const absentCount = this.sessionData.students.filter(s => s.status === 'absent').length;
    const lateCount = this.sessionData.students.filter(s => s.status === 'late').length;

    summaryEl.innerHTML = `
      <span class="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">✅ ${presentCount} Présents</span>
      <span class="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">❌ ${absentCount} Absents</span>
      <span class="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">🟠 ${lateCount} Retards</span>
    `;
  },

  async saveAttendance() {
    if (!this.sessionData || !this.selectedSessionId) return;

    const topicInput = document.getElementById('att-topic-input');
    const notesInput = document.getElementById('att-notes-input');

    const topic = topicInput ? topicInput.value.trim() : '';
    const notes = notesInput ? notesInput.value.trim() : '';

    const records = this.sessionData.students.map(s => ({
      student_id: s.student_id,
      status: s.status || 'present',
      notes: s.notes || ''
    }));

    try {
      await API.post('/api/attendance/bulk', {
        session_id: this.selectedSessionId,
        topic,
        notes,
        records
      });

      if (window.confetti) {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 }
        });
      }

      Toast.success('Feuille de présence enregistrée avec succès !');
      await State.loadInitialData();
      
      // Update session badge in UI
      const select = document.getElementById('att-session-select');
      if (select) {
        const opt = select.querySelector(`option[value="${this.selectedSessionId}"]`);
        if (opt && !opt.text.includes('✅')) {
          opt.text = opt.text.replace('🕒', '') + ' ✅';
        }
      }
    } catch (e) {
      Toast.error(e.message);
    }
  }
};
