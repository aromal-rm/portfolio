/**
 * Main JavaScript functionality for Aromal RM Portfolio
 * Handles navigation, theme switching, and general interactions
 */

class PortfolioApp {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initializeTheme();
    this.setupScrollIndicator();
    this.setupSmoothScrolling();
    this.setupHeaderScroll();
    this.setupMobileNavigation();
    // this.setupCustomCursor();
    this.computeSectionBounds = this.computeSectionBounds.bind(this);
    this.registerScrollHandler();
    window.addEventListener('resize', utils.debounce(() => {
      this.computeSectionBounds(true);
    }, 150), { passive: true });
  }

  // handleResize() {
  //   // Close mobile nav on resize to desktop
  //   if (window.innerWidth > 768) {
  //     this.closeMobileNav();
  //   }
  // }

  // setupCustomCursor() {
  //   const cursorDot = document.querySelector('.cursor-dot');
  //   const cursorOutline = document.querySelector('.cursor-outline');

  //   if (cursorDot && cursorOutline) {
  //     window.addEventListener('mousemove', (e) => {
  //       const posX = e.clientX;
  //       const posY = e.clientY;

  //       cursorDot.style.left = `${posX}px`;
  //       cursorDot.style.top = `${posY}px`;

  //       cursorOutline.animate({
  //         left: `${posX}px`,
  //         top: `${posY}px`
  //       }, { duration: 500, fill: 'forwards' });
  //     });

  //     const interactiveElements = document.querySelectorAll('a, button, .project-card, .social-link');

  //     interactiveElements.forEach(el => {
  //       el.addEventListener('mouseenter', () => {
  //         cursorOutline.style.width = '60px';
  //         cursorOutline.style.height = '60px';
  //         cursorOutline.style.borderWidth = '3px';
  //         cursorOutline.style.backgroundColor = 'rgba(255, 77, 77, 0.2)';
  //       });

  //       el.addEventListener('mouseleave', () => {
  //         cursorOutline.style.width = '40px';
  //         cursorOutline.style.height = '40px';
  //         cursorOutline.style.borderWidth = '2px';
  //         cursorOutline.style.backgroundColor = 'rgba(255, 77, 77, 0.1)';
  //       });
  //     });
  //   }
  // }
  setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Mobile navigation toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => this.toggleMobileNav());
    }

    // Close mobile nav when clicking on links
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => this.closeMobileNav());
    });

    // Resize event
    window.addEventListener('resize', () => this.handleResize());
  }

  initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    this.setTheme(theme);
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      const icon = themeToggle.querySelector('.theme-toggle__icon');
      if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
      themeToggle.setAttribute('aria-pressed', theme === 'dark');
    }
  }

  setupScrollIndicator() {
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    scrollIndicator.setAttribute('role', 'progressbar');
    scrollIndicator.setAttribute('aria-label', 'Scroll progress');
    scrollIndicator.setAttribute('aria-valuemin', '0');
    scrollIndicator.setAttribute('aria-valuemax', '100');
    scrollIndicator.setAttribute('aria-valuenow', '0');
    document.body.appendChild(scrollIndicator);
    this.scrollIndicator = scrollIndicator;
  }

  setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          const headerHeight = document.querySelector('.header').offsetHeight;
          const targetPosition = target.offsetTop - headerHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  setupHeaderScroll() {
    this.header = document.getElementById('header');
  }

  setupMobileNavigation() {
    this.navToggle = document.getElementById('nav-toggle');
    this.navMenu = document.getElementById('nav-menu');
  }

  toggleMobileNav() {
    if (this.navToggle && this.navMenu) {
      this.navToggle.classList.toggle('active');
      this.navMenu.classList.toggle('show');
      
      // Prevent body scroll when mobile nav is open
      document.body.style.overflow = this.navMenu.classList.contains('show') ? 'hidden' : '';
    }
  }

  closeMobileNav() {
    if (this.navToggle && this.navMenu) {
      this.navToggle.classList.remove('active');
      this.navMenu.classList.remove('show');
      document.body.style.overflow = '';
    }
  }

  registerScrollHandler() {
    if (!window.ScrollManager) return;
    this.computeSectionBounds();
    window.ScrollManager.onScroll((state) => {
      this.handleScrollState(state);
    });
  }

  computeSectionBounds(force) {
    if (!force && this._sectionBounds && this._sectionBounds.length) return;
    const headerHeight = (document.querySelector('.header')?.offsetHeight || 0);
    this._sectionBounds = Array.from(document.querySelectorAll('.section')).map(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      return {
        id: sec.id,
        top: top - headerHeight - 160,       // preload threshold
        bottom: top + height - headerHeight - 160
      };
    });
  }

  handleScrollState({ scrollY, docHeight }) {
    const scrollPercentage = docHeight > 0 ? scrollY / docHeight : 0;
    if (this.scrollIndicator) {
      this.scrollIndicator.style.transform = `scaleX(${scrollPercentage})`;
      this.scrollIndicator.setAttribute('aria-valuenow', Math.round(scrollPercentage * 100));
    }
    if (this.header) {
      if (scrollY > 50) this.header.classList.add('scrolled');
      else this.header.classList.remove('scrolled');
    }
    this.updateActiveNavLinkCached(scrollY);
  }

  updateActiveNavLinkCached(scrollY) {
    if (!this._sectionBounds) return;
    const navLinks = document.querySelectorAll('.nav__link');
    let current = '';
    for (const b of this._sectionBounds) {
      if (scrollY >= b.top && scrollY < b.bottom) {
        current = b.id;
        break;
      }
    }
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }

  updateActiveNavLink() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav__link');
    
    let current = '';
    const scrollPosition = window.pageYOffset + 200;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  handleResize() {
    // Close mobile nav on resize to desktop
    if (window.innerWidth > 768) {
      this.closeMobileNav();
    }
  }
}

// Utility functions
const utils = {
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }
};

/* ScrollManager: single scroll + rAF dispatcher */
(function initScrollManager() {
  if (window.ScrollManager) return;
  class ScrollManager {
    constructor() {
      this.callbacks = [];
      this.ticking = false;
      this.state = this._read();
      window.addEventListener('scroll', () => this._onScroll(), { passive: true });
      window.addEventListener('resize', utils.debounce(() => {
        this.state = this._read();
        this._emit();
      }, 120), { passive: true });
    }
    _read() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      const viewportHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
      return {
        scrollY,
        viewportHeight,
        docHeight: fullHeight - viewportHeight,
        progress: (fullHeight - viewportHeight) > 0 ? scrollY / (fullHeight - viewportHeight) : 0
      };
    }
    _onScroll() {
      if (!this.ticking) {
        this.ticking = true;
        requestAnimationFrame(() => {
          this.state = this._read();
          this._emit();
          this.ticking = false;
        });
      }
    }
    _emit() {
      for (const cb of this.callbacks) cb(this.state);
    }
    onScroll(cb) {
      this.callbacks.push(cb);
      cb(this.state);
      return () => {
        this.callbacks = this.callbacks.filter(c => c !== cb);
      };
    }
  }
  window.ScrollManager = new ScrollManager();
})();

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new PortfolioApp();
  if (window.ScrollManager) {
    // If sections load late (images), recompute after load
    window.addEventListener('load', () => app.computeSectionBounds(true));
  }
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PortfolioApp, utils };
}