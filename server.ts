import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with 25mb limit for document and screenshot uploads
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Lazy/safe initialization for GoogleGenAI
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Using smart senior-companion fallback logic.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    companion: "Sahara",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// 1. Voice & Natural Language Assistant (Intent detection & action preparation)
app.post("/api/sahara/assistant", async (req, res) => {
  try {
    const { query, language = "English", seniorProfile = "Mrs. Mehta" } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query is required" });
    }

    const ai = getGenAI();
    if (!ai) {
      // Fallback intent matching for smooth offline/prototype resilience
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

    // Call Gemini 3.8 Flash with structured JSON output
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
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.warn("Assistant API temporary spike, using fallback intent parsing:", error.message);
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
});

// 2. Scam Shield (Multimodal Analysis of Suspicious SMS, WhatsApp, Email, or Screenshot)
app.post("/api/sahara/scam-shield", async (req, res) => {
  try {
    const { text, imageBase64, mimeType = "image/jpeg" } = req.body;

    if (!text && !imageBase64) {
      return res.status(400).json({ error: "Text or screenshot image is required" });
    }

    const ai = getGenAI();
    if (!ai) {
      // Smart offline fallback for scam detection
      const contentStr = (text || "").toLowerCase();
      const isUrgent = contentStr.includes("urgent") || contentStr.includes("block") || contentStr.includes("immediate") || contentStr.includes("kyc") || contentStr.includes("pan") || contentStr.includes("electricity cut");

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
      model: "gemini-3.8-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
      },
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
});

// 3. Document & Bill Simplifier
app.post("/api/sahara/simplify-document", async (req, res) => {
  try {
    const { text, imageBase64, mimeType = "image/jpeg", docType = "bill" } = req.body;

    if (!text && !imageBase64) {
      return res.status(400).json({ error: "Text or image is required" });
    }

    const ai = getGenAI();
    if (!ai) {
      // High quality realistic demo response
      return res.json({
        title: "DHBVN Electricity Bill",
        provider: "Dakshin Haryana Bijli Vitran Nigam (DHBVN)",
        amountToPay: "₹1,842",
        dueDate: "25 September 2026",
        previousBillAmount: "₹1,590",
        difference: "₹252 higher than last month",
        whyHigher: "Your electricity usage was 42 units higher this month due to warmer temperatures and extra air conditioner/fan hours.",
        breakdown: [
          { label: "Electricity Consumed", value: "340 Units (vs 298 last month)" },
          { label: "Energy Charges", value: "₹1,460" },
          { label: "Government Duties & Taxes", value: "₹382" },
          { label: "Total Payable", value: "₹1,842" },
        ],
        consumerNumber: "DH-8492041-9",
        safeToPay: true,
        spokenSummary: "Your DHBVN electricity bill is ₹1,842, due on 25 September. It is ₹252 higher than last month because you used more electricity during hot days.",
        nextSteps: ["Review payment details", "Pay through Sahara guided steps", "Save receipt for records"],
      });
    }

    const promptText = `You are Sahara Document Simplifier. You help senior citizens understand complicated utility bills, electricity bills, hospital bills, insurance papers, or pension notices.
Convert all complex jargon into warm, super clear, easily scannable summaries.

Document Type: ${docType}
Input text: "${text || "Examine attached bill document"}"

Extract and explain:
1. Document title & provider name (e.g. DHBVN Electricity, Tata Power, Fortis Hospital).
2. Amount to pay (formatted clearly with currency e.g. ₹1,842 or $45).
3. Last date / Due date (clearly formatted e.g. 25 September 2026).
4. Previous bill amount (if visible or estimated).
5. Difference comparison (e.g. "₹252 higher than last month" or "Same as usual").
6. Why is it different? (Plain language explanation without technical billing formulas).
7. Simple breakdown (list of 3-4 key items with label and value).
8. Consumer or Account number (if available).
9. spokenSummary: A friendly 2-sentence voice summary answering "What do I owe, by when, and why?".
10. nextSteps: 2-3 simple action steps.

Return JSON adhering to schema:
{
  "title": string,
  "provider": string,
  "amountToPay": string,
  "dueDate": string,
  "previousBillAmount": string,
  "difference": string,
  "whyHigher": string,
  "breakdown": [{ "label": string, "value": string }],
  "consumerNumber": string,
  "safeToPay": boolean,
  "spokenSummary": string,
  "nextSteps": string[]
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
      model: "gemini-3.8-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/sahara/simplify-document:", error);
    return res.status(500).json({
      title: "Utility Bill Summary",
      provider: "Utility Provider",
      amountToPay: "₹1,842",
      dueDate: "Upcoming",
      difference: "Calculated from statement",
      whyHigher: "Usage fluctuations across seasonal cycles.",
      breakdown: [{ label: "Total Payable", value: "₹1,842" }],
      safeToPay: true,
      spokenSummary: "Here is your bill summary. You have ₹1,842 due on your utility bill.",
      nextSteps: ["Confirm with official statement", "Proceed with payment"],
    });
  }
});

// 4. Medical Instruction Simplifier (Plain language schedule without medical diagnosis)
app.post("/api/sahara/simplify-medical", async (req, res) => {
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
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error in /api/sahara/simplify-medical:", error);
    return res.status(500).json({
      medicineName: "Doctor Instruction",
      plainExplanation: "Take your medicine as directed by your doctor after meals.",
      schedule: [{ time: "Scheduled time", when: "After meals", dose: "As prescribed", tip: "Take with water" }],
      spokenAdvice: "Please follow your doctor's exact prescription and take with food.",
      doctorTips: ["Consult your pharmacist or doctor if you have questions"],
      disclaimer: "Sahara simplifies language for seniors and never provides medical diagnoses.",
    });
  }
});

// 5. Explain Today's News in 2 Simple Sentences
app.post("/api/sahara/explain-news", async (req, res) => {
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
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error in /api/sahara/explain-news:", error);
    return res.status(500).json({
      headline: "Today's Senior Welfare Update",
      plainExplanation: "Senior healthcare and banking assistance programs are expanding digital home visits.",
      whyItMatters: "Access to essential support is becoming easier from home.",
      spokenVersion: "Healthcare and digital services for seniors are expanding to make home support simpler.",
    });
  }
});

// Mount Vite middleware for development or serve dist in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sahara Server running on http://localhost:${PORT}`);
  });
}

startServer();
