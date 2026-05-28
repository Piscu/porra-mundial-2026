class AdminPanel {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchAdminTab(e.target.dataset.adminTab, e.target));
        });
        document.getElementById('updateApiKey')?.addEventListener('click', () => this.updateApiKey());
        document.getElementById('updateAppsScriptUrl')?.addEventListener('click', () => this.updateAppsScriptUrl());
        document.getElementById('updateSheetId')?.addEventListener('click', () => this.updateSheetId());
        document.getElementById('updateAdminSecret')?.addEventListener('click', () => this.updateAdminSecret());
        document.getElementById('appsScriptGuide')?.addEventListener('click', (e) => { e.preventDefault(); this.showAppsScriptGuide(); });
        document.getElementById('updateScoreConfig')?.addEventListener('click', () => this.updateScoreConfig());
        document.getElementById('recalculateScores')?.addEventListener('click', () => this.recalculateScores());
        document.getElementById('reloadUsers')?.addEventListener('click', () => this.loadUsers());
        document.getElementById('addNewUser')?.addEventListener('click', () => this.addNewUser());
        document.getElementById('exportBackup')?.addEventListener('click', () => this.exportBackup());
        document.getElementById('syncWithSheets')?.addEventListener('click', () => this.syncWithSheets());
        document.getElementById('manualSync')?.addEventListener('click', () => this.manualSync());
    }

    switchAdminTab(tabName, target) {
        document.querySelectorAll('.admin-tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
        const tab = document.getElementById('admin' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
        if (tab) { tab.classList.add('active'); }
        if (target) target.classList.add('active');
    }

    showNotification(message, type = 'info') {
        const el = document.createElement('div');
        el.className = type;
        el.textContent = message;
        el.style.cssText = 'position:fixed;top:20px;right:20px;z-index:2000;max-width:400px;';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 3000);
    }

    updateApiKey() {
        const key = document.getElementById('adminApiKey').value.trim();
        if (!key) return this.showNotification('Ingresa una API Key', 'error');
        saveToLocalStorage(CONFIG.STORAGE_KEYS.API_KEY, key);
        document.getElementById('adminApiKey').value = '';
        if (typeof initFootballAPI === 'function') initFootballAPI(key);
        this.showNotification('API Key guardada', 'success');
    }

    updateAppsScriptUrl() {
        const url = document.getElementById('appsScriptUrl').value.trim();
        if (!url) return this.showNotification('Ingresa la URL', 'error');
        saveToLocalStorage(CONFIG.STORAGE_KEYS.APPS_SCRIPT_URL, url);
        this.showNotification('URL de Apps Script guardada', 'success');
    }

    updateSheetId() {
        const id = document.getElementById('adminSheetId').value.trim();
        if (!id) return this.showNotification('Ingresa el Sheet ID', 'error');
        saveToLocalStorage(CONFIG.STORAGE_KEYS.SHEET_ID, id);
        this.showNotification('Sheet ID guardado', 'success');
    }

    updateAdminSecret() {
        const secret = document.getElementById('adminSecret').value.trim();
        if (!secret || secret.length < 6) return this.showNotification('Minimo 6 caracteres', 'error');
        saveToLocalStorage('porra_admin_secret', secret);
        document.getElementById('adminSecret').value = '';
        this.showNotification('Contrasena de admin actualizada', 'success');
    }

    showAppsScriptGuide() {
        document.getElementById('appsScriptModal').classList.add('active');
    }

    updateScoreConfig() {
        const config = {
            exactScore: parseInt(document.getElementById('exactScorePoints').value) || 3,
            winnerScore: parseInt(document.getElementById('winnerScorePoints').value) || 1,
            diffScore: parseInt(document.getElementById('diffScorePoints').value) || 1
        };
        saveToLocalStorage(CONFIG.STORAGE_KEYS.SCORE_CONFIG, config);
        this.showNotification('Puntuacion guardada', 'success');
    }

    recalculateScores() {
        if (!confirm('Recalcular puntuaciones?')) return;
        const savedConfig = getFromLocalStorage(CONFIG.STORAGE_KEYS.SCORE_CONFIG) || CONFIG.SCORE_CONFIG_DEFAULTS;
        const predictions = getFromLocalStorage(CONFIG.STORAGE_KEYS.PREDICTIONS) || {};
        const users = authManager?.getUsers() || [];

        const scores = {};
        users.forEach(u => { scores[u.username] = { total: 0, correct: 0 }; });

        const api = getFootballAPI();
        if (api) {
            api.getMatches().then(data => {
                const matches = data.matches || [];
                for (const [matchId, pred] of Object.entries(predictions)) {
                    const match = matches.find(m => m.id === Number(matchId) || m.id === matchId);
                    if (match && match.score?.fullTime?.home !== null && match.score?.fullTime?.home !== undefined) {
                        const rh = match.score.fullTime.home, ra = match.score.fullTime.away;
                        let pts = 0;
                        if (pred.goals1 === rh && pred.goals2 === ra) pts = savedConfig.exactScore;
                        else {
                            const pw = pred.goals1 > pred.goals2 ? 1 : (pred.goals1 < pred.goals2 ? 2 : 0);
                            const rw = rh > ra ? 1 : (rh < ra ? 2 : 0);
                            if (pw === rw) pts += savedConfig.winnerScore;
                            if (Math.abs(pred.goals1 - pred.goals2) === Math.abs(rh - ra)) pts += savedConfig.diffScore;
                        }
                        if (pts > 0) scores[pred.username || 'admin'].correct++;
                        scores[pred.username || 'admin'].total += pts;
                    }
                }
                saveToLocalStorage('porra_scores', scores);
                this.showNotification('Puntuaciones recalculadas', 'success');
            }).catch(() => {
                this.showNotification('Error al obtener resultados de la API', 'error');
            });
        } else {
            this.showNotification('Configura la API Key primero', 'error');
        }
    }

    loadUsers() {
        const container = document.getElementById('usersList');
        const users = authManager?.getUsersList() || [];
        if (users.length === 0) {
            container.innerHTML = '<div class="info-text">No hay usuarios. Crea el admin iniciando sesion.</div>';
            return;
        }
        let html = '<div class="user-items">';
        users.forEach(u => {
            html += `<div class="user-item"><div class="user-info"><strong>${u.username}</strong>${u.isAdmin ? '<span class="admin-badge">Admin</span>' : ''}</div><div class="user-actions">${u.isAdmin ? '' : `<button class="btn btn-danger btn-small" onclick="adminPanel.deleteUser('${u.username}')">Eliminar</button>`}</div></div>`;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    addNewUser() {
        const username = document.getElementById('newUserName').value.trim();
        const password = document.getElementById('newUserPassword').value.trim();
        if (!username || !password) return this.showNotification('Completa todos los campos', 'error');
        const result = authManager.addUser(username, password);
        if (result.success) {
            document.getElementById('newUserName').value = '';
            document.getElementById('newUserPassword').value = '';
            this.showNotification('Usuario agregado', 'success');
            this.loadUsers();
        } else {
            this.showNotification(result.message, 'error');
        }
    }

    deleteUser(username) {
        if (!confirm(`Eliminar a ${username}?`)) return;
        const result = authManager.removeUser(username);
        if (result.success) { this.showNotification('Usuario eliminado', 'success'); this.loadUsers(); }
        else { this.showNotification(result.message, 'error'); }
    }

    exportBackup() {
        const data = {};
        Object.values(CONFIG.STORAGE_KEYS).forEach(k => {
            const v = getFromLocalStorage(k);
            if (v) data[k] = v;
        });
        data.porra_scores = getFromLocalStorage('porra_scores');
        data.porra_admin_secret = getFromLocalStorage('porra_admin_secret');
        data.porra_local_admin = getFromLocalStorage('porra_local_admin');
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `porra-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        this.showNotification('Respaldo descargado', 'success');
    }

    syncWithSheets() {
        this.showNotification('Funcion disponible cuando configures Apps Script', 'info');
    }

    manualSync() {
        document.getElementById('syncStatus').textContent = 'Estado: Configura Apps Script para sincronizar';
    }
}

let adminPanel = null;
document.addEventListener('DOMContentLoaded', () => { adminPanel = new AdminPanel(); });
