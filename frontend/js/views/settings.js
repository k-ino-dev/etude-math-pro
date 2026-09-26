// Settings View — Commercial SaaS Edition (Étude Math Pro)
const SettingsView = {
  activeAvatar: null,
  activeTab: 'profile', // 'profile', 'display', 'staff', 'expenses', 'audit', 'backup'

  async render(container) {
    const isAr = I18n.currentLang === 'ar';
    const isAdmin = State.isAdmin();

    // If activeTab is admin-only and current user is staff, reset to profile
    if (!isAdmin && ['staff', 'expenses', 'audit', 'backup'].includes(this.activeTab)) {
      this.activeTab = 'profile';
    }

    container.innerHTML = `
      <div class="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold shadow-sm">
                <i data-lucide="settings" class="w-5 h-5"></i>
              </div>
              <span>${I18n.t('accountSettings')}</span>
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">
              ${isAr ? 'تخصيص الملف الشخصي، إعدادات العرض، إدارة الفريق والمالية والأمان.' : 'Personnalisez votre profil, configurez la langue et gérez votre équipe, vos dépenses et la sécurité.'}
            </p>
          </div>

          <!-- Tab Navigation Pill -->
          <div class="flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 shrink-0 overflow-x-auto max-w-full">
            <button type="button" id="tab-btn-profile" class="settings-tab-btn px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${this.activeTab === 'profile' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'} flex items-center gap-1.5 whitespace-nowrap">
              <i data-lucide="user" class="w-3.5 h-3.5"></i>
              <span>${I18n.t('profile')}</span>
            </button>
            <button type="button" id="tab-btn-display" class="settings-tab-btn px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${this.activeTab === 'display' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'} flex items-center gap-1.5 whitespace-nowrap">
              <i data-lucide="globe" class="w-3.5 h-3.5"></i>
              <span>${isAr ? 'اللغة والعرض' : 'Langue'}</span>
            </button>
            ${isAdmin ? `
              <button type="button" id="tab-btn-staff" class="settings-tab-btn px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${this.activeTab === 'staff' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'} flex items-center gap-1.5 whitespace-nowrap">
                <i data-lucide="users" class="w-3.5 h-3.5"></i>
                <span>${isAr ? 'حسابات الفريق' : 'Staff'}</span>
              </button>
              <button type="button" id="tab-btn-expenses" class="settings-tab-btn px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${this.activeTab === 'expenses' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'} flex items-center gap-1.5 whitespace-nowrap">
                <i data-lucide="wallet" class="w-3.5 h-3.5"></i>
                <span>${isAr ? 'المصاريف والخزينة' : 'Dépenses & Caisse'}</span>
              </button>
              <button type="button" id="tab-btn-backup" class="settings-tab-btn px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${this.activeTab === 'backup' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'} flex items-center gap-1.5 whitespace-nowrap">
                <i data-lucide="database" class="w-3.5 h-3.5"></i>
                <span>${isAr ? 'النسخ الاحتياطي' : 'Sauvegardes'}</span>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- TAB 1: Profile & Identity -->
        <div id="tab-content-profile" class="space-y-6 ${this.activeTab === 'profile' ? '' : 'hidden'}">
          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-8">
            
            <div class="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div class="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                <i data-lucide="user-check" class="w-4 h-4"></i>
              </div>
              <div>
                <h2 class="text-base font-bold text-slate-900">${isAr ? 'الهوية والبيانات المهنية' : 'Identité & Coordonnées Professionnelles'}</h2>
                <p class="text-xs text-slate-500">${isAr ? 'تظهر هذه المعلومات في وصولات الخلاص، التقارير والوثائق الرسمية.' : 'Ces informations apparaissent sur vos reçus de cotisations, vos rapports et vos documents officiels.'}</p>
              </div>
            </div>

            <form id="settings-profile-form" class="space-y-6">
              
              <!-- Avatar Selection Section -->
              <div class="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-4">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">${isAr ? 'الصورة الرمزية / الصورة الشخصية' : 'Photo de Profil / Avatar'}</label>
                
                <div class="flex flex-col sm:flex-row items-center gap-6">
                  
                  <!-- Avatar Preview -->
                  <div class="relative group shrink-0">
                    <div id="avatar-preview-box" class="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-md overflow-hidden border-2 border-white ring-4 ring-brand-100 transition-transform group-hover:scale-105">
                      <span id="avatar-preview-initials">P</span>
                    </div>
                  </div>

                  <!-- Avatar Actions -->
                  <div class="flex-1 space-y-3 text-center sm:text-left rtl:sm:text-right">
                    <div class="flex flex-wrap items-center justify-center sm:justify-start rtl:sm:justify-start gap-2.5">
                      <label class="cursor-pointer px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2">
                        <i data-lucide="upload" class="w-3.5 h-3.5 text-brand-600"></i> ${isAr ? 'تحميل صورة' : 'Importer une photo'}
                        <input id="avatar-file-input" type="file" accept="image/*" class="hidden">
                      </label>
                      
                      <button type="button" id="avatar-reset-btn" class="px-3 py-2 bg-slate-200/70 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5">
                        <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> ${isAr ? 'الحروف الأولى' : 'Initiales'}
                      </button>
                    </div>

                    <!-- Quick Avatar Presets -->
                    <div>
                      <p class="text-[11px] font-semibold text-slate-400 mb-1.5">${isAr ? 'أو اختر رمزا تعبيرياً جاهزاً :' : 'Ou choisir un avatar prédéfini :'}</p>
                      <div class="flex flex-wrap items-center justify-center sm:justify-start rtl:sm:justify-start gap-2">
                        <button type="button" class="avatar-preset-btn w-8 h-8 rounded-xl bg-blue-100 hover:ring-2 ring-brand-500 flex items-center justify-center text-sm transition-all" data-preset="👨‍🏫">👨‍🏫</button>
                        <button type="button" class="avatar-preset-btn w-8 h-8 rounded-xl bg-purple-100 hover:ring-2 ring-brand-500 flex items-center justify-center text-sm transition-all" data-preset="👩‍🏫">👩‍🏫</button>
                        <button type="button" class="avatar-preset-btn w-8 h-8 rounded-xl bg-emerald-100 hover:ring-2 ring-brand-500 flex items-center justify-center text-sm transition-all" data-preset="📐">📐</button>
                        <button type="button" class="avatar-preset-btn w-8 h-8 rounded-xl bg-amber-100 hover:ring-2 ring-brand-500 flex items-center justify-center text-sm transition-all" data-preset="∑">∑</button>
                        <button type="button" class="avatar-preset-btn w-8 h-8 rounded-xl bg-rose-100 hover:ring-2 ring-brand-500 flex items-center justify-center text-sm transition-all" data-preset="🎓">🎓</button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              <!-- Identity Fields -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">${isAr ? 'الاسم واللقب *' : 'Nom & Prénom complet *'}</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <i data-lucide="user" class="w-4 h-4"></i>
                    </div>
                    <input id="set-name" type="text" required placeholder="Ex: Mohamed Ben Salem" class="w-full pl-10 rtl:pl-3.5 rtl:pr-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-semibold text-slate-900 transition-all">
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">${isAr ? 'البريد الإلكتروني لتسجيل الدخول *' : 'Email de connexion *'}</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <i data-lucide="mail" class="w-4 h-4"></i>
                    </div>
                    <input id="set-email" type="email" required placeholder="admin@mathprof.tn" class="w-full pl-10 rtl:pl-3.5 rtl:pr-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-medium text-slate-900 transition-all">
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">${isAr ? 'رقم الهاتف' : 'Téléphone professionnel'}</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <i data-lucide="phone" class="w-4 h-4"></i>
                    </div>
                    <input id="set-phone" type="text" placeholder="+216 98 123 456" class="w-full pl-10 rtl:pl-3.5 rtl:pr-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-medium text-slate-900 transition-all">
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">${isAr ? 'العملة المعتمدة' : 'Devise des Tarifs'}</label>
                  <div class="relative">
                    <select id="set-currency" disabled class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-100 font-bold text-brand-700 cursor-not-allowed">
                      <option value="DT" selected>Dinar Tunisien (DT / د.ت)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">${isAr ? 'السنة الدراسية' : 'Année Scolaire'}</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <i data-lucide="calendar" class="w-4 h-4"></i>
                    </div>
                    <input id="set-year" type="text" value="2025-2026" placeholder="2025-2026" class="w-full pl-10 rtl:pl-3.5 rtl:pr-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-medium text-slate-900 transition-all">
                  </div>
                </div>
              </div>

              <!-- Password Change Section -->
              <div class="pt-4 border-t border-slate-100">
                <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <i data-lucide="lock" class="w-3.5 h-3.5 text-slate-500"></i>
                  <span>${isAr ? 'الأمان وكلمة المرور' : 'Sécurité & Mot de passe'}</span>
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-[11px] font-semibold text-slate-500 mb-1">${isAr ? 'كلمة المرور الجديدة' : 'Nouveau mot de passe'}</label>
                    <input id="set-password" type="password" placeholder="${isAr ? 'اتركه فارغاً إن كنت لا ترغب في التعديل' : 'Laisser vide pour ne pas modifier'}" class="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500">
                  </div>
                  <div>
                    <label class="block text-[11px] font-semibold text-slate-500 mb-1">${isAr ? 'تأكيد كلمة المرور' : 'Confirmer le nouveau mot de passe'}</label>
                    <input id="set-password-confirm" type="password" placeholder="${isAr ? 'أعد كتابة كلمة المرور الجديدة' : 'Confirmer le nouveau mot de passe'}" class="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500">
                  </div>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="pt-6 border-t border-slate-100 flex items-center justify-end">
                <button type="submit" id="save-profile-btn" class="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-600/25 transition-all flex items-center gap-2">
                  <i data-lucide="check" class="w-4 h-4"></i>
                  <span>${isAr ? 'حفظ التعديلات' : 'Enregistrer les Modifications'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- TAB 2: Language & Display -->
        <div id="tab-content-display" class="space-y-6 ${this.activeTab === 'display' ? '' : 'hidden'}">
          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            
            <div class="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div class="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
                <i data-lucide="globe" class="w-4 h-4"></i>
              </div>
              <div>
                <h2 class="text-base font-bold text-slate-900">${isAr ? 'إعدادات اللغة والواجهة' : 'Langue & Préférences d\'Affichage'}</h2>
                <p class="text-xs text-slate-500">${isAr ? 'تبديل فوري بين اللغتين الفرنسية والعربية مع دعم اتجاه الكتابة من اليمين إلى اليسار (RTL).' : 'Basculez instantanément entre le Français et l\'Arabe avec prise en charge complète du RTL.'}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- French Choice Card -->
              <div onclick="I18n.setLanguage('fr')" class="p-5 rounded-2xl border-2 cursor-pointer transition-all ${!isAr ? 'border-brand-600 bg-brand-50/40 shadow-sm ring-2 ring-brand-100' : 'border-slate-200 bg-white hover:border-slate-300'}">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">🇫🇷</span>
                    <div>
                      <h3 class="font-black text-slate-900 text-sm">Français (Default)</h3>
                      <p class="text-xs text-slate-500">Interface en Français (LTR)</p>
                    </div>
                  </div>
                  ${!isAr ? '<i data-lucide="check-circle-2" class="w-5 h-5 text-brand-600"></i>' : ''}
                </div>
              </div>

              <!-- Arabic Choice Card -->
              <div onclick="I18n.setLanguage('ar')" class="p-5 rounded-2xl border-2 cursor-pointer transition-all ${isAr ? 'border-brand-600 bg-brand-50/40 shadow-sm ring-2 ring-brand-100' : 'border-slate-200 bg-white hover:border-slate-300'}">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">🇹🇳</span>
                    <div>
                      <h3 class="font-black text-slate-900 text-sm">العربية (تونس)</h3>
                      <p class="text-xs text-slate-500">واجهة كاملة باللغة العربية (RTL)</p>
                    </div>
                  </div>
                  ${isAr ? '<i data-lucide="check-circle-2" class="w-5 h-5 text-brand-600"></i>' : ''}
                </div>
              </div>
            </div>

            <!-- Typography & Currency Note -->
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-600">
              <div class="flex items-center gap-2 font-bold text-slate-800">
                <i data-lucide="info" class="w-4 h-4 text-brand-600"></i>
                <span>${isAr ? 'معايير التوطين والتنسيق' : 'Standards de localisation'}</span>
              </div>
              <ul class="list-disc list-inside space-y-1 text-slate-500">
                <li>${isAr ? 'العملة الرسمية المعتمدة : الدينار التونسي (DT / د.ت).' : 'Devise unique et stricte : Dinar Tunisien (DT).'}</li>
                <li>${isAr ? 'المستويات والشعب الدراسية : 1ère، 2ème (علوم، إعلامية، اقتصاد)، 3ème و Bac (علوم، إعلامية، اقتصاد، رياضيات، تقنية).' : 'Niveaux et sections secondaires tunisiens : 1ère, 2ème (Sciences, Informatique, Économie), 3ème & Bac (Sciences, Informatique, Économie, Mathématiques, Technique).'}</li>
                <li>${isAr ? 'طرق الاستخلاص المعتمدة : نقداً (Espèces) وتحويل بنكي (Virement bancaire).' : 'Modes de règlement stricts : Espèces et Virement bancaire.'}</li>
              </ul>
            </div>

          </div>
        </div>

        ${isAdmin ? `
          <!-- TAB 3: Staff Accounts -->
          <div id="tab-content-staff" class="space-y-6 ${this.activeTab === 'staff' ? '' : 'hidden'}">
            <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <i data-lucide="users" class="w-4 h-4"></i>
                  </div>
                  <div>
                    <h2 class="text-base font-bold text-slate-900">${isAr ? 'إدارة حسابات الفريق (Staff)' : 'Gestion des Comptes Staff'}</h2>
                    <p class="text-xs text-slate-500">${isAr ? 'إنشاء وإدارة حسابات المساعدين بصلاحيات مقيدة (تسجيل التلاميذ، الحضور، المدفوعات دون الاطلاع على الأرباح أو تعديل التوقيت).' : 'Gérez les accès de vos assistants opérationnels (élèves, appels, paiements sans accès aux chiffres globaux).'}</p>
                  </div>
                </div>
                <button id="add-staff-btn" class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto">
                  <i data-lucide="user-plus" class="w-3.5 h-3.5"></i>
                  <span>${isAr ? '+ إضافة عضو Staff' : '+ Nouveau Compte Staff'}</span>
                </button>
              </div>

              <!-- Staff List Table -->
              <div id="staff-list-container" class="space-y-3">
                <div class="text-center py-8 text-slate-400 text-xs">${isAr ? 'جاري تحميل قائمة الفريق...' : 'Chargement de l\'équipe...'}</div>
              </div>

            </div>
          </div>

          <!-- TAB 4: Expenses & Costs -->
          <!-- TAB 4: Cashflow, Treasury & Expenses -->
          <div id="tab-content-expenses" class="space-y-6 ${this.activeTab === 'expenses' ? '' : 'hidden'}">
            <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              
              <!-- Section Header & Add Button with Micro-interactions -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-rose-500/20">
                    <i data-lucide="wallet" class="w-5 h-5"></i>
                  </div>
                  <div>
                    <h2 class="text-lg font-black text-slate-900">${isAr ? 'الخزينة والتدفقات المالية' : 'Trésorerie & Mouvements'}</h2>
                    <p class="text-xs text-slate-500">${isAr ? 'متابعة شاملة للمداخيل المقبوضة، المصاريف والنفقات والرصيد الصافي المتوفر.' : 'Aperçu global des entrées, sorties et solde restant disponible en temps réel.'}</p>
                  </div>
                </div>
                <button id="add-expense-btn" class="group relative px-5 py-2.5 bg-gradient-to-r from-rose-600 via-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-95 text-white text-xs font-black rounded-2xl shadow-lg shadow-rose-600/25 transition-all duration-300 flex items-center gap-2 self-start sm:self-auto overflow-hidden">
                  <span class="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  <i data-lucide="plus-circle" class="w-4 h-4 transition-transform group-hover:rotate-90 duration-300"></i>
                  <span class="tracking-wide">${isAr ? '+ إضافة عملية صرف / نفقة' : '+ Ajouter une Opération'}</span>
                </button>
              </div>

              <!-- 3 Top Financial KPI Cards (Exact User Layout) -->
              <div id="expenses-kpis" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <!-- Card 1: Entrées (Revenus) -->
                <div class="p-6 rounded-3xl bg-emerald-50/70 border-2 border-emerald-200/90 flex flex-col justify-between transition-all hover:shadow-md hover:border-emerald-300">
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] font-black uppercase tracking-wider text-emerald-800">${isAr ? 'المداخيل المقبوضة (المقبوضات)' : 'REVENUS ENCAISSÉS (ENTRÉES)'}</span>
                    <span class="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      <i data-lucide="arrow-down-left" class="w-4 h-4"></i>
                    </span>
                  </div>
                  <div class="mt-3">
                    <p id="kpi-expenses-revenue" class="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">+ 0.000 DT</p>
                  </div>
                </div>

                <!-- Card 2: Sorties (Dépenses) -->
                <div class="p-6 rounded-3xl bg-rose-50/70 border-2 border-rose-200/90 flex flex-col justify-between transition-all hover:shadow-md hover:border-rose-300">
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] font-black uppercase tracking-wider text-rose-800">${isAr ? 'إجمالي المصاريف (المدفوعات)' : 'TOTAL DÉPENSÉ (SORTIES)'}</span>
                    <span class="w-7 h-7 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                      <i data-lucide="arrow-up-right" class="w-4 h-4"></i>
                    </span>
                  </div>
                  <div class="mt-3">
                    <p id="kpi-expenses-total" class="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">- 0.000 DT</p>
                  </div>
                </div>

                <!-- Card 3: Solde Net Restant -->
                <div class="p-6 rounded-3xl bg-[#0f172a] text-white border-2 border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-2xl">
                  <div class="absolute -right-8 -top-8 w-28 h-28 bg-brand-500/10 rounded-full blur-2xl pointer-events-none"></div>
                  <div class="flex items-center justify-between relative z-10">
                    <span class="text-[11px] font-black uppercase tracking-wider text-slate-300">${isAr ? 'الرصيد الصافي المتبقي' : 'SOLDE NET RESTANT'}</span>
                    <span class="w-7 h-7 rounded-xl bg-slate-800 text-brand-400 flex items-center justify-center font-bold text-xs border border-slate-700">
                      <i data-lucide="coins" class="w-4 h-4"></i>
                    </span>
                  </div>
                  <div class="mt-3 relative z-10">
                    <p id="kpi-expenses-profit" class="text-2xl sm:text-3xl font-black text-white tracking-tight">0.000 DT</p>
                  </div>
                </div>

              </div>

              <!-- Cashflow List / Timeline Section -->
              <div class="pt-4 border-t border-slate-100 space-y-4">
                
                <!-- Cashflow Controls Bar -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/70">
                  <div class="flex items-center gap-2">
                    <h3 class="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <span>${isAr ? 'سجل التدفقات المالية المفصل' : 'HISTORIQUE DÉTAILLÉ DES FLUX'}</span>
                    </h3>
                    <span id="cashflow-count-badge" class="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-700">0 opérations</span>
                  </div>

                  <!-- Interactive Filters -->
                  <div class="flex flex-wrap items-center gap-2">
                    
                    <!-- Search Input -->
                    <div class="relative">
                      <input id="cashflow-search-input" type="text" placeholder="${isAr ? 'بحث في الحركات...' : 'Rechercher un flux...'}" class="text-xs font-semibold bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 focus:ring-2 focus:ring-brand-500 w-44 sm:w-52">
                      <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"></i>
                    </div>

                    <!-- Type Filter Pills -->
                    <div class="inline-flex p-1 bg-white rounded-xl border border-slate-200 shadow-xs text-xs font-bold">
                      <button type="button" id="cflow-pill-all" class="cflow-pill-btn px-2.5 py-1 rounded-lg transition-all bg-slate-900 text-white">
                        ${isAr ? 'الكل' : 'Tous'}
                      </button>
                      <button type="button" id="cflow-pill-income" class="cflow-pill-btn px-2.5 py-1 rounded-lg transition-all text-slate-600 hover:text-emerald-700">
                        ${isAr ? 'المداخيل (+)' : 'Entrées (+)'}
                      </button>
                      <button type="button" id="cflow-pill-expense" class="cflow-pill-btn px-2.5 py-1 rounded-lg transition-all text-slate-600 hover:text-rose-700">
                        ${isAr ? 'المصاريف (-)' : 'Sorties (-)'}
                      </button>
                    </div>

                    <!-- Category Selector -->
                    <select id="cashflow-cat-filter" class="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 focus:ring-2 focus:ring-brand-500">
                      <option value="all">${isAr ? 'جميع الأصناف' : 'Toutes les catégories'}</option>
                      <option value="Paiement / Inscription">${isAr ? 'مستخلصات التلاميذ' : 'Paiements / Inscriptions'}</option>
                      <option value="Loyer">Loyer / Local</option>
                      <option value="Matériel">Matériel & Fournitures</option>
                      <option value="Impression">Photocopies & Feuilles</option>
                      <option value="Internet">Internet & Électricité</option>
                      <option value="Transport">Transport</option>
                      <option value="Autre">Autre charge</option>
                    </select>

                  </div>
                </div>

                <!-- Cashflow Items Render Container -->
                <div id="cashflow-list-container" class="space-y-2.5">
                  <div class="text-center py-10 text-slate-400 text-xs">${isAr ? 'جاري تحميل سجل التدفقات...' : 'Chargement des flux financiers...'}</div>
                </div>

              </div>

            </div>
          </div>

          <!-- TAB 6: Data Management & Backups -->
          <div id="tab-content-backup" class="space-y-6 ${this.activeTab === 'backup' ? '' : 'hidden'}">
            <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              
              <div class="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div class="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <i data-lucide="database" class="w-4 h-4"></i>
                </div>
                <div>
                  <h2 class="text-base font-bold text-slate-900">${isAr ? 'النسخ الاحتياطي وإدارة البيانات' : 'Sauvegarde, Restauration & Données'}</h2>
                  <p class="text-xs text-slate-500">${isAr ? 'تصدير كامل بياناتك في ملف آمن أو تفريغ القاعدة لبدء العمل من الصفر.' : 'Sécurisez vos élèves et plannings, restaurez une sauvegarde ou préparez une base propre.'}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
                
                <!-- Export JSON Card -->
                <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3 flex flex-col justify-between">
                  <div>
                    <div class="flex items-center gap-2 text-slate-800 font-bold text-sm">
                      <i data-lucide="download-cloud" class="w-4 h-4 text-brand-600"></i>
                      <span>${isAr ? 'تصدير نسخة احتياطية (JSON)' : 'Sauvegarde Complète (JSON)'}</span>
                    </div>
                    <p class="text-xs text-slate-500 mt-1.5">${isAr ? 'تنزيل جميع التلاميذ، الأفواج، الحصص والمدفوعات في ملف واحد.' : 'Téléchargez l\'intégralité de vos élèves, groupes, séances et paiements en un fichier sécurisé.'}</p>
                  </div>
                  <button id="export-json-btn" class="w-full py-2.5 px-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2">
                    <i data-lucide="download" class="w-3.5 h-3.5 text-brand-600"></i> ${isAr ? 'تنزيل النسخة' : 'Télécharger ma sauvegarde'}
                  </button>
                </div>

                <!-- Import JSON Card -->
                <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3 flex flex-col justify-between">
                  <div>
                    <div class="flex items-center gap-2 text-slate-800 font-bold text-sm">
                      <i data-lucide="upload-cloud" class="w-4 h-4 text-indigo-600"></i>
                      <span>${isAr ? 'استرجاع نسخة احتياطية' : 'Restaurer une Sauvegarde'}</span>
                    </div>
                    <p class="text-xs text-slate-500 mt-1.5">${isAr ? 'استيراد ملف JSON تم حفظه مسبقاً لاستعادة البيانات.' : 'Importez un fichier JSON préalablement sauvegardé pour restaurer vos données.'}</p>
                  </div>
                  <label class="cursor-pointer w-full py-2.5 px-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2">
                    <i data-lucide="folder-open" class="w-3.5 h-3.5 text-indigo-600"></i> ${isAr ? 'اختيار ملف JSON' : 'Choisir un fichier JSON'}
                    <input id="import-json-file" type="file" accept=".json" class="hidden">
                  </label>
                </div>

                <!-- Clean Customer Wipe Card -->
                <div class="p-5 rounded-2xl bg-rose-50/60 border border-rose-200/70 space-y-3 flex flex-col justify-between">
                  <div>
                    <div class="flex items-center gap-2 text-rose-950 font-bold text-sm">
                      <i data-lucide="trash-2" class="w-4 h-4 text-rose-600"></i>
                      <span>${isAr ? 'قاعدة فارغة (0 تلاميذ)' : 'Base Vierge (0 Élèves)'}</span>
                    </div>
                    <p class="text-xs text-rose-800 mt-1.5">${isAr ? 'حذف جميع البيانات التجريبية لتسليم قاعدة بيانات نظيفة وجاهزة لأستاذ جديد.' : 'Supprime les données pour laisser une base propre à 0 élèves prête pour votre activité.'}</p>
                  </div>
                  <button id="clean-client-btn" class="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> ${isAr ? 'تفريغ البيانات (0 تلاميذ)' : 'Nettoyer la base (0 élèves)'}
                  </button>
                </div>

              </div>
            </div>
          </div>
        ` : ''}

      </div>
    `;

    if (window.lucide) lucide.createIcons();

    this.bindTabs(container);
    await this.loadProfile(container);

    if (isAdmin) {
      this.bindStaffSection(container);
      this.bindExpensesSection(container);
      this.bindBackupActions(container);
    }
  },

  bindTabs(container) {
    const isAdmin = State.isAdmin();
    const tabs = isAdmin ? ['profile', 'display', 'staff', 'expenses', 'backup'] : ['profile', 'display'];
    
    tabs.forEach(tab => {
      const btn = container.querySelector(`#tab-btn-${tab}`);
      if (btn) {
        btn.addEventListener('click', () => {
          this.activeTab = tab;
          tabs.forEach(t => {
            const b = container.querySelector(`#tab-btn-${t}`);
            const content = container.querySelector(`#tab-content-${t}`);
            if (b) {
              b.className = `settings-tab-btn px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${t === tab ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'} flex items-center gap-1.5 whitespace-nowrap`;
            }
            if (content) {
              content.classList.toggle('hidden', t !== tab);
            }
          });
          if (window.lucide) lucide.createIcons();

          // Lazy load tab data
          if (tab === 'staff') this.loadStaffList(container);
          if (tab === 'expenses') this.loadExpenses(container);
        });
      }
    });

    // If initial tab is one of the async ones, trigger load
    if (this.activeTab === 'staff') this.loadStaffList(container);
    if (this.activeTab === 'expenses') this.loadExpenses(container);
  },

  async loadProfile(container) {
    const isAr = I18n.currentLang === 'ar';
    let user = State.user;
    try {
      const fetched = await API.get('/api/auth/me');
      if (fetched) user = fetched;
    } catch (e) {
      console.warn('Profile fetch fallback:', e);
    }

    user = user || {
      name: 'Mohamed Ben Salem',
      email: 'admin@mathprof.tn',
      phone: '+216 98 123 456',
      currency: 'DT',
      school_year: '2025-2026',
      avatar: null
    };

    this.activeAvatar = user.avatar || null;

    const nameInput = container.querySelector('#set-name');
    const emailInput = container.querySelector('#set-email');
    const phoneInput = container.querySelector('#set-phone');
    const currSelect = container.querySelector('#set-currency');
    const yearInput = container.querySelector('#set-year');

    if (nameInput) nameInput.value = user.name || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';
    if (currSelect) currSelect.value = 'DT';
    if (yearInput) yearInput.value = user.school_year || '2025-2026';

    this.updateAvatarPreview(container, user.name);

    container.querySelectorAll('.avatar-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.getAttribute('data-preset');
        this.activeAvatar = preset;
        this.updateAvatarPreview(container, nameInput ? nameInput.value : '');
      });
    });

    const fileInput = container.querySelector('#avatar-file-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 2 * 1024 * 1024) {
            Toast.warning(isAr ? 'حجم الصورة يتجاوز 2 ميغابايت.' : 'L\'image dépasse 2 Mo.');
            return;
          }
          const reader = new FileReader();
          reader.onload = (re) => {
            this.activeAvatar = re.target.result;
            this.updateAvatarPreview(container, nameInput ? nameInput.value : '');
          };
          reader.readAsDataURL(file);
        }
      });
    }

    const resetAvatarBtn = container.querySelector('#avatar-reset-btn');
    if (resetAvatarBtn) {
      resetAvatarBtn.addEventListener('click', () => {
        this.activeAvatar = null;
        this.updateAvatarPreview(container, nameInput ? nameInput.value : '');
      });
    }

    const form = container.querySelector('#settings-profile-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const pwd = (container.querySelector('#set-password') ? container.querySelector('#set-password').value : '').trim();
        const pwdConf = (container.querySelector('#set-password-confirm') ? container.querySelector('#set-password-confirm').value : '').trim();

        if (pwd && pwd !== pwdConf) {
          Toast.error(isAr ? 'كلمات المرور المدخلة غير متطابقة.' : 'Les mots de passe saisis ne correspondent pas.');
          return;
        }

        const saveBtn = container.querySelector('#save-profile-btn');
        if (saveBtn) {
          saveBtn.disabled = true;
          saveBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> ${isAr ? 'جاري الحفظ...' : 'Enregistrement...'}`;
          if (window.lucide) lucide.createIcons();
        }

        const payload = {
          name: (nameInput ? nameInput.value : '').trim(),
          email: (emailInput ? emailInput.value : '').trim(),
          phone: (phoneInput ? phoneInput.value : '').trim() || null,
          avatar: this.activeAvatar,
          currency: 'DT',
          school_year: (yearInput ? yearInput.value : '').trim()
        };

        if (pwd) payload.password = pwd;

        try {
          const updated = await API.put('/api/auth/profile', payload);
          State.user = updated;
          State.currency = 'DT';
          API.setUser(updated);
          State.updateBadges();

          if (window.confetti) {
            confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
          }

          Toast.success(isAr ? 'تم حفظ بيانات الملف الشخصي بنجاح !' : 'Profil enseignant enregistré avec succès !');
          if (container.querySelector('#set-password')) container.querySelector('#set-password').value = '';
          if (container.querySelector('#set-password-confirm')) container.querySelector('#set-password-confirm').value = '';
        } catch (err) {
          Toast.error(err.message || (isAr ? 'خطأ أثناء تحديث الملف الشخصي.' : 'Erreur lors de la mise à jour du profil.'));
        } finally {
          if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> ${isAr ? 'حفظ التعديلات' : 'Enregistrer les Modifications'}`;
            if (window.lucide) lucide.createIcons();
          }
        }
      });
    }
  },

  // -------------------------------------------------------------
  // STAFF ACCOUNTS SECTION (ADMIN ONLY)
  // -------------------------------------------------------------
  bindStaffSection(container) {
    const isAr = I18n.currentLang === 'ar';
    const addBtn = container.querySelector('#add-staff-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.openStaffModal(container);
      });
    }
  },

  async loadStaffList(container) {
    const isAr = I18n.currentLang === 'ar';
    const wrapper = container.querySelector('#staff-list-container');
    if (!wrapper) return;

    try {
      const staffList = await API.get('/api/auth/staff');
      if (!staffList || staffList.length === 0) {
        wrapper.innerHTML = `
          <div class="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 mx-auto flex items-center justify-center mb-2 font-bold">
              <i data-lucide="user-plus" class="w-6 h-6"></i>
            </div>
            <p class="text-xs font-bold text-slate-700">${isAr ? 'لا يوجد أعضاء فريق مسجلين بعد' : 'Aucun compte Staff configuré'}</p>
            <p class="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">${isAr ? 'أضف مساعدين لتسهيل تسجيل الحضور، إضافة التلاميذ وتسجيل الدفعات بأمان.' : 'Créez un compte pour vos assistants pour déléguer les présences, la saisie des élèves et des paiements.'}</p>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      wrapper.innerHTML = `
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left rtl:text-right border-collapse">
            <thead>
              <tr class="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th class="py-3 px-4">${isAr ? 'المستخدم' : 'Membre Staff'}</th>
                <th class="py-3 px-4">${isAr ? 'البريد الإلكتروني' : 'Email'}</th>
                <th class="py-3 px-4">${isAr ? 'الهاتف' : 'Téléphone'}</th>
                <th class="py-3 px-4">${isAr ? 'الحالة' : 'Statut'}</th>
                <th class="py-3 px-4 text-right rtl:text-left">${isAr ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
              ${staffList.map(s => `
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="py-3 px-4 flex items-center gap-3">
                    <div class="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                      ${s.name ? s.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div>
                      <p class="font-bold text-slate-900">${s.name || 'Staff'}</p>
                      <span class="inline-block px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-600 font-semibold uppercase tracking-wider">Staff</span>
                    </div>
                  </td>
                  <td class="py-3 px-4 text-slate-600">${s.email}</td>
                  <td class="py-3 px-4 text-slate-500">${s.phone || '-'}</td>
                  <td class="py-3 px-4">
                    ${s.is_active ? `
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        ${isAr ? 'نشط' : 'Actif'}
                      </span>
                    ` : `
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        ${isAr ? 'معطل' : 'Désactivé'}
                      </span>
                    `}
                  </td>
                  <td class="py-3 px-4 text-right rtl:text-left">
                    <div class="inline-flex items-center gap-1.5">
                      <button onclick="SettingsView.openStaffModal(document, ${JSON.stringify(s).replace(/"/g, '&quot;')})" class="p-1.5 hover:bg-slate-200/70 text-slate-600 rounded-lg transition-colors" title="${isAr ? 'تعديل' : 'Modifier'}">
                        <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                      </button>
                      <button onclick="SettingsView.deleteStaffMember(document, ${s.id}, '${s.name || s.email}')" class="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors" title="${isAr ? 'حذف' : 'Supprimer'}">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      if (window.lucide) lucide.createIcons();
    } catch (e) {
      wrapper.innerHTML = `<div class="p-4 bg-rose-50 text-rose-700 rounded-xl text-xs">${e.message || 'Erreur chargement staff'}</div>`;
    }
  },

  openStaffModal(container, staff = null) {
    const isAr = I18n.currentLang === 'ar';
    const isEdit = !!staff;

    Modal.open({
      title: isEdit ? (isAr ? 'تعديل حساب مساعد (Staff)' : 'Modifier le compte Staff') : (isAr ? 'إضافة حساب مساعد جديد (Staff)' : 'Nouveau Compte Staff'),
      html: `
        <form id="staff-modal-form" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">${isAr ? 'الاسم الكامل *' : 'Nom complet *'}</label>
            <input id="staff-form-name" type="text" required value="${staff ? staff.name || '' : ''}" placeholder="Ex: Ahmed Ayari" class="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">${isAr ? 'البريد الإلكتروني لتسجيل الدخول *' : 'Email de connexion *'}</label>
            <input id="staff-form-email" type="email" required value="${staff ? staff.email || '' : ''}" placeholder="staff@mathprof.tn" class="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">${isAr ? 'رقم الهاتف' : 'Téléphone'}</label>
            <input id="staff-form-phone" type="text" value="${staff ? staff.phone || '' : ''}" placeholder="+216 ..." class="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              ${isEdit ? (isAr ? 'كلمة المرور الجديدة (اتركها فارغة إن لم ترغب في التغيير)' : 'Nouveau mot de passe (optionnel)') : (isAr ? 'كلمة المرور *' : 'Mot de passe *')}
            </label>
            <input id="staff-form-pwd" type="password" ${isEdit ? '' : 'required'} placeholder="${isEdit ? '••••••••' : 'Minimum 6 caractères'}" class="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500">
          </div>

          ${isEdit ? `
            <div class="flex items-center gap-3 pt-2">
              <input type="checkbox" id="staff-form-active" ${staff.is_active ? 'checked' : ''} class="w-4 h-4 rounded text-brand-600 focus:ring-brand-500">
              <label for="staff-form-active" class="text-xs font-bold text-slate-700">${isAr ? 'الحساب مفعّل ونشط' : 'Compte actif et autorisé à se connecter'}</label>
            </div>
          ` : ''}

          <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button type="button" onclick="Modal.close()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all">
              ${isAr ? 'إلغاء' : 'Annuler'}
            </button>
            <button type="submit" class="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all">
              ${isAr ? 'حفظ الحساب' : 'Enregistrer'}
            </button>
          </div>
        </form>
      `,
      onOpen: (content) => {
        const form = content.querySelector('#staff-modal-form');
        if (!form) return;
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const name = content.querySelector('#staff-form-name').value.trim();
          const email = content.querySelector('#staff-form-email').value.trim();
          const phone = content.querySelector('#staff-form-phone').value.trim() || null;
          const pwd = content.querySelector('#staff-form-pwd').value.trim();

          try {
            if (isEdit) {
              const isActive = content.querySelector('#staff-form-active').checked;
              const payload = { name, email, phone, is_active: isActive };
              if (pwd) payload.password = pwd;
              await API.put(`/api/auth/staff/${staff.id}`, payload);
              Toast.success(isAr ? 'تم تحديث حساب المساعد بنجاح !' : 'Compte Staff mis à jour !');
            } else {
              if (!pwd) {
                Toast.error(isAr ? 'كلمة المرور إجبارية' : 'Mot de passe requis');
                return;
              }
              await API.post('/api/auth/staff', { name, email, password: pwd, phone });
              Toast.success(isAr ? 'تم إنشاء حساب المساعد بنجاح !' : 'Compte Staff créé avec succès !');
            }
            Modal.close();
            this.loadStaffList(document);
          } catch (err) {
            Toast.error(err.message || 'Erreur');
          }
        });
      }
    });
  },

  deleteStaffMember(container, staffId, staffName) {
    const isAr = I18n.currentLang === 'ar';
    Modal.confirm({
      title: isAr ? `حذف حساب ${staffName} ؟` : `Supprimer le compte Staff ${staffName} ?`,
      message: isAr ? "لن يتمكن هذا العضو من تسجيل الدخول مرة أخرى إلى النظام." : "Ce membre ne pourra plus accéder à la plateforme. Les actions qu'il a effectuées resteront tracées dans le journal d'audit.",
      confirmText: isAr ? "نعم، حذف" : "Oui, Supprimer",
      onConfirm: async () => {
        try {
          await API.delete(`/api/auth/staff/${staffId}`);
          Toast.success(isAr ? 'تم حذف حساب المساعد !' : 'Compte Staff supprimé !');
          this.loadStaffList(document);
        } catch (e) {
          Toast.error(e.message || 'Erreur suppression');
        }
      }
    });
  },

  // -------------------------------------------------------------
  // TRÉSORERIE, FLUX & DÉPENSES SECTION (ADMIN ONLY)
  // -------------------------------------------------------------
  cachedCashflow: [],
  activeCashflowType: 'all', // 'all', 'income', 'expense'
  activeCashflowCategory: 'all',
  cashflowSearchQuery: '',

  bindExpensesSection(container) {
    const addBtn = container.querySelector('#add-expense-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.openExpenseModal(container);
      });
    }

    // Filter pills
    ['all', 'income', 'expense'].forEach(type => {
      const pill = container.querySelector(`#cflow-pill-${type}`);
      if (pill) {
        pill.addEventListener('click', () => {
          this.activeCashflowType = type;
          ['all', 'income', 'expense'].forEach(t => {
            const p = container.querySelector(`#cflow-pill-${t}`);
            if (p) {
              if (t === type) {
                p.className = 'cflow-pill-btn px-2.5 py-1 rounded-lg transition-all bg-slate-900 text-white font-bold';
              } else {
                p.className = 'cflow-pill-btn px-2.5 py-1 rounded-lg transition-all text-slate-600 hover:text-slate-900 font-bold';
              }
            }
          });
          this.renderCashflowList(container);
        });
      }
    });

    // Category dropdown filter
    const catSelect = container.querySelector('#cashflow-cat-filter');
    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        this.activeCashflowCategory = e.target.value;
        this.renderCashflowList(container);
      });
    }

    // Search input
    const searchInput = container.querySelector('#cashflow-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.cashflowSearchQuery = e.target.value.toLowerCase().trim();
        this.renderCashflowList(container);
      });
    }
  },

  async loadExpenses(container) {
    const isAr = I18n.currentLang === 'ar';
    const wrapper = container.querySelector('#cashflow-list-container');
    if (!wrapper) return;

    try {
      const data = await API.get('/api/expenses');
      if (data) {
        const revEl = container.querySelector('#kpi-expenses-revenue');
        const expEl = container.querySelector('#kpi-expenses-total');
        const profEl = container.querySelector('#kpi-expenses-profit');

        const totalIncome = data.total_revenue || data.total_income || 0;
        const totalExpenses = data.total_expenses || 0;
        const netProfit = data.net_profit !== undefined ? data.net_profit : (data.net_balance || 0);

        if (revEl) revEl.textContent = `+ ${totalIncome.toFixed(3)} DT`;
        if (expEl) expEl.textContent = `- ${totalExpenses.toFixed(3)} DT`;
        if (profEl) {
          profEl.textContent = `${netProfit.toFixed(3)} DT`;
          profEl.className = `text-2xl sm:text-3xl font-black tracking-tight ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;
        }

        this.cachedCashflow = Array.isArray(data.cashflow) ? data.cashflow : [];
        // Fallback if cashflow empty but expenses exist
        if (this.cachedCashflow.length === 0 && Array.isArray(data.expenses)) {
          this.cachedCashflow = data.expenses.map(e => ({
            id: `exp-${e.id}`,
            type: 'expense',
            title: e.title,
            amount: e.amount,
            date: e.expense_date || e.date,
            category: e.category || 'Autre',
            notes: e.notes,
            expense_id: e.id
          }));
        } else if (this.cachedCashflow.length === 0 && Array.isArray(data)) {
          this.cachedCashflow = data.map(e => ({
            id: `exp-${e.id}`,
            type: 'expense',
            title: e.title,
            amount: e.amount,
            date: e.expense_date || e.date,
            category: e.category || 'Autre',
            notes: e.notes,
            expense_id: e.id
          }));
        }

        this.renderCashflowList(container);
      }
    } catch (e) {
      wrapper.innerHTML = `<div class="p-4 bg-rose-50 text-rose-700 rounded-2xl text-xs font-semibold">${e.message || 'Erreur chargement'}</div>`;
    }
  },

  getCategoryBadge(category, type) {
    const isIncome = type === 'income';
    const cat = (category || '').toUpperCase();
    
    if (isIncome || cat.includes('PAIEMENT') || cat.includes('INSCRIPTION')) {
      return {
        label: 'INSCRIPTION / PAIEMENT',
        classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-black'
      };
    }
    if (cat.includes('MATÉRIEL') || cat.includes('MATERIEL')) {
      return {
        label: 'MATÉRIEL',
        classes: 'bg-blue-50 text-blue-700 border border-blue-200/80 font-black'
      };
    }
    if (cat.includes('TRANSPORT')) {
      return {
        label: 'TRANSPORT',
        classes: 'bg-amber-50 text-amber-800 border border-amber-200/80 font-black'
      };
    }
    if (cat.includes('IMPRESSION') || cat.includes('PHOTOCOPIE')) {
      return {
        label: 'IMPRESSION',
        classes: 'bg-purple-50 text-purple-700 border border-purple-200/80 font-black'
      };
    }
    if (cat.includes('INTERNET') || cat.includes('ÉLECTRICITÉ')) {
      return {
        label: 'INTERNET',
        classes: 'bg-sky-50 text-sky-700 border border-sky-200/80 font-black'
      };
    }
    if (cat.includes('LOYER') || cat.includes('LOCAL')) {
      return {
        label: 'LOYER',
        classes: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-black'
      };
    }
    return {
      label: category ? category.toUpperCase() : 'AUTRE',
      classes: 'bg-slate-100 text-slate-700 border border-slate-200 font-bold'
    };
  },

  renderCashflowList(container) {
    const isAr = I18n.currentLang === 'ar';
    const wrapper = container.querySelector('#cashflow-list-container');
    const badgeCount = container.querySelector('#cashflow-count-badge');
    if (!wrapper) return;

    let items = [...(this.cachedCashflow || [])];

    // Filter by type
    if (this.activeCashflowType === 'income') {
      items = items.filter(i => i.type === 'income');
    } else if (this.activeCashflowType === 'expense') {
      items = items.filter(i => i.type === 'expense');
    }

    // Filter by category
    if (this.activeCashflowCategory !== 'all') {
      items = items.filter(i => (i.category || '').toLowerCase() === this.activeCashflowCategory.toLowerCase());
    }

    // Filter by search
    if (this.cashflowSearchQuery) {
      items = items.filter(i => 
        (i.title || '').toLowerCase().includes(this.cashflowSearchQuery) ||
        (i.category || '').toLowerCase().includes(this.cashflowSearchQuery) ||
        (i.notes || '').toLowerCase().includes(this.cashflowSearchQuery)
      );
    }

    if (badgeCount) {
      badgeCount.textContent = `${items.length} ${isAr ? 'عملية' : (items.length > 1 ? 'opérations' : 'opération')}`;
    }

    if (items.length === 0) {
      wrapper.innerHTML = `
        <div class="text-center py-12 bg-slate-50/80 rounded-3xl border border-dashed border-slate-200">
          <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2 font-bold">
            <i data-lucide="receipt" class="w-6 h-6"></i>
          </div>
          <p class="text-xs font-bold text-slate-700">${isAr ? 'لا توجد عمليات تطابق البحث أو التصفية' : 'Aucun flux ne correspond aux critères'}</p>
          <p class="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">${isAr ? 'أضف عمليات صرف جديدة أو راجع المقبوضات الشهرية.' : 'Enregistrez vos dépenses ou visualisez les règlements de vos élèves.'}</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    wrapper.innerHTML = items.map(item => {
      const isIncome = item.type === 'income';
      const badge = this.getCategoryBadge(item.category, item.type);
      
      // Relative date formatting
      let formattedDate = item.date;
      try {
        const d = new Date(item.date);
        const today = new Date();
        const isToday = d.toDateString() === today.toDateString();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const isYesterday = d.toDateString() === yesterday.toDateString();

        if (isToday) {
          formattedDate = isAr ? 'اليوم' : "Aujourd'hui";
        } else if (isYesterday) {
          formattedDate = isAr ? 'أمس' : 'Hier';
        } else {
          formattedDate = d.toLocaleDateString(isAr ? 'ar-TN' : 'fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
        }
      } catch (e) {}

      return `
        <div class="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
          
          <!-- Left: Category Badge & Details -->
          <div class="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
            <span class="inline-block px-2.5 py-1 rounded-xl text-[10px] tracking-wider uppercase shrink-0 ${badge.classes}">
              ${badge.label}
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-brand-600 transition-colors">
                ${item.title}
              </p>
              <div class="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                <span class="font-medium text-slate-500">${formattedDate}</span>
                ${item.payment_method ? `<span>• <span class="text-slate-600 font-semibold">${item.payment_method}</span></span>` : ''}
                ${item.notes ? `<span class="truncate max-w-xs">• <span class="italic text-slate-400">${item.notes}</span></span>` : ''}
              </div>
            </div>
          </div>

          <!-- Right: Signed Amount & Action Buttons -->
          <div class="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <div class="text-right rtl:text-left">
              ${isIncome ? `
                <span class="text-sm sm:text-base font-black text-emerald-600 tracking-tight whitespace-nowrap">
                  + ${(item.amount || 0).toFixed(3)} DT
                </span>
              ` : `
                <span class="text-sm sm:text-base font-black text-rose-600 tracking-tight whitespace-nowrap">
                  - ${(item.amount || 0).toFixed(3)} DT
                </span>
              `}
            </div>

            <!-- Actions -->
            ${item.expense_id ? `
              <div class="flex items-center gap-1">
                <button onclick="SettingsView.openExpenseModal(document, ${JSON.stringify(item).replace(/"/g, '&quot;')})" class="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-all" title="${isAr ? 'تعديل' : 'Modifier'}">
                  <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                </button>
                <button onclick="SettingsView.deleteExpense(document, ${item.expense_id}, '${item.title.replace(/'/g, "\\'")}')" class="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-xl transition-all" title="${isAr ? 'حذف' : 'Supprimer'}">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            ` : `
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50 shrink-0">
                <i data-lucide="check-circle" class="w-3 h-3 text-emerald-600"></i>
                ${isAr ? 'مقبوض' : 'Encaissé'}
              </span>
            `}
          </div>

        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
  },

  openExpenseModal(container, expense = null) {
    const isAr = I18n.currentLang === 'ar';
    const isEdit = !!expense && !!expense.expense_id;
    const expId = isEdit ? expense.expense_id : (expense ? expense.id : null);
    const today = new Date().toISOString().split('T')[0];

    Modal.open({
      title: isEdit ? (isAr ? 'تعديل النفقة / المصروف' : 'Modifier la Dépense') : (isAr ? 'إضافة عملية صرف جديدة' : 'Ajouter une Opération / Dépense'),
      html: `
        <form id="expense-modal-form" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">${isAr ? 'عنوان / بيان النفقة *' : 'Titre / Motif de la dépense *'}</label>
            <input id="exp-form-title" type="text" required value="${expense ? expense.title : ''}" placeholder="Ex: Achat de papier et fournitures pour examens..." class="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 font-semibold text-slate-900">
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">${isAr ? 'المبلغ (DT) *' : 'Montant de la dépense (DT) *'}</label>
              <input id="exp-form-amount" type="number" step="any" min="0.001" required value="${expense ? expense.amount : ''}" placeholder="Ex: 550.000" class="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 font-bold text-rose-600">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">${isAr ? 'التاريخ *' : 'Date de l\'opération *'}</label>
              <input id="exp-form-date" type="date" required value="${expense ? (expense.expense_date || expense.date) : today}" class="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 font-medium">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">${isAr ? 'الصنف' : 'Catégorie de charge'}</label>
            <select id="exp-form-cat" class="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 font-bold text-slate-700">
              <option value="Matériel" ${expense && expense.category === 'Matériel' ? 'selected' : ''}>Matériel & Fournitures</option>
              <option value="Transport" ${expense && expense.category === 'Transport' ? 'selected' : ''}>Transport & Déplacements</option>
              <option value="Impression" ${expense && expense.category === 'Impression' ? 'selected' : ''}>Photocopies & Impression</option>
              <option value="Loyer" ${expense && expense.category === 'Loyer' ? 'selected' : ''}>Loyer / Local</option>
              <option value="Internet" ${expense && expense.category === 'Internet' ? 'selected' : ''}>Internet & Électricité</option>
              <option value="Autre" ${!expense || expense.category === 'Autre' ? 'selected' : ''}>Autre charge</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">${isAr ? 'ملاحظات إضافية' : 'Notes / Remarques'}</label>
            <textarea id="exp-form-notes" rows="2" placeholder="${isAr ? 'تفاصيل إضافية...' : 'Référence facture, détails...'}" class="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 text-slate-700">${expense ? (expense.notes || '') : ''}</textarea>
          </div>

          <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button type="button" onclick="Modal.close()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all">
              ${isAr ? 'إلغاء' : 'Annuler'}
            </button>
            <button type="submit" class="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all">
              ${isAr ? 'حفظ العملية' : 'Enregistrer'}
            </button>
          </div>
        </form>
      `,
      onOpen: (content) => {
        const form = content.querySelector('#expense-modal-form');
        if (!form) return;
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const title = content.querySelector('#exp-form-title').value.trim();
          const amount = parseFloat(content.querySelector('#exp-form-amount').value);
          const expense_date = content.querySelector('#exp-form-date').value;
          const category = content.querySelector('#exp-form-cat').value;
          const notes = content.querySelector('#exp-form-notes').value.trim() || null;

          if (!amount || isNaN(amount) || amount <= 0) {
            Toast.error(isAr ? 'يرجى إدخال مبلغ صحيح أكبر من الصفر.' : 'Veuillez saisir un montant valide supérieur à zéro.');
            return;
          }

          // Verify available net balance
          try {
            const summary = await API.get('/api/expenses/summary');
            const currentNet = (summary && (summary.net_profit !== undefined ? summary.net_profit : summary.net_balance)) || 0;
            const availableNet = isEdit ? (currentNet + (expense.amount || 0)) : currentNet;

            if (amount > availableNet) {
              Toast.error(
                isAr 
                  ? `لا يمكن تسجيل نفقة (${amount.toFixed(3)} DT) تتجاوز صافي الأرباح المتوفرة (${availableNet.toFixed(3)} DT).`
                  : `Impossible d'enregistrer une dépense (${amount.toFixed(3)} DT) supérieure au bénéfice net disponible (${availableNet.toFixed(3)} DT).`
              );
              return;
            }
          } catch (sumErr) {
            console.warn('Could not verify net summary in client:', sumErr);
          }

          try {
            const payload = { title, amount, expense_date, category, notes };
            if (isEdit) {
              await API.put(`/api/expenses/${expId}`, payload);
              Toast.success(isAr ? 'تم تعديل النفقة !' : 'Dépense mise à jour !');
            } else {
              await API.post('/api/expenses', payload);
              Toast.success(isAr ? 'تم تسجيل النفقة بنجاح !' : 'Opération enregistrée avec succès !');
            }
            Modal.close();
            this.loadExpenses(document);
          } catch (err) {
            Toast.error(err.message || 'Erreur');
          }
        });
      }
    });
  },

  deleteExpense(container, expId, expTitle) {
    const isAr = I18n.currentLang === 'ar';
    Modal.confirm({
      title: isAr ? `حذف العملية "${expTitle}" ؟` : `Supprimer la dépense "${expTitle}" ?`,
      message: isAr ? "سيتم حذف هذه العملية وإعادة احتساب الرصيد الصافي." : "Cette opération sera définitivement supprimée et le solde net sera recalculé.",
      confirmText: isAr ? "نعم، حذف" : "Oui, Supprimer",
      onConfirm: async () => {
        try {
          await API.delete(`/api/expenses/${expId}`);
          Toast.success(isAr ? 'تم حذف العملية !' : 'Opération supprimée !');
          this.loadExpenses(document);
        } catch (e) {
          Toast.error(e.message || 'Erreur suppression');
        }
      }
    });
  },

  // -------------------------------------------------------------
  // BACKUP ACTIONS SECTION (ADMIN ONLY)
  // -------------------------------------------------------------
  bindBackupActions(container) {
    const isAr = I18n.currentLang === 'ar';

    // 1. Export JSON
    const exportBtn = container.querySelector('#export-json-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', async () => {
        try {
          const data = await API.get('/api/settings/export');
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
          const dlAnchor = document.createElement('a');
          dlAnchor.setAttribute("href", dataStr);
          dlAnchor.setAttribute("download", `etude_math_pro_backup_${new Date().toISOString().split('T')[0]}.json`);
          dlAnchor.click();
          Toast.success(isAr ? 'تم تحميل النسخة الاحتياطية بنجاح !' : 'Sauvegarde complète exportée avec succès !');
        } catch (err) {
          Toast.error(isAr ? 'خطأ أثناء التصدير.' : 'Erreur lors de l\'exportation.');
        }
      });
    }

    // 2. Import JSON
    const importInput = container.querySelector('#import-json-file');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Modal.confirm({
          title: isAr ? "استرجاع هذه النسخة الاحتياطية ؟" : "Restaurer cette sauvegarde ?",
          message: isAr ? "سيتم استبدال البيانات الحالية بمحتوى الملف المختار. هل ترغب في المتابعة ؟" : "L'importation remplacera les données actuelles par le contenu du fichier sélectionné. Voulez-vous continuer ?",
          confirmText: isAr ? "نعم، استرجاع" : "Oui, Restaurer",
          onConfirm: async () => {
            try {
              const reader = new FileReader();
              reader.onload = async (re) => {
                try {
                  const parsed = JSON.parse(re.target.result);
                  const res = await API.post('/api/settings/import', parsed);
                  Toast.success(res.message || (isAr ? 'تمت استعادة البيانات !' : 'Sauvegarde restaurée !'));
                  await State.loadInitialData();
                  app.navigate('#dashboard');
                } catch (parseErr) {
                  Toast.error(isAr ? 'ملف JSON غير صالح أو معطوب.' : 'Fichier JSON invalide ou corrompu.');
                }
              };
              reader.readAsText(file);
            } catch (err) {
              Toast.error(err.message || (isAr ? 'خطأ أثناء الاسترجاع.' : 'Erreur lors de la restauration.'));
            }
          }
        });
      });
    }

    // 3. Clean Customer Wipe (0 Élèves)
    const cleanBtn = container.querySelector('#clean-client-btn');
    if (cleanBtn) {
      cleanBtn.addEventListener('click', () => {
        Modal.confirm({
          title: isAr ? "تفريغ قاعدة البيانات (0 تلاميذ) ؟" : "Nettoyer pour Nouveau Client (Base Vierge) ?",
          message: isAr ? "⚠️ تنبيه : سيتم حذف كافة التلاميذ، الأفواج، الحصص والمدفوعات لتسليم قاعدة نظيفة تماماً." : "⚠️ Attention : Toutes les données actuelles (élèves, groupes, séances, paiements) seront définitivement effacées pour laisser une base 100% propre.",
          confirmText: isAr ? "نعم، تفريغ القاعدة" : "Oui, Nettoyer la Base",
          onConfirm: async () => {
            try {
              await API.post('/api/settings/clear-data', {});
              Toast.success(isAr ? 'تم تفريغ قاعدة البيانات بنجاح (0 تلاميذ) !' : 'Base de données nettoyée avec succès (0 élèves) !');
              await State.loadInitialData();
              app.navigate('#dashboard');
            } catch (err) {
              Toast.error(err.message);
            }
          }
        });
      });
    }
  },

  updateAvatarPreview(container, name) {
    const previewBox = container.querySelector('#avatar-preview-box');
    if (!previewBox) return;

    if (this.activeAvatar && (this.activeAvatar.startsWith('data:image') || this.activeAvatar.startsWith('http') || this.activeAvatar.startsWith('/'))) {
      previewBox.innerHTML = `<img src="${this.activeAvatar}" class="w-full h-full object-cover" alt="Avatar">`;
    } else if (this.activeAvatar && this.activeAvatar.length <= 4) {
      previewBox.innerHTML = `<span class="text-3xl sm:text-4xl">${this.activeAvatar}</span>`;
    } else {
      const parts = (name || 'Prof').trim().split(/\s+/);
      const initials = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
      previewBox.innerHTML = `<span id="avatar-preview-initials">${initials}</span>`;
    }
  }
};

