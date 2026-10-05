/**
 * Claymorphism Portfolio - Navigation & Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
  const sections = document.querySelectorAll('.portfolio-section');

  // Handle active class switching on click
  navLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');

      // If it's an internal hash link
      if (targetId && targetId.startsWith('#')) {
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          e.preventDefault();

          // Update active states
          navLinks.forEach((item) => item.classList.remove('active'));
          this.classList.add('active');

          // Smooth scroll to target section
          targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

          // Update URL hash without jumping
          history.pushState(null, '', targetId);
        }
      }
    });
  });

  // Typing Animation on About Heading (Matching Reference Image 3)
  let hasTypedAbout = false;
  const typedTextEl = document.getElementById('about-typed-text');
  const textToType = "Hi, I'm Ruth Tamariska Ayu Wicaksono";

  function startAboutTyping() {
    if (!typedTextEl) return;
    let charIndex = 0;
    typedTextEl.textContent = '';
    const interval = setInterval(() => {
      if (charIndex < textToType.length) {
        typedTextEl.textContent += textToType.charAt(charIndex);
        charIndex++;
      } else {
        clearInterval(interval);
      }
    }, 80); // 80ms per character
  }

  // Scrollspy: update active link based on current viewport section
  const observerOptions = {
    root: null,
    rootMargin: '-25% 0px -50% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        if (id) {
          navLinks.forEach((link) => {
            if (link.getAttribute('href') === `#${id}`) {
              navLinks.forEach((item) => item.classList.remove('active'));
              link.classList.add('active');
            }
          });

          // Trigger typing animation only once when section #about is visible
          if (id === 'about' && !hasTypedAbout) {
            hasTypedAbout = true;
            startAboutTyping();
          }
        }
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    observer.observe(section);
  });

  /* ==========================================================================
     Interactive Lanyard (Hover Sway & Elastic Drag)
     ========================================================================== */
  const aboutSection = document.getElementById('about');
  const lanyardWrapper = document.getElementById('lanyard-wrapper');

  if (aboutSection && lanyardWrapper) {
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;
    let lastX = 0;
    let lastTime = 0;
    let currentRot = 0;

    // Hover sway when mouse moves within #about (only when not dragging)
    aboutSection.addEventListener('mousemove', (e) => {
      if (isDragging) return;

      const rect = aboutSection.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5

      // Horizontal movement: max 60px; tilt: max 8 degrees
      const swayX = Math.max(-60, Math.min(60, relativeX * 120));
      const swayRot = Math.max(-8, Math.min(8, relativeX * 16));

      lanyardWrapper.style.transition = 'transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)';
      lanyardWrapper.style.transform = `translate3d(${currentX + swayX}px, ${currentY}px, 0) rotate(${swayRot}deg)`;
    });

    // Reset sway on mouse leave from #about
    aboutSection.addEventListener('mouseleave', () => {
      if (isDragging) return;
      lanyardWrapper.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
      lanyardWrapper.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) rotate(0deg)`;
    });

    // Pointer events for drag (supports mouse and touch)
    lanyardWrapper.addEventListener('pointerdown', (e) => {
      isDragging = true;
      lanyardWrapper.classList.add('grabbing');
      lanyardWrapper.setPointerCapture(e.pointerId);

      startX = e.clientX;
      startY = e.clientY;
      initialX = currentX;
      initialY = currentY;
      lastX = e.clientX;
      lastTime = performance.now();
      currentRot = 0;

      lanyardWrapper.style.transition = 'none'; // instant tracking during drag
      e.preventDefault();
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;

      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const dx = e.clientX - lastX;
      const velocity = dx / dt; // px/ms

      // Rotate proportional to horizontal speed, clamped between -30 and 30 deg
      const targetRot = Math.max(-30, Math.min(30, velocity * 25));
      currentRot = currentRot * 0.65 + targetRot * 0.35;

      currentX = initialX + (e.clientX - startX);
      currentY = initialY + (e.clientY - startY);

      lanyardWrapper.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) rotate(${currentRot}deg)`;

      lastX = e.clientX;
      lastTime = now;
    });

    const endDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;
      lanyardWrapper.classList.remove('grabbing');

      try {
        lanyardWrapper.releasePointerCapture(e.pointerId);
      } catch (_) {}

      // Keep position, elastic spring rotation back to 0deg
      currentRot = 0;
      lanyardWrapper.style.transition = 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      lanyardWrapper.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) rotate(0deg)`;
    };

    lanyardWrapper.addEventListener('pointerup', endDrag);
    lanyardWrapper.addEventListener('pointercancel', endDrag);
  }

  /* ==========================================================================
     Project Slider & Controls (Matching Reference Image 1)
     ========================================================================== */
  const projectSlider = document.getElementById('project-slider');
  const projectPrevBtn = document.getElementById('project-prev');
  const projectNextBtn = document.getElementById('project-next');

  if (projectSlider && projectPrevBtn && projectNextBtn) {
    function getScrollStep() {
      const firstCard = projectSlider.querySelector('.project-clay-card');
      return firstCard ? firstCard.offsetWidth + 24 : 310;
    }

    projectPrevBtn.addEventListener('click', () => {
      projectSlider.scrollBy({
        left: -getScrollStep(),
        behavior: 'smooth'
      });
    });

    projectNextBtn.addEventListener('click', () => {
      projectSlider.scrollBy({
        left: getScrollStep(),
        behavior: 'smooth'
      });
    });

    // Keyboard navigation on slider
    projectSlider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        projectSlider.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
      } else if (e.key === 'ArrowRight') {
        projectSlider.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
      }
    });
  }

  /* ==========================================================================
     Project Popup Modal
     ========================================================================== */
  const projectModal = document.getElementById('project-modal');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-project-title');
  const modalCategory = document.getElementById('modal-project-category');

  const PROJECT_MOCKUP_DATA = {
    '1': { img: 'asset/image/project-1.jpg', title: 'Botanica Herbarium', cat: 'Packaging & Brand Identity' },
    '2': { img: 'asset/image/project-2.jpg', title: 'Kinfolk Editorial', cat: 'Publication & Typography' },
    '3': { img: 'asset/image/project-3.jpg', title: 'Lumira Cafe & Roastery', cat: 'Visual Identity & Collateral' },
    '4': { img: 'asset/image/project-4.jpg', title: 'Serene Skincare', cat: 'Sustainable Cosmetic Packaging' },
    '5': { img: 'asset/image/project-5.jpg', title: 'Tactile Forms Gallery', cat: 'Exhibition Poster & Catalog' }
  };

  function openProjectModal(card) {
    if (!projectModal) return;
    const id = card.getAttribute('data-project-id') || '1';
    const data = PROJECT_MOCKUP_DATA[id] || PROJECT_MOCKUP_DATA['1'];
    const cardTitle = card.querySelector('.card-project-name')?.textContent?.trim() || data.title;
    const cardCategory = card.querySelector('.card-project-category')?.textContent?.trim() || data.cat;

    if (modalImg) {
      modalImg.src = data.img;
      modalImg.alt = cardTitle;
    }
    if (modalTitle) modalTitle.textContent = cardTitle;
    if (modalCategory) modalCategory.textContent = cardCategory;

    projectModal.classList.add('modal-active');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modalCloseBtn?.focus();
  }

  function closeProjectModal() {
    if (!projectModal) return;
    projectModal.classList.remove('modal-active');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.card-screen-recessed').forEach((screen) => {
    screen.addEventListener('click', () => {
      const card = screen.closest('.project-clay-card');
      if (card) openProjectModal(card);
    });

    screen.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const card = screen.closest('.project-clay-card');
        if (card) openProjectModal(card);
      }
    });
  });

  modalCloseBtn?.addEventListener('click', closeProjectModal);
  modalOverlay?.addEventListener('click', closeProjectModal);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectModal?.classList.contains('modal-active')) {
      closeProjectModal();
    }
  });

  /* ==========================================================================
     Contact Envelope Interaction (Tap toggle on touch devices)
     ========================================================================== */
  const envelopeCta = document.getElementById('envelope-cta');
  if (envelopeCta) {
    envelopeCta.addEventListener('click', (e) => {
      if (e.target.closest('#email-cta-btn')) return;
      envelopeCta.classList.toggle('active-letter');
    });
  }

  /* ==========================================================================
     Character Eye Tracking (Follow Mouse / Pointer)
     ========================================================================== */
  const characterImg = document.querySelector('#home .character-img');

  if (characterImg) {
    // Daftar 9 variasi gambar karakter
    const CHARACTER_IMAGES = {
      'center': 'asset/image/character-center.png',
      'up': 'asset/image/character-up.png',
      'down': 'asset/image/character-down.png',
      'left': 'asset/image/character-left.png',
      'right': 'asset/image/character-right.png',
      'up-left': 'asset/image/character-up-left.png',
      'up-right': 'asset/image/character-up-right.png',
      'down-left': 'asset/image/character-down-left.png',
      'down-right': 'asset/image/character-down-right.png'
    };

    // 7. Preload semua 9 gambar agar tidak berkedip saat pergantian
    const preloadedImages = {};
    Object.entries(CHARACTER_IMAGES).forEach(([direction, src]) => {
      const img = new Image();
      img.src = src;
      preloadedImages[direction] = img;
    });

    let currentDirection = 'center';
    let latestX = 0;
    let latestY = 0;
    let isTicking = false;

    // 6. Threshold jarak (pixel) agar transisi ke/dari center tidak terlalu sensitif (hysteresis)
    const THRESHOLD_EXIT_CENTER = 70;
    const THRESHOLD_ENTER_CENTER = 50;

    /**
     * Menghitung arah pandangan berdasarkan posisi kursor relatif terhadap tengah karakter
     */
    function calculateDirection(mouseX, mouseY) {
      const rect = characterImg.getBoundingClientRect();

      // Jika karakter tidak terlihat atau di luar viewport, pertahankan arah saat ini
      if (rect.width === 0 || rect.height === 0 || rect.bottom < 0 || rect.top > window.innerHeight) {
        return currentDirection;
      }

      // 1. Ambil posisi tengah karakter (fokus area mata/wajah pada potret karakter)
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height * 0.4;

      // 2. Bandingkan posisi mouse dengan posisi tengah karakter
      const dx = mouseX - centerX;
      const dy = mouseY - centerY;
      const distance = Math.hypot(dx, dy);

      // 4 & 6. Jika mouse dekat tengah, gunakan character-center.png
      const threshold = currentDirection === 'center' ? THRESHOLD_EXIT_CENTER : THRESHOLD_ENTER_CENTER;
      if (distance < threshold) {
        return 'center';
      }

      // 3 & 5. Bagi area menjadi 8 arah luar berdasarkan sudut (angle)
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      if (angle < 0) {
        angle += 360;
      }

      // 8 sektor (@ 45 derajat):
      // 0: right      (337.5° - 22.5°)
      // 1: down-right (22.5° - 67.5°)
      // 2: down       (67.5° - 112.5°)
      // 3: down-left  (112.5° - 157.5°)
      // 4: left       (157.5° - 202.5°)
      // 5: up-left    (202.5° - 247.5°)
      // 6: up         (247.5° - 292.5°)
      // 7: up-right   (292.5° - 337.5°)
      const sector = Math.round(angle / 45) % 8;
      const directions = [
        'right',
        'down-right',
        'down',
        'down-left',
        'left',
        'up-left',
        'up',
        'up-right'
      ];

      return directions[sector] || 'center';
    }

    /**
     * Memperbarui src gambar sesuai arah yang dihitung
     */
    function updateGaze(mouseX, mouseY) {
      const targetDirection = calculateDirection(mouseX, mouseY);

      // 9. Hindari update src jika gambar yang dibutuhkan masih sama
      // 8. Jangan menggerakkan posisi karakter. Hanya ganti src gambar.
      if (targetDirection !== currentDirection) {
        const nextSrc = CHARACTER_IMAGES[targetDirection];
        if (nextSrc) {
          characterImg.src = nextSrc;
          currentDirection = targetDirection;
        }
      }
    }

    /**
     * Jadwalkan pembaruan posisi kursor menggunakan requestAnimationFrame untuk animasi 60fps yang smooth
     */
    function handlePointerMove(clientX, clientY) {
      latestX = clientX;
      latestY = clientY;

      if (!isTicking) {
        isTicking = true;
        window.requestAnimationFrame(() => {
          updateGaze(latestX, latestY);
          isTicking = false;
        });
      }
    }

    // Event listener pergerakan mouse
    window.addEventListener('mousemove', (e) => {
      handlePointerMove(e.clientX, e.clientY);
    }, { passive: true });

    // Dukungan sentuhan untuk perangkat mobile / tablet
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    // Kembalikan ke tengah saat mouse meninggalkan halaman atau sentuhan berakhir
    document.addEventListener('mouseleave', () => {
      if (currentDirection !== 'center') {
        characterImg.src = CHARACTER_IMAGES['center'];
        currentDirection = 'center';
      }
    });

    window.addEventListener('touchend', () => {
      if (currentDirection !== 'center') {
        characterImg.src = CHARACTER_IMAGES['center'];
        currentDirection = 'center';
      }
    });
  }
});
