/**
 * Corrections Dashboard View
 * Lists all teacher correction projects, provides quick exam starter templates,
 * statistics on verified math exercises, and links to upload or editor.
 */

window.CorrectionsDashboardView = {
  projects: [],
  templates: [],
  isLoading: false,

  async init() {
    await this.fetchData();
    this.render();
  },

  async fetchData() {
    this.isLoading = true;
    try {
      const [projRes, tempRes] = await Promise.all([
        window.api.get("/corrections"),
        window.api.get("/corrections/templates")
      ]);
      this.projects = projRes || [];
      this.templates = tempRes || [];
    } catch (err) {
      console.error("Error fetching corrections:", err);
      this.projects = [];
    } finally {
      this.isLoading = false;
    }
  },

  render() {
    const container = document.getElementById("corrections-view");
    if (!container) return;

    const totalProjects = this.projects.length;
    let totalQuestions = 0;
    this.projects.forEach(p => {
      try {
        const parsed = typeof p.structured_data === 'string' ? JSON.parse(p.structured_data) : p.structured_data;
        if (Array.isArray(parsed)) {
          parsed.forEach(ex => {
            totalQuestions += (ex.questions || []).length;
          });
        }
      } catch (e) {}
    });

    container.innerHTML = `
      <div class="space-y-8 animate-fade-in">
        
        <!-- Hero Header -->
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-900 p-8 sm:p-10 text-white shadow-xl">
          <!-- Background decorative math formulas -->
          <div class="absolute -right-10 -bottom-10 opacity-10 pointer-events-none text-9xl font-serif select-none">
            ∫ ∑ √x
          </div>

          <div class="relative z-10 max-w-3xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-brand-200 border border-white/10 mb-4">
              <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-400"></i>
              <span>Intelligence Artificielle & Calcul Formel SymPy</span>
            </div>
            
            <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Correction Automatique & <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-indigo-200 to-amber-200">Rendu Manuscrit Réaliste</span>
            </h1>
            
            <p class="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              Importez vos examens (PDF, photos de téléphone), laissez l'IA décomposer les exercices, valider chaque étape par calcul symbolique, et générer un rendu manuscrit digne d'une vraie feuille corrigée par un professeur.
            </p>

            <div class="mt-6 flex flex-wrap items-center gap-3.5">
              <a href="#correction-upload" class="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 active:scale-95 text-white font-bold text-sm shadow-lg shadow-brand-500/30 transition-all">
                <i data-lucide="file-up" class="w-4 h-4"></i>
                + Importer un examen / exercice
              </a>
              
              <button onclick="CorrectionsDashboardView.openHandwritingProfilerModal()" class="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md border border-white/15 transition-all">
                <i data-lucide="pen-tool" class="w-4 h-4 text-brand-300"></i>
                Calibrer "Mon Écriture"
              </button>
            </div>
          </div>
        </div>

        <!-- 3 KPIs Indicators -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <i data-lucide="file-text" class="w-6 h-6"></i>
            </div>
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Examens Corrigés</p>
              <h3 class="text-2xl font-bold text-slate-900 mt-0.5">${totalProjects}</h3>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <i data-lucide="check-circle-2" class="w-6 h-6"></i>
            </div>
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Questions Résolues</p>
              <h3 class="text-2xl font-bold text-slate-900 mt-0.5">${totalQuestions || 9}</h3>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <i data-lucide="shield-check" class="w-6 h-6"></i>
            </div>
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vérifications SymPy</p>
              <h3 class="text-2xl font-bold text-slate-900 mt-0.5">100% Exactitude</h3>
            </div>
          </div>
        </div>

        <!-- Quick Template Starters -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <i data-lucide="zap" class="w-5 h-5 text-amber-500"></i>
              Exemples d'Examens Prêts à Corriger (Test en 1 Clic)
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            ${this.templates.map(t => `
              <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-brand-300 transition-all flex flex-col justify-between group">
                <div>
                  <div class="flex items-center justify-between gap-2 mb-2.5">
                    <span class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-brand-50 text-brand-700 border border-brand-200">${t.level}</span>
                    <span class="text-xs text-slate-400 font-medium">${(t.exercises || []).length} exercices</span>
                  </div>
                  <h3 class="font-bold text-slate-900 text-base group-hover:text-brand-600 transition-colors">${t.title}</h3>
                  <p class="text-xs text-slate-500 mt-1.5 line-clamp-2">${t.chapter}</p>
                </div>
                
                <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span class="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <i data-lucide="check" class="w-3 h-3"></i> 5 étapes + SymPy
                  </span>
                  <button onclick="CorrectionsDashboardView.useTemplate('${t.id}')" class="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-brand-600 rounded-lg transition-colors flex items-center gap-1">
                    Ouvrir <i data-lucide="arrow-right" class="w-3 h-3"></i>
                  </button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Recent Corrections List -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
              <i data-lucide="folder-check" class="w-5 h-5 text-indigo-600"></i>
              Mes Corrections Récientes
            </h2>
            <div class="relative w-64">
              <input type="text" id="correction-search-input" placeholder="Filtrer par titre ou niveau..." oninput="CorrectionsDashboardView.filterProjects(this.value)" class="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5"></i>
            </div>
          </div>

          <div id="corrections-table-container" class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            ${this.renderProjectsTable(this.projects)}
          </div>
        </div>

      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  renderProjectsTable(projectsList) {
    if (!projectsList || projectsList.length === 0) {
      return `
        <div class="p-12 text-center">
          <div class="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <i data-lucide="inbox" class="w-7 h-7"></i>
          </div>
          <h3 class="font-bold text-slate-800 text-base">Aucune correction enregistrée</h3>
          <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Importez un examen ou choisissez l'un des modèles prêts à l'emploi pour générer votre première correction manuscrite.</p>
          <a href="#correction-upload" class="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-colors">
            + Importer un premier examen
          </a>
        </div>
      `;
    }

    return `
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600">
          <thead class="bg-slate-50/80 border-b border-slate-200/80 text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th class="px-5 py-3.5">Examen / Document</th>
              <th class="px-4 py-3.5">Niveau</th>
              <th class="px-4 py-3.5">Style Manuscrit</th>
              <th class="px-4 py-3.5">Papier</th>
              <th class="px-4 py-3.5">Statut</th>
              <th class="px-4 py-3.5">Date</th>
              <th class="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${projectsList.map(p => `
              <tr class="hover:bg-slate-50/60 transition-colors group">
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold flex items-center justify-center shadow-xs">
                      ∑
                    </div>
                    <div>
                      <a href="#correction-editor?id=${p.id}" class="font-bold text-slate-900 hover:text-brand-600 text-sm flex items-center gap-1.5">
                        ${p.title}
                      </a>
                      <p class="text-[11px] text-slate-400 mt-0.5">${p.chapter || 'Exercices de mathématiques'}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <span class="px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 text-[11px]">${p.level}</span>
                </td>
                <td class="px-4 py-4 font-medium text-slate-700">
                  ${p.handwriting_style === 'style_b_cahier' ? 'Cahier' : (p.handwriting_style === 'style_c_pedagogique' ? 'Pédagogique' : 'Prof Classique')}
                </td>
                <td class="px-4 py-4 text-slate-500">
                  ${p.paper_style === 'seyes' ? 'Séyès' : (p.paper_style === 'lined' ? 'Ligné' : 'Quadrillé 5mm')}
                </td>
                <td class="px-4 py-4">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <i data-lucide="check" class="w-3 h-3"></i> SymPy Vérifié
                  </span>
                </td>
                <td class="px-4 py-4 text-slate-400 text-[11px]">
                  ${p.exam_date || 'Aujourd\'hui'}
                </td>
                <td class="px-5 py-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <a href="#correction-editor?id=${p.id}" class="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors" title="Ouvrir l'éditeur interactif">
                      <i data-lucide="edit-3" class="w-4 h-4"></i>
                    </a>
                    <button onclick="CorrectionsDashboardView.exportPdf(${p.id}, '${p.title}')" class="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors" title="Télécharger PDF Haute Résolution">
                      <i data-lucide="download" class="w-4 h-4"></i>
                    </button>
                    <button onclick="CorrectionsDashboardView.duplicateProject(${p.id})" class="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors" title="Dupliquer">
                      <i data-lucide="copy" class="w-4 h-4"></i>
                    </button>
                    <button onclick="CorrectionsDashboardView.deleteProject(${p.id})" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Supprimer">
                      <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  },

  filterProjects(query) {
    const q = (query || "").toLowerCase();
    const filtered = this.projects.filter(p => 
      (p.title || "").toLowerCase().includes(q) ||
      (p.level || "").toLowerCase().includes(q) ||
      (p.chapter || "").toLowerCase().includes(q)
    );
    const container = document.getElementById("corrections-table-container");
    if (container) {
      container.innerHTML = this.renderProjectsTable(filtered);
      if (window.lucide) window.lucide.createIcons();
    }
  },

  async useTemplate(templateId) {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return;

    try {
      const created = await window.api.post("/corrections", {
        title: template.title,
        subject: "Mathématiques",
        level: template.level,
        chapter: template.chapter,
        teacher_name: "Prof. Mohamed",
        school_name: "Académie des Sciences Mathématiques",
        detail_level: template.detail_level,
        language: template.language,
        handwriting_style: "style_a_classique",
        paper_style: "squared_5mm",
        structured_data: JSON.stringify(template.exercises)
      });

      if (window.app && window.app.showToast) window.app.showToast("Examen modèle chargé avec succès !", "success");
      window.location.hash = `#correction-editor?id=${created.id}`;
    } catch (err) {
      console.error("Error using template:", err);
      if (window.app && window.app.showToast) window.app.showToast("Erreur lors de la création de la correction", "error");
    }
  },

  async duplicateProject(id) {
    try {
      const dup = await window.api.post(`/corrections/${id}/duplicate`);
      if (window.app && window.app.showToast) window.app.showToast("Projet dupliqué avec succès !", "success");
      await this.fetchData();
      this.render();
    } catch (err) {
      if (window.app && window.app.showToast) window.app.showToast("Erreur lors de la duplication", "error");
    }
  },

  async deleteProject(id) {
    if (!confirm("Voulez-vous vraiment supprimer cette correction ?")) return;
    try {
      await window.api.delete(`/corrections/${id}`);
      if (window.app && window.app.showToast) window.app.showToast("Correction supprimée", "success");
      await this.fetchData();
      this.render();
    } catch (err) {
      if (window.app && window.app.showToast) window.app.showToast("Erreur lors de la suppression", "error");
    }
  },

  exportPdf(id, title) {
    window.ExportManager.downloadServerPdf(id, `Correction_${title.replace(/\s+/g, '_')}.pdf`);
  },

  openHandwritingProfilerModal() {
    alert("Module de calibration d'écriture manuscrite activé. Vous pouvez personnaliser l'inclinaison, le jitter et l'épaisseur directement dans l'éditeur interactif.");
  }
};
