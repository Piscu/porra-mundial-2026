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

    getRequestUrl(apiPath) {
        const appsScriptUrl = getFromLocalStorage(CONFIG.STORAGE_KEYS.APPS_SCRIPT_URL);
        if (appsScriptUrl) {
            const baseUrl = appsScriptUrl.replace(/\/exec\/?$/, '/exec');
            return `${baseUrl}?path=proxy&endpoint=${encodeURIComponent(apiPath)}`;
        }
        const proxyUrl = getFromLocalStorage(CONFIG.STORAGE_KEYS.CORS_PROXY);
        if (proxyUrl) {
            const fullUrl = this.baseUrl + '/' + apiPath;
            const sep = proxyUrl.includes('?') ? '&' : '?';
            return `${proxyUrl}${sep}url=${encodeURIComponent(fullUrl)}`;
        }
        return this.baseUrl + '/' + apiPath;
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

        const requestUrl = this.getRequestUrl(apiPath);

        try {
            const appsScriptUrl = getFromLocalStorage(CONFIG.STORAGE_KEYS.APPS_SCRIPT_URL);
            const fetchOptions = appsScriptUrl ? {} : { headers: this.getHeaders() };
            const response = await fetch(requestUrl, fetchOptions);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            let data = await response.json();
            if (data && data.contents) {
                try { data = JSON.parse(data.contents); } catch (e) { /* raw response */ }
            }
            
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });

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
