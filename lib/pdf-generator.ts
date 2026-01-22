import { jsPDF } from "jspdf";

interface AnalysisData {
    id: string;
    fileName: string;
    uploadDate: string;
    risks: { text: string; explanation: string; category: 'critical' | 'warning' | 'info' }[];
    summary: string;
}

export const generateAnalysisReport = (data: AnalysisData) => {
    // Create new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(37, 99, 235); // Blue primary color
    doc.rect(0, 0, pageWidth, 20, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Privacy Shield - Analysebericht", 10, 13);

    // Metadata
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(`Dokument: ${data.fileName}`, 10, 30);
    doc.text(`Analyse-ID: ${data.id}`, 10, 35);
    doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, 10, 40);

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(10, 45, pageWidth - 10, 45);

    // Summary
    doc.setFontSize(12);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(50, 50, 50);
    const splitSummary = doc.splitTextToSize(`"${data.summary}"`, pageWidth - 20);
    doc.text(splitSummary, 10, 55);

    let yPos = 55 + (splitSummary.length * 6) + 10;

    // Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Identifizierte Risiken", 10, yPos);
    yPos += 10;

    // Content
    if (data.risks.length === 0) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text("Keine kritischen Risiken automatisch identifiziert.", 10, yPos);
        yPos += 10;
    } else {
        data.risks.forEach((risk) => {
            // Check for page overflow
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            // Category Color Mapping
            let color = [100, 100, 100];
            if (risk.category === 'critical') color = [220, 38, 38]; // Red
            if (risk.category === 'warning') color = [234, 88, 12]; // Orange
            if (risk.category === 'info') color = [22, 163, 74]; // Green

            doc.setFillColor(color[0], color[1], color[2]);
            doc.circle(12, yPos - 1.5, 2, 'F');

            // Text (Title)
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            doc.text(risk.text, 18, yPos);

            // Explanation (Description)
            yPos += 5;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80, 80, 80);
            const splitDesc = doc.splitTextToSize(risk.explanation, pageWidth - 30);
            doc.text(splitDesc, 18, yPos);

            yPos += (splitDesc.length * 5) + 7;
        });
    }

    // Recommendations
    if (yPos > 240) {
        doc.addPage();
        yPos = 20;
    }

    yPos += 5;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Handlungsempfehlungen", 10, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const recommendations = [];
    if (data.risks.some(r => r.category === 'critical')) {
        recommendations.push("• KRITISCH: Lassen Sie die markierten Klauseln anwaltlich prüfen.");
        recommendations.push("• Versuchen Sie, Haftungshöchstgrenzen schriftlich zu fixieren.");
    }
    recommendations.push("• Prüfen Sie, ob alle mündlichen Zusagen im Text enthalten sind.");
    recommendations.push("• Achten Sie auf Kündigungsfristen und automatische Verlängerungen.");

    recommendations.forEach(rec => {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }
        doc.text(rec, 10, yPos);
        yPos += 7;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Dieser Bericht wurde automatisch erstellt und ersetzt keine Rechtsberatung.", 10, 285);

    // Save
    doc.save(`Privacy_Shield_Report_${data.id}.pdf`);
};
