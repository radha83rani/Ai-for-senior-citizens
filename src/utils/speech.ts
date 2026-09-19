// Utility for senior-friendly text-to-speech and speech recognition

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function isSpeechSynthesisAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function isSpeechRecognitionAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
      currentUtterance = null;
    } catch (e) {
      console.warn("Speech synthesis cancel error:", e);
    }
  }
}

export function speakText(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    lang?: string;
    onStart?: () => void;
    onEnd?: () => void;
  }
): void {
  if (!isSpeechSynthesisAvailable() || !text) return;

  try {
    stopSpeaking();

    // Clean text of markdown asterisks or symbols before reading out
    const cleanText = text
      .replace(/[*#_`~>]/g, "")
      .replace(/₹/g, " Rupees ")
      .replace(/\s+/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = options?.rate ?? 0.9; // Calm, gently paced speech for seniors
    utterance.pitch = options?.pitch ?? 1.0;

    const langCode = getLangCode(options?.lang);
    if (langCode) {
      utterance.lang = langCode;
    }

    // Try to pick a natural, gentle voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith(langCode?.slice(0, 2) || "en") &&
          (v.name.includes("Natural") ||
            v.name.includes("Google") ||
            v.name.includes("Samantha") ||
            v.name.includes("Rishi") ||
            v.name.includes("Heera") ||
            v.name.includes("Kalpana"))
      );
      if (preferred) {
        utterance.voice = preferred;
      }
    }

    if (options?.onStart) utterance.onstart = options.onStart;
    if (options?.onEnd) utterance.onend = options.onEnd;
    utterance.onerror = () => {
      currentUtterance = null;
      if (options?.onEnd) options.onEnd();
    };

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Could not speak text:", err);
    if (options?.onEnd) options.onEnd();
  }
}

function getLangCode(language?: string): string {
  switch (language?.toLowerCase()) {
    case "hindi":
      return "hi-IN";
    case "hinglish":
      return "en-IN";
    case "bengali":
      return "bn-IN";
    case "tamil":
      return "ta-IN";
    case "telugu":
      return "te-IN";
    case "marathi":
      return "mr-IN";
    case "gujarati":
      return "gu-IN";
    default:
      return "en-US";
  }
}

// Gentle pleasant audio chime feedback for buttons & confirmations
export function playChime(type: "tap" | "success" | "warning"): void {
  if (typeof window === "undefined" || !("AudioContext" in window || "webkitAudioContext" in window)) {
    return;
  }
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "success") {
      // Warm major third chime
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === "warning") {
      // Gentle caution tone
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(392, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } else {
      // Soft tactile pop
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch (e) {
    // Audio contexts may be blocked before interaction, safe to ignore
  }
}
