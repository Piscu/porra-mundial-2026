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

    async call(functionName, params = {}) {
        if (!this.appsScriptUrl) {
            throw new Error('Apps Script URL no configurado');
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

    // Autenticación
    async validateUser(username, password) {
        return this.call('validateUser', { username, password });
    }

    async changeUserPassword(username, currentPassword, newPassword) {
        return this.call('changeUserPassword', { username, currentPassword, newPassword });
    }

    // Predicciones
    async savePrediction(matchId, homeTeam, awayTeam, goals1, goals2) {
        return this.call('savePrediction', {
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
