const CONFIG = {
    COMPETITIONS: { 'WC': 'FIFA World Cup' },
    API_BASE_URL: 'https://api.football-data.org/v4',
    STORAGE_KEYS: {
        CURRENT_USER: 'porra_current_user',
        SESSION_TOKEN: 'porra_session_token',
        API_KEY: 'porra_api_key',
        SHEET_ID: 'porra_sheet_id',
        APPS_SCRIPT_URL: 'porra_apps_script_url',
        PREDICTIONS: 'porra_predictions',
        MATCHES_CACHE: 'porra_matches_cache',
        STANDINGS_CACHE: 'porra_standings_cache',
        SCORE_CONFIG: 'porra_score_config',
        USERS: 'porra_users'
    },
    CACHE_DURATION: 5 * 60 * 1000,
    DEFAULT_ADMIN: { username: 'admin', password: 'admin123' },
    SCORE_CONFIG_DEFAULTS: { exactScore: 3, winnerScore: 1, diffScore: 1 },
    FLAGS: {
        'Argentina': '🇦🇷', 'Brazil': '🇧🇷', 'France': '🇫🇷', 'Germany': '🇩🇪',
        'Spain': '🇪🇸', 'England': '🇬🇧', 'Italy': '🇮🇹', 'Netherlands': '🇳🇱',
        'Belgium': '🇧🇪', 'Portugal': '🇵🇹', 'Mexico': '🇲🇽', 'Canada': '🇨🇦',
        'United States': '🇺🇸', 'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'Australia': '🇦🇺',
        'Saudi Arabia': '🇸🇦', 'Qatar': '🇶🇦', 'UAE': '🇦🇪', 'Uruguay': '🇺🇾',
        'Paraguay': '🇵🇾', 'Chile': '🇨🇱', 'Colombia': '🇨🇴', 'Peru': '🇵🇪',
        'Greece': '🇬🇷', 'Hungary': '🇭🇺', 'Poland': '🇵🇱', 'Serbia': '🇷🇸',
        'Turkey': '🇹🇷', 'Iran': '🇮🇷', 'Ghana': '🇬🇭', 'Senegal': '🇸🇳',
        'Morocco': '🇲🇦', 'Tunisia': '🇹🇳', 'Egypt': '🇪🇬', 'Costa Rica': '🇨🇷',
        'Panama': '🇵🇦', 'Honduras': '🇭🇳', 'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
        'Switzerland': '🇨🇭', 'Austria': '🇦🇹', 'Czech Republic': '🇨🇿', 'Czechia': '🇨🇿',
        'Croatia': '🇭🇷', 'Slovenia': '🇸🇮', 'Slovakia': '🇸🇰', 'Romania': '🇷🇴',
        'Bulgaria': '🇧🇬', 'Norway': '🇳🇴', 'Sweden': '🇸🇪', 'Finland': '🇫🇮',
        'Denmark': '🇩🇰', 'Iceland': '🇮🇸', 'Ivory Coast': '🇨🇮', 'Mali': '🇲🇱',
        'Cameroon': '🇨🇲', 'Nigeria': '🇳🇬', 'Zambia': '🇿🇲', 'South Africa': '🇿🇦',
        'New Zealand': '🇳🇿', 'Vietnam': '🇻🇳', 'Thailand': '🇹🇭', 'Indonesia': '🇮🇩',
        'Malaysia': '🇲🇾'
    }
};

function getFlag(countryName) {
    return CONFIG.FLAGS[countryName] || '⚽';
}

function saveToLocalStorage(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (error) { console.error('Error guardando en localStorage:', error); return false; }
}

function getFromLocalStorage(key) {
    try {
        const value = localStorage.getItem(key);
        if (!value) return null;
        try { return JSON.parse(value); } catch (e) { return value; }
    } catch (error) { return null; }
}

function clearLocalStorage() {
    try { Object.values(CONFIG.STORAGE_KEYS).forEach(k => localStorage.removeItem(k)); return true; }
    catch (error) { return false; }
}

function exportData() {
    const data = {};
    Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
        const value = getFromLocalStorage(key);
        if (value) data[key] = value;
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `porra-datos-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}
