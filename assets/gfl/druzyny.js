/* Strona DRUŻYNY: profile z wyborem sezonu + historia drużyny ze wszystkich sezonów */
(() => {
    const esc = GFL.esc;
    const season = GFL.selectedSeason();
    const data = {};          // data[league][TEAM] = statystyki wybranego sezonu
    let historyCache = null;

    GFL.renderSeasonSwitch(document.getElementById('season-switch'), season);
    const sub = document.getElementById('season-subtitle');
    if (sub) sub.textContent = season.label + ' • KLIKNIJ, ABY ZOBACZYĆ STATYSTYKI';

    function parseScorers(raw) {
        if (!raw || raw === 'Brak bramek') return [];
        return raw.split(/,\s*/).map(s => s.match(/(.+)\((\d+)\)/)).filter(Boolean)
            .map(m => ({ name: m[1].trim(), goals: parseInt(m[2]) }));
    }

    /* Tabela -> {NAZWA: stat}; najpierw oficjalna tabela, awaryjnie liczona z meczów */
    async function seasonLeagueStats(s, league) {
        let table = {}, calc = {};
        try { GFL.tableStats(await GFL.load(s, league, 'tabela')).forEach(t => table[t.name] = t); } catch (e) { }
        if (!s.static) { try { calc = GFL.teamStatsFromMatches(await GFL.load(s, league, 'mecze')); } catch (e) { } }
        return { table, calc };
    }

    /* Kontener ligi; dla Aggressive (tylko sezon 0) tworzony jako kopia sekcji Aspire */
    function leagueBox(league) {
        let el = document.getElementById(league + '-data');
        if (el) return el;
        const asp = document.getElementById('aspire-data');
        if (!asp) return null;
        let block = asp;   // najwyższy element zawierający tylko sekcję Aspire
        while (block.parentElement && !block.parentElement.querySelector('#elite-data')) block = block.parentElement;
        const clone = block.cloneNode(true);
        clone.querySelectorAll('[id]').forEach(n => n.id = n.id.replace('aspire', league));
        if (clone.id) clone.id = clone.id.replace('aspire', league);
        const w = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
        while (w.nextNode()) w.currentNode.nodeValue = w.currentNode.nodeValue
            .replace(/ASPIRE/g, GFL.LEAGUE_NAMES[league]).replace(/Aspire/g, 'Aggressive');
        block.after(clone);
        return document.getElementById(league + '-data');
    }

    async function loadLeague(league) {
        const box = leagueBox(league);
        if (!box) return;
        data[league] = {};
        const { table, calc } = await seasonLeagueStats(season, league);

        // lista drużyn: z zakładki STATYSTYKI_DRUZYN, a gdy jej brak (sezony 0 i I) – z tabeli
        let teamRows = [];
        if (!season.static) {
            try { teamRows = (await GFL.load(season, league, 'druzyny')).slice(1).filter(c => c.length >= 5 && c[0]); } catch (e) { console.warn(e); }
        }
        const basic = !teamRows.length;
        if (basic) teamRows = Object.values(table).map(t => [t.name]);

        let html = '';
        teamRows.forEach(c => {
            const name = c[0];
            const key = GFL.norm(name);
            const t = table[key] || calc[key] || {};
            const scorers = parseScorers(c[3]);
            const matches = t.m ?? (parseInt(c[1]) || 0);
            const gz = t.m !== undefined ? t.gz : scorers.reduce((a, s) => a + s.goals, 0);
            const bil = t.bil !== undefined ? t.bil : (t.gs !== undefined && gz !== null ? gz - t.gs : undefined);
            let forma = (c[4] || '').split(',').map(s => s.trim()).filter(f => ['Z', 'R', 'P'].includes(f));
            if (!forma.length && calc[key]) forma = calc[key].forma.slice(-5);
            data[league][name] = {
                basic, pos: t.pos, matches, gz, gs: t.gs, bil, w: t.w, r: t.r, p: t.p, pkt: t.pkt,
                cleanSheets: parseInt(c[2]) || (calc[key] || {}).cs || 0,
                avg: (matches && gz !== null) ? (gz / matches).toFixed(2) : '–',
                scorers, forma
            };
            html += `<button type="button" class="team-btn" style="background-image:url('${esc(GFL.logo(name))}')" data-league="${league}" data-team="${esc(name)}">${esc(name)}</button>`;
        });
        box.innerHTML = html || '<div class="text-center w-100 p-4" style="color:#666;">Brak danych dla tej ligi w wybranym sezonie.</div>';
    }

    const box = (label, val, color) =>
        `<div class="col-6 col-md-3"><div class="stat-box-profile"><div class="stat-label-profile">${label}</div><div class="stat-value-profile"${color ? ` style="color:${color}"` : ''}>${val}</div></div></div>`;

    function seasonView(d) {
        const hasMatches = d.gs !== undefined;
        const onlyBil = d.gz === null;       // znany tylko bilans bramek
        const bil = d.bil;
        const bilBox = () => box('Bilans bramek', (bil > 0 ? '+' : '') + bil, bil >= 0 ? '#28a745' : '#dc3545');
        let h = `<div class="row g-3 mb-2">
            ${box('Rozegrane', d.matches)}
            ${onlyBil ? bilBox() : box('Bramki zdobyte', d.gz, '#44b1ff')}
            ${onlyBil ? box('Punkty', d.pkt, '#ffc107') : (hasMatches ? box('Bramki stracone', d.gs, '#ff6b6b') : box('Gole / mecz', d.avg))}
            ${d.basic ? box('Miejsce', d.pos ?? '–', '#ffc107') : box('Czyste konta', d.cleanSheets)}
        </div>`;
        if (hasMatches && !onlyBil) {
            h += `<div class="row g-3 mb-2">
                ${box('Bilans W-R-P', `${d.w}-${d.r}-${d.p}`)}
                ${bilBox()}
                ${box('Gole / mecz', d.avg)}
                ${box('Punkty', d.pkt, '#ffc107')}
            </div>`;
        } else if (onlyBil) {
            h += `<div class="row g-3 mb-2">${box('Bilans W-R-P', `${d.w}-${d.r}-${d.p}`)}</div>`;
        }
        if (d.basic) {
            return h + '<p style="color:#555;font-size:.8rem;margin-top:15px;">Sezon archiwalny – dostępne są tylko statystyki z tabeli końcowej (bez strzelców i formy).</p>';
        }
        const forma = d.forma.length
            ? d.forma.map(f => `<span class="form-badge f-${f}">${f}</span>`).join('')
            : '<span style="color:#666;font-size:.85rem;">Brak danych</span>';
        h += `<div class="form-section"><p class="form-label">FORMA (OSTATNIE 5 MECZÓW):</p><div class="form-container">${forma}</div></div>
              <h6 class="scorers-title">OFICJALNI STRZELCY ZESPOŁU</h6>`;
        h += d.scorers.length
            ? `<table class="scorers-table"><tbody>${d.scorers.map((s, i) =>
                `<tr><td class="s-num">${i + 1}.</td><td class="s-name">${esc(s.name)}</td><td class="s-goals">${s.goals} ⚽</td></tr>`).join('')}</tbody></table>`
            : '<div class="text-muted mt-3" style="font-size:.9rem;">Brak zarejestrowanych strzelców.</div>';
        return h;
    }

    /* Dane wszystkich lig ze wszystkich sezonów */
    async function loadHistory() {
        if (historyCache) return historyCache;
        const jobs = [];
        for (const s of GFL.seasons()) (await GFL.leaguesFor(s)).forEach(lg => jobs.push((async () => {
            const { table, calc } = await seasonLeagueStats(s, lg);
            let list = Object.values(table);
            if (!list.length) {
                list = Object.values(calc).sort((a, b) => b.pkt - a.pkt || (b.gz - b.gs) - (a.gz - a.gs) || b.gz - a.gz)
                    .map((t, i) => ({ ...t, pos: i + 1 }));
            }
            return list.map(t => ({ season: s.label, league: GFL.LEAGUE_NAMES[lg], ...t,
                bil: t.bil !== undefined ? t.bil : t.gz - t.gs }));
        })()));
        return (historyCache = (await Promise.all(jobs)).flat());
    }

    async function historyView(team) {
        const rows = (await loadHistory()).filter(r => r.name === GFL.norm(team) && r.m > 0);
        if (!rows.length) return '<p style="color:#666;">Brak danych historycznych dla tej drużyny.</p>';
        const partial = rows.some(r => r.gz === null);
        const sum = rows.reduce((a, r) => {
            ['m', 'w', 'r', 'p', 'pkt', 'bil'].forEach(k => a[k] += r[k]);
            if (r.gz !== null) { a.gz += r.gz; a.gs += r.gs; }
            return a;
        }, { m: 0, w: 0, r: 0, p: 0, gz: 0, gs: 0, pkt: 0, bil: 0 });
        const sign = v => (v > 0 ? '+' : '') + v;
        const goals = r => r.gz === null ? 'bil. ' + sign(r.bil) : `${r.gz}:${r.gs}`;
        const tr = (r, cls = '', g = goals(r)) => `<tr class="${cls}"><td>${esc(r.season)}</td><td>${esc(r.league)}</td><td>${r.pos ?? '–'}</td><td>${r.m}</td><td>${r.w}-${r.r}-${r.p}</td><td>${g}</td><td class="h-pkt">${r.pkt}</td></tr>`;
        return `<div class="history-wrap"><table class="history-table">
            <thead><tr><th>Sezon</th><th>Liga</th><th>Miejsce</th><th>M</th><th>W-R-P</th><th>Bramki</th><th>Pkt</th></tr></thead>
            <tbody>${rows.map(r => tr(r)).join('')}</tbody>
            <tfoot>${tr({ season: 'ŁĄCZNIE', league: rows.length + ' sez.', pos: '–', ...sum }, 'h-total',
                partial ? 'bil. ' + sign(sum.bil) : `${sum.gz}:${sum.gs}`)}</tfoot>
        </table></div>
        ${partial ? '<p style="color:#555;font-size:.75rem;margin-top:10px;">Aggressive League (sezon 0): zachował się tylko bilans bramek, dlatego łącznie podany jest bilans.</p>' : ''}`;
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

    GFL.leaguesFor(season).then(list => list.forEach(loadLeague));
})();
