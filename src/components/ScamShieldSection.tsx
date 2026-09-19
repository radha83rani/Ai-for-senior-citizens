import React, { useState } from "react";
import { ShieldAlert, ShieldCheck, AlertOctagon, Volume2, Sparkles, Upload, FileCheck, ArrowRight } from "lucide-react";
import { ScamAnalysis } from "../types";
import { SAMPLE_SCAMS } from "../data/initialData";
import { playChime, speakText } from "../utils/speech";

interface ScamShieldSectionProps {
  highContrast: boolean;
  voiceSpeed: number;
  language: string;
}

export const ScamShieldSection: React.FC<ScamShieldSectionProps> = ({
  highContrast,
  voiceSpeed,
  language,
}) => {
  const [inputText, setInputText] = useState(
    "URGENT! Your SBI bank account will be blocked today due to pending KYC. Click this link immediately to verify PAN: http://sbi-kyc-verify-portal.xyz"
  );
  const [isScanning, setIsScanning] = useState(false);
  const [analysis, setAnalysis] = useState<ScamAnalysis | null>({
    verdict: "SCAM",
    severity: "HIGH",
    headline: "⚠️ Possible Scam: False Urgency & Unknown Link",
    spokenAdvice:
      "Mrs. Mehta, please do not worry. This message looks like a scam trying to frighten you. Please do not click any links or share your bank details.",
    plainSummary:
      "This message is pretending to be State Bank of India to create panic. Genuine banks never threaten to block your account on the same day via a text link.",
    redFlags: [
      "Creates urgency ('URGENT! Blocked today')",
      "Requests immediate action without time to verify",
      "Contains an unfamiliar or shortened web link (.xyz domain)",
      "Asks for sensitive personal PAN / KYC verification over SMS",
    ],
    actionSteps: [
      "Don't click the link.",
      "Don't share your OTP or PIN with anyone.",
      "Contact your bank using the phone number printed on the back of your passbook or debit card.",
    ],
    safeToIgnore: true,
  });

  const handleScan = async (textToScan: string) => {
    if (!textToScan.trim()) return;

    playChime("tap");
    setIsScanning(true);

    try {
      const res = await fetch("/api/sahara/scam-shield", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToScan }),
      });

      const data = await res.json();
      setIsScanning(false);
      setAnalysis(data);

      if (data.severity === "HIGH") {
        playChime("warning");
      } else {
        playChime("success");
      }

      if (data.spokenAdvice) {
        speakText(data.spokenAdvice, { rate: voiceSpeed, lang: language });
      }
    } catch (err) {
      console.error(err);
      setIsScanning(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setIsScanning(true);
      playChime("tap");

      try {
        const res = await fetch("/api/sahara/scam-shield", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: file.type || "image/jpeg",
          }),
        });
        const data = await res.json();
        setIsScanning(false);
        setAnalysis(data);
        if (data.spokenAdvice) {
          speakText(data.spokenAdvice, { rate: voiceSpeed, lang: language });
        }
      } catch (err) {
        console.error(err);
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div id="section-scam-shield" className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-stone-100">
              Scam Shield
            </h2>
          </div>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-0.5">
            Received a suspicious message, call, or email? Sahara checks it in seconds.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold w-fit">
          <ShieldCheck className="w-4 h-4" />
          <span>Active Digital Guard</span>
        </span>
      </div>

      {/* Input area */}
      <div
        className={`rounded-3xl p-6 sm:p-7 border-2 shadow-sm ${
          highContrast
            ? "bg-stone-900 border-amber-400 text-stone-100"
            : "bg-white border-amber-200 text-stone-900"
        }`}
      >
        <label className="text-sm font-bold text-stone-700 dark:text-stone-300 block mb-2">
          Paste the message text or upload a screenshot:
        </label>

        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste SMS, WhatsApp message, or email here..."
          className={`w-full p-4 rounded-2xl border text-base font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none mb-3 ${
            highContrast
              ? "bg-stone-800 border-stone-700 text-stone-100 placeholder-stone-400"
              : "bg-stone-50 border-stone-300 text-stone-900 placeholder-stone-500"
          }`}
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Screenshot upload button */}
          <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-sm font-bold text-stone-800 dark:text-stone-200 cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-amber-600" />
            <span>Upload Screenshot</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {/* Analyze button */}
          <button
            id="btn-scan-scam"
            type="button"
            onClick={() => handleScan(inputText)}
            disabled={isScanning || !inputText.trim()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-md shadow-amber-600/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-5 h-5" />
            <span>{isScanning ? "Scanning with Sahara..." : "Check This Message"}</span>
          </button>
        </div>

        {/* 1-Tap Realistic Test Scenarios */}
        <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block mb-2">
            Try realistic test messages received by seniors:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_SCAMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setInputText(item.text);
                  handleScan(item.text);
                }}
                className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 text-xs font-bold border border-stone-300 dark:border-stone-700 transition-colors flex items-center gap-1.5"
              >
                <span>⚠️ {item.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Result Card */}
      {analysis && (
        <div
          id="scam-analysis-result"
          className={`rounded-3xl p-6 sm:p-8 border-3 shadow-md transition-all ${
            analysis.severity === "HIGH"
              ? highContrast
                ? "bg-stone-900 border-rose-500 text-stone-100"
                : "bg-rose-50/90 border-rose-400 text-stone-900"
              : analysis.severity === "MEDIUM"
              ? "bg-amber-50 border-amber-400 text-stone-900"
              : "bg-emerald-50 border-emerald-400 text-stone-900"
          }`}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-rose-200 dark:border-stone-700 mb-5">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-2xl ${
                  analysis.severity === "HIGH"
                    ? "bg-rose-600 text-white"
                    : "bg-amber-500 text-white"
                }`}
              >
                <AlertOctagon className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  Risk Level: {analysis.severity}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-rose-950 dark:text-rose-200">
                  {analysis.headline}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                speakText(analysis.spokenAdvice || analysis.plainSummary, {
                  rate: voiceSpeed,
                  lang: language,
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-white/80 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-600 hover:bg-white transition-colors w-fit"
            >
              <Volume2 className="w-4 h-4 text-amber-600" />
              <span>Read Advice Aloud</span>
            </button>
          </div>

          {/* Plain Summary */}
          <div className="mb-6">
            <p className="text-lg sm:text-xl font-medium leading-relaxed">
              {analysis.plainSummary}
            </p>
          </div>

          {/* Why this looks suspicious */}
          <div className="mb-6">
            <h4 className="text-base sm:text-lg font-bold text-rose-900 dark:text-rose-300 mb-2.5 flex items-center gap-2">
              <span>🔍</span>
              <span>Why this looks suspicious:</span>
            </h4>
            <ul className="space-y-2">
              {analysis.redFlags.map((flag, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-base font-medium text-stone-800 dark:text-stone-200"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-600 mt-2 shrink-0"></span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What you should do: 3 simple steps */}
          <div
            className={`rounded-2xl p-5 border ${
              highContrast
                ? "bg-stone-800 border-stone-700 text-stone-100"
                : "bg-white border-rose-200 text-stone-900 shadow-sm"
            }`}
          >
            <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-3 flex items-center gap-2">
              <span>✅</span>
              <span>What you should do:</span>
            </h4>
            <div className="space-y-3">
              {analysis.actionSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-base sm:text-lg font-semibold leading-snug">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
