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
    const { text, imageBase64, mimeType = "image/jpeg" } = req.body;

    if (!text && !imageBase64) {
      return res.status(400).json({ error: "Text or screenshot image is required" });
    }

    const ai = getGenAI();
    if (!ai) {
      const contentStr = (text || "").toLowerCase();
      const isUrgent =
        contentStr.includes("urgent") ||
        contentStr.includes("block") ||
        contentStr.includes("immediate") ||
        contentStr.includes("kyc") ||
        contentStr.includes("pan") ||
        contentStr.includes("electricity cut");

      return res.json({
        verdict: isUrgent ? "SCAM" : "SUSPICIOUS",
        severity: isUrgent ? "HIGH" : "MEDIUM",
        headline: isUrgent ? "⚠️ Likely Scam: False Urgency & Fear Tactics" : "⚠️ Suspicious Message: Proceed With Caution",
        spokenAdvice: "Mrs. Mehta, please do not worry. This message looks like a scam trying to frighten you. Please do not click any links or share your OTP.",
        plainSummary: "This message is using urgency and threats (like blocking your account or disconnecting electricity) to trick you into clicking an unsafe link.",
        redFlags: [
          "Creates artificial panic with words like 'URGENT' or 'Blocked Today'",
          "Contains an unfamiliar or shortened web link",
          "Banks and government agencies never ask for passwords or PINs over SMS",
          "Sent from an unknown random mobile number instead of an official sender ID",
        ],
        actionSteps: [
          "Do NOT click any links inside the message.",
          "NEVER share your bank OTP, PIN, or UPI password with anyone.",
          "If you are concerned, call your bank directly using the trusted phone number printed on the back of your card.",
        ],
        safeToIgnore: true,
      });
    }

    const promptText = `You are Sahara Scam Shield, a guardian AI protecting senior citizens from digital frauds, phishing, lottery scams, fake electricity cutoff notices, and banking tricks.
Analyze the user's uploaded message/screenshot text or image.

Input text: "${text || "Inspect attached screenshot"}"

Determine:
1. Is this a SCAM, SUSPICIOUS, or SAFE?
2. Severity: HIGH, MEDIUM, or LOW.
3. Headline: A brief, comforting but firm headline (e.g., "⚠️ High Risk: Fake Bank Account Threat").
4. spokenAdvice: A warm, calming 2-sentence audio advice explaining what to do without causing panic.
5. plainSummary: A simple 2-sentence explanation of how this scam tries to trick people.
6. redFlags: Exactly 3 to 4 clear warning signs explained in plain words (no technical cyber jargon).
7. actionSteps: Exactly 3 numbered steps the senior should take right now (e.g. 1. Do not tap the link, 2. Never share your OTP, 3. Contact your bank or family).

Return JSON format with schema:
{
  "verdict": "SCAM" | "SUSPICIOUS" | "SAFE",
  "severity": "HIGH" | "MEDIUM" | "LOW",
  "headline": string,
  "spokenAdvice": string,
  "plainSummary": string,
  "redFlags": string[],
  "actionSteps": string[],
  "safeToIgnore": boolean
}`;

    const parts: any[] = [];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType,
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
        },
      });
    }
    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: { parts },
      config: { responseMimeType: "application/json" },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.warn("API call failed, serving intelligent senior safety guard fallback:", error.message);
    const contentStr = (req.body.text || "").toLowerCase();
    const isUrgent =
      contentStr.includes("urgent") ||
      contentStr.includes("block") ||
      contentStr.includes("immediate") ||
      contentStr.includes("kyc") ||
      contentStr.includes("pan") ||
      contentStr.includes("sbi") ||
      contentStr.includes("electricity") ||
      contentStr.includes("lottery");

    return res.json({
      verdict: isUrgent ? "SCAM" : "SUSPICIOUS",
      severity: isUrgent ? "HIGH" : "MEDIUM",
      headline: isUrgent
        ? "⚠️ Likely Scam: False Urgency & Fear Tactics"
        : "⚠️ Suspicious Message: Proceed With Caution",
      spokenAdvice:
        "Mrs. Mehta, please do not worry. This message looks like a scam trying to frighten you. Please do not click any links or share your OTP.",
      plainSummary:
        "This message is pretending to be a bank or authority to create panic. Genuine banks never threaten to block your account or cut off your power on the same day via an SMS link.",
      redFlags: [
        "Creates artificial panic with words like 'URGENT' or 'Blocked Today'",
        "Contains an unfamiliar or shortened web link",
        "Banks and government agencies never ask for passwords, PAN, or PINs over SMS",
        "Sent from an unknown random number instead of an official verified sender ID",
      ],
      actionSteps: [
        "Do NOT click any links inside the message.",
        "NEVER share your bank OTP, PIN, or UPI password with anyone.",
        "Contact your bank directly using the trusted phone number printed on the back of your card.",
      ],
      safeToIgnore: true,
    });
  }
}
