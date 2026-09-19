import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, X, Send, Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import { Language, PendingAction } from "../types";
import { isSpeechRecognitionAvailable, playChime, speakText, stopSpeaking } from "../utils/speech";

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  voiceSpeed: number;
  highContrast: boolean;
  seniorName: string;
  onActionPrepared: (action: PendingAction) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  language,
  voiceSpeed,
  highContrast,
  seniorName,
  onActionPrepared,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [textInput, setTextInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<{
    spoken: string;
    display: string;
    followUps?: string[];
    action?: any;
  } | null>(null);

  const recognitionRef = useRef<any>(null);

  // Suggested senior spoken queries
  const SUGGESTED_QUERIES = [
    "I need to see my doctor next Tuesday",
    "Remind me to take my blood pressure pill at 9 AM",
    "Tell Rohan I will call him tonight ❤️",
    "Explain my DHBVN electricity bill",
    "Mujhe kal doctor ke paas jaana hai",
  ];

  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    // Greet senior when voice assistant opens
    const greeting = `Hello ${seniorName}. I am listening. Tell me what you need, and I will help you get it done.`;
    setResponseMessage({
      spoken: greeting,
      display: `Hello ${seniorName}! You can speak naturally or tap any common task below.`,
      followUps: ["See my doctor next Tuesday", "Remind me to take medicine", "Message Rohan"],
    });

    speakText(greeting, { rate: voiceSpeed, lang: language });
  }, [isOpen, seniorName, voiceSpeed, language]);

  const toggleListening = () => {
    playChime("tap");

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    stopSpeaking();

    if (!isSpeechRecognitionAvailable()) {
      alert("Voice microphone is not supported in this browser version. You can type or tap the suggested prompts below.");
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      // Select speech language code
      if (language === "Hindi") recognition.lang = "hi-IN";
      else if (language === "Bengali") recognition.lang = "bn-IN";
      else if (language === "Tamil") recognition.lang = "ta-IN";
      else recognition.lang = "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript("");
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("Speech recognition error:", e);
      setIsListening(false);
    }
  };

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    stopSpeaking();
    playChime("tap");
    setIsLoading(true);

    try {
      const res = await fetch("/api/sahara/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText,
          language,
          seniorProfile: seniorName,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      setResponseMessage({
        spoken: data.spokenReply,
        display: data.displayReply,
        followUps: data.followUps,
        action: data.action,
      });

      // Automatically speak out the reply clearly
      if (data.spokenReply) {
        speakText(data.spokenReply, { rate: voiceSpeed, lang: language });
      }

      // If action is returned, prepare it
      if (data.action) {
        // Map to PendingAction
        const pending: PendingAction = {
          id: "act-" + Date.now(),
          type: data.action.type || "REMINDER",
          title: data.action.title || "Confirm Request",
          subtitle: data.displayReply,
          details: [
            ...(data.action.date ? [{ label: "Date", value: data.action.date }] : []),
            ...(data.action.time ? [{ label: "Time", value: data.action.time }] : []),
            ...(data.action.location ? [{ label: "Location", value: data.action.location }] : []),
            ...(data.action.recipient ? [{ label: "Recipient", value: data.action.recipient }] : []),
            ...(data.action.message ? [{ label: "Message", value: data.action.message }] : []),
            ...(data.action.amount ? [{ label: "Amount", value: data.action.amount }] : []),
            ...(data.action.provider ? [{ label: "Provider", value: data.action.provider }] : []),
            ...(data.action.recurring ? [{ label: "Frequency", value: data.action.recurring }] : []),
          ],
          confirmText: data.action.confirmText || "Yes, Proceed",
          cancelText: data.action.cancelText || "No, Cancel",
          payload: data.action,
        };
        onActionPrepared(pending);
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setResponseMessage({
        spoken: "I'm right here with you. Please try asking again.",
        display: "I had trouble connecting. Please try again.",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="voice-assistant-modal"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl p-5 sm:p-8 shadow-2xl border-2 overflow-hidden ${
          highContrast
            ? "bg-stone-900 border-amber-400 text-stone-100"
            : "bg-amber-50/95 border-amber-200 text-stone-900"
        }`}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-200/60 dark:border-stone-700">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎙️</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-950 dark:text-amber-300">
                Talk with Sahara
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                Speak naturally in {language}. No typing required.
              </p>
            </div>
          </div>

          <button
            id="btn-close-voice-modal"
            type="button"
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors text-stone-600 dark:text-stone-300"
            title="Close voice dialog"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Conversation Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5">
          {/* Big Microphone button */}
          <div className="flex flex-col items-center justify-center py-4">
            <button
              id="btn-main-mic-listen"
              type="button"
              onClick={toggleListening}
              className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 border-4 ${
                isListening
                  ? "bg-rose-600 text-white border-rose-300 animate-pulse ring-8 ring-rose-400/30"
                  : highContrast
                  ? "bg-amber-400 text-stone-950 border-amber-200 hover:bg-amber-300 ring-8 ring-amber-400/20"
                  : "bg-gradient-to-tr from-amber-600 to-amber-500 text-white border-amber-200 hover:from-amber-700 hover:to-amber-600 ring-8 ring-amber-500/20"
              }`}
              title={isListening ? "Tap to finish speaking" : "Tap to start speaking"}
            >
              {isListening ? (
                <MicOff className="w-12 h-12" />
              ) : (
                <Mic className="w-12 h-12" />
              )}
            </button>

            <span className="mt-3 text-base sm:text-lg font-bold text-center">
              {isListening ? (
                <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
                  Listening to you now... Tap when done.
                </span>
              ) : (
                <span className="text-stone-700 dark:text-stone-200">
                  Tap the microphone and speak
                </span>
              )}
            </span>
          </div>

          {/* User transcript card */}
          {(transcript || isListening) && (
            <div
              className={`p-4 rounded-2xl border ${
                highContrast
                  ? "bg-stone-800 border-amber-400/50 text-stone-100"
                  : "bg-white border-amber-200 text-stone-900 shadow-xs"
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-1">
                You said:
              </span>
              <p className="text-lg font-medium italic">
                "{transcript || "Listening..."}"
              </p>
              {!isListening && transcript && (
                <button
                  type="button"
                  onClick={() => handleSendQuery(transcript)}
                  className="mt-3 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm flex items-center gap-2"
                >
                  <span>Submit This</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Sahara AI Response Card */}
          {isLoading ? (
            <div className="p-5 rounded-2xl bg-white dark:bg-stone-800 border border-amber-200 dark:border-stone-700 flex items-center gap-3">
              <div className="w-6 h-6 border-3 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-base font-semibold text-stone-700 dark:text-stone-300">
                Sahara is thinking and preparing your request...
              </span>
            </div>
          ) : (
            responseMessage && (
              <div
                className={`p-5 rounded-2xl border shadow-sm ${
                  highContrast
                    ? "bg-stone-800 border-stone-600 text-stone-100"
                    : "bg-white border-amber-200 text-stone-900"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <span className="text-sm font-bold text-amber-800 dark:text-amber-400">
                      Sahara's Answer
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      speakText(responseMessage.spoken, {
                        rate: voiceSpeed,
                        lang: language,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-100 dark:bg-stone-700 text-amber-900 dark:text-amber-200 hover:bg-amber-200"
                    title="Read answer out loud"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Read Again</span>
                  </button>
                </div>

                <p className="text-base sm:text-lg leading-relaxed font-medium">
                  {responseMessage.display}
                </p>

                {/* Follow-up / Quick answers */}
                {responseMessage.followUps && responseMessage.followUps.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-700">
                    <span className="text-xs font-semibold text-stone-500 block mb-2">
                      Suggested actions:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {responseMessage.followUps.map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSendQuery(opt)}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-stone-700 hover:bg-amber-100 dark:hover:bg-stone-600 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-semibold border border-amber-200 dark:border-stone-600 transition-colors"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          {/* Quick Examples to Try */}
          <div className="pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-2">
              Or tap a common request:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED_QUERIES.map((query, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSendQuery(query)}
                  className={`text-left p-3 rounded-xl border text-xs sm:text-sm font-medium transition-colors hover:border-amber-400 ${
                    highContrast
                      ? "bg-stone-800/70 border-stone-700 text-stone-200 hover:bg-stone-700"
                      : "bg-white/80 border-stone-200 text-stone-800 hover:bg-amber-50/80"
                  }`}
                >
                  "{query}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Text fallback input for typing */}
        <div className="pt-3 border-t border-amber-200/60 dark:border-stone-700">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery(textInput);
              setTextInput("");
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Prefer typing? Type your question here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className={`flex-1 px-4 py-3 rounded-2xl border text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                highContrast
                  ? "bg-stone-800 border-stone-700 text-stone-100 placeholder-stone-400"
                  : "bg-white border-stone-300 text-stone-900 placeholder-stone-500"
              }`}
            />
            <button
              type="submit"
              disabled={!textInput.trim() || isLoading}
              className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-sm flex items-center gap-1.5 transition-colors"
            >
              <span>Ask</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
