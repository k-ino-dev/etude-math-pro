// Student Detail Profile View — 2026 Commercial Edition (Étude Math Pro)
const StudentDetailView = {
  activeTab: 'payments', // 'payments', 'attendance', 'notes'

  async render(container, studentId) {
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in" id="st-detail-wrapper">
        <div class="p-12 text-center text-slate-400 text-sm">${I18n.t('loading')}</div>
      </div>
    `;

    try {
      const student = await API.get(`/api/students/${studentId}`);
      this.renderProfile(container, student);
    } catch (err) {
      container.innerHTML = `
        <div class="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <p class="text-rose-500 font-bold text-base mb-2">Élève introuvable</p>
          <a href="#students" class="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">${I18n.t('back')}</a>
        </div>
      `;
    }
  },

  renderProfile(container, s) {
    const currency = 'DT';
    const levelLabel = I18n.getLevelLabel(s.level);

    container.innerHTML = `
      <div class="space-y-6">
        
        <!-- Back navigation -->
        <div class="flex items-center justify-between">
          <a href="#students" class="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors">
            <i data-lucide="arrow-left" class="w-4 h-4 rtl:rotate-180"></i> ${I18n.t('back')}
          </a>

          <div class="flex items-center gap-2">
            <button onclick="StudentsView.openPaymentModal(${s.id})" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5">
              <i data-lucide="credit-card" class="w-3.5 h-3.5"></i>
              ${I18n.t('recordPayment')}
            </button>
            <button onclick="StudentsView.openModal(${s.id})" class="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
              ${I18n.t('edit')}
            </button>
          </div>
        </div>

        <!-- Student Hero Profile Card -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <!-- Left Info -->
            <div class="flex items-start gap-4 sm:gap-6">
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-brand-500/20 shrink-0">
                ${s.first_name.charAt(0)}${s.last_name.charAt(0)}
              </div>
              <div class="space-y-1">
                <div class="flex flex-wrap items-center gap-2">
                  <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">${s.first_name} ${s.last_name}</h1>
                  <span class="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">${s.student_code}</span>
                  <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100">${levelLabel}</span>
                </div>
                <p class="text-xs sm:text-sm text-slate-500">
                  ${I18n.t('group')} : <strong class="text-slate-800">${s.group_name || I18n.t('unassigned')}</strong>
                  ${s.group_info && s.group_info.schedule ? ` • 🕒 ${s.group_info.schedule}` : ''}
                </p>
                <div class="pt-2 flex flex-wrap items-center gap-2.5 text-xs text-slate-600">
                  <span class="flex items-center gap-1 font-semibold text-slate-900">
                    💰 ${I18n.t('monthlyTariff')} : ${s.monthly_price} ${I18n.t('currency')}/mois
                  </span>
                  <span class="text-slate-300">•</span>
                  <span>📅 ${I18n.t('registeredOn')} ${s.registration_date}</span>
                  <span class="text-slate-300">•</span>
                  ${
                    s.current_month_payment_status === 'paid' ?
                      `<span class="inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">🟢 ${I18n.t('paid')} (${s.last_payment_month || s.active_month || ''})</span>` :
                    s.current_month_payment_status === 'partial' ?
                      `<span class="inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">🟠 ${I18n.t('partial')} (${s.last_payment_month || s.active_month || ''})</span>` :
                      `<span class="inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">🔴 ${I18n.t('pending')} (${s.active_month || ''})</span>`
                  }
                </div>
              </div>
            </div>

            <!-- Right Contacts Box (Clean standard tel links, NO WhatsApp) -->
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5 shrink-0 text-xs">
              <p class="font-bold text-slate-700 uppercase tracking-wider text-[10px]">${I18n.t('phone')}</p>
              
              <!-- Student Phone -->
              ${s.student_phone ? `
                <div class="flex items-center justify-between gap-4">
                  <span class="text-slate-500">${I18n.t('phoneStudent')} :</span>
                  <a href="tel:${s.student_phone.replace(/\s+/g, '')}" class="font-bold text-slate-800 hover:text-brand-600 inline-flex items-center gap-1">
                    <i data-lucide="phone" class="w-3.5 h-3.5 text-brand-600"></i> ${s.student_phone}
                  </a>
                </div>
              ` : ''}

              <!-- Father Phone -->
              ${s.father_phone ? `
                <div class="flex items-center justify-between gap-4">
                  <span class="text-slate-500">${I18n.t('phoneFather')} :</span>
                  <a href="tel:${s.father_phone.replace(/\s+/g, '')}" class="font-bold text-slate-800 hover:text-brand-600 inline-flex items-center gap-1">
                    <i data-lucide="phone" class="w-3.5 h-3.5 text-brand-600"></i> ${s.father_phone}
                  </a>
                </div>
              ` : ''}

              <!-- Mother Phone -->
              ${s.mother_phone ? `
                <div class="flex items-center justify-between gap-4">
                  <span class="text-slate-500">${I18n.t('phoneMother')} :</span>
                  <a href="tel:${s.mother_phone.replace(/\s+/g, '')}" class="font-bold text-slate-800 hover:text-brand-600 inline-flex items-center gap-1">
                    <i data-lucide="phone" class="w-3.5 h-3.5 text-brand-600"></i> ${s.mother_phone}
                  </a>
                </div>
              ` : ''}

              ${!s.student_phone && !s.father_phone && !s.mother_phone ? `
                <p class="text-slate-400 italic">${I18n.t('noPhone')}</p>
              ` : ''}
            </div>

          </div>
        </div>

        <!-- Tabbed Navigation -->
        <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button onclick="StudentDetailView.switchTab('payments')" id="tab-btn-payments" class="px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${this.activeTab === 'payments' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}">
            <i data-lucide="credit-card" class="w-4 h-4"></i>
            ${I18n.t('paymentHistory')} (${s.payment_history ? s.payment_history.length : 0})
          </button>

          <button onclick="StudentDetailView.switchTab('attendance')" id="tab-btn-attendance" class="px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${this.activeTab === 'attendance' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}">
            <i data-lucide="check-circle" class="w-4 h-4"></i>
            ${I18n.t('attendance')} (${s.attendance_count})
          </button>

          <button onclick="StudentDetailView.switchTab('notes')" id="tab-btn-notes" class="px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${this.activeTab === 'notes' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}">
            <i data-lucide="file-text" class="w-4 h-4"></i>
            ${I18n.t('pedagogicalNotes')} (${s.observations ? s.observations.length : 0})
          </button>
        </div>

        <!-- Tab Content Panel -->
        <div id="st-tab-content" class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm min-h-[300px]">
          <!-- Injected dynamically -->
        </div>

      </div>
    `;

    this.currentStudent = s;
    this.renderTabContent();
    if (window.lucide) lucide.createIcons();
  },

  switchTab(tab) {
    this.activeTab = tab;
    ['payments', 'attendance', 'notes'].forEach(t => {
      const btn = document.getElementById(`tab-btn-${t}`);
      if (btn) {
        btn.className = `px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${this.activeTab === t ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`;
      }
    });
    this.renderTabContent();
  },

  renderTabContent() {
    const content = document.getElementById('st-tab-content');
    if (!content || !this.currentStudent) return;
    const s = this.currentStudent;
    const currency = 'DT';

    if (this.activeTab === 'payments') {
      const payments = s.payment_history || [];
      content.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-bold text-slate-900">${I18n.t('paymentHistory')}</h3>
              <p class="text-xs text-slate-500">${I18n.t('monthlyTariff')} : <strong>${s.monthly_price} ${I18n.t('currency')}</strong></p>
            </div>
            <button onclick="StudentsView.openPaymentModal(${s.id})" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i> ${I18n.t('recordPayment')}
            </button>
          </div>

          ${payments.length === 0 ? `
            <div class="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p class="text-xs text-slate-400">${I18n.t('noPaymentsFound')}</p>
            </div>
          ` : `
            <div class="overflow-x-auto">
              <table class="w-full text-left rtl:text-right text-xs sm:text-sm">
                <thead class="bg-slate-50 text-slate-500 font-bold uppercase text-[11px]">
                  <tr>
                    <th class="px-4 py-3">${I18n.t('month')}</th>
                    <th class="px-4 py-3">${I18n.t('amount')}</th>
                    <th class="px-4 py-3">${I18n.t('date')}</th>
                    <th class="px-4 py-3">${I18n.t('paymentMethod')}</th>
                    <th class="px-4 py-3">${I18n.t('status')}</th>
                    <th class="px-4 py-3 text-right rtl:text-left">${I18n.t('receipt')}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${payments.map(p => `
                    <tr>
                      <td class="px-4 py-3.5 font-bold text-slate-900">${p.month}</td>
                      <td class="px-4 py-3.5 font-black text-slate-900">${p.amount} ${I18n.t('currency')}</td>
                      <td class="px-4 py-3.5 text-slate-500 text-xs">${p.payment_date}</td>
                      <td class="px-4 py-3.5 text-slate-600">${I18n.getPaymentMethodLabel(p.payment_method)}</td>
                      <td class="px-4 py-3.5">
                        ${p.status === 'paid' ? `<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">🟢 ${I18n.t('paid')}</span>` :
                          p.status === 'partial' ? `<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">🟠 ${I18n.t('partial')}</span>` :
                          `<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">🔴 ${I18n.t('pending')}</span>`
                        }
                      </td>
                      <td class="px-4 py-3.5 text-right rtl:text-left">
                        <div class="flex items-center justify-end rtl:justify-start gap-1.5">
                          <button onclick="PaymentsView.openReceiptModal(${p.id})" class="px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center gap-1">
                            <i data-lucide="receipt" class="w-3.5 h-3.5"></i> ${I18n.t('receipt')}
                          </button>
                          <a href="/api/payments/${p.id}/pdf" target="_blank" class="px-2 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors inline-flex items-center gap-1">
                            <i data-lucide="file-text" class="w-3.5 h-3.5"></i> PDF
                          </a>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      `;
    } else if (this.activeTab === 'attendance') {
      const attendances = s.attendance_history || [];
      content.innerHTML = `
        <div class="space-y-6">
          <div class="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <p class="text-xs text-slate-500 font-semibold uppercase">${I18n.t('attendance')}</p>
              <p class="text-2xl font-black text-slate-900 mt-0.5">${s.attendance_rate}%</p>
            </div>
            <div class="text-right rtl:text-left">
              <p class="text-xs text-slate-500 font-semibold uppercase">${I18n.t('sessionsToday')}</p>
              <p class="text-2xl font-black text-slate-900 mt-0.5">${s.attendance_count}</p>
            </div>
          </div>

          ${attendances.length === 0 ? `
            <div class="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p class="text-xs text-slate-400">${I18n.t('noSessionsToday')}</p>
            </div>
          ` : `
            <div class="space-y-2.5">
              ${attendances.map(att => `
                <div class="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                      att.status === 'present' ? 'bg-emerald-50 text-emerald-600' :
                      att.status === 'absent' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                    }">
                      <i data-lucide="${att.status === 'present' ? 'check' : att.status === 'absent' ? 'x' : 'clock'}" class="w-4 h-4"></i>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-slate-900">${att.topic || I18n.t('mathLesson')}</p>
                      <p class="text-xs text-slate-400">📅 ${att.date} • ${att.start_time} - ${att.end_time}</p>
                    </div>
                  </div>
                  <span class="text-xs font-bold px-2.5 py-1 rounded-full ${
                    att.status === 'present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    att.status === 'absent' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }">
                    ${att.status === 'present' ? `✅ ${I18n.t('present')}` : att.status === 'absent' ? `❌ ${I18n.t('absent')}` : `🟠 ${I18n.t('late')}`}
                  </span>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `;
    } else if (this.activeTab === 'notes') {
      const observations = s.observations || [];
      content.innerHTML = `
        <div class="space-y-6">
          <!-- Add Note Form -->
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
            <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">${I18n.t('pedagogicalNotes')}</h4>
            <div class="flex gap-2">
              <input id="new-note-input" type="text" placeholder="ex: Difficultés sur les intégrales, progrès sur les complexes..." class="flex-1 px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white">
              <button onclick="StudentDetailView.addNote(${s.id})" class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all shrink-0">
                ${I18n.t('save')}
              </button>
            </div>
          </div>

          <!-- Notes List -->
          <div class="space-y-3">
            ${observations.length === 0 ? `
              <div class="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p class="text-xs text-slate-400">Aucune note pour le moment.</p>
              </div>
            ` : `
              ${observations.map(n => `
                <div class="p-4 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50/50 transition-colors flex items-start justify-between gap-4">
                  <div class="space-y-1">
                    <p class="text-sm font-medium text-slate-800">${n.content}</p>
                    <p class="text-[11px] text-slate-400">🗓️ ${new Date(n.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <button onclick="StudentDetailView.deleteNote(${s.id}, ${n.id})" class="text-slate-300 hover:text-rose-600 p-1 rounded transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                  </button>
                </div>
              `).join('')}
            `}
          </div>
        </div>
      `;
    }

    if (window.lucide) lucide.createIcons();
  },

  async addNote(studentId) {
    const input = document.getElementById('new-note-input');
    if (!input || !input.value.trim()) return;

    try {
      await API.post(`/api/students/${studentId}/notes`, { content: input.value.trim() });
      Toast.success('Note pédagogique enregistrée.');
      const updated = await API.get(`/api/students/${studentId}`);
      this.currentStudent = updated;
      this.renderTabContent();
    } catch (e) {
      Toast.error(e.message);
    }
  },

  async deleteNote(studentId, noteId) {
    try {
      await API.delete(`/api/students/notes/${noteId}`);
      Toast.success('Note supprimée.');
      const updated = await API.get(`/api/students/${studentId}`);
      this.currentStudent = updated;
      this.renderTabContent();
    } catch (e) {
      Toast.error(e.message);
    }
  }
};

