// Sistema de Autenticación
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.setupEventListeners();
        this.checkSession();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');
        
        try {
            let api = null;
            if (typeof getBackendAPI === 'function') {
                api = getBackendAPI();
            }
            api = api || window.backendAPI || (typeof backendAPI !== 'undefined' ? backendAPI : null);

            if (!api) {
                if (typeof BackendAPI !== 'undefined') {
                    api = new BackendAPI('');
                    window.backendAPI = api;
                } else {
                    throw new Error('backendAPI no inicializado');
                }
            }

            const response = await api.validateUser(username, password);
            
            if (response.success) {
                this.currentUser = {
                    username: username,
                    id: response.userId,
                    isAdmin: response.isAdmin
                };
                
                this.isAdmin = response.isAdmin;
                
                // Guardar sesión
                saveToLocalStorage(CONFIG.STORAGE_KEYS.CURRENT_USER, this.currentUser);
                saveToLocalStorage(CONFIG.STORAGE_KEYS.SESSION_TOKEN, response.token);
                
                // Mostrar aplicación
                this.showApp();
            } else {
                errorDiv.textContent = response.message || 'Usuario o contraseña incorrectos';
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Error en login:', error);
            errorDiv.textContent = 'Error al conectar con el servidor: ' + error.message;
            errorDiv.style.display = 'block';
        }
    }

    checkSession() {
        const savedUser = getFromLocalStorage(CONFIG.STORAGE_KEYS.CURRENT_USER);
        const savedToken = getFromLocalStorage(CONFIG.STORAGE_KEYS.SESSION_TOKEN);
        
        if (savedUser && savedToken) {
            this.currentUser = savedUser;
            this.isAdmin = savedUser.isAdmin;
            this.showApp();
        }
    }

    showApp() {
        const loginScreen = document.getElementById('loginScreen');
        const appScreen = document.getElementById('appScreen');
        
        if (loginScreen) loginScreen.classList.remove('active');
        if (appScreen) appScreen.style.display = 'block';
        
        // Mostrar/Ocultar tab de admin
        const adminButtons = document.querySelectorAll('.admin-only');
        adminButtons.forEach(btn => {
            btn.style.display = this.isAdmin ? 'inline-block' : 'none';
        });
        
        // Mostrar nombre de usuario
        if (this.currentUser) {
            const userSpan = document.getElementById('currentUser');
            if (userSpan) {
                userSpan.textContent = this.currentUser.username;
            }
            
            const profileUsername = document.getElementById('profileUsername');
            if (profileUsername) {
                profileUsername.textContent = this.currentUser.username;
            }
        }
    }

    logout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            localStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
            localStorage.removeItem(CONFIG.STORAGE_KEYS.SESSION_TOKEN);
            
            this.currentUser = null;
            this.isAdmin = false;
            
            const loginScreen = document.getElementById('loginScreen');
            const appScreen = document.getElementById('appScreen');
            
            if (loginScreen) loginScreen.classList.add('active');
            if (appScreen) appScreen.style.display = 'none';
            
            // Limpiar formulario
            document.getElementById('loginForm').reset();
            document.getElementById('loginError').style.display = 'none';
        }
    }

    changePassword(currentPassword, newPassword, confirmPassword) {
        if (newPassword !== confirmPassword) {
            return { success: false, message: 'Las contraseñas no coinciden' };
        }
        
        if (newPassword.length < 6) {
            return { success: false, message: 'La contraseña debe tener al menos 6 caracteres' };
        }
        
        return { success: true, message: 'Contraseña cambiada correctamente' };
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isUserAdmin() {
        return this.isAdmin;
    }
}

// Instancia global del gestor de autenticación
let authManager = null;

// Inicializar autenticación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
});
