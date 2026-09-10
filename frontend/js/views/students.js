// Students Management View
const StudentsView = {
  students: [],
  filters: {
    search: '',
    level: 'all',
    group_id: 0,
    payment_status: 'all'
  },

  async render(container) {
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <i data-lucide="graduation-cap" class="w-5 h-5"></i>
              </div>
              Gestion des Élèves
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">Gérez vos inscrits, leurs coordonnées familiales, groupes et suivis.</p>
          </div>

          <div class="flex items-center gap-2.5">
            <button onclick="StudentsView.openModal()" class="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm shadow-brand-600/30 transition-all flex items-center gap-2">
              <i data-lucide="user-plus" class="w-4 h-4"></i>
              <span>+ Nouvel Élève</span>
            </button>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            <!-- Search Bar -->
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <i data-lucide="search" class="w-4 h-4"></i>
              </span>
              <input id="st-filter-search" type="text" placeholder="Rechercher nom, tél, code..." class="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50">
            </div>

            <!-- Level Filter -->
            <div>
              <select id="st-filter-level" class="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 text-slate-700 font-medium">
                <option value="all">Tous les Niveaux</option>
                <option value="Baccalauréat">Baccalauréat</option>
                <option value="3ème">3ème Année</option>
                <option value="2ème Sciences">2ème Sciences</option>
                <option value="9ème Année">9ème Année</option>
              </select>
            </div>

            <!-- Group Filter -->
            <div>
              <select id="st-filter-group" class="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 text-slate-700 font-medium">
                <option value="0">Tous les Groupes</option>
                <!-- Injected dynamically -->
              </select>
            </div>

            <!-- Payment Status Filter -->
            <div>
              <select id="st-filter-payment" class="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 text-slate-700 font-medium">
                <option value="all">Tous les Paiements</option>
                <option value="paid">🟢 Payé ce mois</option>
                <option value="partial">🟠 Partiellement payé</option>
                <option value="unpaid">🔴 En attente / Non payé</option>
              </select>
            </div>

          </div>
        </div>

        <!-- Students Table (Desktop) & Cards (Mobile) -->
        <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden" id="students-table-container">
          <div class="p-8 text-center text-slate-400 text-sm">Chargement des élèves...</div>
        </div>

      </div>
    `;

    if (window.lucide) lucide.createIcons();

    this.initFilterEvents(container);
    await this.loadStudents(container);
  },

  initFilterEvents(container) {
    const searchInput = container.querySelector('#st-filter-search');
    const levelSelect = container.querySelector('#st-filter-level');
    const groupSelect = container.querySelector('#st-filter-group');
    const paymentSelect = container.querySelector('#st-filter-payment');

    // Populate groups dropdown
    if (groupSelect && State.groups) {
      groupSelect.innerHTML = '<option value="0">Tous les Groupes</option>' + 
        State.groups.map(g => `<option value="${g.id}">${g.name} (${g.level})</option>`).join('');
    }

    let debounce;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          this.filters.search = e.target.value.trim();
          this.loadStudents(container);
        }, 200);
      });
    }

    if (levelSelect) {
      levelSelect.addEventListener('change', (e) => {
        this.filters.level = e.target.value;
        this.loadStudents(container);
      });
    }

    if (groupSelect) {
      groupSelect.addEventListener('change', (e) => {
        this.filters.group_id = parseInt(e.target.value) || 0;
        this.loadStudents(container);
      });
    }

    if (paymentSelect) {
      paymentSelect.addEventListener('change', (e) => {
        this.filters.payment_status = e.target.value;
        this.loadStudents(container);
      });
    }
  },

  async loadStudents(container) {
    const tableContainer = container.querySelector('#students-table-container');
    if (!tableContainer) return;

    try {
      let query = `?search=${encodeURIComponent(this.filters.search)}&level=${encodeURIComponent(this.filters.level)}&group_id=${this.filters.group_id}&payment_status=${this.filters.payment_status}`;
      const students = await API.get(`/api/students${query}`);
      this.students = students;

      const currency = State.currency || 'DT';

      if (students.length === 0) {
        tableContainer.innerHTML = `
          <div class="p-12 text-center">
            <i data-lucide="user-x" class="w-10 h-10 text-slate-300 mx-auto mb-3"></i>
            <p class="text-base font-bold text-slate-700">Aucun élève trouvé</p>
            <p class="text-xs text-slate-400 mt-1">Modifiez vos critères de recherche ou ajoutez un nouvel élève.</p>
            <button onclick="StudentsView.openModal()" class="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all">
              + Inscrire un élève
            </button>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      tableContainer.innerHTML = `
        <!-- Count badge header -->
        <div class="px-6 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>${students.length} élève(s) affiché(s)</span>
          <span class="text-slate-400 text-[11px]">Cliquez sur un élève pour ouvrir son profil</span>
        </div>

        <!-- Responsive Table for PC -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-slate-50/50 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-100">
              <tr>
                <th class="px-6 py-3.5">ID / Code</th>
                <th class="px-6 py-3.5">Élève & Contact</th>
                <th class="px-6 py-3.5">Niveau</th>
                <th class="px-6 py-3.5">Groupe</th>
                <th class="px-6 py-3.5">Paiement Mois</th>
                <th class="px-6 py-3.5">Présence</th>
                <th class="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${students.map(s => `
                <tr class="hover:bg-slate-50/80 transition-colors group cursor-pointer" onclick="if(!event.target.closest('button') && !event.target.closest('a')) window.location.hash = '#students/${s.id}'">
                  <td class="px-6 py-4 font-mono font-bold text-slate-900 text-xs">
                    <span class="px-2 py-1 bg-slate-100 rounded-lg text-slate-700">${s.student_code}</span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 font-black flex items-center justify-center text-xs shrink-0">
                        ${s.first_name.charAt(0)}${s.last_name.charAt(0)}
                      </div>
                      <div>
                        <p class="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">${s.first_name} ${s.last_name}</p>
                        <p class="text-xs text-slate-400">${s.student_phone || s.father_phone || 'Sans numéro'}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">${s.level}</span>
                  </td>
                  <td class="px-6 py-4">
                    ${s.group_name ? `
                      <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">${s.group_name}</span>
                    ` : `
                      <span class="text-xs text-slate-400 italic">Non assigné</span>
                    `}
                  </td>
                  <td class="px-6 py-4">
                    ${
                      s.current_month_payment_status === 'paid' ?
                        '<span class="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">🟢 Payé</span>' :
                      s.current_month_payment_status === 'partial' ?
                        '<span class="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">🟠 Partiel</span>' :
                        '<span class="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">🔴 En attente</span>'
                    }
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-slate-800 text-xs">${s.attendance_count}</span>
                      <span class="text-[11px] text-slate-400">(${s.attendance_rate}%)</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <a href="#students/${s.id}" title="Voir profil" class="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                        <i data-lucide="eye" class="w-4 h-4"></i>
                      </a>
                      <button onclick="StudentsView.openPaymentModal(${s.id})" title="Enregistrer paiement" class="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                        <i data-lucide="credit-card" class="w-4 h-4"></i>
                      </button>
                      <button onclick="StudentsView.openModal(${s.id})" title="Modifier" class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <i data-lucide="edit" class="w-4 h-4"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Mobile Card View -->
        <div class="md:hidden divide-y divide-slate-100">
          ${students.map(s => `
            <div class="p-4 space-y-3 hover:bg-slate-50/50" onclick="if(!event.target.closest('button')) window.location.hash = '#students/${s.id}'">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 font-bold flex items-center justify-center text-sm">
                    ${s.first_name.charAt(0)}${s.last_name.charAt(0)}
                  </div>
                  <div>
                    <h3 class="font-bold text-slate-900 text-sm">${s.first_name} ${s.last_name}</h3>
                    <p class="text-xs text-slate-400 font-mono">${s.student_code} • ${s.level}</p>
                  </div>
                </div>
                ${
                  s.current_month_payment_status === 'paid' ?
                    '<span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">🟢 Payé</span>' :
                  s.current_month_payment_status === 'partial' ?
                    '<span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">🟠 Partiel</span>' :
                    '<span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">🔴 En attente</span>'
                }
              </div>

              <div class="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                <span>Groupe : <strong class="text-slate-800">${s.group_name || 'Non assigné'}</strong></span>
                <span>Présence : <strong class="text-slate-800">${s.attendance_count} (${s.attendance_rate}%)</strong></span>
              </div>

              <div class="flex items-center justify-end gap-2 pt-2">
                <button onclick="StudentsView.openPaymentModal(${s.id})" class="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1">
                  <i data-lucide="credit-card" class="w-3.5 h-3.5"></i> Encaisser
                </button>
                <a href="#students/${s.id}" class="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1">
                  <i data-lucide="eye" class="w-3.5 h-3.5"></i> Voir Fiche
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      if (window.lucide) lucide.createIcons();
    } catch (err) {
      tableContainer.innerHTML = `<div class="p-8 text-center text-rose-500">Erreur lors du chargement des élèves.</div>`;
    }
  },

  async openModal(studentId = null) {
    let student = null;
    if (studentId) {
      student = await API.get(`/api/students/${studentId}`);
    }

    const groups = State.groups || [];
    const currency = State.currency || 'DT';

    Modal.open({
      title: student ? `Modifier l'élève : ${student.first_name} ${student.last_name}` : '+ Inscrire un nouvel élève',
      size: 'max-w-lg',
      html: `
        <form id="student-form" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Prénom *</label>
              <input id="st-firstname" type="text" required value="${student ? student.first_name : ''}" placeholder="ex: Ahmed" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Nom *</label>
              <input id="st-lastname" type="text" required value="${student ? student.last_name : ''}" placeholder="ex: Ben Ali" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Niveau Scolaire *</label>
              <select id="st-level" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white">
                <option value="Baccalauréat" ${student && student.level === 'Baccalauréat' ? 'selected' : ''}>Baccalauréat</option>
                <option value="3ème" ${student && student.level === '3ème' ? 'selected' : ''}>3ème Année</option>
                <option value="2ème Sciences" ${student && student.level === '2ème Sciences' ? 'selected' : ''}>2ème Sciences</option>
                <option value="9ème Année" ${student && student.level === '9ème Année' ? 'selected' : ''}>9ème Année</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Groupe d'affectation</label>
              <select id="st-group" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white">
                <option value="">Aucun groupe (pour le moment)</option>
                ${groups.map(g => `
                  <option value="${g.id}" ${student && student.group_id === g.id ? 'selected' : ''}>
                    ${g.name} (${g.student_count}/${g.capacity} ${g.is_full ? '⚠️ COMPLET' : ''})
                  </option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 sm:gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Tél. Élève</label>
              <input id="st-phone" type="tel" value="${student && student.student_phone ? student.student_phone : ''}" placeholder="+216 ..." class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Tél. Père</label>
              <input id="st-father" type="tel" value="${student && student.father_phone ? student.father_phone : ''}" placeholder="+216 ..." class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Tél. Mère</label>
              <input id="st-mother" type="tel" value="${student && student.mother_phone ? student.mother_phone : ''}" placeholder="+216 ..." class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Prix Mensuel (${currency}) *</label>
            <input id="st-price" type="number" step="5" required value="${student ? student.monthly_price : 80.0}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Notes / Remarques initiales</label>
            <textarea id="st-notes" rows="2" placeholder="Objectifs, difficultés particulières..." class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">${student && student.notes ? student.notes : ''}</textarea>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-slate-100">
            ${student ? `
              <button type="button" id="st-delete-btn" class="px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                Supprimer
              </button>
            ` : '<div></div>'}
            
            <div class="flex items-center gap-2">
              <button type="button" onclick="Modal.close()" class="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                Annuler
              </button>
              <button type="submit" class="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors">
                ${student ? 'Enregistrer les modifications' : "Créer l'élève"}
              </button>
            </div>
          </div>
        </form>
      `,
      onOpen: (content) => {
        const form = content.querySelector('#student-form');
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const payload = {
            first_name: content.querySelector('#st-firstname').value.trim(),
            last_name: content.querySelector('#st-lastname').value.trim(),
            level: content.querySelector('#st-level').value,
            group_id: content.querySelector('#st-group').value ? parseInt(content.querySelector('#st-group').value) : null,
            student_phone: content.querySelector('#st-phone').value.trim() || null,
            father_phone: content.querySelector('#st-father').value.trim() || null,
            mother_phone: content.querySelector('#st-mother').value.trim() || null,
            monthly_price: parseFloat(content.querySelector('#st-price').value) || 80.0,
            notes: content.querySelector('#st-notes').value.trim() || null
          };

          try {
            if (student) {
              await API.put(`/api/students/${student.id}`, payload);
              Toast.success('Élève modifié avec succès !');
            } else {
              await API.post('/api/students', payload);
              Toast.success('Nouvel élève inscrit avec succès !');
            }
            Modal.close();
            await State.loadInitialData();
            app.navigate(window.location.hash);
          } catch (err) {
            Toast.error(err.message);
          }
        });

        const deleteBtn = content.querySelector('#st-delete-btn');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', () => {
            Modal.confirm({
              title: "Supprimer l'élève",
              message: `Êtes-vous sûr de vouloir supprimer définitivement ${student.first_name} ${student.last_name} ?`,
              confirmText: 'Supprimer définitivement',
              onConfirm: async () => {
                try {
                  await API.delete(`/api/students/${student.id}`);
                  Toast.success('Élève supprimé.');
                  await State.loadInitialData();
                  app.navigate('#students');
                } catch (e) {
                  Toast.error(e.message);
                }
              }
            });
          });
        }
      }
    });
  },

  openPaymentModal(studentId) {
    PaymentsView.openModal(studentId);
  }
};
