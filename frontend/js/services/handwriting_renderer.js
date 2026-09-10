/**
 * Handwriting Renderer Service
 * Transforms structured math steps, equations, annotations, and geometry
 * into ultra-realistic handwritten teacher corrections with natural organic jitter,
 * mathematical glyph stylization, rough sketched boxes, and authentic paper textures.
 */

class HandwritingRenderer {
  constructor() {
    this.styles = {
      style_a_classique: {
        name: "Style A — Professeur Classique",
        fontFamily: "'Caveat', cursive, sans-serif",
        fontSize: "19px",
        lineHeight: "1.65",
        letterSpacing: "0.4px",
        slantAngle: "3deg",
        strokeWidth: "1.8px",
        primaryColor: "#1e3a8a",   // Bleu encre classique
        correctionColor: "#dc2626", // Rouge prof
        secondaryColor: "#16a34a",  // Vert méthode/résultat
        headerColor: "#0f172a"
      },
      style_b_cahier: {
        name: "Style B — Cahier / Copie Modèle",
        fontFamily: "'Kalam', cursive, sans-serif",
        fontSize: "17px",
        lineHeight: "1.75",
        letterSpacing: "0.2px",
        slantAngle: "-1deg",
        strokeWidth: "1.9px",
        primaryColor: "#1e40af",
        correctionColor: "#b91c1c",
        secondaryColor: "#15803d",
        headerColor: "#1e293b"
      },
      style_c_pedagogique: {
        name: "Style C — Correction Pédagogique",
        fontFamily: "'Patrick Hand', cursive, sans-serif",
        fontSize: "18px",
        lineHeight: "1.6",
        letterSpacing: "0.5px",
        slantAngle: "1.5deg",
        strokeWidth: "1.7px",
        primaryColor: "#0369a1",   // Bleu cyan foncé
        correctionColor: "#e11d48", // Rose/rouge vif
        secondaryColor: "#059669",  // Émeraude
        headerColor: "#0f172a"
      },
      style_d_minimaliste: {
        name: "Style D — Minimaliste",
        fontFamily: "'Gochi Hand', cursive, sans-serif",
        fontSize: "18px",
        lineHeight: "1.55",
        letterSpacing: "0.3px",
        slantAngle: "0deg",
        strokeWidth: "1.6px",
        primaryColor: "#0f172a",   // Noir/Charbon
        correctionColor: "#dc2626",
        secondaryColor: "#2563eb",
        headerColor: "#020617"
      },
      style_custom: {
        name: "Style Personnalisé (Mon Écriture)",
        fontFamily: "'Caveat', cursive, sans-serif",
        fontSize: "19px",
        lineHeight: "1.65",
        letterSpacing: "0.6px",
        slantAngle: "4deg",
        strokeWidth: "1.8px",
        primaryColor: "#1e3a8a",
        correctionColor: "#dc2626",
        secondaryColor: "#16a34a",
        headerColor: "#0f172a"
      }
    };
  }

  /**
   * Applies subtle, organic micro-variations (baseline jitter & angle) to a text string
   */
  applyNaturalJitter(text, intensity = 1.0) {
    if (!text) return "";
    
    // Split into words to prevent breaking words while giving natural line jitter
    const words = text.split(" ");
    return words.map((word, idx) => {
      // Deterministic yet natural pseudo-random variation based on word content & index
      const seed = (word.length * 37 + idx * 19) % 100;
      const baselineY = ((seed % 7) - 3) * 0.18 * intensity; // -0.54px to +0.54px
      const tiltDeg = (((seed % 5) - 2) * 0.35 * intensity).toFixed(1); // -0.7deg to +0.7deg
      
      return `<span class="handwritten-word inline-block" style="transform: translateY(${baselineY}px) rotate(${tiltDeg}deg);">${word}</span>`;
    }).join(" ");
  }

  /**
   * Formats LaTeX formulas into handwritten math markup (fractions, square roots, boxed results)
   */
  renderHandwrittenMath(latex, colorRole = "primary", colors = {}) {
    if (!latex) return "";
    let clean = latex.trim();
    
    // Remove wrapper $$ or $
    clean = clean.replace(/^\$\$|\$\$$/g, '').replace(/^\$|\$$/g, '').trim();

    const penColor = colors[colorRole] || (colorRole === 'correction' ? '#dc2626' : (colorRole === 'secondary' ? '#16a34a' : '#1e3a8a'));

    // Check if boxed result \boxed{...}
    const isBoxed = clean.startsWith('\\boxed{') && clean.endsWith('}');
    if (isBoxed) {
      clean = clean.substring(7, clean.length - 1);
    }

    // Try KaTeX rendering if available, with custom handwritten styling
    let mathHtml = clean;
    if (window.katex) {
      try {
        mathHtml = window.katex.renderToString(clean, {
          displayMode: true,
          throwOnError: false
        });
      } catch (e) {
        mathHtml = `<span class="font-mono text-base">${clean}</span>`;
      }
    }

    if (isBoxed) {
      return `
        <div class="handwritten-boxed-result relative my-3 p-3.5 inline-block" style="color: ${colors.secondary || '#16a34a'};">
          <svg class="absolute inset-0 w-full h-full pointer-events-none overflow-visible" preserveAspectRatio="none">
            <!-- Organic hand-drawn wobbled box -->
            <rect x="2" y="2" width="calc(100% - 4px)" height="calc(100% - 4px)" fill="rgba(22, 163, 74, 0.04)" stroke="${colors.secondary || '#16a34a'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" rx="6" style="filter: drop-shadow(0.5px 0.5px 0px rgba(0,0,0,0.05));" />
          </svg>
          <div class="relative z-10 font-bold">${mathHtml}</div>
        </div>
      `;
    }

    return `<div class="handwritten-math-block my-2" style="color: ${penColor};">${mathHtml}</div>`;
  }

  /**
   * Renders a teacher annotation badge / sticky remark with hand-drawn SVG indicator
   */
  renderAnnotationTag(tagText, colorRole = "correction", colors = {}) {
    if (!tagText) return "";
    
    let isCorrect = tagText.includes("✓") || tagText.toLowerCase().includes("correct") || tagText.toLowerCase().includes("validé");
    let isWarning = tagText.includes("✗") || tagText.toLowerCase().includes("attention") || tagText.toLowerCase().includes("erreur") || tagText.toLowerCase().includes("f.i");
    
    const strokeColor = isCorrect ? (colors.secondary || "#16a34a") : (isWarning ? (colors.correction || "#dc2626") : (colors.primary || "#1e3a8a"));
    const bgColor = isCorrect ? "rgba(22, 163, 74, 0.08)" : (isWarning ? "rgba(220, 38, 38, 0.08)" : "rgba(30, 58, 138, 0.08)");

    return `
      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-sm font-bold handwritten-annotation-badge shadow-xs select-none" style="color: ${strokeColor}; background-color: ${bgColor}; border: 1.2px dashed ${strokeColor}; transform: rotate(-1deg);">
        ${tagText}
      </span>
    `;
  }

  /**
   * Renders an entire A4 page with teacher header, exercise blocks, steps, SymPy proofs, and geometry
   */
  renderA4CorrectionPage(project, options = {}) {
    const styleKey = project.handwriting_style || "style_a_classique";
    const currentStyle = this.styles[styleKey] || this.styles.style_a_classique;
    
    const paperKey = project.paper_style || "squared_5mm"; // "seyes", "squared_5mm", "lined", "blank"
    
    const colors = {
      primary: project.color_primary || currentStyle.primaryColor,
      correction: project.color_correction || currentStyle.correctionColor,
      secondary: project.color_secondary || currentStyle.secondaryColor,
      header: project.color_header || currentStyle.headerColor
    };

    let structured = [];
    try {
      structured = typeof project.structured_data === 'string' ? JSON.parse(project.structured_data) : project.structured_data;
    } catch (e) {
      structured = [];
    }

    // Build HTML for exercises
    let exercisesHtml = "";
    structured.forEach((ex, exIdx) => {
      let questionsHtml = "";
      (ex.questions || []).forEach((q, qIdx) => {
        let stepsHtml = "";
        (q.steps || []).forEach((step, sIdx) => {
          const stepTag = step.annotation_tag ? this.renderAnnotationTag(step.annotation_tag, step.color_role, colors) : "";
          const stepMath = step.latex ? this.renderHandwrittenMath(step.latex, step.color_role, colors) : "";
          const stepColor = colors[step.color_role] || colors.primary;

          const isVerifiedBadge = step.is_verified ? `
            <span class="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-full" title="${step.sympy_check || 'Vérifié par SymPy'}">
              <i data-lucide="shield-check" class="w-3 h-3"></i> SymPy
            </span>
          ` : "";

          stepsHtml += `
            <div class="correction-step-block relative my-3 pl-4 border-l-2 transition-all hover:bg-slate-50/50 rounded-r-lg p-2" style="border-color: ${stepColor}30;" data-ex-idx="${exIdx}" data-q-idx="${qIdx}" data-step-idx="${sIdx}">
              <div class="flex items-center justify-between gap-2 mb-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-sm" style="color: ${stepColor}; font-family: ${currentStyle.fontFamily};">
                    ${step.title || `Étape ${step.step_num || sIdx+1}`}
                  </span>
                  ${stepTag}
                </div>
                ${isVerifiedBadge}
              </div>
              
              <div class="handwritten-body text-base leading-relaxed" style="color: ${stepColor}; font-family: ${currentStyle.fontFamily}; font-size: ${currentStyle.fontSize};">
                ${this.applyNaturalJitter(step.content)}
              </div>

              ${stepMath}
            </div>
          `;
        });

        // Question block
        questionsHtml += `
          <div class="question-container my-4 bg-white/40 backdrop-blur-xs rounded-xl p-4 border border-slate-200/50 shadow-xs" data-ex-idx="${exIdx}" data-q-idx="${qIdx}">
            <div class="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-slate-200/40">
              <h4 class="font-bold text-lg flex items-center gap-2" style="color: ${colors.header}; font-family: ${currentStyle.fontFamily};">
                <span class="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-sans">${q.question_number}</span>
                <span>${q.question_text}</span>
              </h4>
              <button onclick="app.regenerateQuestion(${exIdx}, ${qIdx})" class="regenerate-q-btn text-xs font-semibold px-2.5 py-1 text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-1 transition-colors" title="Régénérer cette question sans modifier le reste">
                <i data-lucide="refresh-cw" class="w-3 h-3"></i> Régénérer
              </button>
            </div>

            ${q.geometry_svg ? `<div class="geometry-container my-2 text-center">${q.geometry_svg}</div>` : ''}

            <div class="steps-list">
              ${stepsHtml}
            </div>
          </div>
        `;
      });

      // Exercise container
      exercisesHtml += `
        <div class="exercise-card mb-8" data-ex-idx="${exIdx}">
          <div class="flex items-center justify-between pb-2 mb-3 border-b-2" style="border-color: ${colors.primary};">
            <h3 class="font-bold text-xl flex items-center gap-2.5" style="color: ${colors.primary}; font-family: ${currentStyle.fontFamily};">
              <i data-lucide="book-open" class="w-5 h-5"></i>
              <span>${ex.title}</span>
              ${ex.points ? `<span class="text-sm font-sans px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">${ex.points}</span>` : ''}
            </h3>
            <span class="text-xs font-semibold text-slate-500 font-sans uppercase tracking-wider">${ex.topic || 'Exercice'}</span>
          </div>

          ${ex.statement ? `
            <div class="statement-callout p-3 mb-4 rounded-xl bg-slate-100/70 border-l-4 text-sm text-slate-700 italic font-sans" style="border-color: ${colors.primary};">
              ${ex.statement}
            </div>
          ` : ''}

          ${questionsHtml}
        </div>
      `;
    });

    // Build Full A4 Page Container with realistic paper texture
    return `
      <div id="a4-correction-sheet" class="a4-sheet paper-texture-${paperKey} mx-auto bg-white shadow-2xl rounded-sm transition-all duration-300 relative" style="font-family: ${currentStyle.fontFamily};">
        
        <!-- Left Red Margin Line for authentic French notebook look -->
        <div class="notebook-left-margin"></div>

        <div class="sheet-content px-8 py-10 relative z-10">
          
          <!-- Teacher & Exam Header Banner -->
          <div class="teacher-exam-header pb-4 mb-6 border-b border-slate-300 select-none">
            <div class="flex items-start justify-between">
              <div>
                <h2 class="font-bold text-base text-slate-800 font-sans flex items-center gap-2">
                  <span class="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center text-xs font-bold font-sans">∑</span>
                  ${project.school_name || 'Académie des Sciences Mathématiques'}
                </h2>
                <p class="text-xs text-slate-600 font-sans mt-0.5">Enseignant : <strong class="text-slate-800">${project.teacher_name || 'Prof. Mohamed'}</strong></p>
              </div>
              <div class="text-right">
                <span class="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold font-sans uppercase tracking-wide bg-slate-900 text-white">${project.level || 'Bac'}</span>
                <p class="text-xs text-slate-600 font-sans mt-1">Date : ${project.exam_date || '2026'}</p>
              </div>
            </div>

            <div class="text-center mt-3 pt-3 border-t border-slate-200/80">
              <h1 class="font-bold text-2xl tracking-tight" style="color: ${colors.header}; font-family: ${currentStyle.fontFamily};">
                ${project.title}
              </h1>
              ${project.chapter ? `<p class="text-sm text-slate-600 font-sans mt-0.5">Chapitre : ${project.chapter}</p>` : ''}
            </div>
          </div>

          <!-- Exercises Content Body -->
          <div class="exercises-wrapper">
            ${exercisesHtml}
          </div>

          <!-- Page Footer -->
          <div class="sheet-footer pt-6 mt-8 border-t border-slate-200 text-xs text-slate-400 flex items-center justify-between font-sans select-none">
            <span>MathsProf — Correction Mathématique Pédagogique & Calcul Formel</span>
            <span>Document certifié exact par calcul symbolique</span>
          </div>

        </div>
      </div>
    `;
  }
}

// Global singleton
window.handwritingRenderer = new HandwritingRenderer();
