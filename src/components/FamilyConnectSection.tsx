import React, { useState } from "react";
import { Heart, MessageSquare, Phone, Volume2, Send, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";
import { FamilyMember, PendingAction } from "../types";
import { INITIAL_FAMILY } from "../data/initialData";
import { playChime, speakText } from "../utils/speech";

interface FamilyConnectSectionProps {
  highContrast: boolean;
  voiceSpeed: number;
  language: string;
  onActionPrepared: (action: PendingAction) => void;
}

export const FamilyConnectSection: React.FC<FamilyConnectSectionProps> = ({
  highContrast,
  voiceSpeed,
  language,
  onActionPrepared,
}) => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(INITIAL_FAMILY);
  const [selectedMember, setSelectedMember] = useState<FamilyMember>(INITIAL_FAMILY[1]); // Rohan
  const [spokenMessageInput, setSpokenMessageInput] = useState("Tell Rohan I will call him tonight ❤️");
  const [sentHistory, setSentHistory] = useState<{ to: string; message: string; time: string }[]>([]);
  const [showSafetyCheckin, setShowSafetyCheckin] = useState(false);

  const handlePrepareMessage = () => {
    if (!spokenMessageInput.trim()) return;

    playChime("tap");
    const pending: PendingAction = {
      id: "fam-msg-" + Date.now(),
      type: "FAMILY_MESSAGE",
      title: `Send Message to ${selectedMember.name}`,
      subtitle: `Sahara prepared your message for your ${selectedMember.relationship}.`,
      details: [
        { label: "Recipient", value: `${selectedMember.name} (${selectedMember.relationship})` },
        { label: "Phone", value: selectedMember.phone },
        { label: "Message", value: `"${spokenMessageInput}"` },
      ],
      confirmText: `Yes, Send to ${selectedMember.name}`,
      cancelText: "No, Change Message",
      payload: {
        to: selectedMember.name,
        message: spokenMessageInput,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    };

    onActionPrepared(pending);
  };

  const handleTriggerSafetySimulation = () => {
    setShowSafetyCheckin(true);
    playChime("warning");
    speakText(
      "Mrs. Mehta, I haven't seen your confirmation for your 9 AM medication reminder. Are you doing okay?",
      { rate: voiceSpeed, lang: language }
    );
  };

  return (
    <div id="section-family-connect" className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">👨‍👩‍👧</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-stone-100">
              Family Connect
            </h2>
          </div>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-0.5">
            Stay close to your loved ones. Sahara drafts and speaks your messages for you.
          </p>
        </div>

        <button
          type="button"
          onClick={handleTriggerSafetySimulation}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 text-amber-900 dark:text-amber-300 text-xs font-bold transition-colors w-fit"
          title="Simulate Family Safety check-in"
        >
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>Demo: Safety Check-in</span>
        </button>
      </div>

      {/* Family Safety Alert Simulation Banner */}
      {showSafetyCheckin && (
        <div className="rounded-3xl p-5 border-2 bg-amber-50 border-amber-400 dark:bg-stone-900 dark:border-amber-400 animate-in fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="text-3xl">💛</span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Family Safety Mode
                </span>
                <h4 className="text-lg sm:text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
                  "I haven't seen your confirmation for your 9:00 AM medicine. Are you okay?"
                </h4>
                <p className="text-sm text-stone-700 dark:text-stone-200 font-medium mt-1">
                  Rather than immediately worrying your family, Sahara checks with you first.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                speakText(
                  "Mrs. Mehta, I haven't seen your confirmation for your 9 AM medication reminder. Are you doing okay?",
                  { rate: voiceSpeed, lang: language }
                );
              }}
              className="p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:text-amber-700"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => {
                playChime("success");
                setShowSafetyCheckin(false);
                speakText("Wonderful! I am so glad to hear you are well, Mrs. Mehta.", {
                  rate: voiceSpeed,
                  lang: language,
                });
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Yes, I am okay! Just took it</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playChime("tap");
                setShowSafetyCheckin(false);
                speakText("Sending a gentle check-in note to Ananya.", {
                  rate: voiceSpeed,
                  lang: language,
                });
              }}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-bold text-sm"
            >
              Ask Ananya to call me
            </button>
          </div>
        </div>
      )}

      {/* Family Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {familyMembers.map((fam) => (
          <div
            key={fam.id}
            id={`family-card-${fam.id}`}
            onClick={() => {
              playChime("tap");
              setSelectedMember(fam);
              setSpokenMessageInput(`Hi ${fam.name}, thinking of you! Call me when you're free ❤️`);
            }}
            className={`cursor-pointer rounded-3xl p-5 border-2 transition-all flex flex-col justify-between ${
              selectedMember.id === fam.id
                ? "bg-amber-50/80 border-amber-500 shadow-md ring-2 ring-amber-400/30"
                : highContrast
                ? "bg-stone-900 border-stone-700 hover:border-stone-600 text-stone-200"
                : "bg-white border-amber-100 hover:border-amber-300 text-stone-800"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${fam.avatarBg}`}
                  >
                    {fam.avatarEmoji}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-serif">{fam.name}</h3>
                    <p className="text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300">
                      {fam.relationship}
                    </p>
                  </div>
                </div>

                <span
                  className={`w-3 h-3 rounded-full ${
                    fam.status === "available" ? "bg-emerald-500" : "bg-blue-400"
                  }`}
                  title={fam.status === "available" ? "Available" : "Busy"}
                />
              </div>

              {fam.lastMessage && (
                <div className="p-3 rounded-xl bg-stone-100/70 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 mb-3 text-xs sm:text-sm">
                  <span className="text-stone-700 dark:text-stone-300 font-bold block mb-0.5">Last message:</span>
                  <p className="font-semibold text-stone-800 dark:text-stone-200 italic">"{fam.lastMessage}"</p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">{fam.phone}</span>
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                Tap to message
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Easy Voice Message Composer with Confirm Before Acting */}
      <div
        className={`rounded-3xl p-6 sm:p-7 border-2 shadow-sm ${
          highContrast
            ? "bg-stone-900 border-amber-400 text-stone-100"
            : "bg-white border-amber-200 text-stone-900"
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <h3 className="text-xl font-bold font-serif">
            Message {selectedMember.name} ({selectedMember.relationship})
          </h3>
        </div>

        <p className="text-sm text-stone-700 dark:text-stone-200 font-medium mb-3">
          Type or choose a quick message. Sahara will show a big confirmation before sending.
        </p>

        <textarea
          rows={2}
          value={spokenMessageInput}
          onChange={(e) => setSpokenMessageInput(e.target.value)}
          className={`w-full p-4 rounded-2xl border text-base font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none mb-3 ${
            highContrast
              ? "bg-stone-800 border-stone-700 text-stone-100"
              : "bg-stone-50 border-stone-300 text-stone-900"
          }`}
        />

        {/* Quick presets */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            `Tell ${selectedMember.name} I will call tonight ❤️`,
            `I took my morning medicine and had breakfast`,
            `Are you coming over this Sunday for lunch?`,
            `Good morning, hope you have a blessed day`,
          ].map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSpokenMessageInput(preset)}
              className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-amber-950 dark:text-amber-200 text-xs font-bold border border-amber-300 dark:border-stone-700"
            >
              "{preset}"
            </button>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
          <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
            Protected by "Confirm Before Acting"
          </span>

          <button
            id="btn-prepare-family-message"
            type="button"
            onClick={handlePrepareMessage}
            className="px-7 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-base flex items-center gap-2 shadow-md shadow-amber-600/20 active:scale-95 transition-all"
          >
            <Send className="w-5 h-5" />
            <span>Review & Send to {selectedMember.name}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
