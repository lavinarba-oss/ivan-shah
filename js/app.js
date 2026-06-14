/* ============================================================
   IVAN SHAH — motion & micro-interactions
   Vanilla JS. Respects prefers-reduced-motion.
   ============================================================ */
(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Sticky nav ---------- */
  const nav = $('#nav');
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('revealed');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
    // failsafe: if anything is still hidden after load (e.g. IO quirk),
    // reveal whatever is already in the viewport.
    window.addEventListener('load', () => setTimeout(() => {
      revealEls.forEach((el) => {
        if (el.classList.contains('revealed')) return;
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('revealed');
      });
    }, 1200));
  } else {
    revealEls.forEach((el) => el.classList.add('revealed'));
  }

  /* ---------- Hero staggered headline + fades ---------- */
  function heroIntro() {
    if (reduced) {
      $$('[data-stagger], [data-fade]').forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
      return;
    }
    const stag = $$('[data-stagger]');
    stag.forEach((el, i) => {
      el.style.transform = 'translateY(110%)';
      el.style.opacity = '0';
      el.style.display = 'block';
      setTimeout(() => {
        el.style.transition = 'transform .9s cubic-bezier(.16,1,.3,1), opacity .9s ease';
        el.style.transform = 'translateY(0)';
        el.style.opacity = '1';
      }, 150 + i * 130);
    });
    const fades = $$('[data-fade]');
    fades.forEach((el, i) => {
      el.style.transform = 'translateY(22px)';
      el.style.opacity = '0';
      setTimeout(() => {
        el.style.transition = 'transform .8s cubic-bezier(.16,1,.3,1), opacity .8s ease';
        el.style.transform = 'translateY(0)';
        el.style.opacity = '1';
      }, 520 + i * 110);
    });
  }
  heroIntro();

  /* ---------- Count-up stats ---------- */
  const counters = $$('[data-count]');
  if (counters.length && !reduced && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const end = parseInt(el.dataset.count, 10);
        const dur = 1200; const t0 = performance.now();
        (function step(now) {
          const p = Math.min(1, (now - t0) / dur);
          const e = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(end * e);
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = end;
        })(t0);
        cio.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => cio.observe(c));
  }

  /* ---------- Magnetic buttons ---------- */
  if (!reduced && window.matchMedia('(pointer:fine)').matches) {
    $$('[data-magnetic]').forEach((btn) => {
      const strength = 0.35;
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${mx * strength}px, ${my * strength - 3}px)`;
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ---------- Service card spotlight (cursor-follow glow) ---------- */
  if (!reduced && window.matchMedia('(pointer:fine)').matches) {
    $$('.svc').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------- 3D tilt (photo + soft cards) ---------- */
  if (!reduced && window.matchMedia('(pointer:fine)').matches) {
    function bindTilt(el, max) {
      let raf;
      el.style.transformStyle = 'preserve-3d';
      el.style.transition = 'transform .3s var(--ease)';
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = `perspective(900px) rotateY(${px * max}deg) rotateX(${-py * max}deg)`;
        });
      });
      el.addEventListener('pointerleave', () => {
        el.style.transform = 'perspective(900px) rotateY(0) rotateX(0)';
      });
    }
    $$('[data-tilt]').forEach((el) => bindTilt(el, 7));
    $$('[data-tilt-soft]').forEach((el) => bindTilt(el, 4));
  }

  /* ---------- Floating chips gentle bob ---------- */
  if (!reduced) {
    $$('[data-float]').forEach((el, i) => {
      el.animate(
        [{ transform: 'translateY(0)' }, { transform: 'translateY(-9px)' }, { transform: 'translateY(0)' }],
        { duration: 3600 + i * 600, iterations: Infinity, easing: 'ease-in-out' }
      );
    });
  }

  /* ---------- Interactive "fix it" cards ---------- */
  $$('.repair-card').forEach((card) => {
    const btn = card.querySelector('.repair-btn');
    if (!btn) return;
    const label = btn.querySelector('.rb-label');
    btn.addEventListener('click', () => {
      const fixed = card.classList.toggle('fixed');
      if (label) label.textContent = fixed ? 'Сломать снова' : 'Починить';
      // restart the burst ring each time it gets fixed
      if (fixed) {
        const burst = card.querySelector('.fix-burst');
        if (burst) { burst.style.animation = 'none'; void burst.offsetWidth; burst.style.animation = ''; }
      }
    });
  });

  /* ---------- Carousels (works + reviews): arrows + drag ---------- */
  $$('.carousel').forEach((car) => {
    const track = car.querySelector('.car-track');
    const prev = car.querySelector('.car-prev');
    const next = car.querySelector('.car-next');
    if (!track) return;
    const step = () => {
      const item = track.querySelector('.car-item, .chat');
      const w = item ? item.getBoundingClientRect().width + 18 : track.clientWidth * 0.8;
      return w * (window.innerWidth < 700 ? 1 : 2);
    };
    const update = () => {
      if (!prev || !next) return;
      const max = track.scrollWidth - track.clientWidth - 4;
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft >= max;
    };
    if (prev) prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    if (next) next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    update();

    // drag to scroll (pointer)
    let down = false, startX = 0, startScroll = 0, moved = 0;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return; // native touch scroll handles it
      down = true; startX = e.clientX; startScroll = track.scrollLeft; moved = 0;
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX; moved = Math.abs(dx);
      if (moved > 4) track.classList.add('dragging');
      track.scrollLeft = startScroll - dx;
    });
    const end = () => { down = false; track.classList.remove('dragging'); };
    track.addEventListener('pointerup', end);
    track.addEventListener('pointercancel', end);
    track.addEventListener('click', (e) => { if (moved > 6) { e.preventDefault(); } }, true);
  });

  /* ---------- Back to top ---------- */
  (function backToTop() {
    const btn = $('#toTop');
    if (!btn) return;
    const onScr = () => { if (window.scrollY > 700) btn.classList.add('show'); else btn.classList.remove('show'); };
    onScr();
    window.addEventListener('scroll', onScr, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
  })();

  /* ---------- Content protection (anti-copy) ---------- */
  (function protect() {
    const block = (e) => { e.preventDefault(); return false; };
    document.addEventListener('contextmenu', block);
    document.addEventListener('dragstart', block);
    document.addEventListener('selectstart', block);
    document.addEventListener('copy', block);
    document.addEventListener('cut', block);
    document.addEventListener('keydown', (e) => {
      const k = (e.key || '').toLowerCase();
      if (e.key === 'F12') return block(e);
      if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'u', 's', 'p', 'a'].includes(k)) return block(e);
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(k)) return block(e);
    });
  })();

  /* ---------- Cookie consent ---------- */
  (function cookies() {
    const bar = $('#cookie');
    if (!bar) return;
    let stored = null;
    try { stored = localStorage.getItem('ivan_cookie'); } catch (e) {}
    if (!stored) {
      setTimeout(() => bar.classList.add('show'), 1100);
    }
    const close = (val) => {
      try { localStorage.setItem('ivan_cookie', val); } catch (e) {}
      bar.classList.remove('show');
    };
    const acc = $('#cookieAccept'); const dec = $('#cookieDecline');
    if (acc) acc.addEventListener('click', () => close('all'));
    if (dec) dec.addEventListener('click', () => close('essential'));
  })();

  /* ---------- Privacy modal ---------- */
  (function privacy() {
    const modal = $('#privacyModal');
    if (!modal) return;
    let lastFocus = null;
    const open = (e) => {
      if (e) e.preventDefault();
      lastFocus = document.activeElement;
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      const x = modal.querySelector('.modal-x');
      if (x) x.focus();
    };
    const close = () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };
    $$('[data-open-privacy]').forEach((b) => b.addEventListener('click', open));
    $$('[data-close-privacy]').forEach((b) => b.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
  })();

  /* ---------- Smooth anchor scroll with nav offset ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      const y = t.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
    });
  });
})();
