// Fast Attendance Taking View — 2026 SaaS Edition (Étude Math Pro)
const AttendanceView = {
  selectedSessionId: null,
  sessionData: null,

  async render(container, preSelectedSessionId = null) {
    const isAr = I18n.currentLang === 'ar';

    container.innerHTML = `
      <div class="space-y-6 animate-fade-in max-w-4xl mx-auto">

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shadow-sm">
                <i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-600"></i>
              </div>
              <span>${I18n.t('attendance')}</span>
            </h1>
            <p class="text-sm text-slate-500 mt-1 rtl:text-right">
              ${isAr ? 'تسجيل حضور التلاميذ بنقرة واحدة وتدوين محتوى الدرس.' : 'Pointez la présence de vos élèves en 1 clic et enregistrez le contenu du cours.'}
            </p>
          </div>

          <!-- Session selector card -->
          <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-3 flex items-center gap-2 min-w-0 sm:min-w-[280px]">
            <div class="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <i data-lucide="calendar-check" class="w-4 h-4 text-emerald-600"></i>
            </div>
            <select id="att-session-select" class="flex-1 min-w-0 text-xs sm:text-sm border-0 focus:outline-none focus:ring-0 bg-transparent font-bold text-slate-800 truncate">
              <option value="">-- ${I18n.t('choose_session')} --</option>
              <!-- Injected dynamically -->
            </select>
          </div>
        </div>

        <!-- Attendance Sheet Container -->
        <div id="att-sheet-container" class="space-y-5">
          <!-- Empty state -->
          <div class="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200/70 shadow-sm">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center mb-4 shadow-sm">
              <i data-lucide="calendar-days" class="w-7 h-7 text-emerald-500"></i>
            </div>
            <h3 class="text-base font-bold text-slate-700 mb-1">${isAr ? 'اختر حصة دراسية' : 'Sélectionnez une séance'}</h3>
            <p class="text-sm text-slate-400 max-w-xs">
              ${isAr ? 'يرجى اختيار حصة من القائمة أعلاه لعرض قائمة التلاميذ.' : 'Veuillez sélectionner une séance ci-dessus pour afficher la liste des élèves.'}
            </p>
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
    const isAr = I18n.currentLang === 'ar';

    try {
      const sessions = await API.get('/api/sessions');
      State.sessions = sessions;

      if (!sessions || sessions.length === 0) {
        select.innerHTML = `<option value="">${isAr ? 'لا توجد حصص متاحة' : 'Aucune séance disponible'}</option>`;
        return;
      }

      select.innerHTML = `<option value="">-- ${I18n.t('choose_session')} --</option>` +
        sessions.map(s => {
          const levelLabel = I18n.getLevelLabel(s.level || '');
          return `
            <option value="${s.id}" ${preSelectedSessionId && s.id === parseInt(preSelectedSessionId) ? 'selected' : ''}>
              ${s.date} (${s.start_time} - ${s.end_time}) • ${s.group_name} ${levelLabel ? `[${levelLabel}]` : ''} ${s.is_completed ? '✅' : '🕒'}
            </option>
          `;
        }).join('');

      select.addEventListener('change', (e) => {
        const sid = e.target.value;
        if (sid) {
          this.loadSessionSheet(container, parseInt(sid));
        } else {
          container.querySelector('#att-sheet-container').innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200/70 shadow-sm">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center mb-4 shadow-sm">
                <i data-lucide="calendar-days" class="w-7 h-7 text-emerald-500"></i>
              </div>
              <h3 class="text-base font-bold text-slate-700 mb-1">${isAr ? 'اختر حصة دراسية' : 'Sélectionnez une séance'}</h3>
              <p class="text-sm text-slate-400 max-w-xs">${isAr ? 'يرجى اختيار حصة من القائمة أعلاه.' : 'Veuillez sélectionner une séance ci-dessus.'}</p>
            </div>
          `;
        }
      });

      // If preselected or auto select today's session
      if (preSelectedSessionId) {
        this.loadSessionSheet(container, parseInt(preSelectedSessionId));
      } else if (sessions.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const todaySession = sessions.find(s => s.date === today) || sessions[0];
        select.value = todaySession.id;
        this.loadSessionSheet(container, todaySession.id);
      }
    } catch (e) {
      Toast.error(isAr ? 'خطأ في تحميل الحصص.' : 'Erreur de chargement des séances.');
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
    const isAr = I18n.currentLang === 'ar';

    try {
      sheet.innerHTML = `<div class="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-200/70 shadow-sm animate-pulse"><div class="w-10 h-10 rounded-xl bg-slate-100 mx-auto mb-3"></div><div class="h-3 w-40 bg-slate-100 rounded-full mx-auto mb-2"></div><div class="h-2.5 w-28 bg-slate-100 rounded-full mx-auto"></div></div>`;
      const data = await API.get(`/api/attendance/session/${sessionId}`);
      this.sessionData = data;

      if (!data.students || data.students.length === 0) {
        sheet.innerHTML = `
          <div class="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200/70 shadow-sm">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4">
              <i data-lucide="users" class="w-7 h-7 text-slate-400"></i>
            </div>
            <h3 class="text-base font-bold text-slate-700 mb-1">${isAr ? `لا يوجد تلاميذ في الفوج "${data.group_name}"` : `Aucun élève dans le groupe "${data.group_name}"`}</h3>
            <p class="text-sm text-slate-400 max-w-xs">${isAr ? 'يرجى تسجيل تلاميذ في هذا الفوج من صفحة التلاميذ.' : "Affectez d'abord des élèves à ce groupe depuis la page Élèves."}</p>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      const levelLabel = I18n.getLevelLabel(data.level);

      sheet.innerHTML = `
        <!-- Session Info & Fast Action Bar -->
        <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
          <!-- Colored top bar -->
          <div class="h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          <div class="p-5 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-lg font-black text-slate-900">${data.group_name}</h3>
                  <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">${levelLabel}</span>
                  ${data.is_recorded ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200"><i data-lucide="check-circle-2" class="w-3 h-3"></i> ${isAr ? 'تم التسجيل' : 'Déjà pointé'}</span>` : ''}
                </div>
                <p class="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                  <span class="flex items-center gap-1"><i data-lucide="calendar" class="w-3 h-3"></i> ${data.date}</span>
                  <span class="flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> ${data.start_time} – ${data.end_time}</span>
                  <span class="flex items-center gap-1"><i data-lucide="users" class="w-3 h-3"></i> ${data.students.length} ${I18n.t('students')}</span>
                </p>
              </div>

              <!-- MAGIC BUTTON: Tout le monde présent -->
              <button id="mark-all-present-btn" class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-bold rounded-xl shadow-sm shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 shrink-0">
                <i data-lucide="sparkles" class="w-4 h-4 text-amber-300"></i>
                <span>${I18n.t('mark_all_present')}</span>
              </button>
            </div>

            <!-- Lesson Topic & Pedagogical Notes Input -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
              <div>
                <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">${I18n.t('topic')}</label>
                <input id="att-topic-input" type="text" value="${data.topic || ''}" placeholder="${isAr ? 'مثال: الأعداد المركبة، المتتاليات...' : 'ex: Nombres complexes, suites numériques...'}" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white font-medium text-slate-900 placeholder:text-slate-400 transition-all">
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">${I18n.t('notes')}</label>
                <input id="att-notes-input" type="text" value="${data.notes || ''}" placeholder="${isAr ? 'مثال: تم إكمال السلسلة رقم 3...' : "ex: Série d'exercices n°3 terminée..."}" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white font-medium text-slate-900 placeholder:text-slate-400 transition-all">
              </div>
            </div>
          </div>
        </div>

        <!-- Attendance Roster -->
        <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
          <!-- Roster header -->
          <div class="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
            <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="list-checks" class="w-3.5 h-3.5 text-slate-400"></i>
              ${I18n.t('students')}
            </span>
            <div id="att-summary-counts" class="flex items-center gap-2 flex-wrap">
              <!-- Real-time counters injected here -->
            </div>
          </div>

          <!-- Student rows -->
          <div class="divide-y divide-slate-100/80" id="att-students-list">
            ${data.students.map((st) => {
              const initial = st.student_name ? st.student_name.charAt(0).toUpperCase() : 'E';
              const gradients = ['from-indigo-500 to-violet-600','from-emerald-500 to-teal-600','from-amber-500 to-orange-600','from-rose-500 to-pink-600','from-blue-500 to-cyan-600','from-purple-500 to-fuchsia-600'];
              const grad = gradients[(st.student_id || 0) % gradients.length];
              return `
              <div class="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 student-att-row hover:bg-slate-50/60 transition-colors" data-student-id="${st.student_id}">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br ${grad} text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                    ${initial}
                  </div>
                  <div>
                    <p class="font-bold text-slate-900 text-sm">${st.student_name}</p>
                    <p class="text-[11px] text-slate-400 font-mono">${st.student_code || ''}</p>
                  </div>
                </div>

                <!-- 3 Large Touch Pill Buttons -->
                <div class="flex items-center gap-2">
                  <button type="button" onclick="AttendanceView.setStatus(${st.student_id}, 'present')" class="att-btn-present flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border-2 ${
                    st.status === 'present' ? 'border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/25' : 'border-slate-200 text-slate-500 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700'
                  }">
                    <i data-lucide="check" class="w-3.5 h-3.5"></i>
                    <span>${I18n.t('present')}</span>
                  </button>

                  <button type="button" onclick="AttendanceView.setStatus(${st.student_id}, 'absent')" class="att-btn-absent flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border-2 ${
                    st.status === 'absent' ? 'border-rose-500 bg-rose-500 text-white shadow-md shadow-rose-500/25' : 'border-slate-200 text-slate-500 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700'
                  }">
                    <i data-lucide="x" class="w-3.5 h-3.5"></i>
                    <span>${I18n.t('absent')}</span>
                  </button>

                  <button type="button" onclick="AttendanceView.setStatus(${st.student_id}, 'late')" class="att-btn-late flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border-2 ${
                    st.status === 'late' ? 'border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/25' : 'border-slate-200 text-slate-500 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700'
                  }">
                    <i data-lucide="clock" class="w-3.5 h-3.5"></i>
                    <span>${I18n.t('late')}</span>
                  </button>
                </div>
              </div>
            `}).join('')}
          </div>

          <!-- Bottom Save Bar -->
          <div class="px-5 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-4">
            <span class="text-xs text-slate-500 font-medium">
              ${isAr ? 'المجموع' : 'Total'} : <strong class="text-slate-900">${data.students.length} ${I18n.t('students')}</strong>
            </span>
            <button id="save-attendance-btn" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-bold rounded-xl shadow-sm shadow-indigo-600/25 transition-all flex items-center gap-2">
              <i data-lucide="save" class="w-4 h-4"></i>
              <span>${I18n.t('save_attendance')}</span>
            </button>
          </div>
        </div>
      `;

      if (window.lucide) lucide.createIcons();

      // Hook up mark all present
      const allPresentBtn = sheet.querySelector('#mark-all-present-btn');
      if (allPresentBtn) {
        allPresentBtn.addEventListener('click', () => this.markAllPresent());
      }

      // Hook up save button
      const saveBtn = sheet.querySelector('#save-attendance-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => this.saveAttendance());
      }

      this.updateSummaryCounts();
    } catch (e) {
      sheet.innerHTML = `<div class="p-8 text-center text-rose-500">${isAr ? 'خطأ أثناء تحميل بيانات الحصة.' : 'Erreur lors de la récupération de la séance.'}</div>`;
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

      if (pBtn) {
        pBtn.className = `att-btn-present flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
          status === 'present' ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300' : 'bg-slate-100 hover:bg-emerald-50 text-slate-600'
        }`;
      }

      if (aBtn) {
        aBtn.className = `att-btn-absent flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
          status === 'absent' ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300' : 'bg-slate-100 hover:bg-rose-50 text-slate-600'
        }`;
      }

      if (lBtn) {
        lBtn.className = `att-btn-late flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
          status === 'late' ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300' : 'bg-slate-100 hover:bg-amber-50 text-slate-600'
        }`;
      }
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

    Toast.success(I18n.t('all_present_success'));
  },

  updateSummaryCounts() {
    const summaryEl = document.getElementById('att-summary-counts');
    if (!summaryEl || !this.sessionData) return;

    const presentCount = this.sessionData.students.filter(s => s.status === 'present').length;
    const absentCount = this.sessionData.students.filter(s => s.status === 'absent').length;
    const lateCount = this.sessionData.students.filter(s => s.status === 'late').length;

    summaryEl.innerHTML = `
      <span class="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-xs">✅ ${presentCount} ${I18n.t('present')}</span>
      <span class="text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 text-xs">❌ ${absentCount} ${I18n.t('absent')}</span>
      <span class="text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 text-xs">🟠 ${lateCount} ${I18n.t('late')}</span>
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

      Toast.success(I18n.t('attendance_saved'));
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
