# ⚽ Porra Mundial 2026

Una aplicación web para hacer porras del mundial de fútbol 2026 con tus amigos. Alojada en GitHub Pages, con autenticación de usuarios, integrada con Google Sheets como backend y la API de football-data.org para los datos de partidos en tiempo real.

## 🚀 Características

- **Sistema de Login**: Cada amigo tiene su propia cuenta y contraseña
- **Partidos en tiempo real**: Calendario completo del mundial 2026 con scores actualizados
- **Predicciones seguras**: Haz tus predicciones y sigue tu progreso
- **Tabla de posiciones**: Sigue la clasificación de todos los grupos
- **Clasificación General**: Ve la tabla de puntuaciones de todos los participantes
- **Panel de Admin**: Control total sobre la configuración, usuarios y puntuaciones
- **Base de datos en Google Sheets**: Almacenamiento seguro y sincronizado
- **Sistema de puntuación automático**: Cálculo de puntos basado en aciertos
- **Google Apps Script Backend**: Backend serverless completamente gratuito

## 📋 Requisitos previos

1. **Cuenta de GitHub** - para alojar la página
2. **Cuenta de Google** - para Google Sheets y Google Apps Script
3. **API Key de football-data.org** - gratuita en https://www.football-data.org/

## 🔧 Configuración Completa

### Paso 1: Obtener API Key de football-data.org

1. Ve a https://www.football-data.org/
2. Haz clic en "Sign Up" (es gratuito)
3. Verifica tu email
4. Copia tu API Key desde tu perfil

### Paso 2: Configurar Google Sheets y Google Apps Script

**IMPORTANTE**: Lee la guía completa en [GOOGLE_APPS_SCRIPT_SETUP.md](GOOGLE_APPS_SCRIPT_SETUP.md)

En resumen:
1. Crear un Google Sheet con las hojas necesarias (Usuarios, Predicciones, Puntuaciones, Configuración)
2. Crear un Google Apps Script que sirva como backend
3. Copiar la URL de deployment del Apps Script

### Paso 3: Alojar en GitHub Pages

1. Crea un nuevo repositorio en GitHub llamado `porra-mundial-2026`
2. Marca la opción "Add a README file"
3. Clona el repositorio en tu computadora
4. Copia todos los archivos de esta carpeta al repositorio clonado
5. Commit y push:
   ```bash
   git add .
   git commit -m "Initial commit: Porra Mundial 2026"
   git push origin main
   ```
6. Ve a Settings → Pages
7. En "Build and deployment", selecciona:
   - Source: Deploy from a branch
   - Branch: main
8. ¡Tu página estará disponible en `https://tunombre.github.io/porra-mundial-2026/`

### Paso 4: Primera configuración en la app

1. Abre la aplicación en tu navegador
2. **Primeiro login**: Usa las credenciales de admin (configúralas en el Google Sheet)
3. Ve al panel **Admin** (solo visible para admin)
4. **Configuración General**:
   - Actualiza la **API Key de football-data.org**
   - Pega la **URL del Google Apps Script**
   - Actualiza el **Google Sheet ID**
5. **Usuarios**: Crea cuentas para todos tus amigos

## 💻 Uso de la aplicación

### Panel de Usuario (Participantes)

1. **Partidos**: Ver los próximos partidos, filtrar por fase o estado, hacer predicciones
2. **Clasificación**: Ver la tabla de posiciones del mundial
3. **Clasificación General**: Ver el ranking de puntuaciones de todos los participantes
4. **Configuración**: Cambiar contraseña y exportar datos

### Panel de Admin (Solo para ti)

1. **Configuración General**:
   - Administrar API Key
   - Configurar Google Apps Script
   - Cambiar contraseña de admin

2. **Puntuaciones**:
   - Ajustar el sistema de puntuación
   - Recalcular puntos

3. **Usuarios**:
   - Ver lista de participantes
   - Agregar nuevos usuarios
   - Eliminar usuarios

4. **Respaldo**:
   - Sincronizar con Google Sheets
   - Exportar datos de respaldo

## 🎯 Sistema de puntuación

La puntuación se calcula así (valores por defecto, ajustables por el admin):

- **Resultado exacto**: 3 puntos (ej: predice 2-1 y es 2-1)
- **Ganador/Empate correcto**: 1 punto (ej: predice 2-1 y es 3-1)
- **Diferencia de goles correcta**: 1 punto extra (ej: predice 2-0 y es 3-1, ambos tienen diferencia de 1)

Puntuación máxima por partido: 3 puntos

## 🏗️ Arquitectura

### Frontend (GitHub Pages)
- HTML5, CSS3, JavaScript Vanilla
- Interfaz responsive
- Login seguro

### Backend (Google Apps Script)
- Autenticación de usuarios
- Gestión de predicciones
- Cálculo de puntuaciones
- API para frontend

### Base de datos (Google Sheets)
- Almacenamiento de usuarios
- Predicciones de todos los participantes
- Puntuaciones
- Configuración del sistema

### APIs externas
- **football-data.org**: Datos de partidos en tiempo real

## 🔒 Privacidad y seguridad

- **Contraseñas**: Se guardan en Google Sheets (considera encriptarlas para producción)
- **API Key**: Manejada únicamente por el admin, no se envía al cliente
- **Datos**: Sincronizados de forma segura a través de Google Apps Script
- **GitHub Pages**: Hosting estático, sin acceso a datos sensibles

## 📁 Estructura del proyecto

```
porra-mundial-2026/
├── index.html                      # Página principal
├── README.md                       # Este archivo
├── GOOGLE_APPS_SCRIPT_SETUP.md    # Guía de configuración del backend
├── INICIO_RAPIDO.txt              # Guía rápida
├── .gitignore                     # Archivos a ignorar
├── css/
│   └── styles.css                 # Estilos
├── js/
│   ├── config.js                  # Configuración general
│   ├── auth.js                    # Sistema de autenticación
│   ├── api.js                     # Integración con football-data.org
│   ├── backend.js                 # Integración con Google Apps Script
│   ├── sheets.js                  # Integración con Google Sheets
│   ├── admin.js                   # Lógica del panel admin
│   ├── ui.js                      # Lógica de interfaz
│   └── app.js                     # Lógica principal
├── img/                           # Carpeta para imágenes
└── .github/
    ├── copilot-instructions.md
    └── workflows/
        └── deploy.yml             # GitHub Actions
```

## 🚀 Despliegue y actualización

### Desplegar cambios

```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
```

GitHub Pages se actualiza automáticamente en pocos minutos.

## 🐛 Solución de problemas

### "Error de autenticación"
- Verifica que el usuario existe en el Google Sheet
- Revisa la contraseña

### "No aparecen los partidos"
- Verifica que la API Key sea correcta
- Revisa tu conexión a internet
- Intenta refrescar la página

### "Error al conectar con Google Apps Script"
- Verifica que la URL del Apps Script sea correcta
- Asegúrate de que esté desplegado
- Revisa que tengas permisos en el Google Sheet

### "Las puntuaciones no se actualizan"
- Haz clic en "Sincronizar Ahora" desde el panel Admin
- Recalcula las puntuaciones desde Admin → Puntuaciones

## 📊 Características avanzadas (Próximas)

- Encriptación de contraseñas
- Notificaciones de partidos próximos
- Sistema de ligas privadas
- Historial detallado de predicciones
- Exportación de reportes
- Tema oscuro

## 🤝 Contribuir

¿Tienes ideas para mejorar? ¡Siéntete libre de sugerir cambios!

## 📝 Licencia

Este proyecto es de código abierto bajo la licencia MIT.

## 🙏 Créditos

- **Datos de partidos**: [football-data.org](https://www.football-data.org/)
- **Alojamiento**: [GitHub Pages](https://pages.github.com/)
- **Backend**: [Google Apps Script](https://script.google.com/)
- **Base de datos**: [Google Sheets](https://sheets.google.com/)

---

**¡Que disfrutes la porra del Mundial 2026!** ⚽🏆

Para configurar el backend con Google Apps Script, lee [GOOGLE_APPS_SCRIPT_SETUP.md](GOOGLE_APPS_SCRIPT_SETUP.md)

