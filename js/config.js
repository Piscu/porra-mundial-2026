const CONFIG = {
    COMPETITIONS: { 'WC': 'FIFA World Cup' },
    API_BASE_URL: 'https://api.football-data.org/v4',
    STORAGE_KEYS: {
        CURRENT_USER: 'porra_current_user', SESSION_TOKEN: 'porra_session_token',
        API_KEY: 'porra_api_key', SHEET_ID: 'porra_sheet_id',
        APPS_SCRIPT_URL: 'porra_apps_script_url', PREDICTIONS: 'porra_predictions',
        MATCHES_CACHE: 'porra_matches_cache', STANDINGS_CACHE: 'porra_standings_cache',
        SCORE_CONFIG: 'porra_score_config', USERS: 'porra_users'
    },
    CACHE_DURATION: 5 * 60 * 1000,
    DEFAULT_ADMIN: { username: 'admin', password: 'admin123' },
    SCORE_CONFIG_DEFAULTS: { exactScore: 3, winnerScore: 1, diffScore: 1 },
    STAGE_NAMES: {
        'GROUP_STAGE': 'Fase de Grupos', 'ROUND_16': 'Octavos', 'QUARTER_FINALS': 'Cuartos',
        'SEMI_FINALS': 'Semifinales', 'FINAL': 'Final', 'THIRD_PLACE': '3er Puesto',
        'PLAYOFF': 'Playoff', 'PRELIMINARY_ROUND': 'Ronda Preliminar',
        'QUALIFICATION': 'Clasificacion', 'QUALIFYING': 'Clasificacion'
    },
    COUNTRY_CODES: {
        'Argentina': 'ar', 'Brazil': 'br', 'France': 'fr', 'Germany': 'de',
        'Spain': 'es', 'England': 'gb-eng', 'Italy': 'it', 'Netherlands': 'nl',
        'Belgium': 'be', 'Portugal': 'pt', 'Mexico': 'mx', 'Canada': 'ca',
        'United States': 'us', 'Japan': 'jp', 'South Korea': 'kr', 'Australia': 'au',
        'Saudi Arabia': 'sa', 'Qatar': 'qa', 'UAE': 'ae', 'Uruguay': 'uy',
        'Paraguay': 'py', 'Chile': 'cl', 'Colombia': 'co', 'Peru': 'pe',
        'Greece': 'gr', 'Hungary': 'hu', 'Poland': 'pl', 'Serbia': 'rs',
        'Turkey': 'tr', 'Iran': 'ir', 'Ghana': 'gh', 'Senegal': 'sn',
        'Morocco': 'ma', 'Tunisia': 'tn', 'Egypt': 'eg', 'Costa Rica': 'cr',
        'Panama': 'pa', 'Honduras': 'hn', 'Wales': 'gb-wls', 'Scotland': 'gb-sct',
        'Switzerland': 'ch', 'Austria': 'at', 'Czech Republic': 'cz', 'Czechia': 'cz',
        'Croatia': 'hr', 'Slovenia': 'si', 'Slovakia': 'sk', 'Romania': 'ro',
        'Bulgaria': 'bg', 'Norway': 'no', 'Sweden': 'se', 'Finland': 'fi',
        'Denmark': 'dk', 'Iceland': 'is', 'Ivory Coast': 'ci', 'Mali': 'ml',
        'Cameroon': 'cm', 'Nigeria': 'ng', 'Zambia': 'zm', 'South Africa': 'za',
        'New Zealand': 'nz', 'Vietnam': 'vn', 'Thailand': 'th', 'Indonesia': 'id',
        'Malaysia': 'my', 'China': 'cn', 'India': 'in', 'Russia': 'ru',
        'Ukraine': 'ua', 'Republic of Ireland': 'ie', 'Northern Ireland': 'gb-nir',
        'Bosnia and Herzegovina': 'ba', 'Montenegro': 'me', 'Albania': 'al',
        'North Macedonia': 'mk', 'Kosovo': 'xk', 'Luxembourg': 'lu',
        'Lithuania': 'lt', 'Latvia': 'lv', 'Estonia': 'ee', 'Georgia': 'ge',
        'Armenia': 'am', 'Azerbaijan': 'az', 'Kazakhstan': 'kz', 'Israel': 'il',
        'Cyprus': 'cy', 'Malta': 'mt', 'Moldova': 'md', 'Belarus': 'by',
        'Iraq': 'iq', 'Jordan': 'jo', 'Lebanon': 'lb', 'Syria': 'sy',
        'Palestine': 'ps', 'Bahrain': 'bh', 'Kuwait': 'kw', 'Oman': 'om',
        'Yemen': 'ye', 'Uzbekistan': 'uz', 'Turkmenistan': 'tm', 'Kyrgyzstan': 'kg',
        'Tajikistan': 'tj', 'North Korea': 'kp', 'Hong Kong': 'hk', 'Taiwan': 'tw',
        'Singapore': 'sg', 'Philippines': 'ph', 'Myanmar': 'mm', 'Cambodia': 'kh',
        'Laos': 'la', 'Mongolia': 'mn', 'Nepal': 'np', 'Bhutan': 'bt',
        'Bangladesh': 'bd', 'Sri Lanka': 'lk', 'Maldives': 'mv',
        'Algeria': 'dz', 'Libya': 'ly', 'Sudan': 'sd', 'South Sudan': 'ss',
        'Eritrea': 'er', 'Ethiopia': 'et', 'Somalia': 'so', 'Djibouti': 'dj',
        'Kenya': 'ke', 'Uganda': 'ug', 'Tanzania': 'tz', 'Rwanda': 'rw',
        'Burundi': 'bi', 'Democratic Republic of the Congo': 'cd', 'Congo': 'cg',
        'Gabon': 'ga', 'Equatorial Guinea': 'gq', 'Angola': 'ao', 'Namibia': 'na',
        'Botswana': 'bw', 'Zimbabwe': 'zw', 'Mozambique': 'mz', 'Malawi': 'mw',
        'Madagascar': 'mg', 'Comoros': 'km', 'Mauritius': 'mu', 'Seychelles': 'sc',
        'Cabo Verde': 'cv', 'Guinea': 'gn', 'Guinea-Bissau': 'gw', 'Sierra Leone': 'sl',
        'Liberia': 'lr', 'Togo': 'tg', 'Benin': 'bj', 'Burkina Faso': 'bf',
        'Niger': 'ne', 'Chad': 'td', 'Central African Republic': 'cf',
        'Sao Tome and Principe': 'st', 'Mauritania': 'mr', 'The Gambia': 'gm',
        'Bolivia': 'bo', 'Ecuador': 'ec', 'Venezuela': 've', 'Guyana': 'gy',
        'Suriname': 'sr', 'Trinidad and Tobago': 'tt', 'Jamaica': 'jm',
        'Cuba': 'cu', 'Haiti': 'ht', 'Dominican Republic': 'do', 'Puerto Rico': 'pr',
        'El Salvador': 'sv', 'Guatemala': 'gt', 'Nicaragua': 'ni', 'Belize': 'bz',
        'Bahamas': 'bs', 'Barbados': 'bb', 'Saint Lucia': 'lc', 'Grenada': 'gd',
        'Saint Vincent and the Grenadines': 'vc', 'Antigua and Barbuda': 'ag',
        'Dominica': 'dm', 'Saint Kitts and Nevis': 'kn', 'Tahiti': 'pf',
        'New Caledonia': 'nc', 'Fiji': 'fj', 'Papua New Guinea': 'pg',
        'Solomon Islands': 'sb', 'Vanuatu': 'vu', 'Samoa': 'ws', 'Tonga': 'to',
        'French Guiana': 'gf', 'Guadeloupe': 'gp', 'Martinique': 'mq',
        'Montserrat': 'ms', 'Turks and Caicos Islands': 'tc',
        'British Virgin Islands': 'vg', 'Cayman Islands': 'ky', 'Bermuda': 'bm',
        'Aruba': 'aw', 'Curaçao': 'cw', 'Sint Maarten': 'sx', 'Bonaire': 'bq',
        'USA': 'us', 'Korea Republic': 'kr', 'Korea DPR': 'kp',
        'England': 'gb-eng', 'Scotland': 'gb-sct', 'Wales': 'gb-wls',
        'Northern Ireland': 'gb-nir', 'China PR': 'cn', 'IR Iran': 'ir',
        'Côte d\'Ivoire': 'ci', 'DR Congo': 'cd', 'São Tomé e Príncipe': 'st',
        'East Timor': 'tl', 'Turkiye': 'tr', 'FYR Macedonia': 'mk',
        'Czech Republic': 'cz', 'Eswatini': 'sz', 'Swaziland': 'sz',
        'Cape Verde': 'cv', 'Holy See': 'va', 'Korea Republic': 'kr',
        'Ivory Coast': 'ci', 'Chinese Taipei': 'tw', 'Macau': 'mo',
        'Brunei Darussalam': 'bn', 'Afghanistan': 'af', 'Pakistan': 'pk',
        'Palau': 'pw', 'Marshall Islands': 'mh', 'Micronesia': 'fm',
        'Nauru': 'nr', 'Tuvalu': 'tv', 'Cook Islands': 'ck',
        'Kiribati': 'ki', 'Western Samoa': 'ws', 'American Samoa': 'as',
        'Guam': 'gu', 'Northern Mariana Islands': 'mp', 'Anguilla': 'ai',
        'Faroe Islands': 'fo', 'Gibraltar': 'gi', 'Liechtenstein': 'li',
        'Monaco': 'mc', 'San Marino': 'sm', 'Andorra': 'ad',
        'Soviet Union': 'su', 'Yugoslavia': 'yu', 'Czechoslovakia': 'cs',
        'East Germany': 'dd', 'West Germany': 'de', 'Zaire': 'cd',
        'Netherlands Antilles': 'an', 'Dutch Guiana': 'sr'
    }
};

function getFlag(countryName, size = 28) {
    const code = CONFIG.COUNTRY_CODES[countryName];
    if (code) return `<img src="https://flagcdn.com/${size}x${Math.round(size*0.75)}/${code}.png" alt="${countryName}" class="flag-img" width="${size}" height="${Math.round(size*0.75)}" loading="lazy">`;
    return `<span class="flag-emoji">⚽</span>`;
}

function getStageName(stage) {
    return CONFIG.STAGE_NAMES[stage] || stage || 'Desconocido';
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
