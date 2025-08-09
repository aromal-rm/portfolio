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
  }

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

    // Scroll event
    window.addEventListener('scroll', () => this.handleScroll());
    
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
      icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  setupScrollIndicator() {
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
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

  handleScroll() {
    const scrollTop = window.pageYOffset;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercentage = scrollTop / documentHeight;

    // Update scroll indicator
    if (this.scrollIndicator) {
      this.scrollIndicator.style.transform = `scaleX(${scrollPercentage})`;
    }

    // Update header appearance
    if (this.header) {
      if (scrollTop > 50) {
        this.header.classList.add('scrolled');
      } else {
        this.header.classList.remove('scrolled');
      }
    }

    // Update active navigation link
    this.updateActiveNavLink();
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

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PortfolioApp();
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PortfolioApp, utils };
}