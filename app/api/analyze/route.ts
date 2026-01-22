import { NextRequest, NextResponse } from 'next/server';
import { extractText } from 'unpdf';
import { createWorker } from 'tesseract.js';
import { analyzeText } from '@/lib/analysis';

export async function POST(req: NextRequest) {
    console.log("Analysis API hit");
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            console.error("No file found in formData");
            return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 });
        }

        console.log(`Processing file: ${file.name} (${file.type})`);
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        let textResult = '';

        if (file.type === 'application/pdf') {
            console.log("PDF detected, extracting text...");
            try {
                const { text } = await extractText(arrayBuffer);
                textResult = Array.isArray(text) ? text.join('\n') : text;
                console.log(`Extraction complete. Length: ${textResult.length}`);
            } catch (pdfError) {
                console.error("PDF Extraction error:", pdfError);
                throw new Error("Fehler beim Verarbeiten der PDF-Datei.");
            }
        } else if (file.type.startsWith('image/')) {
            console.log("Image detected, starting Tesseract...");
            const worker = await createWorker('deu');
            const ret = await worker.recognize(buffer);
            await worker.terminate();
            textResult = ret.data.text;
            console.log(`OCR complete. Length: ${textResult.length}`);
        } else {
            return NextResponse.json({ error: 'Nicht unterstützter Dateityp' }, { status: 400 });
        }

        if (!textResult || textResult.trim().length === 0) {
            console.warn("Extracted text is empty");
            return NextResponse.json({
                error: 'Texterkennung fehlgeschlagen. Dokument ist eventuell leer oder nicht lesbar.'
            }, { status: 422 });
        }

        // Run analysis
        const analysisResult = analyzeText(textResult);

        return NextResponse.json({
            text: textResult,
            analysis: analysisResult
        });

    } catch (error: any) {
        console.error('SERVER FATAL ERROR:', error);
        return NextResponse.json({
            error: 'Serverfehler: ' + (error.message || 'Unbekannter Fehler')
        }, { status: 500 });
    }
}
