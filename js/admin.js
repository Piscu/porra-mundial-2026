// Panel de Administrador
class AdminPanel {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Tabs del admin
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchAdminTab(e.target.dataset.adminTab));
        });

        // Configuración General
        document.getElementById('updateApiKey')?.addEventListener('click', () => this.updateApiKey());
        document.getElementById('updateAppsScriptUrl')?.addEventListener('click', () => this.updateAppsScriptUrl());
        document.getElementById('updateSheetId')?.addEventListener('click', () => this.updateSheetId());
        document.getElementById('updateAdminSecret')?.addEventListener('click', () => this.updateAdminSecret());
        document.getElementById('appsScriptGuide')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showAppsScriptGuide();
        });

        // Puntuaciones
        document.getElementById('updateScoreConfig')?.addEventListener('click', () => this.updateScoreConfig());
        document.getElementById('recalculateScores')?.addEventListener('click', () => this.recalculateScores());

        // Usuarios
        document.getElementById('reloadUsers')?.addEventListener('click', () => this.loadUsers());
        document.getElementById('addNewUser')?.addEventListener('click', () => this.addNewUser());

        // Respaldo
        document.getElementById('exportBackup')?.addEventListener('click', () => this.exportBackup());
        document.getElementById('syncWithSheets')?.addEventListener('click', () => this.syncWithSheets());
        document.getElementById('manualSync')?.addEventListener('click', () => this.manualSync());
    }

    switchAdminTab(tabName) {
        // Ocultar todos los tabs
        document.querySelectorAll('.admin-tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Desactivar todos los botones
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Mostrar tab seleccionado
        const tab = document.getElementById('admin' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
        if (tab) {
            tab.classList.add('active');
            event.target.classList.add('active');
        }
    }

    // Configuración General
    async updateApiKey() {
        const apiKey = document.getElementById('adminApiKey').value.trim();
        
        if (!apiKey) {
            uiManager.showNotification('Por favor, ingresa una API Key', 'error');
            return;
        }

        try {
            const result = await backendAPI.updateApiKey(apiKey);
            
            if (result.success) {
                document.getElementById('adminApiKey').value = '';
                uiManager.showNotification('API Key actualizada correctamente', 'success');
            } else {
                uiManager.showNotification(result.message || 'Error al actualizar API Key', 'error');
            }
        } catch (error) {
            uiManager.showNotification('Error: ' + error.message, 'error');
        }
    }

    async updateAppsScriptUrl() {
        const url = document.getElementById('appsScriptUrl').value.trim();
        
        if (!url) {
            uiManager.showNotification('Por favor, ingresa la URL del Apps Script', 'error');
            return;
        }

        backendAPI.setAppsScriptUrl(url);
        uiManager.showNotification('URL del Apps Script actualizada', 'success');
    }

    async updateSheetId() {
        const sheetId = document.getElementById('adminSheetId').value.trim();
        
        if (!sheetId) {
            uiManager.showNotification('Por favor, ingresa el Sheet ID', 'error');
            return;
        }

        saveToLocalStorage(CONFIG.STORAGE_KEYS.SHEET_ID, sheetId);
        uiManager.showNotification('Sheet ID actualizado', 'success');
    }

    async updateAdminSecret() {
        const secret = document.getElementById('adminSecret').value.trim();
        
        if (!secret || secret.length < 6) {
            uiManager.showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        try {
            const result = await backendAPI.updateAdminSecret(secret);
            
            if (result.success) {
                document.getElementById('adminSecret').value = '';
                uiManager.showNotification('Contraseña de admin actualizada', 'success');
            } else {
                uiManager.showNotification(result.message || 'Error al actualizar contraseña', 'error');
            }
        } catch (error) {
            uiManager.showNotification('Error: ' + error.message, 'error');
        }
    }

    showAppsScriptGuide() {
        const modal = document.getElementById('appsScriptModal');
        const codeBlock = document.getElementById('codeBlock');
        
        codeBlock.textContent = this.getAppsScriptTemplate();
        
        modal.classList.add('active');
    }

    getAppsScriptTemplate() {
        return `function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const functionName = data.function;
  const params = data.params;
  
  try {
    const result = window[functionName](params);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function validateUser(params) {
  const { username, password } = params;
  // Implementar validación con Google Sheets
  // ...
  return { success: true, userId: 1, isAdmin: false, token: 'token' };
}

// Más funciones aquí...`;
    }

    // Puntuaciones
    async updateScoreConfig() {
        const exactScore = parseInt(document.getElementById('exactScorePoints').value) || 0;
        const winnerScore = parseInt(document.getElementById('winnerScorePoints').value) || 0;
        const diffScore = parseInt(document.getElementById('diffScorePoints').value) || 0;

        try {
            const result = await backendAPI.updateScoreConfig(exactScore, winnerScore, diffScore);
            
            if (result.success) {
                uiManager.showNotification('Configuración de puntos guardada', 'success');
            } else {
                uiManager.showNotification(result.message || 'Error al guardar', 'error');
            }
        } catch (error) {
            uiManager.showNotification('Error: ' + error.message, 'error');
        }
    }

    async recalculateScores() {
        if (!confirm('¿Estás seguro de que quieres recalcular todas las puntuaciones?')) {
            return;
        }

        try {
            const result = await backendAPI.recalculateScores();
            
            if (result.success) {
                uiManager.showNotification('Puntuaciones recalculadas correctamente', 'success');
            } else {
                uiManager.showNotification(result.message || 'Error al recalcular', 'error');
            }
        } catch (error) {
            uiManager.showNotification('Error: ' + error.message, 'error');
        }
    }

    // Usuarios
    async loadUsers() {
        const container = document.getElementById('usersList');
        container.innerHTML = '<div class="loading">Cargando usuarios...</div>';

        try {
            const result = await backendAPI.getUsers();
            
            if (result.success && result.users) {
                let html = '<div class="user-items">';
                
                result.users.forEach(user => {
                    html += `
                        <div class="user-item">
                            <div class="user-info">
                                <strong>${user.username}</strong>
                                ${user.isAdmin ? '<span class="admin-badge">Admin</span>' : ''}
                            </div>
                            <div class="user-actions">
                                <button class="btn btn-danger btn-small" onclick="adminPanel.deleteUser('${user.username}')">Eliminar</button>
                            </div>
                        </div>
                    `;
                });
                
                html += '</div>';
                container.innerHTML = html;
            } else {
                container.innerHTML = '<div class="error">Error al cargar usuarios</div>';
            }
        } catch (error) {
            container.innerHTML = '<div class="error">Error: ' + error.message + '</div>';
        }
    }

    async addNewUser() {
        const username = document.getElementById('newUserName').value.trim();
        const password = document.getElementById('newUserPassword').value.trim();

        if (!username || !password) {
            uiManager.showNotification('Por favor, ingresa nombre y contraseña', 'error');
            return;
        }

        try {
            const result = await backendAPI.addUser(username, password);
            
            if (result.success) {
                document.getElementById('newUserName').value = '';
                document.getElementById('newUserPassword').value = '';
                uiManager.showNotification('Participante agregado correctamente', 'success');
                this.loadUsers();
            } else {
                uiManager.showNotification(result.message || 'Error al agregar participante', 'error');
            }
        } catch (error) {
            uiManager.showNotification('Error: ' + error.message, 'error');
        }
    }

    async deleteUser(username) {
        if (!confirm(`¿Estás seguro de que quieres eliminar a ${username}?`)) {
            return;
        }

        try {
            const result = await backendAPI.removeUser(username);
            
            if (result.success) {
                uiManager.showNotification('Participante eliminado', 'success');
                this.loadUsers();
            } else {
                uiManager.showNotification(result.message || 'Error al eliminar', 'error');
            }
        } catch (error) {
            uiManager.showNotification('Error: ' + error.message, 'error');
        }
    }

    // Respaldo
    async exportBackup() {
        try {
            const predictions = getFromLocalStorage(CONFIG.STORAGE_KEYS.PREDICTIONS) || {};
            const data = {
                timestamp: new Date().toISOString(),
                predictions: predictions,
                user: authManager.getCurrentUser()
            };

            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `porra-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            uiManager.showNotification('Respaldo descargado', 'success');
        } catch (error) {
            uiManager.showNotification('Error: ' + error.message, 'error');
        }
    }

    async syncWithSheets() {
        try {
            const result = await backendAPI.syncWithSheets();
            
            if (result.success) {
                uiManager.showNotification('Sincronización completada', 'success');
            } else {
                uiManager.showNotification(result.message || 'Error en sincronización', 'error');
            }
        } catch (error) {
            uiManager.showNotification('Error: ' + error.message, 'error');
        }
    }

    async manualSync() {
        try {
            const status = document.getElementById('syncStatus');
            status.textContent = 'Estado: Sincronizando...';
            
            const result = await backendAPI.syncWithSheets();
            
            if (result.success) {
                status.textContent = 'Estado: Sincronización completada ✅';
            } else {
                status.textContent = 'Estado: Error en sincronización ❌';
            }
        } catch (error) {
            document.getElementById('syncStatus').textContent = 'Estado: Error - ' + error.message;
        }
    }
}

// Instancia global del panel admin
let adminPanel = null;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});
