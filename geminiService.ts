import { GoogleGenAI } from '@google/genai';
import { EsriFeature, Message } from '../types';

const SYSTEM_INSTRUCTION = `You are Smart Bomba, an AI GIS analyst for JBPM Malaysia.
Respond in Malay. No markdown, no asterisks, no tables unless requested.
Focus on insight, trends, and recommendations.`;

export class GeminiAgent {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error('VITE_GEMINI_API_KEY not set');
    this.ai = new GoogleGenAI({ apiKey });
  }

  async analyzeData(
    data: EsriFeature[],
    prompt: string,
    history: Pick<Message, 'role' | 'text'>[]
  ): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        { role: 'user', parts: [{ text: JSON.stringify(data.slice(0, 500)) }] },
        ...history.map(m => ({
          role: m.role,
          parts: [{ text: m.text }],
        })),
        { role: 'user', parts: [{ text: prompt }] },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return response.text ?? 'Tiada respons daripada AI.';
  }
}
