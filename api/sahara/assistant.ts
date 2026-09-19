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
    const { query, language = "English", seniorProfile = "Mrs. Mehta" } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query is required" });
    }

    const ai = getGenAI();
    if (!ai) {
      const lower = query.toLowerCase();
      if (lower.includes("doctor") || lower.includes("appointment") || lower.includes("hospital") || lower.includes("dawai")) {
        return res.json({
          intent: "BOOK_APPOINTMENT",
          spokenReply: "I found an available slot with your family doctor, Dr. Mehta, for next Tuesday at 11:00 in the morning. Would you like me to book it?",
          displayReply: "I found an opening with Dr. Mehta for next Tuesday, September 23 at 11:00 AM.",
          action: {
            type: "APPOINTMENT",
            title: "Doctor Appointment with Dr. Mehta",
            date: "Tuesday, Sep 23, 2026",
            time: "11:00 AM",
            location: "Max Healthcare Clinic, Sector 14",
            confirmText: "Yes, Book Appointment",
            cancelText: "No, Choose Another Time",
          },
          followUps: ["Yes, book this slot", "Check afternoon slots", "No, cancel"],
          detectedLanguage: language,
        });
      }

      if (lower.includes("remind") || lower.includes("yaad") || lower.includes("medicine") || lower.includes("pill") || lower.includes("dawa")) {
        return res.json({
          intent: "ADD_REMINDER",
          spokenReply: "I have prepared your reminder for medicine. I will remind you at the scheduled time.",
          displayReply: "New reminder prepared: Take medicine at 9:00 AM daily.",
          action: {
            type: "REMINDER",
            title: "Take Blood Pressure Tablet",
            time: "9:00 AM",
            recurring: "Daily after breakfast",
            confirmText: "Save Reminder",
            cancelText: "Change Time",
          },
          followUps: ["Save reminder", "Change to 8:30 AM"],
          detectedLanguage: language,
        });
      }

      if (lower.includes("rohan") || lower.includes("ananya") || lower.includes("daughter") || lower.includes("beti") || lower.includes("grandson") || lower.includes("call") || lower.includes("message")) {
        return res.json({
          intent: "FAMILY_MESSAGE",
          spokenReply: "I prepared a message for Rohan. Shall I send it now?",
          displayReply: "Message prepared for Rohan (Grandson): 'Hi Rohan, Dadi will call you tonight! Take care ❤️'",
          action: {
            type: "FAMILY_MESSAGE",
            recipient: "Rohan",
            relationship: "Grandson",
            message: "Hi Rohan, Dadi will call you tonight! Take care ❤️",
            confirmText: "Send Message Now",
            cancelText: "Change Message",
          },
          followUps: ["Send message", "Change wording", "Cancel"],
          detectedLanguage: language,
        });
      }

      if (lower.includes("bill") || lower.includes("bijli") || lower.includes("electricity") || lower.includes("pay")) {
        return res.json({
          intent: "PAY_BILL",
          spokenReply: "Your DHBVN electricity bill is ₹1,842, due on 25 September. Would you like me to guide you through the payment step by step?",
          displayReply: "DHBVN Electricity Bill: ₹1,842 due on 25 September 2026. Ready for simple 3-step review.",
          action: {
            type: "BILL_PAYMENT",
            provider: "DHBVN Electricity",
            amount: "₹1,842",
            dueDate: "25 September 2026",
            confirmText: "Proceed to Payment",
            cancelText: "Remind Me Tomorrow",
          },
          followUps: ["Start guided payment", "Explain bill first", "Remind me later"],
          detectedLanguage: language,
        });
      }

      return res.json({
        intent: "GENERAL_GUIDANCE",
        spokenReply: `I am right here with you, ${seniorProfile}. You can ask me to book your doctor appointment, explain a bill, check a suspicious message, or message your family.`,
        displayReply: `Hello ${seniorProfile}! What would you like to do today? Just speak naturally or tap any of the cards below.`,
        action: null,
        followUps: ["Book doctor appointment", "Check my medicines", "Explain my electricity bill"],
        detectedLanguage: language,
      });
    }

    const prompt = `You are "Sahara", a gentle, calm, ultra-respectful digital companion designed specifically for senior citizens (elderly people) in India and around the world.
The user is speaking to you. User profile: ${seniorProfile}.
Preferred language/culture: ${language}.
User voice/text input: "${query}"

CORE PERSONALITY & PRINCIPLES:
1. Speak in warm, clear, jargon-free, respectful language. If user speaks Hindi/Hinglish, reply warmly in Hindi/Hinglish written in natural readable script/Roman script as appropriate.
2. Seniors value reassurance, simplicity, large clarity, and the "Confirm Before Acting" safety rule.
3. NEVER assume or complete sensitive actions (like money transfer, sending messages, or booking clinics) without preparing a confirmation card.
4. If the user mentions health, explain and help schedule, but NEVER diagnose or recommend changing medical doses.

Classify the intent into one of:
- BOOK_APPOINTMENT
- ADD_REMINDER
- FAMILY_MESSAGE
- PAY_BILL
- SCAM_CHECK
- EXPLAIN_MEDICINE
- GENERAL_GUIDANCE

Return a JSON object adhering to this schema:
{
  "intent": "BOOK_APPOINTMENT" | "ADD_REMINDER" | "FAMILY_MESSAGE" | "PAY_BILL" | "SCAM_CHECK" | "EXPLAIN_MEDICINE" | "GENERAL_GUIDANCE",
  "spokenReply": "A short, crystal-clear, soothing sentence (maximum 2 sentences) suitable for text-to-speech to read out loud to the senior.",
  "displayReply": "A clear, comfortable, easy-to-read explanation (30-60 words) highlighting exactly what was understood.",
  "action": null or {
    "type": "APPOINTMENT" | "REMINDER" | "FAMILY_MESSAGE" | "BILL_PAYMENT",
    "title": "Clear action title",
    "details": "Plain details (e.g. date, time, recipient, amount)",
    "confirmText": "Big clear confirmation text, e.g. 'Yes, Book for Tuesday' or 'Yes, Send to Rohan'",
    "cancelText": "Clear cancellation text, e.g. 'No, Change Details'",
    "payload": { ...any key-value pairs needed like recipient, time, doctor, amount }
  },
  "followUps": ["Option 1", "Option 2"],
  "detectedLanguage": "English" | "Hindi" | "Hinglish" | "Bengali" | "Tamil" | etc.
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.warn("Assistant API error, using fallback:", error.message);
    const query = req.body?.query || "";
    const lower = query.toLowerCase();
    const seniorProfile = req.body?.seniorProfile || "Mrs. Mehta";

    if (lower.includes("doctor") || lower.includes("appointment") || lower.includes("hospital") || lower.includes("dawai")) {
      return res.json({
        intent: "BOOK_APPOINTMENT",
        spokenReply: "I found an available slot with your family doctor, Dr. Mehta, for next Tuesday at 11:00 in the morning. Would you like me to book it?",
        displayReply: "I found an opening with Dr. Mehta for next Tuesday, September 23 at 11:00 AM.",
        action: {
          type: "APPOINTMENT",
          title: "Book Dr. Rajiv Mehta",
          doctor: "Dr. Rajiv Mehta (Cardiologist & Physician)",
          date: "Tuesday, Sep 23, 2026",
          time: "11:00 AM",
          location: "Max Healthcare, Sector 14",
          confirmText: "Yes, Book for Tuesday 11 AM",
          cancelText: "No, Change Slot",
        },
        followUps: ["Yes, book this slot", "Check afternoon slots", "No, cancel"],
        detectedLanguage: req.body?.language || "English",
      });
    }

    if (lower.includes("remind") || lower.includes("yaad") || lower.includes("medicine") || lower.includes("pill") || lower.includes("dawa")) {
      return res.json({
        intent: "ADD_REMINDER",
        spokenReply: "I have prepared your reminder for medicine. I will remind you at the scheduled time.",
        displayReply: "New reminder prepared: Take medicine at 9:00 AM daily.",
        action: {
          type: "REMINDER",
          title: "Take Blood Pressure Tablet",
          time: "9:00 AM",
          recurring: "Daily after breakfast",
          confirmText: "Save Reminder",
          cancelText: "Change Time",
        },
        followUps: ["Save reminder", "Change to 8:30 AM"],
        detectedLanguage: req.body?.language || "English",
      });
    }

    return res.json({
      intent: "GENERAL_GUIDANCE",
      spokenReply: `I am right here with you, ${seniorProfile}. You can ask me to book your doctor appointment, explain a bill, check a suspicious message, or message your family.`,
      displayReply: `Hello ${seniorProfile}! What would you like to do today? Just speak naturally or tap any of the cards below.`,
      action: null,
      followUps: ["Book doctor appointment", "Check my medicines", "Explain my electricity bill"],
      detectedLanguage: req.body?.language || "English",
    });
  }
}
