// Backend API - Comunicación con Google Apps Script
class BackendAPI {
    constructor(appsScriptUrl) {
        this.appsScriptUrl = appsScriptUrl;
        this.headers = {
            'Content-Type': 'application/json'
        };
    }

    setAppsScriptUrl(url) {
        this.appsScriptUrl = url;
        saveToLocalStorage(CONFIG.STORAGE_KEYS.APPS_SCRIPT_URL, url);
    }

    getLocalAdminCredentials() {
        const stored = getFromLocalStorage('porra_local_admin');
        return stored || { username: 'admin', password: 'admin123' };
    }

    setLocalAdminCredentials(username, password) {
        saveToLocalStorage('porra_local_admin', { username, password });
    }

    async call(functionName, params = {}) {
        if (!this.appsScriptUrl) {
            return this.callLocal(functionName, params);
        }

        try {
            const response = await fetch(this.appsScriptUrl, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    function: functionName,
                    params: params,
                    token: getFromLocalStorage(CONFIG.STORAGE_KEYS.SESSION_TOKEN)
                })
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.error) {
                throw new Error(result.error);
            }

            return result;
        } catch (error) {
            console.error('Error en Backend API:', error);
            throw error;
        }
    }

    callLocal(functionName, params = {}) {
        switch (functionName) {
            case 'validateUser': {
                const admin = this.getLocalAdminCredentials();
                if (params.username === admin.username && params.password === admin.password) {
                    return { success: true, userId: 1, username: admin.username, isAdmin: true, token: Utilities?.getUuid?.() || 'local-token-' + Date.now() };
                }
                return { success: false, message: 'Usuario o contrasena incorrectos' };
            }
            case 'changeUserPassword': {
                const admin = this.getLocalAdminCredentials();
                if (params.username === admin.username && params.currentPassword === admin.password) {
                    this.setLocalAdminCredentials(params.username, params.newPassword);
                    return { success: true, message: 'Contrasena cambiada correctamente' };
                }
                return { success: false, message: 'Contrasena actual incorrecta' };
            }
            case 'savePrediction': {
                let preds = getFromLocalStorage(CONFIG.STORAGE_KEYS.PREDICTIONS) || {};
                preds[params.matchId] = { matchId: params.matchId, homeTeam: params.homeTeam, awayTeam: params.awayTeam, goals1: params.goals1, goals2: params.goals2, timestamp: new Date().toISOString() };
                saveToLocalStorage(CONFIG.STORAGE_KEYS.PREDICTIONS, preds);
                return { success: true };
            }
            case 'getPredictions': {
                const preds = getFromLocalStorage(CONFIG.STORAGE_KEYS.PREDICTIONS) || {};
                const userPreds = Object.values(preds).filter(p => p.username === params.username || !p.username);
                return { success: true, predictions: userPreds };
            }
            case 'getAllPredictions': {
                const preds = getFromLocalStorage(CONFIG.STORAGE_KEYS.PREDICTIONS) || {};
                return { success: true, predictions: Object.values(preds) };
            }
            case 'getScores': {
                return { success: true, scores: [{ username: params.username || 'admin', totalPoints: 0, correctPredictions: 0 }] };
            }
            case 'getUsers': {
                const admin = this.getLocalAdminCredentials();
                return { success: true, users: [{ username: admin.username, isAdmin: true }] };
            }
            default:
                return { success: true };
        }
    }

    // Autenticación
    async validateUser(username, password) {
        return this.call('validateUser', { username, password });
    }

    async changeUserPassword(username, currentPassword, newPassword) {
        return this.call('changeUserPassword', { username, currentPassword, newPassword });
    }

    // Predicciones
    async savePrediction(matchId, homeTeam, awayTeam, goals1, goals2) {
        const username = authManager?.currentUser?.username || getFromLocalStorage(CONFIG.STORAGE_KEYS.CURRENT_USER)?.username || '';
        return this.call('savePrediction', {
            username,
            matchId,
            homeTeam,
            awayTeam,
            goals1,
            goals2
        });
    }

    async getPredictions(username) {
        return this.call('getPredictions', { username });
    }

    async getAllPredictions() {
        return this.call('getAllPredictions', {});
    }

    // Puntuaciones
    async getScores() {
        return this.call('getScores', {});
    }

    async updateScoreConfig(exactScore, winnerScore, diffScore) {
        return this.call('updateScoreConfig', {
            exactScore,
            winnerScore,
            diffScore
        });
    }

    async recalculateScores() {
        return this.call('recalculateScores', {});
    }

    // Usuarios
    async getUsers() {
        return this.call('getUsers', {});
    }

    async addUser(username, password) {
        return this.call('addUser', { username, password });
    }

    async removeUser(username) {
        return this.call('removeUser', { username });
    }

    // API Configuration
    async updateApiKey(apiKey) {
        return this.call('updateApiKey', { apiKey });
    }

    async getApiKey() {
        return this.call('getApiKey', {});
    }

    // Admin
    async updateAdminSecret(newSecret) {
        return this.call('updateAdminSecret', { newSecret });
    }

    // Sincronización
    async syncWithSheets() {
        return this.call('syncWithSheets', {});
    }

    async getStatus() {
        return this.call('getStatus', {});
    }
}

// Instancia global del Backend API
let backendAPI = null;

// Inicializar Backend API
function initBackendAPI(appsScriptUrl) {
    backendAPI = new BackendAPI(appsScriptUrl);
    return backendAPI;
}

// Obtener la instancia del Backend API
function getBackendAPI() {
    if (!backendAPI) {
        const url = getFromLocalStorage(CONFIG.STORAGE_KEYS.APPS_SCRIPT_URL);
        if (url) {
            backendAPI = initBackendAPI(url);
        }
    }
    return backendAPI;
}

// Inicializar cuando se carga la configuración
document.addEventListener('DOMContentLoaded', () => {
    const savedUrl = getFromLocalStorage(CONFIG.STORAGE_KEYS.APPS_SCRIPT_URL);
    if (savedUrl) {
        initBackendAPI(savedUrl);
    }
});
