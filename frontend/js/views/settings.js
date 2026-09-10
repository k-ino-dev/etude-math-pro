// Settings View — Commercial Edition (Étude Math Pro)
const SettingsView = {
  activeAvatar: null,
  activeTab: 'profile', // 'profile', 'whatsapp', 'backup'

  async render(container) {
    container.innerHTML = `
      <div class="space-y-8 animate-fade-in max-w-4xl mx-auto pb-12">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold shadow-sm">
                <i data-lucide="settings" class="w-5 h-5"></i>
              </div>
              Paramètres du Compte & Application
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">Personnalisez votre profil enseignant, configurez les notifications WhatsApp et gérez vos sauvegardes.</p>
          </div>

          <!-- Tab Navigation Pill -->
          <div class="flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 shrink-0">
            <button type="button" id="tab-btn-profile" class="settings-tab-btn px-4 py-2 text-xs font-bold rounded-xl transition-all ${this.activeTab === 'profile' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'} flex items-center gap-2">
              <i data-lucide="user" class="w-3.5 h-3.5"></i> Profil Enseignant
            </button>
            <button type="button" id="tab-btn-whatsapp" class="settings-tab-btn px-4 py-2 text-xs font-bold rounded-xl transition-all ${this.activeTab === 'whatsapp' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'} flex items-center gap-2">
              <i data-lucide="message-square" class="w-3.5 h-3.5"></i> WhatsApp
            </button>
            <button type="button" id="tab-btn-backup" class="settings-tab-btn px-4 py-2 text-xs font-bold rounded-xl transition-all ${this.activeTab === 'backup' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'} flex items-center gap-2">
              <i data-lucide="database" class="w-3.5 h-3.5"></i> Sauvegardes
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
                <h2 class="text-base font-bold text-slate-900">Identité & Coordonnées Professionnelles</h2>
                <p class="text-xs text-slate-500">Ces informations apparaissent sur vos reçus de cotisations, vos rapports et vos messages.</p>
              </div>
            </div>

            <form id="settings-profile-form" class="space-y-6">
              
              <!-- Avatar Selection Section -->
              <div class="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-4">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Photo de Profil / Avatar</label>
                
                <div class="flex flex-col sm:flex-row items-center gap-6">
                  
                  <!-- Avatar Preview -->
                  <div class="relative group shrink-0">
                    <div id="avatar-preview-box" class="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-md overflow-hidden border-2 border-white ring-4 ring-brand-100 transition-transform group-hover:scale-105">
                      <span id="avatar-preview-initials">MB</span>
                    </div>
                  </div>

                  <!-- Avatar Actions -->
                  <div class="flex-1 space-y-3 text-center sm:text-left">
                    <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                      <label class="cursor-pointer px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2">
                        <i data-lucide="upload" class="w-3.5 h-3.5 text-brand-600"></i> Importer une photo
                        <input id="avatar-file-input" type="file" accept="image/*" class="hidden">
                      </label>
                      
                      <button type="button" id="avatar-reset-btn" class="px-3 py-2 bg-slate-200/70 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5">
                        <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Initiales
                      </button>
                    </div>

                    <!-- Quick Avatar Presets -->
                    <div>
                      <p class="text-[11px] font-semibold text-slate-400 mb-1.5">Ou choisir un avatar prédéfini :</p>
                      <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
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
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nom & Prénom complet *</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <i data-lucide="user" class="w-4 h-4"></i>
                    </div>
                    <input id="set-name" type="text" required placeholder="Ex: Prof. Mohamed Ben Salem" class="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-semibold text-slate-900 transition-all">
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email de connexion *</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <i data-lucide="mail" class="w-4 h-4"></i>
                    </div>
                    <input id="set-email" type="email" required placeholder="admin@mathprof.tn" class="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-medium text-slate-900 transition-all">
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Téléphone professionnel</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <i data-lucide="phone" class="w-4 h-4"></i>
                    </div>
                    <input id="set-phone" type="text" placeholder="+216 98 123 456" class="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-medium text-slate-900 transition-all">
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Devise des Tarifs</label>
                  <select id="set-currency" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white font-bold text-brand-700 transition-all">
                    <option value="DT">Dinar Tunisien (DT)</option>
                    <option value="€">Euro (€)</option>
                    <option value="$">Dollar ($)</option>
                    <option value="MAD">Dirham Marocain (MAD)</option>
                    <option value="DZD">Dinar Algérien (DZD)</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Année Scolaire</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <i data-lucide="calendar" class="w-4 h-4"></i>
                    </div>
                    <input id="set-year" type="text" value="2025-2026" placeholder="2025-2026" class="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-medium text-slate-900 transition-all">
                  </div>
                </div>
              </div>

              <!-- Password Change Section -->
              <div class="pt-4 border-t border-slate-100">
                <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <i data-lucide="lock" class="w-3.5 h-3.5 text-slate-500"></i> Sécurité & Mot de passe
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-[11px] font-semibold text-slate-500 mb-1">Nouveau mot de passe</label>
                    <input id="set-password" type="password" placeholder="Laisser vide pour ne pas modifier" class="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500">
                  </div>
                  <div>
                    <label class="block text-[11px] font-semibold text-slate-500 mb-1">Confirmer le nouveau mot de passe</label>
                    <input id="set-password-confirm" type="password" placeholder="Confirmer le nouveau mot de passe" class="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500">
                  </div>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="pt-6 border-t border-slate-100 flex items-center justify-end">
                <button type="submit" id="save-profile-btn" class="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-600/25 transition-all flex items-center gap-2">
                  <i data-lucide="check" class="w-4 h-4"></i> Enregistrer les Modifications
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- TAB 2: WhatsApp Notifications & Planning -->
        <div id="tab-content-whatsapp" class="space-y-6 ${this.activeTab === 'whatsapp' ? '' : 'hidden'}">
          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                  <i data-lucide="message-circle" class="w-4 h-4"></i>
                </div>
                <div>
                  <h2 class="text-base font-bold text-slate-900">Notifications Automatiques WhatsApp</h2>
                  <p class="text-xs text-slate-500">Envoi quotidien du planning de vos séances du lendemain sur votre WhatsApp.</p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button type="button" id="send-schedule-now-btn" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2">
                  <i data-lucide="send" class="w-3.5 h-3.5"></i> Envoyer le planning de demain
                </button>
              </div>
            </div>

            <form id="settings-whatsapp-form" class="space-y-6">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
                
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Numéro WhatsApp Récepteur *</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <i data-lucide="phone" class="w-4 h-4"></i>
                    </div>
                    <input id="wa-phone" type="text" required placeholder="+216 98 123 456" class="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-semibold text-slate-900">
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Heure d'Envoi Quotidien</label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <i data-lucide="clock" class="w-4 h-4"></i>
                    </div>
                    <input id="wa-time" type="time" value="20:00" class="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-bold text-slate-900">
                  </div>
                  <p class="text-[10px] text-slate-400 mt-1">Par défaut : 20:00 chaque soir</p>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Fournisseur d'Envoi</label>
                  <select id="wa-provider" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 bg-white font-semibold text-slate-800">
                    <option value="simulation">Mode Simulation Locale (Sans frais / Hors-ligne)</option>
                    <option value="ultramsg">UltraMsg API (Envoi direct)</option>
                    <option value="webhook">Webhook Personnalisé</option>
                  </select>
                </div>

              </div>

              <!-- UltraMsg Config Details -->
              <div id="wa-ultramsg-fields" class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4 hidden">
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">UltraMsg Instance ID</label>
                  <input id="wa-instance" type="text" placeholder="instance12345" class="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl">
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">UltraMsg Token</label>
                  <input id="wa-token" type="text" placeholder="token_abc123" class="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl">
                </div>
              </div>

              <!-- Webhook Config Details -->
              <div id="wa-webhook-fields" class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hidden">
                <label class="block text-[11px] font-bold text-slate-600 mb-1">URL Webhook</label>
                <input id="wa-webhook-url" type="url" placeholder="https://votre-serveur.com/api/whatsapp" class="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl">
              </div>

              <div class="flex items-center justify-between pt-4 border-t border-slate-100">
                <button type="button" id="wa-test-btn" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-2">
                  <i data-lucide="play" class="w-3.5 h-3.5 text-brand-600"></i> Tester la connexion WhatsApp
                </button>

                <button type="submit" id="wa-save-btn" class="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2">
                  <i data-lucide="check" class="w-4 h-4"></i> Enregistrer les paramètres WhatsApp
                </button>
              </div>
            </form>

            <!-- Notification Logs History -->
            <div class="pt-6 border-t border-slate-100 space-y-3">
              <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <i data-lucide="history" class="w-3.5 h-3.5 text-slate-400"></i> Journal des Envois Récents
              </h3>
              <div id="wa-logs-container" class="space-y-2 max-h-60 overflow-y-auto">
                <p class="text-xs text-slate-400 italic">Chargement du journal...</p>
              </div>
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
                <h2 class="text-base font-bold text-slate-900">Sauvegarde, Restauration & Déploiement</h2>
                <p class="text-xs text-slate-500">Sécurisez vos élèves et plannings, restaurez une sauvegarde ou préparez une base propre.</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <!-- Export JSON Card -->
              <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3 flex flex-col justify-between">
                <div>
                  <div class="flex items-center gap-2 text-slate-800 font-bold text-sm">
                    <i data-lucide="download-cloud" class="w-4 h-4 text-brand-600"></i>
                    <span>Sauvegarde Complète (JSON)</span>
                  </div>
                  <p class="text-xs text-slate-500 mt-1.5">Téléchargez l'intégralité de vos élèves, groupes, séances, présences et paiements en un fichier sécurisé.</p>
                </div>
                <button id="export-json-btn" class="w-full py-2.5 px-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2">
                  <i data-lucide="download" class="w-3.5 h-3.5 text-brand-600"></i> Télécharger ma sauvegarde
                </button>
              </div>

              <!-- Import JSON Card -->
              <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3 flex flex-col justify-between">
                <div>
                  <div class="flex items-center gap-2 text-slate-800 font-bold text-sm">
                    <i data-lucide="upload-cloud" class="w-4 h-4 text-indigo-600"></i>
                    <span>Restaurer une Sauvegarde</span>
                  </div>
                  <p class="text-xs text-slate-500 mt-1.5">Importez un fichier JSON préalablement sauvegardé pour restaurer vos données sur ce PC.</p>
                </div>
                <label class="cursor-pointer w-full py-2.5 px-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2">
                  <i data-lucide="folder-open" class="w-3.5 h-3.5 text-indigo-600"></i> Choisir un fichier de sauvegarde
                  <input id="import-json-file" type="file" accept=".json" class="hidden">
                </label>
              </div>

              <!-- Reset Demo Card -->
              <div class="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-3 flex flex-col justify-between">
                <div>
                  <div class="flex items-center gap-2 text-amber-950 font-bold text-sm">
                    <i data-lucide="refresh-cw" class="w-4 h-4 text-amber-600"></i>
                    <span>Restaurer les Données Démo</span>
                  </div>
                  <p class="text-xs text-amber-800 mt-1.5">Restaure le jeu de démonstration complet (30 élèves, 5 groupes, cotisations) pour tester l'application.</p>
                </div>
                <button id="reset-demo-btn" class="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2">
                  <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> Charger les données démo
                </button>
              </div>

              <!-- Clean Customer Wipe Card -->
              <div class="p-5 rounded-2xl bg-rose-50/60 border border-rose-200/70 space-y-3 flex flex-col justify-between">
                <div>
                  <div class="flex items-center gap-2 text-rose-950 font-bold text-sm">
                    <i data-lucide="trash-2" class="w-4 h-4 text-rose-600"></i>
                    <span>Base Vierge (Nouveau Client)</span>
                  </div>
                  <p class="text-xs text-rose-800 mt-1.5">Supprime toutes les données de test pour laisser une base propre à 0 élèves prête pour un nouveau professeur.</p>
                </div>
                <button id="clean-client-btn" class="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Nettoyer la base (0 élèves)
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
    await this.loadWhatsAppSettings(container);
    this.bindBackupActions(container);
  },

  bindTabs(container) {
    const tabs = ['profile', 'whatsapp', 'backup'];
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
          if (tab === 'whatsapp') this.loadWhatsAppLogs(container);
        });
      }
    });
  },

  async loadProfile(container) {
    let user = State.user;
    try {
      const fetched = await API.get('/api/auth/me');
      if (fetched) user = fetched;
    } catch (e) {
      console.warn('Profile fetch fallback:', e);
    }

    user = user || {
      name: 'Prof. Mohamed Ben Salem',
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
    if (currSelect) currSelect.value = user.currency || 'DT';
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
            Toast.warning('L\'image dépasse 2 Mo.');
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
          Toast.error('Les mots de passe saisis ne correspondent pas.');
          return;
        }

        const saveBtn = container.querySelector('#save-profile-btn');
        if (saveBtn) {
          saveBtn.disabled = true;
          saveBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Enregistrement...';
          if (window.lucide) lucide.createIcons();
        }

        const payload = {
          name: (nameInput ? nameInput.value : '').trim(),
          email: (emailInput ? emailInput.value : '').trim(),
          phone: (phoneInput ? phoneInput.value : '').trim() || null,
          avatar: this.activeAvatar,
          currency: currSelect ? currSelect.value : 'DT',
          school_year: (yearInput ? yearInput.value : '').trim()
        };

        if (pwd) payload.password = pwd;

        try {
          const updated = await API.put('/api/auth/profile', payload);
          State.user = updated;
          State.currency = updated.currency;
          API.setUser(updated);
          State.updateBadges();

          // Sync phone to WhatsApp form if empty
          const waPhoneInput = container.querySelector('#wa-phone');
          if (waPhoneInput && !waPhoneInput.value && updated.phone) {
            waPhoneInput.value = updated.phone;
          }

          if (window.confetti) {
            confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
          }

          Toast.success('Profil enseignant enregistré avec succès !');
          if (container.querySelector('#set-password')) container.querySelector('#set-password').value = '';
          if (container.querySelector('#set-password-confirm')) container.querySelector('#set-password-confirm').value = '';
        } catch (err) {
          Toast.error(err.message || 'Erreur lors de la mise à jour du profil.');
        } finally {
          if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> Enregistrer les Modifications';
            if (window.lucide) lucide.createIcons();
          }
        }
      });
    }
  },

  async loadWhatsAppSettings(container) {
    try {
      const setting = await API.get('/api/whatsapp/settings');
      
      const phoneInput = container.querySelector('#wa-phone');
      const timeInput = container.querySelector('#wa-time');
      const providerSelect = container.querySelector('#wa-provider');
      const instanceInput = container.querySelector('#wa-instance');
      const tokenInput = container.querySelector('#wa-token');
      const webhookInput = container.querySelector('#wa-webhook-url');

      if (phoneInput) phoneInput.value = setting.whatsapp_phone || '+216 98 123 456';
      if (timeInput) timeInput.value = setting.daily_schedule_time || '20:00';
      if (providerSelect) providerSelect.value = setting.provider || 'simulation';
      if (instanceInput) instanceInput.value = setting.ultramsg_instance_id || '';
      if (tokenInput) tokenInput.value = setting.ultramsg_token || '';
      if (webhookInput) webhookInput.value = setting.webhook_url || '';

      const toggleProviderFields = () => {
        const p = providerSelect ? providerSelect.value : 'simulation';
        const ultraFields = container.querySelector('#wa-ultramsg-fields');
        const webhookFields = container.querySelector('#wa-webhook-fields');
        if (ultraFields) ultraFields.classList.toggle('hidden', p !== 'ultramsg');
        if (webhookFields) webhookFields.classList.toggle('hidden', p !== 'webhook');
      };

      if (providerSelect) {
        providerSelect.addEventListener('change', toggleProviderFields);
        toggleProviderFields();
      }

      // WhatsApp Form Submit
      const waForm = container.querySelector('#settings-whatsapp-form');
      if (waForm) {
        waForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const saveBtn = container.querySelector('#wa-save-btn');
          if (saveBtn) saveBtn.disabled = true;

          try {
            const payload = {
              whatsapp_phone: phoneInput.value.trim(),
              daily_schedule_time: timeInput.value.trim(),
              provider: providerSelect.value,
              ultramsg_instance_id: instanceInput ? instanceInput.value.trim() : null,
              ultramsg_token: tokenInput ? tokenInput.value.trim() : null,
              webhook_url: webhookInput ? webhookInput.value.trim() : null
            };

            await API.put('/api/whatsapp/settings', payload);
            Toast.success('Paramètres WhatsApp enregistrés avec succès !');
          } catch (err) {
            Toast.error(err.message || 'Erreur d\'enregistrement WhatsApp.');
          } finally {
            if (saveBtn) saveBtn.disabled = false;
          }
        });
      }

      // WhatsApp Test Button
      const testBtn = container.querySelector('#wa-test-btn');
      if (testBtn) {
        testBtn.addEventListener('click', async () => {
          testBtn.disabled = true;
          testBtn.innerHTML = '<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i> Envoi du test...';
          if (window.lucide) lucide.createIcons();

          try {
            const phone = phoneInput ? phoneInput.value.trim() : null;
            const res = await API.post('/api/whatsapp/test', { phone });
            Toast.success(res.message || 'Test WhatsApp effectué avec succès !');
            await this.loadWhatsAppLogs(container);
          } catch (err) {
            Toast.error(err.message || 'Échec du test WhatsApp.');
          } finally {
            testBtn.disabled = false;
            testBtn.innerHTML = '<i data-lucide="play" class="w-3.5 h-3.5 text-brand-600"></i> Tester la connexion WhatsApp';
            if (window.lucide) lucide.createIcons();
          }
        });
      }

      // Immediate Send Schedule Now
      const sendNowBtn = container.querySelector('#send-schedule-now-btn');
      if (sendNowBtn) {
        sendNowBtn.addEventListener('click', async () => {
          sendNowBtn.disabled = true;
          sendNowBtn.innerHTML = '<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i> Envoi en cours...';
          if (window.lucide) lucide.createIcons();

          try {
            const res = await API.post('/api/whatsapp/send-schedule-now', { force: true });
            Toast.success(`Planning envoyé ! (${res.total_sessions || 0} séances)`);
            await this.loadWhatsAppLogs(container);
          } catch (err) {
            Toast.error(err.message || 'Erreur lors de l\'envoi immédiat.');
          } finally {
            sendNowBtn.disabled = false;
            sendNowBtn.innerHTML = '<i data-lucide="send" class="w-3.5 h-3.5"></i> Envoyer le planning de demain';
            if (window.lucide) lucide.createIcons();
          }
        });
      }

    } catch (e) {
      console.warn('Error loading WhatsApp settings:', e);
    }
  },

  async loadWhatsAppLogs(container) {
    const logsBox = container.querySelector('#wa-logs-container');
    if (!logsBox) return;

    try {
      const logs = await API.get('/api/whatsapp/logs?limit=10');
      if (!logs || logs.length === 0) {
        logsBox.innerHTML = '<p class="text-xs text-slate-400 italic">Aucune notification envoyée pour le moment.</p>';
        return;
      }

      logsBox.innerHTML = logs.map(l => `
        <div class="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full ${l.status === 'sent' ? 'bg-emerald-500' : l.status === 'simulated' ? 'bg-blue-500' : 'bg-rose-500'}"></span>
            <span class="font-bold text-slate-800">${l.type === 'daily_schedule' ? '📅 Planning Quotidien' : '🔔 Test'}</span>
            <span class="text-slate-400">vers ${l.recipient}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded-md font-semibold text-[10px] ${l.status === 'sent' ? 'bg-emerald-100 text-emerald-700' : l.status === 'simulated' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}">${l.status.toUpperCase()}</span>
            <span class="text-[10px] text-slate-400">${new Date(l.sent_at).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</span>
          </div>
        </div>
      `).join('');

    } catch (e) {
      logsBox.innerHTML = '<p class="text-xs text-slate-400 italic">Impossible de charger le journal.</p>';
    }
  },

  bindBackupActions(container) {
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
          Toast.success('Sauvegarde complète exportée avec succès !');
        } catch (err) {
          Toast.error('Erreur lors de l\'exportation.');
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
          title: "Restaurer cette sauvegarde ?",
          message: "L'importation remplacera les données actuelles par le contenu du fichier sélectionné. Voulez-vous continuer ?",
          confirmText: "Oui, Restaurer",
          onConfirm: async () => {
            try {
              const reader = new FileReader();
              reader.onload = async (re) => {
                try {
                  const parsed = JSON.parse(re.target.result);
                  const res = await API.post('/api/settings/import', parsed);
                  Toast.success(res.message || 'Sauvegarde restaurée !');
                  await State.loadInitialData();
                  app.navigate('#dashboard');
                } catch (parseErr) {
                  Toast.error('Fichier JSON invalide ou corrompu.');
                }
              };
              reader.readAsText(file);
            } catch (err) {
              Toast.error(err.message || 'Erreur lors de la restauration.');
            }
          }
        });
      });
    }

    // 3. Reset Demo Data
    const resetBtn = container.querySelector('#reset-demo-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        Modal.confirm({
          title: "Charger les données de démonstration ?",
          message: "Restaure 30 élèves, 5 groupes et cotisations de test pour explorer toutes les fonctionnalités.",
          confirmText: "Oui, Charger Démo",
          onConfirm: async () => {
            try {
              await API.post('/api/settings/reset-demo', {});
              Toast.success('Données démo restaurées !');
              await State.loadInitialData();
              app.navigate('#dashboard');
            } catch (err) {
              Toast.error(err.message);
            }
          }
        });
      });
    }

    // 4. Clear Customer Data (Base Vierge)
    const cleanBtn = container.querySelector('#clean-client-btn');
    if (cleanBtn) {
      cleanBtn.addEventListener('click', () => {
        Modal.confirm({
          title: "Nettoyer pour Nouveau Client (Base Vierge) ?",
          message: "⚠️ Attention : Toutes les données de démonstration (élèves, groupes, séances, paiements) seront définitivement effacées pour livrer une base 100% propre.",
          confirmText: "Oui, Nettoyer la Base",
          onConfirm: async () => {
            try {
              await API.post('/api/settings/clear-data', {});
              Toast.success('Base de données nettoyée avec succès (0 élèves) !');
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
