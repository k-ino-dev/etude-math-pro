// Internationalization & RTL Engine for Étude Math Pro (MathsProf)
const I18n = {
  currentLang: localStorage.getItem('mathsprof_lang') || 'fr',
  listeners: [],

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

      // Navigation
      navDashboard: "Tableau de bord",
      navStudents: "Élèves",
      navGroups: "Groupes",
      navRepartition: "Répartition Auto",
      navPlanning: "Planning",
      navAttendance: "Présences",
      navPayments: "Paiements",
      navSettings: "Paramètres",

      // Levels
      level_1ere: "1ère",
      level_2eme: "2ème",
      level_3eme: "3ème",
      level_Bac: "Bac",

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
      dash_level_repartition: "Répartition par Niveau",
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
      student_level: "Niveau Scolaire",
      student_group: "Groupe Assigné",
      student_noGroup: "Sans groupe",
      student_phone: "Téléphone Élève",
      student_fatherPhone: "Téléphone Père",
      student_motherPhone: "Téléphone Mère",
      student_monthlyPrice: "Tarif Mensuel (DT)",
      student_registrationDate: "Date d'Inscription",
      student_attendanceRate: "Taux Présence",
      student_paymentStatus: "Statut Mois",
      student_call: "Appeler",
      student_viewDetail: "Fiche Complète",
      student_delete_confirm: "Êtes-vous sûr de vouloir supprimer cet élève ? Toutes ses présences et paiements seront effacés.",

      // Student Detail
      detail_back: "Retour à la liste des élèves",
      detail_overview: "Fiche Élève & Historique Pédagogique",
      detail_attendance_tab: "Historique des Présences",
      detail_payments_tab: "Historique des Règlements",
      detail_pedagogical_notes: "Observations & Remarques du Professeur",
      detail_add_note: "Ajouter une observation",
      detail_note_placeholder: "Notez les points forts, lacunes, devoirs non faits, notes de contrôle...",
      detail_total_paid: "Total cotisations versées",

      // Groups
      groups_title: "Groupes & Horaires",
      groups_subtitle: "Organisation des classes, salles et créneaux horaires",
      add_group: "Créer un Groupe",
      edit_group: "Modifier le Groupe",
      group_name: "Nom du Groupe",
      group_capacity: "Capacité Maximale",
      group_schedule: "Horaire Hebdomadaire",
      group_location: "Salle / Emplacement",
      group_students_count: "Effectif",
      group_full_badge: "Complet",
      group_day_of_week: "Jour de la semaine",
      group_start_time: "Heure de Début",
      group_end_time: "Heure de Fin",
      group_color: "Couleur d'identification",
      group_delete_confirm: "Êtes-vous sûr de vouloir supprimer ce groupe ? Les élèves seront désassignés mais conservés.",

      // Repartition
      repart_title: "Répartition Intelligente des Élèves",
      repart_subtitle: "Équilibrage automatique des effectifs par niveau et capacité de groupe",
      repart_select_level: "Choisir le niveau à équilibrer",
      repart_target_capacity: "Capacité cible par groupe",
      repart_run_btn: "Calculer la répartition optimale",
      repart_apply_btn: "Appliquer la répartition aux élèves",
      repart_drag_instruction: "Vous pouvez glisser-déposer ou réassigner les élèves entre les groupes avant d'appliquer.",
      repart_success: "Répartition appliquée avec succès !",

      // Planning
      planning_title: "Planning & Calendrier des Séances",
      planning_subtitle: "Gestion de l'agenda avec détection automatique des conflits d'horaires",
      add_session: "Ajouter une Séance",
      edit_session: "Modifier la Séance",
      session_topic: "Thème / Chapitre du cours",
      session_conflict_warning: "Attention : Ce créneau chevauche une autre séance existante sur la même salle !",
      session_force_conflict: "Forcer la création malgré le chevauchement",
      planning_export_pdf: "Exporter PDF du Planning",
      planning_today_btn: "Aujourd'hui",

      // Attendance
      att_title: "Feuille de Présences",
      att_subtitle: "Pointage rapide des présences pour chaque séance de cours",
      att_select_session: "Sélectionnez une séance :",
      att_mark_all_present: "Tous Présents (1 Clic)",
      att_save_success: "Présences enregistrées avec succès !",
      att_no_students: "Aucun élève dans ce groupe pour cette séance.",

      // Payments
      pay_title: "Gestion des Paiements & Cotisations",
      pay_subtitle: "Suivi des encaissements, matrice annuelle et génération de reçus officiels",
      add_payment: "Enregistrer un Paiement",
      pay_matrix_tab: "Matrice Annuelle (Vue Globale)",
      pay_list_tab: "Journal des Transactions",
      pay_receipt: "Reçu de Paiement",
      pay_receipt_number: "Reçu N°",
      pay_amount: "Montant Versé (DT)",
      pay_method: "Mode de Paiement",
      pay_month: "Mois Concerné",
      pay_generate_receipt: "Générer Reçu PDF",
      pay_remaining_due: "Reste dû",

      // Settings
      settings_title: "Paramètres & Sécurité",
      settings_subtitle: "Configuration de votre profil enseignant, devise DT et sauvegardes",
      settings_profile_tab: "Profil Enseignant",
      settings_backup_tab: "Sauvegardes & Restauration",
      settings_teacher_name: "Nom complet du Professeur",
      settings_teacher_email: "Adresse Email",
      settings_teacher_phone: "Numéro de Téléphone (Appels)",
      settings_teacher_avatar: "Avatar / Photo de Profil",
      settings_school_year: "Année Scolaire en cours",
      settings_save_profile: "Mettre à jour le profil",
      settings_export_btn: "Télécharger Sauvegarde Complète (JSON)",
      settings_import_btn: "Restaurer depuis une sauvegarde (JSON)",
      settings_clear_data_btn: "Réinitialiser les données (Remise à zéro)",
      settings_clear_confirm: "ATTENTION : Voulez-vous vraiment effacer tous les élèves, groupes, séances et paiements ? Cette action est irréversible !",
      settings_language_label: "Langue de l'interface",

      // Auth / Login
      login_title: "Connexion Enseignant",
      login_subtitle: "Plateforme de gestion pour tuteurs de mathématiques en Tunisie",
      login_email: "Email Professionnel",
      login_password: "Mot de passe",
      login_remember: "Se souvenir de moi",
      login_submit: "Se connecter",
      login_tab_login: "Connexion",
      login_tab_register: "Créer un compte",
      reg_submit: "Créer mon compte Enseignant",
      reg_title: "Création de compte Enseignant",
    },

    ar: {
      // Branding & Common
      appName: "MathsProf",
      appSubtitle: "إدارة ومتابعة دروس الرياضيات الخصوصية",
      academicYear: "السنة الدراسية",
      currency: "د.ت",
      currencyFullName: "الدينار التونسي (د.ت)",
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      edit: "تعديل",
      confirm: "تأكيد",
      loading: "جاري التحميل...",
      searchPlaceholder: "ابحث عن طالب، فوج، حصة، هاتف...",
      quickAction: "إجراء سريع",
      logout: "تسجيل الخروج",
      accountSettings: "إعدادات الحساب",
      all: "الكل",
      actions: "العمليات",
      status: "الحالة",
      notes: "ملاحظات ومتابعة",
      date: "التاريخ",
      details: "التفاصيل",
      close: "إغلاق",
      downloadPdf: "تحميل PDF",
      print: "طباعة",
      filterByLevel: "تصفية حسب المستوى",
      filterByGroup: "تصفية حسب الفوج",
      filterByStatus: "تصفية حسب الحالة",
      filterByMonth: "تصفية حسب الشهر",
      noData: "لا توجد بيانات متاحة حالياً.",

      // Navigation
      navDashboard: "لوحة التحكم",
      navStudents: "الطلاب",
      navGroups: "الأفواج",
      navRepartition: "التوزيع الذكي",
      navPlanning: "الجدول الزمني",
      navAttendance: "تسجيل الحضور",
      navPayments: "الاستخلاص والمدفوعات",
      navSettings: "الإعدادات",

      // Levels
      level_1ere: "الأولى ثانوي",
      level_2eme: "الثانية ثانوي",
      level_3eme: "الثالثة ثانوي",
      level_Bac: "الباكالوريا",

      // Payment Methods
      method_cash: "نقداً",
      method_transfer: "تحويل بنكي",

      // Payment Statuses
      status_paid: "خالص (مدفوع)",
      status_partial: "دفع جزئي",
      status_unpaid: "غير خالص",

      // Attendance Statuses
      att_present: "حاضر",
      att_absent: "غائب",
      att_late: "متأخر",

      // Session Statuses
      sess_scheduled: "مبرمجة",
      sess_completed: "منجزة",
      sess_cancelled: "ملغاة",

      // Dashboard
      dash_welcome: "لوحة تحكم الأستاذ",
      dash_subtitle: "نظرة شاملة على أفواج الدروس الخصوصية والأداء العام",
      kpi_total_students: "إجمالي الطلاب",
      kpi_total_groups: "الأفواج النشطة",
      kpi_present_today: "الحضور اليوم",
      kpi_sessions_today: "حصص اليوم",
      kpi_collected_month: "المستخلص هذا الشهر",
      kpi_expected_month: "المتوقع هذا الشهر",
      kpi_pending_payments: "المستحقات غير المدفوعة",
      dash_today_schedule: "حصص هذا اليوم",
      dash_no_sessions_today: "لا توجد حصص مبرمجة لليوم. يوم عطلة موفق !",
      dash_level_repartition: "توزيع الطلاب حسب المستوى",
      dash_revenue_overview: "المؤشرات المالية",
      dash_alerts_title: "تنبيهات وملاحظات هامة",
      dash_quick_add_student: "إضافة طالب",
      dash_quick_add_group: "إنشاء فوج",
      dash_quick_add_session: "برمجة حصة",
      dash_quick_add_payment: "تسجيل دفع",

      // Students
      students_title: "إدارة الطلاب",
      students_subtitle: "قائمة الطلاب المسجلين والمتابعة البيداغوجية الفردية",
      add_student: "إضافة طالب جديد",
      edit_student: "تعديل بيانات الطالب",
      student_code: "رمز الطالب",
      student_firstName: "الاسم",
      student_lastName: "اللقب",
      student_level: "المستوى الدراسي",
      student_group: "الفوج",
      student_noGroup: "بدون فوج",
      student_phone: "هاتف الطالب",
      student_fatherPhone: "هاتف الولي (الأب)",
      student_motherPhone: "هاتف الولي (الأم)",
      student_monthlyPrice: "المعلوم الشهري (د.ت)",
      student_registrationDate: "تاريخ التسجيل",
      student_attendanceRate: "نسبة الحضور",
      student_paymentStatus: "حالة الشهر",
      student_call: "اتصال",
      student_viewDetail: "الملف الكامل",
      student_delete_confirm: "هل أنت متأكد من حذف هذا الطالب ؟ سيتم حذف جميع سجلات حضوره ومدفوعاته.",

      // Student Detail
      detail_back: "العودة إلى قائمة الطلاب",
      detail_overview: "الملف البيداغوجي والمتابعة الفردية",
      detail_attendance_tab: "سجل الحضور والغيابات",
      detail_payments_tab: "سجل الخلاص والاشتراكات",
      detail_pedagogical_notes: "ملاحظات وتقييمات الأستاذ",
      detail_add_note: "إضافة ملاحظة جديدة",
      detail_note_placeholder: "اكتب ملاحظات حول المستوى، النقائص، الفروض، الواجبات المنزلية...",
      detail_total_paid: "إجمالي المبالغ المدفوعة",

      // Groups
      groups_title: "الأفواج والتوقيت",
      groups_subtitle: "تنظيم الأفواج، القاعات والمواعيد الأسبوعية",
      add_group: "إنشاء فوج جديد",
      edit_group: "تعديل بيانات الفوج",
      group_name: "اسم الفوج",
      group_capacity: "طاقة الاستيعاب القصوى",
      group_schedule: "التوقيت الأسبوعي",
      group_location: "القاعة / المقر",
      group_students_count: "العدد الحالي",
      group_full_badge: "مكتمل",
      group_day_of_week: "يوم الأسبوع",
      group_start_time: "وقت البداية",
      group_end_time: "وقت النهاية",
      group_color: "لون التمييز",
      group_delete_confirm: "هل أنت متأكد من حذف هذا الفوج ؟ سيبقى الطلاب مسجلين بدون فوج.",

      // Repartition
      repart_title: "التوزيع الذكي للطلاب",
      repart_subtitle: "موازنة وتوزيع الطلاب آلياً حسب المستوى وطاقة استيعاب الأفواج",
      repart_select_level: "اختر المستوى المراد توزيعه",
      repart_target_capacity: "العدد المستهدف في كل فوج",
      repart_run_btn: "احتساب التوزيع الأمثل",
      repart_apply_btn: "اعتماد التوزيع ونقل الطلاب",
      repart_drag_instruction: "يمكنك سحب الطلاب وتعديل توزيعهم يدوياً قبل الاعتماد النهائي.",
      repart_success: "تم تطبيق التوزيع بنجاح !",

      // Planning
      planning_title: "الجدول الزمني والحصص",
      planning_subtitle: "إدارة المواعيد مع الكشف الآلي عن تداخل الأوقات",
      add_session: "إضافة حصة",
      edit_session: "تعديل الحصة",
      session_topic: "موضوع الحصة / الدرس",
      session_conflict_warning: "تنبيه : هذا التوقيت يتعارض مع حصة أخرى في نفس القاعة !",
      session_force_conflict: "تأكيد الإضافة رغم التعارض",
      planning_export_pdf: "استخراج جدول الحصص PDF",
      planning_today_btn: "اليوم",

      // Attendance
      att_title: "سجل حضور الحصص",
      att_subtitle: "تسجيل فوري وسريع لحضور الطلاب في كل حصة",
      att_select_session: "اختر الحصة المبرمجة :",
      att_mark_all_present: "الجميع حاضرون (ضغطة واحدة)",
      att_save_success: "تم حفظ سجل الحضور بنجاح !",
      att_no_students: "لا يوجد طلاب مسجلون في هذا الفوج.",

      // Payments
      pay_title: "استخلاص الاشتراكات والمدفوعات",
      pay_subtitle: "متابعة المداخيل، الجدول السنوي الشامل وطباعة وصولات الخلاص",
      add_payment: "تسجيل عملية دفع",
      pay_matrix_tab: "الجدول السنوي الشامل",
      pay_list_tab: "سجل المعاملات",
      pay_receipt: "وصل خلاص",
      pay_receipt_number: "وصل رقم",
      pay_amount: "المبلغ المدفوع (د.ت)",
      pay_method: "طريقة الخلاص",
      pay_month: "الشهر المعني",
      pay_generate_receipt: "استخراج وصل خلاص PDF",
      pay_remaining_due: "المتبقي",

      // Settings
      settings_title: "الإعدادات والأمان",
      settings_subtitle: "بيانات حساب الأستاذ، العملة التونسية والنسخ الاحتياطي",
      settings_profile_tab: "بيانات الأستاذ",
      settings_backup_tab: "النسخ الاحتياطي والاستعادة",
      settings_teacher_name: "اسم ولقب الأستاذ",
      settings_teacher_email: "البريد الإلكتروني",
      settings_teacher_phone: "رقم الهاتف للاتصال",
      settings_teacher_avatar: "الصورة الرمزية",
      settings_school_year: "السنة الدراسية الحالية",
      settings_save_profile: "تحديث البيانات",
      settings_export_btn: "تحميل نسخة احتياطية كاملة (JSON)",
      settings_import_btn: "استعادة البيانات من ملف (JSON)",
      settings_clear_data_btn: "تفريغ قاعدة البيانات (تصفير شامل)",
      settings_clear_confirm: "تحذير شديد : هل أنت متأكد من مسح جميع الطلاب والأفواج والحصص ؟ لا يمكن التراجع عن هذا الإجراء !",
      settings_language_label: "لغة الواجهة",

      // Auth / Login
      login_title: "دخول فضاء الأستاذ",
      login_subtitle: "المنظومة الاحترافية لإدارة دروس الرياضيات في تونس",
      login_email: "البريد الإلكتروني",
      login_password: "كلمة المرور",
      login_remember: "تذكرني على هذا الجهاز",
      login_submit: "دخول",
      login_tab_login: "تسجيل الدخول",
      login_tab_register: "حساب جديد",
      reg_submit: "إنشاء حساب أستاذ",
      reg_title: "إنشاء حساب أستاذ جديد",
    }
  },

  init() {
    this.applyLanguage(this.currentLang);
  },

  t(key, fallback = '') {
    const langDict = this.translations[this.currentLang] || this.translations.fr;
    return langDict[key] || this.translations.fr[key] || fallback || key;
  },

  getLevelLabel(levelValue) {
    if (!levelValue) return this.t('level_Bac');
    const clean = levelValue.trim();
    if (clean === '1ère' || clean === '9ème' || clean === '1ere') return this.currentLang === 'ar' ? 'الأولى ثانوي' : '1ère';
    if (clean === '2ème' || clean === '2eme') return this.currentLang === 'ar' ? 'الثانية ثانوي' : '2ème';
    if (clean === '3ème' || clean === '3eme') return this.currentLang === 'ar' ? 'الثالثة ثانوي' : '3ème';
    if (clean === 'Bac') return this.currentLang === 'ar' ? 'الباكالوريا' : 'Bac';
    return clean;
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
