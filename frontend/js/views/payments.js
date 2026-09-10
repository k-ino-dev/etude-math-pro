// Payments Management View
const PaymentsView = {
  activeTab: 'transactions', // 'transactions', 'matrix'
  payments: [],
  filters: {
    month: 'all',
    status: 'all',
    group_id: 0
  },

  async render(container) {
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <i data-lucide="wallet" class="w-5 h-5"></i>
              </div>
              Gestion des Paiements & Finances
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">Suivez les encaissements, relancez les impayés et éditez les reçus.</p>
          </div>

          <div class="flex flex-wrap items-center gap-2.5">
            <div class="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
              <button onclick="PaymentsView.switchTab('transactions')" id="pay-tab-trans" class="px-3 py-1.5 rounded-lg transition-colors ${this.activeTab === 'transactions' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}">Historique</button>
              <button onclick="PaymentsView.switchTab('matrix')" id="pay-tab-matrix" class="px-3 py-1.5 rounded-lg transition-colors ${this.activeTab === 'matrix' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}">Grille Annuelle</button>
            </div>

            <a href="/api/reports/monthly/current/pdf" target="_blank" class="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5">
              <i data-lucide="file-text" class="w-4 h-4"></i>
              <span>Rapport PDF</span>
            </a>

            <button onclick="PaymentsView.openModal()" class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm shadow-emerald-600/30 transition-all flex items-center gap-2">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>+ Enregistrer Paiement</span>
            </button>
          </div>
        </div>

        <!-- 4 Financial Summary Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4" id="pay-kpi-grid">
          <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-pulse h-24"></div>
          <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-pulse h-24"></div>
          <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-pulse h-24"></div>
          <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-pulse h-24"></div>
        </div>

        <!-- Filters Toolbar (for transactions view) -->
        <div id="pay-filters-toolbar" class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">Filtrer par Mois</label>
              <select id="pay-filter-month" class="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 bg-slate-50/50 font-medium">
                <option value="all">Tous les mois</option>
                <option value="Novembre 2025" selected>Novembre 2025 (Mois en cours)</option>
                <option value="Octobre 2025">Octobre 2025</option>
                <option value="Septembre 2025">Septembre 2025</option>
                <option value="Décembre 2025">Décembre 2025</option>
                <option value="Janvier 2026">Janvier 2026</option>
                <option value="Février 2026">Février 2026</option>
                <option value="Mars 2026">Mars 2026</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">Filtrer par Statut</label>
              <select id="pay-filter-status" class="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 bg-slate-50/50 font-medium">
                <option value="all">Tous les statuts</option>
                <option value="paid">🟢 Payé intégralement</option>
                <option value="partial">🟠 Partiellement payé</option>
                <option value="unpaid">🔴 En retard / Non payé</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">Filtrer par Groupe</label>
              <select id="pay-filter-group" class="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 bg-slate-50/50 font-medium">
                <option value="0">Tous les groupes</option>
                <!-- Injected dynamically -->
              </select>
            </div>
          </div>
        </div>

        <!-- Payments Content Container -->
        <div id="payments-content-container" class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden min-h-[300px]">
          <div class="p-8 text-center text-slate-400 text-sm">Chargement des données financières...</div>
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

    if (transBtn) transBtn.className = `px-3 py-1.5 rounded-lg transition-colors ${this.activeTab === 'transactions' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}`;
    if (matrixBtn) matrixBtn.className = `px-3 py-1.5 rounded-lg transition-colors ${this.activeTab === 'matrix' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}`;
    if (filtersToolbar) filtersToolbar.classList.toggle('hidden', this.activeTab === 'matrix');

    const container = document.getElementById('main-view');
    if (container) this.renderContent(container);
  },

  initFilterEvents(container) {
    const monthSelect = container.querySelector('#pay-filter-month');
    const statusSelect = container.querySelector('#pay-filter-status');
    const groupSelect = container.querySelector('#pay-filter-group');

    if (groupSelect && State.groups) {
      groupSelect.innerHTML = '<option value="0">Tous les groupes</option>' +
        State.groups.map(g => `<option value="${g.id}">${g.name} (${g.level})</option>`).join('');
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
  },

  async loadData(container) {
    try {
      let query = `?month=${encodeURIComponent(this.filters.month)}&status=${this.filters.status}&group_id=${this.filters.group_id}`;
      const [payments, stats] = await Promise.all([
        API.get(`/api/payments${query}`),
        API.get('/api/dashboard/stats')
      ]);

      this.payments = payments;
      const currency = State.currency || 'DT';

      // Render KPIs
      const kpiGrid = container.querySelector('#pay-kpi-grid');
      if (kpiGrid) {
        kpiGrid.innerHTML = `
          <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <p class="text-[11px] font-bold text-slate-500 uppercase">Encaissé ce mois</p>
            <p class="text-xl sm:text-2xl font-black text-emerald-600 mt-1">${stats.total_collected_this_month} <span class="text-xs text-slate-400 font-bold">${currency}</span></p>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <p class="text-[11px] font-bold text-slate-500 uppercase">Revenu Attendu</p>
            <p class="text-xl sm:text-2xl font-black text-slate-900 mt-1">${stats.total_expected_this_month} <span class="text-xs text-slate-400 font-bold">${currency}</span></p>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <p class="text-[11px] font-bold text-slate-500 uppercase">Reste à Recouvrer</p>
            <p class="text-xl sm:text-2xl font-black text-rose-600 mt-1">${Math.max(0, stats.total_expected_this_month - stats.total_collected_this_month)} <span class="text-xs text-slate-400 font-bold">${currency}</span></p>
          </div>
          <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <p class="text-[11px] font-bold text-slate-500 uppercase">Paiements en Retard</p>
            <p class="text-xl sm:text-2xl font-black text-amber-600 mt-1">${stats.pending_payments_count} <span class="text-xs text-slate-400 font-normal">élèves</span></p>
          </div>
        `;
      }

      this.renderContent(container);
    } catch (e) {
      Toast.error('Erreur lors du chargement des paiements.');
    }
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
    const currency = State.currency || 'DT';
    const payments = this.payments;

    if (payments.length === 0) {
      container.innerHTML = `
        <div class="p-12 text-center">
          <i data-lucide="receipt" class="w-10 h-10 text-slate-300 mx-auto mb-3"></i>
          <p class="text-base font-bold text-slate-700">Aucun paiement trouvé</p>
          <p class="text-xs text-slate-400 mt-1">Ajustez vos filtres ou enregistrez un nouveau règlement.</p>
          <button onclick="PaymentsView.openModal()" class="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm">
            + Enregistrer un paiement
          </button>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs sm:text-sm">
          <thead class="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-100">
            <tr>
              <th class="px-6 py-3.5">N° Reçu</th>
              <th class="px-6 py-3.5">Élève</th>
              <th class="px-6 py-3.5">Mois Concerné</th>
              <th class="px-6 py-3.5">Montant Versé</th>
              <th class="px-6 py-3.5">Date & Mode</th>
              <th class="px-6 py-3.5">Statut</th>
              <th class="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${payments.map(p => `
              <tr class="hover:bg-slate-50/80 transition-colors">
                <td class="px-6 py-4 font-mono font-bold text-xs text-slate-600">
                  ${p.receipt_number || '---'}
                </td>
                <td class="px-6 py-4">
                  <a href="#students/${p.student_id}" class="font-bold text-slate-900 hover:text-brand-600 transition-colors">
                    ${p.student_name}
                  </a>
                  <p class="text-[11px] text-slate-400 font-mono">${p.student_code}</p>
                </td>
                <td class="px-6 py-4 font-semibold text-slate-800">
                  ${p.month}
                </td>
                <td class="px-6 py-4 font-black text-slate-900 text-sm">
                  ${p.amount} ${currency}
                </td>
                <td class="px-6 py-4">
                  <p class="text-slate-800">${p.payment_date}</p>
                  <p class="text-[11px] text-slate-400">${p.payment_method}</p>
                </td>
                <td class="px-6 py-4">
                  ${
                    p.status === 'paid' ?
                      '<span class="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">🟢 Réglé</span>' :
                    p.status === 'partial' ?
                      `<span class="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">🟠 Partiel (reste ${p.remaining_due} ${currency})</span>` :
                      '<span class="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">🔴 Impayé</span>'
                  }
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button onclick="PaymentsView.openReceiptModal(${p.id})" title="Voir Reçu" class="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                      <i data-lucide="receipt" class="w-4 h-4"></i>
                    </button>
                    <a href="/api/payments/${p.id}/pdf" target="_blank" title="Télécharger Reçu PDF Officiel" class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <i data-lucide="file-text" class="w-4 h-4"></i>
                    </a>
                    <button onclick="PaymentsView.deletePayment(${p.id})" title="Supprimer" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
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

    if (window.lucide) lucide.createIcons();
  },

  async renderMatrix(container) {
    try {
      container.innerHTML = '<div class="p-12 text-center text-slate-400 text-sm animate-pulse">Génération de la grille annuelle...</div>';
      const matrix = await API.get('/api/payments/summary/matrix');

      container.innerHTML = `
        <div class="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span class="font-bold">Grille de suivi des cotisations mensuelles</span>
          <div class="flex items-center gap-3">
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Payé</span>
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Partiel</span>
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-slate-200"></span> En attente</span>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th class="px-4 py-3 sticky left-0 bg-slate-50 z-10">Élève</th>
                <th class="px-3 py-3">Groupe</th>
                ${matrix.months.map(m => `<th class="px-2.5 py-3 text-center">${m.split(' ')[0].slice(0, 4)}.</th>`).join('')}
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${matrix.rows.map(r => `
                <tr class="hover:bg-slate-50">
                  <td class="px-4 py-3 font-bold text-slate-900 sticky left-0 bg-white hover:bg-slate-50 z-10 whitespace-nowrap">
                    <a href="#students/${r.student_id}" class="hover:text-brand-600">${r.student_name}</a>
                  </td>
                  <td class="px-3 py-3 text-slate-500 whitespace-nowrap">${r.group_name}</td>
                  ${matrix.months.map(m => {
                    const cell = r.months[m];
                    if (cell && cell.status === 'paid') {
                      return `<td class="px-2.5 py-3 text-center"><span class="inline-block w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] leading-5" title="${m}: Payé (${cell.amount} DT)">✓</span></td>`;
                    } else if (cell && cell.status === 'partial') {
                      return `<td class="px-2.5 py-3 text-center"><span class="inline-block w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold text-[10px] leading-5" title="${m}: Partiel (${cell.amount} DT)">½</span></td>`;
                    } else {
                      return `<td class="px-2.5 py-3 text-center"><span class="inline-block w-5 h-5 rounded-full bg-slate-100 text-slate-400 text-[10px] leading-5" title="${m}: Non payé">-</span></td>`;
                    }
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (e) {
      container.innerHTML = '<div class="p-8 text-center text-rose-500">Erreur lors du chargement de la matrice.</div>';
    }
  },

  async openModal(preSelectedStudentId = null) {
    const students = await API.get('/api/students');
    const currency = State.currency || 'DT';

    Modal.open({
      title: '+ Enregistrer un Nouveau Paiement',
      size: 'max-w-lg',
      html: `
        <form id="payment-form" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Élève concerné *</label>
            <select id="pay-student-id" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 bg-white font-semibold">
              <option value="">-- Sélectionner l'élève --</option>
              ${students.map(s => `
                <option value="${s.id}" data-price="${s.monthly_price}" ${preSelectedStudentId && s.id === preSelectedStudentId ? 'selected' : ''}>
                  ${s.first_name} ${s.last_name} (${s.student_code} • ${s.group_name || 'Sans groupe'})
                </option>
              `).join('')}
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Mois Réglé *</label>
              <select id="pay-month" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 bg-white font-semibold">
                <option value="Novembre 2025" selected>Novembre 2025</option>
                <option value="Octobre 2025">Octobre 2025</option>
                <option value="Septembre 2025">Septembre 2025</option>
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
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Montant Perçu (${currency}) *</label>
              <input id="pay-amount" type="number" step="5" required value="80.0" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-bold">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Mode de règlement</label>
              <select id="pay-method" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 bg-white">
                <option value="Espèces" selected>Espèces (Cash)</option>
                <option value="Virement">Virement bancaire</option>
                <option value="Chèque">Chèque</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Date d'encaissement</label>
              <input id="pay-date" type="date" value="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Notes / Remarque</label>
            <input id="pay-notes" type="text" placeholder="ex: Reçu en mains propres..." class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500">
          </div>

          <div class="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" onclick="Modal.close()" class="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">
              Annuler
            </button>
            <button type="submit" class="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20">
              Valider le Paiement
            </button>
          </div>
        </form>
      `,
      onOpen: (content) => {
        const studentSelect = content.querySelector('#pay-student-id');
        const amountInput = content.querySelector('#pay-amount');

        // Auto update amount when selecting a student
        studentSelect.addEventListener('change', (e) => {
          const opt = e.target.selectedOptions[0];
          if (opt && opt.getAttribute('data-price')) {
            amountInput.value = opt.getAttribute('data-price');
          }
        });

        if (preSelectedStudentId) {
          const opt = studentSelect.querySelector(`option[value="${preSelectedStudentId}"]`);
          if (opt && opt.getAttribute('data-price')) {
            amountInput.value = opt.getAttribute('data-price');
          }
        }

        const form = content.querySelector('#payment-form');
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const payload = {
            student_id: parseInt(content.querySelector('#pay-student-id').value),
            month: content.querySelector('#pay-month').value,
            amount: parseFloat(content.querySelector('#pay-amount').value),
            payment_method: content.querySelector('#pay-method').value,
            payment_date: content.querySelector('#pay-date').value,
            notes: content.querySelector('#pay-notes').value.trim() || null
          };

          try {
            const newPayment = await API.post('/api/payments', payload);
            if (window.confetti) confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
            Toast.success('Paiement enregistré avec succès !');
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

            // Show receipt option
            setTimeout(() => {
              PaymentsView.openReceiptModal(newPayment.id);
            }, 300);
          } catch (err) {
            Toast.error(err.message);
          }
        });
      }
    });
  },

  async openReceiptModal(paymentId) {
    try {
      const receipt = await API.get(`/api/payments/${paymentId}/receipt`);

      Modal.open({
        title: `Reçu de Paiement : ${receipt.receipt_number}`,
        size: 'max-w-md',
        html: `
          <div id="printable-receipt" class="space-y-6 p-4 border border-slate-200 rounded-2xl bg-white shadow-sm font-sans">
            
            <!-- Receipt Header -->
            <div class="text-center pb-4 border-b border-slate-200">
              <div class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-600 text-white font-black text-xl mb-1">
                ∑
              </div>
              <h3 class="text-lg font-black text-slate-900">${receipt.teacher_name}</h3>
              <p class="text-xs text-slate-500">Cours Particuliers de Mathématiques</p>
              <p class="text-[11px] text-slate-400">📞 ${receipt.teacher_phone} • Année ${receipt.school_year}</p>
            </div>

            <!-- Receipt Info -->
            <div class="flex justify-between items-center text-xs bg-slate-50 p-3 rounded-xl">
              <div>
                <span class="text-slate-400">Reçu N° :</span>
                <strong class="font-mono text-slate-900">${receipt.receipt_number}</strong>
              </div>
              <div>
                <span class="text-slate-400">Date :</span>
                <strong class="text-slate-900">${receipt.date}</strong>
              </div>
            </div>

            <!-- Student & Details -->
            <div class="space-y-2 text-xs">
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-500">Élève :</span>
                <strong class="text-slate-900">${receipt.student_name} (${receipt.student_code})</strong>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-500">Niveau & Groupe :</span>
                <strong class="text-slate-900">${receipt.level} — ${receipt.group_name}</strong>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-500">Mois payé :</span>
                <strong class="text-slate-900">${receipt.month}</strong>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100">
                <span class="text-slate-500">Mode de règlement :</span>
                <strong class="text-slate-900">${receipt.payment_method}</strong>
              </div>
            </div>

            <!-- Big Total Box -->
            <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900">
              <span class="font-bold text-sm">Montant Total Réglé</span>
              <span class="font-black text-2xl">${receipt.amount_paid} ${receipt.currency}</span>
            </div>

            <p class="text-[10px] text-slate-400 text-center italic">
              Merci pour votre confiance. Reçu généré électroniquement.
            </p>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100 no-print">
            <button onclick="Modal.close()" class="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">
              Fermer
            </button>
            <div class="flex items-center gap-2">
              <a href="/api/payments/${paymentId}/pdf" target="_blank" class="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all">
                <i data-lucide="file-text" class="w-4 h-4"></i> Reçu PDF Officiel
              </a>
              <button onclick="window.print()" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm">
                <i data-lucide="printer" class="w-4 h-4"></i> Imprimer
              </button>
            </div>
          </div>
        `
      });
      if (window.lucide) lucide.createIcons();
    } catch (e) {
      Toast.error('Erreur lors de la génération du reçu.');
    }
  },

  deletePayment(paymentId) {
    Modal.confirm({
      title: "Supprimer le paiement",
      message: "Êtes-vous sûr de vouloir supprimer cet enregistrement de paiement ?",
      confirmText: "Supprimer",
      onConfirm: async () => {
        try {
          await API.delete(`/api/payments/${paymentId}`);
          Toast.success("Paiement supprimé.");
          await State.loadInitialData();
          await PaymentsView.loadData(document.getElementById('main-view'));
        } catch (e) {
          Toast.error(e.message);
        }
      }
    });
  }
};
