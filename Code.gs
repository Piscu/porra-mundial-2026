const SHEET_ID = "1BOW8VS-wH9xBKNpBmBYWU_X8CaVPYTJfcHyN_EkurR4";

function getSheet(name) {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(name);
}

function handleApiProxy(params) {
  try {
    const endpoint = params.endpoint || "";
    const apiKey = getApiKeyFromSheet();
    if (!apiKey) throw new Error("API Key no configurada en el Sheet");
    const url = "https://api.football-data.org/v4/" + endpoint;
    const response = UrlFetchApp.fetch(url, { headers: { "X-Auth-Token": apiKey }, muteHttpExceptions: true });
    return JSON.parse(response.getContentText());
  } catch (error) {
    return { error: error.toString() };
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const fn = data.function;
    const params = data.params || {};
    if (typeof this[fn] === "function") {
      const result = this[fn](params);
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ error: "Funcion no encontrada" })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function validateUser(params) {
  const { username, password } = params;
  const sheet = getSheet("Usuarios");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === username.toLowerCase() && String(data[i][1]) === password) {
      return { success: true, userId: i, username: data[i][0], isAdmin: String(data[i][2]).toUpperCase() === "TRUE" || data[i][2] === true, token: Utilities.getUuid() };
    }
  }
  return { success: false, message: "Usuario o contrasena incorrectos" };
}

function changeUserPassword(params) {
  const { username, currentPassword, newPassword } = params;
  const sheet = getSheet("Usuarios");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === username.toLowerCase() && String(data[i][1]) === currentPassword) {
      sheet.getRange(i + 1, 2).setValue(newPassword);
      return { success: true, message: "Contrasena cambiada correctamente" };
    }
  }
  return { success: false, message: "Contrasena actual incorrecta" };
}

function savePrediction(params) {
  const { username, matchId, homeTeam, awayTeam, goals1, goals2 } = params;
  const sheet = getSheet("Predicciones");
  sheet.appendRow([username, Number(matchId), homeTeam, awayTeam, Number(goals1), Number(goals2), new Date()]);
  return { success: true };
}

function getPredictions(params) {
  const { username } = params;
  const sheet = getSheet("Predicciones");
  const data = sheet.getDataRange().getValues();
  const predictions = [];
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === username.toLowerCase()) {
      predictions.push({ matchId: data[i][1], homeTeam: data[i][2], awayTeam: data[i][3], goals1: data[i][4], goals2: data[i][5] });
    }
  }
  return { success: true, predictions: predictions };
}

function getAllPredictions(params) {
  const sheet = getSheet("Predicciones");
  const data = sheet.getDataRange().getValues();
  const predictions = [];
  for (let i = 1; i < data.length; i++) {
    predictions.push({ username: data[i][0], matchId: data[i][1], homeTeam: data[i][2], awayTeam: data[i][3], goals1: data[i][4], goals2: data[i][5] });
  }
  return { success: true, predictions: predictions };
}

function getScores() {
  const sheet = getSheet("Puntuaciones");
  const data = sheet.getDataRange().getValues();
  const scores = [];
  for (let i = 1; i < data.length; i++) {
    scores.push({ username: data[i][0], totalPoints: Number(data[i][1]) || 0, correctPredictions: Number(data[i][2]) || 0 });
  }
  return { success: true, scores: scores };
}

function updateScoreConfig(params) {
  const { exactScore, winnerScore, diffScore } = params;
  const sheet = getSheet("Configuracion");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === "score_exact_points") sheet.getRange(i + 1, 2).setValue(Number(exactScore));
    if (data[i][0] === "score_winner_points") sheet.getRange(i + 1, 2).setValue(Number(winnerScore));
    if (data[i][0] === "score_diff_points") sheet.getRange(i + 1, 2).setValue(Number(diffScore));
  }
  return { success: true };
}

function recalculateScores() {
  const configSheet = getSheet("Configuracion");
  const configData = configSheet.getDataRange().getValues();
  let exactPoints = 3, winnerPoints = 1, diffPoints = 1;
  for (let i = 1; i < configData.length; i++) {
    if (configData[i][0] === "score_exact_points") exactPoints = Number(configData[i][1]) || 3;
    if (configData[i][0] === "score_winner_points") winnerPoints = Number(configData[i][1]) || 1;
    if (configData[i][0] === "score_diff_points") diffPoints = Number(configData[i][1]) || 1;
  }

  const usersSheet = getSheet("Usuarios");
  const users = usersSheet.getDataRange().getValues();
  const predSheet = getSheet("Predicciones");
  const preds = predSheet.getDataRange().getValues();
  const scoresSheet = getSheet("Puntuaciones");

  const userScores = {};
  for (let i = 1; i < users.length; i++) {
    userScores[users[i][0]] = { total: 0, correct: 0 };
  }

  const predsByUser = {};
  for (let i = 1; i < preds.length; i++) {
    const u = preds[i][0];
    if (!predsByUser[u]) predsByUser[u] = [];
    predsByUser[u].push({ matchId: preds[i][1], homeTeam: preds[i][2], awayTeam: preds[i][3], goals1: Number(preds[i][4]), goals2: Number(preds[i][5]) });
  }

  const apiKey = getApiKeyFromSheet();
  if (apiKey) {
    try {
      const url = "https://api.football-data.org/v4/competitions/WC/matches";
      const response = UrlFetchApp.fetch(url, { headers: { "X-Auth-Token": apiKey } });
      const matchesData = JSON.parse(response.getContentText());
      const matches = matchesData.matches || [];

      for (const user in predsByUser) {
        let total = 0, correctCount = 0;
        for (const pred of predsByUser[user]) {
          const match = matches.find(m => m.id === pred.matchId || (m.homeTeam.name === pred.homeTeam && m.awayTeam.name === pred.awayTeam));
          if (match && match.score && match.score.fullTime && match.score.fullTime.home !== null) {
            const rh = match.score.fullTime.home;
            const ra = match.score.fullTime.away;
            let pts = 0;
            if (pred.goals1 === rh && pred.goals2 === ra) {
              pts = exactPoints;
            } else {
              const predWinner = pred.goals1 > pred.goals2 ? 1 : (pred.goals1 < pred.goals2 ? 2 : 0);
              const resultWinner = rh > ra ? 1 : (rh < ra ? 2 : 0);
              if (predWinner === resultWinner) pts += winnerPoints;
              if (Math.abs(pred.goals1 - pred.goals2) === Math.abs(rh - ra)) pts += diffPoints;
            }
            if (pts > 0) correctCount++;
            total += pts;
          }
        }
        userScores[user] = { total, correct: correctCount };
      }
    } catch (e) {
      return { error: "No se pudieron obtener resultados de la API: " + e.toString() };
    }
  }

  scoresSheet.clearContents();
  scoresSheet.appendRow(["Username", "TotalPoints", "CorrectPredictions", "LastUpdated"]);
  for (const user in userScores) {
    scoresSheet.appendRow([user, userScores[user].total, userScores[user].correct, new Date()]);
  }
  return { success: true, message: "Puntuaciones recalculadas" };
}

function getUsers() {
  const sheet = getSheet("Usuarios");
  const data = sheet.getDataRange().getValues();
  const users = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) users.push({ username: data[i][0], isAdmin: String(data[i][2]).toUpperCase() === "TRUE" || data[i][2] === true });
  }
  return { success: true, users: users };
}

function addUser(params) {
  const { username, password } = params;
  const sheet = getSheet("Usuarios");
  sheet.appendRow([username, password, false, new Date()]);
  return { success: true };
}

function removeUser(params) {
  const { username } = params;
  const sheet = getSheet("Usuarios");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === username.toLowerCase()) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, message: "Usuario no encontrado" };
}

function getApiKeyFromSheet() {
  const sheet = getSheet("Configuracion");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === "api_key") return data[i][1];
  }
  return null;
}

function updateApiKey(params) {
  const { apiKey } = params;
  const sheet = getSheet("Configuracion");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === "api_key") {
      sheet.getRange(i + 1, 2).setValue(apiKey);
      return { success: true };
    }
  }
  return { success: false, message: "api_key no encontrada en Configuracion" };
}

function getApiKey() {
  const key = getApiKeyFromSheet();
  return key ? { success: true, apiKey: key } : { success: false, message: "No configurada" };
}

function updateAdminSecret(params) {
  const { newSecret } = params;
  const sheet = getSheet("Configuracion");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === "admin_secret") {
      sheet.getRange(i + 1, 2).setValue(newSecret);
      return { success: true };
    }
  }
  return { success: false, message: "admin_secret no encontrado" };
}

function syncWithSheets() {
  return { success: true, message: "Sincronizacion completada" };
}

function getStatus() {
  return { success: true, status: "ok", message: "Backend funcionando" };
}
