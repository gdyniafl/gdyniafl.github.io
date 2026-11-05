/* Strona HISTORIA LIGI: mistrzowie, królowie strzelców, rekordy, tabela wszech czasów.
   Dane: archiwum.js (sezony 0, I + GFL_HONOURS) oraz zakładki "SEZON II" z arkuszy.
   Sezon w trakcie (live) nie jest wliczany – tylko zakończone sezony. */
(async () => {
    const esc = GFL.esc;
    const $ = id => document.getElementById(id);
    const LN = GFL.LEAGUE_NAMES;
    const sign = v => (v > 0 ? '+' : '') + v;

    await GFL.loadArchive();
    const seasons = GFL.C.SEASONS.filter(s => !s.live);
    const seasonLabel = id => (GFL.C.SEASONS.find(s => s.id === id) || {}).label || 'SEZON ' + id;

    /* --- 1. wszystkie tabele końcowe --- */
    const rows = [];
    await Promise.all(seasons.map(async s => {
        for (const lg of await GFL.leaguesFor(s)) {
            try {
                GFL.tableStats(await GFL.load(s, lg, 'tabela')).forEach(t =>
                    rows.push({ ...t, season: s.id, seasonLabel: s.label, league: lg }));
            } catch (e) { console.warn('Brak tabeli', s.id, lg, e); }
        }
    }));
    const played = rows.filter(r => !r.withdrawn && r.m > 0);

    /* --- 2. MISTRZOWIE --- */
    const honours = typeof GFL_HONOURS !== 'undefined' ? GFL_HONOURS : [];
    const champ = (sid, lg) => {
        const h = honours.find(x => x.season === sid);
        if (h && h.champions[lg]) return h.champions[lg];
        const first = played.find(r => r.season === sid && r.league === lg && r.pos === 1);
        return first ? first.name : null;
    };
    const titles = {};
    $('champions').innerHTML = seasons.map(s => {
        const lgs = [...new Set(rows.filter(r => r.season === s.id).map(r => r.league))]
            .sort((a, b) => Object.keys(LN).indexOf(a) - Object.keys(LN).indexOf(b));
        const lgList = lgs.length ? lgs : Object.keys((honours.find(h => h.season === s.id) || { champions: {} }).champions);
        return `<div class="season-block">
            <h3 class="season-head">${esc(s.label)}</h3>
            <div class="row g-3 justify-content-center">
            ${lgList.map(lg => {
                const n = champ(s.id, lg);
                if (!n) return '';
                const key = GFL.norm(n);
                titles[key] = (titles[key] || 0) + 1;
                return `<div class="col-6 col-md-3"><div class="champ-card${lg === 'elite' ? ' gold' : ''}">
                    <img src="${esc(GFL.logo(n))}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
                    <div class="champ-league">${LN[lg]} LEAGUE</div>
                    <div class="champ-name">${esc(n)}</div>🏆</div></div>`;
            }).join('')}
            </div></div>`;
    }).join('');

    /* --- 3. KRÓLOWIE STRZELCÓW --- */
    const kings = honours.flatMap(h => h.kings.map(k => ({ ...k, season: h.season })));
    $('kings').innerHTML = kings.length ? `<div class="table-wrap"><table class="h-table">
        <thead><tr><th>Sezon</th><th>Liga</th><th class="l">Zawodnik</th><th class="l">Drużyna</th><th>Gole</th></tr></thead>
        <tbody>${kings.map(k => `<tr><td>${esc(seasonLabel(k.season))}</td><td>${LN[k.league]}</td>
            <td class="l b">${esc(k.name)}</td><td class="l muted">${esc(k.team)}</td><td class="gold-txt">${k.goals} ⚽</td></tr>`).join('')}
        </tbody></table></div>` : '<p class="muted text-center">Brak danych.</p>';

    /* --- 4. REKORDY --- */
    const best = (list, f, dir = 1) => list.reduce((a, r) => (a === null || dir * (f(r) - f(a)) > 0) ? r : a, null);
    const full = played.filter(r => r.gz !== null);
    const where = r => `${esc(r.seasonLabel)} • ${LN[r.league]}`;
    const recs = [];
    const add = (label, r, val, sub) => r && recs.push({ label, name: r.name, val, sub: sub || where(r) });
    let r;
    r = best(played, x => x.pkt);        add('Najwięcej punktów w sezonie', r, r && r.pkt + ' pkt');
    r = best(full, x => x.gz);           add('Najwięcej bramek w sezonie', r, r && r.gz + ' goli');
    r = best(played, x => x.bil);        add('Najlepszy bilans bramek', r, r && sign(r.bil));
    /* pomijamy drużyny z walkowerami 0:0 (np. same porażki bez bramek) */
    const real = full.filter(x => x.m >= 10 && x.gz + x.gs >= x.m && x.w + x.r + x.p >= x.m - 2);
    r = best(real, x => x.gs, -1);       add('Najszczelniejsza obrona', r, r && r.gs + ' straconych');
    const perfect = played.filter(x => x.m >= 10 && x.w === x.m);
    if (!perfect.length) { r = best(played.filter(x => x.m >= 10), x => x.w / x.m); add('Najwyższy % zwycięstw', r, r && Math.round(100 * r.w / r.m) + '% (' + r.w + '/' + r.m + ')'); }
    if (perfect.length) recs.push({ label: 'Sezon bez straty punktu', name: perfect.map(x => x.name).join(', '), val: '100%', sub: perfect.map(where).join(' / ') });
    const k = best(kings, x => x.goals);
    if (k) recs.push({ label: 'Najwięcej goli zawodnika w sezonie', name: k.name, val: k.goals + ' goli', sub: `${esc(seasonLabel(k.season))} • ${LN[k.league]} • ${esc(k.team)}` });
    const kingCount = {}; kings.forEach(x => kingCount[x.name] = (kingCount[x.name] || 0) + 1);
    const multi = Object.entries(kingCount).filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1]);
    if (multi.length) recs.push({ label: 'Wielokrotni królowie strzelców', name: multi.map(([n]) => n).join(', '), val: multi[0][1] + '×', sub: 'korona w ' + multi[0][1] + ' sezonach' });
    const tMax = Object.entries(titles).sort((a, b) => b[1] - a[1]);
    if (tMax.length && tMax[0][1] > 1) {
        const top = tMax.filter(([, c]) => c === tMax[0][1]).map(([n]) => n);
        recs.push({ label: 'Najwięcej tytułów mistrza', name: top.join(', '), val: tMax[0][1] + ' 🏆', sub: 'wszystkie ligi' });
    }
    $('records').innerHTML = recs.map(x => `<div class="col-md-6 col-lg-4"><div class="rec-card">
        <div class="rec-label">${x.label}</div><div class="rec-val">${x.val}</div>
        <div class="rec-name">${esc(x.name)}</div><div class="rec-sub">${x.sub}</div></div></div>`).join('');

    /* --- 5. TABELA WSZECH CZASÓW --- */
    const at = {};
    played.forEach(x => {
        const t = at[x.name] || (at[x.name] = { name: x.name, seasons: new Set(), m: 0, w: 0, r: 0, p: 0, gz: 0, gs: 0, bil: 0, pkt: 0, partial: false });
        t.seasons.add(x.season);
        ['m', 'w', 'r', 'p', 'pkt', 'bil'].forEach(k => t[k] += x[k]);
        if (x.gz === null) t.partial = true; else { t.gz += x.gz; t.gs += x.gs; }
    });
    const list = Object.values(at).sort((a, b) => b.pkt - a.pkt || b.bil - a.bil || b.w - a.w);
    $('alltime').innerHTML = list.map((t, i) => `<tr${i < 3 ? ' class="top' + (i + 1) + '"' : ''}>
        <td class="pos">${i + 1}</td>
        <td class="l b team"><img src="${esc(GFL.logo(t.name))}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">${esc(t.name)}${titles[t.name] ? ' <span title="Tytuły mistrza">' + '🏆'.repeat(titles[t.name]) + '</span>' : ''}</td>
        <td>${t.seasons.size}</td><td>${t.m}</td><td>${t.w}</td><td>${t.r}</td><td>${t.p}</td>
        <td class="hide-sm">${t.gz}:${t.gs}${t.partial ? '*' : ''}</td><td>${sign(t.bil)}</td><td class="gold-txt b">${t.pkt}</td></tr>`).join('');
    $('alltime-note').textContent = `${list.length} drużyn • ${seasons.length} zakończone sezony. ` +
        '* – w Aggressive League (sezon 0) zachował się tylko bilans bramek, więc bramki są niepełne (bilans jest kompletny). ' +
        'Drużyny wycofane w trakcie sezonu nie są wliczane.';
    $('loading').style.display = 'none';
})().catch(e => {
    console.error(e);
    document.getElementById('loading').textContent = 'Błąd ładowania danych historycznych.';
});
