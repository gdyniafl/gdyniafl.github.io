/* Strona DRUŻYNY: profile z wyborem sezonu + historia drużyny ze wszystkich sezonów */
(() => {
    const esc = GFL.esc;
    const season = GFL.selectedSeason();
    const data = {};          // data[league][TEAM] = statystyki bieżącego sezonu
    let historyCache = null;  // dane ze wszystkich sezonów (ładowane przy pierwszym otwarciu "Historii")

    GFL.renderSeasonSwitch(document.getElementById('season-switch'), season);
    const sub = document.getElementById('season-subtitle');
    if (sub) sub.textContent = season.label + ' • KLIKNIJ, ABY ZOBACZYĆ STATYSTYKI';

    function parseScorers(raw) {
        if (!raw || raw === 'Brak bramek') return [];
        return raw.split(/,\s*/).map(s => s.match(/(.+)\((\d+)\)/)).filter(Boolean)
            .map(m => ({ name: m[1].trim(), goals: parseInt(m[2]) }));
    }

    async function loadLeague(league) {
        const box = document.getElementById(league + '-data');
        data[league] = {};
        let calc = {};
        try { calc = GFL.teamStatsFromMatches(await GFL.load(season, league, 'mecze')); } catch (e) { console.warn(e); }
        try {
            const rows = await GFL.load(season, league, 'druzyny');
            let html = '';
            rows.slice(1).filter(c => c.length >= 5 && c[0]).forEach(c => {
                const name = c[0];
                const m = calc[GFL.norm(name)] || {};
                const scorers = parseScorers(c[3]);
                const matches = m.m ?? (parseInt(c[1]) || 0);
                const gz = m.m ? m.gz : scorers.reduce((a, s) => a + s.goals, 0);
                data[league][name] = {
                    matches, gz, gs: m.gs, w: m.w, r: m.r, p: m.p, pkt: m.pkt,
                    cleanSheets: parseInt(c[2]) || m.cs || 0,
                    avg: matches ? (gz / matches).toFixed(2) : '0.00',
                    scorers,
                    forma: (c[4] || '').split(',').map(s => s.trim()).filter(f => ['Z', 'R', 'P'].includes(f))
                };
                html += `<button type="button" class="team-btn" style="background-image:url('${esc(GFL.logo(name))}')" data-league="${league}" data-team="${esc(name)}">${esc(name)}</button>`;
            });
            box.innerHTML = html || '<div class="text-center w-100 p-4">Brak drużyn w tym sezonie.</div>';
        } catch (e) {
            console.error(e);
            box.innerHTML = '<div class="text-center w-100 p-4" style="color:#666;">Brak danych dla tej ligi w wybranym sezonie.</div>';
        }
    }

    const box = (label, val, color) =>
        `<div class="col-6 col-md-3"><div class="stat-box-profile"><div class="stat-label-profile">${label}</div><div class="stat-value-profile"${color ? ` style="color:${color}"` : ''}>${val}</div></div></div>`;

    function seasonView(d) {
        const forma = d.forma.length
            ? d.forma.map(f => `<span class="form-badge f-${f}">${f}</span>`).join('')
            : '<span style="color:#666;font-size:.85rem;">Brak danych</span>';
        const hasMatches = d.gs !== undefined;
        let h = `<div class="row g-3 mb-2">
            ${box('Rozegrane', d.matches)}
            ${box('Bramki zdobyte', d.gz, '#44b1ff')}
            ${hasMatches ? box('Bramki stracone', d.gs, '#ff6b6b') : box('Gole / mecz', d.avg)}
            ${box('Czyste konta', d.cleanSheets)}
        </div>`;
        if (hasMatches) {
            const bil = d.gz - d.gs;
            h += `<div class="row g-3 mb-2">
                ${box('Bilans W-R-P', `${d.w}-${d.r}-${d.p}`)}
                ${box('Bilans bramek', (bil > 0 ? '+' : '') + bil, bil >= 0 ? '#28a745' : '#dc3545')}
                ${box('Gole / mecz', d.avg)}
                ${box('Punkty', d.pkt, '#ffc107')}
            </div>`;
        }
        h += `<div class="form-section"><p class="form-label">FORMA (OSTATNIE 5 MECZÓW):</p><div class="form-container">${forma}</div></div>
              <h6 class="scorers-title">OFICJALNI STRZELCY ZESPOŁU</h6>`;
        h += d.scorers.length
            ? `<table class="scorers-table"><tbody>${d.scorers.map((s, i) =>
                `<tr><td class="s-num">${i + 1}.</td><td class="s-name">${esc(s.name)}</td><td class="s-goals">${s.goals} ⚽</td></tr>`).join('')}</tbody></table>`
            : '<div class="text-muted mt-3" style="font-size:.9rem;">Brak zarejestrowanych strzelców.</div>';
        return h;
    }

    /* Wczytuje mecze wszystkich lig ze wszystkich sezonów */
    async function loadHistory() {
        if (historyCache) return historyCache;
        const out = [];
        for (const s of GFL.seasons()) {
            for (const lg of GFL.LEAGUES) {
                try {
                    const stats = GFL.teamStatsFromMatches(await GFL.load(s, lg, 'mecze'));
                    const table = Object.values(stats).sort((a, b) => b.pkt - a.pkt || (b.gz - b.gs) - (a.gz - a.gs) || b.gz - a.gz);
                    table.forEach((t, i) => out.push({ season: s.label, league: GFL.LEAGUE_NAMES[lg], pos: i + 1, ...t }));
                } catch (e) { /* brak danych dla sezonu/ligi – pomijamy */ }
            }
        }
        return (historyCache = out);
    }

    async function historyView(team) {
        const rows = (await loadHistory()).filter(r => r.name === GFL.norm(team) && r.m > 0);
        if (!rows.length) return '<p style="color:#666;">Brak danych historycznych dla tej drużyny.</p>';
        const sum = rows.reduce((a, r) => { ['m', 'w', 'r', 'p', 'gz', 'gs', 'pkt'].forEach(k => a[k] += r[k]); return a; },
            { m: 0, w: 0, r: 0, p: 0, gz: 0, gs: 0, pkt: 0 });
        const tr = (r, cls = '') => `<tr class="${cls}"><td>${esc(r.season)}</td><td>${esc(r.league)}</td><td>${r.pos ?? '–'}</td><td>${r.m}</td><td>${r.w}-${r.r}-${r.p}</td><td>${r.gz}:${r.gs}</td><td class="h-pkt">${r.pkt}</td></tr>`;
        return `<div class="history-wrap"><table class="history-table">
            <thead><tr><th>Sezon</th><th>Liga</th><th>Miejsce</th><th>M</th><th>W-R-P</th><th>Bramki</th><th>Pkt</th></tr></thead>
            <tbody>${rows.map(r => tr(r)).join('')}</tbody>
            <tfoot>${tr({ season: 'ŁĄCZNIE', league: rows.length + ' sez.', pos: '–', ...sum }, 'h-total')}</tfoot>
        </table></div>
        <p style="color:#555;font-size:.75rem;margin-top:10px;">Miejsce wyliczone z wyników meczów (pkt, bilans bramek, bramki zdobyte).</p>`;
    }

    function openTeam(league, team) {
        const d = data[league][team];
        if (!d) return;
        document.getElementById('modalTeamName').textContent = team;
        const body = document.getElementById('modalTeamBody');
        body.innerHTML = `
            <div class="team-tabs">
                <button type="button" class="team-tab active" data-view="season">${esc(season.label)}</button>
                <button type="button" class="team-tab" data-view="history">HISTORIA</button>
            </div>
            <div id="teamView">${seasonView(d)}</div>`;
        body.querySelectorAll('.team-tab').forEach(b => b.onclick = async () => {
            body.querySelectorAll('.team-tab').forEach(x => x.classList.toggle('active', x === b));
            const v = document.getElementById('teamView');
            if (b.dataset.view === 'season') v.innerHTML = seasonView(d);
            else { v.innerHTML = '<p class="text-center p-4" style="color:#44b1ff;">Ładowanie historii...</p>'; v.innerHTML = await historyView(team); }
        });
        (window._teamModal = window._teamModal || new bootstrap.Modal(document.getElementById('teamModal'))).show();
    }

    document.addEventListener('click', e => {
        const b = e.target.closest('.team-btn[data-team]');
        if (b) openTeam(b.dataset.league, b.dataset.team);
    });

    GFL.LEAGUES.forEach(loadLeague);
})();
