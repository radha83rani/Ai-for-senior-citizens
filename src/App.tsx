import React, { useState, useEffect } from "react";
import {
  Mic,
  Heart,
  Calendar,
  ShieldCheck,
  Receipt,
  Users,
  Newspaper,
  ArrowLeft,
  Volume2,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  Clock,
  Pill,
} from "lucide-react";
import { Language, PendingAction, ReminderItem, TextSize } from "./types";
import { INITIAL_REMINDERS } from "./data/initialData";
import { Header } from "./components/Header";
import { DemoScenariosBar } from "./components/DemoScenariosBar";
import { ConfirmationModal } from "./components/ConfirmationModal";
import { VoiceAssistantModal } from "./components/VoiceAssistantModal";
import { HealthSection } from "./components/HealthSection";
import { ScamShieldSection } from "./components/ScamShieldSection";
import { BillSimplifierSection } from "./components/BillSimplifierSection";
import { FamilyConnectSection } from "./components/FamilyConnectSection";
import { MyDaySection } from "./components/MyDaySection";
import { NewsSection } from "./components/NewsSection";
import { playChime, speakText, stopSpeaking } from "./utils/speech";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [textSize, setTextSize] = useState<TextSize>(() => {
    return (localStorage.getItem("sahara_text_size") as TextSize) || "large";
  });
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem("sahara_high_contrast") === "true";
  });
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem("sahara_language") as Language) || "English";
  });
  const [voiceSpeed, setVoiceSpeed] = useState<number>(0.88);
  const [seniorName] = useState<string>("Mrs. Mehta");
  const [reminders, setReminders] = useState<ReminderItem[]>(INITIAL_REMINDERS);

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync preferences with HTML attribute & localStorage
  useEffect(() => {
    document.documentElement.setAttribute("data-text-size", textSize);
    localStorage.setItem("sahara_text_size", textSize);
  }, [textSize]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", highContrast);
    localStorage.setItem("sahara_high_contrast", highContrast ? "true" : "false");
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem("sahara_language", language);
  }, [language]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleToggleTaken = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const newState = !r.taken;
          if (newState) {
            showToast(`✅ ${r.title} marked as taken!`);
            speakText(`Marked as taken. Well done, ${seniorName}.`, {
              rate: voiceSpeed,
              lang: language,
            });
          }
          return {
            ...r,
            taken: newState,
            takenAt: newState
              ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : undefined,
          };
        }
        return r;
      })
    );
  };

  const handleConfirmAction = (action: PendingAction) => {
    setPendingAction(null);
    playChime("success");

    if (action.type === "APPOINTMENT") {
      showToast("🏥 Appointment successfully booked with Dr. Mehta!");
      speakText("Your appointment with Dr. Mehta for Tuesday has been booked. A reminder has been added to your calendar.", {
        rate: voiceSpeed,
        lang: language,
      });
      // Add to reminders
      const newReminder: ReminderItem = {
        id: "act-app-" + Date.now(),
        time: action.payload?.time || "11:00 AM",
        title: "Doctor Appointment: Dr. Rajiv Mehta",
        category: "appointment",
        description: "Clinic visit at Max Healthcare Sector 14.",
        dosage: "Routine Checkup",
        taken: false,
      };
      setReminders((prev) => [newReminder, ...prev]);
    } else if (action.type === "FAMILY_MESSAGE") {
      const recipient = action.payload?.to || "Family member";
      showToast(`❤️ Message successfully sent to ${recipient}!`);
      speakText(`Your message has been sent to ${recipient}.`, {
        rate: voiceSpeed,
        lang: language,
      });
    } else if (action.type === "BILL_PAYMENT") {
      showToast("💳 Bill payment scheduled successfully!");
      speakText("Your bill payment has been successfully recorded.", {
        rate: voiceSpeed,
        lang: language,
      });
    } else if (action.type === "REMINDER") {
      showToast("⏰ New reminder added to your schedule!");
      speakText("Your reminder has been saved.", {
        rate: voiceSpeed,
        lang: language,
      });
    }
  };

  return (
    <div
      id="sahara-root"
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        highContrast
          ? "bg-stone-950 text-stone-100"
          : "bg-amber-50/40 text-stone-900"
      }`}
    >
      {/* Top Header */}
      <Header
        textSize={textSize}
        setTextSize={setTextSize}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        language={language}
        setLanguage={setLanguage}
        voiceSpeed={voiceSpeed}
        setVoiceSpeed={setVoiceSpeed}
        onOpenVoice={() => setIsVoiceModalOpen(true)}
        seniorName={seniorName}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-6">
        {/* Quick Scenarios Bar */}
        <DemoScenariosBar
          onSelectTab={(tab) => {
            setActiveTab(tab);
          }}
          onActionPrepared={(action) => setPendingAction(action)}
          voiceSpeed={voiceSpeed}
          language={language}
        />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div
            id="sahara-toast"
            className="p-4 rounded-2xl bg-emerald-700 text-white font-bold text-base shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-top duration-200"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-white/80 hover:text-white text-xs underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Navigation Breadcrumb / Back button when in a sub-section */}
        {activeTab !== "home" && (
          <div className="flex items-center justify-between gap-4 pb-2">
            <button
              id="btn-back-to-home"
              type="button"
              onClick={() => {
                stopSpeaking();
                playChime("tap");
                setActiveTab("home");
              }}
              className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-base sm:text-lg border-2 shadow-sm transition-all active:scale-95 ${
                highContrast
                  ? "bg-stone-900 hover:bg-stone-800 text-amber-300 border-amber-400"
                  : "bg-white hover:bg-amber-50 text-stone-800 border-amber-200"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>← Back to Main Menu</span>
            </button>

            <button
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <Mic className="w-4 h-4" />
              <span>Talk to Sahara</span>
            </button>
          </div>
        )}

        {/* HOME VIEW: Centerpiece Voice + 6 Major Actions */}
        {activeTab === "home" && (
          <div id="home-dashboard" className="space-y-8 animate-in fade-in">
            {/* Centerpiece Hero: TALK TO SAHARA */}
            <div
              id="hero-voice-companion"
              className={`rounded-3xl p-7 sm:p-10 text-center border-3 shadow-xl transition-all relative overflow-hidden ${
                highContrast
                  ? "bg-stone-900 border-amber-400 text-stone-100 ring-4 ring-amber-400/20"
                  : "bg-gradient-to-br from-amber-100/90 via-white to-amber-50/80 border-amber-300 text-stone-900 ring-8 ring-amber-500/10"
              }`}
            >
              <div className="max-w-2xl mx-auto space-y-4">
                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs sm:text-sm font-bold bg-amber-200/80 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200">
                  <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                  <span>Voice-First • Safe • Respectful Companion</span>
                </span>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-serif tracking-tight text-amber-950 dark:text-amber-300 leading-tight">
                  “Tell Sahara what you need.
                  <br />
                  <span className="text-amber-700 dark:text-amber-400">
                    It understands and helps you do it.”
                  </span>
                </h2>

                <p className="text-base sm:text-xl text-stone-700 dark:text-stone-200 leading-relaxed font-medium">
                  Don't learn complicated technology. Just speak in everyday words.
                </p>

                {/* THE HUGE BUTTON: "TALK TO SAHARA" */}
                <div className="pt-4 pb-2 flex flex-col items-center justify-center">
                  <button
                    id="btn-talk-to-sahara-hero"
                    type="button"
                    onClick={() => {
                      playChime("tap");
                      setIsVoiceModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-10 py-6 rounded-3xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:to-amber-600 text-white font-extrabold text-2xl sm:text-3xl shadow-2xl shadow-amber-600/40 flex items-center justify-center gap-4 transition-all active:scale-95 border-2 border-amber-300 ring-8 ring-amber-400/20 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mic className="w-8 h-8" />
                    </div>
                    <span>🎙️ Talk to Sahara</span>
                  </button>
                  <span className="text-xs sm:text-sm text-stone-700 dark:text-stone-200 mt-2.5 font-semibold">
                    Tap above to ask anything in {language}
                  </span>
                </div>

                {/* 3 Quick Spoken Examples */}
                <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Try speaking:
                  </span>
                  {[
                    "I need to see my doctor next Tuesday",
                    "Remind me to take my blood pressure medicine",
                    "Tell Rohan I will call him tonight",
                  ].map((example, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        playChime("tap");
                        setIsVoiceModalOpen(true);
                      }}
                      className="text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-amber-300 dark:border-stone-600 hover:bg-amber-50 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 transition-colors shadow-xs"
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* THE SIX MAJOR ACTIONS GRID */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>✨</span>
                  <span>Six Simple Everyday Actions</span>
                </h3>
                <span className="text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300">
                  Large cards • No clutter
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* 1. Health */}
                <div
                  id="card-action-health"
                  onClick={() => {
                    playChime("tap");
                    setActiveTab("health");
                  }}
                  className={`cursor-pointer rounded-3xl p-6 border-2 transition-all hover:scale-101 active:scale-98 shadow-sm flex flex-col justify-between ${
                    highContrast
                      ? "bg-stone-900 border-amber-400 hover:bg-stone-800 text-stone-100"
                      : "bg-white border-amber-200 hover:border-amber-400 text-stone-900 hover:shadow-md"
                  }`}
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-stone-800 text-amber-800 dark:text-amber-300 flex items-center justify-center text-3xl mb-4 font-bold">
                      🩺
                    </div>
                    <h4 className="text-2xl font-bold font-serif mb-1.5">
                      My Health
                    </h4>
                    <p className="text-base text-stone-700 dark:text-stone-200 mb-4 leading-relaxed font-medium">
                      Today's medicine timings, appointment bookings, and plain-language prescription instructions.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-sm font-bold text-amber-700 dark:text-amber-400">
                    <span>2 Medicines due today</span>
                    <span>Open →</span>
                  </div>
                </div>

                {/* 2. Money / Bills */}
                <div
                  id="card-action-bills"
                  onClick={() => {
                    playChime("tap");
                    setActiveTab("bills");
                  }}
                  className={`cursor-pointer rounded-3xl p-6 border-2 transition-all hover:scale-101 active:scale-98 shadow-sm flex flex-col justify-between ${
                    highContrast
                      ? "bg-stone-900 border-amber-400 hover:bg-stone-800 text-stone-100"
                      : "bg-white border-amber-200 hover:border-amber-400 text-stone-900 hover:shadow-md"
                  }`}
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-3xl mb-4 font-bold">
                      💰
                    </div>
                    <h4 className="text-2xl font-bold font-serif mb-1.5">
                      Explain My Bill
                    </h4>
                    <p className="text-base text-stone-700 dark:text-stone-200 mb-4 leading-relaxed font-medium">
                      Electricity, water, or medical bills explained simply. See why amounts change with 3-step payment guide.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    <span>DHBVN Bill: ₹1,842 due</span>
                    <span>Open →</span>
                  </div>
                </div>

                {/* 3. Safety / Scam Shield */}
                <div
                  id="card-action-safety"
                  onClick={() => {
                    playChime("tap");
                    setActiveTab("safety");
                  }}
                  className={`cursor-pointer rounded-3xl p-6 border-2 transition-all hover:scale-101 active:scale-98 shadow-sm flex flex-col justify-between ${
                    highContrast
                      ? "bg-stone-900 border-rose-500 hover:bg-stone-800 text-stone-100"
                      : "bg-white border-rose-200 hover:border-rose-400 text-stone-900 hover:shadow-md"
                  }`}
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-stone-800 text-rose-800 dark:text-rose-300 flex items-center justify-center text-3xl mb-4 font-bold">
                      🛡️
                    </div>
                    <h4 className="text-2xl font-bold font-serif mb-1.5">
                      Scam Shield
                    </h4>
                    <p className="text-base text-stone-700 dark:text-stone-200 mb-4 leading-relaxed font-medium">
                      Paste or upload suspicious bank alerts, lottery messages, or urgent cutoff threats for instant protection.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-sm font-bold text-rose-700 dark:text-rose-400">
                    <span>Protect Bank & OTP</span>
                    <span>Open →</span>
                  </div>
                </div>

                {/* 4. Family Connect */}
                <div
                  id="card-action-family"
                  onClick={() => {
                    playChime("tap");
                    setActiveTab("family");
                  }}
                  className={`cursor-pointer rounded-3xl p-6 border-2 transition-all hover:scale-101 active:scale-98 shadow-sm flex flex-col justify-between ${
                    highContrast
                      ? "bg-stone-900 border-amber-400 hover:bg-stone-800 text-stone-100"
                      : "bg-white border-amber-200 hover:border-amber-400 text-stone-900 hover:shadow-md"
                  }`}
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-pink-100 dark:bg-stone-800 text-pink-800 dark:text-pink-300 flex items-center justify-center text-3xl mb-4 font-bold">
                      👨‍👩‍👧
                    </div>
                    <h4 className="text-2xl font-bold font-serif mb-1.5">
                      Family Connect
                    </h4>
                    <p className="text-base text-stone-700 dark:text-stone-200 mb-4 leading-relaxed font-medium">
                      One-tap voice messaging to Ananya (daughter) and Rohan (grandson). Confirmed before dispatch.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-sm font-bold text-pink-700 dark:text-pink-400">
                    <span>Ananya is available</span>
                    <span>Open →</span>
                  </div>
                </div>

                {/* 5. My Day */}
                <div
                  id="card-action-myday"
                  onClick={() => {
                    playChime("tap");
                    setActiveTab("myday");
                  }}
                  className={`cursor-pointer rounded-3xl p-6 border-2 transition-all hover:scale-101 active:scale-98 shadow-sm flex flex-col justify-between ${
                    highContrast
                      ? "bg-stone-900 border-amber-400 hover:bg-stone-800 text-stone-100"
                      : "bg-white border-amber-200 hover:border-amber-400 text-stone-900 hover:shadow-md"
                  }`}
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-stone-800 text-amber-800 dark:text-amber-300 flex items-center justify-center text-3xl mb-4 font-bold">
                      📅
                    </div>
                    <h4 className="text-2xl font-bold font-serif mb-1.5">
                      My Day
                    </h4>
                    <p className="text-base text-stone-700 dark:text-stone-200 mb-4 leading-relaxed font-medium">
                      Good morning greeting, weather, and proactive chronological schedule for {seniorName}.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-sm font-bold text-amber-700 dark:text-amber-400">
                    <span>Doctor at 4:30 PM</span>
                    <span>Open →</span>
                  </div>
                </div>

                {/* 6. Today's News */}
                <div
                  id="card-action-news"
                  onClick={() => {
                    playChime("tap");
                    setActiveTab("news");
                  }}
                  className={`cursor-pointer rounded-3xl p-6 border-2 transition-all hover:scale-101 active:scale-98 shadow-sm flex flex-col justify-between ${
                    highContrast
                      ? "bg-stone-900 border-amber-400 hover:bg-stone-800 text-stone-100"
                      : "bg-white border-amber-200 hover:border-amber-400 text-stone-900 hover:shadow-md"
                  }`}
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-stone-800 text-blue-800 dark:text-blue-300 flex items-center justify-center text-3xl mb-4 font-bold">
                      📰
                    </div>
                    <h4 className="text-2xl font-bold font-serif mb-1.5">
                      Today's News
                    </h4>
                    <p className="text-base text-stone-700 dark:text-stone-200 mb-4 leading-relaxed font-medium">
                      Simplified senior digests with "Explain simply" and "Why is this important?" in 2 sentences.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-sm font-bold text-blue-700 dark:text-blue-400">
                    <span>Pension from Home update</span>
                    <span>Open →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-VIEWS */}
        {activeTab === "health" && (
          <HealthSection
            reminders={reminders}
            onToggleTaken={handleToggleTaken}
            highContrast={highContrast}
            voiceSpeed={voiceSpeed}
            language={language}
          />
        )}

        {activeTab === "bills" && (
          <BillSimplifierSection
            highContrast={highContrast}
            voiceSpeed={voiceSpeed}
            language={language}
          />
        )}

        {activeTab === "safety" && (
          <ScamShieldSection
            highContrast={highContrast}
            voiceSpeed={voiceSpeed}
            language={language}
          />
        )}

        {activeTab === "family" && (
          <FamilyConnectSection
            highContrast={highContrast}
            voiceSpeed={voiceSpeed}
            language={language}
            onActionPrepared={(action) => setPendingAction(action)}
          />
        )}

        {activeTab === "myday" && (
          <MyDaySection
            seniorName={seniorName}
            reminders={reminders}
            highContrast={highContrast}
            voiceSpeed={voiceSpeed}
            language={language}
            onNavigateTab={(t) => setActiveTab(t)}
          />
        )}

        {activeTab === "news" && (
          <NewsSection
            highContrast={highContrast}
            voiceSpeed={voiceSpeed}
            language={language}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        className={`mt-12 py-6 border-t text-center transition-colors text-xs sm:text-sm ${
          highContrast
            ? "bg-stone-900 border-stone-800 text-stone-300"
            : "bg-white/90 border-amber-200 text-stone-700"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-semibold">
            <strong className="text-amber-900 dark:text-amber-300">Sahara</strong> — Technology that meets you where you are.
          </p>
          <p className="text-stone-700 dark:text-stone-300 font-medium">
            Voice-First • Simple • Safe • Confirm Before Acting
          </p>
        </div>
      </footer>

      {/* Voice Assistant Full Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        language={language}
        voiceSpeed={voiceSpeed}
        highContrast={highContrast}
        seniorName={seniorName}
        onActionPrepared={(action) => {
          setIsVoiceModalOpen(false);
          setPendingAction(action);
        }}
      />

      {/* "Confirm Before Acting" Bedrock Modal */}
      <ConfirmationModal
        action={pendingAction}
        onConfirm={handleConfirmAction}
        onCancel={() => {
          setPendingAction(null);
          showToast("Action cancelled. Nothing was changed.");
        }}
        highContrast={highContrast}
        voiceSpeed={voiceSpeed}
        language={language}
      />
    </div>
  );
}
