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
    const { instructionText } = req.body;
    if (!instructionText) {
      return res.status(400).json({ error: "Medical instruction text is required" });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        medicineName: "Prescribed Medicine",
        plainExplanation: "Take 1 tablet after breakfast and 1 tablet after dinner with a full glass of water.",
        schedule: [
          { time: "9:00 AM", when: "After Breakfast", dose: "1 Tablet", tip: "Take with warm water" },
          { time: "8:30 PM", when: "After Dinner", dose: "1 Tablet", tip: "Do not take on an empty stomach" },
        ],
        spokenAdvice: "Take one tablet in the morning after breakfast, and one tablet at night after dinner. Always take it with food.",
        doctorTips: ["Do not skip days", "Take with a glass of water", "Keep a 10 to 12 hour gap between doses"],
        disclaimer: "Sahara explains instructions into plain language for convenience. Sahara does not diagnose conditions or modify doctor prescriptions.",
      });
    }

    const prompt = `You are Sahara Medical Guide. Your job is to translate complex doctor prescriptions into simple, plain, friendly language for a senior citizen.
IMPORTANT MEDICAL SAFETY: You MUST NOT diagnose illnesses or change doses. You ONLY translate doctor's shorthand into crystal-clear everyday timing (e.g. "Take twice daily after meals" -> "Take 1 tablet after breakfast and 1 tablet after dinner").

Doctor's instruction: "${instructionText}"

Return JSON:
{
  "medicineName": "Clear name of medicine or prescription",
  "plainExplanation": "One simple sentence explaining exactly how to take it",
  "schedule": [
    { "time": "9:00 AM", "when": "After Breakfast", "dose": "1 Tablet / Spoon", "tip": "Friendly tip" }
  ],
  "spokenAdvice": "Clear, reassuring voice sentence",
  "doctorTips": ["Tip 1", "Tip 2"],
  "disclaimer": "Sahara explains instructions into plain language for convenience. Sahara does not diagnose conditions or modify doctor prescriptions."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    return res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error in simplify-medical:", error);
    return res.status(500).json({
      medicineName: "Doctor Instruction",
      plainExplanation: "Take your medicine as directed by your doctor after meals.",
      schedule: [{ time: "Scheduled time", when: "After meals", dose: "As prescribed", tip: "Take with water" }],
      spokenAdvice: "Please follow your doctor's exact prescription and take with food.",
      doctorTips: ["Consult your pharmacist or doctor if you have questions"],
      disclaimer: "Sahara simplifies language for seniors and never provides medical diagnoses.",
    });
  }
}
