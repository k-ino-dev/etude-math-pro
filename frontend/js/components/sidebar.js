// Sidebar & Navigation Component
const Sidebar = {
  mobileDrawer: null,

  init() {
    this.mobileDrawer = document.getElementById('mobile-drawer');

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const closeDrawerBtn = document.getElementById('close-mobile-drawer');
    const backdrop = document.getElementById('mobile-drawer-backdrop');

    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => this.openMobileDrawer());
    }
    if (closeDrawerBtn) {
      closeDrawerBtn.addEventListener('click', () => this.closeMobileDrawer());
    }
    if (backdrop) {
      backdrop.addEventListener('click', () => this.closeMobileDrawer());
    }

    // Close drawer when any mobile nav link is clicked
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => this.closeMobileDrawer());
    });
  },

  openMobileDrawer() {
    if (this.mobileDrawer) {
      this.mobileDrawer.classList.remove('hidden');
      if (window.lucide) lucide.createIcons();
    }
  },

  closeMobileDrawer() {
    if (this.mobileDrawer) {
      this.mobileDrawer.classList.add('hidden');
    }
  },

  setActiveRoute(route) {
    const cleanRoute = (route || 'dashboard').split('/')[0].replace('#', '');

    // Desktop sidebar
    document.querySelectorAll('.nav-link').forEach(link => {
      const linkRoute = link.getAttribute('data-route');
      link.classList.toggle('active', linkRoute === cleanRoute);
    });

    // Mobile drawer
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      const linkRoute = link.getAttribute('data-route');
      link.classList.toggle('active', linkRoute === cleanRoute);
    });

    // Mobile bottom navigation
    document.querySelectorAll('.mobile-bottom-nav').forEach(link => {
      const linkRoute = link.getAttribute('data-route');
      link.classList.toggle('active', linkRoute === cleanRoute);
    });
  }
};
