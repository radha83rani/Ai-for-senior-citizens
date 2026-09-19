import React from "react";
import { CheckCircle2, XCircle, Volume2, ShieldAlert } from "lucide-react";
import { PendingAction } from "../types";
import { playChime, speakText, stopSpeaking } from "../utils/speech";

interface ConfirmationModalProps {
  action: PendingAction | null;
  onConfirm: (action: PendingAction) => void;
  onCancel: () => void;
  highContrast: boolean;
  voiceSpeed: number;
  language: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  action,
  onConfirm,
  onCancel,
  highContrast,
  voiceSpeed,
  language,
}) => {
  if (!action) return null;

  const handleListen = () => {
    const detailsSpeech = action.details.map((d) => `${d.label}: ${d.value}`).join(". ");
    const speech = `Please confirm. ${action.title}. ${detailsSpeech}. Would you like me to proceed?`;
    speakText(speech, { rate: voiceSpeed, lang: language });
  };

  return (
    <div
      id="confirmation-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div
        id="confirmation-card"
        className={`w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border-2 transition-all ${
          highContrast
            ? "bg-stone-900 border-amber-400 text-stone-100"
            : "bg-white border-amber-200 text-stone-900"
        }`}
      >
        {/* Safety header */}
        <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Confirm Before Acting
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-serif leading-tight">
                Review & Confirm
              </h3>
            </div>
          </div>

          <button
            id="btn-speak-confirmation"
            type="button"
            onClick={handleListen}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold bg-amber-50 dark:bg-stone-800 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-stone-600 hover:bg-amber-100 transition-colors"
            title="Read details out loud"
          >
            <Volume2 className="w-4 h-4" />
            <span>Read to Me</span>
          </button>
        </div>

        {/* Main description */}
        <div className="mb-6">
          <h4 className="text-lg sm:text-xl font-bold text-amber-900 dark:text-amber-300 mb-1">
            {action.title}
          </h4>
          <p className="text-base text-stone-700 dark:text-stone-200 font-medium">
            {action.subtitle}
          </p>
        </div>

        {/* Structured Details Box */}
        <div
          className={`rounded-2xl p-4 sm:p-5 mb-8 border space-y-3 ${
            highContrast
              ? "bg-stone-800/80 border-stone-700 text-stone-200"
              : "bg-amber-50/60 border-amber-100 text-stone-800"
          }`}
        >
          {action.details.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 py-1.5 border-b border-stone-200/50 dark:border-stone-700/50 last:border-none"
            >
              <span className="text-sm font-bold text-stone-700 dark:text-stone-300">
                {item.label}
              </span>
              <span className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 sm:text-right">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* Big tactile choices */}
        <div className="flex flex-col-reverse sm:flex-row items-center gap-3.5">
          <button
            id="btn-cancel-action"
            type="button"
            onClick={() => {
              stopSpeaking();
              playChime("tap");
              onCancel();
            }}
            className={`w-full sm:flex-1 py-4 px-6 rounded-2xl text-base sm:text-lg font-bold border-2 transition-all flex items-center justify-center gap-2.5 active:scale-98 ${
              highContrast
                ? "bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-600"
                : "bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300"
            }`}
          >
            <XCircle className="w-5 h-5" />
            <span>{action.cancelText || "No, Cancel"}</span>
          </button>

          <button
            id="btn-confirm-action"
            type="button"
            onClick={() => {
              stopSpeaking();
              playChime("success");
              onConfirm(action);
            }}
            className="w-full sm:flex-1 py-4 px-6 rounded-2xl text-base sm:text-lg font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2.5 border-2 border-emerald-500"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span>{action.confirmText || "Yes, Confirm"}</span>
          </button>
        </div>

        <p className="text-xs text-center text-stone-600 dark:text-stone-400 mt-4">
          Sahara never executes actions without your explicit tap.
        </p>
      </div>
    </div>
  );
};
