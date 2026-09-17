// Smart Repartition & Auto-Balancing View — 2026 Commercial Edition (Étude Math Pro)
const RepartitionView = {
  currentData: null,

  async render(container) {
    const isAr = I18n.currentLang === 'ar';

    container.innerHTML = `
      <div class="space-y-6 animate-fade-in">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <i data-lucide="sparkles" class="w-5 h-5"></i>
              </div>
              <span>${I18n.t('repartition_title')}</span>
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">${I18n.t('repartition_subtitle')}</p>
          </div>
        </div>

        <!-- Configuration Bar -->
        <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 class="text-xs font-bold text-slate-700 uppercase tracking-wider">${isAr ? 'إعدادات التوزيع الذكي' : 'Paramètres de Répartition'}</h2>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${I18n.t('academic_level')}</label>
              <select id="rep-level" class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 bg-slate-50/50 font-bold text-slate-800">
                <optgroup label="${I18n.getGradeLabel('Bac')}">
                  <option value="Bac" selected>${I18n.getGradeLabel('Bac')} (${isAr ? 'جميع الشعب' : 'Toutes sections'})</option>
                  <option value="Bac — Mathématiques">${I18n.getLevelLabel('Bac — Mathématiques')}</option>
                  <option value="Bac — Sciences">${I18n.getLevelLabel('Bac — Sciences')}</option>
                  <option value="Bac — Informatique">${I18n.getLevelLabel('Bac — Informatique')}</option>
                  <option value="Bac — Économie">${I18n.getLevelLabel('Bac — Économie')}</option>
                  <option value="Bac — Technique">${I18n.getLevelLabel('Bac — Technique')}</option>
                </optgroup>
                <optgroup label="${I18n.getGradeLabel('3ème')}">
                  <option value="3ème">${I18n.getGradeLabel('3ème')} (${isAr ? 'جميع الشعب' : 'Toutes sections'})</option>
                  <option value="3ème — Mathématiques">${I18n.getLevelLabel('3ème — Mathématiques')}</option>
                  <option value="3ème — Sciences">${I18n.getLevelLabel('3ème — Sciences')}</option>
                  <option value="3ème — Informatique">${I18n.getLevelLabel('3ème — Informatique')}</option>
                  <option value="3ème — Économie">${I18n.getLevelLabel('3ème — Économie')}</option>
                  <option value="3ème — Technique">${I18n.getLevelLabel('3ème — Technique')}</option>
                </optgroup>
                <optgroup label="${I18n.getGradeLabel('2ème')}">
                  <option value="2ème">${I18n.getGradeLabel('2ème')} (${isAr ? 'جميع الشعب' : 'Toutes sections'})</option>
                  <option value="2ème — Sciences">${I18n.getLevelLabel('2ème — Sciences')}</option>
                  <option value="2ème — Informatique">${I18n.getLevelLabel('2ème — Informatique')}</option>
                  <option value="2ème — Économie">${I18n.getLevelLabel('2ème — Économie')}</option>
                </optgroup>
                <optgroup label="${I18n.getGradeLabel('1ère')}">
                  <option value="1ère">${I18n.getLevelLabel('1ère')}</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">${I18n.t('max_capacity')}</label>
              <input id="rep-capacity" type="number" min="5" max="35" value="15" class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 bg-slate-50/50 font-bold text-slate-800">
            </div>

            <div class="flex items-end">
              <button id="rep-generate-btn" class="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2">
                <i data-lucide="sparkles" class="w-4 h-4"></i>
                <span>${I18n.t('run_repartition')}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Proposal Results Container -->
        <div id="rep-results-container" class="space-y-6">
          <div class="p-12 text-center text-slate-400 text-sm bg-white rounded-3xl border border-slate-100">
            ${isAr ? 'اضغط على زر التوزيع لحساب التشكيلة المثالية' : 'Cliquez sur "Lancer la Répartition" pour calculer la composition optimale.'}
          </div>
        </div>

      </div>
    `;

    if (window.lucide) lucide.createIcons();

    const generateBtn = container.querySelector('#rep-generate-btn');
    generateBtn.addEventListener('click', () => this.generateProposal(container));

    // Auto-generate for default level
    this.generateProposal(container);
  },

  async generateProposal(container) {
    const level = container.querySelector('#rep-level').value;
    const capacity = parseInt(container.querySelector('#rep-capacity').value) || 15;
    const resultsContainer = container.querySelector('#rep-results-container');
    const levelLabel = I18n.getLevelLabel(level);
    const isAr = I18n.currentLang === 'ar';

    try {
      resultsContainer.innerHTML = `<div class="p-12 text-center text-slate-400 text-sm animate-pulse">${isAr ? 'جاري حساب التوزيع الأمثل...' : 'Calcul de la répartition optimale...'}</div>`;
      const data = await API.get(`/api/repartition/preview?level=${encodeURIComponent(level)}&target_capacity=${capacity}`);
      this.currentData = data;

      if (!data.total_students || data.total_students === 0) {
        resultsContainer.innerHTML = `
          <div class="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <p class="text-sm font-bold text-slate-700">${isAr ? `لا يوجد تلاميذ مسجلين للمستوى "${levelLabel}".` : `Aucun élève trouvé pour le niveau "${levelLabel}".`}</p>
            <p class="text-xs text-slate-400 mt-1">${isAr ? 'يرجى تسجيل تلاميذ أولاً قبل تشغيل التوزيع' : 'Inscrivez d\'abord des élèves pour ce niveau pour lancer le calcul.'}</p>
          </div>
        `;
        return;
      }

      resultsContainer.innerHTML = `
        <!-- Summary Stats Banner -->
        <div class="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-600 text-white font-black flex items-center justify-center text-sm shadow">
              ∑
            </div>
            <div>
              <h3 class="text-sm font-bold text-amber-950">${isAr ? 'المقترح لـ' : 'Proposition pour'} ${data.total_students} ${I18n.t('students')} (${levelLabel})</h3>
              <p class="text-xs text-amber-800">
                ${isAr ? 'موزعون على' : 'Répartis en'} <strong>${data.groups_needed} ${isAr ? 'أفواج متوازنة' : 'groupes équilibrés'}</strong> (${isAr ? 'طاقة الاستيعاب القصوى' : 'Capacité cible'} : ${data.target_capacity})
              </p>
            </div>
          </div>

          <button id="apply-repartition-btn" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2">
            <i data-lucide="check-check" class="w-4 h-4"></i>
            <span>${I18n.t('apply_repartition')}</span>
          </button>
        </div>

        <!-- Proposed Groups Columns -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="proposed-groups-grid">
          ${data.proposals.map((prop) => {
            const propLevelLabel = I18n.getLevelLabel(prop.level);
            return `
              <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h4 class="text-base font-bold text-slate-900">${prop.group_name}</h4>
                      <p class="text-[11px] text-slate-400">${propLevelLabel} • ${isAr ? 'الهدف' : 'Cible'} : ${prop.capacity}</p>
                    </div>
                    <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      ${prop.students.length} ${I18n.t('students')}
                    </span>
                  </div>

                  <!-- Students Roster in proposed group -->
                  <div class="space-y-2 mt-4 max-h-80 overflow-y-auto pr-1 rtl:pr-0 rtl:pl-1">
                    ${prop.students.map(st => `
                      <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                        <div class="flex items-center gap-2">
                          <span class="font-bold text-slate-800">${st.name}</span>
                          <span class="text-[10px] font-mono text-slate-400">${st.student_code}</span>
                        </div>
                        <span class="text-[10px] text-slate-400">${isAr ? 'حالياً' : 'Actuel'} : ${st.current_group_name || I18n.t('no_group')}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <div class="pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-semibold flex items-center justify-between">
                  <span>${prop.group_id ? (isAr ? '🔄 تحديث فوج موجود' : '🔄 Mise à jour groupe existant') : (isAr ? '✨ إنشاء فوج جديد' : '✨ Nouveau groupe auto')}</span>
                  <span class="font-bold text-slate-700">${prop.students.length} / ${prop.capacity}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      if (window.lucide) lucide.createIcons();

      // Hook up apply button
      const applyBtn = resultsContainer.querySelector('#apply-repartition-btn');
      if (applyBtn) {
        applyBtn.addEventListener('click', () => this.applyRepartition());
      }
    } catch (e) {
      resultsContainer.innerHTML = `<div class="p-8 text-center text-rose-500">${isAr ? 'خطأ أثناء حساب التوزيع.' : 'Erreur lors du calcul de la répartition.'}</div>`;
    }
  },

  async applyRepartition() {
    if (!this.currentData || !this.currentData.proposals) return;
    const isAr = I18n.currentLang === 'ar';

    Modal.confirm({
      title: isAr ? 'تطبيق التوزيع الآلي ؟' : 'Appliquer la répartition ?',
      message: isAr ? `سيتم تحديث تعيين ${this.currentData.total_students} تلميذ في الأفواج المقترحة. هل ترغب في المتابعة ؟` : `Cette action mettra à jour l'affectation de ${this.currentData.total_students} élèves dans les groupes calculés. Voulez-vous continuer ?`,
      confirmText: isAr ? 'نعم، تطبيق التوزيع' : 'Oui, Appliquer',
      onConfirm: async () => {
        try {
          const assignments = [];
          this.currentData.proposals.forEach(prop => {
            prop.students.forEach(st => {
              assignments.push({
                student_id: st.id,
                target_group_id: prop.group_id,
                target_group_name: prop.group_name,
                level: prop.level
              });
            });
          });

          const res = await API.post('/api/repartition/apply', { assignments });
          if (window.confetti) confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
          Toast.success(res.message || I18n.t('repartition_success'));
          await State.loadInitialData();
          app.navigate('#groups');
        } catch (e) {
          Toast.error(e.message);
        }
      }
    });
  }
};
