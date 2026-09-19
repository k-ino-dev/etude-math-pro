// Payments Management View — Premium SaaS EdTech 2026 Reference Edition (Étude Math Pro)
const PaymentsView = {
  activeTab: 'transactions', // 'transactions', 'matrix'
  payments: [],
  students: [],
  searchTerm: '',
  filters: {
    month: 'all',
    status: 'all',
    group_id: 0
  },

  async render(container) {
    const isAr = I18n.currentLang === 'ar';
    const currency = 'DT';

    container.innerHTML = `
      <div class="space-y-6 animate-fade-in max-w-7xl mx-auto">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-2xl bg-[#fdfaf3] border border-[#ebd9b5] text-[#a27e38] flex items-center justify-center font-bold shadow-xs">
                <i data-lucide="wallet" class="w-5 h-5"></i>
              </div>
              <span>${isAr ? 'المداخيل والمحاسبة' : 'Comptabilité & Paiements'}</span>
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">
              ${isAr ? 'متابعة المداخيل، استخلاص المستحقات الشهرية وإصدار وصولات الدفع الرسمية.' : 'Suivez les encaissements, gérez les cotisations et éditez les reçus officiels.'}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2.5">
            <div class="flex bg-[#eee7db] p-1 rounded-2xl border border-[#ded5c5] text-xs font-bold text-slate-700">
              <button onclick="PaymentsView.switchTab('transactions')" id="pay-tab-trans" class="px-3.5 py-1.5 rounded-xl transition-all ${this.activeTab === 'transactions' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}">
                ${isAr ? 'سجل المعاملات' : 'Historique'}
              </button>
              <button onclick="PaymentsView.switchTab('matrix')" id="pay-tab-matrix" class="px-3.5 py-1.5 rounded-xl transition-all ${this.activeTab === 'matrix' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}">
                ${isAr ? 'الجدول السنوي' : 'Grille Annuelle'}
              </button>
            </div>

            <a href="/api/reports/monthly/current/pdf" target="_blank" class="px-3.5 py-2.5 bg-white hover:bg-[#fbf9f4] text-slate-700 border border-[#e2dacb] text-xs sm:text-sm font-bold rounded-2xl shadow-xs transition-all flex items-center gap-2">
              <i data-lucide="file-text" class="w-4 h-4 text-[#a27e38]"></i>
              <span>${I18n.t('pdf_report')}</span>
            </a>

            <button onclick="PaymentsView.openModal()" class="px-4 py-2.5 btn-gold-action text-xs sm:text-sm font-black flex items-center gap-2">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>+ ${isAr ? 'تسجيل دفع' : 'Nouveau Paiement'}</span>
            </button>
          </div>
        </div>

        <!-- 4 Financial Summary Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4" id="pay-kpi-grid">
          <div class="skeleton h-24 rounded-3xl"></div>
          <div class="skeleton h-24 rounded-3xl"></div>
          <div class="skeleton h-24 rounded-3xl"></div>
          <div class="skeleton h-24 rounded-3xl"></div>
        </div>

        <!-- Dedicated Quick Student Search Bar (Section 2 Requirement) -->
        <div class="bg-gradient-to-r from-[#fdfbf7] via-white to-[#fcfaf6] p-4 sm:p-5 rounded-3xl border border-[#ede7db] shadow-xs space-y-3">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-[#c5a059]/15 text-[#a27e38] flex items-center justify-center font-bold shrink-0">
                <i data-lucide="search" class="w-4 h-4"></i>
              </div>
              <div>
                <h3 class="text-xs sm:text-sm font-black text-slate-900">${isAr ? 'البحث السريع عن تلميذ' : 'Recherche Rapide d\'Élève'}</h3>
                <p class="text-[11px] text-slate-500 font-medium">${isAr ? 'ابحث بالاسم، اللقب، رقم الهاتف أو الفوج' : 'Filtrer instantanément par nom, prénom, numéro de téléphone ou groupe'}</p>
              </div>
            </div>

            <!-- Search Input Box -->
            <div class="relative flex-1 max-w-md">
              <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"></i>
              <input id="pay-global-student-search" type="text" placeholder="${isAr ? 'اكتب اسم التلميذ، لقبه أو هاتفه...' : 'Rechercher un élève (nom, prénom, tél, groupe)...'}" value="${this.searchTerm}" class="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-9 py-2.5 text-xs sm:text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 bg-white font-medium text-slate-900 shadow-xs">
              <button id="pay-clear-search-btn" class="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 ${this.searchTerm ? '' : 'hidden'}">
                <i data-lucide="x" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>

          <!-- Matched Students Quick Action Bar (shown when typing) -->
          <div id="pay-matched-students-box" class="hidden pt-2 border-t border-[#f2ece1]">
            <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">${isAr ? 'التلاميذ المطابقون للبحث :' : 'Élèves correspondants à la recherche :'}</p>
            <div id="pay-matched-students-list" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
              <!-- Rendered dynamically -->
            </div>
          </div>
        </div>

        <!-- Filters Toolbar (for transactions view) -->
        <div id="pay-filters-toolbar" class="bg-white p-4 rounded-3xl border border-[#ede7db] shadow-xs space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">${isAr ? 'تصفية حسب الشهر' : 'Filtrer par Mois'}</label>
              <select id="pay-filter-month" class="w-full px-3.5 py-2 text-xs sm:text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 bg-[#faf8f5] font-semibold">
                <option value="all">${I18n.t('all_months')}</option>
                <option value="Septembre 2025">Septembre 2025</option>
                <option value="Octobre 2025">Octobre 2025</option>
                <option value="Novembre 2025" selected>Novembre 2025</option>
                <option value="Décembre 2025">Décembre 2025</option>
                <option value="Janvier 2026">Janvier 2026</option>
                <option value="Février 2026">Février 2026</option>
                <option value="Mars 2026">Mars 2026</option>
                <option value="Avril 2026">Avril 2026</option>
                <option value="Mai 2026">Mai 2026</option>
                <option value="Juin 2026">Juin 2026</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">${isAr ? 'تصفية حسب الحالة' : 'Filtrer par Statut'}</label>
              <select id="pay-filter-status" class="w-full px-3.5 py-2 text-xs sm:text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 bg-[#faf8f5] font-semibold">
                <option value="all">${I18n.t('all_statuses')}</option>
                <option value="paid">🟢 ${isAr ? 'خالص (RÉGLÉ)' : 'RÉGLÉ'}</option>
                <option value="partial">🟠 ${I18n.t('partial')}</option>
                <option value="unpaid">🔴 ${I18n.t('unpaid')}</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">${isAr ? 'تصفية حسب الفوج' : 'Filtrer par Groupe'}</label>
              <select id="pay-filter-group" class="w-full px-3.5 py-2 text-xs sm:text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 bg-[#faf8f5] font-semibold">
                <option value="0">${isAr ? 'جميع الأفواج' : 'Tous les groupes'}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Payments Content Container -->
        <div id="payments-content-container" class="bg-white rounded-3xl border border-[#ede7db] shadow-xs overflow-hidden min-h-[300px]">
          <div class="p-8 text-center text-slate-400 text-sm">${isAr ? 'جاري تحميل المعطيات المالية...' : 'Chargement des données financières...'}</div>
        </div>

      </div>
    `;

    if (window.lucide) lucide.createIcons();

    this.initFilterEvents(container);
    await this.loadData(container);
  },

  switchTab(tab) {
    this.activeTab = tab;
    const transBtn = document.getElementById('pay-tab-trans');
    const matrixBtn = document.getElementById('pay-tab-matrix');
    const filtersToolbar = document.getElementById('pay-filters-toolbar');

    if (transBtn) transBtn.className = `px-3.5 py-1.5 rounded-xl transition-all ${this.activeTab === 'transactions' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`;
    if (matrixBtn) matrixBtn.className = `px-3.5 py-1.5 rounded-xl transition-all ${this.activeTab === 'matrix' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`;
    if (filtersToolbar) filtersToolbar.classList.toggle('hidden', this.activeTab === 'matrix');

    const container = document.getElementById('main-view');
    if (container) this.renderContent(container);
  },

  initFilterEvents(container) {
    const monthSelect = container.querySelector('#pay-filter-month');
    const statusSelect = container.querySelector('#pay-filter-status');
    const groupSelect = container.querySelector('#pay-filter-group');
    const searchInput = container.querySelector('#pay-global-student-search');
    const clearSearchBtn = container.querySelector('#pay-clear-search-btn');
    const isAr = I18n.currentLang === 'ar';

    if (groupSelect && State.groups) {
      groupSelect.innerHTML = `<option value="0">${isAr ? 'جميع الأفواج' : 'Tous les groupes'}</option>` +
        State.groups.map(g => {
          const levelLabel = I18n.getLevelLabel(g.level);
          return `<option value="${g.id}">${g.name} (${levelLabel})</option>`;
        }).join('');
    }

    if (monthSelect) {
      monthSelect.addEventListener('change', (e) => {
        this.filters.month = e.target.value;
        this.loadData(container);
      });
    }

    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.filters.status = e.target.value;
        this.loadData(container);
      });
    }

    if (groupSelect) {
      groupSelect.addEventListener('change', (e) => {
        this.filters.group_id = parseInt(e.target.value) || 0;
        this.loadData(container);
      });
    }

    // Live Student Search Listener
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value.trim().toLowerCase();
        if (clearSearchBtn) {
          clearSearchBtn.classList.toggle('hidden', !this.searchTerm);
        }
        this.handleSearchFilter(container);
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        this.searchTerm = '';
        if (searchInput) searchInput.value = '';
        clearSearchBtn.classList.add('hidden');
        this.handleSearchFilter(container);
      });
    }
  },

  async loadData(container) {
    const isAr = I18n.currentLang === 'ar';
    try {
      let query = `?month=${encodeURIComponent(this.filters.month)}&status=${this.filters.status}&group_id=${this.filters.group_id}`;
      const [payments, stats, students] = await Promise.all([
        API.get(`/api/payments${query}`),
        API.get('/api/dashboard/stats'),
        API.get('/api/students')
      ]);

      this.payments = payments || [];
      this.students = students || [];
      const currency = 'DT';

      // Render 4 Financial Summary Cards
      const kpiGrid = container.querySelector('#pay-kpi-grid');
      if (kpiGrid) {
        const remainingDue = Math.max(0, (stats.total_expected_this_month || 0) - (stats.total_collected_this_month || 0));
        kpiGrid.innerHTML = `
          <!-- Total Collecte -->
          <div class="kpi-crystal-card kpi-crystal-amber">
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">${isAr ? 'المداخيل المستخلصة' : 'Paiements Reçus'}</p>
            <p class="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">${stats.total_collected_this_month || 0} <span class="text-xs text-slate-500 font-bold">${currency}</span></p>
          </div>

          <!-- Expected -->
          <div class="kpi-crystal-card kpi-crystal-blue">
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">${I18n.t('expected_revenue')}</p>
            <p class="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">${stats.total_expected_this_month || 0} <span class="text-xs text-slate-500 font-bold">${currency}</span></p>
          </div>

          <!-- Remaining Due -->
          <div class="kpi-crystal-card kpi-crystal-slate">
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">${I18n.t('remaining_due')}</p>
            <p class="text-2xl sm:text-3xl font-black text-rose-600 tabular-nums">${remainingDue} <span class="text-xs text-slate-500 font-bold">${currency}</span></p>
          </div>

          <!-- Pending Count -->
          <div class="kpi-crystal-card kpi-crystal-champagne">
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">${I18n.t('unpaid_students')}</p>
            <p class="text-2xl sm:text-3xl font-black text-[#a27e38] tabular-nums">${stats.pending_payments_count || 0} <span class="text-xs text-slate-500 font-normal">${I18n.t('students')}</span></p>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
      }

      this.handleSearchFilter(container);
    } catch (e) {
      Toast.error(isAr ? 'خطأ أثناء تحميل المدفوعات.' : 'Erreur lors du chargement des paiements.');
    }
  },

  handleSearchFilter(container) {
    const isAr = I18n.currentLang === 'ar';
    const matchedBox = container.querySelector('#pay-matched-students-box');
    const matchedList = container.querySelector('#pay-matched-students-list');

    if (!this.searchTerm) {
      if (matchedBox) matchedBox.classList.add('hidden');
      this.renderContent(container);
      return;
    }

    // Filter students by search term (name, phone, group)
    const term = this.searchTerm;
    const matchingStudents = (this.students || []).filter(s => {
      const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
      const phone = `${s.student_phone || ''} ${s.father_phone || ''} ${s.mother_phone || ''}`.toLowerCase();
      const group = (s.group_name || '').toLowerCase();
      const level = (s.level || '').toLowerCase();
      return fullName.includes(term) || phone.includes(term) || group.includes(term) || level.includes(term);
    });

    if (matchedBox && matchedList) {
      if (matchingStudents.length > 0) {
        matchedBox.classList.remove('hidden');
        matchedList.innerHTML = matchingStudents.slice(0, 6).map(s => {
          const levelLabel = I18n.getLevelLabel(s.level);
          const phone = s.student_phone || s.father_phone || s.mother_phone || '';
          return `
            <div class="p-3 bg-white rounded-2xl border border-[#ede7db] shadow-xs flex items-center justify-between gap-2 hover:border-[#c5a059] transition-all">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#c5a059] to-[#dfc288] text-white font-black flex items-center justify-center text-xs shrink-0">
                  ${(s.first_name[0] || 'É').toUpperCase()}
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-bold text-slate-900 truncate">${s.first_name} ${s.last_name}</p>
                  <p class="text-[10px] text-slate-500 truncate">${levelLabel} • ${s.group_name || 'Sans groupe'} ${phone ? '• 📞 ' + phone : ''}</p>
                </div>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <button onclick="PaymentsView.openModal(${s.id})" class="px-2.5 py-1.5 btn-gold-action text-[11px] font-black flex items-center gap-1 whitespace-nowrap shadow-xs">
                  <i data-lucide="plus" class="w-3 h-3"></i>
                  <span>${isAr ? 'دفع' : 'Payer'}</span>
                </button>
                <a href="#students/${s.id}" class="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors" title="${isAr ? 'عرض الملف' : 'Voir Fiche'}">
                  <i data-lucide="user" class="w-3.5 h-3.5"></i>
                </a>
              </div>
            </div>
          `;
        }).join('');
        if (window.lucide) lucide.createIcons();
      } else {
        matchedBox.classList.remove('hidden');
        matchedList.innerHTML = `<div class="col-span-full py-2 text-center text-xs text-slate-400 italic">${isAr ? 'لا يوجد تلاميذ يطابقون بحثك.' : 'Aucun élève ne correspond à cette recherche.'}</div>`;
      }
    }

    this.renderContent(container);
  },

  async renderContent(container) {
    const contentEl = container.querySelector('#payments-content-container');
    if (!contentEl) return;

    if (this.activeTab === 'transactions') {
      this.renderTransactions(contentEl);
    } else {
      await this.renderMatrix(contentEl);
    }
  },

  renderTransactions(container) {
    const isAr = I18n.currentLang === 'ar';
    const currency = 'DT';
    
    // Apply search filter on payments list as well
    let payments = this.payments;
    if (this.searchTerm) {
      const term = this.searchTerm;
      payments = payments.filter(p => {
        const studentName = (p.student_name || '').toLowerCase();
        const receipt = (p.receipt_number || '').toLowerCase();
        const month = (p.month || '').toLowerCase();
        return studentName.includes(term) || receipt.includes(term) || month.includes(term);
      });
    }

    if (!payments || payments.length === 0) {
      container.innerHTML = `
        <div class="p-12 text-center">
          <i data-lucide="receipt" class="w-10 h-10 text-slate-300 mx-auto mb-3"></i>
          <p class="text-base font-bold text-slate-700">${isAr ? 'لم يتم العثور على أي خلاص' : 'Aucun paiement trouvé'}</p>
          <p class="text-xs text-slate-400 mt-1">${isAr ? 'قم بتعديل خيارات التصفية أو تسجيل دفع جديد.' : 'Ajustez vos filtres ou enregistrez un nouveau paiement.'}</p>
          <button onclick="PaymentsView.openModal()" class="mt-4 px-4 py-2.5 btn-gold-action text-xs font-black">
            + ${isAr ? 'تسجيل دفع' : 'Nouveau Paiement'}
          </button>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-left rtl:text-right text-xs sm:text-sm">
          <thead class="bg-[#faf8f5] text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-[#ede7db]">
            <tr>
              <th class="px-6 py-3.5">${isAr ? 'رقم الوصل' : 'N° Reçu'}</th>
              <th class="px-6 py-3.5">${isAr ? 'التلميذ' : 'Élève'}</th>
              <th class="px-6 py-3.5">${isAr ? 'الشهر المعني' : 'Mois Concerné'}</th>
              <th class="px-6 py-3.5 font-extrabold text-slate-800">${isAr ? 'المبلغ' : 'Montant'}</th>
              <th class="px-6 py-3.5">${isAr ? 'التاريخ' : 'Date'}</th>
              <th class="px-6 py-3.5">${isAr ? 'الحالة' : 'Statut'}</th>
              <th class="px-6 py-3.5 text-right rtl:text-left">${isAr ? 'إجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#f2ece1]">
            ${payments.map(p => {
              const isPaid = (p.status === 'paid') || (p.amount >= (p.monthly_price || p.amount));
              return `
              <tr class="hover:bg-[#fdfbf7] transition-colors">
                <td class="px-6 py-4 font-mono font-bold text-xs text-slate-700">
                  ${p.receipt_number || '---'}
                </td>
                <td class="px-6 py-4">
                  <a href="#students/${p.student_id}" class="font-bold text-slate-900 hover:text-[#a27e38] transition-colors">
                    ${p.student_name}
                  </a>
                </td>
                <td class="px-6 py-4 font-semibold text-slate-700">
                  ${p.month}
                </td>
                <td class="px-6 py-4 font-black text-slate-900 text-sm">
                  ${p.amount} ${currency}
                </td>
                <td class="px-6 py-4 font-medium text-slate-600">
                  ${p.payment_date}
                </td>
                <td class="px-6 py-4">
                  ${
                    isPaid ?
                      `<span class="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">🟢 ${isAr ? 'خالص (RÉGLÉ)' : 'RÉGLÉ'}</span>` :
                    p.status === 'partial' ?
                      `<span class="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">🟠 ${I18n.t('partial')} (${isAr ? 'المتبقي' : 'reste'} ${p.remaining_due} ${currency})</span>` :
                      `<span class="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">🔴 ${I18n.t('unpaid')}</span>`
                  }
                </td>
                <td class="px-6 py-4 text-right rtl:text-left">
                  <div class="flex items-center justify-end rtl:justify-start gap-1.5">
                    <button onclick="PaymentsView.openReceiptModal(${p.id})" title="${isAr ? 'عرض الوصل' : 'Voir Reçu'}" class="p-1.5 text-slate-400 hover:text-[#a27e38] hover:bg-[#faf5ec] rounded-xl transition-colors">
                      <i data-lucide="receipt" class="w-4 h-4"></i>
                    </button>
                    <a href="/api/payments/${p.id}/pdf" target="_blank" title="${isAr ? 'تحميل الوصل PDF' : 'Télécharger Reçu PDF Officiel'}" class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                      <i data-lucide="file-text" class="w-4 h-4"></i>
                    </a>
                    <button onclick="PaymentsView.deletePayment(${p.id})" title="${isAr ? 'حذف' : 'Supprimer'}" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                      <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  async renderMatrix(container) {
    const isAr = I18n.currentLang === 'ar';
    try {
      container.innerHTML = `<div class="p-12 text-center text-slate-400 text-sm animate-pulse">${isAr ? 'جاري إنشاء جدول التتبع السنوي...' : 'Génération de la grille annuelle...'}</div>`;
      const matrix = await API.get('/api/payments/summary/matrix');

      container.innerHTML = `
        <div class="p-4 bg-[#faf8f5] border-b border-[#ede7db] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
          <span class="font-bold text-slate-800">${isAr ? 'جدول تتبع الاشتراكات الشهرية لكل تلميذ' : 'Grille de suivi des cotisations mensuelles'}</span>
          <div class="flex items-center gap-3">
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> ${isAr ? 'خالص' : 'RÉGLÉ'}</span>
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> ${I18n.t('partial')}</span>
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-slate-300"></span> ${I18n.t('unpaid')}</span>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left rtl:text-right text-xs">
            <thead class="bg-[#faf8f5] text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th class="px-4 py-3 sticky left-0 rtl:left-auto rtl:right-0 bg-[#faf8f5] z-10">${isAr ? 'التلميذ' : 'Élève'}</th>
                <th class="px-3 py-3">${isAr ? 'الفوج' : 'Groupe'}</th>
                ${(matrix.months || []).map(m => `<th class="px-2.5 py-3 text-center">${m.split(' ')[0].slice(0, 4)}.</th>`).join('')}
              </tr>
            </thead>
            <tbody class="divide-y divide-[#f2ece1]">
              ${(matrix.rows || []).map(r => `
                <tr class="hover:bg-[#fdfbf7]">
                  <td class="px-4 py-3 font-bold text-slate-900 sticky left-0 rtl:left-auto rtl:right-0 bg-white hover:bg-[#fdfbf7] z-10 whitespace-nowrap">
                    <a href="#students/${r.student_id}" class="hover:text-[#a27e38]">${r.student_name}</a>
                  </td>
                  <td class="px-3 py-3 text-slate-500 whitespace-nowrap">${r.group_name}</td>
                  ${(matrix.months || []).map(m => {
                    const cell = r.months ? r.months[m] : null;
                    if (cell && cell.status === 'paid') {
                      return `<td class="px-2.5 py-3 text-center"><span class="inline-block w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] leading-5" title="${m}: RÉGLÉ (${cell.amount} DT)">✓</span></td>`;
                    } else if (cell && cell.status === 'partial') {
                      return `<td class="px-2.5 py-3 text-center"><span class="inline-block w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold text-[10px] leading-5" title="${m}: ${I18n.t('partial')} (${cell.amount} DT)">½</span></td>`;
                    } else {
                      return `<td class="px-2.5 py-3 text-center"><span class="inline-block w-5 h-5 rounded-full bg-slate-100 text-slate-400 text-[10px] leading-5" title="${m}: ${I18n.t('unpaid')}">-</span></td>`;
                    }
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div class="p-8 text-center text-rose-500">${isAr ? 'خطأ أثناء تحميل جدول التتبع.' : 'Erreur lors du chargement de la matrice.'}</div>`;
    }
  },

  async openModal(preSelectedStudentId = null) {
    const students = await API.get('/api/students') || [];
    const isAr = I18n.currentLang === 'ar';
    const currency = 'DT';

    Modal.open({
      title: `+ ${isAr ? 'تسجيل دفع جديد' : 'Enregistrer un Paiement'}`,
      size: 'max-w-lg',
      html: `
        <form id="payment-form" class="space-y-4">
          
          <!-- Student Search & Selection (Section 2 Requirement) -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              ${isAr ? 'البحث عن التلميذ واختياره *' : 'Rechercher et Sélectionner l\'élève *'}
            </label>
            
            <div id="pay-student-search-container" class="space-y-2">
              <div class="relative">
                <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none"></i>
                <input id="pay-student-search" type="text" autocomplete="off" placeholder="${isAr ? 'ابحث بالاسم، اللقب، الهاتف أو الفوج...' : 'Rechercher par nom, prénom, téléphone, groupe...'}" class="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 bg-[#faf8f5] font-medium text-slate-900 shadow-xs">
              </div>

              <!-- Live Filtered Search Results Dropdown -->
              <div id="pay-student-search-results" class="student-search-results hidden">
                <!-- Injected via JS -->
              </div>

              <!-- Selected Student Display Card (NO STUDENT ID EXPOSED) -->
              <div id="pay-selected-student-card" class="student-selected-banner ${preSelectedStudentId ? '' : 'hidden'}">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#c5a059] to-[#dfc288] text-white font-black flex items-center justify-center text-sm shadow-xs" id="pay-selected-student-avatar">
                    É
                  </div>
                  <div>
                    <h4 class="text-sm font-bold text-slate-900" id="pay-selected-student-name">Élève Sélectionné</h4>
                    <p class="text-xs text-slate-500 font-medium" id="pay-selected-student-info">Groupe • Niveau</p>
                  </div>
                </div>
                <button type="button" id="pay-change-student-btn" class="px-3 py-1.5 rounded-xl bg-white border border-[#ded7ca] text-xs font-bold text-[#856428] hover:bg-[#faf5ec] shadow-xs">
                  ${isAr ? 'تغيير' : 'Changer'}
                </button>
              </div>

              <!-- Hidden Input with Actual Selected Student ID -->
              <input type="hidden" id="pay-student-id" required value="${preSelectedStudentId || ''}">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${isAr ? 'الشهر المعني *' : 'Mois Concerné *'}</label>
              <select id="pay-month" required class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 bg-white font-semibold text-slate-900">
                <option value="Septembre 2025">Septembre 2025</option>
                <option value="Octobre 2025">Octobre 2025</option>
                <option value="Novembre 2025" selected>Novembre 2025</option>
                <option value="Décembre 2025">Décembre 2025</option>
                <option value="Janvier 2026">Janvier 2026</option>
                <option value="Février 2026">Février 2026</option>
                <option value="Mars 2026">Mars 2026</option>
                <option value="Avril 2026">Avril 2026</option>
                <option value="Mai 2026">Mai 2026</option>
                <option value="Juin 2026">Juin 2026</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${isAr ? 'مبلغ الدفع (DT) *' : `Montant du Paiement (${currency}) *`}</label>
              <input id="pay-amount" type="number" step="5" required value="80.0" class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 font-black text-slate-900">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${isAr ? 'تاريخ الدفع' : 'Date de paiement'}</label>
            <input id="pay-date" type="date" value="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 font-medium">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">${isAr ? 'ملاحظات' : 'Notes / Remarque'}</label>
            <input id="pay-notes" type="text" placeholder="${isAr ? 'ملاحظة اختيارية...' : 'Remarque optionnelle...'}" class="w-full px-3 py-2 text-sm border border-[#ded7ca] rounded-2xl focus:ring-2 focus:ring-[#c5a059]/40 font-medium">
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-[#ede7db]">
            <button type="button" onclick="Modal.close()" class="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-[#ede5d8] rounded-2xl transition-colors">
              ${isAr ? 'إلغاء' : 'Annuler'}
            </button>
            <button type="submit" class="px-5 py-2.5 btn-gold-action text-xs sm:text-sm font-black">
              ${isAr ? 'تأكيد الدفع' : 'Valider le Paiement'}
            </button>
          </div>
        </form>
      `,
      onOpen: (content) => {
        const searchInput = content.querySelector('#pay-student-search');
        const searchResults = content.querySelector('#pay-student-search-results');
        const selectedStudentCard = content.querySelector('#pay-selected-student-card');
        const selectedStudentAvatar = content.querySelector('#pay-selected-student-avatar');
        const selectedStudentName = content.querySelector('#pay-selected-student-name');
        const selectedStudentInfo = content.querySelector('#pay-selected-student-info');
        const changeStudentBtn = content.querySelector('#pay-change-student-btn');
        const studentIdInput = content.querySelector('#pay-student-id');
        const amountInput = content.querySelector('#pay-amount');

        function selectStudent(st) {
          studentIdInput.value = st.id;
          selectedStudentName.innerText = `${st.first_name} ${st.last_name}`;
          const levelLabel = I18n.getLevelLabel(st.level);
          const groupName = st.group_name || (isAr ? 'بدون فوج' : 'Sans groupe');
          const phone = st.student_phone || st.father_phone || st.mother_phone || '';
          selectedStudentInfo.innerText = `${levelLabel} • ${groupName} ${phone ? '• 📞 ' + phone : ''}`;
          selectedStudentAvatar.innerText = (st.first_name[0] || 'É').toUpperCase();
          if (st.monthly_price) {
            amountInput.value = st.monthly_price;
          }

          selectedStudentCard.classList.remove('hidden');
          searchResults.classList.add('hidden');
          searchInput.parentElement.classList.add('hidden');
        }

        function resetStudentSelection() {
          studentIdInput.value = '';
          selectedStudentCard.classList.add('hidden');
          searchInput.parentElement.classList.remove('hidden');
          searchInput.value = '';
          searchInput.focus();
          renderFilteredList('');
        }

        function renderFilteredList(filterTerm) {
          const term = (filterTerm || '').trim().toLowerCase();
          const filtered = (students || []).filter(s => {
            const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
            const phone = `${s.student_phone || ''} ${s.father_phone || ''} ${s.mother_phone || ''}`.toLowerCase();
            const group = (s.group_name || '').toLowerCase();
            return fullName.includes(term) || phone.includes(term) || group.includes(term);
          });

          if (filtered.length === 0) {
            searchResults.innerHTML = `<div class="p-4 text-center text-xs text-slate-400">${isAr ? 'لا توجد نتائج' : 'Aucun élève trouvé'}</div>`;
          } else {
            searchResults.innerHTML = filtered.map(s => {
              const levelLabel = I18n.getLevelLabel(s.level);
              const phone = s.student_phone || s.father_phone || s.mother_phone || '';
              return `
                <div class="student-search-item" data-id="${s.id}">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-xl bg-[#eee7db] text-slate-700 font-bold flex items-center justify-center text-xs">
                      ${(s.first_name[0] || 'É').toUpperCase()}
                    </div>
                    <div>
                      <p class="text-xs font-bold text-slate-900">${s.first_name} ${s.last_name}</p>
                      <p class="text-[11px] text-slate-500">${levelLabel} • ${s.group_name || (isAr ? 'بدون فوج' : 'Sans groupe')} ${phone ? '• 📞 ' + phone : ''}</p>
                    </div>
                  </div>
                  <span class="text-xs font-bold text-[#856428]">${s.monthly_price || 80} DT</span>
                </div>
              `;
            }).join('');

            searchResults.querySelectorAll('.student-search-item').forEach(item => {
              item.addEventListener('click', () => {
                const stId = parseInt(item.getAttribute('data-id'));
                const targetStudent = students.find(s => s.id === stId);
                if (targetStudent) selectStudent(targetStudent);
              });
            });
          }
          searchResults.classList.remove('hidden');
        }

        searchInput.addEventListener('input', (e) => {
          renderFilteredList(e.target.value);
        });

        searchInput.addEventListener('focus', () => {
          renderFilteredList(searchInput.value);
        });

        if (changeStudentBtn) {
          changeStudentBtn.addEventListener('click', resetStudentSelection);
        }

        // If pre-selected student provided
        if (preSelectedStudentId) {
          const found = students.find(s => s.id === preSelectedStudentId);
          if (found) selectStudent(found);
        }

        const form = content.querySelector('#payment-form');
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const chosenStudentId = parseInt(studentIdInput.value);
          if (!chosenStudentId) {
            Toast.error(isAr ? 'يرجى اختيار التلميذ أولاً.' : 'Veuillez sélectionner un élève.');
            searchInput.focus();
            return;
          }

          const payload = {
            student_id: chosenStudentId,
            month: content.querySelector('#pay-month').value,
            amount: parseFloat(content.querySelector('#pay-amount').value),
            payment_method: "Espèces",
            payment_date: content.querySelector('#pay-date').value,
            notes: content.querySelector('#pay-notes').value.trim() || null
          };

          try {
            const newPayment = await API.post('/api/payments', payload);
            if (window.confetti) confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
            Toast.success(isAr ? 'تم تسجيل الدفع بنجاح !' : 'Paiement enregistré avec succès !');
            Modal.close();
            await State.loadInitialData();
            
            // Instantly refresh current active view
            const currentHash = window.location.hash;
            if (currentHash.startsWith('#students/') && typeof StudentDetailView !== 'undefined') {
              const currentStId = parseInt(currentHash.split('/')[1]);
              if (currentStId) {
                StudentDetailView.render(document.getElementById('main-view'), currentStId);
              }
            } else if (currentHash === '#students' && typeof StudentsView !== 'undefined') {
              StudentsView.loadStudents(document.getElementById('main-view'));
            } else if (currentHash === '#payments' && typeof PaymentsView !== 'undefined') {
              PaymentsView.loadData(document.getElementById('main-view'));
            }

            // Show receipt modal
            setTimeout(() => {
              PaymentsView.openReceiptModal(newPayment.id);
            }, 300);
          } catch (err) {
            Toast.error(err.message);
          }
        });

        if (window.lucide) lucide.createIcons();
      }
    });
  },

  async openReceiptModal(paymentId) {
    const isAr = I18n.currentLang === 'ar';
    try {
      const receipt = await API.get(`/api/payments/${paymentId}/receipt`);
      const levelLabel = I18n.getLevelLabel(receipt.level);
      const isFullyPaid = receipt.is_fully_paid || (receipt.amount_paid >= receipt.monthly_price && receipt.amount_paid > 0);

      Modal.open({
        title: `${I18n.t('receipt')} : ${receipt.receipt_number}`,
        size: 'max-w-md',
        html: `
          <div id="printable-receipt" class="receipt-paper space-y-5 font-sans">
            
            <!-- Receipt Header -->
            <div class="text-center pb-4 border-b border-[#ede7db]">
              <div class="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#c5a059] to-[#dfc288] text-white font-black text-xl mb-2 shadow-xs">
                ∑
              </div>
              <h3 class="text-lg font-black text-slate-900">${receipt.teacher_name}</h3>
              <p class="text-xs text-slate-500 font-semibold mt-0.5">${isAr ? 'دروس خصوصية في مادة الرياضيات' : 'Étude Math Pro — Cours Particuliers de Mathématiques'}</p>
              <p class="text-[11px] text-slate-400 mt-0.5">📞 ${receipt.teacher_phone || '+216'} • ${isAr ? 'السنة' : 'Année'} ${receipt.school_year}</p>
            </div>

            <!-- Receipt Info Meta -->
            <div class="flex justify-between items-center text-xs bg-[#faf8f5] p-3 rounded-2xl border border-[#ede7db]">
              <div>
                <span class="text-slate-400 font-bold">${isAr ? 'رقم الوصل' : 'Reçu N°'} :</span>
                <strong class="font-mono text-slate-900">${receipt.receipt_number}</strong>
              </div>
              <div>
                <span class="text-slate-400 font-bold">${isAr ? 'التاريخ' : 'Date'} :</span>
                <strong class="text-slate-900">${receipt.date}</strong>
              </div>
            </div>

            <!-- Student & Course Details (NO TECHNICAL STUDENT ID) -->
            <div class="space-y-2 text-xs">
              <div class="flex justify-between py-1.5 border-b border-[#f2ece1]">
                <span class="text-slate-500 font-semibold">${isAr ? 'التلميذ' : 'Élève'} :</span>
                <strong class="text-slate-900 text-sm font-bold">${receipt.student_name}</strong>
              </div>
              <div class="flex justify-between py-1.5 border-b border-[#f2ece1]">
                <span class="text-slate-500 font-semibold">${isAr ? 'المستوى والفوج' : 'Niveau & Groupe'} :</span>
                <strong class="text-slate-900 font-bold">${levelLabel} — ${receipt.group_name || 'Sans groupe'}</strong>
              </div>
              <div class="flex justify-between py-1.5 border-b border-[#f2ece1]">
                <span class="text-slate-500 font-semibold">${isAr ? 'الشهر المستخلص' : 'Mois concerné'} :</span>
                <strong class="text-slate-900 font-bold">${receipt.month}</strong>
              </div>
              <div class="flex justify-between py-1.5 border-b border-[#f2ece1]">
                <span class="text-slate-500 font-semibold">${isAr ? 'التعريفة الشهرية' : 'Tarif mensuel'} :</span>
                <strong class="text-slate-900 font-bold">${receipt.monthly_price} DT</strong>
              </div>
            </div>

            <!-- Large Total Box -->
            ${isFullyPaid ? `
              <div class="p-4 rounded-2xl bg-emerald-50/90 border-2 border-emerald-200 flex items-center justify-between shadow-xs">
                <div>
                  <p class="text-xs font-black text-emerald-900 uppercase tracking-wider">${isAr ? 'المبلغ المستخلص بالكامل' : 'Montant Total Réglé'}</p>
                  <p class="text-[11px] text-emerald-700 font-bold mt-0.5">✓ ${isAr ? 'تم استخلاص المبلغ' : 'Paiement validé'}</p>
                </div>
                <div class="text-right rtl:text-left">
                  <p class="text-2xl font-black text-emerald-700 tabular-nums">${receipt.amount_paid} DT</p>
                </div>
              </div>
            ` : `
              <div class="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-200 flex items-center justify-between shadow-xs">
                <div>
                  <p class="text-xs font-black text-amber-900 uppercase tracking-wider">${isAr ? 'المبلغ المدفوع (تسبقة)' : 'Montant Réglé (Acompte)'}</p>
                  <p class="text-[11px] text-amber-700 font-bold mt-0.5">${isAr ? 'المتبقي للخلاص' : 'Reste à payer'} : <strong>${receipt.remaining_due} DT</strong></p>
                </div>
                <div class="text-right rtl:text-left">
                  <p class="text-2xl font-black text-amber-700 tabular-nums">${receipt.amount_paid} DT</p>
                </div>
              </div>
            `}

            <p class="text-[10px] text-slate-400 text-center italic pt-1">
              ${isAr ? 'شكراً على ثقتكم. وصل إلكتروني رسمي صادق عن منظومة ÉtudeMath Pro.' : 'Merci pour votre confiance. Reçu officiel généré électroniquement par ÉtudeMath Pro.'}
            </p>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-[#ede7db] no-print">
            <button onclick="Modal.close()" class="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-[#ede5d8] rounded-2xl transition-colors">
              ${isAr ? 'إغلاق' : 'Fermer'}
            </button>
            <div class="flex items-center gap-2">
              <a href="/api/payments/${paymentId}/pdf" target="_blank" class="px-3.5 py-2 bg-white hover:bg-[#fbf9f4] text-slate-800 border border-[#ded7ca] text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-xs transition-all">
                <i data-lucide="file-text" class="w-4 h-4 text-[#a27e38]"></i> ${isAr ? 'تحميل الوصل PDF' : 'Reçu PDF Officiel'}
              </a>
              <button onclick="window.print()" class="px-4 py-2 btn-gold-action text-xs font-black flex items-center gap-1.5">
                <i data-lucide="printer" class="w-4 h-4"></i> ${I18n.t('print')}
              </button>
            </div>
          </div>
        `
      });
      if (window.lucide) lucide.createIcons();
    } catch (e) {
      Toast.error(isAr ? 'خطأ أثناء إنشاء الوصل.' : 'Erreur lors de la génération du reçu.');
    }
  },

  deletePayment(paymentId) {
    const isAr = I18n.currentLang === 'ar';
    Modal.confirm({
      title: isAr ? "حذف عملية الخلاص" : "Supprimer le paiement",
      message: isAr ? "هل أنت متأكد من رغبتك في حذف هذا التسجيل المالي نهائياً ؟" : "Êtes-vous sûr de vouloir supprimer cet enregistrement de paiement ?",
      confirmText: isAr ? "نعم، حذف" : "Supprimer",
      onConfirm: async () => {
        try {
          await API.delete(`/api/payments/${paymentId}`);
          Toast.success(isAr ? "تم حذف عملية الخلاص بنجاح." : "Paiement supprimé.");
          await State.loadInitialData();
          await PaymentsView.loadData(document.getElementById('main-view'));
        } catch (e) {
          Toast.error(e.message);
        }
      }
    });
  }
};

