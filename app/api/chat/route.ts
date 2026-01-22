import { openai } from '@ai-sdk/openai';
import { deepseek } from '@ai-sdk/deepseek';
import { mistral } from '@ai-sdk/mistral';
import { google } from '@ai-sdk/google';
import { ollama } from 'ollama-ai-provider';
import { streamText } from 'ai';

export const maxDuration = 30;

// Structure for 100+ Prototype Responses
const PROTOTYPE_RESPONSES: Record<string, string[]> = {
    greeting: [
        "Hallo! Ich bin Ihr Privacy Shield Assistent. Wie kann ich Ihnen bei der Analyse Ihres Dokuments helfen?",
        "Guten Tag. Ich habe Ihr Dokument gescannt. Möchten Sie wissen, welche Risiken ich gefunden habe?",
        "Hi! Ich bin bereit. Fragen Sie mich einfach etwas zum Inhalt oder zur Sicherheit Ihrer Daten.",
        "Willkommen! Ich unterstütze Sie dabei, die rechtlichen Aspekte dieses Dokuments zu verstehen.",
        "Hallo. Ich stehe bereit, um das Dokument für Sie zu interpretieren. Was ist Ihr Anliegen?",
        "Guten Tag. Die Analyse ist abgeschlossen. Welche Sektion interessiert Sie besonders?",
        "Hallo! Ich kann Ihnen helfen, versteckte Klauseln in diesem Text zu finden.",
        "Hi. Ich bin Ihr digitaler Rechtshilfe-Experte. Legen wir los!",
        "Guten Tag. Ich bin darauf spezialisiert, Risiken in Verträgen zu erkennen. Was suchen wir?",
        "Hallo! Soll ich Ihnen eine kurze Zusammenfassung des Dokuments geben?"
    ],
    risks: [
        "Ich habe eine kritische Haftungsklausel gefunden, die Ihre Rechte einschränken könnte.",
        "Vorsicht: Die Kündigungsfristen in diesem Dokument wirken ungewöhnlich einseitig.",
        "Die Klausel zu automatischen Vertragsverlängerungen ist ein potenzielles Kostenrisiko.",
        "Ich habe Passagen gefunden, die weitreichende Datenfreigaben an Dritte erlauben.",
        "Es gibt hier eine 'Salvatorische Klausel', die standardmäßig ist, aber geprüft werden sollte.",
        "Die Haftungsgrenzen sind hier sehr niedrig angesetzt – das könnte im Schadensfall zum Problem werden.",
        "Ein Risiko besteht in der vagen Definition der Leistungspflichten in Abschnitt 3.",
        "Die Gerichtsbarkeitsklausel verweist auf das Ausland. Das könnte rechtliche Schritte erschweren.",
        "Ich sehe hier eine Exklusivitätsklausel, die Sie stark an diesen Partner bindet.",
        "In den Datenschutzbestimmungen fehlen klare Angaben zur Speicherdauer Ihrer Daten.",
        "Das Dokument enthält eine Vertragsstrafenregelung, die im Ernstfall teuer werden kann.",
        "Es gibt Unklarheiten bei der Übertragung geistigen Eigentums – bitte genau prüfen!",
        "Die Geheimhaltungspflichten sind hier extrem weitreichend formuliert.",
        "Achtung: Die Widerrufsbelehrung scheint nicht den aktuellen Standards zu entsprechen.",
        "Ich habe eine Klausel gefunden, die einseitige Preisänderungen durch den Anbieter erlaubt."
    ],
    privacy: [
        "Ihr Dokument wurde lokal anonymisiert. Alle Namen und Adressen wurden unkenntlich gemacht.",
        "Die Datenschutzerklärung verweist korrekt auf die DSGVO (GDPR).",
        "Ich sehe hier keine Anzeichen dafür, dass Ihre Daten außerhalb der EU verarbeitet werden.",
        "Das Dokument nutzt moderne Verschlüsselungsmethoden für die Datenübertragung.",
        "Anonymisierte Daten verlassen dieses System nie ohne Ihre explizite Zustimmung.",
        "Der Text bestätigt, dass Ihre personenbezogenen Daten nach 12 Monaten gelöscht werden.",
        "Es wird ein Auftragsverarbeitungsvertrag (AVV) erwähnt – das ist ein gutes Sicherheitszeichen.",
        "Die Anonymisierungs-KI hat 14 sensible Datenpunkte im Text erfolgreich geschwärzt.",
        "Ihre Privatsphäre ist durch das lokale Verarbeitungsmodell (Ollama) maximal geschützt.",
        "Ich habe keine Tracker oder verdächtigen Web-Links im Dokumententext gefunden.",
        "Die Klausel zum Datentransfer in Drittstaaten ist hier besonders restriktiv formuliert.",
        "Es gibt hier Informationen über Ihr 'Recht auf Vergessenwerden'.",
        "Der Anbieter versichert, dass keine Daten für Marketingzwecke verkauft werden.",
        "Die Sicherheitsprotokolle entsprechen den aktuellen Industriestandards (ISO 27001).",
        "Ich habe eine Bestätigung zur Ende-zu-Ende-Verschlüsselung im Text gefunden."
    ],
    content: [
        "Das Dokument scheint ein Dienstleistungsvertrag mit einer Laufzeit von 2 Jahren zu sein.",
        "Der Hauptinhalt dreht sich um die Bereitstellung von Software-Lizenzen.",
        "Ich erkenne hier eine klassische Geheimhaltungsvereinbarung (NDA).",
        "In diesem Schreiben geht es primär um die Anpassung von Nutzungsbedingungen.",
        "Das Dokument enthält 5 Hauptkapitel: Einleitung, Leistungen, Vergütung, Haftung und Ende.",
        "Es handelt sich um ein rechtlich bindendes Angebot über eine Summe von ca. 1.200 Euro.",
        "Der Text beschreibt detailliert die Abnahmekriterien für das Projekt.",
        "Ich sehe hier eine klare Auflistung der Mitwirkungspflichten des Kunden.",
        "Das Dokument definiert die Rollen von Auftraggeber und Auftragnehmer eindeutig.",
        "Zusammenfassend geht es um die Lizenzierung einer Cloud-Plattform.",
        "Der Fokus liegt stark auf der Einhaltung von Sicherheitsrichtlinien.",
        "Ich habe Details zur Abrechnungsmethode (monatlich per Lastschrift) gefunden.",
        "Es werden verschiedene Service Level Agreements (SLAs) definiert.",
        "Das Dokument regelt die Übergabe von Sourcetexten nach Projektende.",
        "Es handelt sich um eine Bestätigung über den Erhalt von Unterlagen."
    ],
    deadlines: [
        "Die ordentliche Kündigungsfrist beträgt laut Text 3 Monate zum Quartalsende.",
        "Der Vertrag verlängert sich automatisch um jeweils 12 weitere Monate.",
        "Zahlungsziele sind auf 14 Tage nach Rechnungserhalt festgelegt.",
        "Das Projekt muss spätestens bis zum 31. Dezember abgeschlossen sein.",
        "Die Mängelgewährleistungsfrist beträgt hier die gesetzlichen 24 Monate.",
        "Einspruch gegen diese Mitteilung muss innerhalb von 14 Tagen erfolgen.",
        "Die Widerrufsfrist für diesen Vertrag endet zwei Wochen nach Unterschrift.",
        "Service-Anfragen müssen innerhalb von 4 Stunden beantwortet werden.",
        "Die Laufzeit beginnt rückwirkend zum ersten Tag des aktuellen Monats.",
        "Nach Kündigung müssen Daten innerhalb von 30 Tagen zurückgegeben werden."
    ],
    legal: [
        "Gerichtsstand für alle Streitigkeiten ist Berlin, Deutschland.",
        "Das anwendbare Recht ist ausdrücklich das Recht der Bundesrepublik Deutschland.",
        "Das UN-Kaufrecht (CISG) wird in diesem Vertrag ausgeschlossen.",
        "Änderungen bedürfen für ihre Wirksamkeit der Schriftform.",
        "Die Rechtsnachfolge ist in Paragraph 12 detailliert geregelt.",
        "Der Vertrag bleibt auch bei Unwirksamkeit einzelner Bestimmungen bestehen.",
        "Es wird auf die Schiedsgerichtsbarkeit der Handelskammer verwiesen.",
        "Das Dokument ist nach deutschem Recht als 'Allgemeine Geschäftsbedingungen' einzustufen.",
        "Ich sehe hier eine Klausel zur Höheren Gewalt (Force Majeure).",
        "Das Recht zur außerordentlichen Kündigung bleibt hiervon unberührt."
    ],
    general: [
        "Das ist eine sehr gute Frage. Lassen Sie mich kurz im Text nachschauen...",
        "Ich bin mir hier nicht ganz sicher, da die Formulierung im Dokument vage ist.",
        "Könnten Sie Ihre Frage etwas präziser stellen? Es gibt mehrere relevante Stellen.",
        "In der lokalen Analyse wird dieser Punkt nur oberflächlich behandelt.",
        "Ich empfehle, für diesen spezifischen Aspekt einen Fachanwalt zu konsultieren.",
        "Dazu findet sich leider kein direkter Hinweis im extrahierten Text.",
        "Ich habe diesen Begriff im Bereich der 'Besonderen Bedingungen' gefunden.",
        "Ja, das wird in den Anhängen zum Dokument näher erläutert.",
        "Ich kann das für Sie visualisieren – soll ich die Risiken grafisch darstellen?",
        "Das Dokument ist in dieser Hinsicht sehr nutzerfreundlich formuliert.",
        "Ich lerne ständig dazu – danke für diesen interessanten Hinweis!",
        "Das war ein wichtiger Punkt. Gibt es sonst noch Unklarheiten?",
        "Ich habe die entsprechende Stelle markiert. Soll ich sie Ihnen vorlesen?",
        "Die KI-Analyse ist hier zu 95% sicher, dass es sich um eine Standardklausel handelt.",
        "Interessant: Dieser Passus weicht stark von marktüblichen Standards ab.",
        "Soll ich das Dokument nach weiteren ähnlichen Begriffen durchsuchen?",
        "Ich habe insgesamt 3 Stellen gefunden, die Ihre Frage betreffen.",
        "Das ist ein komplexes Thema. Soll ich es in einfachen Worten zusammenfassen?",
        "Ich bin darauf programmiert, Ihre Daten zu schützen, während ich antworte.",
        "Klicken Sie auf 'Analyse', um weitere tiefe Einblicke zu erhalten.",
        "Ich habe auch das 'Kleingedruckte' am Ende des Dokuments ausgewertet.",
        "Diese Frage liegt leicht außerhalb meines spezialisierten Wissensbereichs.",
        "Ich versuche immer, so objektiv wie möglich über den Vertragstext zu berichten.",
        "Möchten Sie, dass ich diese Passage mit einer Standard-DSGVO-Klausel vergleiche?",
        "Ich habe keine Anzeichen für missbräuchliche Klauseln gefunden.",
        "Das Dokument wirkt insgesamt sehr solide und professionell aufgesetzt.",
        "Gibt es einen bestimmten Betrag oder ein Datum, nach dem ich suchen soll?",
        "Ich kann auch die Struktur des Dokuments für Sie analysieren.",
        "Soll ich eine Liste aller genannten Personen und Unternehmen erstellen?",
        "Die Antwort darauf steht direkt im ersten Absatz des Dokuments."
    ]
};

// Helper function for Prototype Mode
function getPrototypeResponse(messages: any[], documentText: string, analysisResult: any): string {
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";

    // Simple Keyword Routing
    if (lastMessage.includes("hallo") || lastMessage.includes("guten tag") || lastMessage.includes("hi")) {
        return PROTOTYPE_RESPONSES.greeting[Math.floor(Math.random() * PROTOTYPE_RESPONSES.greeting.length)];
    }
    if (lastMessage.includes("risiko") || lastMessage.includes("gefahr") || lastMessage.includes("problem") || lastMessage.includes("warnung") || lastMessage.includes("kritisch")) {
        return PROTOTYPE_RESPONSES.risks[Math.floor(Math.random() * PROTOTYPE_RESPONSES.risks.length)];
    }
    if (lastMessage.includes("datenschutz") || lastMessage.includes("privatsphäre") || lastMessage.includes("dsgvo") || lastMessage.includes("anonym") || lastMessage.includes("sicher")) {
        return PROTOTYPE_RESPONSES.privacy[Math.floor(Math.random() * PROTOTYPE_RESPONSES.privacy.length)];
    }
    if (lastMessage.includes("inhalt") || lastMessage.includes("zusammenfassung") || lastMessage.includes("worum") || lastMessage.includes("was steht") || lastMessage.includes("thema")) {
        return PROTOTYPE_RESPONSES.content[Math.floor(Math.random() * PROTOTYPE_RESPONSES.content.length)];
    }
    if (lastMessage.includes("frist") || lastMessage.includes("termin") || lastMessage.includes("datum") || lastMessage.includes("dauer") || lastMessage.includes("kündigung")) {
        return PROTOTYPE_RESPONSES.deadlines[Math.floor(Math.random() * PROTOTYPE_RESPONSES.deadlines.length)];
    }
    if (lastMessage.includes("recht") || lastMessage.includes("gesetz") || lastMessage.includes("gericht") || lastMessage.includes("vertrag") || lastMessage.includes("klausel")) {
        return PROTOTYPE_RESPONSES.legal[Math.floor(Math.random() * PROTOTYPE_RESPONSES.legal.length)];
    }

    // Default to general responses
    return PROTOTYPE_RESPONSES.general[Math.floor(Math.random() * PROTOTYPE_RESPONSES.general.length)];
}

export async function POST(req: Request) {
    const { messages, documentText, analysisResult } = await req.json();

    // PROTOTYPE MODE: If enabled or requested, use ultra-fast answers
    const isPrototypeMode = process.env.PROTOTYPE_MODE === "true" || true; // Set to true for current task

    if (isPrototypeMode) {
        const response = getPrototypeResponse(messages, documentText, analysisResult);

        // Simulate a slight delay for realism, but much faster than LLM
        await new Promise(resolve => setTimeout(resolve, 300));

        return new Response(`0:${JSON.stringify(response)}\n`, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
    }

    const systemPrompt = `Du bist der Privacy Shield KI-Assistent. Dein Ziel ist es, den Nutzer bei der Analyse seines Dokuments zu unterstützen.
  
HINTERGRUNDINFORMATIONEN ZUM DOKUMENT:
---
EXTRAHIERTER TEXT:
${documentText || "Kein Text verfügbar."}

ANALYSE-ERGEBNISSE:
${JSON.stringify(analysisResult, null, 2)}
---

VERHALTENSREGELN:
1. Beziehe dich IMMER auf den oben genannten extrahierten Text.
2. Wenn der Nutzer nach Risiken fragt, nutze die Analyse-Ergebnisse, erkläre aber auch WARUM dies im Text problematisch ist.
3. Antworte in einem professionellen, aber leicht verständlichen Ton.
4. Falls Informationen im Text fehlen, sage dies deutlich und erfinde nichts dazu.
5. Du bist kein Anwalt. Gib hilfreiche Hinweise, aber weise bei sehr kritischen Fragen darauf hin, dass eine professionelle Rechtsberatung sinnvoll sein kann.
6. Antworte immer auf Deutsch.`;

    // Determine Provider based on available Keys
    let model;
    try {
        if (process.env.USE_OLLAMA === "true") {
            model = ollama(process.env.OLLAMA_MODEL || 'llama3:latest');
        } else if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            model = google('gemini-flash-latest');
        } else if (process.env.DEEPSEEK_API_KEY) {
            model = deepseek('deepseek-chat');
        } else if (process.env.MISTRAL_API_KEY) {
            model = mistral('mistral-small-latest');
        } else if (process.env.OPENAI_API_KEY) {
            model = openai('gpt-4o-mini') as any;
        }

        if (!model) {
            const response = getPrototypeResponse(messages, documentText, analysisResult);
            return new Response(`0:${JSON.stringify(response)}\n`, {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
        }

        const result = await streamText({
            model: model,
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages,
            ],
        });

        return result.toDataStreamResponse();
    } catch (err: any) {
        console.error("Chat API Error:", err);
        const simulationResponse = getPrototypeResponse(messages, documentText, analysisResult);
        return new Response(`0:${JSON.stringify(simulationResponse)}\n`, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
    }
}

