import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Use a specific version for the worker to match the installed library or a stable CDN version
// Note: In a production App, you should bundle the worker. For this prototype, CDN is easiest.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export async function extractTextFromImage(file: File): Promise<string> {
    const worker = await createWorker('deu'); // German language
    const ret = await worker.recognize(file);
    await worker.terminate();
    return ret.data.text;
}

export async function extractTextFromPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    // Limit to first 3 pages to save time/memory in browser
    const numPages = Math.min(pdf.numPages, 3);

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);

        // Try to extract text content first (if it's a digital PDF)
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');

        if (pageText.trim().length > 50) {
            fullText += `--- Seite ${i} ---\n${pageText}\n\n`;
        } else {
            // If text is empty/short, assume scanned image -> OCR
            // Render to canvas
            const viewport = page.getViewport({ scale: 2.0 }); // High scale for better OCR
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context!, viewport: viewport } as any).promise;

            // OCR the canvas
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
            if (blob) {
                const worker = await createWorker('deu');
                const ret = await worker.recognize(blob);
                await worker.terminate();
                fullText += `--- Seite ${i} (OCR) ---\n${ret.data.text}\n\n`;
            }
        }
    }

    return fullText;
}

export async function processDocument(file: File): Promise<string> {
    if (file.type === 'application/pdf') {
        return extractTextFromPDF(file);
    } else if (file.type.startsWith('image/')) {
        return extractTextFromImage(file);
    } else {
        throw new Error("Nicht unterstütztes Dateiformat");
    }
}
