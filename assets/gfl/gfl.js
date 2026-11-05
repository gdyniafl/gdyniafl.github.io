/* =====================================================================
   GFL – wspólne funkcje (nie trzeba edytować)
   ===================================================================== */
const GFL = (() => {
    const C = GFL_CONFIG;
    const LEAGUES = ['elite', 'challenge', 'aspire'];
    const LEAGUE_NAMES = { elite: 'ELITE', challenge: 'CHALLENGE', aspire: 'ASPIRE', aggressive: 'AGGRESSIVE' };

    /* Czy bieżący sezon już wystartował */
    const isLive = () => new Date() >= new Date(C.SEASON_START + 'T00:00:00');

    /* Sezony do wyboru (przed startem ukrywamy sezon "live") */
    const seasons = () => C.SEASONS.filter(s => !s.live || isLive());

    /* Sezon wybrany w adresie (?sezon=II) albo najnowszy dostępny */
    function selectedSeason() {
        const id = new URLSearchParams(location.search).get('sezon');
        const list = seasons();
        return list.find(s => s.id === id) || list[0];
    }

    /* Bezpieczny parser CSV (cudzysłowy, przecinki w nazwach, CRLF, średniki z Excela) */
    function parseCSV(text) {
        text = text.replace(/^\uFEFF/, '');
        const first = text.split(/\r?\n/)[0];
        const sep = (first.split(';').length > first.split(',').length) ? ';' : ',';
        const rows = []; let row = [], col = '', q = false;
        for (let i = 0; i < text.length; i++) {
            const c = text[i], n = text[i + 1];
            if (q) {
                if (c === '"' && n === '"') { col += '"'; i++; }
                else if (c === '"') q = false;
                else col += c;
            } else if (c === '"') q = true;
            else if (c === sep) { row.push(col.trim()); col = ''; }
            else if (c === '\n' || c === '\r') {
                if (c === '\r' && n === '\n') i++;
                row.push(col.trim()); rows.push(row); row = []; col = '';
            } else col += c;
        }
        if (col !== '' || row.length) { row.push(col.trim()); rows.push(row); }
        return rows.filter(r => r.some(v => v !== ''));
    }

    /* Ochrona przed znakami specjalnymi w nazwach */
    const esc = s => String(s ?? '').replace(/[&<>"']/g, ch =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

    const norm = name => {
        const n = String(name || '').trim().toUpperCase();
        return C.TEAM_ALIASES[n] || n;
    };
    const logo = name => C.TEAM_LOGOS[norm(name)] || C.TEAM_LOGOS[String(name).trim()] || C.DEFAULT_LOGO;

    async function fetchText(url) {
        const r = await fetch(url, { cache: 'no-cache' });
        if (!r.ok) throw new Error(r.status + ' ' + url);
        const t = await r.text();
        if (/^\s*<(!doctype|html)/i.test(t)) throw new Error('To nie jest CSV: ' + url);
        return t;
    }

    /* Archiwum sezonów 0 i I (assets/gfl/archiwum.js) – ładowane tylko gdy potrzebne */
    let archivePromise = null;
    function loadArchive() {
        if (typeof GFL_ARCHIVE !== 'undefined') return Promise.resolve();
        return archivePromise || (archivePromise = new Promise((ok, fail) => {
            const s = document.createElement('script');
            s.src = 'assets/gfl/archiwum.js';
            s.onload = ok; s.onerror = () => fail(new Error('Brak assets/gfl/archiwum.js'));
            document.head.appendChild(s);
        }));
    }

    /* Pobiera dane: kind = 'mecze' | 'tabela' | 'druzyny' | 'strzelcy' */
    async function load(season, league, kind) {
        /* Sezony archiwalne zapisane w archiwum.js (tylko tabela końcowa) */
        if (season.static) {
            await loadArchive();
            const t = ((GFL_ARCHIVE[season.static] || {})[league]);
            if (kind !== 'tabela' || !t) throw new Error('Brak danych: sezon ' + season.id + ' / ' + kind);
            const v = x => (x === null || x === undefined) ? '' : String(x);
            return [['#', 'DRUŻYNA', 'M', 'W', 'P', 'R', 'GZ', 'GS', 'BIL', 'PKT', 'WYC']]
                .concat(t.map((r, i) => [i + 1, r[0], r[1], r[2], r[3], r[4], v(r[5]), v(r[6]),
                    (r[8] !== undefined && r[8] !== null ? r[8] : r[5] - r[6]), r[7],
                    r[9] === 'wycofana' ? '1' : ''].map(v)));
        }
        const liveUrl = kind === 'strzelcy' ? C.LIVE.strzelcy : C.LIVE[league][kind];
        if (season.live) return parseCSV(await fetchText(liveUrl));
        /* Archiwum w zakładkach Arkuszy Google (np. "MECZE SEZON II") */
        if (season.sheets) {
            const url = kind === 'strzelcy' ? season.sheets.strzelcy : (season.sheets[league] || {})[kind];
            if (!url) throw new Error('Brak linku w config.js: sezon ' + season.id + ' / ' + league + ' / ' + kind);
            return parseCSV(await fetchText(url));
        }
        throw new Error('Nieznany typ sezonu ' + season.id);
    }

    /* Ligi dostępne w danym sezonie (Aggressive tylko tam, gdzie jest w archiwum) */
    async function leaguesFor(season) {
        if (!season.static) return LEAGUES;
        await loadArchive();
        return Object.keys(GFL_ARCHIVE[season.static] || {});
    }

    /* Tabela ligi -> [{pos,name,m,w,r,p,gz,gs,bil,pkt}]  (gz/gs = null, gdy znany tylko bilans)
       kolumny: 0 #, 1 drużyna, 2 M, 3 W, 4 P, 5 R, 6 GZ, 7 GS, 9 PKT */
    function tableStats(rows) {
        const n = v => parseInt(v) || 0;
        return rows.slice(1).filter(c => c.length >= 10 && c[1]).map(c => ({
            pos: n(c[0]) || null, name: norm(c[1]), m: n(c[2]), w: n(c[3]), p: n(c[4]), r: n(c[5]),
            gz: c[6] === '' ? null : n(c[6]), gs: c[7] === '' ? null : n(c[7]),
            bil: c[6] === '' ? n(c[8]) : n(c[6]) - n(c[7]), pkt: n(c[9]),
            withdrawn: c[10] === '1'
        }));
    }

    /* Statystyki drużyn wyliczone z meczów: {NAZWA: {m,w,r,p,gz,gs,pkt,cs,forma[]}} */
    function teamStatsFromMatches(rows) {
        const t = {};
        const get = n => t[n] || (t[n] = { name: n, m: 0, w: 0, r: 0, p: 0, gz: 0, gs: 0, pkt: 0, cs: 0, forma: [] });
        rows.slice(1)
            .filter(c => c.length >= 4 && c[0] && c[1])
            .sort((a, b) => (parseInt(a[5]) || 0) - (parseInt(b[5]) || 0))
            .forEach(c => {
                const A = get(norm(c[0])), B = get(norm(c[1]));
                const sh = parseInt(c[2]), sa = parseInt(c[3]);
                if (isNaN(sh) || isNaN(sa)) return;
                const add = (T, f, a) => {
                    T.m++; T.gz += f; T.gs += a;
                    if (a === 0) T.cs++;
                    if (f > a) { T.w++; T.pkt += 3; T.forma.push('Z'); }
                    else if (f < a) { T.p++; T.forma.push('P'); }
                    else { T.r++; T.pkt += 1; T.forma.push('R'); }
                };
                add(A, sh, sa); add(B, sa, sh);
            });
        return t;
    }

    /* Przyciski wyboru sezonu */
    function renderSeasonSwitch(el, current) {
        if (!el) return;
        const list = seasons();
        if (list.length < 2) { el.style.display = 'none'; return; }
        el.innerHTML = list.map(s => {
            const p = new URLSearchParams(location.search);
            p.set('sezon', s.id);
            return `<a class="season-btn${s === current ? ' active' : ''}" href="?${p}">${esc(s.label)}</a>`;
        }).join('');
    }

    /* Link "Historia ligi" dodawany automatycznie do menu i stopki na każdej stronie */
    (function addHistoryLinks() {
        const menu = document.querySelector('.navbar .dropdown-menu');
        if (menu && !menu.querySelector('a[href="historia.html"]')) {
            menu.insertAdjacentHTML('beforeend', '<li><hr class="dropdown-divider" style="border-color:#333;"></li><li><a class="dropdown-item" href="historia.html">Historia ligi</a></li>');
        }
        const foot = document.querySelector('.footer-links');
        if (foot && !foot.querySelector('a[href="historia.html"]')) {
            const reg = foot.querySelector('a[href="regulamin.html"]');
            const li = '<li><a href="historia.html">Historia ligi</a></li>';
            reg ? reg.parentElement.insertAdjacentHTML('beforebegin', li) : foot.insertAdjacentHTML('beforeend', li);
        }
    })();

    return { C, LEAGUES, LEAGUE_NAMES, isLive, seasons, selectedSeason, parseCSV, esc, norm, logo, load, fetchText, leaguesFor, loadArchive, tableStats, teamStatsFromMatches, renderSeasonSwitch };
})();
