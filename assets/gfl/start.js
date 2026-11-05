/* =====================================================================
   GFL – dodatki strony głównej
   1) Wideo w tle sekcji powitalnej (assets/video/hero.mp4)
   2) Hall of Fame budowany automatycznie z GFL_HONOURS (assets/gfl/archiwum.js)
   3) Odliczanie do startu sezonu (SEASON_START z config.js)
   Wymaga: config.js, gfl.js i archiwum.js załadowanych wcześniej.
   ===================================================================== */
(() => {
    const esc = GFL.esc;
    const LN = GFL.LEAGUE_NAMES;

    /* ---------- 1. WIDEO W TLE ---------- */
    const HERO_VIDEO = {
        mp4:    'assets/video/hero.mp4',          // nagranie z drona (bez dźwięku)
        poster: 'assets/video/hero-poster.jpg',   // kadr z filmu – tło zanim wideo się wczyta
        darken: 0.55                              // przyciemnienie 0–1 (żeby napis był czytelny)
    };
    (function heroVideo() {
        const hero = document.querySelector('.hero-section');
        if (!hero) { console.warn('[GFL] brak .hero-section'); return; }

        // kadr z filmu jako tło (zastępuje brakujący background-gfl.jpg)
        hero.style.backgroundImage = `linear-gradient(rgba(0,0,0,.7), rgba(0,0,0,.7)), url('${HERO_VIDEO.poster}')`;
        hero.style.backgroundSize = 'cover';
        hero.style.backgroundPosition = 'center';

        // tryb oszczędzania danych – zostaje sam kadr
        if (navigator.connection && navigator.connection.saveData) { console.info('[GFL] saveData – bez wideo'); return; }
        console.info('[GFL] wideo w tle:', HERO_VIDEO.mp4);

        hero.style.position = 'relative';
        hero.style.overflow = 'hidden';
        hero.insertAdjacentHTML('afterbegin', `
            <video class="hero-bg-video" autoplay muted loop playsinline preload="auto"
                   poster="${HERO_VIDEO.poster}" aria-hidden="true"
                   style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;opacity:0;transition:opacity 1s;">
                <source src="${HERO_VIDEO.mp4}" type="video/mp4">
            </video>
            <div class="hero-bg-shade" style="position:absolute;inset:0;z-index:1;pointer-events:none;
                        background:linear-gradient(rgba(0,0,0,${HERO_VIDEO.darken}), rgba(0,0,0,${Math.min(1, HERO_VIDEO.darken + 0.25)}));"></div>`);
        [...hero.children].forEach(c => {
            if (!c.matches('.hero-bg-video, .hero-bg-shade')) { c.style.position = 'relative'; c.style.zIndex = 2; }
        });
        const v = hero.querySelector('.hero-bg-video');
        v.muted = true;   // wymagane do autoodtwarzania w Chrome/Safari
        v.addEventListener('canplay', () => { v.style.opacity = 1; v.play().catch(e => console.warn('[GFL] autoplay zablokowany', e)); }, { once: true });
        v.addEventListener('error', () => { console.warn('[GFL] nie można wczytać', HERO_VIDEO.mp4); v.remove(); }, true);
    })();

    function golWord(n) {
        const d = n % 10, dd = n % 100;
        if (n === 1) return 'GOL';
        return (d >= 2 && d <= 4 && !(dd >= 12 && dd <= 14)) ? 'GOLE' : 'GOLI';
    }

    /* ---------- 2. HALL OF FAME ---------- */
    (function buildHallOfFame() {
        if (typeof GFL_HONOURS === 'undefined' || !GFL_HONOURS.length) return;
        const box = document.querySelector('.hof-section .container');
        if (!box) return;
        const label = id => (GFL.C.SEASONS.find(s => s.id === id) || {}).label || 'SEZON ' + id;
        const order = ['elite', 'challenge', 'aspire', 'aggressive'];

        const tabs = GFL_HONOURS.map((h, i) =>
            `<button type="button" class="hof-tab-btn${i === 0 ? ' active' : ''}" data-hof="${esc(h.season)}">${esc(label(h.season))}</button>`).join('');

        const panels = GFL_HONOURS.map((h, i) => {
            const champs = order.filter(lg => h.champions[lg]);
            const col = champs.length > 3 ? 'col-6 col-md-3' : 'col-6 col-md-4';
            const champCards = champs.map(lg => `
                <div class="${col} mb-4"><div class="hof-card${lg === 'elite' ? ' gold' : ''}">
                    <div class="hof-label">MISTRZ ${LN[lg]}</div>
                    <div class="hof-name">${esc(h.champions[lg])}</div>🏆
                </div></div>`).join('');
            const kingCards = h.kings.map(k => `
                <div class="col-6 col-md-4 mb-4"><div class="hof-card">
                    <div class="hof-label">KRÓL ${LN[k.league]} (S${esc(h.season)})</div>
                    <div class="hof-name">${esc(k.name)}</div>
                    <div class="hof-label" style="margin-top:2px;">${esc(k.team)}</div>
                    <div class="hof-stat">${k.goals} ${golWord(k.goals)} ⚽</div>
                </div></div>`).join('');
            return `<div class="hof-tab-content${i === 0 ? ' active' : ''}" data-hof-panel="${esc(h.season)}">
                <div class="row justify-content-center">${champCards}${kingCards}</div></div>`;
        }).join('');

        box.innerHTML = `
            <h2 style="color: #C9A050; font-size: 3.5rem;">HALL OF FAME</h2>
            <div class="hof-tabs-nav">${tabs}</div>
            ${panels}
            <a href="historia.html" style="display:inline-block;margin-top:10px;color:#C9A050;font-family:'Bebas Neue';font-size:1.3rem;letter-spacing:1px;text-decoration:none;border:1px solid #C9A050;padding:8px 24px;border-radius:8px;">
                PEŁNA HISTORIA LIGI ↗
            </a>`;

        box.addEventListener('click', e => {
            const b = e.target.closest('.hof-tab-btn[data-hof]');
            if (!b) return;
            box.querySelectorAll('.hof-tab-btn').forEach(x => x.classList.toggle('active', x === b));
            box.querySelectorAll('.hof-tab-content').forEach(p => p.classList.toggle('active', p.dataset.hofPanel === b.dataset.hof));
        });
    })();

    /* ---------- 3. ODLICZANIE DO STARTU SEZONU ---------- */
    (function countdown() {
        if (GFL.isLive()) return;
        const target = document.querySelector('#off-season h2');
        if (!target) return;
        const start = new Date(GFL.C.SEASON_START + 'T00:00:00');

        target.insertAdjacentHTML('afterend',
            '<div id="gfl-countdown" style="display:flex;justify-content:center;gap:12px;margin:10px 0 25px;flex-wrap:wrap;"></div>');
        const el = document.getElementById('gfl-countdown');
        const cell = (v, l) => `<div style="background:#0f0f0f;border:1px solid #222;border-radius:10px;min-width:85px;padding:10px 6px;">
            <div style="font-family:'Bebas Neue';font-size:2.6rem;color:#44b1ff;line-height:1;">${v}</div>
            <div style="color:#666;font-size:.7rem;letter-spacing:1px;">${l}</div></div>`;

        function tick() {
            const ms = start - new Date();
            if (ms <= 0) { location.reload(); return; }
            const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60;
            el.innerHTML = cell(d, 'DNI') + cell(h, 'GODZIN') + cell(String(m).padStart(2, '0'), 'MINUT');
        }
        tick();
        setInterval(tick, 30000);
    })();
})();
