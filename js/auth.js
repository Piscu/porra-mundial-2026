class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.setupEventListeners();
        this.checkSession();
    }

    setupEventListeners() {
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
    }

    getUsers() {
        return getFromLocalStorage(CONFIG.STORAGE_KEYS.USERS) || [];
    }

    saveUsers(users) {
        saveToLocalStorage(CONFIG.STORAGE_KEYS.USERS, users);
    }

    ensureAdminUser() {
        const users = this.getUsers();
        const hasAdmin = users.some(u => u.isAdmin);
        if (!hasAdmin) {
            users.push({ username: CONFIG.DEFAULT_ADMIN.username, password: CONFIG.DEFAULT_ADMIN.password, isAdmin: true });
            this.saveUsers(users);
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        this.ensureAdminUser();
        const users = this.getUsers();
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            this.currentUser = { username: user.username, isAdmin: user.isAdmin || false };
            this.isAdmin = user.isAdmin || false;
            saveToLocalStorage(CONFIG.STORAGE_KEYS.CURRENT_USER, this.currentUser);
            saveToLocalStorage(CONFIG.STORAGE_KEYS.SESSION_TOKEN, 'token-' + Date.now());
            this.showApp();
        } else {
            errorDiv.textContent = 'Usuario o contrasena incorrectos';
            errorDiv.style.display = 'block';
        }
    }

    checkSession() {
        const saved = getFromLocalStorage(CONFIG.STORAGE_KEYS.CURRENT_USER);
        if (saved) {
            this.currentUser = saved;
            this.isAdmin = saved.isAdmin || false;
            this.showApp();
        }
    }

    showApp() {
        document.getElementById('loginScreen')?.classList.remove('active');
        document.getElementById('appScreen').style.display = 'block';

        document.querySelectorAll('.admin-only').forEach(btn => {
            btn.style.display = this.isAdmin ? 'inline-block' : 'none';
        });

        if (this.currentUser) {
            document.getElementById('currentUser').textContent = this.currentUser.username;
            document.getElementById('profileUsername').textContent = this.currentUser.username;
        }
    }

    logout() {
        if (!confirm('¿Estas seguro de que quieres cerrar sesion?')) return;
        localStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.SESSION_TOKEN);
        this.currentUser = null;
        this.isAdmin = false;
        document.getElementById('loginScreen')?.classList.add('active');
        document.getElementById('appScreen').style.display = 'none';
        document.getElementById('loginForm').reset();
        document.getElementById('loginError').style.display = 'none';
    }

    changeUserPassword(username, currentPassword, newPassword) {
        const users = this.getUsers();
        const user = users.find(u => u.username === username && u.password === currentPassword);
        if (!user) return { success: false, message: 'Contrasena actual incorrecta' };
        if (newPassword.length < 6) return { success: false, message: 'La contrasena debe tener al menos 6 caracteres' };
        user.password = newPassword;
        this.saveUsers(users);
        return { success: true, message: 'Contrasena cambiada correctamente' };
    }

    addUser(username, password) {
        const users = this.getUsers();
        if (users.some(u => u.username === username)) return { success: false, message: 'El usuario ya existe' };
        users.push({ username, password, isAdmin: false });
        this.saveUsers(users);
        return { success: true };
    }

    removeUser(username) {
        let users = this.getUsers();
        const idx = users.findIndex(u => u.username === username);
        if (idx === -1) return { success: false, message: 'Usuario no encontrado' };
        if (users[idx].isAdmin) return { success: false, message: 'No puedes eliminar al admin' };
        users.splice(idx, 1);
        this.saveUsers(users);
        return { success: true };
    }

    getUsersList() {
        return this.getUsers().map(u => ({ username: u.username, isAdmin: u.isAdmin }));
    }

    getCurrentUser() { return this.currentUser; }
    isUserAdmin() { return this.isAdmin; }
}

let authManager = null;
document.addEventListener('DOMContentLoaded', () => { authManager = new AuthManager(); });
