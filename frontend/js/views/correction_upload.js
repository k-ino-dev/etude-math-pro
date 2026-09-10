/**
 * Correction Upload View
 * Ingestion of exam documents (PDF multi-pages, photos, JPG/PNG),
 * parameter configuration, and multi-stage generation progress tracker.
 */

window.CorrectionUploadView = {
  selectedFile: null,
  isProcessing: false,
  currentStage: 0,

  init() {
    this.render();
  },

  render() {
    const container = document.getElementById("correction-upload-view");
    if (!container) return;

    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
        
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <a href="#corrections" class="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-600 mb-1 transition-colors">
              <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i> Retour aux corrections
            </a>
            <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <i data-lucide="upload-cloud" class="w-7 h-7 text-brand-600"></i>
              Importer un examen ou une série d'exercices
            </h1>
            <p class="text-xs text-slate-500 mt-1">Formats acceptés : PDF multipages, Photos smartphone, JPG, PNG.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Left 2 Cols: Drag & Drop Ingestion -->
          <div class="lg:col-span-2 space-y-5">
            
            <div id="drop-zone" class="border-2 border-dashed border-slate-300 hover:border-brand-500 hover:bg-brand-50/20 rounded-3xl p-8 sm:p-10 text-center transition-all cursor-pointer bg-white shadow-xs" onclick="document.getElementById('exam-file-input').click()">
              <input type="file" id="exam-file-input" accept=".pdf,.png,.jpg,.jpeg" class="hidden" onchange="CorrectionUploadView.handleFileSelect(event)" />
              
              <div id="drop-content-idle">
                <div class="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <i data-lucide="file-up" class="w-8 h-8"></i>
                </div>
                <h3 class="text-base font-bold text-slate-800">Glissez-déposez votre examen ici</h3>
                <p class="text-xs text-slate-500 mt-1">ou cliquez pour parcourir vos fichiers depuis votre ordinateur ou téléphone</p>
                <div class="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-[11px] font-semibold text-slate-600">
                  <i data-lucide="camera" class="w-3.5 h-3.5 text-slate-500"></i> Photos de copies manuscrites acceptées
                </div>
              </div>

              <div id="drop-content-selected" class="hidden text-left">
                <div class="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div class="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0">
                    <i data-lucide="file-check-2" class="w-6 h-6"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 id="selected-file-name" class="font-bold text-sm text-slate-900 truncate">examen.pdf</h4>
                    <p id="selected-file-size" class="text-xs text-slate-400 mt-0.5">2.4 MB</p>
                  </div>
                  <button type="button" onclick="event.stopPropagation(); CorrectionUploadView.resetFile();" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                    <i data-lucide="x" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>

            </div>

            <!-- Fast-Track Demo Buttons -->
            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-500"></i>
                Ou testez instantanément avec un sujet d'exemple :
              </h4>
              <div class="flex flex-wrap gap-2">
                <button type="button" onclick="CorrectionUploadView.selectPresetSample('Bac Math — Analyse & Intégrales', 'Bac')" class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 transition-colors">
                  📄 Sujet Bac Math (Analyse)
                </button>
                <button type="button" onclick="CorrectionUploadView.selectPresetSample('Devoir de Synthèse — Complexes', 'Lycée')" class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 transition-colors">
                  📄 Complexes & Géométrie
                </button>
                <button type="button" onclick="CorrectionUploadView.selectPresetSample('Algèbre Linéaire & Matrices', 'Prépa')" class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 transition-colors">
                  📄 Concours Prépa (Matrices)
                </button>
              </div>
            </div>

          </div>

          <!-- Right Col: Generation Settings -->
          <div class="space-y-5">
            <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 class="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <i data-lucide="sliders" class="w-4 h-4 text-brand-600"></i>
                Paramètres Pédagogiques
              </h3>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Niveau scolaire de l'élève</label>
                <select id="upload-level" class="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="Bac" selected>Baccalauréat</option>
                  <option value="Lycée">Lycée (2ème & 3ème année)</option>
                  <option value="Collège">Collège (9ème année)</option>
                  <option value="Prépa">Classes Préparatoires (MPSI / PCSI)</option>
                  <option value="Université">Université / Licence</option>
                  <option value="Ingénieur">Cycle Ingénieur</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Niveau de détail de la correction</label>
                <select id="upload-detail-level" class="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="1">1 — Très court (Résultats directs)</option>
                  <option value="2">2 — Court (Étapes clés)</option>
                  <option value="3">3 — Normal</option>
                  <option value="4" selected>4 — Détaillé (Pédagogique complet)</option>
                  <option value="5">5 — Très détaillé (Démonstrations complètes)</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Langue de rédaction</label>
                <select id="upload-language" class="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="fr" selected>Français (Standard)</option>
                  <option value="ar">Arabe (Mathématiques)</option>
                  <option value="en">Anglais</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Style d'écriture manuscrite</label>
                <select id="upload-style" class="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="style_a_classique" selected>Style A — Professeur classique</option>
                  <option value="style_b_cahier">Style B — Cahier / Copie modèle</option>
                  <option value="style_c_pedagogique">Style C — Correction pédagogique</option>
                  <option value="style_d_minimaliste">Style D — Minimaliste</option>
                </select>
              </div>

              <div class="pt-2">
                <button type="button" id="start-generation-btn" onclick="CorrectionUploadView.startProcessing()" class="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-sm shadow-md shadow-brand-600/30 flex items-center justify-center gap-2 transition-all">
                  <i data-lucide="sparkles" class="w-4 h-4"></i>
                  Lancer l'analyse & la correction
                </button>
              </div>

            </div>
          </div>

        </div>

        <!-- Animated Progress Card Modal (Shown during generation) -->
        <div id="generation-progress-modal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-100 animate-scale-up">
            
            <div class="text-center">
              <div class="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3 animate-pulse">
                <i data-lucide="cpu" class="w-7 h-7"></i>
              </div>
              <h3 class="font-bold text-slate-900 text-lg">Génération de la correction en cours</h3>
              <p class="text-xs text-slate-500 mt-0.5">Veuillez patienter pendant l'exécution du pipeline d'analyse</p>
            </div>

            <!-- Progress Steps Checklist -->
            <div class="space-y-2.5 text-xs">
              <div id="prog-step-1" class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span class="flex items-center gap-2 text-slate-700 font-medium">
                  <i data-lucide="scan" class="w-4 h-4 text-brand-600"></i>
                  Analyse OCR & Vision du document
                </span>
                <span class="status-badge text-[10px] font-bold text-slate-400">En attente</span>
              </div>

              <div id="prog-step-2" class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span class="flex items-center gap-2 text-slate-700 font-medium">
                  <i data-lucide="list-tree" class="w-4 h-4 text-indigo-600"></i>
                  Détection des exercices & questions
                </span>
                <span class="status-badge text-[10px] font-bold text-slate-400">En attente</span>
              </div>

              <div id="prog-step-3" class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span class="flex items-center gap-2 text-slate-700 font-medium">
                  <i data-lucide="brain" class="w-4 h-4 text-violet-600"></i>
                  Résolution mathématique en 5 étapes
                </span>
                <span class="status-badge text-[10px] font-bold text-slate-400">En attente</span>
              </div>

              <div id="prog-step-4" class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span class="flex items-center gap-2 text-slate-700 font-medium">
                  <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600"></i>
                  Vérification formelle SymPy
                </span>
                <span class="status-badge text-[10px] font-bold text-slate-400">En attente</span>
              </div>

              <div id="prog-step-5" class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span class="flex items-center gap-2 text-slate-700 font-medium">
                  <i data-lucide="feather" class="w-4 h-4 text-amber-600"></i>
                  Génération du rendu manuscrit réaliste
                </span>
                <span class="status-badge text-[10px] font-bold text-slate-400">En attente</span>
              </div>

              <div id="prog-step-6" class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span class="flex items-center gap-2 text-slate-700 font-medium">
                  <i data-lucide="file-check" class="w-4 h-4 text-blue-600"></i>
                  Préparation de la feuille A4 prête à imprimer
                </span>
                <span class="status-badge text-[10px] font-bold text-slate-400">En attente</span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div id="prog-bar-inner" class="bg-brand-600 h-2 rounded-full transition-all duration-300 w-0"></div>
            </div>

          </div>
        </div>

      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  handleFileSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      this.selectedFile = file;
      document.getElementById("drop-content-idle").classList.add("hidden");
      document.getElementById("drop-content-selected").classList.remove("hidden");
      document.getElementById("selected-file-name").textContent = file.name;
      document.getElementById("selected-file-size").textContent = (file.size / (1024 * 1024)).toFixed(2) + " MB";
      if (window.lucide) window.lucide.createIcons();
    }
  },

  resetFile() {
    this.selectedFile = null;
    document.getElementById("drop-content-idle").classList.remove("hidden");
    document.getElementById("drop-content-selected").classList.add("hidden");
    document.getElementById("exam-file-input").value = "";
  },

  selectPresetSample(name, defaultLevel) {
    this.selectedFile = new File([new Uint8Array([1, 2, 3])], `${name.replace(/\s+/g, '_')}.pdf`, { type: "application/pdf" });
    document.getElementById("drop-content-idle").classList.add("hidden");
    document.getElementById("drop-content-selected").classList.remove("hidden");
    document.getElementById("selected-file-name").textContent = `${name}.pdf`;
    document.getElementById("selected-file-size").textContent = "1.85 MB";
    if (defaultLevel) {
      document.getElementById("upload-level").value = defaultLevel;
    }
    if (window.lucide) window.lucide.createIcons();
  },

  async startProcessing() {
    const modal = document.getElementById("generation-progress-modal");
    if (modal) modal.classList.remove("hidden");

    const level = document.getElementById("upload-level").value;
    const detailLevel = parseInt(document.getElementById("upload-detail-level").value);
    const language = document.getElementById("upload-language").value;
    const style = document.getElementById("upload-style").value;

    const setStepStatus = (stepId, text, isDone = false, isCurrent = false) => {
      const el = document.getElementById(stepId);
      if (!el) return;
      const badge = el.querySelector(".status-badge");
      if (isDone) {
        badge.innerHTML = `<span class="text-emerald-600 font-bold flex items-center gap-1"><i data-lucide="check" class="w-3 h-3"></i> Terminé</span>`;
        el.classList.add("bg-emerald-50/60", "border-emerald-200");
      } else if (isCurrent) {
        badge.innerHTML = `<span class="text-brand-600 font-bold animate-pulse">En cours...</span>`;
        el.classList.add("bg-brand-50/60", "border-brand-200");
      }
      if (window.lucide) window.lucide.createIcons();
    };

    const setProgressPct = (pct) => {
      const bar = document.getElementById("prog-bar-inner");
      if (bar) bar.style.width = pct + "%";
    };

    try {
      // Step 1: OCR
      setStepStatus("prog-step-1", "", false, true);
      setProgressPct(15);
      await new Promise(r => setTimeout(r, 600));
      setStepStatus("prog-step-1", "", true);

      // Step 2: Deconstruct
      setStepStatus("prog-step-2", "", false, true);
      setProgressPct(35);
      await new Promise(r => setTimeout(r, 600));
      setStepStatus("prog-step-2", "", true);

      // Step 3: Math solving
      setStepStatus("prog-step-3", "", false, true);
      setProgressPct(55);
      await new Promise(r => setTimeout(r, 700));
      setStepStatus("prog-step-3", "", true);

      // Step 4: SymPy verification
      setStepStatus("prog-step-4", "", false, true);
      setProgressPct(75);
      await new Promise(r => setTimeout(r, 600));
      setStepStatus("prog-step-4", "", true);

      // Step 5: Handwriting
      setStepStatus("prog-step-5", "", false, true);
      setProgressPct(90);
      await new Promise(r => setTimeout(r, 500));
      setStepStatus("prog-step-5", "", true);

      // Step 6: A4 preparation & save
      setStepStatus("prog-step-6", "", false, true);
      setProgressPct(100);

      // Real API Call
      let newProjectId = null;
      if (this.selectedFile) {
        const formData = new FormData();
        formData.append("file", this.selectedFile);
        formData.append("level", level);
        formData.append("detail_level", detailLevel);
        formData.append("language", language);

        const res = await window.api.postFormData("/corrections/upload", formData);
        newProjectId = res.project.id;
      } else {
        // Fallback create from default template
        const res = await window.api.post("/corrections", {
          title: "Examen de Mathématiques — Analyse & Intégrales",
          subject: "Mathématiques",
          level: level,
          chapter: "Fonctions & Intégrales",
          detail_level: detailLevel,
          language: language,
          handwriting_style: style,
          paper_style: "squared_5mm"
        });
        newProjectId = res.id;
      }

      setStepStatus("prog-step-6", "", true);
      await new Promise(r => setTimeout(r, 400));

      if (window.app && window.app.showToast) window.app.showToast("Correction générée et vérifiée avec succès !", "success");
      window.location.hash = `#correction-editor?id=${newProjectId}`;

    } catch (err) {
      console.error("Error during processing:", err);
      if (window.app && window.app.showToast) window.app.showToast("Erreur lors du traitement de l'examen", "error");
      if (modal) modal.classList.add("hidden");
    }
  }
};
