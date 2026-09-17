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
    toast.className = `toast-item toast-${type} animate-fade-in`;

    const icon = this.getIcon(type);
    toast.innerHTML = `
      <div class="toast-icon-circle">${icon}</div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-slate-800 leading-snug">${message}</p>
      </div>
      <button class="shrink-0 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors ml-1 rtl:ml-0 rtl:mr-1">
        <i data-lucide="x" class="w-3.5 h-3.5"></i>
      </button>
      <div class="toast-progress toast-progress-${type}"></div>
    `;

    const closeBtn = toast.querySelector('button');
    closeBtn.addEventListener('click', () => this.dismiss(toast));

    this.container.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    setTimeout(() => { this.dismiss(toast); }, duration);
  },

  dismiss(toast) {
    toast.classList.add('toast-exiting');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
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
    return '';
  },

  getIcon(type) {
    switch (type) {
      case 'success':
        return '<i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i>';
      case 'error':
        return '<i data-lucide="x-circle" class="w-4 h-4 text-rose-600"></i>';
      case 'warning':
        return '<i data-lucide="alert-triangle" class="w-4 h-4 text-amber-600"></i>';
      default:
        return '<i data-lucide="info" class="w-4 h-4 text-indigo-600"></i>';
    }
  }
};
