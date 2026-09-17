// Students Management View — 2026 Commercial Edition (Étude Math Pro)
const StudentsView = {
  students: [],
  filters: {
    search: '',
    level: 'all',
    group_id: 0,
    payment_status: 'all'
  },

  async render(container) {
    const isAr = I18n.currentLang === 'ar';

    container.innerHTML = `
      <div class="space-y-6 animate-fade-in">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                <i data-lucide="graduation-cap" class="w-5 h-5 text-indigo-600"></i>
              </div>
              <span>${I18n.t('students_title')}</span>
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-0.5">${I18n.t('students_subtitle')}</p>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="StudentsView.openModal()" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-bold rounded-xl shadow-sm shadow-indigo-600/25 transition-all flex items-center gap-2">
              <i data-lucide="user-plus" class="w-4 h-4"></i>
              <span>+ ${I18n.t('add_student')}</span>
            </button>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            <!-- Search Bar -->
            <div class="relative">
              <span class="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                <i data-lucide="search" class="w-4 h-4"></i>
              </span>
              <input id="st-filter-search" type="text" placeholder="${I18n.t('searchPlaceholder')}" class="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-slate-50 placeholder:text-slate-400 font-medium transition-all">
            </div>

            <!-- Tunisian Academic Level & Section Filter -->
            <div>
              <select id="st-filter-level" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white font-medium text-slate-700 transition-all">
                <option value="all">${I18n.t('all_levels')}</option>
                <optgroup label="${I18n.getGradeLabel('1ère')}">
                  <option value="1ère">${I18n.getLevelLabel('1ère')}</option>
                </optgroup>
                <optgroup label="${I18n.getGradeLabel('2ème')}">
                  <option value="2ème — Sciences">${I18n.getLevelLabel('2ème — Sciences')}</option>
                  <option value="2ème — Informatique">${I18n.getLevelLabel('2ème — Informatique')}</option>
                  <option value="2ème — Économie">${I18n.getLevelLabel('2ème — Économie')}</option>
                </optgroup>
                <optgroup label="${I18n.getGradeLabel('3ème')}">
                  <option value="3ème — Mathématiques">${I18n.getLevelLabel('3ème — Mathématiques')}</option>
                  <option value="3ème — Sciences">${I18n.getLevelLabel('3ème — Sciences')}</option>
                  <option value="3ème — Informatique">${I18n.getLevelLabel('3ème — Informatique')}</option>
                  <option value="3ème — Économie">${I18n.getLevelLabel('3ème — Économie')}</option>
                  <option value="3ème — Technique">${I18n.getLevelLabel('3ème — Technique')}</option>
                </optgroup>
                <optgroup label="${I18n.getGradeLabel('Bac')}">
                  <option value="Bac — Mathématiques">${I18n.getLevelLabel('Bac — Mathématiques')}</option>
                  <option value="Bac — Sciences">${I18n.getLevelLabel('Bac — Sciences')}</option>
                  <option value="Bac — Informatique">${I18n.getLevelLabel('Bac — Informatique')}</option>
                  <option value="Bac — Économie">${I18n.getLevelLabel('Bac — Économie')}</option>
                  <option value="Bac — Technique">${I18n.getLevelLabel('Bac — Technique')}</option>
                </optgroup>
              </select>
            </div>

            <!-- Group Filter -->
            <div>
              <select id="st-filter-group" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white font-medium text-slate-700 transition-all">
                <option value="0">${isAr ? 'جميع الأفواج' : 'Tous les groupes'}</option>
                <!-- Injected dynamically -->
              </select>
            </div>

            <!-- Payment Status Filter -->
            <div>
              <select id="st-filter-payment" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white font-medium text-slate-700 transition-all">
                <option value="all">${I18n.t('all_statuses')}</option>
                <option value="paid">🟢 ${I18n.t('paid')}</option>
                <option value="partial">🟠 ${I18n.t('partial')}</option>
                <option value="unpaid">🔴 ${I18n.t('unpaid')}</option>
              </select>
            </div>

          </div>
        </div>

        <!-- Students Table (Desktop) & Cards (Mobile) -->
        <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden" id="students-table-container">
          <div class="p-8 text-center text-slate-400 text-sm">${I18n.t('loading')}</div>
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

    // Populate groups filter
    if (groupSelect && State.groups) {
      const isAr = I18n.currentLang === 'ar';
      groupSelect.innerHTML = `<option value="0">${isAr ? 'جميع الأفواج' : 'Tous les groupes'}</option>` +
        State.groups.map(g => {
          const lvl = I18n.getLevelLabel(g.level);
          return `<option value="${g.id}">${g.name} (${lvl})</option>`;
        }).join('');
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filters.search = e.target.value.trim();
        this.loadStudents(container);
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
    const isAr = I18n.currentLang === 'ar';

    try {
      let query = `?search=${encodeURIComponent(this.filters.search)}&level=${encodeURIComponent(this.filters.level)}&group_id=${this.filters.group_id}&payment_status=${this.filters.payment_status}`;
      const students = await API.get(`/api/students${query}`);
      this.students = students;

      if (students.length === 0) {
        tableContainer.innerHTML = `
          <div class="flex flex-col items-center justify-center py-16 text-center">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4">
              <i data-lucide="graduation-cap" class="w-7 h-7 text-slate-400"></i>
            </div>
            <h3 class="text-base font-bold text-slate-700 mb-1">${isAr ? 'لم يتم العثور على أي تلميذ' : 'Aucun élève trouvé'}</h3>
            <p class="text-sm text-slate-400 max-w-sm mb-4">${isAr ? 'يرجى تجربة كلمات بحث أخرى أو تغيير خيارات التصفية' : 'Essayez d\'ajuster vos filtres de recherche ou d\'ajouter un nouvel élève.'}</p>
            <button onclick="StudentsView.openModal()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm shadow-indigo-600/25 transition-all">
              + ${I18n.t('add_student')}
            </button>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      // Responsive layout: Desktop Table + Mobile Card Grid
      const currency = 'DT';

      tableContainer.innerHTML = `
        <!-- Desktop Table View -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left rtl:text-right text-xs sm:text-sm">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-100">
                <th class="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">${isAr ? 'التلميذ' : 'Élève'}</th>
                <th class="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">${I18n.t('academic_level')}</th>
                <th class="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">${I18n.t('assigned_group')}</th>
                <th class="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">${isAr ? 'الهاتف' : 'Contact'}</th>
                <th class="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">${I18n.t('attendance_rate')}</th>
                <th class="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">${I18n.t('payment_status')}</th>
                <th class="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right rtl:text-left">${isAr ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${students.map(s => {
                const levelLabel = I18n.getLevelLabel(s.level);
                return `
                  <tr class="hover:bg-slate-50/80 transition-colors group">
                    <td class="px-6 py-3">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
                          ${s.first_name.charAt(0)}${s.last_name.charAt(0)}
                        </div>
                        <div>
                          <a href="#students/${s.id}" class="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            ${s.first_name} ${s.last_name}
                          </a>
                          <p class="text-[11px] text-slate-400 font-mono">${s.student_code}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                        ${levelLabel}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm text-slate-600">
                      ${s.group_name ? `<span class="font-semibold text-slate-800">${s.group_name}</span>` : `<span class="text-slate-400 italic text-xs">${I18n.t('no_group')}</span>`}
                    </td>
                    <td class="px-4 py-3">
                      ${s.student_phone ? `
                        <a href="tel:${s.student_phone}" class="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-indigo-600 font-medium transition-colors">
                          <i data-lucide="phone" class="w-3.5 h-3.5 text-slate-400"></i>
                          <span>${s.student_phone}</span>
                        </a>
                      ` : `
                        <span class="text-slate-300 text-xs">—</span>
                      `}
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <div class="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div class="bg-emerald-500 h-1.5 rounded-full" style="width: ${s.attendance_rate}%"></div>
                        </div>
                        <span class="text-xs font-bold text-slate-700">${s.attendance_rate}%</span>
                      </div>
                      <span class="text-[10px] text-slate-400">(${s.attendance_count} ${isAr ? 'حصص' : 'séances'})</span>
                    </td>
                    <td class="px-4 py-3">
                      ${
                        s.current_month_payment_status === 'paid' ?
                          `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">🟢 ${I18n.t('paid')}</span>` :
                        s.current_month_payment_status === 'partial' ?
                          `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">🟠 ${I18n.t('partial')}</span>` :
                          `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">🔴 ${I18n.t('unpaid')}</span>`
                      }
                    </td>
                    <td class="px-4 py-3 text-right rtl:text-left">
                      <div class="flex items-center justify-end rtl:justify-start gap-1">
                        <button onclick="StudentsView.openPaymentModal(${s.id})" title="${I18n.t('add_payment')}" class="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                          <i data-lucide="credit-card" class="w-4 h-4"></i>
                        </button>
                        <a href="#students/${s.id}" title="${isAr ? 'عرض الملف' : 'Voir Profil'}" class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <i data-lucide="chevron-right" class="w-4 h-4 rtl:rotate-180"></i>
                        </a>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Mobile Card Grid View -->
        <div class="md:hidden divide-y divide-slate-100">
          ${students.map(s => {
            const levelLabel = I18n.getLevelLabel(s.level);
            return `
              <div class="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      ${s.first_name.charAt(0)}${s.last_name.charAt(0)}
                    </div>
                    <div>
                      <a href="#students/${s.id}" class="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors">
                        ${s.first_name} ${s.last_name}
                      </a>
                      <p class="text-[11px] text-slate-400 font-mono">${s.student_code}</p>
                    </div>
                  </div>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                    ${levelLabel}
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">${I18n.t('assigned_group')}</span>
                    <p class="font-bold text-slate-800 truncate mt-0.5">${s.group_name || I18n.t('no_group')}</p>
                  </div>
                  <div>
                    <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">${I18n.t('payment_status')}</span>
                    <div class="mt-0.5">
                      ${s.current_month_payment_status === 'paid'
                        ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">🟢 ${I18n.t('paid')}</span>`
                        : s.current_month_payment_status === 'partial'
                        ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">🟠 ${I18n.t('partial')}</span>`
                        : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">🔴 ${I18n.t('unpaid')}</span>`}
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-end gap-2 pt-1">
                  <button onclick="StudentsView.openPaymentModal(${s.id})" class="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1 border border-emerald-200/70 transition-colors">
                    <i data-lucide="credit-card" class="w-3.5 h-3.5"></i> ${I18n.t('add_payment')}
                  </button>
                  <a href="#students/${s.id}" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors">
                    <i data-lucide="eye" class="w-3.5 h-3.5"></i> ${isAr ? 'عرض الملف' : 'Profil'}
                  </a>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      if (window.lucide) lucide.createIcons();
    } catch (err) {
      tableContainer.innerHTML = `<div class="p-8 text-center text-rose-500 text-sm font-medium">${isAr ? 'خطأ أثناء تحميل التلاميذ.' : 'Erreur lors du chargement des élèves.'}</div>`;
    }
  },

  async openModal(studentId = null) {
    let student = null;
    if (studentId) {
      student = await API.get(`/api/students/${studentId}`);
    }

    const groups = State.groups || [];
    const isAr = I18n.currentLang === 'ar';
    const currency = 'DT';

    Modal.open({
      title: student ? `${isAr ? 'تعديل التلميذ' : 'Modifier l\'Élève'} : ${student.first_name} ${student.last_name}` : `+ ${I18n.t('add_student')}`,
      size: 'max-w-lg',
      html: `
        <form id="student-form" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${I18n.t('student_firstName')} *</label>
              <input id="st-firstname" type="text" required value="${student ? student.first_name : ''}" placeholder="Ahmed" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${I18n.t('student_lastName')} *</label>
              <input id="st-lastname" type="text" required value="${student ? student.last_name : ''}" placeholder="Ben Ali" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
            </div>
          </div>

          <!-- Dependent 2-Step Academic Level & Section Selector -->
          ${I18n.renderLevelSelectorsHTML({
            gradeId: 'st-grade',
            sectionId: 'st-section',
            sectionWrapperId: 'st-section-wrapper',
            initialLevel: student ? student.level : 'Bac — Mathématiques'
          })}

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${I18n.t('assigned_group')}</label>
            <select id="st-group" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white font-medium">
              <option value="">${I18n.t('no_group')}</option>
              ${groups.map(g => {
                const lvl = I18n.getLevelLabel(g.level);
                return `
                  <option value="${g.id}" ${student && student.group_id === g.id ? 'selected' : ''}>
                    ${g.name} (${lvl} • ${g.student_count || 0}/${g.capacity} ${g.is_full ? '⚠️ COMPLET' : ''})
                  </option>
                `;
              }).join('')}
            </select>
          </div>

          <div class="grid grid-cols-3 gap-2 sm:gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${I18n.t('student_phone')}</label>
              <input id="st-phone" type="tel" value="${student && student.student_phone ? student.student_phone : ''}" placeholder="+216 ..." class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${isAr ? 'هاتف الأب' : 'Tél. Père'}</label>
              <input id="st-father" type="tel" value="${student && student.father_phone ? student.father_phone : ''}" placeholder="+216 ..." class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${isAr ? 'هاتف الأم' : 'Tél. Mère'}</label>
              <input id="st-mother" type="tel" value="${student && student.mother_phone ? student.mother_phone : ''}" placeholder="+216 ..." class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${I18n.t('monthly_price')} (${currency}) *</label>
            <input id="st-price" type="number" step="5" required value="${student ? student.monthly_price : 80.0}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none font-bold">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${I18n.t('notes')}</label>
            <textarea id="st-notes" rows="2" placeholder="${isAr ? 'ملاحظات بيداغوجية حول التلميذ...' : 'Observations pédagogiques...'}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">${student && student.notes ? student.notes : ''}</textarea>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-slate-100">
            ${student ? `
              <button type="button" id="st-delete-btn" class="px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                ${I18n.t('delete')}
              </button>
            ` : '<div></div>'}
            
            <div class="flex items-center gap-2">
              <button type="button" onclick="Modal.close()" class="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                ${I18n.t('cancel')}
              </button>
              <button type="submit" class="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors">
                ${student ? I18n.t('save') : I18n.t('save')}
              </button>
            </div>
          </div>
        </form>
      `,
      onOpen: (content) => {
        // Initialize dependent level dropdowns
        const levelBinding = I18n.bindLevelSelectors({
          container: content,
          gradeId: 'st-grade',
          sectionId: 'st-section',
          sectionWrapperId: 'st-section-wrapper',
          initialLevel: student ? student.level : 'Bac — Mathématiques'
        });

        const form = content.querySelector('#student-form');
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const selectedFullLevel = levelBinding ? levelBinding.getSelectedLevel() : 'Bac — Mathématiques';

          const payload = {
            first_name: content.querySelector('#st-firstname').value.trim(),
            last_name: content.querySelector('#st-lastname').value.trim(),
            level: selectedFullLevel,
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
              Toast.success(isAr ? 'تم تعديل بيانات التلميذ بنجاح !' : 'Élève modifié avec succès !');
            } else {
              await API.post('/api/students', payload);
              Toast.success(isAr ? 'تم تسجيل التلميذ الجديد بنجاح !' : 'Nouvel élève inscrit avec succès !');
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
              title: I18n.t('delete'),
              message: isAr ? `هل أنت متأكد من رغبتك في حذف ${student.first_name} ${student.last_name} نهائياً ؟` : `Êtes-vous sûr de vouloir supprimer définitivement ${student.first_name} ${student.last_name} ?`,
              confirmText: I18n.t('delete'),
              onConfirm: async () => {
                try {
                  await API.delete(`/api/students/${student.id}`);
                  Toast.success(isAr ? 'تم حذف التلميذ بنجاح.' : 'Élève supprimé.');
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
