// Smart Repartition & Auto-Balancing View
const RepartitionView = {
  currentData: null,

  async render(container) {
    container.innerHTML = `
      <div class="space-y-6 animate-fade-in">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <i data-lucide="sparkles" class="w-5 h-5"></i>
              </div>
              Répartition Automatique des Élèves
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">Équilibrez automatiquement vos promotions en classes selon vos capacités cibles.</p>
          </div>
        </div>

        <!-- Configuration Bar -->
        <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Paramètres de Répartition</h2>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Niveau scolaire à répartir</label>
              <select id="rep-level" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 bg-slate-50/50 font-medium">
                <option value="Baccalauréat">Baccalauréat</option>
                <option value="2ème Sciences">2ème Sciences</option>
                <option value="9ème Année">9ème Année</option>
                <option value="3ème">3ème Année</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">Capacité maximale par groupe</label>
              <input id="rep-capacity" type="number" min="5" max="35" value="15" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 bg-slate-50/50 font-medium">
            </div>

            <div class="flex items-end">
              <button id="rep-generate-btn" class="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-sm font-bold rounded-xl shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2">
                <i data-lucide="wand-2" class="w-4 h-4"></i>
                Calculer la Répartition Optimale
              </button>
            </div>
          </div>
        </div>

        <!-- Proposal Results Container -->
        <div id="rep-results-container" class="space-y-6">
          <div class="p-12 text-center text-slate-400 text-sm bg-white rounded-3xl border border-slate-100">
            Cliquez sur <strong>Calculer la Répartition Optimale</strong> pour générer la proposition.
          </div>
        </div>

      </div>
    `;

    if (window.lucide) lucide.createIcons();

    const generateBtn = container.querySelector('#rep-generate-btn');
    generateBtn.addEventListener('click', () => this.generateProposal(container));

    // Auto-generate for default Bac level
    this.generateProposal(container);
  },

  async generateProposal(container) {
    const level = container.querySelector('#rep-level').value;
    const capacity = parseInt(container.querySelector('#rep-capacity').value) || 15;
    const resultsContainer = container.querySelector('#rep-results-container');

    try {
      resultsContainer.innerHTML = '<div class="p-12 text-center text-slate-400 text-sm animate-pulse">Calcul de la répartition en cours...</div>';
      const data = await API.get(`/api/repartition/preview?level=${encodeURIComponent(level)}&target_capacity=${capacity}`);
      this.currentData = data;

      if (data.total_students === 0) {
        resultsContainer.innerHTML = `
          <div class="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <p class="text-sm font-bold text-slate-700">Aucun élève trouvé pour le niveau "${level}".</p>
            <p class="text-xs text-slate-400 mt-1">Inscrivez d'abord des élèves de ce niveau dans la section Élèves.</p>
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
              <h3 class="text-sm font-bold text-amber-950">Proposition pour ${data.total_students} élèves (${level})</h3>
              <p class="text-xs text-amber-800">
                Divisé en <strong>${data.groups_needed} groupe(s)</strong> équilibré(s) (Capacité max : ${data.target_capacity})
              </p>
            </div>
          </div>

          <button id="apply-repartition-btn" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2">
            <i data-lucide="check-check" class="w-4 h-4"></i>
            Appliquer cette Répartition
          </button>
        </div>

        <!-- Proposed Groups Columns -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="proposed-groups-grid">
          ${data.proposals.map((prop, gIdx) => `
            <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 class="text-base font-bold text-slate-900">${prop.group_name}</h4>
                    <p class="text-[11px] text-slate-400">Capacité cible : ${prop.capacity}</p>
                  </div>
                  <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    ${prop.students.length} élèves
                  </span>
                </div>

                <!-- Students Roster in proposed group -->
                <div class="space-y-2 mt-4 max-h-80 overflow-y-auto pr-1">
                  ${prop.students.map(st => `
                    <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-slate-800">${st.name}</span>
                        <span class="text-[10px] font-mono text-slate-400">${st.student_code}</span>
                      </div>
                      <span class="text-[10px] text-slate-400">Actuel: ${st.current_group_name}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="pt-2 text-[11px] text-slate-400 italic text-center">
                ${prop.students.length} élèves affectés
              </div>
            </div>
          `).join('')}
        </div>
      `;

      if (window.lucide) lucide.createIcons();

      const applyBtn = resultsContainer.querySelector('#apply-repartition-btn');
      if (applyBtn) {
        applyBtn.addEventListener('click', () => this.applyRepartition());
      }
    } catch (e) {
      resultsContainer.innerHTML = `<div class="p-8 text-center text-rose-500">Erreur lors de la génération de la proposition.</div>`;
    }
  },

  async applyRepartition() {
    if (!this.currentData) return;

    Modal.confirm({
      title: "Confirmer la Répartition",
      message: `Voulez-vous appliquer cette répartition pour les ${this.currentData.total_students} élèves du niveau ${this.currentData.level} ? Leurs groupes seront automatiquement mis à jour.`,
      confirmText: "Oui, Appliquer maintenant",
      onConfirm: async () => {
        try {
          const assignments = [];
          this.currentData.proposals.forEach(prop => {
            prop.students.forEach(st => {
              assignments.push({
                student_id: st.id,
                group_id: prop.group_id,
                group_name: prop.group_name
              });
            });
          });

          await API.post('/api/repartition/apply', {
            level: this.currentData.level,
            assignments
          });

          // Confetti celebration!
          if (window.confetti) {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 }
            });
          }

          Toast.success("Répartition appliquée avec succès !");
          await State.loadInitialData();
          app.navigate('#groups');
        } catch (e) {
          Toast.error(e.message);
        }
      }
    });
  }
};
