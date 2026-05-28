# Porra Mundial 2026 - Configuración

Este archivo contiene información importante para el desarrollo y configuración del proyecto.

## Pasos completados

✅ Estructura del proyecto creada
✅ HTML principal con login y panel admin
✅ Estilos CSS completados (login, admin, responsive)
✅ Sistema de autenticación de usuarios
✅ Integración con football-data.org API
✅ Integración con Google Apps Script como backend
✅ Integración con Google Sheets
✅ Sistema de interfaz de usuario mejorado
✅ Lógica de predicciones sincronizada
✅ Panel de administrador funcional
✅ Clasificación general de participantes
✅ Sistema de login y sesiones
✅ GitHub Actions para deploy

## Próximos pasos

1. Configurar Google Sheets:
   ```
   - Crear 4 hojas: Usuarios, Predicciones, Puntuaciones, Configuración
   - Agregar usuarios iniciales en la hoja "Usuarios"
   - Configurar valores iniciales en "Configuración"
   ```

2. Crear Google Apps Script (ver GOOGLE_APPS_SCRIPT_SETUP.md):
   ```
   - Copiar el código del Apps Script
   - Desplegar como aplicación web
   - Obtener URL de deployment
   ```

3. Inicializar repositorio Git:
   ```bash
   cd d:\PorraMundial
   git init
   git add .
   git commit -m "Initial commit: Porra Mundial 2026 with Authentication"
   ```

4. Crear repositorio en GitHub y push:
   ```bash
   git remote add origin https://github.com/tunombre/porra-mundial-2026.git
   git branch -M main
   git push -u origin main
   ```

5. Configurar GitHub Pages:
   - Ve a Settings → Pages
   - Selecciona "Deploy from a branch"
   - Rama: main
   - Guardar

6. Configurar la app:
   - Abre la aplicación en el navegador
   - Primera vez: login con credenciales de admin
   - Ve a Admin → Configuración General
   - Pega API Key de football-data.org
   - Pega URL del Google Apps Script
   - Actualiza Sheet ID

7. Crear cuentas para amigos:
   - Admin → Usuarios → Agregar Nuevo Participante
   - Dale a cada amigo su nombre y contraseña

8. ¡A hacer porras!

## Estructura de archivos

- `index.html` - Página principal con login y app
- `css/styles.css` - Estilos (login, admin, responsive)
- `js/config.js` - Configuración general
- `js/auth.js` - Sistema de autenticación
- `js/api.js` - Integración con football-data.org
- `js/backend.js` - Integración con Google Apps Script
- `js/sheets.js` - Integración con Google Sheets
- `js/admin.js` - Lógica del panel admin
- `js/ui.js` - Lógica de interfaz de usuario
- `js/app.js` - Lógica principal
- `README.md` - Documentación completa
- `GOOGLE_APPS_SCRIPT_SETUP.md` - Guía para configurar el backend
- `INICIO_RAPIDO.txt` - Guía de inicio rápido
- `.github/workflows/deploy.yml` - GitHub Actions para deploy automático

## Variables de entorno

No se requieren variables de entorno. La aplicación usa:
- localStorage para datos locales
- Google Sheets como base de datos
- Google Apps Script como backend serverless

## Notas importantes

- La aplicación es completamente estática (se aloja en GitHub Pages)
- El backend está en Google Apps Script (sin servidor dedicado)
- Los datos se guardan en Google Sheets
- Las contraseñas de usuarios se almacenan en el Google Sheet
- Considera encriptar contraseñas para producción
- El admin es el único con acceso a la configuración del sistema

## Arquitectura

Frontend (GitHub Pages) → Google Apps Script (Backend) → Google Sheets (Base de datos)
                     ↓
              football-data.org (API de partidos)

## Seguridad

⚠️ Para producción, considerar:
- Encriptar contraseñas en Google Sheets
- Usar OAuth2 para autenticación
- Validar tokens JWT
- Rate limiting en Google Apps Script
- HTTPS (incluido automáticamente en GitHub Pages)

