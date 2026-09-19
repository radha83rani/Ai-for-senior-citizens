import React from "react";
import { Globe, Eye, Volume2, ShieldCheck, Heart } from "lucide-react";
import { Language, TextSize } from "../types";
import { playChime } from "../utils/speech";

interface HeaderProps {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  voiceSpeed: number;
  setVoiceSpeed: (speed: number) => void;
  onOpenVoice: () => void;
  seniorName: string;
}

export const Header: React.FC<HeaderProps> = ({
  textSize,
  setTextSize,
  highContrast,
  setHighContrast,
  language,
  setLanguage,
  voiceSpeed,
  setVoiceSpeed,
  seniorName,
}) => {
  return (
    <header
      id="sahara-header"
      className={`border-b transition-colors ${
        highContrast
          ? "bg-stone-900 border-stone-700 text-stone-100"
          : "bg-white/95 backdrop-blur-sm border-amber-100/80 text-stone-800"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Logo and Greeting */}
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-sm transition-transform active:scale-95 ${
                highContrast
                  ? "bg-amber-400 text-stone-950"
                  : "bg-gradient-to-tr from-amber-500 to-amber-400 text-white shadow-amber-500/20"
              }`}
            >
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif text-amber-900 dark:text-amber-300">
                  Sahara
                </h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    highContrast
                      ? "bg-stone-800 text-stone-200 border border-stone-600"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                  Active & Safe
                </span>
              </div>
              <p
                className={`text-sm ${
                  highContrast ? "text-stone-200" : "text-stone-700 font-semibold"
                }`}
              >
                Everyday companion for <span className="text-amber-800 dark:text-amber-300 font-bold">{seniorName}</span>
              </p>
            </div>
          </div>

          {/* Accessibility Controls: Font Size, Contrast, Language, Voice Speed */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
            {/* Font Size Selector */}
            <div
              id="font-size-controls"
              className={`flex items-center rounded-xl p-1 border shadow-xs ${
                highContrast
                  ? "bg-stone-800 border-stone-700 text-stone-200"
                  : "bg-stone-50 border-stone-200 text-stone-700"
              }`}
            >
              <span className="text-xs font-bold px-2 text-stone-700 dark:text-stone-300 select-none">
                Text:
              </span>
              <button
                id="btn-font-normal"
                type="button"
                onClick={() => {
                  playChime("tap");
                  setTextSize("normal");
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  textSize === "normal"
                    ? highContrast
                      ? "bg-amber-400 text-stone-900"
                      : "bg-white text-stone-900 shadow-xs"
                    : "hover:bg-stone-200/50"
                }`}
                title="Normal text size"
              >
                A
              </button>
              <button
                id="btn-font-large"
                type="button"
                onClick={() => {
                  playChime("tap");
                  setTextSize("large");
                }}
                className={`px-2.5 py-1 rounded-lg text-sm font-bold transition-all ${
                  textSize === "large"
                    ? highContrast
                      ? "bg-amber-400 text-stone-900"
                      : "bg-white text-stone-900 shadow-xs"
                    : "hover:bg-stone-200/50"
                }`}
                title="Large text size"
              >
                A+
              </button>
              <button
                id="btn-font-xlarge"
                type="button"
                onClick={() => {
                  playChime("tap");
                  setTextSize("xlarge");
                }}
                className={`px-2.5 py-1 rounded-lg text-base font-bold transition-all ${
                  textSize === "xlarge"
                    ? highContrast
                      ? "bg-amber-400 text-stone-900"
                      : "bg-white text-stone-900 shadow-xs"
                    : "hover:bg-stone-200/50"
                }`}
                title="Extra large text size"
              >
                A++
              </button>
            </div>

            {/* High Contrast Toggle */}
            <button
              id="btn-toggle-contrast"
              type="button"
              onClick={() => {
                playChime("tap");
                setHighContrast(!highContrast);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${
                highContrast
                  ? "bg-amber-400 text-stone-950 border-amber-300 ring-2 ring-amber-400/40"
                  : "bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-300"
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{highContrast ? "High Contrast On" : "Clear Contrast"}</span>
            </button>

            {/* Voice Speed Toggle */}
            <button
              id="btn-voice-speed"
              type="button"
              onClick={() => {
                playChime("tap");
                setVoiceSpeed(voiceSpeed === 0.88 ? 1.0 : 0.88);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${
                voiceSpeed === 0.88
                  ? highContrast
                    ? "bg-stone-800 text-amber-300 border-amber-400"
                    : "bg-amber-50 text-amber-950 border-amber-300"
                  : highContrast
                  ? "bg-stone-800 text-stone-200 border-stone-700"
                  : "bg-stone-50 text-stone-800 border-stone-300"
              }`}
              title="Change reading voice pace"
            >
              <Volume2 className="w-4 h-4" />
              <span>{voiceSpeed === 0.88 ? "Gentle Voice" : "Normal Voice"}</span>
            </button>

            {/* Language Selector */}
            <div
              id="language-select-wrapper"
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border shadow-xs ${
                highContrast
                  ? "bg-stone-800 border-stone-700 text-stone-100"
                  : "bg-stone-50 border-stone-300 text-stone-800"
              }`}
            >
              <Globe className="w-4 h-4 text-amber-600" />
              <select
                id="language-dropdown"
                value={language}
                onChange={(e) => {
                  playChime("tap");
                  setLanguage(e.target.value as Language);
                }}
                className={`bg-transparent text-xs font-bold focus:outline-none cursor-pointer py-0.5 ${
                  highContrast ? "text-stone-100" : "text-stone-900"
                }`}
              >
                <option value="English" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">English</option>
                <option value="Hindi" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">हिन्दी (Hindi)</option>
                <option value="Hinglish" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">Hinglish</option>
                <option value="Bengali" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">বাংলা (Bengali)</option>
                <option value="Tamil" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">தமிழ் (Tamil)</option>
                <option value="Telugu" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">తెలుగు (Telugu)</option>
                <option value="Marathi" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">मराठी (Marathi)</option>
                <option value="Gujarati" className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">ગુજરાતી (Gujarati)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
