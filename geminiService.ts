
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY});

export const getDailyMotivation = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate a single, short, powerful motivational quote for a gamified habit tracking app called 'Habit Quest'. Use heroic, fantasy, or adventure-themed metaphors (e.g., quests, dungeons, levels, armor, dragons). Keep it under 20 words.",
      config: {
        temperature: 0.9,
        topP: 0.95,
        maxOutputTokens: 100,
      }
    });

    return response.text.trim().replace(/^"(.*)"$/, '$1') || "Your quest awaits. Every step counts toward greatness.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The hardest step is the one that takes you across the threshold. Begin your quest today.";
  }
};
