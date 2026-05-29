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

    getRequestUrl(url) {
        const proxyUrl = getFromLocalStorage(CONFIG.STORAGE_KEYS.CORS_PROXY);
        if (proxyUrl) {
            const sep = proxyUrl.includes('?') ? '&' : '?';
            return `${proxyUrl}${sep}url=${encodeURIComponent(url)}`;
        }
        return url;
    }

    // Obtener datos con caché
    async fetchWithCache(url, forceRefresh = false) {
        if (!forceRefresh && this.cache.has(url)) {
            const cached = this.cache.get(url);
            if (Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
                return cached.data;
            }
        }

        const requestUrl = this.getRequestUrl(url);

        try {
            const response = await fetch(requestUrl, { headers: this.getHeaders() });
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            let data = await response.json();
            if (data && data.contents) {
                try { data = JSON.parse(data.contents); } catch (e) { /* raw response */ }
            }
            
            // Guardar en caché
            this.cache.set(url, {
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
        const url = `${this.baseUrl}/competitions/WC/matches`;
        return this.fetchWithCache(url);
    }

    // Obtener información de un partido específico
    async getMatch(matchId) {
        const url = `${this.baseUrl}/matches/${matchId}`;
        return this.fetchWithCache(url);
    }

    // Obtener información de la competición
    async getCompetition() {
        const url = `${this.baseUrl}/competitions/WC`;
        return this.fetchWithCache(url);
    }

    // Obtener tabla de posiciones
    async getStandings() {
        const url = `${this.baseUrl}/competitions/WC/standings`;
        return this.fetchWithCache(url);
    }

    // Obtener equipos participantes
    async getTeams() {
        const url = `${this.baseUrl}/competitions/WC/teams`;
        return this.fetchWithCache(url);
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
