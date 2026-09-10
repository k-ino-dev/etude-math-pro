// Dynamic Modal Component
const Modal = {
  container: null,
  backdrop: null,
  content: null,

  init() {
    this.container = document.getElementById('modal-container');
    this.backdrop = document.getElementById('modal-backdrop');
    this.content = document.getElementById('modal-content');

    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.close());
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.container.classList.contains('hidden')) {
        this.close();
      }
    });
  },

  open({ title, html, content, size = 'max-w-xl', showClose = true, onOpen = null }) {
    if (!this.container) this.init();

    const bodyHtml = html !== undefined ? html : (content !== undefined ? content : '');

    this.content.className = `relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full ${size} border border-slate-100 animate-fade-in`;

    this.content.innerHTML = `
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 class="text-base font-bold text-slate-900" id="modal-title">${title || ''}</h3>
        ${showClose ? `
          <button id="modal-close-btn" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        ` : ''}
      </div>
      <div class="p-6 max-h-[80vh] overflow-y-auto">
        ${bodyHtml}
      </div>
    `;

    const closeBtn = this.content.querySelector('#modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    this.container.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');

    if (window.lucide) lucide.createIcons();
    if (onOpen) onOpen(this.content);
  },

  close() {
    if (!this.container) return;
    this.container.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    if (this.content) this.content.innerHTML = '';
  },

  confirm({ title = 'Confirmation', message = 'Êtes-vous sûr de vouloir continuer ?', confirmText = 'Confirmer', cancelText = 'Annuler', onConfirm }) {
    this.open({
      title,
      size: 'max-w-md',
      html: `
        <div class="space-y-4">
          <p class="text-sm text-slate-600">${message}</p>
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button id="modal-cancel-btn" class="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              ${cancelText}
            </button>
            <button id="modal-confirm-btn" class="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors">
              ${confirmText}
            </button>
          </div>
        </div>
      `,
      onOpen: (content) => {
        content.querySelector('#modal-cancel-btn').addEventListener('click', () => this.close());
        content.querySelector('#modal-confirm-btn').addEventListener('click', async () => {
          this.close();
          if (onConfirm) await onConfirm();
        });
      }
    });
  }
};
