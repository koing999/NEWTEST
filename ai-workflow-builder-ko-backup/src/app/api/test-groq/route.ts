
import { NextRequest, NextResponse } from 'next/server';
import { createGroqProvider } from '@/lib/providers/groq';

export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'No API Key' }, { status: 500 });
        }

        const provider = createGroqProvider(apiKey);
        const response = await provider.call({
            provider: 'groq',
            model: 'meta-llama/llama-4-maverick-17b-128e-instruct', // Using the model from the template
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Say "Hello World" and nothing else.' }
            ],
            temperature: 0.7,
            maxTokens: 100,
        });

        return NextResponse.json({ result: response });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
