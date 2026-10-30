(function () {
    const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
    const root = document.documentElement;
    const motion = root.classList.contains('motion');
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const toys = motion && fine && innerWidth > 960;   // playful extras: mouse users on big screens only
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

    /* ── Theme ── */
    $$('[data-theme-toggle]').forEach(b => b.addEventListener('click', () => {
        const dark = root.getAttribute('data-theme') !== 'dark';
        if (dark) root.setAttribute('data-theme', 'dark'); else root.removeAttribute('data-theme');
        try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
    }));

    /* ── Menu, back to top, copy email ── */
    const ham = $('.ham'), mnav = $('#mnav');
    const setMenu = open => { mnav.classList.toggle('open', open); ham.setAttribute('aria-expanded', open); document.body.style.overflow = open ? 'hidden' : ''; };
    ham.addEventListener('click', () => setMenu(!mnav.classList.contains('open')));
    $$('a', mnav).forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && mnav.classList.contains('open')) { setMenu(false); ham.focus(); } });
    $('#btt').addEventListener('click', () => scrollTo({ top: 0 }));
    const copy = $('#copy');
    copy.addEventListener('click', () => navigator.clipboard.writeText('tapariapurv+portfolio@gmail.com').then(() => {
        copy.classList.add('done'); setTimeout(() => copy.classList.remove('done'), 1800);
    }));

    /* ── Which section are we in: nav dot + bottom-left indicator ── */
    const where = $('#where'), links = $$('.nl a');
    const secIO = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        const s = e.target;
        where.textContent = s.dataset.n + ' / 09 · ' + s.dataset.l;
        links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + s.id));
    }), { rootMargin: '-50% 0px -50% 0px' });
    $$('section[data-n]').forEach(s => secIO.observe(s));

    /* ── Typewriter ── */
    (function () {
        const el = $('#tw'), words = ['Student', 'AI Builder', 'Author', 'Coder', 'Maker', 'Blogger'];
        if (!motion) return;
        let w = 0, i = words[0].length, del = false;
        (function tick() {
            const word = words[w];
            let wait = del ? 45 : 85;
            if (!del && i === word.length) { del = true; wait = 2000; }
            else if (del && i === 0) { del = false; w = (w + 1) % words.length; wait = 300; }
            else i += del ? -1 : 1;
            el.textContent = word.slice(0, i) || '​';
            setTimeout(tick, wait);
        })();
    })();

    /* ── Name: split into letters that hop when poked ── */
    (function () {
        const h1 = $('#name');
        h1.setAttribute('aria-label', 'Purv Taparia');
        let k = 0;
        $$('span', h1).forEach(w => {
            const t = w.textContent; w.textContent = ''; w.setAttribute('aria-hidden', 'true');
            [...t].forEach(ch => { const s = document.createElement('span'); s.className = 'l'; s.textContent = ch; s.style.setProperty('--i', k++); w.appendChild(s); });
        });
        const hop = s => { s.classList.remove('hop'); void s.offsetWidth; s.classList.add('hop'); };
        $$('.l', h1).forEach(s => { s.addEventListener('pointerenter', () => hop(s)); s.addEventListener('animationend', e => { if (e.animationName === 'hop') s.classList.remove('hop'); }); });
        h1.addEventListener('click', () => $$('.l', h1).forEach((s, i) => setTimeout(() => hop(s), i * 40)));
    })();

    /* ── Photo: tap to squish + say hi; on desktop, drag it and it springs back ── */
    (function () {
        const me = $('#me'), card = $('.me-c img', me), bub = $('#bubble');
        const lines = ["Hi, I'm Purv!", 'I build with Claude Code', 'Five books so far', 'Try scrolling slowly'];
        let n = 0, t;
        const say = () => { bub.textContent = lines[n++ % lines.length]; bub.classList.add('show'); clearTimeout(t); t = setTimeout(() => bub.classList.remove('show'), 1800); };
        let moved = 0;
        me.addEventListener('click', () => { if (moved > 6) return; me.classList.add('squish'); setTimeout(() => me.classList.remove('squish'), 140); say(); if (toys) { confetti(16); vy -= 6; kick(); } });
        me.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); me.click(); } });
        if (!toys) return;
        // Live-site physics: drag pulls it with a lag, release springs back with a spin, hover tilts it in 3D
        const cols = ['var(--y)', 'var(--b)', 'var(--g)', 'var(--v)', 'var(--o)'];
        function confetti(n) {
            for (let i = 0; i < n; i++) {
                const p = document.createElement('i'), a = Math.random() * Math.PI * 2, d = 90 + Math.random() * 120;
                p.className = 'confetti'; p.style.background = cols[i % cols.length]; me.appendChild(p);
                p.animate([{ transform: 'translate(-50%,-50%) rotate(0)', opacity: 1 },
                    { transform: `translate(calc(-50% + ${Math.cos(a) * d | 0}px), calc(-50% + ${Math.sin(a) * d + 50 | 0}px)) rotate(${Math.random() * 720 - 360 | 0}deg)`, opacity: 0 }],
                    { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.16,1,.3,1)' }).onfinish = () => p.remove();
            }
        }
        let x = 0, y = 0, vx = 0, vy = 0, rot = 0, vr = 0, tx = 0, ty = 0, sx = 0, sy = 0, drag = false, raf = 0;
        const tilt = { x: 0, y: 0 };
        function frame() {
            const k = drag ? .35 : .12, d = drag ? .6 : .78;
            vx = (vx + (tx - x) * k) * d; vy = (vy + (ty - y) * k) * d; x += vx; y += vy;
            vr = (vr + (vx * 1.6 - rot) * .18) * .72; rot += vr;
            card.style.transform = `translate(${x}px,${y}px) rotate(${rot}deg) perspective(700px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`;
            if (drag || Math.abs(vx) + Math.abs(vy) + Math.abs(vr) + Math.abs(x) + Math.abs(y) + Math.abs(rot) + Math.abs(tilt.x) + Math.abs(tilt.y) > .05) raf = requestAnimationFrame(frame);
            else { raf = 0; card.style.transform = card.style.transition = ''; }
        }
        function kick() { card.style.transition = 'none'; if (!raf) raf = requestAnimationFrame(frame); }
        me.addEventListener('pointerdown', e => { drag = true; sx = e.clientX; sy = e.clientY; moved = 0; me.setPointerCapture(e.pointerId); kick(); });
        me.addEventListener('pointermove', e => {
            if (drag) {
                const dx = e.clientX - sx, dy = e.clientY - sy;
                moved = Math.max(moved, Math.hypot(dx, dy));
                tx = Math.max(-140, Math.min(140, dx * .8)); ty = Math.max(-100, Math.min(100, dy * .8));
                if (moved > 30 && !bub.classList.contains('show')) { bub.textContent = 'Wheee!'; bub.classList.add('show'); clearTimeout(t); t = setTimeout(() => bub.classList.remove('show'), 1200); }
            } else if (e.pointerType === 'mouse') {
                const r = me.getBoundingClientRect();
                tilt.x = ((e.clientX - r.left) / r.width - .5) * 16; tilt.y = -((e.clientY - r.top) / r.height - .5) * 16; kick();
            }
        });
        const up = () => { if (!drag) return; drag = false; tx = ty = 0; vr += vx * 2.2; kick(); };
        me.addEventListener('pointerup', up); me.addEventListener('pointercancel', up);
        me.addEventListener('pointerleave', () => { tilt.x = tilt.y = 0; kick(); });
    })();

    /* ── Magnetic buttons (desktop toys) ── */
    if (toys) $$('.btn').forEach(b => {
        b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.translate = `${(e.clientX - r.left - r.width / 2) * .18}px ${(e.clientY - r.top - r.height / 2) * .3}px`; });
        b.addEventListener('pointerleave', () => { b.style.translate = ''; });
    });

    /* ── Expanders: changelog, books, book picker ── */
    function expander(btn, box, more, less) {
        btn.addEventListener('click', () => {
            const open = !box.classList.contains('open');
            box.classList.toggle('open', open); btn.setAttribute('aria-expanded', open);
            btn.textContent = open ? less : more;
            if (!open) box.scrollIntoView({ block: 'start' });
            measure();
        });
    }
    expander($('#log-more'), $('#log'), 'View full history ↓', 'Show less ↑');
    expander($('#bk-more'), $('#bk-list'), 'View more books (+2) ↓', 'Show fewer books ↑');
    (function () {
        const tabs = $$('.pick-opt');
        tabs.forEach(t => t.addEventListener('click', () => {
            tabs.forEach(o => { const on = o === t; o.setAttribute('aria-selected', on); o.tabIndex = on ? 0 : -1; $('#' + o.getAttribute('aria-controls')).classList.toggle('on', on); });
        }));
        $('.pick-opts').addEventListener('keydown', e => {
            const i = tabs.indexOf(document.activeElement), d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
            if (i < 0 || !d) return;
            e.preventDefault(); const t = tabs[(i + d + tabs.length) % tabs.length]; t.focus(); t.click();
        });
    })();

    /* ── Project filter ── */
    const cards = $$('.pc');
    $$('.filt button').forEach(b => b.addEventListener('click', () => {
        $$('.filt button').forEach(o => o.setAttribute('aria-pressed', o === b));
        cards.forEach(c => { c.hidden = b.dataset.f !== 'all' && !c.querySelector('.' + b.dataset.f); });
        $('#hs-t').textContent = String(cards.filter(c => !c.hidden).length).padStart(2, '0');
        measure();
    }));
    $('#hs-t').textContent = String(cards.length);

    /* ── Count-up stats ── */
    const countIO = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        countIO.unobserve(e.target);
        const el = e.target, to = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now();
        (function step(now) { const k = clamp((now - t0) / 1000); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + suf; if (k < 1) requestAnimationFrame(step); })(t0);
    }), { threshold: .6 });

    /* ── Simple scroll bits that run for everyone with JS ── */
    const nav = $('#nav'), btt = $('#btt');
    addEventListener('scroll', () => { nav.classList.toggle('solid', scrollY > 20); btt.classList.toggle('show', scrollY > innerHeight * 1.5); }, { passive: true });

    if (!motion) return;   // crawlers and reduced-motion visitors stop here: flat page (bots also get every list expanded)
    $$('[data-count]').forEach(el => countIO.observe(el));

    /* ── Reveals (fade-up 16px, staggered 80ms) + timeline dots ── */
    $$('.about-r > .rev').forEach((el, i) => el.style.setProperty('--d', i * .08 + 's'));
    const revIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revIO.unobserve(e.target); } }), { threshold: .15 });
    $$('.rev').forEach(el => revIO.observe(el));
    const dotIO = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('in', e.isIntersecting || e.boundingClientRect.top < 0)), { rootMargin: '0px 0px -45% 0px' });
    $$('.log-month').forEach(el => dotIO.observe(el));

    /* ── Scroll engine ──
       Each item maps scroll position to a 0..1 progress, eased toward its target every frame,
       and written to a --p custom property. CSS turns --p into motion (transform/opacity only). */
    const items = [];
    let vh = innerHeight, wide = innerWidth >= 900, lastY = scrollY, vel = 0, raf = 0, lastT = 0, lastV = '';
    const view = it => y => (y + vh - it.top) / (vh + it.h);                 // enters bottom → leaves top
    const pin = it => y => (y - it.top) / Math.max(1, it.h - vh);           // through a tall pinned section
    const enter = it => y => (y + vh - it.top) / (vh * .7);                  // enters bottom → 70% up
    function reg(el, kind, fn, cb) { if (el) items.push({ el, kind, fn, cb, top: 0, h: 0, cur: 0, set: -1 }); }

    const hero = $('#hero'), about = $('#about'), proj = $('#projects'), track = $('#track'), deck = $('#deck'), log = $('#log');
    const words = $$('#ahl .sw'), books = $$('.bk'), bkI = $('#bk-i'), hsN = $('#hs-n'), achs = $$('.ach');

    reg($('#prog'), 'doc');
    reg(hero, pin);
    reg(about, view, null, p => { const n = clamp(Math.floor((p - .12) / .07) + 1, 0, 4); words.forEach((w, i) => w.classList.toggle('on', i < n)); });
    reg($('#skills'), view);
    reg($('#tick'), view);
    $$('.cert').forEach(c => reg(c, enter));
    reg(log, 'line');
    reg(proj, pin, null, p => { const vis = cards.filter(c => !c.hidden).length; hsN.textContent = String(Math.round(p * (vis - 1)) + 1).padStart(2, '0'); });
    reg(deck, pin, null, p => {
        if (!wide) return;
        const f = p * (books.length - 1), a = Math.round(f);
        deck.style.setProperty('--f', f.toFixed(3));
        books.forEach((b, i) => b.classList.toggle('on', i === a));
        bkI.textContent = a + 1;
    });
    reg($('#contact'), enter);
    // Stacked achievement cards: each shrinks as the next one slides over it
    achs.forEach((c, i) => reg(c, 'stack'));

    function measure() {
        vh = innerHeight; wide = innerWidth >= 900;
        // Projects: the section is as tall as the sideways distance, so one px of scroll = one px of slide
        if (wide) { const dx = Math.max(0, track.scrollWidth - innerWidth); proj.style.height = dx + vh + 'px'; proj.style.setProperty('--dx', dx); }
        else { proj.style.height = ''; proj.style.removeProperty('--dx'); }
        const y = scrollY;
        items.forEach(it => { const r = it.el.getBoundingClientRect(); it.top = r.top + y; it.h = r.height; });
        // Sticky cards report their stuck position, so rebuild their resting tops from the list
        const list = $('#ach-list'), lt = list.getBoundingClientRect().top + y; let off = 0;
        const st = achs.map(c => { const t = lt + off; off += c.offsetHeight + 32; return t; });
        items.filter(it => it.kind === 'stack').forEach((it, i) => {
            const stick = parseFloat(getComputedStyle(it.el).top) || 0, next = st[i + 1];
            it.fn = next ? (yy => (yy - (st[i] - stick)) / (next - st[i])) : () => 0;
        });
        items.forEach(it => { if (typeof it.kind === 'function') it.fn = it.kind(it); });
        kick();
    }
    function target(it, y) {
        if (it.kind === 'doc') return y / Math.max(1, document.documentElement.scrollHeight - vh);
        if (it.kind === 'line') return (y + vh * .55 - it.top) / it.h;
        return it.fn ? it.fn(y) : 0;
    }
    function frame(t) {
        const dt = Math.min(64, t - (lastT || t)) || 16.7; lastT = t;
        const y = scrollY, k = 1 - Math.pow(1 - .18, dt / 16.7);
        let busy = false;
        items.forEach(it => {
            const to = clamp(target(it, y));
            it.cur += (to - it.cur) * k;
            if (Math.abs(to - it.cur) < .0004) it.cur = to; else busy = true;
            if (it.cur !== it.set) { it.set = it.cur; it.el.style.setProperty('--p', it.cur.toFixed(4)); if (it.cb) it.cb(it.cur); }
        });
        // Scroll velocity skews the sideways project cards a touch, then they settle
        const inProj = wide && y > proj.offsetTop - vh && y < proj.offsetTop + proj.offsetHeight;
        vel += ((inProj ? clamp((y - lastY) / dt * -3, -5, 5) : 0) - vel) * k; lastY = y;
        if (Math.abs(vel) < .01) vel = 0; else busy = true;
        const v = vel.toFixed(3); if (v !== lastV) track.style.setProperty('--vel', lastV = v);
        raf = busy ? requestAnimationFrame(frame) : 0;
        if (!busy) lastT = 0;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    addEventListener('scroll', kick, { passive: true });
    let rz; const remeasure = () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(measure); };
    addEventListener('resize', remeasure);
    addEventListener('load', remeasure);
    new ResizeObserver(remeasure).observe(document.body);
    if (document.fonts) document.fonts.ready.then(remeasure);
    measure();
    items.forEach(it => { it.cur = clamp(target(it, scrollY)); });   // start in place, no swoop on reload mid-page
})();
