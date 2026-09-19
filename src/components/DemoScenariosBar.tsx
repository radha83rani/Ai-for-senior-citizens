import React from "react";
import { Sparkles, Play, ShieldAlert, Calendar, MessageSquare, Receipt, Heart } from "lucide-react";
import { playChime, speakText } from "../utils/speech";
import { PendingAction } from "../types";

interface DemoScenariosBarProps {
  onSelectTab: (tab: string) => void;
  onActionPrepared: (action: PendingAction) => void;
  voiceSpeed: number;
  language: string;
}

export const DemoScenariosBar: React.FC<DemoScenariosBarProps> = ({
  onSelectTab,
  onActionPrepared,
  voiceSpeed,
  language,
}) => {
  const runScamScenario = () => {
    playChime("tap");
    onSelectTab("safety");
    speakText("Opening Scam Shield. Here is the suspicious bank account threat message analyzed for Mrs. Mehta.", {
      rate: voiceSpeed,
      lang: language,
    });
  };

  const runDoctorReminderScenario = () => {
    playChime("tap");
    const action: PendingAction = {
      id: "demo-doc-" + Date.now(),
      type: "APPOINTMENT",
      title: "Doctor Appointment: Dr. Rajiv Mehta",
      subtitle: "Sahara prepared your appointment booking for next Tuesday.",
      details: [
        { label: "Doctor", value: "Dr. Rajiv Mehta (Cardiologist & Physician)" },
        { label: "Date", value: "Tuesday, September 23, 2026" },
        { label: "Time", value: "11:00 AM Slot" },
        { label: "Clinic", value: "Max Healthcare, Sector 14, Gurugram" },
      ],
      confirmText: "Yes, Book for Tuesday 11 AM",
      cancelText: "No, Change Time",
      payload: { doctor: "Dr. Mehta", date: "Tuesday, Sep 23", time: "11:00 AM" },
    };
    onActionPrepared(action);
  };

  const runFamilyMessageScenario = () => {
    playChime("tap");
    const action: PendingAction = {
      id: "demo-msg-" + Date.now(),
      type: "FAMILY_MESSAGE",
      title: "Send Message to Daughter (Ananya)",
      subtitle: "Sahara prepared your voice message for Ananya.",
      details: [
        { label: "To", value: "Ananya (Daughter)" },
        { label: "Message", value: '"Main Sunday ko lunch ke liye aaungi. See you soon beti! ❤️"' },
        { label: "Channel", value: "WhatsApp / SMS" },
      ],
      confirmText: "Yes, Send Message Now",
      cancelText: "No, Change Message",
      payload: { to: "Ananya", message: "Main Sunday ko lunch ke liye aaungi." },
    };
    onActionPrepared(action);
  };

  const runBillScenario = () => {
    playChime("tap");
    onSelectTab("bills");
    speakText("Showing DHBVN Electricity bill: ₹1,842 due on 25 September. It is ₹252 higher than last month.", {
      rate: voiceSpeed,
      lang: language,
    });
  };

  return (
    <div
      id="demo-scenarios-bar"
      className="bg-amber-900 text-amber-50 px-4 py-2 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-2 border border-amber-800"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-300" />
        <span className="text-xs font-bold text-amber-100">1-Tap Scenarios:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={runScamScenario}
          className="px-2.5 py-1 rounded-lg bg-amber-800 hover:bg-amber-700 text-amber-50 text-xs font-bold flex items-center gap-1.5 transition-colors border border-amber-700"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
          <span>1. Test Bank Scam SMS</span>
        </button>

        <button
          type="button"
          onClick={runDoctorReminderScenario}
          className="px-2.5 py-1 rounded-lg bg-amber-800 hover:bg-amber-700 text-amber-50 text-xs font-bold flex items-center gap-1.5 transition-colors border border-amber-700"
        >
          <Calendar className="w-3.5 h-3.5 text-teal-300" />
          <span>2. Book Doctor (Tuesday)</span>
        </button>

        <button
          type="button"
          onClick={runFamilyMessageScenario}
          className="px-2.5 py-1 rounded-lg bg-amber-800 hover:bg-amber-700 text-amber-50 text-xs font-bold flex items-center gap-1.5 transition-colors border border-amber-700"
        >
          <Heart className="w-3.5 h-3.5 text-pink-300" />
          <span>3. "Tell Ananya Sunday Lunch"</span>
        </button>

        <button
          type="button"
          onClick={runBillScenario}
          className="px-2.5 py-1 rounded-lg bg-amber-800 hover:bg-amber-700 text-amber-50 text-xs font-bold flex items-center gap-1.5 transition-colors border border-amber-700"
        >
          <Receipt className="w-3.5 h-3.5 text-amber-300" />
          <span>4. Explain ₹1,842 Bill</span>
        </button>
      </div>
    </div>
  );
};
