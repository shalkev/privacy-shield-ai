/**
 * Simple client-side PII redaction for prototype demonstration.
 * In a real-world scenario, this would use Microsoft Presidio (WASM) or a more robust NLP library.
 */
export function redactPII(text: string): string {
    let redacted = text;

    // 1. Redact Emails
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    redacted = redacted.replace(emailRegex, "[EMAIL_GESCHWÄRZT]");

    // 2. Redact Phone Numbers (Simple international & US formats)
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    redacted = redacted.replace(phoneRegex, "[TELEFON_GESCHWÄRZT]");

    // 3. Redact Monetary Amounts (Simple currency detection)
    // Matches $100, 100€, 100.00 USD, etc.
    const moneyRegex = /(\$|€|£)\s?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?|\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?\s?(USD|EUR|GBP|CHF)/gi;
    redacted = redacted.replace(moneyRegex, "[BETRAG_GESCHWÄRZT]");

    // 4. Redact Dates (Simple formats like DD.MM.YYYY or MM/DD/YYYY)
    const dateRegex = /\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/g;
    redacted = redacted.replace(dateRegex, "[DATUM_GESCHWÄRZT]");

    // 5. Redact specific mock names (For demonstration purposes)
    // In production, this would use Named Entity Recognition (NER)
    const mockNames = ["John Doe", "Jane Smith", "Max Mustermann", "Erika Mustermann", "Acme Corp"];
    mockNames.forEach(name => {
        const regex = new RegExp(`\\b${name}\\b`, "gi");
        redacted = redacted.replace(regex, "[PERSON_GESCHWÄRZT]");
    });

    return redacted;
}
