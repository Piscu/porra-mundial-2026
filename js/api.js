// Clase para manejar la API de football-data.org
class FootballDataAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = CONFIG.API_BASE_URL;
        this.cache = new Map();
    }

    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    // Obtener headers para la petición
    getHeaders() {
        return {
            'X-Auth-Token': this.apiKey,
            'Content-Type': 'application/json'
        };
    }

    // Obtener datos con caché
    async fetchWithCache(apiPath, forceRefresh = false) {
        const cacheKey = apiPath;
        if (!forceRefresh && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
                return cached.data;
            }
        }

        try {
            const appsScriptUrl = getFromLocalStorage(CONFIG.STORAGE_KEYS.APPS_SCRIPT_URL);
            let data;

            if (appsScriptUrl) {
                const baseUrl = appsScriptUrl.replace(/\/exec\/?$/, '/exec');
                const body = JSON.stringify({ function: 'handleApiProxy', params: { endpoint: apiPath } });
                const response = await fetch(baseUrl, {
                    method: 'POST',
                    body: body
                });
                if (!response.ok) throw new Error(`Error ${response.status}`);
                data = await response.json();
                if (data && data.error) throw new Error(data.error);
            } else {
                const proxyUrl = getFromLocalStorage(CONFIG.STORAGE_KEYS.CORS_PROXY);
                const fullUrl = proxyUrl
                    ? proxyUrl + (proxyUrl.includes('?') ? '&' : '?') + 'url=' + encodeURIComponent(this.baseUrl + '/' + apiPath)
                    : this.baseUrl + '/' + apiPath;
                const response = await fetch(fullUrl, { headers: this.getHeaders() });
                if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
                data = await response.json();
                if (data && data.contents) {
                    try { data = JSON.parse(data.contents); } catch (e) { }
                }
            }

            this.cache.set(cacheKey, { data: data, timestamp: Date.now() });
            return data;
        } catch (error) {
            console.error('Error en API:', error);
            throw error;
        }
    }

    // Obtener todos los partidos del mundial 2026
    async getMatches() {
        const path = 'competitions/WC/matches';
        return this.fetchWithCache(path);
    }

    // Obtener información de un partido específico
    async getMatch(matchId) {
        const path = `matches/${matchId}`;
        return this.fetchWithCache(path);
    }

    // Obtener información de la competición
    async getCompetition() {
        const path = 'competitions/WC';
        return this.fetchWithCache(path);
    }

    // Obtener tabla de posiciones
    async getStandings() {
        const path = 'competitions/WC/standings';
        return this.fetchWithCache(path);
    }

    // Obtener equipos participantes
    async getTeams() {
        const path = 'competitions/WC/teams';
        return this.fetchWithCache(path);
    }

    // Limpiar caché
    clearCache() {
        this.cache.clear();
    }

    // Obtener caché
    getCache() {
        return this.cache;
    }
}

// Instancia global de la API
let footballAPI = null;

// Inicializar API
function initFootballAPI(apiKey) {
    footballAPI = new FootballDataAPI(apiKey);
    return footballAPI;
}

// Obtener la instancia de la API
function getFootballAPI() {
    if (!footballAPI) {
        const apiKey = getFromLocalStorage(CONFIG.STORAGE_KEYS.API_KEY);
        if (apiKey) {
            footballAPI = initFootballAPI(apiKey);
        }
    }
    return footballAPI;
}
