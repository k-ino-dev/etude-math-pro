// Settings View — Commercial SaaS Edition (Étude Math Pro)
const SettingsView = {
  activeAvatar: null,
  activeTab: 'profile', // 'profile', 'display', 'backup'

  async render(container) {
    const isAr = I18n.currentLang === 'ar';

    container.innerHTML = `
      <div class="space-y-8 animate-fade-in max-w-4xl mx-auto pb-12">
        
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
              ${isAr ? 'تخصيص الملف الشخصي للأستاذ، إعدادات العرض واللغة، والنسخ الاحتياطي.' : 'Personnalisez votre profil enseignant, configurez la langue et gérez vos sauvegardes sécurisées.'}
            </p>
          </div>

          <!-- Tab Navigation Pill -->
          <div class="flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 shrink-0">
            <button type="button" id="tab-btn-profile" class="settings-tab-btn px-4 py-2 text-xs font-bold rounded-xl transition-all ${this.activeTab === 'profile' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'} flex items-center gap-2">
              <i data-lucide="user" class="w-3.5 h-3.5"></i>
              <span>${I18n.t('profile')}</span>
            </button>
            <button type="button" id="tab-btn-display" class="settings-tab-btn px-4 py-2 text-xs font-bold rounded-xl transition-all ${this.activeTab === 'display' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'} flex items-center gap-2">
              <i data-lucide="globe" class="w-3.5 h-3.5"></i>
              <span>${isAr ? 'اللغة والعرض' : 'Langue & Affichage'}</span>
            </button>
            <button type="button" id="tab-btn-backup" class="settings-tab-btn px-4 py-2 text-xs font-bold rounded-xl transition-all ${this.activeTab === 'backup' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'} flex items-center gap-2">
              <i data-lucide="database" class="w-3.5 h-3.5"></i>
              <span>${isAr ? 'النسخ الاحتياطي' : 'Sauvegardes'}</span>
            </button>
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

        <!-- TAB 3: Data Management & Backups -->
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

      </div>
    `;

    if (window.lucide) lucide.createIcons();

    this.bindTabs(container);
    await this.loadProfile(container);
    this.bindBackupActions(container);
  },

  bindTabs(container) {
    const tabs = ['profile', 'display', 'backup'];
    tabs.forEach(tab => {
      const btn = container.querySelector(`#tab-btn-${tab}`);
      if (btn) {
        btn.addEventListener('click', () => {
          this.activeTab = tab;
          tabs.forEach(t => {
            const b = container.querySelector(`#tab-btn-${t}`);
            const content = container.querySelector(`#tab-content-${t}`);
            if (b) {
              b.className = `settings-tab-btn px-4 py-2 text-xs font-bold rounded-xl transition-all ${t === tab ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'} flex items-center gap-2`;
            }
            if (content) {
              content.classList.toggle('hidden', t !== tab);
            }
          });
          if (window.lucide) lucide.createIcons();
        });
      }
    });
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

    // Preset Avatars
    container.querySelectorAll('.avatar-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.getAttribute('data-preset');
        this.activeAvatar = preset;
        this.updateAvatarPreview(container, nameInput ? nameInput.value : '');
      });
    });

    // File Upload for Avatar
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

    // Reset Avatar
    const resetAvatarBtn = container.querySelector('#avatar-reset-btn');
    if (resetAvatarBtn) {
      resetAvatarBtn.addEventListener('click', () => {
        this.activeAvatar = null;
        this.updateAvatarPreview(container, nameInput ? nameInput.value : '');
      });
    }

    // Profile Form Submit
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

    // 3. Clear Customer Data (Base Vierge)
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
