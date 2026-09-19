import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Using smart senior-companion fallback logic.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { topic } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        headline: topic || "India introduces simplified digital pension certificate for senior citizens",
        plainExplanation: "Senior citizens can now verify their life certificate (Jeevan Pramaan) from home using their phone's camera, without needing to visit bank branches in person.",
        whyItMatters: "You no longer need to stand in long bank queues in cold or hot weather to continue receiving your monthly pension.",
        spokenVersion: "Good news: Senior citizens can now submit their life certificate right from home using a simple mobile verification, saving trips to the bank.",
      });
    }

    const prompt = `You are Sahara News Simplifier for seniors. Explain this news topic in ultra-simple, reassuring, crystal-clear words (no political drama, no sensationalism):
Topic: "${topic || "Latest pension, healthcare, or community updates for seniors in India"}"

Return JSON:
{
  "headline": "Simple positive headline",
  "plainExplanation": "2-3 short sentences explaining what happened in everyday language.",
  "whyItMatters": "1-2 sentences on why this is good or relevant to an everyday elder citizen.",
  "spokenVersion": "A warm, pleasant voice summary."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    return res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error in explain-news:", error);
    return res.status(500).json({
      headline: "Today's Senior Welfare Update",
      plainExplanation: "Senior healthcare and banking assistance programs are expanding digital home visits.",
      whyItMatters: "Access to essential support is becoming easier from home.",
      spokenVersion: "Healthcare and digital services for seniors are expanding to make home support simpler.",
    });
  }
}
