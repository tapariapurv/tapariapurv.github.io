        (function () {
            const root = document.documentElement;
            const isBot = root.classList.contains('bot');
            const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
            const calm = () => isBot || rm.matches;
            const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
            const $ = (s, el) => (el || document).querySelector(s);
            const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
            if (calm()) root.classList.add('no-motion');

            /* ── Theme ─────────────────────────────────────────── */
            function syncThemeLabel() {
                const light = root.getAttribute('data-theme') === 'light';
                $$('.theme-label').forEach(el => el.textContent = light ? 'Dark Mode' : 'Light Mode');
                const m = $('meta[name="theme-color"]'); if (m) m.content = light ? '#fbfcfc' : '#080a0f';
            }
            $$('[data-theme-toggle]').forEach(btn => btn.addEventListener('click', () => {
                const light = root.getAttribute('data-theme') !== 'light';
                if (light) root.setAttribute('data-theme', 'light'); else root.removeAttribute('data-theme');
                try { localStorage.setItem('theme', light ? 'light' : 'dark'); } catch (e) {}
                syncThemeLabel();
            }));
            syncThemeLabel();

            /* ── Nav, mobile menu, progress, back to top ───────── */
            const nav = $('#nav'), ham = $('.nav-ham'), mnav = $('#mnav'), sprog = $('#sprog'), btt = $('#btt');
            function setMenu(open) {
                mnav.classList.toggle('open', open);
                ham.setAttribute('aria-expanded', open);
                document.body.style.overflow = open ? 'hidden' : '';
            }
            ham.addEventListener('click', () => setMenu(!mnav.classList.contains('open')));
            $$('a', mnav).forEach(a => a.addEventListener('click', () => setMenu(false)));
            document.addEventListener('keydown', e => { if (e.key === 'Escape' && mnav.classList.contains('open')) { setMenu(false); ham.focus(); } });
            btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: calm() ? 'instant' : 'smooth' }));

            const navLinks = $$('.nav-links a[href^="#"]:not(.nav-cta)');
            const navTargets = navLinks.map(a => $(a.getAttribute('href')));
            function onScrollBasic() {
                const y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
                nav.classList.toggle('scrolled', y > 30);
                btt.classList.toggle('show', y > innerHeight * 1.2);
                sprog.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
                let cur = -1;
                navTargets.forEach((t, i) => { if (t && t.getBoundingClientRect().top < innerHeight * .4) cur = i; });
                navLinks.forEach((a, i) => a.classList.toggle('active', i === cur));
            }

            /* ── Scroll reveal ─────────────────────────────────── */
            const revs = $$('.rev, .cert');
            if (calm() || !('IntersectionObserver' in window)) revs.forEach(el => el.classList.add('in'));
            else {
                const io = new IntersectionObserver(es => es.forEach(e => {
                    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
                }), { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });
                revs.forEach(el => io.observe(el));
            }

            /* ── Count-up stats ────────────────────────────────── */
            $$('[data-count]').forEach(el => {
                if (calm()) return;
                const to = +el.dataset.count, suf = el.dataset.suffix || '';
                const io = new IntersectionObserver(es => {
                    if (!es[0].isIntersecting) return; io.disconnect();
                    const t0 = performance.now();
                    (function step(now) {
                        const p = Math.min(1, (now - t0) / 1100), e = 1 - Math.pow(1 - p, 3);
                        el.textContent = Math.round(to * e) + suf;
                        if (p < 1) requestAnimationFrame(step);
                    })(t0);
                });
                io.observe(el);
            });

            /* ── Card shine follows the pointer ────────────────── */
            if (fine) document.addEventListener('pointermove', e => {
                const c = e.target.closest && e.target.closest('.tc');
                if (!c) return;
                const r = c.getBoundingClientRect();
                c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
                c.style.setProperty('--my', (e.clientY - r.top) + 'px');
            }, { passive: true });

            /* ── Typewriter ────────────────────────────────────── */
            (function () {
                const el = $('#tw-word');
                if (calm()) { el.textContent = 'Student · Author · Coder · Blogger'; $('.tw-pre').style.display = 'none'; return; }
                const words = ['Student', 'AI Builder', 'Author', 'Coder', 'Maker', 'Blogger'];
                const pre = $('.tw-pre');
                let w = 0, i = words[0].length, del = false;
                function tick() {
                    const word = words[w];
                    if (i === 0 && !del) pre.innerHTML = (/^[AEIOU]/.test(word) ? "I'm an" : "I'm a") + '&nbsp;';
                    i += del ? -1 : 1;
                    el.textContent = word.slice(0, i);
                    let wait = del ? 45 : 85;
                    if (!del && i === word.length) { del = true; wait = 1600; }
                    else if (del && i === 0) { del = false; w = (w + 1) % words.length; wait = 280; }
                    setTimeout(tick, wait);
                }
                setTimeout(() => { del = true; tick(); }, 2000);
                if (fine) el.addEventListener('click', () => {
                    w = (w + 1) % words.length; i = 0; del = false; el.textContent = '';
                    el.animate([{ transform: 'scale(1.25) rotate(-4deg)' }, { transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.34,1.56,.64,1)' });
                });
            })();

            const hero = $('#hero');
            const toys = !calm() && fine && innerWidth > 960;   // the extra toys are for mouse users on big screens

            /* ── Wobbly name: letters hop on tap, dodge the cursor on desktop ── */
            (function () {
                const h1 = $('#hero-name');
                h1.setAttribute('aria-label', 'Purv Taparia');
                [h1, $('em', h1)].forEach(node => {
                    Array.from(node.childNodes).forEach(n => {
                        if (n.nodeType !== 3 || !n.textContent.trim()) return;
                        const frag = document.createDocumentFragment();
                        n.textContent.trim().split('').forEach(ch => {
                            const s = document.createElement('span');
                            s.className = 'ch'; s.textContent = ch; s.setAttribute('aria-hidden', 'true');
                            frag.appendChild(s);
                        });
                        n.replaceWith(frag);
                    });
                });
                if (calm()) return;
                const chars = $$('.ch', h1);
                function hop(s, big) {
                    s.classList.add('pop');
                    s.style.setProperty('--hop', (big ? -18 : -12) + 'px');
                    s.style.setProperty('--hr', (Math.random() * 16 - 8) * (big ? 1.4 : 1) + 'deg');
                    setTimeout(() => { s.classList.remove('pop'); s.style.setProperty('--hop', '0px'); s.style.setProperty('--hr', '0deg'); }, 180);
                }
                chars.forEach(s => s.addEventListener('pointerenter', () => hop(s)));
                h1.addEventListener('click', () => chars.forEach((s, i) => setTimeout(() => hop(s, true), i * 45)));
                window.__wave = () => chars.forEach((s, i) => setTimeout(() => hop(s), i * 40));
                if (!toys) return;
                // Magnet: letters lean away from the cursor and glide back
                let base = null, px = 0, py = 0, inside = false, raf = 0;
                const cur = chars.map(() => [0, 0, 0]);
                function measure() {
                    base = chars.map((s, i) => { const r = s.getBoundingClientRect(); return [r.left + r.width / 2 - cur[i][0], r.top + r.height / 2 - cur[i][1]]; });
                }
                function frame() {
                    raf = 0;
                    let busy = false;
                    chars.forEach((s, i) => {
                        let tx = 0, ty = 0, tr = 0, f = 0;
                        if (inside && base) {
                            const dx = base[i][0] - px, dy = base[i][1] - py, d = Math.hypot(dx, dy) || 1, R = 150;
                            f = d < R ? 1 - d / R : 0;
                            tx = dx / d * f * 30; ty = dy / d * f * 30; tr = dx / d * f * 16;
                        }
                        const c = cur[i];
                        c[0] += (tx - c[0]) * .16; c[1] += (ty - c[1]) * .16; c[2] += (tr - c[2]) * .16;
                        if (Math.abs(tx - c[0]) + Math.abs(ty - c[1]) + Math.abs(tr - c[2]) > .05) busy = true;
                        s.style.setProperty('--tx', c[0].toFixed(2) + 'px');
                        s.style.setProperty('--ty', c[1].toFixed(2) + 'px');
                        s.style.setProperty('--tr', c[2].toFixed(2) + 'deg');
                        s.classList.toggle('hot', f > .4);
                    });
                    if (busy) raf = requestAnimationFrame(frame);
                    else if (!inside) h1.classList.remove('magnet');
                }
                hero.addEventListener('pointermove', e => {
                    if (e.pointerType !== 'mouse') return;
                    if (!base) measure();
                    px = e.clientX; py = e.clientY; inside = true;
                    h1.classList.add('magnet');
                    if (!raf) raf = requestAnimationFrame(frame);
                });
                hero.addEventListener('pointerleave', () => { inside = false; if (!raf) raf = requestAnimationFrame(frame); });
                window.addEventListener('scroll', () => { base = null; }, { passive: true });
                window.addEventListener('resize', () => { base = null; });
            })();

            /* ── Wobbly photo: drag it, it springs back; tap it on phones ── */
            (function () {
                const me = $('#me'), card = $('#me-card'), bubble = $('#me-bubble');
                const lines = ["Hi, I'm Purv!", 'Drag me around!', 'Fling the stickers!', 'Poke my name!', 'Again?'];
                let line = 0;
                function say(t) {
                    bubble.textContent = t; me.classList.add('talk');
                    clearTimeout(say.t); say.t = setTimeout(() => me.classList.remove('talk'), 1600);
                }
                if (calm()) { card.classList.remove('idle'); return; }
                if (!fine) {
                    // Phones: a small squish and a hello, nothing that fights with scrolling
                    me.addEventListener('click', () => {
                        card.classList.add('squish');
                        setTimeout(() => card.classList.remove('squish'), 140);
                        say(lines[0]);
                    });
                    return;
                }
                function confetti(n) {
                    const cols = ['var(--accent)', '#f5c842', '#ff6b6b', 'var(--paper)'];
                    for (let i = 0; i < n; i++) {
                        const p = document.createElement('i');
                        p.className = 'confetti'; p.style.background = cols[i % cols.length];
                        me.appendChild(p);
                        const a = Math.random() * Math.PI * 2, d = 90 + Math.random() * 120;
                        p.animate([
                            { transform: 'translate(-50%,-50%) rotate(0)', opacity: 1 },
                            { transform: 'translate(calc(-50% + ' + (Math.cos(a) * d).toFixed(0) + 'px), calc(-50% + ' + (Math.sin(a) * d + 50).toFixed(0) + 'px)) rotate(' + (Math.random() * 720 - 360).toFixed(0) + 'deg)', opacity: 0 }
                        ], { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.16,1,.3,1)' }).onfinish = () => p.remove();
                    }
                }
                let x = 0, y = 0, vx = 0, vy = 0, rot = -3, vr = 0, tx = 0, ty = 0;
                let dragging = false, sx = 0, sy = 0, moved = 0, raf = 0, tilt = { x: 0, y: 0 };
                function frame() {
                    const k = dragging ? 0.35 : 0.12, d = dragging ? 0.6 : 0.78;
                    vx = (vx + (tx - x) * k) * d; vy = (vy + (ty - y) * k) * d;
                    x += vx; y += vy;
                    const targetRot = -3 + vx * 1.6;
                    vr = (vr + (targetRot - rot) * 0.18) * 0.72; rot += vr;
                    card.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + rot + 'deg) perspective(700px) rotateX(' + tilt.y + 'deg) rotateY(' + tilt.x + 'deg)';
                    if (dragging || Math.abs(vx) + Math.abs(vy) + Math.abs(vr) + Math.abs(x) + Math.abs(y) + Math.abs(rot + 3) + Math.abs(tilt.x) + Math.abs(tilt.y) > 0.05) raf = requestAnimationFrame(frame);
                    else { raf = 0; card.style.transform = ''; card.classList.add('idle'); }
                }
                function kick() { card.classList.remove('idle'); if (!raf) raf = requestAnimationFrame(frame); }
                me.addEventListener('pointerdown', e => {
                    dragging = true; sx = e.clientX; sy = e.clientY; moved = 0;
                    me.classList.add('grab'); me.setPointerCapture(e.pointerId); kick();
                });
                me.addEventListener('pointermove', e => {
                    if (dragging) {
                        const dx = e.clientX - sx, dy = e.clientY - sy;
                        moved = Math.max(moved, Math.hypot(dx, dy));
                        tx = Math.max(-140, Math.min(140, dx * .8)); ty = Math.max(-100, Math.min(100, dy * .8));
                        if (moved > 30) say('Wheee!');
                    } else if (e.pointerType === 'mouse') {
                        const r = me.getBoundingClientRect();
                        tilt.x = ((e.clientX - r.left) / r.width - .5) * 16;
                        tilt.y = -((e.clientY - r.top) / r.height - .5) * 16;
                        kick();
                    }
                });
                function release() {
                    if (!dragging) return;
                    dragging = false; tx = ty = 0; me.classList.remove('grab');
                    vr += vx * 2.2; kick();
                    if (moved < 6) { confetti(16); say(lines[line++ % lines.length]); vy -= 6; }
                    if (window.__wave) window.__wave();
                }
                me.addEventListener('pointerup', release);
                me.addEventListener('pointercancel', release);
                me.addEventListener('pointerleave', () => { tilt.x = tilt.y = 0; kick(); });
                me.addEventListener('keydown', e => {
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault(); vx = 9; vr = 10; kick(); confetti(12); say(lines[line++ % lines.length]);
                    if (window.__wave) window.__wave();
                });
            })();

            /* ── Desktop toys: flingable stickers, cursor spotlight, tilting cards ── */
            (function () {
                if (!toys) return;
                const layer = $('#hero-stk'), els = $$('.stk', layer), navH = 76;
                let W = 0, H = 0, st = [], raf = 0, drag = null, z = 10;
                const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
                const draw = s => { s.el.style.transform = 'translate(' + s.x.toFixed(1) + 'px,' + s.y.toFixed(1) + 'px) rotate(' + s.r.toFixed(1) + 'deg)'; };
                function place() {
                    W = hero.clientWidth; H = hero.clientHeight;
                    const hr = hero.getBoundingClientRect(), pr = $('#me').getBoundingClientRect();
                    const ox = pr.left - hr.left, oy = pr.top - hr.top, pw = pr.width, ph = pr.height;
                    // Stuck around the polaroid, ready to be peeled off
                    const spots = [[-0.6, 0.06, -12], [1.04, 0.16, 9], [-0.64, 0.6, 7], [1.0, 0.7, -8], [0.62, -0.17, -5]];
                    st = els.map((el, i) => {
                        const w = el.offsetWidth, h = el.offsetHeight, p = spots[i];
                        return { el, w, h, x: clamp(ox + p[0] * pw, 8, W - w - 8), y: clamp(oy + p[1] * ph, navH, H - h - 8), vx: 0, vy: 0, r: p[2], vr: 0, base: p[2] };
                    });
                    st.forEach(draw);
                }
                function tick() {
                    let moving = false;
                    st.forEach(s => {
                        if (s === drag) return;
                        s.vx *= 0.955; s.vy *= 0.955; s.vr *= 0.92;
                        s.x += s.vx; s.y += s.vy; s.r += s.vr;
                        if (s.x < 0) { s.x = 0; s.vx = -s.vx * 0.6; s.vr += s.vy * .3; }
                        if (s.x > W - s.w) { s.x = W - s.w; s.vx = -s.vx * 0.6; s.vr -= s.vy * .3; }
                        if (s.y < navH) { s.y = navH; s.vy = -s.vy * 0.6; s.vr -= s.vx * .3; }
                        if (s.y > H - s.h) { s.y = H - s.h; s.vy = -s.vy * 0.6; s.vr += s.vx * .3; }
                        if (Math.abs(s.vx) + Math.abs(s.vy) + Math.abs(s.vr) > 0.05) moving = true;
                        draw(s);
                    });
                    if (drag) { draw(drag); moving = true; }
                    raf = moving ? requestAnimationFrame(tick) : 0;
                }
                const go = () => { if (!raf) raf = requestAnimationFrame(tick); };
                st = [];
                els.forEach((el, i) => {
                    el.addEventListener('pointerdown', e => {
                        const s = st[i]; if (!s) return;
                        const hr = hero.getBoundingClientRect();
                        drag = s; s.offX = e.clientX - hr.left - s.x; s.offY = e.clientY - hr.top - s.y;
                        s.vx = s.vy = 0; el.style.zIndex = ++z; el.classList.add('grab');
                        el.setPointerCapture(e.pointerId); go();
                    });
                    el.addEventListener('pointermove', e => {
                        const s = st[i]; if (drag !== s) return;
                        const hr = hero.getBoundingClientRect();
                        const nx = clamp(e.clientX - hr.left - s.offX, 0, W - s.w), ny = clamp(e.clientY - hr.top - s.offY, navH, H - s.h);
                        s.vx = s.vx * .5 + (nx - s.x) * .5; s.vy = s.vy * .5 + (ny - s.y) * .5;
                        s.x = nx; s.y = ny; s.r = s.base + clamp(s.vx * 2, -28, 28);
                    });
                    const up = () => {
                        const s = st[i]; if (drag !== s) return;
                        drag = null; el.classList.remove('grab');
                        s.vx = clamp(s.vx, -45, 45); s.vy = clamp(s.vy, -45, 45); s.vr = s.vx * .6; s.base = s.r; go();
                    };
                    el.addEventListener('pointerup', up);
                    el.addEventListener('pointercancel', up);
                });
                function init() {
                    place();
                    els.forEach((el, i) => setTimeout(() => el.classList.add('on'), 500 + i * 140));
                }
                if (document.readyState === 'complete') init(); else window.addEventListener('load', init);
                window.addEventListener('resize', () => { if (innerWidth > 960) place(); });

                hero.addEventListener('pointermove', e => {
                    if (e.pointerType !== 'mouse') return;
                    const r = hero.getBoundingClientRect();
                    hero.style.setProperty('--hx', (e.clientX - r.left) + 'px');
                    hero.style.setProperty('--hy', (e.clientY - r.top) + 'px');
                    hero.classList.add('lit');
                });
                hero.addEventListener('pointerleave', () => hero.classList.remove('lit'));

                $$('.hcard', hero).forEach(c => {
                    c.addEventListener('pointermove', e => {
                        const r = c.getBoundingClientRect();
                        const ry = ((e.clientX - r.left) / r.width - .5) * 14, rx = -((e.clientY - r.top) / r.height - .5) * 14;
                        c.style.transform = 'perspective(600px) rotateX(' + rx.toFixed(1) + 'deg) rotateY(' + ry.toFixed(1) + 'deg) translateY(-3px)';
                    });
                    c.addEventListener('pointerleave', () => { c.style.transform = ''; });
                });
            })();

            /* ── About: Student, Author, Coder, Blogger light up as you scroll ── */
            const about = $('#about'), words = $$('#about-hl .sw'), dots = $$('.about-dots i');
            function onScrollAbout() {
                if (isBot) return;
                const r = about.getBoundingClientRect();
                const p = (innerHeight * .55 - r.top) / Math.max(1, r.height - innerHeight * .35);
                const idx = Math.max(0, Math.min(words.length - 1, Math.floor(p * words.length)));
                words.forEach((w, i) => w.classList.toggle('on', i === idx));
                dots.forEach((d, i) => d.classList.toggle('on', i === idx));
            }

            /* ── Collapsible lists (history, books) ────────────── */
            function collapsible(btn, getTarget, labelEl, openText, closedText, onToggle) {
                if (!btn) return;
                btn.addEventListener('click', () => {
                    const open = btn.getAttribute('aria-expanded') !== 'true';
                    btn.setAttribute('aria-expanded', open);
                    getTarget().classList.toggle(onToggle, open);
                    labelEl.textContent = open ? openText : closedText;
                    if (open) { const first = getTarget().querySelector('.log-extra, .bk'); if (first) first.querySelectorAll('.rev').forEach(r => r.classList.add('in')); }
                    if (!open) btn.scrollIntoView({ block: 'center', behavior: calm() ? 'instant' : 'smooth' });
                    drawRoad();
                });
            }
            const extra = $$('.log-extra').length;
            const logLabel = $('#log-more-label');
            logLabel.textContent = 'View Full History (+' + extra + ' months)';
            collapsible($('#log-more-btn'), () => $('#log'), logLabel, 'Show Less', 'View Full History (+' + extra + ' months)', 'all');
            collapsible($('#bk-more-btn'), () => $('#bk-more'), $('#bk-more-label'), 'Show Fewer Books', 'View More Books (+2)', 'open');

            /* ── Projects: vertical scroll moves the row sideways ── */
            const hs = $('#projects'), pin = $('.hs-pin', hs), track = $('#hs-track'), cards = $$('.pc', track);
            const hsN = $('#hs-n'), hsBar = $('#hs-bar'), hsHint = $('#hs-hint');
            $('#hs-t').textContent = String(cards.length).padStart(2, '0');
            let pinned = false, dist = 0, curX = 0, tgtX = 0, hsRaf = 0, visCards = cards;
            function layoutHS() {
                const want = !calm() && innerWidth >= 700 && innerHeight >= 620;
                pinned = want;
                hs.classList.toggle('pinned', want);
                if (!want) { hs.style.height = ''; track.style.transform = ''; curX = tgtX = 0; hsHint.textContent = fine ? 'Scroll sideways' : 'Swipe'; return; }
                hsHint.textContent = 'Scroll';
                dist = Math.max(0, track.scrollWidth - innerWidth);
                hs.style.height = (innerHeight + dist) + 'px';
                onScrollHS();
            }
            function setProgress(p) {
                hsBar.style.transform = 'scaleX(' + Math.max(.06, p) + ')';
                const n = Math.min(visCards.length, Math.max(1, Math.round(p * (visCards.length - 1)) + 1));
                hsN.textContent = String(n).padStart(2, '0');
            }
            function renderHS() {
                hsRaf = 0;
                curX += (tgtX - curX) * .14;
                if (Math.abs(tgtX - curX) < .3) curX = tgtX; else hsRaf = requestAnimationFrame(renderHS);
                track.style.transform = 'translate3d(' + (-curX).toFixed(1) + 'px,0,0)';
                setProgress(dist ? curX / dist : 0);
            }
            function onScrollHS(snap) {
                if (!pinned) return;
                tgtX = Math.max(0, Math.min(dist, -hs.getBoundingClientRect().top));
                if (snap === true) curX = tgtX;
                if (!hsRaf) hsRaf = requestAnimationFrame(renderHS);
            }
            const chips = $$('.hs-chip');
            chips.forEach(ch => {
                const f = ch.dataset.f;
                $('b', ch).textContent = f === 'all' ? cards.length : cards.filter(c => c.querySelector('.' + f)).length;
                ch.addEventListener('click', () => {
                    chips.forEach(o => o.setAttribute('aria-pressed', o === ch));
                    visCards = cards.filter(c => f === 'all' || c.querySelector('.' + f));
                    cards.forEach(c => {
                        const show = visCards.includes(c);
                        c.classList.toggle('out', !show);
                        c.classList.remove('in-f');
                        if (show && !calm()) { void c.offsetWidth; c.classList.add('in-f'); }
                    });
                    $('#hs-t').textContent = String(visCards.length).padStart(2, '0');
                    layoutHS();
                    if (pinned && scrollY > hs.offsetTop) window.scrollTo({ top: hs.offsetTop, behavior: 'instant' });
                    if (!pinned) track.scrollTo({ left: 0 });
                    onScrollHS(true); setProgress(0);
                });
            });
            track.addEventListener('scroll', () => {
                if (pinned) return;
                const max = track.scrollWidth - track.clientWidth;
                setProgress(max > 0 ? track.scrollLeft / max : 0);
            }, { passive: true });
            // Keyboard users: tabbing into an off-screen card scrolls the page to it
            track.addEventListener('focusin', e => {
                if (!pinned) return;
                const card = e.target.closest('.pc'); if (!card) return;
                const offset = card.offsetLeft - (innerWidth - card.offsetWidth) / 2;
                const x = Math.max(0, Math.min(dist, offset));
                pin.scrollLeft = 0;
                window.scrollTo({ top: hs.offsetTop + x, behavior: 'instant' });
                onScrollHS(true);
            });

            /* ── Books: draw the winding road between covers ───── */
            const road = $('#bk-road'), path = $('#bk-path');
            let roadLen = 0;
            function drawRoad() {
                if (!road) return;
                const pr = path.getBoundingClientRect();
                const pts = $$('.bk', path).filter(b => b.offsetParent !== null).map(b => {
                    const c = $('.bk-cover', b).getBoundingClientRect();
                    return [c.left - pr.left + c.width / 2, c.top - pr.top + c.height / 2];
                });
                if (pts.length < 2) return;
                let d = 'M' + pts[0][0] + ' ' + pts[0][1];
                for (let i = 1; i < pts.length; i++) {
                    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], my = (y0 + y1) / 2;
                    d += ' C' + x0 + ' ' + my + ',' + x1 + ' ' + my + ',' + x1 + ' ' + y1;
                }
                road.setAttribute('viewBox', '0 0 ' + pr.width + ' ' + pr.height);
                $$('path', road).forEach(p => p.setAttribute('d', d));
                const fill = $('.road-fill', road);
                roadLen = fill.getTotalLength();
                fill.style.strokeDasharray = roadLen;
                onScrollRoad();
            }
            let roadCur = null, roadTgt = 0, roadRaf = 0;
            function renderRoad() {
                roadRaf = 0;
                roadCur += (roadTgt - roadCur) * .1;
                if (Math.abs(roadTgt - roadCur) < .5) roadCur = roadTgt; else roadRaf = requestAnimationFrame(renderRoad);
                $('.road-fill', road).style.strokeDashoffset = roadCur;
            }
            function onScrollRoad() {
                if (!roadLen) return;
                if (calm()) { $('.road-fill', road).style.strokeDashoffset = 0; return; }
                const r = path.getBoundingClientRect();
                const p = Math.max(0, Math.min(1, (innerHeight * .7 - r.top) / r.height));
                roadTgt = roadLen * (1 - p);
                if (roadCur === null) roadCur = roadTgt;
                if (!roadRaf) roadRaf = requestAnimationFrame(renderRoad);
            }

            /* ── Which book? picker (tabs) ─────────────────────── */
            (function () {
                const tabs = $$('.pick-opt'), panels = $$('.pick-panel');
                function select(i, focus) {
                    tabs.forEach((t, j) => { t.setAttribute('aria-selected', j === i); t.tabIndex = j === i ? 0 : -1; });
                    panels.forEach((p, j) => { p.classList.toggle('off', j !== i); p.classList.toggle('show', j === i); });
                    if (focus) tabs[i].focus();
                }
                tabs.forEach((t, i) => {
                    t.addEventListener('click', () => select(i));
                    t.addEventListener('keydown', e => {
                        const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
                        if (k) { e.preventDefault(); select((i + k + tabs.length) % tabs.length, true); }
                        if (e.key === 'Home') { e.preventDefault(); select(0, true); }
                        if (e.key === 'End') { e.preventDefault(); select(tabs.length - 1, true); }
                    });
                });
                if (!isBot) select(0);
            })();

            /* ── Copy email ────────────────────────────────────── */
            const copyBtn = $('#copy-email');
            copyBtn.addEventListener('click', () => {
                const done = () => { copyBtn.classList.add('done'); setTimeout(() => copyBtn.classList.remove('done'), 1800); };
                if (navigator.clipboard) navigator.clipboard.writeText('tapariapurv+portfolio@gmail.com').then(done, () => location.href = 'mailto:tapariapurv+portfolio@gmail.com');
                else location.href = 'mailto:tapariapurv+portfolio@gmail.com';
            });

            /* ── One scroll loop, one resize handler ───────────── */
            let ticking = false;
            function onScroll() {
                if (ticking) return; ticking = true;
                requestAnimationFrame(() => { ticking = false; onScrollBasic(); onScrollAbout(); onScrollHS(); onScrollRoad(); });
            }
            window.addEventListener('scroll', onScroll, { passive: true });
            let rz;
            window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { layoutHS(); drawRoad(); onScroll(); }, 120); });
            rm.addEventListener && rm.addEventListener('change', () => location.reload());
            layoutHS(); onScrollBasic(); onScrollAbout();
            window.addEventListener('load', () => { layoutHS(); drawRoad(); onScroll(); });
            if (document.fonts) document.fonts.ready.then(() => { layoutHS(); drawRoad(); });
        })();
    
