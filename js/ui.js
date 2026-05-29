class UIManager {
    constructor() {
        this.currentTab = 'matches';
        this.selectedMatch = null;
        this.setupEventListeners();
        setTimeout(() => this.switchTab('matches'), 100);
    }

    setupEventListeners() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab, e.target));
        });
        document.getElementById('stageFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('statusFilter')?.addEventListener('change', () => this.applyFilters());

        const modal = document.getElementById('predictionModal');
        document.querySelector('.close')?.addEventListener('click', () => this.closeModal());
        document.getElementById('cancelPrediction')?.addEventListener('click', () => this.closeModal());
        if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) this.closeModal(); });
        document.getElementById('predictionForm')?.addEventListener('submit', (e) => this.savePrediction(e));

        document.getElementById('changePassword')?.addEventListener('click', () => document.getElementById('changePasswordModal').classList.add('active'));
        document.getElementById('cancelPassword')?.addEventListener('click', () => this.closeChangePasswordModal());
        document.getElementById('changePasswordForm')?.addEventListener('submit', (e) => this.handleChangePassword(e));

        document.getElementById('clearCache')?.addEventListener('click', () => { if (confirm('Limpiar cache?')) { clearLocalStorage(); location.reload(); } });
        document.getElementById('exportData')?.addEventListener('click', () => exportData());

        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', (e) => e.target.closest('.modal')?.classList.remove('active'));
        });
    }

    switchTab(tabName, target) {
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(tabName)?.classList.add('active');
        if (target) target.classList.add('active');
        this.currentTab = tabName;
        if (tabName === 'matches') this.loadMatches();
        else if (tabName === 'standings') this.loadStandings();
        else if (tabName === 'leaderboard') this.loadLeaderboard();
        else if (tabName === 'admin') adminPanel?.loadUsers();
    }

    async loadMatches() {
        const container = document.getElementById('matchesContainer');
        container.innerHTML = '<div class="loading">Cargando partidos...</div>';
        try {
            const api = getFootballAPI();
            if (!api) {
                container.innerHTML = '<div class="error">Configura tu API Key en Admin (verifica que este guardada)</div>';
                return;
            }
            const matchesData = await api.getMatches();
            const matches = matchesData.matches || [];
            if (matches.length === 0) {
                container.innerHTML = '<div class="error">No hay partidos disponibles. Puede que el Mundial 2026 aun no este cargado en la API.</div>';
                return;
            }
            const filtered = this.filterMatches(matches);
            container.innerHTML = '';
            filtered.forEach(match => container.appendChild(this.createMatchCard(match)));
        } catch (error) {
            container.innerHTML = '<div class="error">Error: ' + error.message + '</div>';
        }
    }

    filterMatches(matches) {
        const stage = document.getElementById('stageFilter').value;
        const status = document.getElementById('statusFilter').value;
        return matches.filter(m => (!stage || m.stage === stage) && (!status || m.status === status));
    }

    getStatusText(status) {
        const map = { 'SCHEDULED': 'Por Jugar', 'IN_PLAY': 'En Juego', 'FINISHED': 'Terminado', 'POSTPONED': 'Pospuesto', 'SUSPENDED': 'Suspendido', 'CANCELLED': 'Cancelado' };
        return map[status] || status;
    }

    getStageBadge(stage) {
        const name = getStageName(stage);
        let cls = 'group';
        if (stage === 'ROUND_16' || stage === 'QUARTER_FINALS' || stage === 'SEMI_FINALS' || stage === 'PLAYOFF') cls = 'knockout';
        if (stage === 'FINAL' || stage === 'THIRD_PLACE') cls = 'final';
        return `<span class="match-stage-badge ${cls}">${name}</span>`;
    }

    createMatchCard(match) {
        const card = document.createElement('div');
        card.className = 'match-card';
        const home = match.homeTeam.name, away = match.awayTeam.name;
        const date = new Date(match.utcDate).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        let scoreHTML = '';
        const statusClass = 'status-' + match.status.toLowerCase();
        const statusText = this.getStatusText(match.status);

        if (match.status === 'FINISHED' && match.score?.fullTime && match.score.fullTime.home !== null) {
            scoreHTML = `<div class="score-display">${match.score.fullTime.home} - ${match.score.fullTime.away}</div>`;
        } else if (match.status === 'IN_PLAY') {
            const hs = match.score?.fullTime?.home ?? match.score?.halfTime?.home ?? '-';
            const as = match.score?.fullTime?.away ?? match.score?.halfTime?.away ?? '-';
            scoreHTML = `<div class="score-display">${hs} - ${as}</div>`;
        }

        const predictions = getFromLocalStorage(CONFIG.STORAGE_KEYS.PREDICTIONS) || {};
        const pred = predictions[match.id];
        let predHTML = pred ? `<div class="match-status" style="background:rgba(46,160,67,0.12);color:#3fb950;">Mi prediccion: ${pred.goals1} - ${pred.goals2}</div>` : '';
        let btnHTML = (match.status === 'SCHEDULED' || match.status === 'TIMED') ? `<button class="btn btn-primary" onclick="uiManager.openPredictionModal(${match.id},'${home.replace(/'/g, "\\'")}','${away.replace(/'/g, "\\'")}')">Hacer prediccion</button>` : '';

        card.innerHTML = `
            <div class="match-header"><span class="match-date">${date}</span>${this.getStageBadge(match.stage)}</div>
            <div class="match-teams">
                <div class="team"><div>${getFlag(home)}</div><div class="team-name">${home}</div></div>
                <div class="vs">VS</div>
                <div class="team"><div>${getFlag(away)}</div><div class="team-name">${away}</div></div>
            </div>
            ${scoreHTML}${predHTML}
            <div class="match-status ${statusClass}">${statusText}</div>
            <div class="match-actions">${btnHTML}</div>`;
        return card;
    }

    openPredictionModal(matchId, homeTeam, awayTeam) {
        this.selectedMatch = { id: matchId, homeTeam, awayTeam };
        const predictions = getFromLocalStorage(CONFIG.STORAGE_KEYS.PREDICTIONS) || {};
        const pred = predictions[matchId];
        document.getElementById('matchTitle').textContent = `${homeTeam} vs ${awayTeam}`;
        document.getElementById('matchInfo').innerHTML = `${getFlag(homeTeam)} ${homeTeam} <strong>vs</strong> ${awayTeam} ${getFlag(awayTeam)}`;
        document.getElementById('goals1').value = pred ? pred.goals1 : '';
        document.getElementById('goals2').value = pred ? pred.goals2 : '';
        document.getElementById('predictionModal').classList.add('active');
    }

    closeModal() {
        document.getElementById('predictionModal').classList.remove('active');
        this.selectedMatch = null;
    }

    savePrediction(e) {
        e.preventDefault();
        if (!this.selectedMatch) return;
        const g1 = parseInt(document.getElementById('goals1').value);
        const g2 = parseInt(document.getElementById('goals2').value);
        const predictions = getFromLocalStorage(CONFIG.STORAGE_KEYS.PREDICTIONS) || {};
        predictions[this.selectedMatch.id] = {
            matchId: this.selectedMatch.id,
            homeTeam: this.selectedMatch.homeTeam,
            awayTeam: this.selectedMatch.awayTeam,
            goals1: g1, goals2: g2,
            username: authManager?.currentUser?.username || 'anon',
            timestamp: new Date().toISOString()
        };
        saveToLocalStorage(CONFIG.STORAGE_KEYS.PREDICTIONS, predictions);
        this.closeModal();
        this.loadMatches();
        this.showNotification('Prediccion guardada', 'success');
    }

    async loadStandings() {
        const container = document.getElementById('standingsContainer');
        container.innerHTML = '<div class="loading">Cargando tabla...</div>';
        try {
            const api = getFootballAPI();
            if (!api) { container.innerHTML = '<div class="error">Configura API Key en Admin</div>'; return; }
            const data = await api.getStandings();
            if (!data.standings) { container.innerHTML = '<div class="error">Sin datos de tabla</div>'; return; }
            container.innerHTML = '';
            data.standings.forEach(group => {
                const div = document.createElement('div');
                div.className = 'group';
                let html = `<h3 class="group-title">${group.group || 'Posiciones'}</h3>
                    <table class="standings-table"><thead><tr><th>Pos</th><th>Equipo</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DG</th><th>Pts</th></tr></thead><tbody>`;
                (group.table || []).forEach((t, i) => {
                    html += `<tr><td>${i+1}</td><td class="team-ranking"><span class="rank-number">${getFlag(t.team.name)}</span>${t.team.name}</td><td>${t.playedGames}</td><td>${t.won}</td><td>${t.draw}</td><td>${t.lost}</td><td>${t.goalsFor}</td><td>${t.goalsAgainst}</td><td>${t.goalDifference}</td><td><strong>${t.points}</strong></td></tr>`;
                });
                html += '</tbody></table>';
                div.innerHTML = html;
                container.appendChild(div);
            });
        } catch (error) {
            container.innerHTML = '<div class="error">Error: ' + error.message + '</div>';
        }
    }

    loadLeaderboard() {
        const container = document.getElementById('leaderboardContainer');
        container.innerHTML = '<div class="loading">Cargando clasificacion...</div>';

        const scores = getFromLocalStorage('porra_scores') || {};
        const users = authManager?.getUsersList() || [];
        const defaultAdmin = CONFIG.DEFAULT_ADMIN.username;

        const allUsers = {};
        users.forEach(u => { allUsers[u.username] = { total: 0, correct: 0 }; });
        if (!allUsers[defaultAdmin]) allUsers[defaultAdmin] = { total: 0, correct: 0 };

        for (const [user, score] of Object.entries(scores)) {
            if (allUsers[user]) { allUsers[user].total = score.total || 0; allUsers[user].correct = score.correct || 0; }
        }

        const sorted = Object.entries(allUsers).sort((a, b) => b[1].total - a[1].total);

        if (sorted.length === 0) {
            container.innerHTML = '<div class="info-text">No hay puntuaciones aun</div>';
            return;
        }

        let html = `<table class="leaderboard-table"><thead><tr><th>Pos</th><th>Participante</th><th>Aciertos</th><th>Puntos</th></tr></thead><tbody>`;
        sorted.forEach(([name, score], i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
            html += `<tr><td class="leaderboard-rank">${medal} ${i+1}</td><td>${name}</td><td>${score.correct}</td><td><strong>${score.total}</strong></td></tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    applyFilters() { this.loadMatches(); }

    closeChangePasswordModal() {
        document.getElementById('changePasswordModal').classList.remove('active');
        document.getElementById('changePasswordForm').reset();
    }

    handleChangePassword(e) {
        e.preventDefault();
        const cur = document.getElementById('currentPassword').value;
        const newp = document.getElementById('newPassword').value;
        const conf = document.getElementById('confirmPassword').value;
        if (!cur || !newp || !conf) return this.showNotification('Completa todos los campos', 'error');
        if (newp !== conf) return this.showNotification('Las contrasenas no coinciden', 'error');
        if (newp.length < 6) return this.showNotification('Minimo 6 caracteres', 'error');
        const result = authManager?.changeUserPassword(authManager.currentUser?.username, cur, newp);
        if (result?.success) { this.showNotification('Contrasena cambiada', 'success'); this.closeChangePasswordModal(); }
        else { this.showNotification(result?.message || 'Error', 'error'); }
    }

    showNotification(message, type = 'info') {
        const el = document.createElement('div');
        el.className = type;
        el.textContent = message;
        el.style.cssText = 'position:fixed;top:20px;right:20px;z-index:2000;max-width:400px;';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 3000);
    }
}

let uiManager = null;
document.addEventListener('DOMContentLoaded', () => {
    uiManager = new UIManager();
    const savedApiKey = getFromLocalStorage(CONFIG.STORAGE_KEYS.API_KEY);
    if (savedApiKey && typeof initFootballAPI === 'function') initFootballAPI(savedApiKey);
});
