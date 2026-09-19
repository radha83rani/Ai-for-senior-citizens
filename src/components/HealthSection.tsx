import React, { useState } from "react";
import { Pill, CheckCircle2, Clock, Calendar, Volume2, Sparkles, AlertTriangle, FileText } from "lucide-react";
import { ReminderItem } from "../types";
import { playChime, speakText } from "../utils/speech";

interface HealthSectionProps {
  reminders: ReminderItem[];
  onToggleTaken: (id: string) => void;
  highContrast: boolean;
  voiceSpeed: number;
  language: string;
}

export const HealthSection: React.FC<HealthSectionProps> = ({
  reminders,
  onToggleTaken,
  highContrast,
  voiceSpeed,
  language,
}) => {
  const [instructionInput, setInstructionInput] = useState(
    "Take one tablet twice daily after meals. Do not skip days."
  );
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [simplifiedResult, setSimplifiedResult] = useState<{
    plainExplanation: string;
    schedule: { time: string; when: string; dose: string; tip?: string }[];
    spokenAdvice: string;
    doctorTips: string[];
    disclaimer: string;
  } | null>({
    plainExplanation:
      "Take 1 tablet after breakfast and 1 tablet after dinner with a full glass of water.",
    schedule: [
      { time: "9:00 AM", when: "After Breakfast", dose: "1 Tablet", tip: "Take with warm water" },
      { time: "8:30 PM", when: "After Dinner", dose: "1 Tablet", tip: "Do not take on an empty stomach" },
    ],
    spokenAdvice:
      "Take one tablet in the morning after breakfast, and one tablet at night after dinner. Always take it with food.",
    doctorTips: [
      "Keep an 11 to 12 hour gap between doses",
      "Drink a full glass of water",
      "Do not stop without speaking to Dr. Mehta",
    ],
    disclaimer:
      "Sahara simplifies instructions for clarity. Sahara does not diagnose conditions or modify doctor prescriptions.",
  });
  const [hasConfirmedUnderstanding, setHasConfirmedUnderstanding] = useState(false);

  const handleSimplify = async () => {
    if (!instructionInput.trim()) return;
    playChime("tap");
    setIsSimplifying(true);
    setHasConfirmedUnderstanding(false);

    try {
      const res = await fetch("/api/sahara/simplify-medical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructionText: instructionInput }),
      });
      const data = await res.json();
      setIsSimplifying(false);
      setSimplifiedResult(data);

      if (data.spokenAdvice) {
        speakText(data.spokenAdvice, { rate: voiceSpeed, lang: language });
      }
    } catch (e) {
      console.error(e);
      setIsSimplifying(false);
    }
  };

  return (
    <div id="section-my-health" className="space-y-6">
      {/* Header & Concept */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💊</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-stone-100">
              My Health & Medicines
            </h2>
          </div>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-0.5">
            Your simple schedule and plain-language medicine instructions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            const listSpeech = reminders
              .map((r) => `${r.time}: ${r.title}, ${r.taken ? "already taken" : "due soon"}`)
              .join(". ");
            speakText(`Here is your health schedule for today: ${listSpeech}`, {
              rate: voiceSpeed,
              lang: language,
            });
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 dark:bg-stone-800 hover:bg-amber-200 dark:hover:bg-stone-700 text-amber-900 dark:text-amber-300 text-sm font-bold transition-colors w-fit"
        >
          <Volume2 className="w-4 h-4" />
          <span>Read Today's Schedule</span>
        </button>
      </div>

      {/* Today's Schedule List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reminders.map((item) => (
          <div
            key={item.id}
            id={`medicine-card-${item.id}`}
            className={`rounded-2xl p-5 border-2 transition-all flex flex-col justify-between shadow-xs ${
              item.taken
                ? highContrast
                  ? "bg-stone-900/90 border-emerald-500/60 text-stone-200"
                  : "bg-emerald-50/70 border-emerald-300 text-stone-800"
                : highContrast
                ? "bg-stone-900 border-stone-700 text-stone-100"
                : "bg-white border-amber-200 text-stone-900"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${
                    item.category === "appointment"
                      ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.time}</span>
                </span>

                {item.taken && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed {item.takenAt ? `at ${item.takenAt}` : ""}</span>
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold font-serif mb-1 flex items-center gap-2">
                {item.category === "appointment" ? "🏥" : "💊"} {item.title}
              </h3>

              {item.dosage && (
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">
                  Dose: {item.dosage}
                </p>
              )}

              <p className="text-base text-stone-700 dark:text-stone-200 font-medium mb-4 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Action button */}
            <div className="pt-3 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() =>
                  speakText(`${item.title}. Scheduled for ${item.time}. ${item.description}`, {
                    rate: voiceSpeed,
                    lang: language,
                  })
                }
                className="text-stone-500 hover:text-amber-700 dark:hover:text-amber-400 p-2 rounded-lg"
                title="Hear this reminder"
              >
                <Volume2 className="w-5 h-5" />
              </button>

              {item.category === "medication" && (
                <button
                  type="button"
                  onClick={() => {
                    playChime(item.taken ? "tap" : "success");
                    onToggleTaken(item.id);
                  }}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 transition-all active:scale-95 ${
                    item.taken
                      ? "bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{item.taken ? "Marked as Taken" : "I Have Taken This"}</span>
                </button>
              )}

              {item.category === "appointment" && (
                <span className="text-xs sm:text-sm font-bold text-teal-700 dark:text-teal-400">
                  Appointment Confirmed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Doctor's Instruction Simplifier */}
      <div
        id="medical-simplifier-card"
        className={`rounded-3xl p-6 sm:p-7 border-2 shadow-sm ${
          highContrast
            ? "bg-stone-900 border-amber-400 text-stone-100"
            : "bg-gradient-to-br from-amber-50/90 to-white border-amber-200 text-stone-900"
        }`}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-200 dark:bg-amber-900/50 text-amber-900 dark:text-amber-300 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif">
              Doctor's Instruction Simplifier
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-200 font-medium">
              Paste or type your prescription shorthand. GenAI translates it into everyday meal times.
            </p>
          </div>
        </div>

        {/* Input box */}
        <div className="space-y-3 mb-4">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
            Prescription or Doctor's note:
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={instructionInput}
              onChange={(e) => setInstructionInput(e.target.value)}
              placeholder="e.g., Take one tablet twice daily after meals"
              className={`flex-1 px-4 py-3.5 rounded-2xl border text-base font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none ${
                highContrast
                  ? "bg-stone-800 border-stone-700 text-stone-100 placeholder-stone-400"
                  : "bg-white border-stone-300 text-stone-900 placeholder-stone-500"
              }`}
            />
            <button
              type="button"
              onClick={handleSimplify}
              disabled={isSimplifying}
              className="px-6 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-base flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 active:scale-95 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              <span>{isSimplifying ? "Simplifying..." : "Explain in Plain Words"}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-stone-700 dark:text-stone-300">Quick examples:</span>
            {[
              "Take one tablet twice daily after meals",
              "1 tab OD in the morning empty stomach 30 mins before breakfast",
              "Take 2 puffs SOS when breathless, max 4 times a day",
            ].map((eg, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInstructionInput(eg)}
                className="underline hover:text-amber-800 dark:hover:text-amber-300 text-stone-700 dark:text-stone-200 font-medium"
              >
                "{eg}"
              </button>
            ))}
          </div>
        </div>

        {/* Output Result */}
        {simplifiedResult && (
          <div
            className={`rounded-2xl p-5 border ${
              highContrast
                ? "bg-stone-800/90 border-stone-700 text-stone-100"
                : "bg-white border-amber-200 text-stone-900 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
                Plain English Explanation
              </span>
              <button
                type="button"
                onClick={() =>
                  speakText(simplifiedResult.spokenAdvice || simplifiedResult.plainExplanation, {
                    rate: voiceSpeed,
                    lang: language,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 dark:bg-stone-700 text-amber-900 dark:text-amber-200 hover:bg-amber-200"
              >
                <Volume2 className="w-4 h-4" />
                <span>Listen</span>
              </button>
            </div>

            <p className="text-lg sm:text-xl font-bold text-amber-950 dark:text-amber-300 mb-4 leading-relaxed">
              👉 {simplifiedResult.plainExplanation}
            </p>

            {/* Schedule Breakdown */}
            {simplifiedResult.schedule && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {simplifiedResult.schedule.map((slot, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-stone-700/60 border border-amber-100 dark:border-stone-600"
                  >
                    <div className="flex items-center justify-between font-bold text-sm text-amber-900 dark:text-amber-200 mb-1">
                      <span>{slot.when}</span>
                      <span>{slot.time}</span>
                    </div>
                    <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                      {slot.dose}
                    </p>
                    {slot.tip && (
                      <p className="text-xs text-stone-700 dark:text-stone-300 font-medium mt-1">
                        💡 {slot.tip}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Check of understanding */}
            <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                Did you understand this instruction clearly?
              </span>

              <button
                type="button"
                onClick={() => {
                  playChime("success");
                  setHasConfirmedUnderstanding(true);
                  speakText("Great! Always remember to take it after your meal with water.", {
                    rate: voiceSpeed,
                    lang: language,
                  });
                }}
                className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                  hasConfirmedUnderstanding
                    ? "bg-emerald-600 text-white"
                    : "bg-stone-100 dark:bg-stone-700 hover:bg-emerald-100 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-600"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {hasConfirmedUnderstanding
                    ? "Understood & Saved!"
                    : "Yes, I Understand This"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Required Medical Disclaimer */}
        <div className="mt-4 flex items-start gap-2.5 text-xs text-stone-500 dark:text-stone-400 bg-stone-100/70 dark:bg-stone-800/60 p-3 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong className="font-semibold text-stone-700 dark:text-stone-300">Important Medical Safety:</strong> Sahara simplifies language for seniors to make instructions easy to understand. Sahara does not diagnose illnesses or modify prescriptions. Always consult Dr. Mehta or your pharmacist for medical changes.
          </p>
        </div>
      </div>
    </div>
  );
};
