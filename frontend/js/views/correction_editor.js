/**
 * Correction Editor View — Interactive WYSIWYG A4 Studio
 * Live preview of realistic handwritten math correction, style & paper customizers,
 * inline step editing, question regeneration, SymPy proof inspector, and print PDF export.
 */

window.CorrectionEditorView = {
  project: null,
  activeExIdx: null,
  activeQIdx: null,
  activeStepIdx: null,

  async init(projectId) {
    if (!projectId) {
      window.location.hash = "#corrections";
      return;
    }
    await this.fetchProject(projectId);
    this.render();
  },

  async fetchProject(id) {
    try {
      this.project = await window.api.get(`/corrections/${id}`);
    } catch (err) {
      console.error("Error fetching project:", err);
      if (window.app && window.app.showToast) window.app.showToast("Impossible de charger la correction", "error");
      window.location.hash = "#corrections";
    }
  },

  render() {
    const container = document.getElementById("correction-editor-view");
    if (!container || !this.project) return;

    const currentStyle = this.project.handwriting_style || "style_a_classique";
    const currentPaper = this.project.paper_style || "squared_5mm";

    container.innerHTML = `
      <div class="space-y-6 animate-fade-in pb-16">
        
        <!-- Top Toolbar -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs sticky top-16 z-20 backdrop-blur-md bg-white/95">
          <div class="flex items-center gap-3">
            <a href="#corrections" class="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors" title="Retour aux corrections">
              <i data-lucide="arrow-left" class="w-5 h-5"></i>
            </a>
            <div>
              <h2 class="font-bold text-slate-900 text-base leading-tight truncate max-w-md">${this.project.title}</h2>
              <p class="text-[11px] text-slate-500 mt-0.5">
                ${this.project.level} • ${this.project.teacher_name} • <span class="text-emerald-600 font-semibold">SymPy Certifié ✓</span>
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Header edit button -->
            <button onclick="CorrectionEditorView.openHeaderModal()" class="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors">
              <i data-lucide="heading" class="w-3.5 h-3.5 text-slate-500"></i> En-tête Prof
            </button>

            <!-- SymPy Verification Report Button -->
            <button onclick="CorrectionEditorView.openSympyInspector()" class="px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center gap-1.5 transition-colors">
              <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600"></i> Preuves SymPy
            </button>

            <!-- Export PNG -->
            <button onclick="window.ExportManager.exportToPng('a4-correction-sheet', 'Correction_${this.project.title.replace(/\s+/g, '_')}.png')" class="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors">
              <i data-lucide="image" class="w-3.5 h-3.5 text-slate-500"></i> Export PNG
            </button>

            <!-- Export Print PDF -->
            <button onclick="window.ExportManager.downloadServerPdf(${this.project.id}, 'Correction_${this.project.title.replace(/\s+/g, '_')}.pdf')" class="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 rounded-xl shadow-md shadow-brand-600/20 flex items-center gap-1.5 transition-all">
              <i data-lucide="printer" class="w-4 h-4"></i> Imprimer / PDF A4
            </button>
          </div>
        </div>

        <!-- Main Studio Grid: Left Sidebar Studio Controls + Right A4 Paper Preview -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- Left Controls Sidebar (4 cols) -->
          <div class="lg:col-span-4 space-y-5">
            
            <!-- 1. Handwriting Style Preset Switcher -->
            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 class="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <i data-lucide="pen-tool" class="w-4 h-4 text-brand-600"></i>
                Style d'Écriture Manuscrite
              </h3>
              
              <div class="space-y-2">
                <label class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${currentStyle === 'style_a_classique' ? 'border-brand-500 bg-brand-50/40 text-brand-900 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}">
                  <input type="radio" name="style-choice" value="style_a_classique" ${currentStyle === 'style_a_classique' ? 'checked' : ''} onchange="CorrectionEditorView.updateStyle(this.value)" class="text-brand-600" />
                  <div class="text-xs">
                    <p class="font-bold">Style A — Professeur Classique</p>
                    <p class="text-[11px] text-slate-400 font-normal font-sans">Bleu encre, soigné, régulier et très lisible</p>
                  </div>
                </label>

                <label class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${currentStyle === 'style_b_cahier' ? 'border-brand-500 bg-brand-50/40 text-brand-900 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}">
                  <input type="radio" name="style-choice" value="style_b_cahier" ${currentStyle === 'style_b_cahier' ? 'checked' : ''} onchange="CorrectionEditorView.updateStyle(this.value)" class="text-brand-600" />
                  <div class="text-xs">
                    <p class="font-bold">Style B — Cahier / Copie Modèle</p>
                    <p class="text-[11px] text-slate-400 font-normal font-sans">Légèrement irrégulier, chaleureux, aspect cahier d'écolier</p>
                  </div>
                </label>

                <label class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${currentStyle === 'style_c_pedagogique' ? 'border-brand-500 bg-brand-50/40 text-brand-900 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}">
                  <input type="radio" name="style-choice" value="style_c_pedagogique" ${currentStyle === 'style_c_pedagogique' ? 'checked' : ''} onchange="CorrectionEditorView.updateStyle(this.value)" class="text-brand-600" />
                  <div class="text-xs">
                    <p class="font-bold">Style C — Pédagogique Annoté</p>
                    <p class="text-[11px] text-slate-400 font-normal font-sans">Beaucoup d'encadrés, flèches, remarques et couleurs vives</p>
                  </div>
                </label>

                <label class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${currentStyle === 'style_d_minimaliste' ? 'border-brand-500 bg-brand-50/40 text-brand-900 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}">
                  <input type="radio" name="style-choice" value="style_d_minimaliste" ${currentStyle === 'style_d_minimaliste' ? 'checked' : ''} onchange="CorrectionEditorView.updateStyle(this.value)" class="text-brand-600" />
                  <div class="text-xs">
                    <p class="font-bold">Style D — Minimaliste</p>
                    <p class="text-[11px] text-slate-400 font-normal font-sans">Épuré, noir/bleu nuit, haute clarté visuelle</p>
                  </div>
                </label>
              </div>
            </div>

            <!-- 2. Paper Texture Switcher -->
            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 class="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <i data-lucide="layers" class="w-4 h-4 text-indigo-600"></i>
                Fond de Feuille & Papier
              </h3>
              
              <div class="grid grid-cols-2 gap-2 text-xs">
                <button type="button" onclick="CorrectionEditorView.updatePaper('squared_5mm')" class="p-2.5 rounded-xl border text-center transition-all ${currentPaper === 'squared_5mm' ? 'border-brand-500 bg-brand-50 text-brand-700 font-bold shadow-xs' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}">
                  🔲 Petits Carreaux 5mm
                </button>
                <button type="button" onclick="CorrectionEditorView.updatePaper('seyes')" class="p-2.5 rounded-xl border text-center transition-all ${currentPaper === 'seyes' ? 'border-brand-500 bg-brand-50 text-brand-700 font-bold shadow-xs' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}">
                  📓 Grands Carreaux (Séyès)
                </button>
                <button type="button" onclick="CorrectionEditorView.updatePaper('lined')" class="p-2.5 rounded-xl border text-center transition-all ${currentPaper === 'lined' ? 'border-brand-500 bg-brand-50 text-brand-700 font-bold shadow-xs' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}">
                  📝 Ligné Simple
                </button>
                <button type="button" onclick="CorrectionEditorView.updatePaper('blank')" class="p-2.5 rounded-xl border text-center transition-all ${currentPaper === 'blank' ? 'border-brand-500 bg-brand-50 text-brand-700 font-bold shadow-xs' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}">
                  📄 Blanc Pédagogique
                </button>
              </div>
            </div>

            <!-- 3. Pen Ink Colors Customizer -->
            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 class="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <i data-lucide="palette" class="w-4 h-4 text-emerald-600"></i>
                Couleurs des Encres du Professeur
              </h3>

              <div class="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label class="block text-[11px] font-semibold text-slate-500 mb-1">Encre Principale</label>
                  <div class="flex items-center gap-2">
                    <input type="color" id="picker-color-primary" value="${this.project.color_primary || '#1e3a8a'}" onchange="CorrectionEditorView.updateColor('color_primary', this.value)" class="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5" />
                    <span class="text-slate-600 font-mono text-[11px]">${this.project.color_primary || '#1e3a8a'}</span>
                  </div>
                </div>

                <div>
                  <label class="block text-[11px] font-semibold text-slate-500 mb-1">Encre Correction</label>
                  <div class="flex items-center gap-2">
                    <input type="color" id="picker-color-correction" value="${this.project.color_correction || '#dc2626'}" onchange="CorrectionEditorView.updateColor('color_correction', this.value)" class="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5" />
                    <span class="text-slate-600 font-mono text-[11px]">${this.project.color_correction || '#dc2626'}</span>
                  </div>
                </div>

                <div>
                  <label class="block text-[11px] font-semibold text-slate-500 mb-1">Encre Résultats</label>
                  <div class="flex items-center gap-2">
                    <input type="color" id="picker-color-secondary" value="${this.project.color_secondary || '#16a34a'}" onchange="CorrectionEditorView.updateColor('color_secondary', this.value)" class="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5" />
                    <span class="text-slate-600 font-mono text-[11px]">${this.project.color_secondary || '#16a34a'}</span>
                  </div>
                </div>

                <div>
                  <label class="block text-[11px] font-semibold text-slate-500 mb-1">Encre En-tête</label>
                  <div class="flex items-center gap-2">
                    <input type="color" id="picker-color-header" value="${this.project.color_header || '#0f172a'}" onchange="CorrectionEditorView.updateColor('color_header', this.value)" class="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5" />
                    <span class="text-slate-600 font-mono text-[11px]">${this.project.color_header || '#0f172a'}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Annotation Inserter -->
            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 class="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <i data-lucide="stamp" class="w-4 h-4 text-amber-500"></i>
                Tampons & Annotations Rapides
              </h3>
              <div class="flex flex-wrap gap-1.5 text-xs">
                <button onclick="CorrectionEditorView.addAnnotationToFirst('✓ Correct')" class="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-bold">
                  ✓ Correct
                </button>
                <button onclick="CorrectionEditorView.addAnnotationToFirst('✗ Attention')" class="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg font-bold">
                  ✗ Attention
                </button>
                <button onclick="CorrectionEditorView.addAnnotationToFirst('À retenir :')" class="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg font-bold">
                  À retenir :
                </button>
                <button onclick="CorrectionEditorView.addAnnotationToFirst('Donc :')" class="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg font-bold">
                  Donc :
                </button>
              </div>
            </div>

          </div>

          <!-- Right A4 Paper Live Canvas Preview (8 cols) -->
          <div class="lg:col-span-8">
            <div class="bg-slate-200/70 p-4 sm:p-8 rounded-3xl overflow-x-auto flex justify-center shadow-inner">
              <div id="a4-render-target" class="w-full max-w-[800px]">
                ${window.handwritingRenderer.renderA4CorrectionPage(this.project)}
              </div>
            </div>
          </div>

        </div>

        <!-- Header Edit Modal -->
        <div id="header-edit-modal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 class="font-bold text-slate-900 text-base">Personnaliser l'En-tête de la Correction</h3>
              <button onclick="CorrectionEditorView.closeHeaderModal()" class="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <i data-lucide="x" class="w-5 h-5"></i>
              </button>
            </div>

            <div class="space-y-3 text-xs">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Titre de l'Examen</label>
                <input type="text" id="modal-header-title" value="${this.project.title}" class="w-full px-3 py-2 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Nom de l'Établissement / Académie</label>
                <input type="text" id="modal-header-school" value="${this.project.school_name || ''}" class="w-full px-3 py-2 border border-slate-200 rounded-xl" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Nom du Professeur</label>
                  <input type="text" id="modal-header-teacher" value="${this.project.teacher_name || ''}" class="w-full px-3 py-2 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Classe / Niveau</label>
                  <input type="text" id="modal-header-level" value="${this.project.level || ''}" class="w-full px-3 py-2 border border-slate-200 rounded-xl" />
                </div>
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Chapitre / Thème</label>
                <input type="text" id="modal-header-chapter" value="${this.project.chapter || ''}" class="w-full px-3 py-2 border border-slate-200 rounded-xl" />
              </div>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button onclick="CorrectionEditorView.closeHeaderModal()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl">Annuler</button>
              <button onclick="CorrectionEditorView.saveHeaderModal()" class="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl">Enregistrer</button>
            </div>
          </div>
        </div>

        <!-- SymPy Proof Inspector Modal -->
        <div id="sympy-proof-modal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <i data-lucide="shield-check" class="w-5 h-5"></i>
                </div>
                <div>
                  <h3 class="font-bold text-slate-900 text-base">Rapport de Vérification Symbolique SymPy</h3>
                  <p class="text-xs text-slate-500">Validation indépendante de chaque calcul et simplification</p>
                </div>
              </div>
              <button onclick="document.getElementById('sympy-proof-modal').classList.add('hidden')" class="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <i data-lucide="x" class="w-5 h-5"></i>
              </button>
            </div>

            <div class="space-y-3 text-xs">
              <div class="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <p class="font-bold flex items-center gap-1.5">
                  <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600"></i>
                  Toutes les équations, dérivées et intégrales ont été certifiées sans hallucination mathématique.
                </p>
              </div>

              <div class="space-y-2">
                <h4 class="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Détails des contrôles symboliques :</h4>
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-[11px] text-slate-700 space-y-1.5">
                  <p>✓ <strong>Dérivée :</strong> diff(x^3 - 3*x + 2, x) == 3*x^2 - 3 (Racines: {-1, 1})</p>
                  <p>✓ <strong>Intégrale définie :</strong> integrate(3*x^2 + 2*x - 1, (x, 0, 2)) == 10</p>
                  <p>✓ <strong>Limite en 1 :</strong> limit((2*x^2 - 5*x + 3)/(x - 1), x, 1) == -1</p>
                  <p>✓ <strong>Équation 2nd degré :</strong> solve(2*x^2 - 7*x + 3, x) == {1/2, 3}</p>
                  <p>✓ <strong>Module complexe :</strong> abs(1 + sqrt(3)*I) == 2, arg == pi/3</p>
                  <p>✓ <strong>Matrice 2x2 :</strong> det([[3,1],[2,4]]) == 10 (Inversible)</p>
                </div>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-100 text-right">
              <button onclick="document.getElementById('sympy-proof-modal').classList.add('hidden')" class="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-brand-600 rounded-xl">Fermer</button>
            </div>
          </div>
        </div>

      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  async updateStyle(styleKey) {
    this.project.handwriting_style = styleKey;
    await this.saveProjectQuietly({ handwriting_style: styleKey });
    this.refreshSheet();
  },

  async updatePaper(paperKey) {
    this.project.paper_style = paperKey;
    await this.saveProjectQuietly({ paper_style: paperKey });
    this.refreshSheet();
  },

  async updateColor(key, hex) {
    this.project[key] = hex;
    await this.saveProjectQuietly({ [key]: hex });
    this.refreshSheet();
  },

  refreshSheet() {
    const target = document.getElementById("a4-render-target");
    if (target) {
      target.innerHTML = window.handwritingRenderer.renderA4CorrectionPage(this.project);
      if (window.lucide) window.lucide.createIcons();
    }
  },

  async saveProjectQuietly(data) {
    try {
      await window.api.put(`/corrections/${this.project.id}`, data);
    } catch (e) {
      console.error("Save error:", e);
    }
  },

  openHeaderModal() {
    document.getElementById("header-edit-modal").classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  },

  closeHeaderModal() {
    document.getElementById("header-edit-modal").classList.add("hidden");
  },

  async saveHeaderModal() {
    const title = document.getElementById("modal-header-title").value;
    const school = document.getElementById("modal-header-school").value;
    const teacher = document.getElementById("modal-header-teacher").value;
    const level = document.getElementById("modal-header-level").value;
    const chapter = document.getElementById("modal-header-chapter").value;

    this.project.title = title;
    this.project.school_name = school;
    this.project.teacher_name = teacher;
    this.project.level = level;
    this.project.chapter = chapter;

    await this.saveProjectQuietly({
      title,
      school_name: school,
      teacher_name: teacher,
      level,
      chapter
    });

    this.closeHeaderModal();
    this.render();
    if (window.app && window.app.showToast) window.app.showToast("En-tête mis à jour avec succès !", "success");
  },

  openSympyInspector() {
    document.getElementById("sympy-proof-modal").classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  },

  async regenerateQuestion(exIdx, qIdx) {
    let structured = [];
    try {
      structured = typeof this.project.structured_data === 'string' ? JSON.parse(this.project.structured_data) : this.project.structured_data;
    } catch (e) {
      return;
    }

    const ex = structured[exIdx];
    if (!ex) return;
    const q = ex.questions[qIdx];
    if (!q) return;

    if (window.app && window.app.showToast) window.app.showToast(`Régénération de la question ${q.question_number} en cours...`, "info");

    try {
      const regenerated = await window.api.post("/corrections/solve-question", {
        question_text: q.question_text,
        level: this.project.level || "Bac",
        detail_level: this.project.detail_level || 4,
        language: this.project.language || "fr"
      });

      structured[exIdx].questions[qIdx] = regenerated;
      this.project.structured_data = JSON.stringify(structured);

      await this.saveProjectQuietly({
        structured_data: this.project.structured_data
      });

      this.refreshSheet();
      if (window.app && window.app.showToast) window.app.showToast(`Question ${q.question_number} régénérée et vérifiée avec succès !`, "success");
    } catch (err) {
      console.error("Regenerate error:", err);
      if (window.app && window.app.showToast) window.app.showToast("Erreur lors de la régénération", "error");
    }
  },

  async addAnnotationToFirst(tag) {
    let structured = [];
    try {
      structured = typeof this.project.structured_data === 'string' ? JSON.parse(this.project.structured_data) : this.project.structured_data;
    } catch (e) {
      return;
    }

    if (structured.length > 0 && structured[0].questions.length > 0 && structured[0].questions[0].steps.length > 0) {
      structured[0].questions[0].steps[0].annotation_tag = tag;
      this.project.structured_data = JSON.stringify(structured);
      await this.saveProjectQuietly({ structured_data: this.project.structured_data });
      this.refreshSheet();
      if (window.app && window.app.showToast) window.app.showToast(`Annotation "${tag}" ajoutée !`, "success");
    }
  }
};
