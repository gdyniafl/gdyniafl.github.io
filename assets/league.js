/* Strona ligi (elite/challenge/aspire): tabela + terminarz z wyborem sezonu.
   Liga brana z <body data-league="elite"> */
(async () => {
    const league = document.body.dataset.league;
    const season = GFL.selectedSeason();
    const esc = GFL.esc;

    GFL.renderSeasonSwitch(document.getElementById('season-switch'), season);
    const sub = document.getElementById('league-subtitle');
    if (sub) sub.textContent = 'TABELA I TERMINARZ – ' + season.label;

    // 1. TABELA
    try {
        const rows = await GFL.load(season, league, 'tabela');
        document.getElementById('table-data').innerHTML = rows.slice(1)
            .filter(c => c.length >= 8 && c[1])
            .map(c => `<tr>
                <td class="sticky-pos col-highlight">${esc(c[0])}</td>
                <td class="sticky-team" style="font-weight:bold;">${esc(c[1])}</td>
                <td class="col-stat">${esc(c[2])}</td><td class="col-stat">${esc(c[3])}</td><td class="col-stat">${esc(c[5])}</td><td class="col-stat">${esc(c[4])}</td>
                <td class="col-goals">${esc(c[6])}:${esc(c[7])}</td><td class="col-highlight col-pkt">${esc(c[9])}</td>
            </tr>`).join('');
    } catch (e) {
        console.error(e);
        document.getElementById('table-data').innerHTML = '<tr><td colspan="8" class="text-center p-4">Brak danych tabeli dla tego sezonu.</td></tr>';
    }

    // 2. TERMINARZ
    try {
        const rows = await GFL.load(season, league, 'mecze');
        const rounds = {};
        rows.slice(1).filter(c => c.length >= 6 && c[0]).forEach(c => {
            const r = c[5];
            (rounds[r] = rounds[r] || []).push(c);
        });
        document.getElementById('scheduleAccordion').innerHTML = Object.keys(rounds)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(r => {
                const matches = rounds[r].map(c => {
                    const score = (c[2] !== '' && c[3] !== '') ? `${esc(c[2])} : ${esc(c[3])}` : 'vs';
                    const info = (c[6] && c[6] !== 'Brak rezerwacji') ? `${esc(c[6])} | ${esc(c[7] || '')}` : 'Termin do ustalenia';
                    return `<div class="match-row"><span class="team-name text-end">${esc(c[0])}</span><span class="score-box">${score}<span class="match-details">${info}</span></span><span class="team-name">${esc(c[1])}</span></div>`;
                }).join('');
                const id = 'k' + String(r).replace(/\W/g, '');
                return `<div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${id}">KOLEJKA ${esc(r)}</button></h2><div id="${id}" class="accordion-collapse collapse" data-bs-parent="#scheduleAccordion"><div class="accordion-body">${matches}</div></div></div>`;
            }).join('') || '<p class="text-center">Brak terminarza.</p>';
    } catch (e) {
        console.error(e);
        document.getElementById('scheduleAccordion').innerHTML = '<p class="text-center">Brak terminarza dla tego sezonu.</p>';
    }
})();
