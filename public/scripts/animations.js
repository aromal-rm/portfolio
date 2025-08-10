/**
 * Animation controller for Aromal RM Portfolio
 * Handles scroll-based animations and interactive effects
 */

class AnimationController {
  constructor() {
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.setupParallaxEffects();
    this.setupHoverAnimations();
    this.initializeAnimations();
  }

  setupIntersectionObserver() {
    // Options for the intersection observer
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -100px 0px',
      threshold: 0.1
    };

    // Create intersection observer
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        const repeat = el.getAttribute('data-animate-repeat') !== 'false';
        if (entry.isIntersecting) {
          el.classList.add('animate');
          if (!repeat) {
            // Stop observing one-time animations
            this.observer.unobserve(el);
          }
        } else if (repeat) {
          el.classList.remove('animate');
        }
      });
    }, observerOptions);

    // Observe all elements with animation class
    this.observeElements();
  }

  observeElements() {
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach(el => {
      if (!el.__animateInit) {
        const delay = el.getAttribute('data-animate-delay');
        if (delay) {
          el.style.transitionDelay = delay;
        }
        el.__animateInit = true;
      }
      this.observer.observe(el);
    });
  }

  setupParallaxEffects() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const heroImg = document.querySelector('.hero__img');
    if (!heroImg) return;
    const update = ({ scrollY, viewportHeight }) => {
      if (scrollY <= viewportHeight) {
        const rate = scrollY * -0.5;
        heroImg.style.transform = `translateY(${rate}px)`;
      }
    };
    if (window.ScrollManager) {
      window.ScrollManager.onScroll(update);
    } else {
      // Fallback (kept minimal)
      window.addEventListener('scroll', this.utils.throttle(() => {
        update({
          scrollY: window.pageYOffset,
          viewportHeight: window.innerHeight
        });
      }, 32), { passive: true });
    }
  }

  setupHoverAnimations() {
    // Project cards hover effect
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        this.animateProjectCard(card, true);
      });
      
      card.addEventListener('mouseleave', () => {
        this.animateProjectCard(card, false);
      });
    });

    // Button hover effects
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        this.animateButton(btn, true);
      });
      
      btn.addEventListener('mouseleave', () => {
        this.animateButton(btn, false);
      });
    });

    // Social links hover effects
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
      link.addEventListener('mouseenter', () => {
        this.animateSocialLink(link, true);
      });
      
      link.addEventListener('mouseleave', () => {
        this.animateSocialLink(link, false);
      });
    });
  }

  animateProjectCard(card, isHover) {
    const title = card.querySelector('.project-card__title');
    const description = card.querySelector('.project-card__description');
    const tags = card.querySelectorAll('.tag');
    const link = card.querySelector('.project-card__link');

    if (isHover) {
      // Animate elements on hover
      if (title) title.style.transform = 'translateY(-2px)';
      if (description) description.style.transform = 'translateY(-1px)';
      
      tags.forEach((tag, index) => {
        setTimeout(() => {
          tag.style.transform = 'translateY(-2px) scale(1.05)';
        }, index * 50);
      });
      
      if (link) link.style.transform = 'translateX(5px)';
    } else {
      // Reset animations
      if (title) title.style.transform = '';
      if (description) description.style.transform = '';
      
      tags.forEach(tag => {
        tag.style.transform = '';
      });
      
      if (link) link.style.transform = '';
    }
  }

  animateButton(btn, isHover) {
    if (isHover) {
      btn.style.transform = 'translateY(-3px) scale(1.02)';
    } else {
      btn.style.transform = '';
    }
  }

  animateSocialLink(link, isHover) {
    const icon = link.querySelector('svg');
    
    if (isHover) {
      link.style.transform = 'translateY(-3px) rotate(5deg)';
      if (icon) icon.style.transform = 'scale(1.1)';
    } else {
      link.style.transform = '';
      if (icon) icon.style.transform = '';
    }
  }

  initializeAnimations() {
    // Add CSS for smooth transitions
    const style = document.createElement('style');
    style.textContent = `
      .project-card * {
        transition: transform 0.3s ease;
      }
      
      .btn {
        transition: all 0.3s ease !important;
      }
      
      .social-link,
      .social-link svg {
        transition: all 0.3s ease;
      }
      
      .tag {
        transition: all 0.3s ease;
      }
    `;
    document.head.appendChild(style);
  }

  // Animation utilities
  utils = {
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
    },

    easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    },

    lerp(start, end, factor) {
      return start + (end - start) * factor;
    }
  };

  // Public methods
  refresh() {
    // Re-observe elements that might have been added dynamically
    this.observeElements();
  }

  destroy() {
    // Clean up observer
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Typing animation for hero section
class TypingAnimation {
  constructor(element, texts, options = {}) {
    this.element = element;
    this.texts = texts;
    this.options = {
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 1000,
      loop: true,
      showCursor: true,
      cursorChar: '|',
      ...options
    };
    
    this.currentIndex = 0;
    this.currentText = '';
    this.isDeleting = false;
    this.isPaused = false;
    
    if (this.options.showCursor) {
      this.setupCursor();
    }
    
    this.type();
  }

  setupCursor() {
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    cursor.textContent = this.options.cursorChar;
    cursor.style.cssText = `
      animation: blink 1s infinite;
      font-weight: normal;
    `;
    
    // Add cursor animation
    if (!document.querySelector('#typing-cursor-style')) {
      const style = document.createElement('style');
      style.id = 'typing-cursor-style';
      style.textContent = `
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    this.element.appendChild(cursor);
    this.cursor = cursor;
  }

  type() {
    const currentFullText = this.texts[this.currentIndex];
    
    if (this.isDeleting) {
      this.currentText = currentFullText.substring(0, this.currentText.length - 1);
    } else {
      this.currentText = currentFullText.substring(0, this.currentText.length + 1);
    }
    
    // Update the element text (excluding cursor)
    if (this.cursor) {
      this.element.innerHTML = this.currentText;
      this.element.appendChild(this.cursor);
    } else {
      this.element.textContent = this.currentText;
    }
    
    let typeSpeed = this.options.typeSpeed;
    
    if (this.isDeleting) {
      typeSpeed = this.options.backSpeed;
    }
    
    if (!this.isDeleting && this.currentText === currentFullText) {
      // Pause at end
      typeSpeed = this.options.backDelay;
      this.isDeleting = true;
    } else if (this.isDeleting && this.currentText === '') {
      this.isDeleting = false;
      this.currentIndex = (this.currentIndex + 1) % this.texts.length;
      typeSpeed = 500; // Pause before typing next text
    }
    
    setTimeout(() => this.type(), typeSpeed);
  }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const animationController = new AnimationController();
  
  // Optional: Add typing animation to hero subtitle
  const heroSubtitle = document.querySelector('.hero__subtitle');
  if (heroSubtitle) {
    const subtitleTexts = [
      'Computer Science Engineer • Cybersecurity Enthusiast • Developer',
      'Building Secure & Innovative Solutions',
      'Passionate About Technology & Problem Solving'
    ];
    
    // Uncomment the next line to enable typing animation
    // new TypingAnimation(heroSubtitle, subtitleTexts);
  }
  
  // Make animation controller globally available
  window.animationController = animationController;
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AnimationController, TypingAnimation };
}