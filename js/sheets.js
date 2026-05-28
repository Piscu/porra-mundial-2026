// Clase para manejar integración con Google Sheets
class GoogleSheetsIntegration {
    constructor(sheetId) {
        this.sheetId = sheetId;
        this.data = [];
        this.lastUpdate = null;
    }

    setSheetId(sheetId) {
        this.sheetId = sheetId;
    }

    // Convertir ID de Google Sheet a CSV export URL
    getCSVUrl() {
        if (!this.sheetId) return null;
        return `https://docs.google.com/spreadsheets/d/${this.sheetId}/export?format=csv`;
    }

    // Obtener datos del Google Sheet
    async fetchData(forceRefresh = false) {
        if (!this.sheetId) {
            console.warn('Sheet ID no configurado');
            return null;
        }

        if (!forceRefresh && this.data.length > 0 && this.lastUpdate) {
            if (Date.now() - this.lastUpdate < CONFIG.CACHE_DURATION) {
                return this.data;
            }
        }

        try {
            const csvUrl = this.getCSVUrl();
            const response = await fetch(csvUrl);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const csvText = await response.text();
            this.data = this.parseCSV(csvText);
            this.lastUpdate = Date.now();

            return this.data;
        } catch (error) {
            console.error('Error obteniendo datos del Sheet:', error);
            throw error;
        }
    }

    // Parsear CSV
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length === 0) return [];

        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const obj = {};
            const currentLine = lines[i].split(',');

            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentLine[j] ? currentLine[j].trim() : '';
            }

            data.push(obj);
        }

        return data;
    }

    // Obtener predicciones de un participante
    getParticipantPredictions(participantName) {
        const participant = this.data.find(row => 
            row['Participante'] && row['Participante'].toLowerCase() === participantName.toLowerCase()
        );
        return participant || null;
    }

    // Obtener todos los participantes
    getAllParticipants() {
        return this.data.filter(row => row['Participante']).map(row => row['Participante']);
    }

    // Calcular puntos
    calculatePoints(prediction, result) {
        if (!result) return 0;

        const predGoals1 = parseInt(prediction.goals1) || 0;
        const predGoals2 = parseInt(prediction.goals2) || 0;
        const resultGoals1 = result.score.fullTime.home || 0;
        const resultGoals2 = result.score.fullTime.away || 0;

        // Puntuación:
        // - Resultado exacto: 3 puntos
        // - Ganador/Empate correcto: 1 punto
        // - Diferencia de goles correcta: 1 punto

        let points = 0;

        // Resultado exacto
        if (predGoals1 === resultGoals1 && predGoals2 === resultGoals2) {
            points += 3;
        } else {
            // Ganador/Empate correcto
            const predWinner = predGoals1 > predGoals2 ? 1 : (predGoals1 < predGoals2 ? 2 : 0);
            const resultWinner = resultGoals1 > resultGoals2 ? 1 : (resultGoals1 < resultGoals2 ? 2 : 0);
            
            if (predWinner === resultWinner) {
                points += 1;
            }

            // Diferencia de goles correcta
            const predDiff = Math.abs(predGoals1 - predGoals2);
            const resultDiff = Math.abs(resultGoals1 - resultGoals2);
            
            if (predDiff === resultDiff) {
                points += 1;
            }
        }

        return points;
    }
}

// Instancia global de Google Sheets
let googleSheets = null;

// Inicializar Google Sheets
function initGoogleSheets(sheetId) {
    googleSheets = new GoogleSheetsIntegration(sheetId);
    return googleSheets;
}

// Obtener la instancia de Google Sheets
function getGoogleSheets() {
    if (!googleSheets) {
        const sheetId = getFromLocalStorage(CONFIG.STORAGE_KEYS.SHEET_ID);
        if (sheetId) {
            googleSheets = initGoogleSheets(sheetId);
        }
    }
    return googleSheets;
}
