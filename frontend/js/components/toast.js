// Toast Notification System
const Toast = {
  container: null,

  init() {
    this.container = document.getElementById('toast-container');
  },

  show(message, type = 'info', duration = 3500) {
    if (!this.container) this.init();
    if (!this.container) return;

    const toast = document.createElement('div');
    toast.className = `flex items-center gap-3 p-4 rounded-xl shadow-lg border text-sm font-medium transition-all transform duration-300 pointer-events-auto animate-fade-in ${this.getTheme(type)}`;

    const icon = this.getIcon(type);
    toast.innerHTML = `
      <div class="shrink-0">${icon}</div>
      <div class="flex-1 text-slate-800">${message}</div>
      <button class="shrink-0 text-slate-400 hover:text-slate-600 p-1 rounded">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    `;

    // Close button handler
    const closeBtn = toast.querySelector('button');
    closeBtn.addEventListener('click', () => this.dismiss(toast));

    this.container.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      this.dismiss(toast);
    }, duration);
  },

  dismiss(toast) {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  },

  success(msg, duration) {
    this.show(msg, 'success', duration);
  },

  error(msg, duration = 5000) {
    this.show(msg, 'error', duration);
  },

  warning(msg, duration) {
    this.show(msg, 'warning', duration);
  },

  info(msg, duration) {
    this.show(msg, 'info', duration);
  },

  getTheme(type) {
    switch (type) {
      case 'success':
        return 'bg-white border-emerald-200 text-emerald-900 border-l-4 border-l-emerald-500 shadow-emerald-500/10';
      case 'error':
        return 'bg-white border-rose-200 text-rose-900 border-l-4 border-l-rose-500 shadow-rose-500/10';
      case 'warning':
        return 'bg-white border-amber-200 text-amber-900 border-l-4 border-l-amber-500 shadow-amber-500/10';
      default:
        return 'bg-white border-slate-200 text-slate-900 border-l-4 border-l-brand-500 shadow-brand-500/10';
    }
  },

  getIcon(type) {
    switch (type) {
      case 'success':
        return '<i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-500"></i>';
      case 'error':
        return '<i data-lucide="alert-circle" class="w-5 h-5 text-rose-500"></i>';
      case 'warning':
        return '<i data-lucide="alert-triangle" class="w-5 h-5 text-amber-500"></i>';
      default:
        return '<i data-lucide="info" class="w-5 h-5 text-brand-500"></i>';
    }
  }
};
