import React from "react";
import { Sun, Calendar, Clock, CheckCircle2, ArrowRight, Volume2, Sparkles, MapPin } from "lucide-react";
import { ReminderItem } from "../types";
import { playChime, speakText } from "../utils/speech";

interface MyDaySectionProps {
  seniorName: string;
  reminders: ReminderItem[];
  highContrast: boolean;
  voiceSpeed: number;
  language: string;
  onNavigateTab: (tab: string) => void;
}

export const MyDaySection: React.FC<MyDaySectionProps> = ({
  seniorName,
  reminders,
  highContrast,
  voiceSpeed,
  language,
  onNavigateTab,
}) => {
  const currentHour = new Date().getHours();
  const timeGreeting =
    currentHour < 12 ? "Good morning" : currentHour < 17 ? "Good afternoon" : "Good evening";

  const handleReadDayOverview = () => {
    const summary = `${timeGreeting}, ${seniorName}. Today you have: blood pressure medicine at 9 AM, electricity bill due, and doctor appointment with Dr. Mehta at 4:30 PM. The weather is pleasant and sunny at 28 degrees.`;
    speakText(summary, { rate: voiceSpeed, lang: language });
  };

  return (
    <div id="section-my-day" className="space-y-6">
      {/* Warm Personal Greeting Hero */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border-2 shadow-sm transition-all ${
          highContrast
            ? "bg-stone-900 border-amber-400 text-stone-100"
            : "bg-gradient-to-br from-amber-100/70 via-amber-50/50 to-white border-amber-200 text-stone-900"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-600" />
              <span>Personal Daily Companion</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-amber-950 dark:text-amber-300">
              {timeGreeting}, {seniorName} 👋
            </h2>
            <p className="text-base sm:text-lg text-stone-700 dark:text-stone-200 font-medium">
              Here is your calm plan for today. No stress, everything is in order.
            </p>
          </div>

          <button
            id="btn-read-day-overview"
            type="button"
            onClick={handleReadDayOverview}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm sm:text-base shadow-md shadow-amber-600/20 active:scale-95 transition-all w-fit"
          >
            <Volume2 className="w-5 h-5" />
            <span>Read My Day to Me</span>
          </button>
        </div>

        {/* Quick weather & daily tip banner */}
        <div className="mt-5 pt-4 border-t border-amber-200/80 dark:border-stone-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300 font-semibold">
            <MapPin className="w-4 h-4 text-amber-600" />
            <span>Gurugram, Haryana</span>
            <span>• 28°C Pleasant & Sunny</span>
          </div>
          <div className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-semibold italic">
            💧 Reminder: Drink a warm glass of water between meals.
          </div>
        </div>
      </div>

      {/* Proactive Timeline of the Day */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <span>🕒</span>
          <span>Your Schedule Today</span>
        </h3>

        <div className="space-y-3">
          {/* 9:00 AM */}
          <div
            className={`rounded-2xl p-5 border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
              highContrast
                ? "bg-stone-900 border-stone-700 text-stone-200"
                : "bg-white border-amber-200 text-stone-900 shadow-xs"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-stone-800 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-lg">
                9:00 AM
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Medicine • Completed
                </span>
                <h4 className="text-lg sm:text-xl font-bold font-serif">
                  Blood pressure medicine (Amlodipine)
                </h4>
                <p className="text-sm text-stone-700 dark:text-stone-200 font-medium">
                  Taken after breakfast with warm water at 9:08 AM.
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full w-fit">
              <CheckCircle2 className="w-4 h-4" />
              <span>Done</span>
            </span>
          </div>

          {/* 11:00 AM */}
          <div
            className={`rounded-2xl p-5 border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
              highContrast
                ? "bg-stone-900 border-amber-400 text-stone-100"
                : "bg-white border-amber-200 text-stone-900 shadow-xs"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-stone-800 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-lg">
                11:00 AM
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Bill Due Today
                </span>
                <h4 className="text-lg sm:text-xl font-bold font-serif">
                  Electricity bill payment: ₹1,842
                </h4>
                <p className="text-sm text-stone-700 dark:text-stone-200 font-medium">
                  DHBVN Electricity bill is due today. Sahara can help pay in 3 simple steps.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playChime("tap");
                onNavigateTab("bills");
              }}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm flex items-center gap-1.5 w-fit"
            >
              <span>Review Bill</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 2:00 PM */}
          <div
            className={`rounded-2xl p-5 border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
              highContrast
                ? "bg-stone-900 border-stone-700 text-stone-200"
                : "bg-white border-stone-200 text-stone-900 shadow-xs"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center font-bold text-lg">
                2:00 PM
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  Family Time
                </span>
                <h4 className="text-lg sm:text-xl font-bold font-serif">
                  Call daughter Ananya
                </h4>
                <p className="text-sm text-stone-700 dark:text-stone-200 font-medium">
                  Ananya is free during her lunch break.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playChime("tap");
                onNavigateTab("family");
              }}
              className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold text-sm w-fit"
            >
              Open Family
            </button>
          </div>

          {/* 4:30 PM */}
          <div
            className={`rounded-2xl p-5 border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
              highContrast
                ? "bg-stone-900 border-teal-500 text-stone-100"
                : "bg-teal-50/70 border-teal-200 text-stone-900 shadow-xs"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold text-lg">
                4:30 PM
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
                  Doctor Appointment
                </span>
                <h4 className="text-lg sm:text-xl font-bold font-serif">
                  Dr. Rajiv Mehta (Max Healthcare, Sector 14)
                </h4>
                <p className="text-sm text-stone-700 dark:text-stone-200 font-medium">
                  Routine checkup. Please keep previous blood test reports ready in your brown folder.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playChime("tap");
                onNavigateTab("health");
              }}
              className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm w-fit"
            >
              View Clinic Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
