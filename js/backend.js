class BackendAPI {
    constructor(appsScriptUrl) {
        this.appsScriptUrl = appsScriptUrl;
    }

    async call(functionName, params = {}) {
        if (!this.appsScriptUrl) throw new Error('Apps Script URL no configurado');
        var bodyObj = {}; bodyObj["function"] = functionName; bodyObj.params = params; bodyObj.token = getFromLocalStorage(CONFIG.STORAGE_KEYS.SESSION_TOKEN);
        const response = await fetch(this.appsScriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyObj)
        });
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        return result;
    }

    async validateUser(username, password) { return this.call('validateUser', { username, password }); }
    async changeUserPassword(username, currentPassword, newPassword) { return this.call('changeUserPassword', { username, currentPassword, newPassword }); }
    async savePrediction(matchId, homeTeam, awayTeam, goals1, goals2) { return this.call('savePrediction', { username: authManager?.currentUser?.username, matchId, homeTeam, awayTeam, goals1, goals2 }); }
    async getPredictions(username) { return this.call('getPredictions', { username }); }
    async getAllPredictions() { return this.call('getAllPredictions', {}); }
    async getScores() { return this.call('getScores', {}); }
    async updateScoreConfig(exactScore, winnerScore, diffScore) { return this.call('updateScoreConfig', { exactScore, winnerScore, diffScore }); }
    async recalculateScores() { return this.call('recalculateScores', {}); }
    async getUsers() { return this.call('getUsers', {}); }
    async addUser(username, password) { return this.call('addUser', { username, password }); }
    async removeUser(username) { return this.call('removeUser', { username }); }
    async updateApiKey(apiKey) { return this.call('updateApiKey', { apiKey }); }
    async getApiKey() { return this.call('getApiKey', {}); }
    async updateAdminSecret(newSecret) { return this.call('updateAdminSecret', { newSecret }); }
    async syncWithSheets() { return this.call('syncWithSheets', {}); }
    async getStatus() { return this.call('getStatus', {}); }
}

let backendAPI = null;

function initBackendAPI(appsScriptUrl) {
    backendAPI = new BackendAPI(appsScriptUrl);
    return backendAPI;
}

function getBackendAPI() {
    if (!backendAPI) {
        const url = getFromLocalStorage(CONFIG.STORAGE_KEYS.APPS_SCRIPT_URL);
        if (url) backendAPI = initBackendAPI(url);
    }
    return backendAPI;
}

document.addEventListener('DOMContentLoaded', () => {
    const savedUrl = getFromLocalStorage(CONFIG.STORAGE_KEYS.APPS_SCRIPT_URL);
    if (savedUrl) initBackendAPI(savedUrl);
});
