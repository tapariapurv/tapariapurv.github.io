/* Purv/OS — motion engine. GSAP 3.13 (ScrollTrigger, SplitText, Flip, Draggable, Inertia, ScrambleText) + Lenis. */
(async () => {
  const H = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const G = window.gsap;
  if (!G) { H.classList.remove('motion', 'booting'); }
  const MOTION = !!G && H.classList.contains('motion');
  const TOYS = MOTION && matchMedia('(hover:hover) and (pointer:fine) and (min-width:961px)').matches;
  if (TOYS) H.classList.add('toys');
  if (G) G.registerPlugin(ScrollTrigger, SplitText, Flip, Draggable, InertiaPlugin, ScrambleTextPlugin);

  /* ── always-on basics ───────────────────────────────── */
  const darkQ = matchMedia('(prefers-color-scheme: dark)');
  const syncDark = () => H.toggleAttribute('data-dark', H.dataset.theme ? H.dataset.theme === 'dark' : darkQ.matches);
  syncDark(); darkQ.addEventListener('change', syncDark);
  $('#theme').addEventListener('click', () => {
    H.dataset.theme = H.hasAttribute('data-dark') ? 'light' : 'dark';
    try { localStorage.setItem('pos-theme', H.dataset.theme); } catch (e) {}
    syncDark();
  });

  const clock = $('#clock');
  const tick = () => clock.textContent = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(new Date());
  tick(); setInterval(tick, 10000);

  $('#copy').addEventListener('click', async (e) => {
    const b = e.currentTarget;
    try { await navigator.clipboard.writeText('tapariapurv+portfolio@gmail.com'); } catch (err) {}
    b.classList.add('ok');
    if (MOTION) G.fromTo(b, { scale: .92 }, { scale: 1, duration: .6, ease: 'elastic.out(1,.4)' });
    setTimeout(() => b.classList.remove('ok'), 1800);
  });

  // role cycler in hello.txt
  const ROLES = ['Student', 'AI Builder', 'Published Author', 'Maker', 'Coder', 'Newsletter Blogger', 'Roller Skater'];
  let ri = 0; const tw = $('#tw');
  setInterval(() => {
    ri = (ri + 1) % ROLES.length;
    if (MOTION) G.to(tw, { duration: .9, scrambleText: { text: ROLES[ri], chars: 'upperCase', speed: .5, revealDelay: .2 } });
    else tw.textContent = ROLES[ri];
  }, 2600);

  /* ── project filter (Flip when motion) + project window ─ */
  const cards = $$('.pc');
  let pjST = null, filtering = false;
  $$('.filt button').forEach(btn => btn.addEventListener('click', () => {
    if (filtering || btn.getAttribute('aria-pressed') === 'true') return;
    $$('.filt button').forEach(b => b.setAttribute('aria-pressed', b === btn));
    const f = btn.dataset.f;
    const apply = () => {
      cards.forEach(c => c.hidden = f !== 'all' && !c.classList.contains(f));
      $('#pj-t').textContent = String(cards.filter(c => !c.hidden).length).padStart(2, '0');
    };
    if (!MOTION) return apply();
    if (!pjST) {   // phone grid: Flip reflows the cards in place
      const state = Flip.getState(cards); apply();
      Flip.from(state, { duration: .6, ease: 'expo.inOut', absolute: true, scale: true,
        onEnter: els => G.fromTo(els, { opacity: 0, scale: .85 }, { opacity: 1, scale: 1, duration: .5, ease: 'back.out(1.5)' }),
        onLeave: els => G.to(els, { opacity: 0, scale: .85, duration: .3 }),
        onComplete: () => ScrollTrigger.refresh() });
      return;
    }
    // pinned strip: Flip can't measure inside a moving, pinned track, so swap the set behind a quick strip transition
    filtering = true;
    const track = $('#track');
    G.timeline({ onComplete: () => filtering = false })
      .to(track, { opacity: 0, y: 50, duration: .32, ease: 'power2.in' })
      .add(() => { apply(); ScrollTrigger.refresh(); lenis && lenis.scrollTo(pjST.start + 2, { immediate: true, force: true }); })
      .set(track, { y: 0 })
      .to(track, { opacity: 1, duration: .2 })
      .add(() => G.from(cards.filter(c => !c.hidden).slice(0, 4), { yPercent: 35, rotation: i => 4 - i * 2, duration: .7, ease: 'back.out(1.4)', stagger: .06 }), '<');
  }));

  const modal = $('#modal'), mShot = $('.m-shot'), mInfo = $('.m-info'), mWin = $('.m-win');
  let lastCard = null, lastFocus = null, lenis = null;
  function openProject(card) {
    lastCard = card; lastFocus = document.activeElement;
    const srcImg = $('.pc-shot img, .pc-shot .noshot', card);
    $('#m-file').textContent = $('.win-t', card).textContent;
    mWin.style.setProperty('--pop', getComputedStyle(card).getPropertyValue('--pop'));
    mShot.innerHTML = ''; const clone = srcImg.cloneNode(true); clone.removeAttribute('loading'); clone.removeAttribute('style'); mShot.append(clone);
    const b = $('.pc-body', card);
    mInfo.innerHTML = `<div class="pc-meta">${$('.pc-meta', b).innerHTML}</div><h3 id="m-title">${$('.pc-title', b).textContent}</h3>
      <p class="pc-desc">${$('.pc-desc', b).innerHTML}</p><ul class="pc-tech">${$('.pc-tech', b).innerHTML}</ul><div class="lnks">${$('.lnks', b).innerHTML}</div>`;
    modal.hidden = false; lenis && lenis.stop();
    $('.m-x').focus({ preventScroll: true });
    if (!MOTION) return;
    // the window zooms out of the card it came from (transforms only)
    G.fromTo('.m-scrim', { opacity: 0 }, { opacity: 1, duration: .4 });
    G.from(mWin, { ...fromCard(card), duration: .75, ease: 'expo.inOut', transformOrigin: '0 0', clearProps: 'transform' });
    G.from(mInfo.children, { y: 26, opacity: 0, duration: .6, ease: 'expo.out', stagger: .06, delay: .4 });
  }
  function fromCard(card) {
    const a = card.getBoundingClientRect(), b = mWin.getBoundingClientRect();
    return { x: a.left - b.left, y: a.top - b.top, scaleX: a.width / b.width, scaleY: a.height / b.height };
  }
  function closeProject() {
    if (modal.hidden) return;
    const done = () => { modal.hidden = true; lenis && lenis.start(); lastFocus && lastFocus.focus({ preventScroll: true }); };
    if (!MOTION) return done();
    G.to('.m-scrim', { opacity: 0, duration: .4 });
    G.to(mInfo.children, { opacity: 0, duration: .15 });
    G.to(mWin, { ...fromCard(lastCard), duration: .5, ease: 'expo.inOut', transformOrigin: '0 0', onComplete: () => { G.set(mWin, { clearProps: 'transform' }); done(); } });
  }
  cards.forEach(c => $('.pc-shot', c).addEventListener('click', e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault(); openProject(c);
  }));
  $('.m-x').addEventListener('click', closeProject);
  $('.m-scrim').addEventListener('click', closeProject);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeProject(); });
  modal.addEventListener('keydown', e => {          // keep Tab inside the window
    if (e.key !== 'Tab') return;
    const f = $$('a,button', modal); const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  if (!G) return;

  /* ── dock + menubar section tracking ─────────────────── */
  const secName = $('.mb-sec-in');
  let curSec = 'hero';
  function setSection(sec) {
    if (sec.id === curSec) return; curSec = sec.id;
    $$('.dk').forEach(d => d.classList.toggle('on', d.dataset.k === sec.id));
    if (MOTION) G.timeline().to(secName, { yPercent: -110, duration: .18, ease: 'power2.in' })
      .add(() => secName.textContent = sec.dataset.l).fromTo(secName, { yPercent: 110 }, { yPercent: 0, duration: .45, ease: 'expo.out' });
    else secName.textContent = sec.dataset.l;
  }
  $('.dk[data-k=hero]').classList.add('on');
  const trackSections = () => {   // created last so pin spacers above are already measured
    $$('main > section').forEach(sec => ScrollTrigger.create({
      trigger: sec, start: 'top 45%', end: 'bottom 45%', refreshPriority: -1, onToggle: s => s.isActive && setSection(sec)
    }));
    G.to('.mb-prog i', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true, refreshPriority: -1 } });
  };

  if (!MOTION) return trackSections();

  const yieldTask = () => new Promise(r => setTimeout(r, 0));   // yield between scenes: no long main-thread task on load

  /* ── smooth scroll ────────────────────────────────────── */
  if (window.Lenis) {
    lenis = new Lenis({ lerp: .11, anchors: { offset: 0 }, autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
    window.__lenis = lenis;
    G.ticker.add(t => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
  }

  await yieldTask();
  /* ── cursor ───────────────────────────────────────────── */
  if (TOYS) {
    const cur = $('#cursor'), ring = $('.c-ring', cur), dot = $('.c-dot', cur), lbl = $('.c-lbl', cur);
    const rx = G.quickTo(ring, 'x', { duration: .45, ease: 'power3' }), ry = G.quickTo(ring, 'y', { duration: .45, ease: 'power3' });
    const dx = G.quickTo(dot, 'x', { duration: .06 }), dy = G.quickTo(dot, 'y', { duration: .06 });
    addEventListener('pointermove', e => { if (!cur.dataset.on) { cur.dataset.on = 1; G.to(cur, { opacity: 1, duration: .3 }); } rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY); });
    addEventListener('pointerdown', () => cur.classList.add('down'));
    addEventListener('pointerup', () => cur.classList.remove('down'));
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('[data-cursor],[data-drag] .win-bar,a,button');
      cur.classList.remove('lbl', 'hov');
      if (!t) return;
      const l = t.dataset.cursor || (t.classList.contains('win-bar') ? 'Drag' : '');
      if (l) { lbl.textContent = l; cur.classList.add('lbl'); } else cur.classList.add('hov');
    });
    document.addEventListener('pointerleave', () => G.to(cur, { opacity: 0, duration: .2 }));
    document.addEventListener('pointerenter', () => G.to(cur, { opacity: 1, duration: .2 }));
  }

  /* ── dock magnify ─────────────────────────────────────── */
  if (TOYS) {
    const dock = $('.dock'), dks = $$('.dk');
    dock.addEventListener('pointermove', e => dks.forEach(d => {
      const r = d.getBoundingClientRect(), dist = Math.abs(e.clientX - (r.left + r.width / 2));
      G.to(d, { scale: 1 + .55 * Math.max(0, 1 - dist / 130), y: -10 * Math.max(0, 1 - dist / 130), duration: .25, ease: 'power3', overwrite: 'auto' });
    }));
    dock.addEventListener('pointerleave', () => G.to(dks, { scale: 1, y: 0, duration: .5, ease: 'elastic.out(1,.5)' }));
  }

  await yieldTask();
  /* ── boot sequence ────────────────────────────────────── */
  const bootEl = $('#boot');
  function boot(done) {
    if (!H.classList.contains('booting')) return done();
    try { sessionStorage.setItem('pos-booted', '1'); } catch (e) {}
    lenis && lenis.stop();
    G.set(bootEl, { clearProps: 'all' }); G.set('#boot li', { opacity: 0 }); G.set('.boot-bar i', { scaleX: 0 });
    const tl = G.timeline({
      onComplete() { H.classList.remove('booting'); G.set(bootEl, { clearProps: 'all' }); lenis && lenis.start(); done(); }
    });
    tl.to('#boot li', { opacity: 1, duration: .01, stagger: .12 })
      .to('.boot-bar i', { scaleX: 1, duration: .9, ease: 'power2.inOut' }, 0)
      .to(bootEl, { backgroundColor: '#f2eee6', duration: .08 }, '+=.1')
      .to('.boot-in', { opacity: 0, duration: .08 }, '<')
      .to(bootEl, { scaleY: .004, duration: .3, ease: 'power4.in' }, '<')
      .to(bootEl, { scaleX: 0, duration: .22, ease: 'power4.in' })
      .set('.boot-in', { opacity: 1 });
    const skip = () => tl.timeScale(5);
    addEventListener('pointerdown', skip, { once: true }); addEventListener('keydown', skip, { once: true });
  }

  /* ── split helpers ────────────────────────────────────── */
  const nameSplit = SplitText.create('#name', { type: 'chars', charsClass: 'ch' });
  const chars = nameSplit.chars;
  G.set('#name', { perspective: 900 });

  /* ── hero intro ───────────────────────────────────────── */
  const wins = $$('.desk .win'), stks = $$('.stk');
  let heroBuilt = false;
  // each window starts as a speck at the dock's Desktop icon, so the dock reads as where windows live
  function genie() {
    const d = $('.dk[data-k=hero]').getBoundingClientRect(), dx = d.left + d.width / 2, dy = d.top + d.height / 2;
    return {
      x: (i, w) => { const r = w.getBoundingClientRect(); return dx - (r.left + r.width / 2); },
      y: (i, w) => { const r = w.getBoundingClientRect(); return dy - (r.top + r.height / 2); },
      scale: .06, opacity: 0, rotation: (i) => [-14, 10, -8][i] || 0
    };
  }
  function intro() {
    G.set('.intro', { visibility: 'visible' });
    if (!TOYS) return buildHeroScroll();   // phones and touch: render the hero at once, no entrance
    const tl = G.timeline({ onComplete: buildHeroScroll });
    tl.from(chars, { opacity: 0, yPercent: 50, rotationX: -100, transformOrigin: '50% 80% -40px', duration: 1.4, ease: 'expo.out', stagger: .045 }, 0)
      .from(wins, { ...genie(), duration: 1.15, ease: 'expo.out', stagger: .14 }, .2)
      .fromTo('.logo-p', { strokeDasharray: 100, strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, 0)
      .from('.logo-dot', { scale: 0, duration: .6, ease: 'back.out(3)' }, 1)
      .from(stks, { opacity: 0, scale: .3, y: -80, rotation: () => G.utils.random(-60, 60), duration: .9, ease: 'back.out(2.2)', stagger: .07 }, .8)
      .to('.desk .eb', { duration: 1, scrambleText: { text: '01 · Hello, I\'m', chars: '01/#_', speed: .6 } }, .2)
      .from('.cue', { opacity: 0, y: 20, duration: .8, ease: 'expo.out' }, 1.2);
    $$('.stats [data-count]').forEach(b => {
      const o = { v: 0 }, end = +b.dataset.count, suf = b.dataset.suffix || '';
      tl.to(o, { v: end, duration: 1.6, ease: 'power3.out', onUpdate: () => b.textContent = Math.round(o.v) + suf }, .6);
    });
  }

  /* hero scatter on scroll — built after intro so the tweens start from the settled layout */
  const mm = G.matchMedia();
  function buildHeroScroll() {
    if (heroBuilt) return; heroBuilt = true;
    mm.add('(min-width: 961px)', () => {
      const tl = G.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=100%', pin: true, pinSpacing: false, scrub: .7 } });
      const V = [[70, -70, -40], [-110, -30, 35], [60, 110, -25]];
      wins.forEach((w, i) => tl.to(w, { xPercent: V[i][0], yPercent: V[i][1], rotationY: V[i][2], rotationX: 15, scale: .8, transformPerspective: 900, ease: 'power2.in' }, 0));
      stks.forEach((s, i) => tl.to(s, { xPercent: (i % 2 ? 1 : -1) * G.utils.random(300, 600), yPercent: G.utils.random(-900, -300), rotationX: 60, ease: 'power2.in' }, 0));
      tl.to(chars, { y: () => G.utils.random(-420, -120), rotation: () => G.utils.random(-40, 40), opacity: 0, ease: 'power3.in', stagger: { each: .02, from: 'center' } }, 0)
        .to('.desk .eb, .cue', { opacity: 0, y: -40 }, 0)
        .to('#dots', { opacity: 0, scale: 1.3 }, 0);
    });
  }

  /* name weight erosion + dot field + draggable windows (mouse users only) */
  if (TOYS) {
    const wq = chars.map(c => G.quickTo(c, '--w', { duration: .6, ease: 'power3' }));
    const hero = $('#hero');
    hero.addEventListener('pointermove', e => chars.forEach((c, i) => {
      const r = c.getBoundingClientRect(), d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      wq[i](800 - 680 * Math.max(0, 1 - d / 300));
    }));
    hero.addEventListener('pointerleave', () => wq.forEach(q => q(800)));

    await yieldTask();
    // dot field
    const cv = $('#dots'), cx = cv.getContext('2d');
    let W, Hh, pts = [], mx = -999, my = -999, run = false, col = '20,20,20';
    const size = () => {
      const dpr = Math.min(devicePixelRatio, 2); W = hero.offsetWidth; Hh = hero.offsetHeight;
      cv.width = W * dpr; cv.height = Hh * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); pts = [];
      for (let y = 13; y < Hh; y += 26) for (let x = 13; x < W; x += 26) pts.push({ x, y, ox: 0, oy: 0 });
      col = H.hasAttribute('data-dark') ? '242,238,230' : '20,20,20';
    };
    size(); addEventListener('resize', size); new MutationObserver(size).observe(H, { attributes: true, attributeFilter: ['data-dark'] });
    hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', () => { mx = my = -999; });
    const draw = () => {
      if (!run) return;
      cx.clearRect(0, 0, W, Hh);
      for (const p of pts) {
        const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy), f = Math.max(0, 1 - d / 160);
        p.ox += ((dx / (d || 1)) * f * 26 - p.ox) * .14; p.oy += ((dy / (d || 1)) * f * 26 - p.oy) * .14;
        cx.fillStyle = f > 0 ? `rgba(242,96,30,${.25 + f * .75})` : `rgba(${col},.16)`;
        cx.beginPath(); cx.arc(p.x + p.ox, p.y + p.oy, 1.3 + f * 2.4, 0, 6.283); cx.fill();
      }
    };
    G.ticker.add(draw);
    ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom top', onToggle: s => run = s.isActive });

    await yieldTask();
    // windows + stickers
    let z = 10;
    wins.forEach(w => {
      const rot = G.quickTo(w, 'rotation', { duration: .5, ease: 'power3' });
      Draggable.create(w, {
        trigger: $('.win-bar', w), inertia: true, bounds: hero, edgeResistance: .85,
        onPress() { G.set(w, { zIndex: ++z }); G.to(w, { scale: 1.03, duration: .25, ease: 'power3' }); },
        onRelease() { G.to(w, { scale: 1, duration: .6, ease: 'elastic.out(1,.5)' }); },
        onDrag() { rot(G.utils.clamp(-14, 14, this.deltaX * .7)); },
        onThrowUpdate() { rot(G.utils.clamp(-14, 14, this.deltaX * .7)); },
        onThrowComplete() { rot(0); }
      });
      w.addEventListener('pointerdown', () => G.set(w, { zIndex: ++z }));
    });
    stks.forEach(s => Draggable.create(s, {
      inertia: true, bounds: hero, zIndexBoost: true,
      onPress() { G.to(s, { scale: 1.15, duration: .2 }); },
      onRelease() { G.to(s, { scale: 1, duration: .7, ease: 'elastic.out(1,.4)' }); },
      onDrag() { G.to(s, { rotation: G.utils.clamp(-50, 50, this.deltaX * 3), duration: .4 }); },
      onThrowComplete() { G.to(s, { rotation: G.utils.random(-12, 12), duration: .8, ease: 'elastic.out(1,.4)' }); }
    }));
  } else {
    // phones: a tap squish on the photo is all the hero toy we allow
    const ph = $('.w-photo');
    ph.addEventListener('pointerdown', () => G.fromTo(ph, { scale: .95 }, { scale: 1, duration: .7, ease: 'elastic.out(1,.4)' }));
  }

  boot(intro);

  await yieldTask();
  /* ── generic reveals ──────────────────────────────────── */
  $$('.h2.split').forEach(h => {
    SplitText.create(h, {
      type: 'lines,words,chars', linesClass: 'ln', charsClass: 'c', mask: 'lines', autoSplit: true,
      onSplit(self) {
        const em = self.chars.filter(c => c.closest('em'));
        const tl = G.timeline({ scrollTrigger: { trigger: h, start: 'top 86%', once: true } });
        tl.from(self.chars, { yPercent: 115, rotation: 8, duration: 1.1, ease: 'expo.out', stagger: .022 });
        if (TOYS) tl.fromTo(self.chars, { '--w': 250 }, { '--w': 800, duration: .9, ease: 'power2.inOut', stagger: .03 }, .15);   // weight arrives with the letters
        if (em.length) tl.fromTo(em, { color: 'rgba(0,0,0,0)' }, { color: getComputedStyle(h).color, duration: .5, stagger: .04, ease: 'power2.out', yoyo: true, repeat: 1, repeatDelay: .2 }, .5);
        return tl;
      }
    });
  });
  $$('section:not(#hero) > .wrap .eb, .pj-hd .eb, .bk-pin .eb').forEach(eb => {
    const t = eb.textContent;
    ScrollTrigger.create({ trigger: eb, start: 'top 90%', once: true, onEnter: () => G.to(eb, { duration: 1.1, scrambleText: { text: t, chars: '01/#_<>', speed: .6 } }) });
  });
  if (TOYS) $$('p.rv').forEach(p => SplitText.create(p, {
    type: 'lines', mask: 'lines', aria: 'none', autoSplit: true,
    onSplit: s => G.from(s.lines, { yPercent: 105, duration: 1.05, ease: 'expo.out', stagger: .07, scrollTrigger: { trigger: p, start: 'top 90%', once: true } })
  }));
  ScrollTrigger.batch(TOYS ? '.rv:not(p)' : '.rv', {
    start: 'top 90%', once: true, batchMax: 4,
    onEnter: els => G.from(els, { y: 50, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .08 })
  });

  /* ink sections open like a maximising window */
  // (transform + opacity only: an animated clip-path repainted whole sections and dropped frames)
  $$('section.ink').forEach(s => {
    const bg = $('.ink-bg', s), st = { trigger: s, start: 'top bottom', end: 'top 20%', scrub: true };
    G.fromTo(bg, { scaleX: .86, y: 60 }, { scaleX: 1, y: 0, ease: 'none', scrollTrigger: st });
    G.fromTo($('i', bg), { opacity: 1 }, { opacity: 0, ease: 'power2.in', scrollTrigger: st });
  });

  await yieldTask();
  /* ── about: README scrub ──────────────────────────────── */
  const rd = SplitText.create('#readme', { type: 'words', wordsClass: 'w', aria: 'none' });
  const marks = $$('#readme mark');
  G.set(marks, { '--m': 0 });
  mm.add({ d: '(min-width: 961px)', m: '(max-width: 960px)' }, ctx => {
    const tl = G.timeline({ scrollTrigger: { trigger: '.readme', start: ctx.conditions.d ? 'center center' : 'top 75%', end: ctx.conditions.d ? '+=140%' : 'bottom 40%', pin: ctx.conditions.d, scrub: .5 } });
    // dim words stay at 3:1+ contrast (large text), lit words go to full cream; words inside a highlight end on ink
    tl.fromTo(rd.words, { color: '#6b665f' }, { color: (i, w) => w.closest('mark') ? '#141414' : '#f2eee6', stagger: .1, ease: 'none', duration: .3 }, 0);
    marks.forEach(m => tl.fromTo(m, { '--m': 0 }, { '--m': 1, duration: .4, ease: 'power2.out' }, rd.words.indexOf($('.w', m)) * .1));
  });

  // terminal: type the command, then print each folder
  const term = $('.w-term');
  const termTl = G.timeline({ paused: true });
  termTl.from('.typed', { duration: .7, scrambleText: { text: '', chars: 'lowerCase' } })
    .from('.sk', { opacity: 0, x: -20, duration: .35, stagger: .14, ease: 'power3.out' })
    .from('.chips li', { opacity: 0, scale: .6, duration: .4, ease: 'back.out(2)', stagger: .015 }, '-=.6');
  ScrollTrigger.create({ trigger: term, start: 'top 75%', once: true, onEnter: () => termTl.play() });
  G.from(term, { y: 120, rotationX: 20, transformPerspective: 1200, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: term, start: 'top 92%', once: true } });

  await yieldTask();
  /* ── ticker: speed and skew follow scroll velocity ────── */
  const loops = $$('.strip-in').map((el, i) => G.fromTo(el, { xPercent: i ? -50 : 0 }, { xPercent: i ? 0 : -50, duration: 30, ease: 'none', repeat: -1 }));
  const skew = G.quickTo('.strip-in', 'skewX', { duration: .4, ease: 'power3' });
  let dir = 1;
  ScrollTrigger.create({
    start: 0, end: 'max', onUpdate(s) {
      const v = s.getVelocity(); dir = s.direction;
      loops.forEach(l => G.to(l, { timeScale: dir * (1 + Math.min(Math.abs(v) / 250, 9)), duration: .2, overwrite: true }));
      skew(G.utils.clamp(-12, 12, v / -150));
      clearTimeout(skew.t); skew.t = setTimeout(() => { loops.forEach(l => G.to(l, { timeScale: dir, duration: 1.2 })); skew(0); }, 120);
    }
  });

  await yieldTask();
  /* ── achievements: odometer leaderboard ───────────────── */
  const achs = $$('.ach');
  mm.add('(min-width: 961px)', () => {
    const reels = $$('.odo .reel > span'), lbl = $('.odo-l span');
    let cur = -1;
    const roll = i => {
      if (i === cur) return; cur = i;
      const r = achs[i].dataset.rank;
      reels.forEach((rl, k) => G.to(rl, { yPercent: -10 * +r[k], duration: .9 + k * .25, ease: 'expo.inOut', overwrite: true }));
      G.to(lbl, { duration: .6, scrambleText: { text: achs[i].dataset.lbl, chars: 'upperCase', speed: .8 } });
    };
    roll(0);
    G.set(achs.slice(1), { yPercent: 120, rotationX: -50, opacity: 0 });
    const tl = G.timeline({
      scrollTrigger: {
        trigger: '.ach-pin', start: 'top top', end: '+=' + achs.length * 75 + '%', pin: true, scrub: .8,
        onUpdate: s => roll(Math.min(achs.length - 1, Math.floor(s.progress * tl.duration() + .1)))   // flips as each card is half in
      }
    });
    achs.forEach((a, i) => {
      if (!i) return;
      const at = i - .6;
      tl.to(a, { yPercent: 0, rotationX: 0, duration: 1, ease: 'power3.out' }, at).to(a, { opacity: 1, duration: .25, ease: 'none' }, at);
      achs.slice(0, i).forEach((p, k) => tl.to(p, { yPercent: -7 * (i - k), scale: 1 - .06 * (i - k), opacity: (i - k) > 2 ? 0 : 1 - .3 * (i - k), duration: 1, ease: 'power3.out' }, at));
    });
    tl.to({}, { duration: .5 });
    return () => G.set(achs, { clearProps: 'all' });
  });
  mm.add('(max-width: 960px)', () => {
    achs.forEach(a => G.from(a, { y: 80, rotationX: -30, transformPerspective: 900, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: a, start: 'top 88%', once: true } }));
  });

  await yieldTask();
  /* ── certificates: each seal stamps down ──────────────── */
  const finder = $('.w-finder');
  const certTl = G.timeline({ paused: true });
  certTl.from(finder, { y: 80, opacity: 0, duration: .9, ease: 'expo.out' })
    .from('.cert', { opacity: 0, y: 30, duration: .6, ease: 'expo.out', stagger: .08 }, '-=.5');
  $$('.cert .seal').forEach((s, i) => {
    const at = .6 + i * .22;
    certTl.from(s, { scale: 2.6, rotation: -50, opacity: 0, duration: .32, ease: 'power4.in' }, at)
      .from($('.seal-v', s), { '--to': 0, duration: 1, ease: 'expo.out' }, at + .3)
      .fromTo(finder, { y: 4 }, { y: 0, duration: .5, ease: 'elastic.out(1,.3)' }, at + .32);
  });
  ScrollTrigger.create({ trigger: finder, start: 'top 80%', once: true, onEnter: () => certTl.play() });

  await yieldTask();
  /* ── changelog: rail draws, big date flips ────────────── */
  G.fromTo('.rail i', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.log', start: 'top 55%', end: 'bottom 55%', scrub: true } });
  const bd = $('.bd-in');
  let bdTl;
  $$('.month').forEach(m => ScrollTrigger.create({
    trigger: m, start: 'top 55%', end: 'bottom 55%',
    toggleClass: 'on',
    onLeaveBack: () => m === $('.month') && setDate(m, -1),
    onToggle: s => s.isActive && setDate(m, s.direction)
  }));
  function setDate(m, dir) {   // the date rolls the way you scroll
    if (bd.textContent === m.dataset.d) return;
    bdTl && bdTl.kill();
    bdTl = G.timeline().to(bd, { yPercent: -110 * dir, duration: .2, ease: 'power2.in' })
      .add(() => bd.textContent = m.dataset.d).fromTo(bd, { yPercent: 110 * dir }, { yPercent: 0, duration: .55, ease: 'expo.out' });
  }
  ScrollTrigger.batch('.commit', {
    start: 'top 92%', once: true, batchMax: 5,
    onEnter: els => G.from(els, { x: 80, opacity: 0, rotation: 2, duration: .9, ease: 'expo.out', stagger: .07 })
  });

  /* decode screenshots and covers well before they scroll in, so first sight never costs a frame */
  ScrollTrigger.create({ trigger: '#latest', start: 'top bottom', once: true, onEnter: () =>
    $$('#projects img, #books img').forEach(i => { i.loading = 'eager'; i.decode && i.decode().catch(() => {}); }) });

  await yieldTask();
  /* ── projects: pinned horizontal app strip ────────────── */
  const track = $('#track');
  mm.add('(min-width: 961px)', () => {
    // size the app windows so screenshot + text always fit between the header and the dock, at any screen size
    const pin = $('.pj-pin'), rem = () => parseFloat(getComputedStyle(H).fontSize);
    const sizeCards = () => {
      // 2-3 layout reads instead of a stepwise search: card height = shot (w / 1.6) + text block,
      // and the lean text block barely changes with width, so a couple of passes converge
      const c = cards.find(x => !x.hidden) || cards[0], r = rem(), max = Math.min(innerWidth * .3, 25 * r);
      const aspect = parseFloat(getComputedStyle($('.pc-shot', c)).aspectRatio.split('/').reduce((a, b) => a / b)) || 1.6;
      let w = max;
      track.style.setProperty('--pcw', w + 'px');
      const top = track.getBoundingClientRect().top - pin.getBoundingClientRect().top;
      for (let k = 0; k < 3; k++) {
        const rest = c.offsetHeight - $('.pc-shot', c).offsetHeight;
        const next = G.utils.clamp(14 * r, max, (innerHeight - 6.5 * r - top - rest) * aspect);
        if (Math.abs(next - w) < 2) break;
        w = next; track.style.setProperty('--pcw', w + 'px');
      }
    };
    sizeCards(); ScrollTrigger.addEventListener('refreshInit', sizeCards);
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const skewP = G.quickTo(cards, 'skewX', { duration: .5, ease: 'power3' });
    const n = $('#pj-n'), bar = $('.pj-bar i');
    const tween = G.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '.pj-pin', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .8, invalidateOnRefresh: true,
        onRefresh: s => pjST = s,
        onUpdate: s => {
          const vis = cards.filter(c => !c.hidden);
          n.textContent = String(Math.min(vis.length, 1 + Math.round(s.progress * (vis.length - 1)))).padStart(2, '0');
          G.set(bar, { scaleX: s.progress });
          skewP(G.utils.clamp(-7, 7, s.getVelocity() / -260));
          clearTimeout(skewP.t); skewP.t = setTimeout(() => skewP(0), 140);
        }
      }
    });
    cards.forEach(c => {
      G.from(c, { rotationY: -38, xPercent: 30, opacity: .2, transformPerspective: () => c.offsetWidth * 3.2, transformOrigin: '0% 50%', ease: 'power2.out',
        scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left 100%', end: 'left 62%', scrub: true, invalidateOnRefresh: true } });
      const img = $('.pc-shot img', c);
      if (img) G.fromTo(img, { xPercent: -12, scale: 1.25 }, { xPercent: 12, scale: 1.25, ease: 'none',
        scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
    });
    if (TOYS) cards.forEach(c => {   // windows tip toward the pointer
      const rx = G.quickTo(c, 'rotationX', { duration: .6, ease: 'power3' }), lift = G.quickTo(c, 'y', { duration: .6, ease: 'power3' });
      c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); rx(((e.clientY - r.top) / r.height - .5) * -9); lift(-10); });
      c.addEventListener('pointerleave', () => { rx(0); lift(0); });
    });
    return () => { pjST = null; ScrollTrigger.removeEventListener('refreshInit', sizeCards); track.style.removeProperty('--pcw'); G.set([track, ...cards], { clearProps: 'all' }); };
  });
  mm.add('(max-width: 960px)', () => {
    ScrollTrigger.batch('.pc', { start: 'top 90%', once: true, onEnter: els => G.from(els, { y: 70, opacity: 0, duration: 1, ease: 'expo.out', stagger: .1 }) });
  });

  await yieldTask();
  /* ── books: pulled off the shelf one by one ───────────── */
  const bks = $$('.bk'), books = bks.map(b => $('.book', b)), txts = bks.map(b => $('.bk-txt', b));
  mm.add('(min-width: 961px)', () => {
    const shelf = $('.shelf');
    const slot = i => { const w = shelf.offsetWidth, bw = books[0].offsetWidth; return w - (bks.length - i) * 58 - bw / 2 + 22; };
    books.forEach((b, i) => G.set(b, { x: i ? slot(i) : 0, rotationY: i ? 90 : 24, z: 0 }));
    G.set(txts.slice(1), { autoAlpha: 0, y: 40 });
    const tl = G.timeline({ scrollTrigger: { trigger: '.bk-pin', start: 'top top', end: '+=' + bks.length * 80 + '%', pin: true, scrub: 1, invalidateOnRefresh: true } });
    for (let i = 1; i < bks.length; i++) {
      const at = (i - 1) * 1.4 + .3;
      tl.to(books[i - 1], { x: () => slot(i - 1), rotationY: 90, duration: 1, ease: 'power3.inOut' }, at)
        .to(books[i - 1], { y: -30, duration: .5, yoyo: true, repeat: 1, ease: 'sine.inOut' }, at)
        .to(books[i], { x: 0, rotationY: 24, duration: 1, ease: 'power3.inOut' }, at)
        .to(books[i], { y: -60, z: 140, duration: .5, yoyo: true, repeat: 1, ease: 'sine.inOut' }, at)
        .to(txts[i - 1], { autoAlpha: 0, y: -40, duration: .5, ease: 'power2.in' }, at)
        .fromTo(txts[i], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .6, ease: 'power3.out' }, at + .5);
    }
    tl.to({}, { duration: .4 });
    if (TOYS) books.forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); G.to(b, { rotationX: ((e.clientY - r.top) / r.height - .5) * -14, duration: .4 }); });
      b.addEventListener('pointerleave', () => G.to(b, { rotationX: 0, duration: .6, ease: 'elastic.out(1,.5)' }));
    });
    return () => G.set([...books, ...txts], { clearProps: 'all' });
  });
  mm.add('(max-width: 960px)', () => {
    bks.forEach(b => G.fromTo($('.book', b), { rotationY: 90, opacity: 0 }, { rotationY: -18, opacity: 1, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: b, start: 'top 85%', once: true } }));   // explicit angles: reading the CSS matrix back can flip the book
  });

  await yieldTask();
  /* ── faq: a chat that types itself ────────────────────── */
  const chatTl = G.timeline({ paused: true });
  $$('.qa').forEach(qa => {
    const q = $('.q', qa), a = $('.a', qa), t = $('.typing', qa);
    G.set([q, a], { autoAlpha: 0 });
    chatTl.fromTo(q, { autoAlpha: 0, scale: .5, y: 20 }, { autoAlpha: 1, scale: 1, y: 0, transformOrigin: '100% 100%', duration: .6, ease: 'back.out(1.8)' })
      .set(t, { display: 'flex' }).from(t, { scale: .5, opacity: 0, transformOrigin: '0% 100%', duration: .35, ease: 'back.out(2)' })
      .to(t, { scale: .6, opacity: 0, duration: .2 }, '+=1').set(t, { display: 'none' })
      .fromTo(a, { autoAlpha: 0, scale: .6, y: 20 }, { autoAlpha: 1, scale: 1, y: 0, transformOrigin: '0% 100%', duration: .65, ease: 'back.out(1.6)' })
      .to({}, { duration: .3 });
  });
  ScrollTrigger.create({ trigger: '.w-chat', start: 'top 75%', once: true, onEnter: () => chatTl.play() });
  G.from('.w-chat', { y: 100, rotation: 3, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.w-chat', start: 'top 92%', once: true } });

  await yieldTask();
  /* ── contact: jelly letters that lean toward you ──────── */
  const hi = SplitText.create('#chl', { type: 'chars', charsClass: 'ch' }).chars;
  G.from(hi, { yPercent: 120, rotation: () => G.utils.random(-30, 30), opacity: 0, duration: 1.3, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: '#chl', start: 'top 85%', once: true } });
  if (TOYS) {
    const qx = hi.map(c => G.quickTo(c, 'x', { duration: .8, ease: 'power3' })), qy = hi.map(c => G.quickTo(c, 'y', { duration: .8, ease: 'power3' }));
    const ct = $('#contact');
    ct.addEventListener('pointermove', e => hi.forEach((c, i) => {
      const r = c.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), f = Math.max(0, 1 - Math.hypot(dx, dy) / 600);
      qx[i](dx * f * .18); qy[i](dy * f * .18);
    }));
    ct.addEventListener('pointerleave', () => { qx.forEach(q => q(0)); qy.forEach(q => q(0)); });
    hi.forEach(c => c.addEventListener('pointerenter', () => G.fromTo(c, { scaleX: 1.3, scaleY: .7 }, { scaleX: 1, scaleY: 1, duration: 1, ease: 'elastic.out(1,.3)', overwrite: 'auto' })));
  }

  /* ── desktop layer (mouse users ≥961px only; phones and tablets keep the lighter page) ── */
  if (TOYS) {
    await yieldTask();

    // depth: windows float at different heights above the desk, and the desk tips toward the cursor
    const desk = $('.desk-in'), hero = $('#hero');
    G.set(desk, { transformPerspective: 1800, transformStyle: 'preserve-3d' });
    G.set('.w-hello', { z: 40 }); G.set('.w-photo', { z: 80 }); G.set('.w-stats', { z: 110 }); G.set(stks, { z: 150 });
    const tiltY = G.quickTo(desk, 'rotationY', { duration: 1, ease: 'power3' }), tiltX = G.quickTo(desk, 'rotationX', { duration: 1, ease: 'power3' });
    hero.addEventListener('pointermove', e => { tiltY((e.clientX / innerWidth - .5) * 6); tiltX((e.clientY / innerHeight - .5) * -4); });
    hero.addEventListener('pointerleave', () => { tiltY(0); tiltX(0); });

    // headings answer the cursor with the same weight ripple as the hero name
    $$('.h2.split').forEach(h => {
      h.addEventListener('pointermove', e => $$('.c', h).forEach(c => {
        const r = c.getBoundingClientRect(), d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
        G.to(c, { '--w': 800 - 560 * Math.max(0, 1 - d / 170), duration: .45, ease: 'power3', overwrite: 'auto' });
      }));
      h.addEventListener('pointerleave', () => G.to($$('.c', h), { '--w': 800, duration: 1, ease: 'elastic.out(1,.45)', overwrite: 'auto' }));
    });

    // app switch: long jumps from the dock or minimap cover the scroll with a full-screen "opening" card
    const sw = document.createElement('div');
    sw.id = 'switch'; sw.setAttribute('aria-hidden', 'true');
    sw.innerHTML = '<span class="sw-k"></span><b class="sw-t"></b>';
    document.body.append(sw);
    let switching = false;
    const go = id => {
      const t = document.getElementById(id); if (!t || switching) return;
      const y = t.getBoundingClientRect().top + scrollY;
      if (Math.abs(y - scrollY) < innerHeight * 1.5) return lenis.scrollTo(y, { duration: 1.1 });
      switching = true;
      const dk = $(`.dk[data-k=${id}]`);
      sw.style.setProperty('--pop', getComputedStyle(dk).getPropertyValue('--pop'));
      $('.sw-k', sw).textContent = `opening ~/${id}`;
      $('.sw-t', sw).textContent = t.dataset.l;
      G.timeline({ onComplete: () => { switching = false; } })
        .set(sw, { display: 'grid', transformOrigin: '50% 100%' })
        .fromTo(sw, { scaleY: 0 }, { scaleY: 1, duration: .42, ease: 'expo.inOut' })
        .from('.sw-t', { yPercent: 60, opacity: 0, duration: .45, ease: 'expo.out' }, '-=.12')
        .from('.sw-k', { opacity: 0, duration: .3 }, '<')
        .add(() => { lenis.scrollTo(y, { immediate: true, force: true }); ScrollTrigger.update(); })
        .set(sw, { transformOrigin: '50% 0%' }, '+=.18')
        .to(sw, { scaleY: 0, duration: .5, ease: 'expo.inOut' })
        .set(sw, { display: 'none' });
    };
    $('.dock').addEventListener('click', e => { const a = e.target.closest('.dk'); if (!a) return; e.preventDefault(); e.stopPropagation(); go(a.dataset.k); }, true);

    // minimap: the page is long and full of pinned scenes, so the right edge shows where you are
    const map = document.createElement('div');
    map.className = 'minimap'; map.setAttribute('aria-hidden', 'true');
    const secs = $$('main > section');
    map.innerHTML = secs.map(s => `<button type="button" tabindex="-1" data-k="${s.id}" style="--pop:${getComputedStyle($(`.dk[data-k=${s.id}]`)).getPropertyValue('--pop')}"><i></i><span>${s.dataset.l}</span></button>`).join('') + '<b class="mm-thumb"></b>';
    document.body.append(map);
    const thumb = $('.mm-thumb', map), btns = $$('button', map);
    let total = 1, trackH = 1;
    const layoutMap = () => {
      total = document.documentElement.scrollHeight; trackH = map.offsetHeight;
      secs.forEach((s, i) => { const top = s.getBoundingClientRect().top + scrollY; btns[i].style.top = (top / total * 100) + '%'; btns[i].style.height = (s.offsetHeight / total * 100) + '%'; });
      thumb.style.height = Math.max(10, innerHeight / total * trackH) + 'px';
    };
    btns.forEach(b => b.addEventListener('click', () => go(b.dataset.k)));
    ScrollTrigger.addEventListener('refresh', layoutMap);
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: () => G.set(thumb, { y: scrollY / total * trackH }) });
    G.from(map, { x: 40, opacity: 0, duration: 1, ease: 'expo.out', delay: 1.6 });

    // books: the front book's cover swings open to a title page, so it reads as something to open
    books.forEach(b => {
      const bk = b.closest('.bk'), front = $('.b-front', b), inner = document.createElement('span');
      inner.className = 'b-inner';
      inner.innerHTML = `<i>Purv Taparia</i><b>${$('.bk-title', bk).textContent}</b><em>${$('.bk .btn', bk) ? $('.btn', bk).textContent : 'Open ↗'}</em>`;
      b.append(inner);
      G.set(front, { z: 16, transformOrigin: '0% 50%' });
      G.set(inner, { autoAlpha: 0 });   // only exists while the cover is open (edge-on it would clutter the shelf spines)
      b.addEventListener('pointerenter', () => { if (G.getProperty(b, 'rotationY') < 45) { G.set(inner, { autoAlpha: 1 }); G.to(front, { rotationY: -132, duration: 1, ease: 'power3.out', overwrite: 'auto' }); } });
      b.addEventListener('pointerleave', () => G.to(front, { rotationY: 0, duration: .8, ease: 'power3.inOut', overwrite: 'auto', onComplete: () => G.set(inner, { autoAlpha: 0 }) }));
    });

    // the #1 rank gets one celebratory burst the first time the leaderboard comes into view
    const odo = $('.odo');
    ScrollTrigger.create({ trigger: '.ach-pin', start: 'top 35%', once: true, onEnter: () => {
      const pops = ['var(--y)', 'var(--b)', 'var(--g)', 'var(--v)', 'var(--o)'];
      for (let i = 0; i < 22; i++) {
        const p = document.createElement('i'); p.className = 'confetti'; p.style.background = pops[i % 5]; odo.append(p);
        const x = G.utils.random(-320, 320), up = G.utils.random(-300, -90);
        G.timeline({ onComplete: () => p.remove(), delay: .35 + i * .012 })
          .fromTo(p, { x: 0, y: 0, scale: 0, rotation: 0 }, { x, y: up, scale: 1, rotation: G.utils.random(-260, 260), duration: .55, ease: 'power2.out' })
          .to(p, { y: up + G.utils.random(260, 420), x: x * 1.15, rotation: '+=180', opacity: 0, duration: .9, ease: 'power2.in' });
      }
    } });
  }

  /* ── shut down / power on ─────────────────────────────── */
  const crt = $('#crt');
  $('#off').addEventListener('click', () => {
    lenis && lenis.stop();
    const b = document.body;
    G.timeline()
      .set(b, { transformOrigin: `50% ${scrollY + innerHeight / 2}px` })
      .to(b, { filter: 'brightness(2.5)', duration: .12 })
      .to(b, { scaleY: .004, duration: .3, ease: 'power4.in' })
      .to(b, { scaleX: 0, duration: .22, ease: 'power4.in' })
      .add(() => { crt.style.display = 'grid'; G.set(b, { clearProps: 'all' }); $('#on').focus(); })
      .from('#crt p', { opacity: 0, duration: .6, delay: .3 });
  });
  $('#on').addEventListener('click', () => {
    lenis ? lenis.scrollTo(0, { immediate: true, force: true }) : scrollTo(0, 0);
    ScrollTrigger.refresh();
    crt.style.display = 'none';
    H.classList.add('booting');
    boot(() => { lenis && lenis.start(); intro(); });
  });

  /* go */
  trackSections();
  ScrollTrigger.sort();
  document.fonts.ready.then(() => { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
})();
