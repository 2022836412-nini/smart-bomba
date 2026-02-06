
import { GoogleGenAI } from "@google/genai";
import { EsriFeature } from "../types";

const SYSTEM_INSTRUCTION = `You are "Smart Bomba", a world-class GIS and Spatial Data Analyst AI Agent specializing in Malaysian fire and rescue data (JBPM).

Capabilities:
1. Provide human-like, natural language explanations and summaries of the data.
2. Compare categories or time periods using clear descriptive text.
3. Identify spatial and attribute trends and explain their significance.
4. Provide strategic, actionable insights in a professional yet conversational tone.
5. DO NOT use tables as the primary way of responding. Use paragraphs for better readability.
6. Only use tables if the user specifically requests a tabular view.
7. CRITICAL: Do NOT use asterisks (*) or markdown symbols like "**" for bolding or list markers in your response. Use plain text formatting only. For lists, use simple numbers (1., 2.) or plain paragraphs.

When a user provides data, confirm the context as JBPM safety statistics and immediately offer a high-level observation.
Perform actual calculations behind the scenes and present the findings clearly in Malay.
Be precise, professional, and focus on the "why" and "what's next" rather than just listing numbers. Always identify yourself as Smart Bomba.`;

export class GeminiAgent {
  private ai: GoogleGenAI;

  constructor() {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY is not configured.");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeData(data: EsriFeature[], prompt: string, history: { role: 'user' | 'model', text: string }[]) {
    const dataContext = JSON.stringify(data.slice(0, 500));
    
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        { role: 'user', parts: [{ text: `Here is the ESRI Dataset (JSON format): ${dataContext}` }] },
        ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.95,
      }
    });

    return response.text;
  }
}
