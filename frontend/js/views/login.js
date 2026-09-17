// Login & Registration View — 2026 Commercial Edition (Étude Math Pro)
const LoginView = {
  activeTab: 'login', // 'login' | 'register'

  render(container) {
    const isAr = I18n.currentLang === 'ar';

    container.innerHTML = `
      <div class="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 sm:p-10 animate-fade-in">
        
        <!-- Header -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-2xl shadow-lg shadow-brand-500/30 mb-3">
            ∑
          </div>
          <h1 class="text-2xl font-black tracking-tight text-slate-900">${I18n.t('appName')}</h1>
          <p class="text-xs text-slate-500 mt-0.5">${I18n.t('appSubtitle')}</p>
        </div>

        <!-- Tabs Switcher -->
        <div class="flex items-center p-1 bg-slate-100 rounded-2xl mb-6">
          <button id="tab-login-btn" type="button" class="flex-1 py-2 text-xs font-bold rounded-xl transition-all ${this.activeTab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}">
            ${I18n.t('login')}
          </button>
          <button id="tab-register-btn" type="button" class="flex-1 py-2 text-xs font-bold rounded-xl transition-all ${this.activeTab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}">
            ${I18n.t('register')}
          </button>
        </div>

        <!-- Login Form -->
        <form id="login-form" class="space-y-4 ${this.activeTab === 'login' ? '' : 'hidden'}">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" for="login-email">${I18n.t('email')}</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                <i data-lucide="mail" class="w-4 h-4"></i>
              </span>
              <input id="login-email" type="email" required placeholder="nom@exemple.com" class="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-slate-50/50">
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider" for="login-password">${I18n.t('password')}</label>
            </div>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                <i data-lucide="lock" class="w-4 h-4"></i>
              </span>
              <input id="login-password" type="password" required placeholder="••••••••" class="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-slate-50/50">
            </div>
          </div>

          <div class="flex items-center justify-between text-xs text-slate-600">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked class="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500">
              <span>${I18n.t('rememberMe')}</span>
            </label>
          </div>

          <button id="login-submit-btn" type="submit" class="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-6">
            <span>${I18n.t('login')}</span>
            <i data-lucide="arrow-right" class="w-4 h-4 rtl:rotate-180"></i>
          </button>
        </form>

        <!-- Register Form -->
        <form id="register-form" class="space-y-3.5 ${this.activeTab === 'register' ? '' : 'hidden'}">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1" for="reg-name">${I18n.t('fullName')} *</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                <i data-lucide="user" class="w-4 h-4"></i>
              </span>
              <input id="reg-name" type="text" required placeholder="Prof. Mohamed Ben Salem" class="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1" for="reg-email">${I18n.t('email')} *</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                <i data-lucide="mail" class="w-4 h-4"></i>
              </span>
              <input id="reg-email" type="email" required placeholder="prof@exemple.tn" class="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1" for="reg-phone">${I18n.t('phone')}</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                <i data-lucide="phone" class="w-4 h-4"></i>
              </span>
              <input id="reg-phone" type="tel" placeholder="+216 98 123 456" class="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1" for="reg-password">${I18n.t('password')} *</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                <i data-lucide="lock" class="w-4 h-4"></i>
              </span>
              <input id="reg-password" type="password" required minlength="6" placeholder="Au moins 6 caractères" class="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1" for="reg-currency">${I18n.t('currency')}</label>
              <select id="reg-currency" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:ring-2 focus:ring-brand-500 font-semibold" disabled>
                <option value="DT" selected>DT (Dinar Tunisien)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1" for="reg-year">${I18n.t('schoolYear')}</label>
              <input id="reg-year" type="text" value="2025-2026" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:ring-2 focus:ring-brand-500 font-semibold">
            </div>
          </div>

          <button id="reg-submit-btn" type="submit" class="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 mt-5">
            <i data-lucide="user-plus" class="w-4 h-4"></i>
            <span>${I18n.t('createAccount')}</span>
          </button>
        </form>

        <div class="mt-6 text-center border-t border-slate-100 pt-5">
          <p class="text-xs text-slate-400">Étude Math Pro &copy; 2026 — Plateforme sécurisée</p>
        </div>

      </div>
    `;

    if (window.lucide) lucide.createIcons();

    // Tab switcher events
    const tabLogin = container.querySelector('#tab-login-btn');
    const tabReg = container.querySelector('#tab-register-btn');
    const loginForm = container.querySelector('#login-form');
    const regForm = container.querySelector('#register-form');

    tabLogin.addEventListener('click', () => {
      this.activeTab = 'login';
      tabLogin.className = 'flex-1 py-2 text-xs font-bold rounded-xl transition-all bg-white text-slate-900 shadow-sm';
      tabReg.className = 'flex-1 py-2 text-xs font-bold rounded-xl transition-all text-slate-500 hover:text-slate-800';
      loginForm.classList.remove('hidden');
      regForm.classList.add('hidden');
    });

    tabReg.addEventListener('click', () => {
      this.activeTab = 'register';
      tabReg.className = 'flex-1 py-2 text-xs font-bold rounded-xl transition-all bg-white text-slate-900 shadow-sm';
      tabLogin.className = 'flex-1 py-2 text-xs font-bold rounded-xl transition-all text-slate-500 hover:text-slate-800';
      regForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
    });

    // Form Submit (Login)
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = container.querySelector('#login-email').value.trim();
      const password = container.querySelector('#login-password').value.trim();
      this.handleLogin(email, password);
    });

    // Form Submit (Register)
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const payload = {
        name: container.querySelector('#reg-name').value.trim(),
        email: container.querySelector('#reg-email').value.trim(),
        phone: container.querySelector('#reg-phone').value.trim() || null,
        password: container.querySelector('#reg-password').value.trim(),
        currency: 'DT',
        school_year: container.querySelector('#reg-year').value.trim() || '2025-2026'
      };
      this.handleRegister(payload);
    });
  },

  async handleLogin(email, password) {
    const btn = document.getElementById('login-submit-btn');
    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Connexion...';
      if (window.lucide) lucide.createIcons();
    }

    try {
      const res = await API.post('/api/auth/login', { email, password });
      API.setToken(res.access_token);
      API.setUser(res.user);
      Toast.success(`Bienvenue, ${res.user.name} !`);
      
      // Load initial state and navigate to dashboard
      await State.loadInitialData();
      app.showApp();
      window.location.hash = '#dashboard';
    } catch (err) {
      Toast.error(err.message || 'Identifiants invalides');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
        if (window.lucide) lucide.createIcons();
      }
    }
  },

  async handleRegister(payload) {
    const btn = document.getElementById('reg-submit-btn');
    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Création du compte...';
      if (window.lucide) lucide.createIcons();
    }

    try {
      const res = await API.post('/api/auth/register', payload);
      API.setToken(res.access_token);
      API.setUser(res.user);
      Toast.success(`Votre compte Enseignant a été créé avec succès ! Bienvenue ${res.user.name}.`);
      
      // Load initial state and navigate to dashboard
      await State.loadInitialData();
      app.showApp();
      window.location.hash = '#dashboard';
    } catch (err) {
      Toast.error(err.message || 'Erreur lors de la création du compte');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalText;
        if (window.lucide) lucide.createIcons();
      }
    }
  }
};

