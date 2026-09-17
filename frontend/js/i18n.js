// Internationalization & RTL Engine for Étude Math Pro (MathsProf)
// 2026 Commercial Edition — Tunisian Academic Curriculum System

const I18n = {
  currentLang: localStorage.getItem('mathsprof_lang') || 'fr',
  listeners: [],

  // Canonical Tunisian Secondary School Levels & Sections Structure
  GRADES: ['1ère', '2ème', '3ème', 'Bac'],
  
  SECTIONS_BY_GRADE: {
    '1ère': [],
    '2ème': ['Sciences', 'Informatique', 'Économie'],
    '3ème': ['Sciences', 'Informatique', 'Économie', 'Mathématiques', 'Technique'],
    'Bac': ['Sciences', 'Informatique', 'Économie', 'Mathématiques', 'Technique']
  },

  GRADES_DICT: {
    fr: {
      '1ère': '1ère',
      '2ème': '2ème',
      '3ème': '3ème',
      'Bac': 'Bac'
    },
    ar: {
      '1ère': 'الأولى ثانوي',
      '2ème': 'الثانية ثانوي',
      '3ème': 'الثالثة ثانوي',
      'Bac': 'البكالوريا'
    }
  },

  SECTIONS_DICT: {
    fr: {
      'Sciences': 'Sciences',
      'Informatique': 'Informatique',
      'Économie': 'Économie',
      'Mathématiques': 'Mathématiques',
      'Technique': 'Technique'
    },
    ar: {
      'Sciences': 'علوم',
      'Informatique': 'إعلامية',
      'Économie': 'اقتصاد وتصرف',
      'Mathématiques': 'رياضيات',
      'Technique': 'علوم تقنية'
    }
  },

  translations: {
    fr: {
      // Branding & Common
      appName: "MathsProf",
      appSubtitle: "Gestion & Pédagogie Mathématiques",
      academicYear: "Année Scolaire",
      currency: "DT",
      currencyFullName: "Dinar Tunisien (DT)",
      save: "Enregistrer",
      cancel: "Annuler",
      delete: "Supprimer",
      edit: "Modifier",
      confirm: "Confirmer",
      loading: "Chargement...",
      searchPlaceholder: "Rechercher un élève, groupe, séance, numéro...",
      quickAction: "Action Rapide",
      logout: "Déconnexion",
      accountSettings: "Paramètres du Compte",
      all: "Tous",
      actions: "Actions",
      status: "Statut",
      notes: "Remarques & Observations",
      date: "Date",
      details: "Détails",
      close: "Fermer",
      downloadPdf: "Télécharger PDF",
      print: "Imprimer",
      filterByLevel: "Filtrer par niveau",
      filterByGroup: "Filtrer par groupe",
      filterByStatus: "Filtrer par statut",
      filterByMonth: "Filtrer par mois",
      noData: "Aucune donnée disponible pour le moment.",

      // Academic Levels & Sections
      academic_level: "Niveau scolaire",
      academic_section: "Section / Filière",
      all_levels: "Tous les niveaux",
      all_sections: "Toutes les sections",
      no_section_needed: "Tronc commun (Sans section)",
      select_grade_first: "Sélectionnez d'abord un niveau",

      // Navigation
      navDashboard: "Tableau de bord",
      navStudents: "Élèves",
      navGroups: "Groupes",
      navRepartition: "Répartition Auto",
      navPlanning: "Planning",
      navAttendance: "Présences",
      navPayments: "Paiements",
      navSettings: "Paramètres",

      // Payment Methods
      method_cash: "Espèces",
      method_transfer: "Virement bancaire",

      // Payment Statuses
      status_paid: "Payé",
      status_partial: "Partiel",
      status_unpaid: "Non payé",

      // Attendance Statuses
      att_present: "Présent",
      att_absent: "Absent",
      att_late: "En retard",

      // Session Statuses
      sess_scheduled: "Planifiée",
      sess_completed: "Terminée",
      sess_cancelled: "Annulée",

      // Dashboard
      dash_welcome: "Tableau de Bord Enseignant",
      dash_subtitle: "Vue d'ensemble de vos cours particuliers et performances",
      kpi_total_students: "Total Élèves",
      kpi_total_groups: "Groupes Actifs",
      kpi_present_today: "Présents Aujourd'hui",
      kpi_sessions_today: "Séances du Jour",
      kpi_collected_month: "Encaissé ce Mois",
      kpi_expected_month: "Attendu ce Mois",
      kpi_pending_payments: "Paiements en Attente",
      dash_today_schedule: "Séances d'Aujourd'hui",
      dash_no_sessions_today: "Aucune séance programmée aujourd'hui. Profitez de votre journée !",
      dash_level_repartition: "Répartition par Niveau & Section",
      dash_revenue_overview: "Aperçu Financier",
      dash_alerts_title: "Alertes & Notifications Internes",
      dash_quick_add_student: "Ajouter Élève",
      dash_quick_add_group: "Créer Groupe",
      dash_quick_add_session: "Planifier Séance",
      dash_quick_add_payment: "Saisir Paiement",

      // Students
      students_title: "Gestion des Élèves",
      students_subtitle: "Liste complète des élèves inscrits et suivi personnalisé",
      add_student: "Ajouter un Élève",
      edit_student: "Modifier l'Élève",
      student_code: "Code Élève",
      student_firstName: "Prénom",
      student_lastName: "Nom",
      student_phone: "Téléphone Élève",
      parent_phone: "Téléphone Parent",
      monthly_price: "Tarif Mensuel",
      assigned_group: "Groupe Assigné",
      no_group: "Sans groupe",
      attendance_rate: "Taux de présence",
      payment_status: "Statut de paiement",
      students: "Élèves",
      all_students: "Tous les élèves",

      // Groups
      groups_title: "Gestion des Groupes & Classes",
      groups_subtitle: "Organisation des effectifs, plannings et capacités",
      add_group: "Créer un Groupe",
      edit_group: "Modifier le Groupe",
      group_name: "Nom du Groupe",
      group_level: "Niveau & Section",
      max_capacity: "Capacité Maximale",
      schedule_day: "Jour de séance",
      schedule_time: "Heure de séance",
      group_color: "Couleur distinctive",
      group_students_count: "Effectif",
      group_full: "Complet",
      group_available_seats: "places disponibles",

      // Smart Repartition
      repartition_title: "Répartition Automatique Intelligente",
      repartition_subtitle: "Optimisation de la taille des groupes par niveau et filière",
      run_repartition: "Lancer la Répartition Intelligente",
      apply_repartition: "Appliquer la Répartition",
      repartition_success: "Répartition appliquée avec succès !",
      unassigned_students: "Élèves non assignés",

      // Planning & Sessions
      planning_title: "Planning & Emploi du Temps",
      planning_subtitle: "Organisation hebdomadaire des séances et détection des conflits",
      add_session: "Ajouter une Séance",
      edit_session: "Modifier la Séance",
      session_date: "Date",
      session_time: "Horaire",
      session_group: "Groupe",
      session_topic: "Sujet / Chapitre",
      session_location: "Salle / Lieu",
      today: "Aujourd'hui",
      day_view: "Jour",
      week_view: "Semaine",
      month_view: "Mois",
      list_view: "Liste",
      conflict_detected: "Conflit d'horaire détecté",
      conflict_warning: "Deux séances se chevauchent sur ce créneau.",

      // Attendance
      attendance: "Présences",
      mark_all_present: "Tout le monde présent",
      present: "Présent",
      absent: "Absent",
      late: "Retard",
      session: "Séance",
      topic: "Sujet abordé",
      save_attendance: "Enregistrer les Présences",
      choose_session: "Choisir une séance à pointer",
      all_present_success: "Tous les élèves ont été marqués présents !",
      attendance_saved: "Feuille de présence enregistrée avec succès !",

      // Payments
      payments: "Paiements & Finances",
      add_payment: "Enregistrer un Paiement",
      paid: "Réglé",
      partial: "Partiel",
      unpaid: "Impayé",
      especes: "Espèces (Cash)",
      virement: "Virement bancaire",
      all_months: "Tous les mois",
      all_statuses: "Tous les statuts",
      receipt: "Reçu de Paiement",
      receipt_number: "N° Reçu",
      pdf_report: "Rapport PDF Mensuel",
      total_collected: "Encaissé ce mois",
      expected_revenue: "Revenu Attendu",
      remaining_due: "Reste à Recouvrer",
      unpaid_students: "Paiements en Retard",

      // Settings
      profile: "Profil Enseignant",
      settings_display: "Langue & Affichage",
      settings_backup: "Sauvegardes",
      export_backup: "Télécharger ma sauvegarde (JSON)",
      import_backup: "Restaurer une sauvegarde (JSON)",
      clean_database: "Nettoyer la base (Base Vierge)",

      // Login
      login_title: "Espace Enseignant",
      login_subtitle: "Connectez-vous à votre plateforme de gestion des cours",
      login_email: "Adresse Email",
      login_password: "Mot de Passe",
      login_submit: "Se Connecter",
      login_tab_login: "Connexion",
      login_tab_register: "Nouveau Compte",
      reg_submit: "Créer mon Compte Enseignant",
      reg_title: "Créer un nouveau compte enseignant"
    },

    ar: {
      // Branding & Common
      appName: "MathsProf",
      appSubtitle: "إدارة الدروس الخصوصية والعمل البيداغوجي",
      academicYear: "السنة الدراسية",
      currency: "DT",
      currencyFullName: "دينار تونسي (د.ت)",
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      edit: "تعديل",
      confirm: "تأكيد",
      loading: "جاري التحميل...",
      searchPlaceholder: "بحث عن تلميذ، فوج، حصة، رقم هاتف...",
      quickAction: "إجراء سريع",
      logout: "تسجيل الخروج",
      accountSettings: "إعدادات الحساب",
      all: "الكل",
      actions: "إجراءات",
      status: "الحالة",
      notes: "ملاحظات وتوجيهات",
      date: "التاريخ",
      details: "التفاصيل",
      close: "إغلاق",
      downloadPdf: "تحميل PDF",
      print: "طباعة",
      filterByLevel: "تصفية حسب المستوى",
      filterByGroup: "تصفية حسب الفوج",
      filterByStatus: "تصفية حسب الحالة",
      filterByMonth: "تصفية حسب الشهر",
      noData: "لا توجد بيانات متوفرة حالياً.",

      // Academic Levels & Sections
      academic_level: "المستوى الدراسي",
      academic_section: "الشعبة / التخصص",
      all_levels: "جميع المستويات",
      all_sections: "جميع الشعب",
      no_section_needed: "جذع مشترك (بدون شعبة)",
      select_grade_first: "اختر المستوى أولاً",

      // Navigation
      navDashboard: "لوحة القيادة",
      navStudents: "التلاميذ",
      navGroups: "الأفواج",
      navRepartition: "توزيع ذكي",
      navPlanning: "جدول الأوقات",
      navAttendance: "تسجيل الحضور",
      navPayments: "المدفوعات",
      navSettings: "الإعدادات",

      // Payment Methods
      method_cash: "نقداً (كاش)",
      method_transfer: "تحويل بنكي",

      // Payment Statuses
      status_paid: "خالص",
      status_partial: "خالص جزئياً",
      status_unpaid: "غير خالص",

      // Attendance Statuses
      att_present: "حاضر",
      att_absent: "غائب",
      att_late: "متأخر",

      // Session Statuses
      sess_scheduled: "مبرمجة",
      sess_completed: "مكتملة",
      sess_cancelled: "ملغاة",

      // Dashboard
      dash_welcome: "لوحة القيادة للأستاذ",
      dash_subtitle: "نظرة شاملة ومفصلة على الدروس الخصوصية والمداخيل",
      kpi_total_students: "مجموع التلاميذ",
      kpi_total_groups: "الأفواج النشطة",
      kpi_present_today: "الحاضرون اليوم",
      kpi_sessions_today: "حصص اليوم",
      kpi_collected_month: "المستخلص هذا الشهر",
      kpi_expected_month: "المتوقع هذا الشهر",
      kpi_pending_payments: "المتخلدات بالذمة",
      dash_today_schedule: "حصص اليوم",
      dash_no_sessions_today: "لا توجد حصص مبرمجة لليوم. نتمنى لك يوماً طيباً !",
      dash_level_repartition: "التوزيع حسب المستوى والشعبة",
      dash_revenue_overview: "المؤشرات المالية",
      dash_alerts_title: "التنبيهات والملاحظات",
      dash_quick_add_student: "إضافة تلميذ",
      dash_quick_add_group: "إنشاء فوج",
      dash_quick_add_session: "برمجة حصة",
      dash_quick_add_payment: "تسجيل خلاص",

      // Students
      students_title: "قائمة التلاميذ",
      students_subtitle: "متابعة شاملة لملفات التلاميذ والاشتراكات الشهرية",
      add_student: "إضافة تلميذ جديد",
      edit_student: "تعديل بيانات التلميذ",
      student_code: "رمز التلميذ",
      student_firstName: "الاسم",
      student_lastName: "اللقب",
      student_phone: "هاتف التلميذ",
      parent_phone: "هاتف الولي",
      monthly_price: "المعلوم الشهري",
      assigned_group: "الفوج المنتمي إليه",
      no_group: "بدون فوج",
      attendance_rate: "نسبة الحضور",
      payment_status: "حالة الخلاص",
      students: "تلاميذ",
      all_students: "جميع التلاميذ",

      // Groups
      groups_title: "إدارة الأفواج والصفوف",
      groups_subtitle: "تنظيم الطاقة الاستيعابية ومواعيد الحصص الأسبوعية",
      add_group: "إنشاء فوج جديد",
      edit_group: "تعديل الفوج",
      group_name: "اسم الفوج",
      group_level: "المستوى والشعبة",
      max_capacity: "طاقة الاستيعاب القصوى",
      schedule_day: "يوم الحصة",
      schedule_time: "توقيت الحصة",
      group_color: "لون الفوج",
      group_students_count: "عدد التلاميذ",
      group_full: "مكتمل",
      group_available_seats: "أماكن شاغرة",

      // Smart Repartition
      repartition_title: "التوزيع الآلي الذكي للتلاميذ",
      repartition_subtitle: "موازنة وتوزيع التلاميذ في الأفواج حسب المستوى والشعبة",
      run_repartition: "تشغيل خوارزمية التوزيع",
      apply_repartition: "تطبيق التوزيع على الأفواج",
      repartition_success: "تم تطبيق التوزيع بنجاح على قاعدة البيانات !",
      unassigned_students: "تلاميذ غير مخصصين",

      // Planning & Sessions
      planning_title: "جدول الأوقات والحصص",
      planning_subtitle: "برمجة الحصص الأسبوعية ومتابعة قاعات التدريس",
      add_session: "برمجة حصة جديدة",
      edit_session: "تعديل الحصة",
      session_date: "التاريخ",
      session_time: "التوقيت",
      session_group: "الفوج",
      session_topic: "الموضوع / الدرس",
      session_location: "القاعة",
      today: "اليوم",
      day_view: "يوم",
      week_view: "أسبوع",
      month_view: "شهر",
      list_view: "قائمة",
      conflict_detected: "تعارض في التوقيت",
      conflict_warning: "يوجد تداخل بين حصتين في نفس التوقيت والقاعة.",

      // Attendance
      attendance: "تسجيل الحضور",
      mark_all_present: "الجميع حاضرون",
      present: "حاضر",
      absent: "غائب",
      late: "متأخر",
      session: "الحصة",
      topic: "الموضوع المنجز",
      save_attendance: "حفظ ورقة الحضور",
      choose_session: "اختر الحصة للتسجيل",
      all_present_success: "تم تسجيل جميع التلاميذ كحاضرين !",
      attendance_saved: "تم حفظ ورقة الحضور بنجاح في المنظومة !",

      // Payments
      payments: "المستحقات والمدفوعات",
      add_payment: "تسجيل دفعة جديدة",
      paid: "خالص",
      partial: "خالص جزئياً",
      unpaid: "غير خالص",
      especes: "نقداً (كاش)",
      virement: "تحويل بنكي",
      all_months: "كل الأشهر",
      all_statuses: "كل الحالات",
      receipt: "وصل خلاص",
      receipt_number: "رقم الوصل",
      pdf_report: "تقرير مالي PDF",
      total_collected: "المدخول هذا الشهر",
      expected_revenue: "المدخول المتوقع",
      remaining_due: "المتبقي للاستخلاص",
      unpaid_students: "مدفوعات متأخرة",

      // Settings
      profile: "الملف الشخصي للأستاذ",
      settings_display: "اللغة والعرض",
      settings_backup: "النسخ الاحتياطي",
      export_backup: "تصدير نسخة احتياطية (JSON)",
      import_backup: "استرجاع نسخة احتياطية (JSON)",
      clean_database: "قاعدة بيانات فارغة (0 تلاميذ)",

      // Login
      login_title: "فضاء الأستاذ",
      login_subtitle: "تسجيل الدخول إلى منظومة إدارة الدروس والدروس الخصوصية",
      login_email: "البريد الإلكتروني",
      login_password: "كلمة المرور",
      login_submit: "تسجيل الدخول",
      login_tab_login: "تسجيل الدخول",
      login_tab_register: "حساب جديد",
      reg_submit: "إنشاء حساب أستاذ",
      reg_title: "إنشاء حساب أستاذ جديد"
    }
  },

  init() {
    this.applyLanguage(this.currentLang);
  },

  t(key, fallback = '') {
    const langDict = this.translations[this.currentLang] || this.translations.fr;
    return langDict[key] || this.translations.fr[key] || fallback || key;
  },

  // --- Academic Levels & Sections Helpers ---

  /**
   * Parse any level string into canonical { grade, section, full }
   * Examples:
   * "2ème — Informatique" -> { grade: "2ème", section: "Informatique", full: "2ème — Informatique" }
   * "Bac Sciences" -> { grade: "Bac", section: "Sciences", full: "Bac — Sciences" }
   * "1ère" -> { grade: "1ère", section: null, full: "1ère" }
   */
  parseLevel(rawLevel) {
    if (!rawLevel) return { grade: 'Bac', section: 'Mathématiques', full: 'Bac — Mathématiques' };
    let s = String(rawLevel).trim();

    // Check for 1ère
    if (s.startsWith('1') || s.toLowerCase().includes('1ère') || s.toLowerCase().includes('1ere') || s.toLowerCase().includes('9ème')) {
      return { grade: '1ère', section: null, full: '1ère' };
    }

    // Determine grade
    let grade = 'Bac';
    if (s.startsWith('2') || s.toLowerCase().includes('2ème') || s.toLowerCase().includes('2eme')) {
      grade = '2ème';
    } else if (s.startsWith('3') || s.toLowerCase().includes('3ème') || s.toLowerCase().includes('3eme')) {
      grade = '3ème';
    } else if (s.toLowerCase().includes('bac')) {
      grade = 'Bac';
    }

    // Determine section
    const sLower = s.toLowerCase();
    let section = 'Sciences';
    if (sLower.includes('info')) {
      section = 'Informatique';
    } else if (sLower.includes('éco') || sLower.includes('eco')) {
      section = 'Économie';
    } else if (sLower.includes('math')) {
      section = 'Mathématiques';
    } else if (sLower.includes('tech')) {
      section = 'Technique';
    } else if (sLower.includes('sc')) {
      section = 'Sciences';
    } else {
      // Default available section for that grade
      const allowed = this.SECTIONS_BY_GRADE[grade] || [];
      section = allowed.length > 0 ? allowed[0] : null;
    }

    // Ensure section is valid for this grade
    const allowedSections = this.SECTIONS_BY_GRADE[grade] || [];
    if (allowedSections.length > 0 && !allowedSections.includes(section)) {
      section = allowedSections[0];
    }

    const full = section ? `${grade} — ${section}` : grade;
    return { grade, section, full };
  },

  /**
   * Format Grade and Section into standard canonical string
   */
  formatLevel(grade, section) {
    if (!grade || grade === '1ère') return '1ère';
    if (!section) {
      const def = (this.SECTIONS_BY_GRADE[grade] || [])[0];
      return def ? `${grade} — ${def}` : grade;
    }
    return `${grade} — ${section}`;
  },

  /**
   * Return fully translated label in current language
   * e.g. "الثانية ثانوي — إعلامية" or "2ème — Informatique"
   */
  getLevelLabel(rawLevel) {
    const { grade, section } = this.parseLevel(rawLevel);
    const lang = this.currentLang === 'ar' ? 'ar' : 'fr';
    const gradeText = this.GRADES_DICT[lang][grade] || grade;

    if (grade === '1ère' || !section) {
      return gradeText;
    }

    const sectionText = this.SECTIONS_DICT[lang][section] || section;
    return `${gradeText} — ${sectionText}`;
  },

  getGradeLabel(grade) {
    const lang = this.currentLang === 'ar' ? 'ar' : 'fr';
    return this.GRADES_DICT[lang][grade] || grade;
  },

  getSectionLabel(section) {
    const lang = this.currentLang === 'ar' ? 'ar' : 'fr';
    return this.SECTIONS_DICT[lang][section] || section;
  },

  /**
   * Generates HTML for the 2-step dependent Level & Section selectors
   */
  renderLevelSelectorsHTML(options = {}) {
    const {
      gradeId = 'form-grade-select',
      sectionId = 'form-section-select',
      sectionWrapperId = 'form-section-wrapper',
      initialLevel = 'Bac — Mathématiques',
      isCompact = false
    } = options;

    const { grade, section } = this.parseLevel(initialLevel);
    const isAr = this.currentLang === 'ar';

    return `
      <div class="grid grid-cols-1 ${isCompact ? 'sm:grid-cols-2' : 'sm:grid-cols-2'} gap-3" id="level-selectors-container">
        <!-- Step 1: Grade Select -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
            <i data-lucide="graduation-cap" class="w-3.5 h-3.5 text-brand-600"></i>
            <span>${this.t('academic_level')} *</span>
          </label>
          <select id="${gradeId}" required class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 bg-white font-bold text-slate-800 shadow-xs">
            ${this.GRADES.map(g => `
              <option value="${g}" ${g === grade ? 'selected' : ''}>
                ${this.getGradeLabel(g)}
              </option>
            `).join('')}
          </select>
        </div>

        <!-- Step 2: Dependent Section Select -->
        <div id="${sectionWrapperId}" class="${grade === '1ère' ? 'opacity-50 pointer-events-none' : ''}">
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
            <i data-lucide="git-branch" class="w-3.5 h-3.5 text-indigo-600"></i>
            <span>${this.t('academic_section')} *</span>
          </label>
          <select id="${sectionId}" class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 bg-white font-bold text-indigo-900 shadow-xs">
            <!-- Dynamically populated -->
          </select>
          <p id="${sectionWrapperId}-hint" class="text-[10px] text-slate-400 mt-1 ${grade === '1ère' ? '' : 'hidden'}">
            ${this.t('no_section_needed')}
          </p>
        </div>
      </div>
    `;
  },

  /**
   * Binds change events for the 2-step dependent dropdowns
   */
  bindLevelSelectors(options = {}) {
    const {
      container,
      gradeId = 'form-grade-select',
      sectionId = 'form-section-select',
      sectionWrapperId = 'form-section-wrapper',
      initialLevel = 'Bac — Mathématiques',
      onChange = null
    } = options;

    if (!container) return;

    const gradeSelect = container.querySelector(`#${gradeId}`);
    const sectionSelect = container.querySelector(`#${sectionId}`);
    const sectionWrapper = container.querySelector(`#${sectionWrapperId}`);
    const sectionHint = container.querySelector(`#${sectionWrapperId}-hint`);

    if (!gradeSelect || !sectionSelect) return;

    const parsed = this.parseLevel(initialLevel);
    gradeSelect.value = parsed.grade;

    const updateSectionsDropdown = (selectedGrade, desiredSection = null) => {
      const sections = this.SECTIONS_BY_GRADE[selectedGrade] || [];
      
      if (selectedGrade === '1ère' || sections.length === 0) {
        sectionSelect.innerHTML = `<option value="">${this.t('no_section_needed')}</option>`;
        if (sectionWrapper) {
          sectionWrapper.classList.add('opacity-50', 'pointer-events-none');
        }
        if (sectionHint) sectionHint.classList.remove('hidden');
      } else {
        if (sectionWrapper) {
          sectionWrapper.classList.remove('opacity-50', 'pointer-events-none');
        }
        if (sectionHint) sectionHint.classList.add('hidden');

        sectionSelect.innerHTML = sections.map(sec => `
          <option value="${sec}" ${desiredSection === sec ? 'selected' : ''}>
            ${this.getSectionLabel(sec)}
          </option>
        `).join('');

        if (desiredSection && sections.includes(desiredSection)) {
          sectionSelect.value = desiredSection;
        } else {
          sectionSelect.value = sections[0];
        }
      }

      if (onChange) {
        onChange(this.formatLevel(selectedGrade, sectionSelect.value));
      }
    };

    // Initial populate
    updateSectionsDropdown(parsed.grade, parsed.section);

    // On Grade change
    gradeSelect.addEventListener('change', (e) => {
      updateSectionsDropdown(e.target.value);
    });

    // On Section change
    sectionSelect.addEventListener('change', () => {
      if (onChange) {
        onChange(this.formatLevel(gradeSelect.value, sectionSelect.value));
      }
    });

    return {
      getSelectedLevel: () => this.formatLevel(gradeSelect.value, sectionSelect.value),
      setGradeAndSection: (g, s) => {
        gradeSelect.value = g;
        updateSectionsDropdown(g, s);
      }
    };
  },

  getPaymentMethodLabel(method) {
    const val = (method || '').toLowerCase();
    if (val.includes('vir')) return this.t('method_transfer');
    return this.t('method_cash');
  },

  getPaymentStatusLabel(status) {
    if (status === 'paid') return this.t('status_paid');
    if (status === 'partial') return this.t('status_partial');
    return this.t('status_unpaid');
  },

  getAttendanceStatusLabel(status) {
    if (status === 'present') return this.t('att_present');
    if (status === 'late') return this.t('att_late');
    return this.t('att_absent');
  },

  setLanguage(lang) {
    if (lang !== 'fr' && lang !== 'ar') return;
    this.currentLang = lang;
    localStorage.setItem('mathsprof_lang', lang);
    this.applyLanguage(lang);
    this.notify();

    // Re-render current route
    if (window.app && window.app.handleRoute) {
      window.app.handleRoute();
    }
  },

  applyLanguage(lang) {
    const htmlEl = document.documentElement;
    const isRtl = lang === 'ar';
    htmlEl.lang = lang;
    htmlEl.dir = isRtl ? 'rtl' : 'ltr';

    if (isRtl) {
      document.body.classList.add('font-arabic', 'rtl-mode');
    } else {
      document.body.classList.remove('font-arabic', 'rtl-mode');
    }

    // Update active state in language pickers
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      btn.classList.toggle('active-lang', btnLang === lang);
    });
  },

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  notify() {
    this.listeners.forEach(cb => {
      try { cb(this.currentLang); } catch (e) { console.error(e); }
    });
  }
};

window.I18n = I18n;
