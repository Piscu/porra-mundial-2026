// Manejador de UI
class UIManager {
    constructor() {
        this.currentTab = 'matches';
        this.selectedMatch = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Cambio de tabs
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Filtros
        document.getElementById('stageFilter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('statusFilter')?.addEventListener('change', () => this.applyFilters());

        // Modal
        const modal = document.getElementById('predictionModal');
        const closeBtn = document.querySelector('.close');
        const cancelBtn = document.getElementById('cancelPrediction');
        const form = document.getElementById('predictionForm');

        if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeModal());
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal();
            });
        }
        if (form) form.addEventListener('submit', (e) => this.savePrediction(e));

        // Cambiar contraseña
        document.getElementById('changePassword')?.addEventListener('click', () => this.openChangePasswordModal());
        
        const changePasswordModal = document.getElementById('changePasswordModal');
        if (changePasswordModal) {
            changePasswordModal.addEventListener('click', (e) => {
                if (e.target === changePasswordModal) this.closeChangePasswordModal();
            });
        }

        const changePasswordForm = document.getElementById('changePasswordForm');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', (e) => this.handleChangePassword(e));
        }

        document.getElementById('cancelPassword')?.addEventListener('click', () => this.closeChangePasswordModal());

        // Configuración (solo para usuarios normales)
        document.getElementById('clearCache')?.addEventListener('click', () => this.clearCache());
        document.getElementById('exportData')?.addEventListener('click', () => this.exportData());

        // Cerrar modales con X
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('active');
            });
        });
    }

    // Cambiar tab
    switchTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        document.getElementById(tabName)?.classList.add('active');
        event.target.classList.add('active');

        this.currentTab = tabName;

        // Cargar datos si es necesario
        if (tabName === 'matches') {
            this.loadMatches();
        } else if (tabName === 'standings') {
            this.loadStandings();
        } else if (tabName === 'leaderboard') {
            this.loadLeaderboard();
        } else if (tabName === 'admin') {
            this.loadAdminDashboard();
        }
    }

    // Cargar partidos
    async loadMatches() {
        const container = document.getElementById('matchesContainer');
        container.innerHTML = '<div class="loading">Cargando partidos...</div>';

        try {
            const api = getFootballAPI();
            if (!api) {
                container.innerHTML = '<div class="error">Por favor, configura tu API key en Configuración</div>';
                return;
            }

            const matchesData = await api.getMatches();
            const matches = matchesData.matches || [];

            if (matches.length === 0) {
                container.innerHTML = '<div class="error">No hay partidos disponibles</div>';
                return;
            }

            const filtered = this.filterMatches(matches);
            container.innerHTML = '';

            filtered.forEach(match => {
                const card = this.createMatchCard(match);
                container.appendChild(card);
            });
        } catch (error) {
            console.error('Error cargando partidos:', error);
            container.innerHTML = '<div class="error">Error cargando partidos: ' + error.message + '</div>';
        }
    }

    // Filtrar partidos
    filterMatches(matches) {
        const stageFilter = document.getElementById('stageFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;

        return matches.filter(match => {
            const stageMatch = !stageFilter || match.stage === stageFilter;
            const statusMatch = !statusFilter || match.status === statusFilter;
            return stageMatch && statusMatch;
        });
    }

    // Crear tarjeta de partido
    createMatchCard(match) {
        const card = document.createElement('div');
        card.className = 'match-card';

        const homeTeam = match.homeTeam.name;
        const awayTeam = match.awayTeam.name;
        const homeLogo = getFlag(homeTeam);
        const awayLogo = getFlag(awayTeam);

        const matchDate = new Date(match.utcDate).toLocaleString('es-ES');
        
        let scoreHTML = '';
        let statusClass = `status-${match.status.toLowerCase()}`;
        let statusText = this.getStatusText(match.status);

        if (match.status === 'FINISHED') {
            const homeScore = match.score.fullTime.home;
            const awayScore = match.score.fullTime.away;
            scoreHTML = `<div class="score-display">${homeScore} - ${awayScore}</div>`;
        } else if (match.status === 'IN_PLAY') {
            const homeScore = match.score.liveTime?.home || match.score.halfTime?.home || '-';
            const awayScore = match.score.liveTime?.away || match.score.halfTime?.away || '-';
            scoreHTML = `<div class="score-display">${homeScore} - ${awayScore}</div>`;
        }

        const predictions = getFromLocalStorage(CONFIG.STORAGE_KEYS.PREDICTIONS) || {};
        const prediction = predictions[match.id];
        let predictionHTML = '';

        if (prediction) {
            predictionHTML = `<div class="match-status" style="background: #e8f5e9; color: #2e7d32;">
                Mi predicción: ${prediction.goals1} - ${prediction.goals2}
            </div>`;
        }

        let buttonHTML = '';
        if (match.status === 'SCHEDULED' || !scoreHTML) {
            buttonHTML = `<button class="btn btn-primary" onclick="uiManager.openPredictionModal(${match.id}, '${homeTeam}', '${awayTeam}')">
                Hacer predicción
            </button>`;
        }

        card.innerHTML = `
            <div class="match-header">
                <span class="match-date">${matchDate}</span>
                <span class="match-stage">${match.stage}</span>
            </div>
            <div class="match-teams">
                <div class="team">
                    <div class="team-flag">${homeLogo}</div>
                    <div class="team-name">${homeTeam}</div>
                </div>
                <div class="vs">VS</div>
                <div class="team">
                    <div class="team-flag">${awayLogo}</div>
                    <div class="team-name">${awayTeam}</div>
                </div>
            </div>
            ${scoreHTML}
            ${predictionHTML}
            <div class="match-status ${statusClass}">${statusText}</div>
            <div class="match-actions">
                ${buttonHTML}
            </div>
        `;

        return card;
    }

    // Obtener texto del estado
    getStatusText(status) {
        const statusMap = {
            'SCHEDULED': 'Por Jugar',
            'IN_PLAY': 'En Juego',
            'FINISHED': 'Terminado',
            'POSTPONED': 'Pospuesto',
            'SUSPENDED': 'Suspendido',
            'CANCELLED': 'Cancelado'
        };
        return statusMap[status] || status;
    }

    // Abrir modal de predicción
    openPredictionModal(matchId, homeTeam, awayTeam) {
        this.selectedMatch = { id: matchId, homeTeam, awayTeam };
        const modal = document.getElementById('predictionModal');
        const predictions = getFromLocalStorage(CONFIG.STORAGE_KEYS.PREDICTIONS) || {};
        const prediction = predictions[matchId];

        document.getElementById('matchTitle').textContent = `${homeTeam} vs ${awayTeam}`;
        document.getElementById('matchInfo').innerHTML = `
            ${getFlag(homeTeam)} ${homeTeam} <strong>vs</strong> ${awayTeam} ${getFlag(awayTeam)}
        `;

        document.getElementById('goals1').value = prediction ? prediction.goals1 : '';
        document.getElementById('goals2').value = prediction ? prediction.goals2 : '';

        modal.classList.add('active');
    }

    // Cerrar modal
    closeModal() {
        document.getElementById('predictionModal').classList.remove('active');
        this.selectedMatch = null;
    }

    // Guardar predicción
    async savePrediction(e) {
        e.preventDefault();

        if (!this.selectedMatch) return;

        const goals1 = parseInt(document.getElementById('goals1').value);
        const goals2 = parseInt(document.getElementById('goals2').value);

        const predictions = getFromLocalStorage(CONFIG.STORAGE_KEYS.PREDICTIONS) || {};
        const prediction = {
            matchId: this.selectedMatch.id,
            homeTeam: this.selectedMatch.homeTeam,
            awayTeam: this.selectedMatch.awayTeam,
            goals1: goals1,
            goals2: goals2,
            timestamp: new Date().toISOString()
        };

        predictions[this.selectedMatch.id] = prediction;
        saveToLocalStorage(CONFIG.STORAGE_KEYS.PREDICTIONS, predictions);

        try {
            const api = getBackendAPI() || window.backendAPI;
            if (api) {
                await api.savePrediction(this.selectedMatch.id, this.selectedMatch.homeTeam, this.selectedMatch.awayTeam, goals1, goals2);
            }
        } catch (err) {
            console.warn('No se pudo guardar en backend:', err);
        }

        this.closeModal();
        this.loadMatches();
        this.showNotification('Predicción guardada correctamente', 'success');
    }

    // Cargar tabla de posiciones
    async loadStandings() {
        const container = document.getElementById('standingsContainer');
        container.innerHTML = '<div class="loading">Cargando tabla de posiciones...</div>';

        try {
            const api = getFootballAPI();
            if (!api) {
                container.innerHTML = '<div class="error">Por favor, contacta con el administrador</div>';
                return;
            }

            const standingsData = await api.getStandings();
            
            if (!standingsData.standings) {
                container.innerHTML = '<div class="error">No hay información de tabla de posiciones</div>';
                return;
            }

            container.innerHTML = '';

            standingsData.standings.forEach(group => {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'group';

                let groupTitle = group.group || 'Posiciones';
                
                let tableHTML = `
                    <h3 class="group-title">${groupTitle}</h3>
                    <table class="standings-table">
                        <thead>
                            <tr>
                                <th>Pos.</th>
                                <th>Equipo</th>
                                <th>PJ</th>
                                <th>G</th>
                                <th>E</th>
                                <th>P</th>
                                <th>GF</th>
                                <th>GC</th>
                                <th>DG</th>
                                <th>Pts</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                group.table.forEach((team, index) => {
                    const flag = getFlag(team.team.name);
                    tableHTML += `
                        <tr>
                            <td>${index + 1}</td>
                            <td class="team-ranking">
                                <span class="rank-number">${flag}</span>
                                ${team.team.name}
                            </td>
                            <td>${team.playedGames}</td>
                            <td>${team.won}</td>
                            <td>${team.draw}</td>
                            <td>${team.lost}</td>
                            <td>${team.goalsFor}</td>
                            <td>${team.goalsAgainst}</td>
                            <td>${team.goalDifference}</td>
                            <td><strong>${team.points}</strong></td>
                        </tr>
                    `;
                });

                tableHTML += `
                        </tbody>
                    </table>
                `;

                groupDiv.innerHTML = tableHTML;
                container.appendChild(groupDiv);
            });
        } catch (error) {
            console.error('Error cargando tabla de posiciones:', error);
            container.innerHTML = '<div class="error">Error cargando tabla: ' + error.message + '</div>';
        }
    }

    // Cargar clasificación general
    async loadLeaderboard() {
        const container = document.getElementById('leaderboardContainer');
        container.innerHTML = '<div class="loading">Cargando clasificación general...</div>';

        try {
            if (!backendAPI) {
                container.innerHTML = '<div class="error">Por favor, contacta con el administrador</div>';
                return;
            }

            const result = await backendAPI.getScores();
            
            if (!result.success || !result.scores) {
                container.innerHTML = '<div class="error">No hay datos de puntuación</div>';
                return;
            }

            // Ordenar por puntos descendente
            const scores = result.scores.sort((a, b) => b.totalPoints - a.totalPoints);

            let html = `
                <table class="leaderboard-table">
                    <thead>
                        <tr>
                            <th>Pos.</th>
                            <th>Participante</th>
                            <th>Aciertos</th>
                            <th>Puntos</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            scores.forEach((score, index) => {
                let medal = '';
                if (index === 0) medal = '🥇';
                else if (index === 1) medal = '🥈';
                else if (index === 2) medal = '🥉';

                html += `
                    <tr>
                        <td class="leaderboard-rank">${medal} ${index + 1}</td>
                        <td>${score.username}</td>
                        <td>${score.correctPredictions || 0}</td>
                        <td><strong>${score.totalPoints || 0}</strong></td>
                    </tr>
                `;
            });

            html += `
                    </tbody>
                </table>
            `;

            container.innerHTML = html;
        } catch (error) {
            console.error('Error cargando clasificación:', error);
            container.innerHTML = '<div class="error">Error: ' + error.message + '</div>';
        }
    }

    // Cargar dashboard de admin
    loadAdminDashboard() {
        // Los datos se cargan cuando se hacen clic en los tabs específicos del admin
        adminPanel?.loadUsers();
    }

    // Aplicar filtros
    applyFilters() {
        this.loadMatches();
    }

    // Guardar Sheet ID
    saveSheetId() {
        const sheetId = document.getElementById('sheetId')?.value.trim();
        if (!sheetId) {
            this.showNotification('Por favor, ingresa un Sheet ID', 'error');
            return;
        }

        saveToLocalStorage(CONFIG.STORAGE_KEYS.SHEET_ID, sheetId);
        initGoogleSheets(sheetId);
        this.showNotification('Sheet ID guardado correctamente', 'success');
    }

    // Guardar API Key
    saveApiKey() {
        const apiKey = document.getElementById('apiKey')?.value.trim();
        if (!apiKey) {
            this.showNotification('Por favor, ingresa una API Key', 'error');
            return;
        }

        saveToLocalStorage(CONFIG.STORAGE_KEYS.API_KEY, apiKey);
        initFootballAPI(apiKey);
        this.showNotification('API Key guardada correctamente', 'success');
    }

    // Guardar nombre de usuario
    saveName() {
        const userName = document.getElementById('userName')?.value.trim();
        if (!userName) {
            this.showNotification('Por favor, ingresa tu nombre', 'error');
            return;
        }

        saveToLocalStorage(CONFIG.STORAGE_KEYS.USER_NAME, userName);
        this.showNotification('Nombre guardado correctamente', 'success');
    }

    // Limpiar caché
    clearCache() {
        if (confirm('¿Estás seguro de que quieres limpiar todo el caché?')) {
            clearLocalStorage();
            this.showNotification('Caché limpiado correctamente', 'success');
            location.reload();
        }
    }

    // Exportar datos
    exportData() {
        exportData();
        this.showNotification('Datos exportados correctamente', 'success');
    }

    // Cambiar contraseña
    openChangePasswordModal() {
        const modal = document.getElementById('changePasswordModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeChangePasswordModal() {
        const modal = document.getElementById('changePasswordModal');
        if (modal) {
            modal.classList.remove('active');
        }
        document.getElementById('changePasswordForm')?.reset();
    }

    async handleChangePassword(e) {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showNotification('Por favor, completa todos los campos', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showNotification('Las contraseñas nuevas no coinciden', 'error');
            return;
        }

        if (newPassword.length < 6) {
            this.showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        try {
            const result = await backendAPI.changeUserPassword(
                authManager.currentUser.username,
                currentPassword,
                newPassword
            );

            if (result.success) {
                this.showNotification('Contraseña cambiada correctamente', 'success');
                this.closeChangePasswordModal();
            } else {
                this.showNotification(result.message || 'Error al cambiar contraseña', 'error');
            }
        } catch (error) {
            this.showNotification('Error: ' + error.message, 'error');
        }
    }

    // Mostrar notificación
    showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = type === 'error' ? 'error' : type === 'success' ? 'success' : 'info';
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '2000';
        notification.style.maxWidth = '400px';

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Instancia global de UIManager
let uiManager = null;

// Inicializar UIManager cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    uiManager = new UIManager();
    
    // Cargar configuración guardada
    const savedSheetId = getFromLocalStorage(CONFIG.STORAGE_KEYS.SHEET_ID);
    const savedApiKey = getFromLocalStorage(CONFIG.STORAGE_KEYS.API_KEY);
    const savedUserName = getFromLocalStorage(CONFIG.STORAGE_KEYS.USER_NAME);

    if (savedSheetId) {
        document.getElementById('sheetId').value = savedSheetId;
        initGoogleSheets(savedSheetId);
    }

    if (savedApiKey) {
        document.getElementById('apiKey').value = savedApiKey;
        initFootballAPI(savedApiKey);
    }

    if (savedUserName) {
        document.getElementById('userName').value = savedUserName;
    }
});
