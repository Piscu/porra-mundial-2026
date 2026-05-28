# 🔧 Guía de Configuración del Backend con Google Apps Script

Este documento explica cómo configurar el backend de tu aplicación Porra Mundial 2026 usando Google Apps Script y Google Sheets.

## ¿Por qué Google Apps Script?

Google Apps Script es ideal para esta aplicación porque:
- ✅ Es completamente gratuito
- ✅ Se integra perfectamente con Google Sheets
- ✅ Puede manejar autenticación de usuarios
- ✅ Funciona como intermediario entre la aplicación y Google Sheets
- ✅ No requiere un servidor separado

## 📋 Paso 1: Crear la estructura en Google Sheets

### Crear el Spreadsheet principal

1. Ve a [Google Drive](https://drive.google.com/)
2. Crea una carpeta llamada "Porra Mundial 2026"
3. Dentro, crea un nuevo Google Sheet llamado "Datos Porra 2026"

### Crear las hojas necesarias

Tu spreadsheet debe tener estas hojas (tabs):

#### 1. **Hoja: "Usuarios"**
Columnas:
- A: Username (texto)
- B: Password (texto encriptado)
- C: IsAdmin (VERDADERO/FALSO)
- D: CreatedAt (fecha)

Ejemplo:
```
Username      | Password          | IsAdmin | CreatedAt
admin         | [encriptado]      | TRUE    | 2026-05-28
jugador1      | [encriptado]      | FALSE   | 2026-05-28
jugador2      | [encriptado]      | FALSE   | 2026-05-28
```

#### 2. **Hoja: "Predicciones"**
Columnas:
- A: Username (texto)
- B: MatchId (número)
- C: HomeTeam (texto)
- D: AwayTeam (texto)
- E: Goals1 (número)
- F: Goals2 (número)
- G: Timestamp (fecha/hora)

#### 3. **Hoja: "Puntuaciones"**
Columnas:
- A: Username (texto)
- B: TotalPoints (número)
- C: CorrectPredictions (número)
- D: LastUpdated (fecha)

#### 4. **Hoja: "Configuración"**
Columnas:
- A: Key (texto)
- B: Value (texto)

Valores iniciales:
```
Key                    | Value
api_key                | [tu API key de football-data.org]
score_exact_points     | 3
score_winner_points    | 1
score_diff_points      | 1
admin_secret           | cambiar_esto
```

## 🔑 Paso 2: Crear el Google Apps Script

### Acceder a Google Apps Script

1. Abre tu Spreadsheet de "Datos Porra 2026"
2. Ve a **Herramientas** → **Editor de secuencias de comandos**
3. Se abrirá Google Apps Script en una nueva pestaña

### Crear el código

Borra el código por defecto y copia el siguiente código:

```javascript
// ============================================
// PORRA MUNDIAL 2026 - GOOGLE APPS SCRIPT
// Backend para la aplicación de predicciones
// ============================================

const SHEET_NAME = "Datos Porra 2026";
const SHEET_ID = "TU_SHEET_ID_AQUI"; // Reemplaza con tu ID

// Obtener la hoja de cálculo
function getSpreadsheet() {
  return SpreadsheetApp.openById(SHEET_ID);
}

// ============================================
// AUTENTICACIÓN
// ============================================

function validateUser(params) {
  const { username, password } = params;
  
  try {
    const sheet = getSpreadsheet().getSheetByName("Usuarios");
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === username && data[i][1] === password) {
        return {
          success: true,
          userId: i,
          username: username,
          isAdmin: data[i][2] === true,
          token: Utilities.getUuid()
        };
      }
    }
    
    return { success: false, message: "Usuario o contraseña incorrectos" };
  } catch (error) {
    return { error: error.toString() };
  }
}

function changeUserPassword(params) {
  const { username, currentPassword, newPassword } = params;
  
  try {
    const sheet = getSpreadsheet().getSheetByName("Usuarios");
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === username && data[i][1] === currentPassword) {
        sheet.getRange(i + 1, 2).setValue(newPassword);
        return { success: true, message: "Contraseña cambiada correctamente" };
      }
    }
    
    return { success: false, message: "Contraseña actual incorrecta" };
  } catch (error) {
    return { error: error.toString() };
  }
}

// ============================================
// PREDICCIONES
// ============================================

function savePrediction(params) {
  const { matchId, homeTeam, awayTeam, goals1, goals2 } = params;
  const username = Session.getActiveUser().getEmail();
  
  try {
    const sheet = getSpreadsheet().getSheetByName("Predicciones");
    sheet.appendRow([username, matchId, homeTeam, awayTeam, goals1, goals2, new Date()]);
    return { success: true };
  } catch (error) {
    return { error: error.toString() };
  }
}

function getPredictions(params) {
  const { username } = params;
  
  try {
    const sheet = getSpreadsheet().getSheetByName("Predicciones");
    const data = sheet.getDataRange().getValues();
    const predictions = [];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === username) {
        predictions.push({
          matchId: data[i][1],
          homeTeam: data[i][2],
          awayTeam: data[i][3],
          goals1: data[i][4],
          goals2: data[i][5]
        });
      }
    }
    
    return { success: true, predictions: predictions };
  } catch (error) {
    return { error: error.toString() };
  }
}

// ============================================
// PUNTUACIONES
// ============================================

function getScores() {
  try {
    const sheet = getSpreadsheet().getSheetByName("Puntuaciones");
    const data = sheet.getDataRange().getValues();
    const scores = [];
    
    for (let i = 1; i < data.length; i++) {
      scores.push({
        username: data[i][0],
        totalPoints: data[i][1],
        correctPredictions: data[i][2]
      });
    }
    
    return { success: true, scores: scores };
  } catch (error) {
    return { error: error.toString() };
  }
}

function updateScoreConfig(params) {
  const { exactScore, winnerScore, diffScore } = params;
  
  try {
    const sheet = getSpreadsheet().getSheetByName("Configuración");
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === "score_exact_points") {
        sheet.getRange(i + 1, 2).setValue(exactScore);
      }
      if (data[i][0] === "score_winner_points") {
        sheet.getRange(i + 1, 2).setValue(winnerScore);
      }
      if (data[i][0] === "score_diff_points") {
        sheet.getRange(i + 1, 2).setValue(diffScore);
      }
    }
    
    return { success: true };
  } catch (error) {
    return { error: error.toString() };
  }
}

// ============================================
// USUARIOS (Admin)
// ============================================

function getUsers() {
  try {
    const sheet = getSpreadsheet().getSheetByName("Usuarios");
    const data = sheet.getDataRange().getValues();
    const users = [];
    
    for (let i = 1; i < data.length; i++) {
      users.push({
        username: data[i][0],
        isAdmin: data[i][2]
      });
    }
    
    return { success: true, users: users };
  } catch (error) {
    return { error: error.toString() };
  }
}

function addUser(params) {
  const { username, password } = params;
  
  try {
    const sheet = getSpreadsheet().getSheetByName("Usuarios");
    sheet.appendRow([username, password, false, new Date()]);
    return { success: true };
  } catch (error) {
    return { error: error.toString() };
  }
}

function removeUser(params) {
  const { username } = params;
  
  try {
    const sheet = getSpreadsheet().getSheetByName("Usuarios");
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === username) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }
    
    return { success: false, message: "Usuario no encontrado" };
  } catch (error) {
    return { error: error.toString() };
  }
}

// ============================================
// CONFIGURACIÓN
// ============================================

function updateApiKey(params) {
  const { apiKey } = params;
  
  try {
    const sheet = getSpreadsheet().getSheetByName("Configuración");
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === "api_key") {
        sheet.getRange(i + 1, 2).setValue(apiKey);
        return { success: true };
      }
    }
  } catch (error) {
    return { error: error.toString() };
  }
}

function getApiKey() {
  try {
    const sheet = getSpreadsheet().getSheetByName("Configuración");
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === "api_key") {
        return { success: true, apiKey: data[i][1] };
      }
    }
  } catch (error) {
    return { error: error.toString() };
  }
}

// ============================================
// ENDPOINT PRINCIPAL (doPost)
// ============================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const functionName = data.function;
    const params = data.params || {};
    
    // Validar que la función existe
    if (typeof window[functionName] === 'function') {
      const result = window[functionName](params);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ error: "Función no encontrada" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 🚀 Paso 3: Desplegar el Apps Script

1. En el editor de Apps Script, haz clic en **Desplegar** (Deploy)
2. Selecciona **Nuevo despliegue** (New Deployment)
3. En "Tipo de despliegue" (Deployment type), selecciona **Aplicación web** (Web app)
4. Configura:
   - **Ejecutar como**: Tu cuenta de Google
   - **Quién tiene acceso**: Cualquiera
5. Haz clic en **Desplegar** (Deploy)
6. Copia la URL de despliegue (algo como: `https://script.google.com/macros/d/...`)

## ⚙️ Paso 4: Configurar tu aplicación

1. En la pestaña "⚙️ Admin" de tu app, ve a **Configuración General**
2. Pega la URL del Apps Script en "Google Apps Script URL"
3. Actualiza tu API Key de football-data.org
4. Guarda los cambios

## 🔒 Seguridad (Importante)

**⚠️ NOTA IMPORTANTE:** 
- No compartas nunca tu `SHEET_ID` públicamente
- Este sistema es básico. Para producción, considera:
  - Encriptar contraseñas
  - Usar OAuth2
  - Validar tokens
  - Añadir rate limiting

## 🐛 Solución de problemas

### "Error al conectar con Google Apps Script"
- Verifica que la URL sea correcta
- Asegúrate de que el Apps Script esté desplegado
- Intenta actualizar la página

### "Error de autenticación"
- Verifica el nombre de usuario y contraseña
- Asegúrate de que el usuario existe en la hoja "Usuarios"

### "Las predicciones no se guardan"
- Verifica que la hoja "Predicciones" existe
- Comprueba que tienes permisos para editar el Sheet

## 📚 Funciones disponibles

El Apps Script proporciona estas funciones:

| Función | Parámetros | Descripción |
|---------|-----------|-------------|
| `validateUser` | username, password | Autenticar usuario |
| `changeUserPassword` | username, currentPassword, newPassword | Cambiar contraseña |
| `savePrediction` | matchId, homeTeam, awayTeam, goals1, goals2 | Guardar predicción |
| `getPredictions` | username | Obtener predicciones del usuario |
| `getScores` | - | Obtener puntuaciones |
| `updateScoreConfig` | exactScore, winnerScore, diffScore | Actualizar configuración |
| `getUsers` | - | Listar todos los usuarios |
| `addUser` | username, password | Agregar nuevo usuario |
| `removeUser` | username | Eliminar usuario |
| `updateApiKey` | apiKey | Actualizar API Key |
| `getApiKey` | - | Obtener API Key |

---

¡Tu backend está listo! Ahora puedes usar la aplicación con autenticación de usuarios. 🎉
