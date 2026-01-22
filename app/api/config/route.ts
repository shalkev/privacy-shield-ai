import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        useOllama: process.env.USE_OLLAMA === "true",
        model: process.env.OLLAMA_MODEL || 'llama3:latest'
    });
}
