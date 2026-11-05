/* =====================================================================
   GFL – wspólne funkcje (nie trzeba edytować)
   ===================================================================== */
const GFL = (() => {
    const C = GFL_CONFIG;
    const LEAGUES = ['elite', 'challenge', 'aspire'];
    const LEAGUE_NAMES = { elite: 'ELITE', challenge: 'CHALLENGE', aspire: 'ASPIRE' };

    /* Czy bieżący sezon już wystartował */
    const isLive = () => new Date() >= new Date(C.SEASON_START + 'T00:00:00');

    /* Sezony do wyboru (przed startem ukrywamy sezon "live", bo arkusze mają jeszcze stare dane) */
    const seasons = () => C.SEASONS.filter(s => !s.live || isLive());

    /* Sezon wybrany w adresie (?sezon=II) albo najnowszy dostępny */
    function selectedSeason() {
        const id = new URLSearchParams(location.search).get('sezon');
        const list = seasons();
        return list.find(s => s.id === id) || list[0];
    }

    /* Bezpieczny parser CSV (cudzysłowy, przecinki w nazwach, CRLF) */
    function parseCSV(text) {
        text = text.replace(/^\uFEFF/, '');
        /* Excel w polskiej wersji zapisuje CSV ze średnikami – wykrywamy separator */
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

    /* Ochrona przed znakami specjalnymi w nazwach (apostrofy, < > itp.) */
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

    /* Pobiera dane: kind = 'mecze' | 'tabela' | 'druzyny' | 'strzelcy' */
    async function load(season, league, kind) {
        const liveUrl = kind === 'strzelcy' ? C.LIVE.strzelcy : C.LIVE[league][kind];
        if (season.live) return parseCSV(await fetchText(liveUrl));
        const file = season.archive + (kind === 'strzelcy' ? 'strzelcy.csv' : `${league}_${kind}.csv`);
        try {
            return parseCSV(await fetchText(file));
        } catch (e) {
            /* Brak pliku w archiwum: jeśli to ostatni sezon przed startem nowego,
               arkusze wciąż zawierają jego dane – pobieramy z nich */
            if (!isLive() && seasons()[0] === season) return parseCSV(await fetchText(liveUrl));
            throw e;
        }
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

    return { C, LEAGUES, LEAGUE_NAMES, isLive, seasons, selectedSeason, parseCSV, esc, norm, logo, load, fetchText, teamStatsFromMatches, renderSeasonSwitch };
})();
