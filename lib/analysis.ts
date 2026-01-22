export interface Risk {
    id: string;
    category: 'critical' | 'warning' | 'info';
    text: string;
    score: number;
    explanation: string;
}

export interface AnalysisResult {
    summary: string;
    risks: Risk[];
    score: number;
}

const KEYWORDS = {
    critical: [
        { word: 'haftung', context: 'Haftungsbeschränkung gefunden. Prüfen Sie Obergrenzen.' },
        { word: 'kündigung', context: 'Kündigungsfristen identifiziert. Sind diese angemessen?' },
        { word: 'strafe', context: 'Vertragsstrafen gefunden. Standardmäßig oft unwirksam.' },
        { word: 'exklusiv', context: 'Exklusivitätsklausel entdeckt. Schränkt Handlungsfreiheit ein.' },
        { word: 'wettbewerb', context: 'Wettbewerbsverbot gefunden. Prüfen Sie Dauer und Karenzentschädigung.' },
        { word: 'datenschutz', context: 'Datenschutzklauseln gefunden. DSGVO-Konformität sicherstellen.' },
        { word: 'schadenersatz', context: 'Schadenersatzregelungen entdeckt.' },
    ],
    warning: [
        { word: 'automatisch', context: 'Automatische Verlängerung des Vertrags möglich.' },
        { word: 'preisanpassung', context: 'Preisanpassungsklausel gefunden.' },
        { word: 'gerichtsstand', context: 'Gerichtsstandvereinbarung gefunden.' },
        { word: 'eigentumsvorbehalt', context: 'Eigentumsvorbehalt bis zur vollständigen Zahlung.' },
    ]
};

export function analyzeText(text: string): AnalysisResult {
    const lowerText = text.toLowerCase();
    const risks: Risk[] = [];
    let score = 100;

    // Check Critical Keywords
    KEYWORDS.critical.forEach((item, index) => {
        if (lowerText.includes(item.word)) {
            risks.push({
                id: `crit-${index}`,
                category: 'critical',
                text: item.word.toUpperCase(),
                score: 85,
                explanation: item.context
            });
            score -= 10;
        }
    });

    // Check Warning Keywords
    KEYWORDS.warning.forEach((item, index) => {
        if (lowerText.includes(item.word)) {
            risks.push({
                id: `warn-${index}`,
                category: 'warning',
                text: item.word.toUpperCase(),
                score: 60,
                explanation: item.context
            });
            score -= 5;
        }
    });

    // Normalize Score
    score = Math.max(0, score);

    // Generate Summary
    let summary = "Das Dokument scheint unbedenklich.";
    if (score < 50) {
        summary = "Das Dokument enthält kritische Risiken und sollte dringend juristisch geprüft werden.";
    } else if (score < 80) {
        summary = "Das Dokument enthält einige Punkte, die Aufmerksamkeit erfordern.";
    }

    // Fallback if no text
    if (text.length < 50) {
        summary = "Der extrahierte Text war sehr kurz. Eventuell schlug die OCR fehl oder das Dokument ist leer. Bitte prüfen Sie die Datei.";
        score = 0;
    }

    return {
        summary,
        risks,
        score
    };
}
