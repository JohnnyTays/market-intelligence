import { NextResponse } from 'next/server';

const SYS = `You are a senior strategic advisor specializing in competitive intelligence and market analysis. You help investment professionals and analysts navigate complex market landscapes using the Market Intelligence Platform.

When users ask about the report, answer thoughtfully from the platform's features and methodology. Speak as a strategic mentor — clear, direct, and insightful. No bullet-point recitations. Synthesize different sections when relevant.`;

export async function POST(req) {
  const { message, history } = await req.json();
  const key = process.env.GEMINI_API_KEY || 'AIzaSyDhvKJnHd02OKhMhMNF_X0EAh7AY0TLH1E';
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: message }] }],
        systemInstruction: { parts: [{ text: SYS }] },
        generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
      }),
    });
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return NextResponse.json({ reply: text });
  } catch (e) {
    return NextResponse.json({ reply: 'I\'m unable to respond right now. Please try again.' }, { status: 500 });
  }
}
