// Aplicación principal
class PorraApp {
    constructor() {
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            // Cargar configuración guardada
            const savedApiKey = getFromLocalStorage(CONFIG.STORAGE_KEYS.API_KEY);
            const savedSheetId = getFromLocalStorage(CONFIG.STORAGE_KEYS.SHEET_ID);
            const savedAppsScriptUrl = getFromLocalStorage(CONFIG.STORAGE_KEYS.APPS_SCRIPT_URL);

            // Inicializar Backend API (usa initBackendAPI si está disponible)
            if (typeof initBackendAPI === 'function') {
                if (savedAppsScriptUrl) {
                    initBackendAPI(savedAppsScriptUrl);
                } else {
                    initBackendAPI('');
                }

                // Exponer también en window por compatibilidad
                if (typeof backendAPI !== 'undefined') {
                    window.backendAPI = backendAPI;
                }
            } else {
                // Fallback: crear instancia en window
                if (savedAppsScriptUrl) {
                    window.backendAPI = new BackendAPI(savedAppsScriptUrl);
                } else {
                    window.backendAPI = new BackendAPI('');
                }
            }

            if (savedApiKey) {
                initFootballAPI(savedApiKey);
            }

            if (savedSheetId) {
                initGoogleSheets(savedSheetId);
            }

            // Inicializar AuthManager si no existe
            if (!window.authManager) {
                window.authManager = new AuthManager();
            }

            this.initialized = true;
            console.log('Aplicación inicializada correctamente');
        } catch (error) {
            console.error('Error inicializando aplicación:', error);
        }
    }
}

// Crear instancia de la aplicación
const app = new PorraApp();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Manejar errores globales
window.addEventListener('error', (event) => {
    console.error('Error global:', event.error);
});

// Manejar rechazos de promesas no capturadas
window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesa rechazada no capturada:', event.reason);
});
